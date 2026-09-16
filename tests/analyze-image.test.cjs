const { test } = require('node:test')
const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')

function loadHandler(env = {}, fetch = () => { throw new Error('Unexpected upstream request') }) {
  const source = readFileSync(require.resolve('../app/api/analyze-image/route.ts'), 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const context = { exports: {}, require, process: { env }, fetch, AbortSignal }
  vm.runInNewContext(compiled, context)
  return context.exports.POST
}

const request = (body) => new Request('http://localhost/api/analyze-image', { method: 'POST', body })
const payload = JSON.stringify({ contents: [{ parts: [{ text: 'Describe this image' }] }] })
const config = { GEMINI_API_KEY: 'test-secret', GEMINI_MODEL: 'test-model' }

test('invalid JSON and missing contents return 400 without calling Gemini', async () => {
  const post = loadHandler()
  for (const body of ['{', 'null', '{}', '{"contents":[]}']) {
    assert.equal((await post(request(body))).status, 400)
  }
})

test('missing server configuration returns 503', async () => {
  assert.equal((await loadHandler()(request(payload))).status, 503)
})

test('successful requests keep the API key in the server request header', async () => {
  const data = { candidates: [{ content: { parts: [{ text: 'Kursi' }] } }] }
  const post = loadHandler(config, async (url, options) => {
    assert.ok(url.endsWith('/test-model:generateContent'))
    assert.ok(!url.includes('test-secret'))
    assert.equal(options.headers['x-goog-api-key'], 'test-secret')
    assert.deepEqual(JSON.parse(options.body), JSON.parse(payload))
    return Response.json(data)
  })
  const response = await post(request(payload))
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), data)
})

test('upstream failures do not leak provider details', async () => {
  const post = loadHandler(config, async () => Response.json({ error: 'test-secret' }, { status: 403 }))
  const response = await post(request(payload))
  assert.equal(response.status, 502)
  assert.ok(!(await response.text()).includes('test-secret'))
})

test('network failure returns 502', async () => {
  const post = loadHandler(config, async () => { throw new Error('offline') })
  assert.equal((await post(request(payload))).status, 502)
})
