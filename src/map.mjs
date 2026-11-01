import { readFile, readdir, stat } from 'node:fs/promises'
import { join, relative, resolve, sep } from 'node:path'
const SKIP = new Set(['.git', 'node_modules', 'dist', 'build', 'coverage', '.cache', 'test', 'tests', 'docs', 'market', 'launch'])
const EXT = /\.(?:[cm]?[jt]sx?|py|go|rs|java|kt|swift|rb|php)$/i
const RULES = [
  [/^\s*(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/, 'function'],
  [/^\s*(?:export\s+)?class\s+([A-Za-z_$][\w$]*)/, 'class'],
  [/^\s*(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/, 'value'],
  [/^\s*(?:export\s+)?(?:interface|type|enum)\s+([A-Za-z_$][\w$]*)/, 'type'],
  [/^\s*def\s+([A-Za-z_]\w*)\s*\(/, 'function'],
  [/^\s*class\s+([A-Za-z_]\w*)/, 'class'],
  [/^\s*func\s+(?:\([^)]*\)\s*)?([A-Za-z_]\w*)\s*\(/, 'function'],
  [/^\s*type\s+([A-Za-z_]\w*)\s+(?:struct|interface|enum)/, 'type'],
  [/^\s*fn\s+([A-Za-z_]\w*)/, 'function'],
  [/^\s*(?:struct|enum|trait)\s+([A-Za-z_]\w*)/, 'type'],
]
async function walk(root, dir = root, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue
    const p = join(dir, entry.name)
    if (entry.isDirectory()) await walk(root, p, out)
    else if (EXT.test(entry.name)) out.push(p)
  }
  return out
}
export async function repoMap(input, { maxFiles = 600 } = {}) {
  const root = await resolve(input)
  if (!(await stat(root)).isDirectory()) throw new Error('not a directory')
  const paths = (await walk(root)).sort((a, b) => a.localeCompare(b)).slice(0, maxFiles)
  const files = []
  for (const path of paths) {
    const text = await readFile(path, 'utf8').catch(() => '')
    const lines = text.split('\n')
    const symbols = []
    for (let i = 0; i < lines.length; i++) {
      for (const [re, kind] of RULES) {
        const m = re.exec(lines[i])
        if (m) { symbols.push({ name: m[1], kind, line: i + 1 }); break }
      }
    }
    if (symbols.length) files.push({ path: relative(root, path).split(sep).join('/'), symbols: symbols.slice(0, 80) })
  }
  return { root, files, symbols: files.reduce((n, f) => n + f.symbols.length, 0) }
}
export function renderMarkdown(map) {
  const lines = [`# Repo map: ${map.files.length} files, ${map.symbols} symbols`, '']
  for (const file of map.files) {
    lines.push(`- \`${file.path}\``)
    for (const s of file.symbols) lines.push(`  - ${s.kind} \`${s.name}\` :${s.line}`)
  }
  lines.push('', 'Regex-based map; no language server, no type resolution, no call graph.')
  return lines.join('\n')
}
