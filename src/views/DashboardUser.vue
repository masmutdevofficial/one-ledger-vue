<template>
  <div>
    <!-- Section: Total Value Summary -->
    <section class="bg-white mb-6 px-4 mt-2">
      <div class="flex flex-row justify-between items-center">
        <div class="flex flex-col">
          <div class="flex items-center space-x-1 text-gray-700 text-sm font-normal mb-1">
            <span>Est. Total Value</span>
            <Icon icon="tabler:eye" class="w-4 h-4" />
          </div>

          <div class="flex items-baseline space-x-1 font-semibold text-3xl text-black mb-1">
            <span>
              {{
                totalValue !== null
                  ? totalValue.toLocaleString('id-ID', { minimumFractionDigits: 2 })
                  : '...'
              }}
            </span>
            <span class="text-base font-normal">USDT</span>
            <Icon icon="tabler:chevron-down" class="text-base w-4 h-4" />
          </div>

          <div class="text-gray-400 text-sm mb-2">
            ≈ ${{
              totalValue !== null
                ? totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })
                : '...'
            }}
          </div>
        </div>

        <RouterLink to="/add-funds"
          class="bg-teal-500 flex justify-center items-center active:bg-teal-600 text-white rounded-md px-6 py-2 text-[10px] font-normal transition-colors w-[100px] text-center">
          Add Funds
        </RouterLink>
      </div>
      <div class="text-xs flex items-center text-black mb-4">
        Unrealized PnL
        <span class="font-semibold ml-1" :class="portfolioUpnlAbs >= 0 ? 'text-[#3ABBA3]' : 'text-red-500'">
          {{ signedMoneyId(portfolioUpnlAbs, 2) }}
          ({{ signedPercent(portfolioUpnlPct) }})
        </span>
        <Icon icon="tabler:chevron-right" class="ml-1 text-gray-400 w-4 h-4" />
      </div>
      <div class="grid grid-cols-4 gap-x-6 gap-y-6 mt-5">
        <RouterLink v-for="item in items" :key="item.to" :to="item.to" class="group flex flex-col items-center"
          aria-label="item.label">
          <div
            class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shadow-sm ring-1 ring-gray-200/60 hover:ring-gray-300 transition group-active:scale-95">
            <img :src="item.img" :alt="item.label" class="w-7 h-7 object-contain" />
          </div>
          <span class="mt-2 text-xs text-gray-700 text-center font-semibold">{{ item.label }}</span>
        </RouterLink>
      </div>
    </section>

    <!-- Section: Traders League and Market Table -->
    <section class="w-full bg-[#f0f7fc] rounded-2xl p-5 drop-shadow-md">
      <!-- Top Banner -->
      <SliderDashboard />

      <!-- Market Table -->
      <div class="bg-white rounded-2xl p-5 space-y-6">
        <!-- Tabs -->
        <div class="flex space-x-6 text-[13px] font-semibold text-[#6b7280]">
          <button class="text-black font-bold">Crypto</button>
          <router-link to="/futures">
            <button>Futures</button>
          </router-link>
        </div>

        <!-- Table Header -->
        <div class="grid grid-cols-[1fr_1fr_1fr] text-[12px] text-[#9ca3af] font-normal">
          <div>Name</div>
          <div class="text-right">Last Price</div>
          <div class="text-right">24h chg%</div>
        </div>

        <div class="space-y-4">
          <RouterLink :to="`/trade?symbol=${item.name.toLowerCase()}usdt`"
            class="grid grid-cols-[1fr_1fr_1fr] items-center hover:bg-gray-50 transition-colors duration-150 rounded-lg px-2 py-1"
            v-for="item in filteredMarketData" :key="item.name">
            <div class="flex items-center space-x-1 font-semibold text-[14px] text-black">
              <img :src="item.icon" :alt="item.name + ' icon'" class="w-3.5 h-3.5" width="14" height="14"
                @error="item.icon = ICON_FALLBACK" />
              <span>{{ item.name }}</span>
            </div>
            <div class="text-right">
              <div class="font-bold text-[16px] leading-none">
                {{ item.price !== null ? item.price : '...' }}
              </div>
              <div class="text-[12px] text-[#9ca3af] mt-0.5">
                {{ item.price !== null ? '$' + item.price : '...' }}
              </div>
            </div>
            <div class="text-right">
              <button :class="[
                'text-white text-[12px] font-semibold rounded-md px-3 py-1 ml-auto inline-block',
                item.change === null
                  ? 'bg-slate-500'
                  : item.change > 0
                    ? 'bg-green-500'
                    : item.change < 0
                      ? 'bg-red-500'
                      : 'bg-slate-500',
              ]">
                {{
                  item.change === null
                    ? '...'
                    : (item.change > 0 ? '+' : item.change < 0 ? '-' : '') + Math.abs(item.change).toFixed(2) + '%' }}
                  </button>
            </div>
          </RouterLink>
        </div>

        <!-- View More -->
        <RouterLink to="/market"
          class="block text-center text-[12px] text-[#9ca3af] font-normal cursor-pointer select-none hover:underline">
          View more
        </RouterLink>
      </div>
    </section>

    <!-- News -->
    <section class="w-full bg-[#f0f7fc] rounded-2xl p-5 pt-0 mt-0 drop-shadow-md pb-20 space-y-4">
      <div v-if="loading" class="text-center text-sm text-gray-500 py-10">Loading...</div>

      <div v-else-if="newsList.length === 0" class="text-center text-sm text-gray-500 py-10">
        No Data Available
      </div>

      <div v-else v-for="(news, index) in newsList" :key="index"
        class="bg-white rounded-2xl p-5 flex flex-col space-y-3 hover:bg-gray-50 transition-colors duration-150">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-1 text-gray-900 font-semibold text-sm">
            <span class="text-[10px] leading-none">•</span>
            <span>{{ news.date }}</span>
          </div>
          <div class="font-extrabold text-sm text-black">News</div>
        </div>

        <div class="text-gray-400 text-xs font-normal select-none">
          {{ news.time }}
        </div>

        <div class="flex items-start space-x-4">
          <img v-if="news && news.image" :src="`https://one-ledger.masmutpanel.my.id${news.image}`" alt="News Image"
            class="w-24 h-16 object-cover rounded-lg" />
          <div class="flex-1 space-y-1">
            <div class="font-extrabold text-black text-sm leading-[1.1]">
              {{ news.title }}
            </div>
            <div class="text-xs text-gray-500">
              {{ truncate(news.content, 25) }}
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <RouterLink :to="`/news/${news.slug}`" class="text-[#3ABBA3] text-xs font-semibold hover:underline">
            Read more
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useApiAlertStore } from '@/stores/apiAlert'
import SliderDashboard from '@/components/dashboard/SliderDashboard.vue'
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { Icon } from '@iconify/vue'

/** ===== Konstanta ===== */
const API_BASE = 'https://one-ledger.masmutpanel.my.id/api'
const WS_BASE = 'wss://ledgersocketone.online'
const ICON_FALLBACK = '/img/crypto/_default.svg'
const iconPath = (s: string) => `/img/crypto/${s.toLowerCase()}.svg`
const isBrowser = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined'

/** ===== Menu ===== */
interface MenuItem { label: string; to: string; img: string }
const items: MenuItem[] = [
  { label: 'Arbitrage', to: '/smart-arbitrage', img: '/img/robot-logo.png' },
  { label: 'Hub reward', to: '/hub-rewards', img: '/img/newmenu/hub-reward.png' },
  { label: 'Megadrop', to: '/megadrop', img: '/img/newmenu/megadrop.png' },
  { label: 'LaunchPool', to: '/launchpool', img: '/img/newmenu/launchpool.png' },
  { label: 'Event', to: '/event', img: '/img/newmenu/event.png' },
  { label: 'More', to: '/account', img: '/img/newmenu/more.png' },
]

/** ===== Cache Dashboard ===== */
type PriceEntry = { p: number; ts: number }
type OpenEntry = { o: number; ts: number }
type PosMini = { symbol: string; qty: number; avgCost: number }
type DashCache = {
  saldo?: { v: number; ts: number }
  positions?: { items: PosMini[]; ts: number }
  prices?: Record<string, PriceEntry>
  dayOpen?: Record<string, OpenEntry>
}
const DASH_LS_KEY = 'dashCache:v1'
const SALDO_TTL = 15_000
const POS_TTL = 5 * 60_000
const PRICE_TTL = 2 * 60_000
const OPEN_TTL = 60 * 60_000

let dcache: DashCache = { prices: {}, dayOpen: {} }
let saveTimer: ReturnType<typeof setTimeout> | null = null

function loadDashCache() {
  if (!isBrowser()) return
  try {
    const raw = localStorage.getItem(DASH_LS_KEY)
    dcache = raw ? (JSON.parse(raw) as DashCache) : { prices: {}, dayOpen: {} }
    dcache.prices ||= {}
    dcache.dayOpen ||= {}
  } catch {
    dcache = { prices: {}, dayOpen: {} }
  }
}
function saveDashCacheDebounced() {
  if (!isBrowser()) return
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = window.setTimeout(() => {
    try { localStorage.setItem(DASH_LS_KEY, JSON.stringify(dcache)) } catch { }
    saveTimer = null
  }, 250)
}
function upsertSaldoCache(v: number) { dcache.saldo = { v, ts: Date.now() }; saveDashCacheDebounced() }
function upsertPositionsCache(items: PosMini[]) { dcache.positions = { items, ts: Date.now() }; saveDashCacheDebounced() }
function upsertPriceCache(symLower: string, price: number) { (dcache.prices ||= {})[symLower] = { p: price, ts: Date.now() }; saveDashCacheDebounced() }
function upsertOpenCache(symLower: string, open: number) { (dcache.dayOpen ||= {})[symLower] = { o: open, ts: Date.now() }; saveDashCacheDebounced() }

/** Hydrate UI dari cache */
function hydrateFromCache() {
  const now = Date.now()

  if (dcache.saldo && now - dcache.saldo.ts <= SALDO_TTL) saldo.value = Number(dcache.saldo.v) || 0

  if (dcache.positions && now - dcache.positions.ts <= POS_TTL) {
    positions.value = dcache.positions.items.map((it) => ({
      symbol: it.symbol,
      qty: it.qty,
      avg_cost: it.avgCost,
    }))
  }

  if (dcache.prices) {
    for (const [k, v] of Object.entries(dcache.prices)) {
      if (now - v.ts <= PRICE_TTL) priceMap[k.toUpperCase()] = v.p
    }
  }

  if (dcache.dayOpen) {
    for (const coin of displayedCoins) {
      const lower = symbolMap[coin] + 'usdt'
      const openRec = dcache.dayOpen[lower]
      const last = priceMap[lower.toUpperCase()]
      if (openRec && now - openRec.ts <= OPEN_TTL && Number.isFinite(last)) {
        const row = marketData.value.find((x) => x.name === coin)
        if (row) {
          row.price = last
          row.change = openRec.o ? ((last - openRec.o) / openRec.o) * 100 : null
        }
      }
    }
  }

  recomputeTotals()
}

/** ===== Summary (saldo & PnL) ===== */
const saldo = ref<number | null>(null)
const totalValue = ref<number | null>(null)
const portfolioUpnlAbs = ref<number>(0)
const portfolioUpnlPct = ref<number>(0)

/** ===== Positions ===== */
type PositionRow = { symbol: string; qty: string | number; avg_cost: string | number }
const positions = ref<PositionRow[]>([])
const priceMap = reactive<Record<string, number>>({}) // { BTCUSDT: price }

/** ===== Market small table (top coins) ===== */
interface MarketItem { name: string; price: number | null; change: number | null; icon: string }
const displayedCoins = ['BNB', 'BTC', 'ETH', 'SOL', 'XRP'] as const
const symbolMap: Record<string, string> = { BNB: 'bnb', BTC: 'btc', ETH: 'eth', SOL: 'sol', XRP: 'xrp' }
const marketData = ref<MarketItem[]>(
  displayedCoins.map((c) => ({ name: c, price: null, change: null, icon: iconPath(c) })),
)

/** ===== Helpers ===== */
const nfIdCache = new Map<string, Intl.NumberFormat>()
const nfId = (min: number, max: number) => {
  const key = `${min}-${max}`
  if (!nfIdCache.has(key)) nfIdCache.set(key, new Intl.NumberFormat('id-ID', { minimumFractionDigits: min, maximumFractionDigits: max }))
  return nfIdCache.get(key)!
}
const n = (v: unknown, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d)
const formatNumberId = (nu: number, digits = 2) => Number.isFinite(nu) ? nfId(digits, digits).format(nu) : '0'
const moneyId = (nu: number, digits = 2) => `$${formatNumberId(nu, digits)}`
const signedPercent = (pct: number) => (pct >= 0 ? '+' : '') + (Number.isFinite(pct) ? pct.toFixed(2) : '0.00') + '%'
const signedMoneyId = (nu: number, digits = 2) => (nu >= 0 ? '+' : '-') + moneyId(Math.abs(nu), digits)
const truncate = (text: string, limit: number): string => text.length > limit ? text.substring(0, limit) + '...' : text

/** ===== Totals ===== */
let totalsScheduled = false
function recomputeTotals() {
  if (totalsScheduled) return
  totalsScheduled = true
  requestAnimationFrame(() => {
    let sumValue = 0, sumUpnl = 0, sumCost = 0
    for (const p of positions.value) {
      const sym = String(p.symbol).toUpperCase()
      const last = n(priceMap[sym], 0)
      const qty = n(p.qty, 0)
      const avg = n(p.avg_cost, 0)
      sumValue += qty * last
      sumUpnl += (last - avg) * qty
      sumCost += avg * qty
    }
    portfolioUpnlAbs.value = sumUpnl
    portfolioUpnlPct.value = sumCost > 0 ? (sumUpnl / sumCost) * 100 : 0
    totalValue.value = (saldo.value ?? 0) + sumValue
    totalsScheduled = false
  })
}

/** ===== Loader (API, wajib Bearer) ===== */
async function loadSaldo() {
  const token = isBrowser() ? localStorage.getItem('token') : ''
  if (!token) { saldo.value = 0; return }
  const res = await fetch(`${API_BASE}/saldo`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    credentials: 'include',
  })
  const data = await res.json().catch(() => ({}))
  const val = res.ok && data?.status === 'success' ? n(data.saldo, 0) : 0
  saldo.value = val
  upsertSaldoCache(val)
}
async function loadPositions() {
  const token = isBrowser() ? localStorage.getItem('token') : ''
  if (!token) { positions.value = []; upsertPositionsCache([]); return }
  const res = await fetch(`${API_BASE}/positions-all`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    credentials: 'include',
  })
  const rows: PositionRow[] = res.ok ? await res.json().catch(() => []) : []
  const filtered = rows.filter((r) => n(r.qty, 0) > 0)
  positions.value = filtered
  const mini: PosMini[] = filtered.map((r) => ({ symbol: String(r.symbol).toUpperCase(), qty: n(r.qty, 0), avgCost: n(r.avg_cost, 0) }))
  upsertPositionsCache(mini)
}

/** ===== WS (routing per-klien, on-demand subscribe) ===== */
let activeLower = new Set<string>()
function rebuildActiveLower() {
  const s = new Set<string>()
  for (const p of positions.value) s.add(String(p.symbol).toLowerCase())
  for (const c of displayedCoins) s.add(symbolMap[c] + 'usdt')
  activeLower = s
}
watch(positions, () => { rebuildActiveLower(); scheduleResubscribe() }, { deep: true })

// buffer update
const pendingPrice: Record<string, number> = {}             // 'BTCUSDT' -> last
const pendingKlineClose: Record<string, number> = {}        // 'BTCUSDT' -> close(1d)
let flushTimer: ReturnType<typeof setTimeout> | null = null

function scheduleFlush() {
  if (flushTimer) return
  flushTimer = window.setTimeout(() => {
    const touched: string[] = []

    for (const [symUp, px] of Object.entries(pendingPrice)) {
      if (priceMap[symUp] !== px) { priceMap[symUp] = px; touched.push(symUp) }
      delete pendingPrice[symUp]
    }
    for (const [symUp, close] of Object.entries(pendingKlineClose)) {
      if (priceMap[symUp] !== close) { priceMap[symUp] = close; touched.push(symUp) }
      delete pendingKlineClose[symUp]
    }

    for (const symUp of touched) upsertPriceCache(symUp.toLowerCase(), priceMap[symUp])
    if (touched.length) recomputeTotals()

    for (const item of marketData.value) {
      const upper = (symbolMap[item.name] + 'usdt').toUpperCase()
      const last = priceMap[upper]
      if (last !== undefined) item.price = Number(last)
    }

    flushTimer = null
  }, 300)
}

let wsAgg: WebSocket | null = null
let wsTimer: ReturnType<typeof setTimeout> | null = null

/** kline 1d open/close untuk %change harian */
const dayOpen: Record<string, number> = {} // 'BTCUSDT' -> open

function handleKline1d(symLower: string, open: number, close: number) {
  const symUp = symLower.toUpperCase()
  dayOpen[symUp] = open
  pendingKlineClose[symUp] = close
  upsertOpenCache(symLower, open)
  upsertPriceCache(symLower, close)

  const coin = displayedCoins.find((c) => symbolMap[c] + 'usdt' === symLower)
  if (coin && open) {
    const row = marketData.value.find((x) => x.name === coin)
    if (row) {
      row.price = close
      row.change = ((close - open) / open) * 100
    }
  }
  scheduleFlush()
}

function handleTicker(symLower: string, last: number) {
  const symUp = symLower.toUpperCase()
  pendingPrice[symUp] = last
  upsertPriceCache(symLower, last)
  scheduleFlush()
}

/** ===== Subscribe Helpers ===== */
const KLINE_PERIODS = ['1day'] as const
let subscribedLower = new Set<string>()
let resubTimer: ReturnType<typeof setTimeout> | null = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function wsSend(obj: any) {
  if (wsAgg && wsAgg.readyState === WebSocket.OPEN) {
    try { wsAgg.send(JSON.stringify(obj)) } catch { }
  }
}
function doSubscribe(symbolsLower: string[]) {
  if (!symbolsLower.length) return
  wsSend({ type: 'subscribe', channels: ['ticker', 'kline'], symbols: symbolsLower, periods: KLINE_PERIODS })
}
function doUnsubscribe(symbolsLower: string[]) {
  if (!symbolsLower.length) return
  wsSend({ type: 'unsubscribe', channels: ['ticker', 'kline'], symbols: symbolsLower, periods: KLINE_PERIODS })
}
function requestSnapshot(symbolsLower: string[]) {
  if (!symbolsLower.length) return
  wsSend({ type: 'snapshot', symbols: symbolsLower, periods: KLINE_PERIODS })
}
function scheduleResubscribe() {
  if (resubTimer) return
  resubTimer = window.setTimeout(() => {
    resubTimer = null
    if (!wsAgg || wsAgg.readyState !== WebSocket.OPEN) return

    const want = new Set(activeLower)
    const current = new Set(subscribedLower)

    const toSub: string[] = []
    const toUnsub: string[] = []

    for (const s of want) if (!current.has(s)) toSub.push(s)
    for (const s of current) if (!want.has(s)) toUnsub.push(s)

    if (toUnsub.length) { doUnsubscribe(toUnsub); for (const s of toUnsub) subscribedLower.delete(s) }
    if (toSub.length) { doSubscribe(toSub); requestSnapshot(toSub); for (const s of toSub) subscribedLower.add(s) }
  }, 200)
}

/** ===== Connect WS ===== */
function connectAggregator() {
  if (wsAgg) { try { wsAgg.close() } catch { } }
  wsAgg = new WebSocket(WS_BASE)

  wsAgg.onopen = () => {
    // initial subscribe + snapshot
    subscribedLower = new Set()
    scheduleResubscribe()
  }

  wsAgg.onclose = () => {
    wsAgg = null
    if (wsTimer) clearTimeout(wsTimer)
    wsTimer = window.setTimeout(connectAggregator, 2000)
  }

  wsAgg.onerror = () => {
    try { wsAgg?.close() } catch { }
  }

  wsAgg.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data as string)

      // snapshot batched
      if (msg?.type === 'snapshot' && Array.isArray(msg.items)) {
        for (const it of msg.items) {
          const symLower = String(it.symbol || '').toLowerCase()
          if (!symLower || !activeLower.has(symLower)) continue
          if (it.type === 'ticker' && Number.isFinite(Number(it.last))) {
            handleTicker(symLower, Number(it.last))
          } else if (it.type === 'kline' && it.period === '1day') {
            const o = Number(it.open), c = Number(it.close)
            if (Number.isFinite(o) && Number.isFinite(c)) handleKline1d(symLower, o, c)
          }
        }
        return
      }

      const symLower = String(msg.symbol || '').toLowerCase()
      if (!symLower || !activeLower.has(symLower)) return

      if (msg.type === 'ticker' && Number.isFinite(Number(msg.last))) {
        handleTicker(symLower, Number(msg.last))
        return
      }
      if (msg.type === 'kline' && msg.period === '1day') {
        const open = Number(msg.open), close = Number(msg.close)
        if (Number.isFinite(open) && Number.isFinite(close)) handleKline1d(symLower, open, close)
        return
      }
      // depth diabaikan untuk komponen ini
    } catch { /* ignore */ }
  }
}

/** ===== News ===== */
interface ApiNewsItem { id: number; title: string; slug: string; content: string; image: string; published_at: string }
interface NewsItem extends ApiNewsItem { date: string; time: string }
const newsList = ref<NewsItem[]>([])
const loading = ref(true)
const modal = useApiAlertStore()

/** ===== Infinite Scroll (news) ===== */
const filteredMarketData = computed(
  () => displayedCoins.map((coin) => marketData.value.find((item) => item.name === coin)).filter(Boolean) as MarketItem[],
)
const onScroll = () => {
  const bottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100
  if (!bottom) return
  // pagination news kalau perlu
}

/** ===== Visibility handler ===== */
const visHandler = () => { if (document.hidden) saveDashCacheDebounced() }

/** ===== Lifecycle ===== */
onMounted(async () => {
  loadDashCache()
  hydrateFromCache()

  await Promise.all([loadSaldo(), loadPositions()])

  for (const p of positions.value) {
    const key = String(p.symbol).toUpperCase()
    priceMap[key] = priceMap[key] ?? 0
  }

  rebuildActiveLower()
  recomputeTotals()

  connectAggregator()

  window.addEventListener('scroll', onScroll, { passive: true })
  requestAnimationFrame(() => onScroll())

  const token = isBrowser() ? localStorage.getItem('token') : ''
  if (!token) {
    modal.open('Unauthorized', 'Token tidak ditemukan.')
  } else {
    try {
      const res = await fetch(`${API_BASE}/news`, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.status === 'success') {
        newsList.value = (data.data as ApiNewsItem[]).map((item) => {
          const d = new Date(item.published_at)
          return {
            ...item,
            date: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          }
        })
      } else {
        modal.open('Error', data?.message || 'Gagal memuat berita.')
      }
    } catch (e: unknown) {
      modal.open('Error', `Gagal terhubung ke server. ${e instanceof Error ? e.message : JSON.stringify(e)}`)
    } finally {
      loading.value = false
    }
  }

  if (isBrowser()) document.addEventListener('visibilitychange', visHandler, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  if (isBrowser()) document.removeEventListener('visibilitychange', visHandler)

  if (wsAgg) { try { wsAgg.close() } catch { }; wsAgg = null }
  if (wsTimer) { clearTimeout(wsTimer); wsTimer = null }

  try { if (isBrowser()) localStorage.setItem(DASH_LS_KEY, JSON.stringify(dcache)) } catch { }
})
</script>


<style scoped>
/* optional */
</style>
