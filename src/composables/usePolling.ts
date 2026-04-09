/**
 * Visibility-aware polling composable.
 * Pauses polling when the browser tab is not visible to save resources.
 */

import { onMounted, onUnmounted } from 'vue'

export interface PollingOptions {
  /** Polling interval in ms */
  intervalMs: number
  /** Whether to pause when the tab is not visible (default: true) */
  pauseWhenHidden?: boolean
  /** Whether to start automatically on mount (default: true) */
  autoStart?: boolean
  /** Whether to run the function immediately on start (default: true) */
  immediate?: boolean
}

export function usePolling(fn: () => void | Promise<void>, options: PollingOptions) {
  const {
    intervalMs,
    pauseWhenHidden = true,
    autoStart = true,
    immediate = true,
  } = options

  let timer: ReturnType<typeof setInterval> | null = null
  let running = false

  function start(): void {
    if (timer) return
    running = true
    if (immediate) fn()
    timer = setInterval(() => {
      if (pauseWhenHidden && document.hidden) return
      fn()
    }, intervalMs)
  }

  function stop(): void {
    running = false
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  function onVisChange(): void {
    if (!pauseWhenHidden) return
    if (document.hidden) {
      stop()
    } else if (running || autoStart) {
      start()
    }
  }

  if (autoStart) {
    onMounted(() => {
      document.addEventListener('visibilitychange', onVisChange, { passive: true })
      start()
    })
  }

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', onVisChange)
    stop()
  })

  return { start, stop }
}
