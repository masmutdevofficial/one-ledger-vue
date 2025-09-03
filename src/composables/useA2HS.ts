// src/composables/useA2HS.ts
import { ref, onMounted, onBeforeUnmount } from 'vue'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
const canInstall = ref(false)
const isInstalled = ref(false)
const supportsA2HS = typeof window !== 'undefined' && 'onbeforeinstallprompt' in window

function showInstallPrompt() {
  const dp = deferredPrompt.value
  if (!dp) return false
  dp.prompt()
  deferredPrompt.value = null
  canInstall.value = false
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

  onMounted(async () => {
    window.addEventListener('beforeinstallprompt', onBeforeInstall as EventListener)
    window.addEventListener('appinstalled', onAppInstalled)

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true
    if (isStandalone) {
      isInstalled.value = true
      canInstall.value = false
    }

    // DEBUG: ?debugA2HS=1 → paksa tombol muncul untuk uji di desktop
    const debug = new URLSearchParams(location.search).has('debugA2HS')
    if (debug && !isInstalled.value) canInstall.value = true
  })

  onBeforeUnmount(() => {
    window.removeEventListener('beforeinstallprompt', onBeforeInstall as EventListener)
    window.removeEventListener('appinstalled', onAppInstalled)
  })

  return { canInstall, isInstalled, supportsA2HS, showInstallPrompt }
}
