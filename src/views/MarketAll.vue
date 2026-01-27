<template>
  <main class="relative -top-6 px-4 py-4 flex-grow mb-20">
    <!-- Filter -->
    <teleport to="body">
      <div class="fixed top-30 left-1/2 -translate-x-1/2 z-50 w-full max-w-md bg-white">
        <div class="w-full px-4 py-2 pt-[env(safe-area-inset-top)]">
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm border transition-colors"
                :class="
                  activeFilter === 'gainers'
                    ? 'bg-green-50 border-green-400 text-green-700'
                    : 'bg-white border-gray-200 text-gray-700'
                "
                @click="setFilter('gainers')"
              >
                <Icon icon="tabler:trending-up" class="w-4 h-4" />
                Gainers
              </button>

              <button
                type="button"
                class="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm border transition-colors"
                :class="
                  activeFilter === 'losers'
                    ? 'bg-red-50 border-red-400 text-red-700'
                    : 'bg-white border-gray-200 text-gray-700'
                "
                @click="setFilter('losers')"
              >
                <Icon icon="tabler:trending-down" class="w-4 h-4" />
                Losers
              </button>

              <button
                type="button"
                class="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm border transition-colors ml-auto"
                :class="
                  activeFilter === 'all'
                    ? 'bg-gray-50 border-gray-300 text-gray-800'
                    : 'bg-white border-gray-200 text-gray-700'
                "
                @click="setFilter('all')"
              >
                <Icon icon="tabler:list" class="w-4 h-4" />
                All
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>

    <ul class="space-y-4 mt-10">
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
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Icon } from '@iconify/vue'

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
const WS_BASE = 'wss://ws.hyper-led.com'
const API_BASE = 'https://tech.oneled.io/api'

// auto-refresh daftar coin simulasi (biar admin tambah coin langsung muncul)
const SYNTH_REFRESH_MS = 3 * 60 * 1000 // 3 menit
const SIM_LEVERAGE_LABEL = 'SIM'

// Path icon dari /public (Vite serve di root).
const BASE = import.meta.env.BASE_URL || '/'
const ICON_FALLBACK = `${BASE}img/crypto/default.svg`

/** ==================== Utils ==================== */
function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}
function toUpstreamId(symUI: string) {
  const override: Record<string, string> = { OP: 'opusdt' }
  return override[symUI] ?? symUI.toLowerCase() + 'usdt'
}
function toUISymbol(fromUp: string) {
  return fromUp.replace(/usdt$/i, '').toUpperCase()
}
function iconPath(symbol: string) {
  return `${BASE}img/crypto/${symbol.toLowerCase()}.svg`
}
function onIconError(e: Event) {
  const el = e.target as HTMLImageElement | null
  if (el && el.src !== ICON_FALLBACK) el.src = ICON_FALLBACK
}

function formatPrice(nu: number): string {
  if (!Number.isFinite(nu)) return '-'
  const digits = nu >= 1 ? 2 : 6
  // International format: 1,234.56 (comma thousands, dot decimals)
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(nu)
}

/** ==================== Synthetic pairs (backend) ==================== */
const syntheticSymbols = ref<Set<string>>(new Set())
let synthRefreshTimer: ReturnType<typeof setInterval> | null = null

function pairToUiSymbol(pair: string): string {
  const s = String(pair || '').trim().toUpperCase()
  if (!s) return ''
  if (s.endsWith('/USDT')) return s.slice(0, -5)
  if (s.endsWith('USDT')) return s.slice(0, -4)
  return ''
}
function isSyntheticSymbol(symUI: string): boolean {
  return syntheticSymbols.value.has(String(symUI || '').toUpperCase())
}

async function loadSyntheticPairsAndMergeList() {
  try {
    const res = await fetch(`${API_BASE}/sim/market/pairs`, { method: 'GET' })
    if (!res.ok) return
    const json = await res.json()
    const pairs = Array.isArray(json?.pairs) ? (json.pairs as unknown[]) : []
    const syms = pairs
      .map((p) => pairToUiSymbol(String(p || '')))
      .filter((s) => s)

    syntheticSymbols.value = new Set(syms)

    // Remove synthetic rows that were removed/disabled in admin (only those we labeled as SIM).
    cryptoList.value = cryptoList.value.filter((r) => {
      if (String(r.leverage || '').toUpperCase() !== SIM_LEVERAGE_LABEL) return true
      return syntheticSymbols.value.has(String(r.symbol || '').toUpperCase())
    })

    if (!syms.length) return
    const existing = new Set(cryptoList.value.map((r) => r.symbol.toUpperCase()))
    const toAdd: Crypto[] = []
    for (const s of syms) {
      if (existing.has(s)) continue
      toAdd.push({ symbol: s, leverage: SIM_LEVERAGE_LABEL, volume: '-', price: '-', change: 0 })
    }
    if (toAdd.length) {
      cryptoList.value = [...cryptoList.value, ...toAdd]
    }
  } catch {
    // ignore
  }
}

async function refreshSyntheticPairs() {
  await loadSyntheticPairsAndMergeList()
  updateVisibleList()
  scheduleResubscribe()
  startSimPolling()
}

function startSyntheticPairsAutoRefresh() {
  if (!isBrowser()) return
  stopSyntheticPairsAutoRefresh()
  synthRefreshTimer = setInterval(() => {
    void refreshSyntheticPairs()
  }, SYNTH_REFRESH_MS)
}

function stopSyntheticPairsAutoRefresh() {
  if (synthRefreshTimer) {
    clearInterval(synthRefreshTimer)
    synthRefreshTimer = null
  }
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

// Filter (tanpa search)
type FilterType = 'all' | 'gainers' | 'losers'
const activeFilter = ref<FilterType>('all')

// Seluruh list terlihat (tanpa paging)
const visibleList = ref<Crypto[]>([])

const filteredCryptoList = computed(() => {
  let list = cryptoList.value
  if (activeFilter.value === 'gainers') {
    list = list.filter((r) => typeof r.change === 'number' && r.change > 0)
  } else if (activeFilter.value === 'losers') {
    list = list.filter((r) => typeof r.change === 'number' && r.change < 0)
  }
  return list
})

function updateVisibleList() {
  // tampilkan semua tanpa slice
  visibleList.value = filteredCryptoList.value
  scheduleResubscribe()
}

function setFilter(val: FilterType) {
  if (activeFilter.value === val) return
  activeFilter.value = val
}

// reset tampilan saat filter berubah
watch(activeFilter, () => {
  updateVisibleList()
})

/** ==================== WebSocket (subscribe + snapshot + batching) ==================== */
let ws: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null

let subscribed = new Set<string>()
let resubTimer: ReturnType<typeof setTimeout> | null = null

function currentVisibleUpstreamIds(): string[] {
  return Array.from(
    new Set(
      visibleList.value
        .map((r) => r.symbol)
        .filter((s) => !isSyntheticSymbol(s))
        .map((s) => toUpstreamId(s)),
    ),
  )
}
function wsSend(obj: unknown) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    try {
      ws.send(JSON.stringify(obj))
    } catch {}
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
    const priceNum = Number.isFinite(t.last)
      ? t.last!
      : Number.isFinite(t.close)
        ? t.close!
        : undefined
    if (typeof priceNum === 'number') {
      const newText = formatPrice(priceNum)
      if (row.price !== newText) row.price = newText
      setCache(t.symbol, { price: priceNum })
    }
    if (typeof t.changePct === 'number') {
      if (row.change !== t.changePct) row.change = t.changePct
      setCache(t.symbol, { change: row.change })
    }
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
    try {
      ws.close()
    } catch {}
    ws = null
  }
  ws = new WebSocket(WS_BASE)
  ws.onopen = () => {
    subscribed = new Set()
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
    try {
      ws?.close()
    } catch {}
  }
  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data as string)
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
            const changePct =
              Number.isFinite(open) && open !== 0 ? ((close - open) / open) * 100 : 0
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
    } catch (err) {
      console.error('WS parse error:', err)
    }
  }
}

function disconnectWS() {
  if (ws) {
    try {
      const ids = Array.from(subscribed)
      if (ids.length) doUnsubscribe(ids)
      ws.close()
    } catch {}
    ws = null
    subscribed.clear()
  }
}

/** ==================== Synthetic polling (sim market) ==================== */
type SimSnapshot = {
  ts: number
  lastPrice: number
  kline: Array<{ ts: number; open: number; close: number; vol: number }>
}

let simPollTimer: ReturnType<typeof setInterval> | null = null
let simInFlight = false
const SIM_POLL_MS = 1200
const SIM_VISIBLE_LIMIT = 20

function currentVisibleSyntheticSymbols(): string[] {
  const syms = visibleList.value
    .map((r) => r.symbol)
    .filter((s) => isSyntheticSymbol(s))
  return Array.from(new Set(syms)).slice(0, SIM_VISIBLE_LIMIT)
}

async function fetchSimSnapshot(symUI: string) {
  const symbolPair = `${String(symUI || '').toUpperCase()}/USDT`
  const url = new URL(`${API_BASE}/sim/market/snapshot`)
  url.searchParams.set('symbol', symbolPair)
  url.searchParams.set('period', '1day')
  url.searchParams.set('limit', '2')
  url.searchParams.set('depth', '5')
  const res = await fetch(url.toString(), { method: 'GET' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return (await res.json()) as SimSnapshot
}

async function pollSimOnce() {
  if (simInFlight) return
  const list = currentVisibleSyntheticSymbols()
  if (!list.length) return
  simInFlight = true
  try {
    for (const symUI of list) {
      try {
        const snap = await fetchSimSnapshot(symUI)
        const lastPrice = Number(snap?.lastPrice)

        let changePct = 0
        let vol: number | undefined
        const lastCandle = Array.isArray(snap?.kline) && snap.kline.length ? snap.kline[snap.kline.length - 1] : null
        if (lastCandle) {
          const open = Number((lastCandle as any).open)
          const close = Number((lastCandle as any).close)
          vol = Number((lastCandle as any).vol)
          if (Number.isFinite(open) && open !== 0 && Number.isFinite(close)) {
            changePct = ((close - open) / open) * 100
          }
        }

        if (Number.isFinite(lastPrice)) {
          enqueueTick({ symbol: symUI.toUpperCase(), last: lastPrice, vol, changePct })
        }
      } catch {
        // ignore single symbol failure
      }
    }
  } finally {
    simInFlight = false
  }
}

function startSimPolling() {
  if (!isBrowser()) return
  stopSimPolling()
  void pollSimOnce()
  simPollTimer = setInterval(() => {
    void pollSimOnce()
  }, SIM_POLL_MS)
}

function stopSimPolling() {
  if (simPollTimer) {
    clearInterval(simPollTimer)
    simPollTimer = null
  }
  simInFlight = false
}

/** ==================== Lifecycle ==================== */
function onVisibilityChange() {
  if (document.hidden) saveCacheDebounced()
}
let visHandler: (() => void) | null = null

onMounted(() => {
  const cache = loadCache()
  if (Object.keys(cache).length) applyCacheToList(cache)
  else updateVisibleList()

  void loadSyntheticPairsAndMergeList().finally(() => {
    // refresh visible list (and resubscribe real WS without synthetic)
    updateVisibleList()
    connectWS()
    startSimPolling()
    startSyntheticPairsAutoRefresh()
  })

  if (isBrowser()) {
    visHandler = onVisibilityChange
    document.addEventListener('visibilitychange', visHandler, { passive: true })
  }
})

onUnmounted(() => {
  if (visHandler) {
    document.removeEventListener('visibilitychange', visHandler)
    visHandler = null
  }
  disconnectWS()
  stopSimPolling()
  stopSyntheticPairsAutoRefresh()
  try {
    if (isBrowser()) localStorage.setItem(LS_KEY, JSON.stringify(inMemCache))
  } catch {}
})

/** ==================== Prefill dari Cache ==================== */
function applyCacheToList(cache: CacheShape) {
  const now = Date.now()
  if (!cryptoList.value.length) return
  const next = cryptoList.value.slice()
  for (const row of next) {
    const c = cache[row.symbol]
    if (!c) continue
    if (CACHE_TTL_MS && c.ts && now - c.ts > CACHE_TTL_MS) continue
    if (typeof c.price === 'number') row.price = formatPrice(c.price)
    if (typeof c.change === 'number') row.change = c.change
    if (typeof c.volume === 'string') row.volume = c.volume
  }
  cryptoList.value = next
  updateVisibleList()
}
</script>
