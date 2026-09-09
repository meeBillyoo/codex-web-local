import { onMounted, onUnmounted, ref } from 'vue'

const PHONE_BREAKPOINT = '(max-width: 767px)'

export function useResponsiveLayout() {
  const isPhoneViewport = ref(false)
  const isMobileSidebarOpen = ref(false)
  let mediaQuery: MediaQueryList | null = null
  let visualViewport: VisualViewport | null = null

  function syncViewportMode(): void {
    isPhoneViewport.value = mediaQuery?.matches ?? false
    if (!isPhoneViewport.value) {
      isMobileSidebarOpen.value = false
    }
  }

  function closeMobileSidebar(): void {
    isMobileSidebarOpen.value = false
  }

  function toggleMobileSidebar(): void {
    if (!isPhoneViewport.value) return
    isMobileSidebarOpen.value = !isMobileSidebarOpen.value
  }

  function syncVisualViewport(): void {
    const height = visualViewport?.height
    if (!height || !Number.isFinite(height)) return
    document.documentElement.style.setProperty('--app-visual-viewport-height', `${Math.round(height)}px`)
  }

  onMounted(() => {
    mediaQuery = window.matchMedia(PHONE_BREAKPOINT)
    syncViewportMode()
    mediaQuery.addEventListener('change', syncViewportMode)
    visualViewport = window.visualViewport
    visualViewport?.addEventListener('resize', syncVisualViewport)
    syncVisualViewport()
  })

  onUnmounted(() => {
    mediaQuery?.removeEventListener('change', syncViewportMode)
    visualViewport?.removeEventListener('resize', syncVisualViewport)
    document.documentElement.style.removeProperty('--app-visual-viewport-height')
    mediaQuery = null
    visualViewport = null
  })

  return {
    isPhoneViewport,
    isMobileSidebarOpen,
    closeMobileSidebar,
    toggleMobileSidebar,
  }
}
