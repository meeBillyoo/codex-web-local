import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

async function read(path) {
  return readFile(new URL(path, import.meta.url), 'utf8')
}

test('index includes iOS standalone and safe-area metadata', async () => {
  const source = await read('../index.html')

  assert.match(source, /viewport-fit=cover/)
  assert.match(source, /apple-mobile-web-app-capable/)
  assert.match(source, /apple-mobile-web-app-status-bar-style/)
  assert.match(source, /apple-touch-icon/)
  assert.match(source, /manifest\.webmanifest/)
})

test('PWA configuration uses manual update semantics and keeps APIs network-only', async () => {
  const source = await read('../vite.config.ts')

  assert.match(source, /registerType:\s*"prompt"/)
  assert.match(source, /injectRegister:\s*null/)
  assert.match(source, /clientsClaim:\s*false/)
  assert.match(source, /skipWaiting:\s*false/)
  assert.match(source, /url\.pathname\.startsWith\("\/codex-api\/"\)/)
  assert.match(source, /url\.pathname\.startsWith\("\/auth\/"\)/)
  assert.match(source, /handler:\s*"NetworkOnly"/)
})

test('mobile shell includes dynamic viewport, safe-area, and touch foundations', async () => {
  const style = await read('../src/style.css')
  const layout = await read('../src/components/layout/DesktopLayout.vue')

  assert.match(style, /--app-safe-area-bottom:\s*env\(safe-area-inset-bottom/)
  assert.match(style, /--app-viewport-height:\s*100dvh/)
  assert.match(style, /overscroll-behavior:\s*none/)
  assert.match(style, /focus-visible/)
  assert.match(layout, /is-mobile-sidebar-open/)
  assert.match(layout, /@media\s*\(max-width:\s*767px\)/)
  assert.match(layout, /translateX\(-105%\)/)
})

test('offline and PWA runtime state are isolated from business API state', async () => {
  const connectivity = await read('../src/composables/useConnectivityStatus.ts')
  const pwa = await read('../src/composables/usePwaRuntime.ts')

  assert.match(connectivity, /addEventListener\('offline'/)
  assert.match(connectivity, /addEventListener\('online'/)
  assert.match(pwa, /navigator\.serviceWorker\.getRegistration/)
  assert.match(pwa, /registration\?\.update\(\)/)
  assert.match(pwa, /updateServiceWorker\(true\)/)
})
