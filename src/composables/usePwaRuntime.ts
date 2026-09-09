import { ref } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

export function usePwaRuntime() {
  const needRefresh = useRegisterSW({
    immediate: true,
  })
  const isCheckingForUpdate = ref(false)

  async function checkForUpdates(): Promise<void> {
    if (!('serviceWorker' in navigator)) return

    isCheckingForUpdate.value = true
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      await registration?.update()
    } finally {
      isCheckingForUpdate.value = false
    }
  }

  async function applyUpdate(): Promise<void> {
    await needRefresh.updateServiceWorker(true)
  }

  return {
    isUpdateAvailable: needRefresh.needRefresh,
    isCheckingForUpdate,
    checkForUpdates,
    applyUpdate,
  }
}
