// src/composables/useA2HS.ts
import { ref, onMounted, onBeforeUnmount } from 'vue'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
const canInstall = ref(false)
const isInstalled = ref(false)

function showInstallPrompt() {
  const dp = deferredPrompt.value
  if (!dp) return false
  dp.prompt()
  // setelah dipanggil, reset biar nggak dipakai ulang
  deferredPrompt.value = null
  canInstall.value = false
  // opsional: tracking hasil
  dp.userChoice.catch(() => {}).finally(() => {})
  return true
}

export function useA2HS() {
  function onBeforeInstall(e: Event) {
    e.preventDefault()
    deferredPrompt.value = e as BeforeInstallPromptEvent
    canInstall.value = true
  }
  function onAppInstalled() {
    isInstalled.value = true
    canInstall.value = false
    deferredPrompt.value = null
  }

  onMounted(() => {
    window.addEventListener('beforeinstallprompt', onBeforeInstall as EventListener)
    window.addEventListener('appinstalled', onAppInstalled)
    // jika sudah standalone, anggap terpasang
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari legacy
      (navigator as any).standalone === true
    if (isStandalone) {
      isInstalled.value = true
      canInstall.value = false
    }
  })

  onBeforeUnmount(() => {
    window.removeEventListener('beforeinstallprompt', onBeforeInstall as EventListener)
    window.removeEventListener('appinstalled', onAppInstalled)
  })

  return { canInstall, isInstalled, showInstallPrompt }
}
