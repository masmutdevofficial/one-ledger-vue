// src/composables/useNotificationCounter.ts
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const API_BASE = 'https://tech.oneled.io/api'

function getToken(): string | null {
  return localStorage.getItem('token')
}

const POLL_MS = 5000

export function useNotificationCounter() {
  const router = useRouter()
  const loading = ref(false)
  const notificationCount = ref<number>(0)
  let intervalId: number | null = null
  let inFlightController: AbortController | null = null

  const notificationLabel = computed(() =>
    notificationCount.value > 99 ? '99+' : String(notificationCount.value),
  )

  const badgeClass = computed(() =>
    notificationCount.value > 99 ? 'w-5 h-5 text-[10px]' : 'w-4 h-4 text-[8px]',
  )

  async function fetchNotificationCount(): Promise<void> {
    const token = getToken()
    if (!token) {
      notificationCount.value = 0
      return
    }
    if (loading.value) return // cegah overlap

    loading.value = true
    inFlightController?.abort() // batalkan request sebelumnya jika ada
    inFlightController = new AbortController()
    const timer = window.setTimeout(() => inFlightController?.abort(), POLL_MS - 500) // timebox

    try {
      const res = await fetch(`${API_BASE}/notifications/count`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        signal: inFlightController.signal,
      })

      if (res.status === 401) {
        localStorage.removeItem('token')
        await router.replace({ path: '/login', query: { reason: 'unauthorized' } })
        return
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = (await res.json()) as { count?: number }
      notificationCount.value = Number.isFinite(data.count as number) ? (data.count as number) : 0
    } catch {
      // diamkan; bisa log ke store alert bila perlu
      notificationCount.value = notificationCount.value // no-op
    } finally {
      window.clearTimeout(timer)
      loading.value = false
    }
  }

  async function markAllRead(): Promise<void> {
    const token = getToken()
    if (!token) return
    try {
      const res = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      if (res.status === 401) {
        localStorage.removeItem('token')
        await router.replace({ path: '/login', query: { reason: 'unauthorized' } })
        return
      }
      // anggap sukses; backend idealnya kembalikan status/JSON
      notificationCount.value = 0
    } catch {
      // silent
    }
  }

  function startPolling(): void {
    if (intervalId !== null) return
    // fetch awal langsung
    void fetchNotificationCount()
    intervalId = window.setInterval(() => {
      if (document.hidden) return // hemat saat tab tidak aktif
      void fetchNotificationCount()
    }, POLL_MS) as unknown as number
  }

  function stopPolling(): void {
    if (intervalId !== null) {
      window.clearInterval(intervalId)
      intervalId = null
    }
    inFlightController?.abort()
  }

  function handleVisibilityChange(): void {
    if (document.hidden) {
      stopPolling()
    } else {
      startPolling()
    }
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true })
    startPolling()
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    stopPolling()
  })

  async function handleClickNotification(): Promise<void> {
    await markAllRead()
    await router.push('/notification')
  }

  return {
    loading,
    notificationCount,
    notificationLabel,
    badgeClass,
    fetchNotificationCount,
    markAllRead,
    handleClickNotification,
    startPolling,
    stopPolling,
  }
}
