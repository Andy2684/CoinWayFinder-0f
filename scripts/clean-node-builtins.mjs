import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const BAD_PREFIX = "node:";
const DEP_SECTIONS = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies",
  "overrides",
  "resolutions"
];
const LOCKFILES = new Set([
  "package-lock.json",
  "pnpm-lock.yaml",
  "pnpm-lock.yaml ", // handle trailing-space variant
  "yarn.lock",
  "bun.lockb",
  "bun.lock",
  "bun.lockb "
]);

const scanOnly = process.argv.includes("--scan-only");

function isPlainObject(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}

function cleanObjectKeys(obj, parentPath = []) {
  if (!isPlainObject(obj)) return { changed: false, removed: [] };
  let changed = false;
  const removed = [];

  for (const key of Object.keys(obj)) {
    if (key.startsWith(BAD_PREFIX)) {
      removed.push({ path: parentPath.slice(), key, value: obj[key] });
      delete obj[key];
      changed = true;
      continue;
    }
    const val = obj[key];
    if (isPlainObject(val)) {
      const sub = cleanObjectKeys(val, parentPath.concat(key));
      if (sub.changed) changed = true;
      removed.push(...sub.removed);
    } else if (Array.isArray(val)) {
      for (let i = 0; i < val.length; i++) {
        if (isPlainObject(val[i])) {
          const sub = cleanObjectKeys(val[i], parentPath.concat(`${key}[${i}]`));
          if (sub.changed) changed = true;
          removed.push(...sub.removed);
        }
      }
    }
  }
  return { changed, removed };
}

function cleanPackageJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    console.error(`Skipping invalid JSON: ${filePath}`);
    return { changed: false, removed: [] };
  }

  const removedAll = [];

  for (const section of DEP_SECTIONS) {
    if (json[section]) {
      // delete any direct "node:*" keys
      for (const key of Object.keys(json[section])) {
        if (key.startsWith(BAD_PREFIX)) {
          removedAll.push({ section, key, value: json[section][key] });
          delete json[section][key];
        }
      }
      // deeply clean nested structures (e.g., overrides/resolutions can nest)
      const deep = cleanObjectKeys(json[section], [section]);
      removedAll.push(
        ...deep.removed.map((r) => ({
          section: r.path.join("."),
          key: r.key,
          value: r.value
        }))
      );
    }
  }

  if (removedAll.length > 0) {
    if (scanOnly) {
      console.error(`Would remove invalid built-in entries from ${filePath}:`);
      for (const r of removedAll) {
        console.error(`- ${r.section} -> ${r.key} : ${JSON.stringify(r.value)}`);
      }
    } else {
      fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + "\n", "utf8");
      console.log(`Cleaned ${filePath}: removed ${removedAll.length} invalid entry(ies).`);
    }
    return { changed: !scanOnly, removed: removedAll };
  }
  return { changed: false, removed: [] };
}

function walk(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
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

function removeLockfiles(rootDir) {
  const files = walk(rootDir);
  let removed = 0;
  for (const filePath of files) {
    const base = path.basename(filePath);
    if (LOCKFILES.has(base)) {
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
  // 1) Clean every package.json in the repo tree
  const files = walk(ROOT).filter((f) => path.basename(f) === "package.json");
  let totalRemoved = 0;
  for (const pkgFile of files) {
    const res = cleanPackageJson(pkgFile);
    totalRemoved += res.removed.length;
  }

  // 2) Remove any foreign lockfiles that could reintroduce the issue
  const locksRemoved = removeLockfiles(ROOT);

  if (scanOnly) {
    if (totalRemoved === 0 && locksRemoved === 0) {
      console.log("OK: No node:* entries found and no foreign lockfiles present.");
      process.exit(0);
    } else {
      console.error("Scan detected issues (see logs above).");
      process.exit(1);
    }
  }

  // 3) Summary
  if (totalRemoved > 0 || locksRemoved > 0) {
    console.log(
      `Sanitized repository: removed ${totalRemoved} invalid manifest entr${totalRemoved === 1 ? "y" : "ies"} and deleted ${locksRemoved} lockfile(s).`
    );
  } else {
    console.log("No invalid node:* entries or foreign lockfiles found.");
  }
}

main();
