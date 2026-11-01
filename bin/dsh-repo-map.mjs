#!/usr/bin/env node
import { writeFile } from 'node:fs/promises'
import { repoMap, renderMarkdown } from '../src/map.mjs'
const args = process.argv.slice(2)
if (args.includes('--help') || args.includes('-h')) { console.log('dsh-repo-map [dir] [--json] [--output FILE] [--max-files N]\\n\\nRegex-based compact repo map.'); process.exit(0) }
const value = (n) => { const i = args.indexOf(n); return i === -1 ? undefined : args[i + 1] }
const target = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--output' && args[args.indexOf(a) - 1] !== '--max-files') || '.'
try {
  const map = await repoMap(target, { maxFiles: Number(value('--max-files')) || 600 })
  const text = args.includes('--json') ? JSON.stringify(map, null, 2) : renderMarkdown(map)
  const out = value('--output')
  if (out) { await writeFile(out, text); console.log(`wrote ${out}: ${map.files.length} files, ${map.symbols} symbols`) } else process.stdout.write(text + '\n')
} catch (error) { console.error(`dsh-repo-map: ${error.message}`); process.exitCode = 2 }
