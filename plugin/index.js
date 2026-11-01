import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { repoMap, renderMarkdown } from '../src/map.mjs'
const PLUGIN_DIR = dirname(fileURLToPath(import.meta.url))
const SKILL_PATH = join(PLUGIN_DIR, '..', 'skills', 'repo-map', 'SKILL.md')
const PROVIDER = 'dsh-repo-map'
export const name = 'repo-map'
export const inject = ['tools', 'skills']
function stripFrontmatter(text) { if (!text.startsWith('---\n')) return text; const end = text.indexOf('\n---\n', 4); return end === -1 ? text : text.slice(end + 5) }
const summary = { name: 'repo-map', description: 'Regex-based compact repository map of files and top-level symbols. No LSP, no type resolution, no call graph.', whenToUse: 'A quick orientation map is needed before opening files, without a language server.', invocation: { modelInvocable: true, userInvocable: true }, source: 'bundled', provider: PROVIDER, resourceBase: { kind: 'directory', path: join(PLUGIN_DIR, '..', 'skills', 'repo-map') }, rank: 600, locator: 'repo-map', metadata: { domain: 'context', version: '0.1.0' } }
export function apply(ctx) {
  ctx.tools.register({ name: 'repo_map', description: 'Build a compact regex-based map of source files and top-level symbols. Read-only; not a language server and not a call graph.', parameters: { type: 'object', additionalProperties: false, properties: { path: { type: 'string' }, maxFiles: { type: 'integer', minimum: 1 } }, required: ['path'] }, output: { schema: { type: 'object', additionalProperties: false, properties: { markdown: { type: 'string' }, files: { type: 'integer' }, symbols: { type: 'integer' } }, required: ['markdown', 'files', 'symbols'] }, render: (_a, v) => [{ type: 'text', text: v.markdown }] }, timeoutMs: 30_000, async execute(args = {}) { const m = await repoMap(args.path, { maxFiles: args.maxFiles || 600 }); return { markdown: renderMarkdown(m), files: m.files.length, symbols: m.symbols } } })
  ctx.skills.registerProvider(() => ({ name: PROVIDER, async list() { return [summary] }, async get(c) { if (c?.name !== 'repo-map') return undefined; return { ...summary, content: stripFrontmatter(await readFile(SKILL_PATH, 'utf8')) } } }))
}
