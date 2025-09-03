import { ref } from 'vue'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
const canInstall = ref(false)
const isInstalled = ref(false)

let bootstrapped = false
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

export function bootstrapA2HS() {
  if (bootstrapped) return
  bootstrapped = true

  if (typeof window === 'undefined') return
  window.addEventListener('beforeinstallprompt', onBeforeInstall as EventListener)
  window.addEventListener('appinstalled', onAppInstalled)

  // tandai sudah terpasang bila standalone
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
  if (standalone) {
    isInstalled.value = true
    canInstall.value = false
  }

  // DEBUG opsional: ?debugA2HS=1 memaksa tombol tampil untuk uji
  const debug = new URLSearchParams(location.search).has('debugA2HS')
  if (debug && !isInstalled.value) canInstall.value = true
}

export function useA2HS() {
  // nilai reactive dipakai oleh komponen mana pun
  function showInstallPrompt() {
    const dp = deferredPrompt.value
    if (!dp) return false
    dp.prompt()
    deferredPrompt.value = null
    canInstall.value = false
    return true
  }
  return { canInstall, isInstalled, showInstallPrompt }
}
