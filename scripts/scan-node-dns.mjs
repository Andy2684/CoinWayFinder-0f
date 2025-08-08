import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const hits = []

function scanFile(p) {
  try {
    const content = readFileSync(p, 'utf8')
    if (content.includes('"node:dns"') || content.includes("'node:dns'") || content.includes('node:dns')) {
      hits.push(p)
    }
  } catch {}
}

function walk(dir) {
  const entries = readdirSync(dir)
  for (const entry of entries) {
    const full = join(dir, entry)
    try {
      const st = statSync(full)
      if (st.isDirectory()) {
        // Skip .next and node_modules for speed
        if (entry === '.next' || entry === 'node_modules') continue
        walk(full)
      } else {
        // Inspect package manifests and lockfiles first
        if (
          entry === 'package.json' ||
          entry === 'pnpm-lock.yaml' ||
          entry === 'package-lock.json' ||
          entry === 'yarn.lock' ||
          entry.endsWith('.yaml') ||
          entry.endsWith('.yml') ||
          entry.endsWith('.json')
        ) {
          scanFile(full)
        }
      }
    } catch {}
  }
}

walk(root)

if (hits.length === 0) {
  console.log('No occurrences of "node:dns" found in manifests/lockfiles.')
} else {
  console.log('Found "node:dns" references in:')
  for (const h of hits) console.log(' -', h)
  console.log('Please remove or correct these entries.')
}
