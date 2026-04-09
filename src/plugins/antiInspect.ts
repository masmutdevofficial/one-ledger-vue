/**
 * Anti-inspect plugin — disables right-click context menu and
 * common keyboard shortcuts that open developer tools.
 * Extracted from App.vue for separation of concerns.
 */

import { onMounted, onUnmounted } from 'vue'

export function useAntiInspect() {
  function handleContextMenu(e: Event) {
    e.preventDefault()
  }

  function handleKeyDown(e: KeyboardEvent) {
    // F12
    if (e.key === 'F12') {
      e.preventDefault()
      return
    }
    // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
      e.preventDefault()
      return
    }
    // Ctrl+U (view source)
    if (e.ctrlKey && e.key.toUpperCase() === 'U') {
      e.preventDefault()
      return
    }
  }

  onMounted(() => {
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('contextmenu', handleContextMenu)
    document.removeEventListener('keydown', handleKeyDown)
  })
}
