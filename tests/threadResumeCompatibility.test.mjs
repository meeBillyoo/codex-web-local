import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

async function read(path) {
  return readFile(new URL(path, import.meta.url), 'utf8')
}

test('thread resume avoids deprecated full-history hydration', async () => {
  const gateway = await read('../src/api/codexGateway.ts')

  assert.match(
    gateway,
    /callRpc\('thread\/resume', \{ threadId, excludeTurns: true \}\)/,
  )
})

test('loading conversation history does not acquire a thread writer', async () => {
  const state = await read('../src/composables/useDesktopState.ts')
  const loadMessages = state.slice(
    state.indexOf('async function loadMessages('),
    state.indexOf('async function refreshAll()', state.indexOf('async function loadMessages(')),
  )
  const startTurn = state.slice(
    state.indexOf('async function startTurnForThread('),
    state.indexOf('async function interruptSelectedThreadTurn(', state.indexOf('async function startTurnForThread(')),
  )

  assert.doesNotMatch(loadMessages, /resumeThreadWithRetry/)
  assert.match(startTurn, /resumeThreadWithRetry\(threadId\)/)
})

test('new threads start their first turn without a redundant resume', async () => {
  const state = await read('../src/composables/useDesktopState.ts')
  const sendNewThread = state.slice(
    state.indexOf('async function sendMessageToNewThread('),
    state.indexOf('async function startTurnForThread(', state.indexOf('async function sendMessageToNewThread(')),
  )
  const startThreadIndex = sendNewThread.indexOf('threadId = await startThread(')
  const markLoadedIndex = sendNewThread.indexOf('resumedThreadById.value = {')
  const startTurnIndex = sendNewThread.indexOf('await startTurnForThread(threadId, normalizedPayload)')

  assert.ok(startThreadIndex >= 0)
  assert.ok(markLoadedIndex > startThreadIndex)
  assert.ok(startTurnIndex > markLoadedIndex)
  assert.doesNotMatch(
    sendNewThread.slice(markLoadedIndex, startTurnIndex),
    /resumeThreadWithRetry/,
  )
})
