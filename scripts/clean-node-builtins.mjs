import fs from "node:fs";
import path from "node:path";
import process from "node:process";

/**
 * Preinstall cleaner for CI/Vercel:
 * - Scans every package.json in the repo tree (root + nested)
 * - Removes any keys starting with "node:" from dependency sections
 *   (dependencies/devDependencies/peer/optional/overrides/resolutions)
 * - Deep-cleans nested objects (overrides/resolutions often nest)
 * - Deletes lockfiles that may reintroduce bad entries (npm/pnpm/yarn/bun)
 * - Prints a CLEANER REPORT with exact file paths and keys found/removed
 * - Supports --scan-only to fail fast and list offenders without modifying
 *
 * If npm still errors, the logs from this script will include the precise
 * file path(s) and section(s) to patch manually.
 */

const ROOT = process.cwd();
const BAD_PREFIX = "node:";
const DEP_SECTIONS = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies",
  // npm supports "overrides"; Yarn uses "resolutions"
  "overrides",
  "resolutions"
];

// Delete any lockfile type that could carry bad entries across tools
const LOCKFILES = new Set([
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "bun.lock",
  "bun.lockb"
]);

const scanOnly = process.argv.includes("--scan-only");

function isPlainObject(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}

function walk(dir, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const ent of entries) {
    // skip large/vendor directories
    if (ent.name === "node_modules" || ent.name === ".next" || ent.name === ".git") continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

function cleanNested(obj, parentPath = []) {
  if (!isPlainObject(obj)) return { removed: [] };
  const removed = [];
  for (const key of Object.keys(obj)) {
    if (key.startsWith(BAD_PREFIX)) {
      removed.push({ path: parentPath.join("."), key, value: obj[key] });
      delete obj[key];
      continue;
    }
    const val = obj[key];
    if (isPlainObject(val)) {
      const sub = cleanNested(val, parentPath.concat(key));
      removed.push(...sub.removed);
    } else if (Array.isArray(val)) {
      for (let i = 0; i < val.length; i++) {
        if (isPlainObject(val[i])) {
          const sub = cleanNested(val[i], parentPath.concat(`${key}[${i}]`));
          removed.push(...sub.removed);
        }
      }
    }
  }
  return { removed };
}

function cleanPackageJson(filePath) {
  let raw;
  try {
    raw = fs.readFileSync(filePath, "utf8");
  } catch {
    return { changed: false, removed: [] };
  }
  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    console.error(`Skipping invalid JSON: ${filePath}`);
    return { changed: false, removed: [] };
  }

  const removed = [];
  for (const section of DEP_SECTIONS) {
    if (!json[section]) continue;

    // Remove any direct "node:*" entries in the section
    for (const depName of Object.keys(json[section])) {
      if (depName.startsWith(BAD_PREFIX)) {
        removed.push({ section, key: depName, value: json[section][depName] });
        delete json[section][depName];
      }
    }
    // Deep clean nested structures (overrides/resolutions can nest)
    const deep = cleanNested(json[section], [section]);
    removed.push(...deep.removed.map((r) => ({ section: r.path, key: r.key, value: r.value })));
  }

  if (removed.length > 0 && !scanOnly) {
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + "\n", "utf8");
  }
  return { changed: removed.length > 0 && !scanOnly, removed, filePath };
}

function removeLockfiles(rootDir) {
  const files = walk(rootDir);
  const deleted = [];
  for (const filePath of files) {
    const base = path.basename(filePath);
    if (LOCKFILES.has(base)) {
      try {
        if (!scanOnly) fs.rmSync(filePath, { force: true });
        deleted.push(filePath);
      } catch (e) {
        console.error(`Failed to delete lockfile ${filePath}: ${e?.message || e}`);
      }
    }
  }
  return deleted;
}

function main() {
  const pkgFiles = walk(ROOT).filter((f) => path.basename(f) === "package.json");

  const results = pkgFiles.map(cleanPackageJson);
  const offenders = results.filter((r) => r.removed.length > 0);

  const deletedLocks = removeLockfiles(ROOT);

  // Cleaner report
  if (offenders.length > 0 || deletedLocks.length > 0) {
    console.log("==== CLEANER REPORT START ====");
    for (const r of offenders) {
      console.log(`File: ${r.filePath}`);
      for (const item of r.removed) {
        console.log(`  - Removed "${item.key}" from section "${item.section}" (value: ${JSON.stringify(item.value)})`);
      }
    }
    for (const lf of deletedLocks) {
      console.log(`Deleted lockfile: ${lf}`);
    }
    console.log("==== CLEANER REPORT END ====");
  } else {
    console.log("Cleaner: No invalid node:* entries or lockfiles found.");
  }

  // In scan-only mode, exit non-zero if issues detected (to surface paths)
  if (scanOnly && (offenders.length > 0 || deletedLocks.length > 0)) {
    process.exit(1);
  }
}

main();
