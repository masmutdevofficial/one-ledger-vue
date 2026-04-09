/**
 * Device gate plugin — restricts access to mobile-sized devices.
 * Extracted from App.vue to improve separation of concerns.
 */

import { ref, onMounted, onUnmounted } from 'vue'

export function useDeviceGate() {
  const blockedByDevice = ref(true)

  function isMobileLike(): boolean {
    const ua = navigator.userAgent || ''
    const uaMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
    const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false
    const maxWidth = window.matchMedia?.('(max-width: 900px)').matches ?? window.innerWidth <= 900
    return (uaMobile || coarse) && maxWidth
  }

  function evaluate(): void {
    blockedByDevice.value = !isMobileLike()
  }

  let handler: (() => void) | null = null

  onMounted(() => {
    evaluate()
    handler = () => evaluate()
    window.addEventListener('resize', handler)
    window.addEventListener('orientationchange', handler)
  })

  onUnmounted(() => {
    if (handler) {
      window.removeEventListener('resize', handler)
      window.removeEventListener('orientationchange', handler)
    }
  })

  return { blockedByDevice }
}
