import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const BAD_NAMES = new Set(["node:dns", "node:fs", "node:path", "node:net", "node:http", "node:https"]);
const LOCKFILES = new Set(["package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lockb", "pnpm-lock.yaml "]);

function isJsonFile(file) {
  return file.endsWith(".json");
}

function readJsonSafe(filePath) {
  try {
    const txt = fs.readFileSync(filePath, "utf8");
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

function scanPackageJson(filePath) {
  const json = readJsonSafe(filePath);
  if (!json) return [];

  const offenders = [];

  const checkDeps = (obj, section) => {
    if (!obj || typeof obj !== "object") return;
    for (const [name, ver] of Object.entries(obj)) {
      if (BAD_NAMES.has(name)) {
        offenders.push({ file: filePath, section, name, version: String(ver) });
      }
      // Also catch weird aliases like {"node:dns": "latest"} inside overrides/resolutions
    }
  };

  checkDeps(json.dependencies, "dependencies");
  checkDeps(json.devDependencies, "devDependencies");
  checkDeps(json.optionalDependencies, "optionalDependencies");
  checkDeps(json.peerDependencies, "peerDependencies");
  checkDeps(json.overrides, "overrides");
  checkDeps(json.resolutions, "resolutions");

  return offenders;
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    // Skip node_modules and .next to keep this quick
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else {
      files.push(full);
    }
  }
  return files;
}

function main() {
  const files = walk(ROOT, []);
  const offenders = [];

  for (const file of files) {
    const base = path.basename(file);
    // Check for lockfiles that might reintroduce the issue
    if (LOCKFILES.has(base)) {
      offenders.push({ file, section: "lockfile", name: base, version: "present" });
      continue;
    }

    if (path.basename(file) === "package.json") {
      offenders.push(...scanPackageJson(file));
    }
  }

  if (offenders.length > 0) {
    console.error("Detected invalid built-in specifiers declared as packages (these must be removed):");
    for (const o of offenders) {
      console.error(`- ${o.file} :: ${o.section} -> ${o.name} @ ${o.version}`);
    }
    console.error(
      "Fix: remove these entries from the indicated manifest(s). Built-in modules must not be listed as dependencies."
    );
    process.exit(1);
  } else {
    console.log("OK: No invalid node:* packages declared in manifests; no known lockfiles present.");
  }
}

main();
