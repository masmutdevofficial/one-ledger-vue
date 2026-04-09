/**
 * Centralized WebSocket composable for the aggregator server.
 * Replaces duplicated connect/subscribe/unsubscribe/snapshot/reconnect logic
 * across DashboardUser, AssetsData, MarketAll, and NewMarketCoin.
 */

import { ref, onUnmounted } from 'vue'
import { config } from '@/lib/config'

export interface AggregatorCallbacks {
  /** Called when a ticker message arrives */
  onTicker?: (symLower: string, last: number) => void
  /** Called when a kline message arrives */
  onKline?: (symLower: string, period: string, open: number, close: number, high: number, low: number, volume: number) => void
  /** Called when an orderbook/depth message arrives */
  onDepth?: (symLower: string, data: unknown) => void
  /** Called when a bookTicker message arrives */
  onBookTicker?: (symLower: string, data: unknown) => void
  /** Called when a snapshot batch arrives */
  onSnapshot?: (items: unknown[]) => void
  /** Called on successful connection */
  onOpen?: () => void
  /** Called on connection close */
  onClose?: () => void
}

export interface AggregatorOptions {
  /** Channels to subscribe to (default: ['ticker', 'kline']) */
  channels?: string[]
  /** Kline periods to subscribe to (default: ['1day']) */
  periods?: string[]
  /** Max reconnect delay in ms (default: 30000) */
  maxReconnectDelay?: number
  /** Initial reconnect delay in ms (default: 1000) */
  initialReconnectDelay?: number
  /** Whether to auto-connect on creation (default: false) */
  autoConnect?: boolean
  /** Custom WebSocket URL (default: config.wsUrl) */
  wsUrl?: string
}

export function useAggregatorSocket(
  callbacks: AggregatorCallbacks,
  options: AggregatorOptions = {},
) {
  const {
    channels = ['ticker', 'kline'],
    periods = ['1day'],
    maxReconnectDelay = 30000,
    initialReconnectDelay = 1000,
    wsUrl = config.wsUrl,
  } = options

  const connected = ref(false)
  let ws: WebSocket | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let reconnectAttempt = 0
  let subscribedSymbols = new Set<string>()
  let resubTimer: ReturnType<typeof setTimeout> | null = null
  let destroyed = false

  /** Send JSON to WebSocket if connected */
  function wsSend(obj: unknown): void {
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(obj))
      } catch {
        // ignore send errors
      }
    }
  }

  /** Subscribe to symbols */
  function subscribe(symbolsLower: string[]): void {
    if (!symbolsLower.length) return
    wsSend({
      type: 'subscribe',
      channels,
      symbols: symbolsLower,
      periods,
    })
  }

  /** Unsubscribe from symbols */
  function unsubscribe(symbolsLower: string[]): void {
    if (!symbolsLower.length) return
    wsSend({
      type: 'unsubscribe',
      channels,
      symbols: symbolsLower,
      periods,
    })
  }

  /** Request snapshot for symbols */
  function requestSnapshot(symbolsLower: string[]): void {
    if (!symbolsLower.length) return
    wsSend({ type: 'snapshot', symbols: symbolsLower, periods })
  }

  /**
   * Reconcile subscribed symbols with desired symbols.
   * Subscribes to new symbols and unsubscribes from removed ones.
   */
  function reconcileSubscriptions(wantedLower: Set<string> | string[]): void {
    if (resubTimer) return
    resubTimer = setTimeout(() => {
      resubTimer = null
      if (!ws || ws.readyState !== WebSocket.OPEN) return

      const want = wantedLower instanceof Set ? wantedLower : new Set(wantedLower)
      const toSub: string[] = []
      const toUnsub: string[] = []

      for (const s of want) {
        if (!subscribedSymbols.has(s)) toSub.push(s)
      }
      for (const s of subscribedSymbols) {
        if (!want.has(s)) toUnsub.push(s)
      }

      if (toUnsub.length) {
        unsubscribe(toUnsub)
        for (const s of toUnsub) subscribedSymbols.delete(s)
      }
      if (toSub.length) {
        subscribe(toSub)
        requestSnapshot(toSub)
        for (const s of toSub) subscribedSymbols.add(s)
      }
    }, 200)
  }

  /** Handle incoming messages */
  function handleMessage(e: MessageEvent): void {
    try {
      const msg = JSON.parse(e.data as string)

      // Handle snapshot batch
      if (msg?.type === 'snapshot' && Array.isArray(msg.items)) {
        callbacks.onSnapshot?.(msg.items)

        for (const it of msg.items) {
          const symLower = String(it.symbol || '').toLowerCase()
          if (!symLower) continue

          if (it.type === 'ticker' && Number.isFinite(Number(it.last))) {
            callbacks.onTicker?.(symLower, Number(it.last))
          } else if (it.type === 'kline') {
            const o = Number(it.open)
            const c = Number(it.close)
            const h = Number(it.high ?? 0)
            const l = Number(it.low ?? 0)
            const v = Number(it.volume ?? 0)
            if (Number.isFinite(o) && Number.isFinite(c)) {
              callbacks.onKline?.(symLower, String(it.period || ''), o, c, h, l, v)
            }
          }
        }
        return
      }

      const symLower = String(msg.symbol || '').toLowerCase()
      if (!symLower) return

      if (msg.type === 'ticker' && Number.isFinite(Number(msg.last))) {
        callbacks.onTicker?.(symLower, Number(msg.last))
        return
      }

      if (msg.type === 'kline') {
        const o = Number(msg.open)
        const c = Number(msg.close)
        const h = Number(msg.high ?? 0)
        const l = Number(msg.low ?? 0)
        const v = Number(msg.volume ?? 0)
        if (Number.isFinite(o) && Number.isFinite(c)) {
          callbacks.onKline?.(symLower, String(msg.period || ''), o, c, h, l, v)
        }
        return
      }

      if (msg.type === 'depth' || msg.type === 'orderbook') {
        callbacks.onDepth?.(symLower, msg)
        return
      }

      if (msg.type === 'bookTicker') {
        callbacks.onBookTicker?.(symLower, msg)
        return
      }
    } catch {
      // ignore parse errors
    }
  }

  /** Connect to the WebSocket server with exponential backoff */
  function connect(): void {
    if (destroyed) return
    if (ws) {
      try { ws.close() } catch { /* ignore */ }
    }

    ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      connected.value = true
      reconnectAttempt = 0 // reset backoff on successful connection
      subscribedSymbols = new Set()
      callbacks.onOpen?.()
    }

    ws.onclose = () => {
      connected.value = false
      ws = null
      callbacks.onClose?.()

      if (destroyed) return

      // Exponential backoff: 1s, 2s, 4s, 8s, ..., max 30s
      const delay = Math.min(
        initialReconnectDelay * Math.pow(2, reconnectAttempt),
        maxReconnectDelay,
      )
      reconnectAttempt++

      if (reconnectTimer) clearTimeout(reconnectTimer)
      reconnectTimer = setTimeout(connect, delay)
    }

    ws.onerror = () => {
      try { ws?.close() } catch { /* ignore */ }
    }

    ws.onmessage = handleMessage
  }

  /** Disconnect and stop reconnecting */
  function disconnect(): void {
    destroyed = true
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (resubTimer) {
      clearTimeout(resubTimer)
      resubTimer = null
    }
    if (ws) {
      try { ws.close() } catch { /* ignore */ }
      ws = null
    }
    connected.value = false
    subscribedSymbols.clear()
  }

  // Cleanup on component unmount
  onUnmounted(() => {
    disconnect()
  })

  return {
    connected,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    requestSnapshot,
    reconcileSubscriptions,
    wsSend,
  }
}
