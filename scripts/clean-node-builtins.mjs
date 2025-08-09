import fs from "node:fs";
import path from "node:path";
import process from "node:process";

/**
 * This script runs before "npm install".
 * It:
 * - Scans every package.json in the repo
 * - Removes any keys starting with "node:" from dependency sections (built-ins are not packages)
 * - Deep-cleans nested overrides/resolutions
 * - Deletes foreign lockfiles that may reintroduce bad entries
 * - Supports --scan-only to fail fast without modifying files
 */

const ROOT = process.cwd();
const BAD_PREFIX = "node:";
const DEP_SECTIONS = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies",
  // npm supports "overrides"; Yarn uses "resolutions". Clean both if present.
  "overrides",
  "resolutions"
];

const FOREIGN_LOCKFILES = new Set([
  "pnpm-lock.yaml",
  "pnpm-lock.yaml ", // handle trailing-space variant
  "yarn.lock",
  "bun.lock",
  "bun.lockb",
  "bun.lock " // just in case
]);

const scanOnly = process.argv.includes("--scan-only");

function isPlainObject(v) {
  return v && typeof v === "object" && !Array.isArray(v);
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

    // Remove any direct "node:*" entries in section
    for (const depName of Object.keys(json[section])) {
      if (depName.startsWith(BAD_PREFIX)) {
        removed.push({ section, key: depName, value: json[section][depName] });
        delete json[section][depName];
      }
    }
    // Deep clean nested structures
    const deep = cleanNested(json[section], [section]);
    removed.push(...deep.removed);
  }

  if (removed.length > 0) {
    if (scanOnly) {
      console.error(`Found invalid node:* entries in ${filePath}`);
      for (const r of removed) {
        console.error(`- ${r.section} -> ${r.key} : ${JSON.stringify(r.value)}`);
      }
    } else {
      fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + "\n", "utf8");
      console.log(`Cleaned ${filePath}: removed ${removed.length} invalid node:* entr${removed.length === 1 ? "y" : "ies"}.`);
    }
  }
  return { changed: removed.length > 0 && !scanOnly, removed };
}

function walk(dir, out = []) {
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const ent of entries) {
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

function removeForeignLockfiles(rootDir) {
  const files = walk(rootDir);
  let removed = 0;
  for (const filePath of files) {
    const base = path.basename(filePath);
    if (FOREIGN_LOCKFILES.has(base)) {
      try {
        if (scanOnly) {
          console.error(`Would delete lockfile: ${filePath}`);
        } else {
          fs.rmSync(filePath, { force: true });
          console.log(`Deleted lockfile: ${filePath}`);
        }
        removed++;
      } catch (e) {
        console.error(`Failed to delete lockfile ${filePath}: ${e?.message || e}`);
      }
    }
  }
  return removed;
}

function main() {
  // 1) Clean every package.json in the repo (root + nested)
  const files = walk(ROOT).filter((f) => path.basename(f) === "package.json");
  let totalRemoved = 0;
  for (const pkg of files) {
    const res = cleanPackageJson(pkg);
    totalRemoved += res.removed.length;
  }

  // 2) Remove foreign lockfiles that may reintroduce bad entries
  const locksRemoved = removeForeignLockfiles(ROOT);

  if (scanOnly) {
    if (totalRemoved === 0 && locksRemoved === 0) {
      console.log("OK: No node:* entries and no foreign lockfiles detected.");
      process.exit(0);
    } else {
      console.error("Scan detected issues (see details above).");
      process.exit(1);
    }
  }

  // 3) Summary (when not scanning)
  if (totalRemoved > 0 || locksRemoved > 0) {
    console.log(`Sanitized repo: removed ${totalRemoved} invalid entr${totalRemoved === 1 ? "y" : "ies"}; deleted ${locksRemoved} foreign lockfile(s).`);
  } else {
    console.log("No invalid node:* entries or foreign lockfiles found.");
  }
}

main();
