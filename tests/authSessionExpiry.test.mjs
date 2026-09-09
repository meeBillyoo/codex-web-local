import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { createAuthMiddleware } from '../src/server/authMiddleware.ts'

function createResponseCapture() {
  return {
    statusCode: 200,
    payload: null,
    status(statusCode) {
      this.statusCode = statusCode
      return this
    },
    json(payload) {
      this.payload = payload
      return this
    },
    setHeader() {},
    send(payload) {
      this.payload = payload
      return this
    },
  }
}

test('expired authentication returns a JSON 401 for Codex API requests', () => {
  const middleware = createAuthMiddleware('test-password')
  const req = {
    method: 'POST',
    path: '/codex-api/rpc',
    headers: {
      cookie: 'codex_web_local_token=expired-token',
    },
  }
  const res = createResponseCapture()
  let nextCalled = false

  middleware(req, res, () => {
    nextCalled = true
  })

  assert.equal(nextCalled, false)
  assert.equal(res.statusCode, 401)
  assert.deepEqual(res.payload, {
    error: 'Authentication required',
    loginUrl: '/auth/login',
  })
})

test('frontend redirects to login after authentication expires', async () => {
  const source = await readFile(
    new URL('../src/main.ts', import.meta.url),
    'utf8',
  )

  assert.match(source, /response\.status !== 401/)
  assert.match(source, /url\.pathname\.startsWith\('\/codex-api\/'\)/)
  assert.match(source, /window\.location\.replace\('\/auth\/login'\)/)
  assert.match(source, /installAuthenticationRedirect\(\)/)
})
