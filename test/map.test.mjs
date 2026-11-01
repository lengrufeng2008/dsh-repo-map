import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { repoMap } from '../src/map.mjs'
import { apply } from '../plugin/index.js'
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
test('map extracts TS and Python symbols', async () => {
  const m = await repoMap(join(ROOT, 'test/fixtures/demo'))
  assert.equal(m.files.length, 2)
  assert.ok(m.files.some((f) => f.symbols.some((s) => s.name === 'hello')))
  assert.ok(m.symbols >= 5)
})
test('CLI and plugin register', async () => {
  const r = spawnSync(process.execPath, [join(ROOT, 'bin/dsh-repo-map.mjs'), join(ROOT, 'test/fixtures/demo'), '--json'], { encoding: 'utf8' })
  assert.equal(r.status, 0)
  assert.match(r.stdout, /hello/)
  const tools = []; let factory
  apply({ tools: { register: (t) => tools.push(t) }, skills: { registerProvider: (fn) => { factory = fn } } })
  assert.equal(tools[0].name, 'repo_map')
  const result = await tools[0].execute({ path: join(ROOT, 'test/fixtures/demo') })
  assert.equal(result.files, 2)
  assert.equal((await factory().list())[0].name, 'repo-map')
})
