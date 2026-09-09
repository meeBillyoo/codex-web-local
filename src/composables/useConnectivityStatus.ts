import { onMounted, onUnmounted, ref } from 'vue'

const ONLINE_RESTORE_NOTICE_MS = 2600

export function useConnectivityStatus() {
  const isOnline = ref(true)
  const showOnlineRestored = ref(false)
  let restoredNoticeTimer: number | null = null
  let wasOffline = false

  function clearRestoredNoticeTimer(): void {
    if (restoredNoticeTimer === null) return
    window.clearTimeout(restoredNoticeTimer)
    restoredNoticeTimer = null
  }

  function handleOffline(): void {
    isOnline.value = false
    wasOffline = true
    clearRestoredNoticeTimer()
    showOnlineRestored.value = false
  }

  function handleOnline(): void {
    isOnline.value = true
    if (!wasOffline) return

    showOnlineRestored.value = true
    clearRestoredNoticeTimer()
    restoredNoticeTimer = window.setTimeout(() => {
      showOnlineRestored.value = false
      restoredNoticeTimer = null
    }, ONLINE_RESTORE_NOTICE_MS)
  }

  onMounted(() => {
    isOnline.value = window.navigator.onLine
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
  })

  onUnmounted(() => {
    clearRestoredNoticeTimer()
    window.removeEventListener('offline', handleOffline)
    window.removeEventListener('online', handleOnline)
  })

  return {
    isOnline,
    showOnlineRestored,
  }
}
