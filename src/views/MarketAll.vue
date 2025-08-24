<template>
  <main class="px-4 py-4 flex-grow mb-20">
    <ul class="space-y-4">
      <RouterLink
        v-for="crypto in visibleList"
        :key="crypto.symbol"
        :to="`/trade?symbol=${crypto.symbol.toLowerCase()}usdt`"
        custom
        v-slot="{ navigate }"
      >
        <li
          class="flex justify-between items-center cursor-pointer hover:bg-gray-50 rounded-md px-3 py-2 transition-colors"
          @click="navigate"
        >
          <!-- KIRI -->
          <div class="flex items-center space-x-2">
            <img
              :src="iconPath(crypto.symbol)"
              :alt="crypto.symbol + ' icon'"
              class="w-5 h-5 rounded-full"
              width="20"
              height="20"
              @error="onIconError"
            />
            <div>
              <div class="flex items-center space-x-1">
                <span class="font-bold text-sm">{{ crypto.symbol }}</span>
                <span class="text-gray-400 text-xs select-none">/USDT</span>
                <span class="text-xs bg-gray-200 rounded px-1 select-none">
                  {{ crypto.leverage }}
                </span>
              </div>
              <div class="text-gray-400 text-xs mt-0.5 select-none">
                <!-- volume -->
                <span v-if="crypto.volume !== '-'">{{ crypto.volume }}</span>
                <span v-else class="animate-pulse">...</span>
              </div>
            </div>
          </div>

          <!-- KANAN -->
          <div class="flex items-center">
            <div class="text-right mr-3">
              <div class="font-bold text-[12px]">
                <span v-if="crypto.price !== '-'">{{ crypto.price }}</span>
                <span v-else class="animate-pulse">...</span>
              </div>
              <div class="text-gray-400 text-[10px] select-none">
                <span v-if="crypto.price !== '-'">${{ crypto.price }}</span>
                <span v-else class="animate-pulse">...</span>
              </div>
            </div>
            <div
              class="text-xs rounded-lg px-3 py-1 select-none font-semibold"
              :class="crypto.change >= 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'"
            >
              <span v-if="crypto.price !== '-'">
                {{ crypto.change >= 0 ? '+' : '' }}{{ crypto.change.toFixed(2) }}%
              </span>
              <span v-else class="animate-pulse">...</span>
            </div>
          </div>
        </li>
      </RouterLink>
    </ul>

    <!-- loading indicator ketika load more -->
    <div v-if="isLoadingMore" class="text-center py-3 text-gray-400 animate-pulse">loading...</div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

/** ==================== Types ==================== */
interface Crypto {
  symbol: string // UI symbol (BTC, ETH, ...)
  leverage: string
  volume: string
  price: string
  change: number
}

type CachedItem = { price?: number; change?: number; volume?: string; ts?: number }
type CacheShape = Record<string, CachedItem>

/** ==================== Const ==================== */
const LS_KEY = 'cryptoSnapshot:v1'
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 menit; set 0 kalau tak mau TTL
const PAGE_SIZE = 10
const WS_BASE = 'wss://ledgersocketone.online'

// Path icon dari /public (Vite serve di root). BASE_URL jaga-jaga kalau deploy di subpath.
const BASE = import.meta.env.BASE_URL || '/'
const ICON_FALLBACK = `${BASE}img/crypto/default.svg`

/** ==================== Utils ==================== */
function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

function toUpstreamId(symUI: string) {
  const override: Record<string, string> = {
    OP: 'opusdt',
  }
  return override[symUI] ?? symUI.toLowerCase() + 'usdt'
}

function toUISymbol(fromUp: string) {
  // btcusdt -> BTC
  return fromUp.replace(/usdt$/i, '').toUpperCase()
}

function iconPath(symbol: string) {
  return `${BASE}img/crypto/${symbol.toLowerCase()}.svg`
}

function onIconError(e: Event) {
  const el = e.target as HTMLImageElement | null
  if (el && el.src !== ICON_FALLBACK) el.src = ICON_FALLBACK
}

/** ==================== Cache (in-memory + localStorage) ==================== */
let inMemCache: CacheShape = {}
let saveTimer: ReturnType<typeof setTimeout> | undefined

function saveCacheDebounced() {
  if (!isBrowser()) return
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(inMemCache)) } catch {}
  }, 400)
}

function loadCache(): CacheShape {
  if (!isBrowser()) return inMemCache
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return inMemCache
    const parsed = JSON.parse(raw) as CacheShape
    if (!parsed || typeof parsed !== 'object') return inMemCache

    if (!CACHE_TTL_MS) {
      inMemCache = parsed
      return inMemCache
    }

    const now = Date.now()
    const next: CacheShape = {}
    for (const [sym, c] of Object.entries(parsed)) {
      if (!c) continue
      if (!c.ts || now - c.ts <= CACHE_TTL_MS) next[sym] = c
    }
    inMemCache = next
  } catch {
    inMemCache = {}
  }
  return inMemCache
}

function setCache(symUI: string, patch: CachedItem) {
  const cur = inMemCache[symUI] || {}
  inMemCache[symUI] = { ...cur, ...patch, ts: Date.now() }
  saveCacheDebounced()
}

/** ==================== State ==================== */
// List statis (UI)
const cryptoList = ref<Crypto[]>([
  { symbol: 'BTC', leverage: '10x', volume: '-', price: '-', change: 0 },
  { symbol: 'ETH', leverage: '10x', volume: '-', price: '-', change: 0 },
  { symbol: 'BNB', leverage: '10x', volume: '-', price: '-', change: 0 },
  { symbol: 'SOL', leverage: '10x', volume: '-', price: '-', change: 0 },
  { symbol: 'LTC', leverage: '10x', volume: '-', price: '-', change: 0 },
  { symbol: 'LINK', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'TON', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'SUI', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'XRP', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'QTUM', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'THETA', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'ADA', leverage: '10x', volume: '-', price: '-', change: 0 },
  { symbol: 'RAD', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'BAND', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'ALGO', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'POL', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'DOGE', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'LUNA', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'GALA', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'PEPE', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'CFX', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'TRX', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'TRUMP', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'SHIB', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'ARB', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'FIL', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'API3', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'ENA', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'BIO', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'UNI', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'BTT', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'SATS', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'MEME', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'GT', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'OP', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'AAVE', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'SNAKES', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'TIA', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'SOON', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'ONDO', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'NEO', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'SKL', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'MX', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'FARTCOIN', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'RATS', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'ETC', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'TRB', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'AVAX', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'BCH', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'BSV', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'IOTA', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'CYBER', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'WIF', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'CORE', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'WLD', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'SEI', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'VIRTUAL', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'RENDER', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'MOODENG', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'JUP', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'PONKE', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'MNT', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'PNUT', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'EIGEN', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'GRASS', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'RAY', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'EPIC', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'ZRO', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'BERA', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'CA', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'IP', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'KAITO', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'OMNI', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'A8', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'OBOL', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'SAGA', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'ORCA', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'SHELL', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'NAKA', leverage: '5x', volume: '-', price: '-', change: 0 },
])

const visibleCount = ref(PAGE_SIZE)
const visibleList = ref<Crypto[]>([])
const isLoadingMore = ref(false)

function updateVisibleList() {
  visibleList.value = cryptoList.value.slice(0, visibleCount.value)
  scheduleResubscribe() // sinkronkan subscription saat halaman bertambah
}

/** ==================== Prefill dari Cache ==================== */
function applyCacheToList(cache: CacheShape) {
  const now = Date.now()
  if (!cryptoList.value.length) return
  const next = cryptoList.value.slice()
  for (const row of next) {
    const c = cache[row.symbol]
    if (!c) continue
    if (CACHE_TTL_MS && c.ts && now - c.ts > CACHE_TTL_MS) continue
    if (typeof c.price === 'number') row.price = c.price.toFixed(6)
    if (typeof c.change === 'number') row.change = c.change
    if (typeof c.volume === 'string') row.volume = c.volume
  }
  cryptoList.value = next
  updateVisibleList()
}

/** ==================== Infinite Scroll ==================== */
function onScroll() {
  const bottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100
  if (bottom && !isLoadingMore.value) {
    if (visibleCount.value < cryptoList.value.length) {
      isLoadingMore.value = true
      setTimeout(() => {
        visibleCount.value += PAGE_SIZE
        updateVisibleList()
        isLoadingMore.value = false
      }, 300)
    }
  }
}

/** ==================== WebSocket (subscribe + snapshot + batching) ==================== */
let ws: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null

// set simbol yang sedang disubscribe ke server (pakai upstream id: btcusdt, ethusdt, ...)
let subscribed = new Set<string>()
let resubTimer: ReturnType<typeof setTimeout> | null = null

function currentVisibleUpstreamIds(): string[] {
  return Array.from(new Set(visibleList.value.map(r => toUpstreamId(r.symbol))))
}

function wsSend(obj: unknown) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    try { ws.send(JSON.stringify(obj)) } catch {}
  }
}

function doSubscribe(ids: string[]) {
  if (!ids.length) return
  wsSend({ type: 'subscribe', channels: ['ticker', 'kline'], symbols: ids, periods: ['1day'] })
}
function doUnsubscribe(ids: string[]) {
  if (!ids.length) return
  wsSend({ type: 'unsubscribe', channels: ['ticker', 'kline'], symbols: ids, periods: ['1day'] })
}
function requestSnapshot(ids: string[]) {
  if (!ids.length) return
  wsSend({ type: 'snapshot', symbols: ids, periods: ['1day'] })
}

function scheduleResubscribe() {
  if (resubTimer) return
  resubTimer = setTimeout(() => {
    resubTimer = null
    if (!ws || ws.readyState !== WebSocket.OPEN) return

    const want = new Set(currentVisibleUpstreamIds())
    const curr = new Set(subscribed)

    const toSub: string[] = []
    const toUnsub: string[] = []

    for (const id of want) if (!curr.has(id)) toSub.push(id)
    for (const id of curr) if (!want.has(id)) toUnsub.push(id)

    if (toUnsub.length) {
      doUnsubscribe(toUnsub)
      for (const id of toUnsub) subscribed.delete(id)
    }
    if (toSub.length) {
      doSubscribe(toSub)
      requestSnapshot(toSub)
      for (const id of toSub) subscribed.add(id)
    }
  }, 150)
}

// ---- batching render ----
type Tick = { symbol: string; last?: number; open?: number; close?: number; vol?: number; changePct?: number }
const tickQueue = new Map<string, Tick>()
let flushTimer: ReturnType<typeof setTimeout> | null = null

function enqueueTick(t: Tick) {
  tickQueue.set(t.symbol, { ...(tickQueue.get(t.symbol) || {}), ...t })
  if (flushTimer) return
  flushTimer = setTimeout(flushTicks, 100)
}

function flushTicks() {
  flushTimer = null
  if (!tickQueue.size) return

  const next = cryptoList.value.slice()
  const indexBySymbol = new Map(next.map((r, i) => [r.symbol, i]))

  for (const [, t] of tickQueue) {
    const idx = indexBySymbol.get(t.symbol)
    if (idx == null) continue
    const row = next[idx]

    // price dari ticker.last atau kline.close
    const priceNum = Number.isFinite(t.last) ? t.last! : (Number.isFinite(t.close) ? t.close! : undefined)
    if (typeof priceNum === 'number') {
      const newText = priceNum.toFixed(6)
      if (row.price !== newText) row.price = newText
      setCache(t.symbol, { price: priceNum })
    }

    // change harian dari kline 1day (open vs close)
    if (typeof t.changePct === 'number') {
      if (row.change !== t.changePct) row.change = t.changePct
      setCache(t.symbol, { change: row.change })
    }

    // volume (ambil dari kline 1day.vol bila ada)
    if (typeof t.vol === 'number') {
      const volText = t.vol.toLocaleString('en-US', { maximumFractionDigits: 2 })
      if (row.volume !== volText) row.volume = volText
      setCache(t.symbol, { volume: row.volume })
    }
  }

  tickQueue.clear()
  cryptoList.value = next
  updateVisibleList()
}

function connectWS() {
  if (ws) {
    try { ws.close() } catch {}
    ws = null
  }

  ws = new WebSocket(WS_BASE)

  ws.onopen = () => {
    subscribed = new Set()
    // subscribe untuk simbol yang terlihat sekarang + snapshot awal
    const ids = currentVisibleUpstreamIds()
    if (ids.length) {
      doSubscribe(ids)
      requestSnapshot(ids)
      for (const id of ids) subscribed.add(id)
    }
  }

  ws.onclose = () => {
    ws = null
    if (reconnectTimer) clearTimeout(reconnectTimer)
    reconnectTimer = setTimeout(connectWS, 2000)
  }

  ws.onerror = () => {
    try { ws?.close() } catch {}
  }

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data as string)

      // snapshot batched: { type: 'snapshot', items: [...] }
      if (msg?.type === 'snapshot' && Array.isArray(msg.items)) {
        for (const it of msg.items) {
          const ui = toUISymbol(String(it.symbol || ''))
          if (!ui) continue
          if (it.type === 'ticker' && Number.isFinite(Number(it.last))) {
            enqueueTick({ symbol: ui, last: Number(it.last) })
          } else if (it.type === 'kline' && it.period === '1day') {
            const open = Number(it.open)
            const close = Number(it.close)
            const vol = Number(it.vol)
            const changePct = Number.isFinite(open) && open !== 0 ? ((close - open) / open) * 100 : 0
            enqueueTick({
              symbol: ui,
              close: Number.isFinite(close) ? close : undefined,
              vol: Number.isFinite(vol) ? vol : undefined,
              changePct,
            })
          }
        }
        return
      }

      // event individual
      if (msg.type === 'ticker') {
        const ui = toUISymbol(String(msg.symbol || ''))
        if (ui && typeof msg.last === 'number') enqueueTick({ symbol: ui, last: msg.last })
        return
      }

      if (msg.type === 'kline' && msg.period === '1day') {
        const ui = toUISymbol(String(msg.symbol || ''))
        if (!ui) return
        const open = Number(msg.open)
        const close = Number(msg.close)
        const vol = Number(msg.vol)
        const changePct = Number.isFinite(open) && open !== 0 ? ((close - open) / open) * 100 : 0
        enqueueTick({
          symbol: ui,
          close: Number.isFinite(close) ? close : undefined,
          vol: Number.isFinite(vol) ? vol : undefined,
          changePct,
        })
        return
      }
      // depth diabaikan di komponen ini
    } catch (err) {
      console.error('WS parse error:', err)
    }
  }
}

function disconnectWS() {
  if (ws) {
    try {
      // Unsubscribe semua sebelum tutup (opsional)
      const ids = Array.from(subscribed)
      if (ids.length) doUnsubscribe(ids)
      ws.close()
    } catch {}
    ws = null
    subscribed.clear()
  }
}

/** ==================== Lifecycle ==================== */
function onVisibilityChange() {
  if (document.hidden) saveCacheDebounced()
}

// simpan handler supaya bisa dilepas
let visHandler: (() => void) | null = null

onMounted(() => {
  // Hydrate dari cache sedini mungkin
  const cache = loadCache()
  if (Object.keys(cache).length) applyCacheToList(cache)
  else updateVisibleList()

  // Prefill jika konten masih pendek
  requestAnimationFrame(() => onScroll())

  // Scroll listener (passive)
  window.addEventListener('scroll', onScroll, { passive: true })

  // Connect WS
  connectWS()

  // Visibility
  if (isBrowser()) {
    visHandler = onVisibilityChange
    document.addEventListener('visibilitychange', visHandler, { passive: true })
  }
})

// resubscribe saat jumlah visible berubah
watch(visibleCount, () => updateVisibleList())

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  if (visHandler) {
    document.removeEventListener('visibilitychange', visHandler)
    visHandler = null
  }
  disconnectWS()
  try {
    if (isBrowser()) localStorage.setItem(LS_KEY, JSON.stringify(inMemCache))
  } catch {}
})
</script>
