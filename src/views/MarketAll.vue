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
import { ref, onMounted, onUnmounted } from 'vue'

/** ==================== Types ==================== */
interface Crypto {
  symbol: string
  leverage: string
  volume: string
  price: string
  change: number
}

type CachedItem = { price?: number; change?: number; volume?: string; ts?: number }
type CacheShape = Record<string, CachedItem>

/** ==================== Const ==================== */
const LS_KEY = 'cryptoSnapshot:v1'
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 menit; setel 0 kalau tak mau TTL
const PAGE_SIZE = 10

// Path icon dari /public (Vite serve di root). BASE_URL jaga-jaga kalau deploy di subpath.
const BASE = import.meta.env.BASE_URL || '/'
const ICON_FALLBACK = `${BASE}img/crypto/default.svg`

/** ==================== Utils ==================== */
function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

function toUpstreamId(sym: string) {
  const override: Record<string, string> = {
    OP: 'opusdt',
  }
  return override[sym] ?? sym.toLowerCase() + 'usdt'
}

function toUISymbol(fromUpstream: string) {
  // contoh: btcusdt -> BTC
  return fromUpstream.replace(/usdt$/i, '').toUpperCase()
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
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(inMemCache))
    } catch {}
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
// Gunakan shallowRef untuk list agar update item tidak deep-reactive mahal.
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

/** ==================== Prefill dari Cache ==================== */
function applyCacheToList(cache: CacheShape) {
  const now = Date.now()
  if (!cryptoList.value.length) return
  // clone array agar 1x commit perubahan
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
}

function updateVisibleList() {
  visibleList.value = cryptoList.value.slice(0, visibleCount.value)
}

/** ==================== Infinite Scroll ==================== */
function onScroll() {
  const bottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100
  if (bottom && !isLoadingMore.value) {
    if (visibleCount.value < cryptoList.value.length) {
      isLoadingMore.value = true
      // Simulasi loading; bisa dipercepat jika mau
      setTimeout(() => {
        visibleCount.value += PAGE_SIZE
        updateVisibleList()
        isLoadingMore.value = false
      }, 400)
    }
  }
}

/** ==================== WebSocket (dengan batching) ==================== */
let ws: WebSocket | null = null

type Tick = {
  symbol: string
  last?: number
  open?: number
  close?: number
  vol?: number
  changePct?: number
}
const tickQueue = new Map<string, Tick>()
let flushTimer: ReturnType<typeof setTimeout> | null = null

function enqueueTick(t: Tick) {
  // Keep latest per symbol
  tickQueue.set(t.symbol, { ...(tickQueue.get(t.symbol) || {}), ...t })
  if (flushTimer) return
  flushTimer = setTimeout(flushTicks, 100) // batch tiap 100ms
}

function flushTicks() {
  flushTimer = null
  if (!tickQueue.size) return

  // 1x clone array → minimal patch
  const next = cryptoList.value.slice()
  const indexBySymbol = new Map(next.map((r, i) => [r.symbol, i]))

  for (const [, t] of tickQueue) {
    const idx = indexBySymbol.get(t.symbol)
    if (idx == null) continue
    const row = next[idx]

    // last/close -> price
    const priceNum = Number.isFinite(t.last)
      ? t.last!
      : Number.isFinite(t.close)
        ? t.close!
        : undefined
    if (typeof priceNum === 'number') {
      // hanya format kalau berubah
      const newText = priceNum.toFixed(6)
      if (row.price !== newText) row.price = newText
      setCache(t.symbol, { price: priceNum })
    }

    // changePct kalau sudah dihitung
    if (typeof t.changePct === 'number') {
      if (row.change !== t.changePct) row.change = t.changePct
      setCache(t.symbol, { change: row.change })
    }

    // volume
    if (typeof t.vol === 'number') {
      const volText = t.vol.toLocaleString('en-US', { maximumFractionDigits: 2 })
      if (row.volume !== volText) row.volume = volText
      setCache(t.symbol, { volume: row.volume })
    }
  }

  tickQueue.clear()
  cryptoList.value = next
  // visibleList ikut slice ulang agar sinkron
  updateVisibleList()
}

function connectWebSockets() {
  ws = new WebSocket('wss://ledgersocketone.online')

  ws.onopen = () => {
    // Minta snapshot awal untuk semua symbol di list
    const symbols = cryptoList.value.map((r) => toUpstreamId(r.symbol))
    try {
      ws!.send(JSON.stringify({ type: 'snapshot', symbols, periods: ['1day'] }))
    } catch {}
  }

  ws.onclose = () => {
    // Reconnect sederhana
    setTimeout(connectWebSockets, 5000)
  }

  ws.onerror = (err) => console.error('[WS] Error:', err)

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data)
      // --- ticker (last price) ---
      if (msg.type === 'ticker') {
        const symUI = toUISymbol(msg.symbol)
        if (typeof msg.last === 'number') {
          enqueueTick({ symbol: symUI, last: msg.last })
        }
      }

      // --- kline 1day (untuk change & volume) ---
      if (msg.type === 'kline' && msg.period === '1min') {
        const symUI = toUISymbol(msg.symbol)
        const open = Number(msg.open)
        const close = Number(msg.close)
        const vol = Number(msg.vol)
        const changePct = Number.isFinite(open) && open !== 0 ? ((close - open) / open) * 100 : 0
        enqueueTick({
          symbol: symUI,
          close: Number.isFinite(close) ? close : undefined,
          vol: Number.isFinite(vol) ? vol : undefined,
          changePct,
        })
      }
    } catch (err) {
      console.error('WS parse error:', err)
    }
  }
}

function disconnectWebSockets() {
  if (ws) {
    try {
      ws.close()
    } catch {}
    ws = null
  }
}

/** ==================== Lifecycle ==================== */

// simpan handler di scope setup, supaya bisa di-remove saat unmounted
let visHandler: (() => void) | null = null

onMounted(() => {
  // 1) Hydrate dari cache SEDINI mungkin (kurangi frame kosong)
  const cache = loadCache()
  if (Object.keys(cache).length) applyCacheToList(cache)

  // 2) Siapkan visible list awal
  updateVisibleList()

  // 3) Prefill jika konten masih pendek
  requestAnimationFrame(() => onScroll())

  // 4) Scroll listener (passive)
  window.addEventListener('scroll', onScroll, { passive: true })

  // 5) Connect WS
  connectWebSockets()

  // 6) Flush cache saat tab disembunyikan
  if (isBrowser()) {
    visHandler = () => {
      if (document.hidden) saveCacheDebounced()
    }
    document.addEventListener('visibilitychange', visHandler, { passive: true })
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  if (visHandler) {
    document.removeEventListener('visibilitychange', visHandler)
    visHandler = null
  }
  disconnectWebSockets()
  try {
    if (isBrowser()) localStorage.setItem(LS_KEY, JSON.stringify(inMemCache))
  } catch {}
})
</script>
