<template>
  <div class="desktop-layout" :class="{ 'is-mobile-sidebar-open': isMobileSidebarOpen }" :style="layoutStyle">
    <aside v-if="!isSidebarCollapsed || isMobileSidebarOpen" class="desktop-sidebar">
      <slot name="sidebar" />
    </aside>
    <button
      v-if="isMobileSidebarOpen"
      class="desktop-sidebar-backdrop"
      type="button"
      :aria-label="mobileSidebarCloseLabel"
      @click="$emit('close-mobile-sidebar')"
    />
    <button
      v-if="!isSidebarCollapsed"
      class="desktop-resize-handle"
      type="button"
      aria-label="Resize sidebar"
      @mousedown="onResizeHandleMouseDown"
    />
    <section class="desktop-main">
      <slot name="content" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    isSidebarCollapsed?: boolean
    isMobileSidebarOpen?: boolean
    mobileSidebarCloseLabel?: string
  }>(),
  {
    isSidebarCollapsed: false,
    isMobileSidebarOpen: false,
    mobileSidebarCloseLabel: 'Close sidebar',
  },
)

defineEmits<{
  'close-mobile-sidebar': []
}>()

const SIDEBAR_WIDTH_KEY = 'codex-web-local.sidebar-width.v1'
const MIN_SIDEBAR_WIDTH = 260
const MAX_SIDEBAR_WIDTH = 620
const DEFAULT_SIDEBAR_WIDTH = 320

function clampSidebarWidth(value: number): number {
  return Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, value))
}

function loadSidebarWidth(): number {
  if (typeof window === 'undefined') return DEFAULT_SIDEBAR_WIDTH

  const raw = window.localStorage.getItem(SIDEBAR_WIDTH_KEY)
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return DEFAULT_SIDEBAR_WIDTH
  return clampSidebarWidth(parsed)
}

const sidebarWidth = ref(loadSidebarWidth())
const layoutStyle = computed(() => {
  if (props.isSidebarCollapsed) {
    return {
      '--sidebar-width': '0px',
      '--layout-columns': 'minmax(0, 1fr)',
    }
  }
  return {
    '--sidebar-width': `${sidebarWidth.value}px`,
    '--layout-columns': 'var(--sidebar-width) 1px minmax(0, 1fr)',
  }
})

function saveSidebarWidth(value: number): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(SIDEBAR_WIDTH_KEY, String(value))
}

function onResizeHandleMouseDown(event: MouseEvent): void {
  event.preventDefault()

  const startX = event.clientX
  const startWidth = sidebarWidth.value

  const onMouseMove = (moveEvent: MouseEvent) => {
    const delta = moveEvent.clientX - startX
    sidebarWidth.value = clampSidebarWidth(startWidth + delta)
  }

  const onMouseUp = () => {
    saveSidebarWidth(sidebarWidth.value)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}
</script>

<style scoped>
@reference "tailwindcss";

.desktop-layout {
  @apply grid overflow-hidden;
  height: var(--app-visual-viewport-height, var(--app-viewport-height));
  min-height: var(--app-visual-viewport-height, var(--app-viewport-height));
  background: var(--color-bg-app);
  color: var(--color-text-primary);
  grid-template-columns: var(--layout-columns);
}

.desktop-sidebar {
  @apply min-h-0 overflow-y-auto;
  background: var(--color-bg-app);
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.desktop-resize-handle {
  @apply relative w-px cursor-col-resize bg-slate-300 hover:bg-slate-400 transition;
}

.desktop-resize-handle::before {
  content: '';
  @apply absolute -left-2 -right-2 top-0 bottom-0;
}

.desktop-main {
  @apply min-h-0 overflow-y-hidden overflow-x-visible;
  background: var(--color-bg-surface);
}

.desktop-sidebar-backdrop {
  display: none;
}

@media (max-width: 767px) {
  .desktop-layout {
    display: block;
    position: relative;
  }

  .desktop-sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 50;
    width: min(88vw, 22rem);
    height: var(--app-visual-viewport-height, var(--app-viewport-height));
    padding-bottom: var(--app-safe-area-bottom);
    box-shadow: 18px 0 48px color-mix(in srgb, #000 22%, transparent);
    transform: translateX(-105%);
    transition: transform 180ms ease-out;
    will-change: transform;
  }

  .desktop-layout.is-mobile-sidebar-open .desktop-sidebar {
    transform: translateX(0);
  }

  .desktop-sidebar-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 40;
    border: 0;
    background: color-mix(in srgb, #000 34%, transparent);
    backdrop-filter: blur(3px);
  }

  .desktop-resize-handle {
    display: none;
  }

  .desktop-main {
    width: 100%;
    height: var(--app-visual-viewport-height, var(--app-viewport-height));
  }
}

@media (prefers-reduced-motion: reduce) {
  .desktop-sidebar {
    transition: none;
  }
}
</style>
