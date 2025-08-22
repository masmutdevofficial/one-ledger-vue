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

        <RouterLink
          to="/add-funds"
          class="bg-teal-500 flex justify-center items-center active:bg-teal-600 text-white rounded-md px-6 py-2 text-[10px] font-normal transition-colors w-[100px] text-center"
        >
          Add Funds
        </RouterLink>
      </div>
      <div class="text-xs flex items-center text-black mb-4">
        Unrealized PnL
        <span
          class="font-semibold ml-1"
          :class="portfolioUpnlAbs >= 0 ? 'text-[#3ABBA3]' : 'text-red-500'"
        >
          {{ signedMoneyId(portfolioUpnlAbs, 2) }}
          ({{ signedPercent(portfolioUpnlPct) }})
        </span>
        <Icon icon="tabler:chevron-right" class="ml-1 text-gray-400 w-4 h-4" />
      </div>
      <div class="grid grid-cols-4 gap-x-6 gap-y-6 mt-5">
        <RouterLink
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          class="group flex flex-col items-center"
          aria-label="item.label"
        >
          <div
            class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shadow-sm ring-1 ring-gray-200/60 hover:ring-gray-300 transition group-active:scale-95"
          >
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
          <RouterLink
            :to="`/trade?symbol=${item.name.toLowerCase()}usdt`"
            class="grid grid-cols-[1fr_1fr_1fr] items-center hover:bg-gray-50 transition-colors duration-150 rounded-lg px-2 py-1"
            v-for="item in filteredMarketData"
            :key="item.name"
          >
            <div class="flex items-center space-x-1 font-semibold text-[14px] text-black">
              <img
                :src="item.icon"
                :alt="item.name + ' icon'"
                class="w-3.5 h-3.5"
                width="14"
                height="14"
                @error="item.icon = ICON_FALLBACK"
              />
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
              <button
                :class="[
                  'text-white text-[12px] font-semibold rounded-md px-3 py-1 ml-auto inline-block',
                  item.change === null
                    ? 'bg-slate-500'
                    : item.change > 0
                      ? 'bg-green-500'
                      : item.change < 0
                        ? 'bg-red-500'
                        : 'bg-slate-500',
                ]"
              >
                {{
                  item.change === null
                    ? '...'
                    : (item.change > 0 ? '+' : item.change < 0 ? '-' : '') +
                      Math.abs(item.change).toFixed(2) +
                      '%'
                }}
              </button>
            </div>
          </RouterLink>
        </div>

        <!-- View More -->
        <RouterLink
          to="/market"
          class="block text-center text-[12px] text-[#9ca3af] font-normal cursor-pointer select-none hover:underline"
        >
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

      <div
        v-else
        v-for="(news, index) in newsList"
        :key="index"
        class="bg-white rounded-2xl p-5 flex flex-col space-y-3 hover:bg-gray-50 transition-colors duration-150"
      >
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
          <img
            v-if="news && news.image"
            :src="`https://one-ledger.masmutpanel.my.id${news.image}`"
            alt="News Image"
            class="w-24 h-16 object-cover rounded-lg"
          />
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
          <RouterLink
            :to="`/news/${news.slug}`"
            class="text-[#3ABBA3] text-xs font-semibold hover:underline"
          >
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
const WS_BASE = 'wss://z8gwowgckssc8c8s4co444c0.masmutpanel.my.id'
const ICON_FALLBACK = '/img/crypto/_default.svg'
const iconPath = (s: string) => `/img/crypto/${s.toLowerCase()}.svg`

/** ===== Menu ===== */
interface MenuItem {
  label: string
  to: string
  img: string
}
const items: MenuItem[] = [
  { label: 'Arbitrage', to: '/smart-arbitrage', img: '/img/robot-logo.png' },
  { label: 'Hub reward', to: '/hub-rewards', img: '/img/newmenu/hub-reward.png' },
  { label: 'Megadrop', to: '/megadrop', img: '/img/newmenu/megadrop.png' },
  { label: 'LaunchPool', to: '/launchpool', img: '/img/newmenu/launchpool.png' },
  { label: 'Event', to: '/event', img: '/img/newmenu/event.png' },
  { label: 'More', to: '/account', img: '/img/newmenu/more.png' },
]

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
interface MarketItem {
  name: string
  price: number | null
  change: number | null
  icon: string
}
const displayedCoins = ['BNB', 'BTC', 'ETH', 'SOL', 'XRP']
const symbolMap: Record<string, string> = {
  BNB: 'bnb',
  BTC: 'btc',
  ETH: 'eth',
  SOL: 'sol',
  XRP: 'xrp',
}
const marketData = ref<MarketItem[]>(
  displayedCoins.map((c) => ({ name: c, price: null, change: null, icon: iconPath(c) })),
)

/** ===== Helpers ===== */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const n = (v: any, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d)
const nfId = (min: number, max: number) =>
  new Intl.NumberFormat('id-ID', { minimumFractionDigits: min, maximumFractionDigits: max })
const formatNumberId = (nu: number, digits = 2) =>
  Number.isFinite(nu) ? nfId(digits, digits).format(nu) : '0'
const moneyId = (nu: number, digits = 2) => `$${formatNumberId(nu, digits)}`
const signedPercent = (pct: number) =>
  (pct >= 0 ? '+' : '') + (Number.isFinite(pct) ? pct.toFixed(2) : '0.00') + '%'
const signedMoneyId = (nu: number, digits = 2) =>
  (nu >= 0 ? '+' : '-') + moneyId(Math.abs(nu), digits)
const truncate = (text: string, limit: number): string =>
  text.length > limit ? text.substring(0, limit) + '...' : text
// const splitSym = (s: string) => {
//   const up = s.toUpperCase()
//   if (up.endsWith('USDT')) return { base: up.slice(0, -4), quote: 'USDT' as const }
//   if (up.endsWith('USDC')) return { base: up.slice(0, -4), quote: 'USDC' as const }
//   if (up.endsWith('USD')) return { base: up.slice(0, -3), quote: 'USD' as const }
//   return { base: up, quote: 'USDT' as const }
// }

/** ===== Totals ===== */
function recomputeTotals() {
  let sumValue = 0,
    sumUpnl = 0,
    sumCost = 0
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
}

/** ===== Loader ===== */
async function loadSaldo() {
  const token = localStorage.getItem('token')
  if (!token) {
    saldo.value = 0
    return
  }
  const res = await fetch(`${API_BASE}/saldo`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  const data = await res.json().catch(() => ({}))
  saldo.value = res.ok && data?.status === 'success' ? n(data.saldo, 0) : 0
}

async function loadPositions() {
  const token = localStorage.getItem('token')
  if (!token) {
    positions.value = []
    return
  }
  const res = await fetch(`${API_BASE}/positions-all`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  const rows: PositionRow[] = res.ok ? await res.json() : []
  positions.value = rows.filter((r) => n(r.qty, 0) > 0)
}

/** ===== WS Aggregator (satu koneksi) ===== */
// aktifkan filter supaya hanya proses simbol yang dipakai (positions + displayedCoins)
let activeLower = new Set<string>()
function rebuildActiveLower() {
  const s = new Set<string>()
  for (const p of positions.value) s.add(String(p.symbol).toLowerCase())
  for (const c of displayedCoins) s.add(symbolMap[c] + 'usdt')
  activeLower = s
}
watch(positions, rebuildActiveLower, { deep: true })

// buffer update agar render hemat
const pendingPrice: Record<string, number> = {} // 'BTCUSDT' -> last
const pendingKlineClose: Record<string, number> = {} // 'BTCUSDT' -> close 1d
let flushTimer: number | null = null

function scheduleFlush() {
  if (flushTimer) return
  flushTimer = window.setTimeout(() => {
    // apply ke positions/summary
    let touched = false
    for (const [symUp, px] of Object.entries(pendingPrice)) {
      priceMap[symUp] = px
      touched = true
      delete pendingPrice[symUp]
    }
    for (const [symUp, close] of Object.entries(pendingKlineClose)) {
      priceMap[symUp] = close
      touched = true
      delete pendingKlineClose[symUp]
    }
    if (touched) recomputeTotals()

    // apply ke marketData (top coins)
    for (const item of marketData.value) {
      const lower = (symbolMap[item.name] + 'usdt').toUpperCase()
      const last = priceMap[lower] ?? null
      if (last !== null && last !== undefined) item.price = Number(last)
      // change dihitung hanya saat terima kline (close/open). Kita gunakan priceMap untuk last,
      // dan simpan open harian per coin jika perlu. Agar simpel: change akan terisi saat kline 1d diterima.
    }

    flushTimer = null
  }, 300)
}

let wsAgg: WebSocket | null = null
let wsTimer: number | null = null

// simpan open harian untuk hitung change
const dayOpen: Record<string, number> = {} // 'BTCUSDT' -> open

function handleKline1d(symLower: string, open: number, close: number) {
  const symUp = symLower.toUpperCase()
  dayOpen[symUp] = open
  pendingKlineClose[symUp] = close
  // update change untuk marketData top coins
  const coin = displayedCoins.find((c) => symbolMap[c] + 'usdt' === symLower)
  if (coin && open) {
    const row = marketData.value.find((x) => x.name === coin)
    if (row) row.change = ((close - open) / open) * 100
  }
  scheduleFlush()
}

function handleTicker(symLower: string, last: number) {
  const symUp = symLower.toUpperCase()
  pendingPrice[symUp] = last
  scheduleFlush()
}

function connectAggregator() {
  if (wsAgg)
    try {
      wsAgg.close()
    } catch {}
  wsAgg = new WebSocket(WS_BASE)

  wsAgg.onopen = () => {
    /* connected */
  }

  wsAgg.onclose = () => {
    wsAgg = null
    if (wsTimer) clearTimeout(wsTimer)
    wsTimer = window.setTimeout(connectAggregator, 2000)
  }

  wsAgg.onerror = () => {
    try {
      wsAgg?.close()
    } catch {}
  }

  wsAgg.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data as string)
      const symLower = String(msg.symbol || '').toLowerCase()
      if (!symLower || !activeLower.has(symLower)) return

      if (msg.type === 'ticker' && Number.isFinite(Number(msg.last))) {
        handleTicker(symLower, Number(msg.last))
        return
      }
      if (msg.type === 'kline' && msg.period === '1day') {
        const open = Number(msg.open),
          close = Number(msg.close)
        if (Number.isFinite(open) && Number.isFinite(close)) {
          handleKline1d(symLower, open, close)
        }
        return
      }
    } catch {
      /* ignore */
    }
  }
}

/** ===== News ===== */
interface ApiNewsItem {
  id: number
  title: string
  slug: string
  content: string
  image: string
  published_at: string
}
interface NewsItem extends ApiNewsItem {
  date: string
  time: string
}
const newsList = ref<NewsItem[]>([])
const loading = ref(true)
const modal = useApiAlertStore()

/** ===== Lifecycle ===== */
onMounted(async () => {
  await Promise.all([loadSaldo(), loadPositions()])

  // init price map & market placeholders
  for (const p of positions.value) priceMap[String(p.symbol).toUpperCase()] = 0
  rebuildActiveLower()
  recomputeTotals()

  // connect single WS aggregator
  connectAggregator()

  // load news
  const token = localStorage.getItem('token')
  if (!token) {
    modal.open('Unauthorized', 'Token tidak ditemukan.')
  } else {
    try {
      const res = await fetch(`${API_BASE}/news`, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok && data?.status === 'success') {
        newsList.value = (data.data as ApiNewsItem[]).map((item) => {
          const d = new Date(item.published_at)
          return {
            ...item,
            date: d.toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            }),
            time: d.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }),
          }
        })
      } else {
        modal.open('Error', data?.message || 'Gagal memuat berita.')
      }
    } catch (e: unknown) {
      modal.open(
        'Error',
        `Gagal terhubung ke server. ${e instanceof Error ? e.message : JSON.stringify(e)}`,
      )
    } finally {
      loading.value = false
    }
  }
})

onUnmounted(() => {
  if (wsAgg) {
    try {
      wsAgg.close()
    } catch {}
    wsAgg = null
  }
  if (wsTimer) {
    clearTimeout(wsTimer)
    wsTimer = null
  }
})

/** ===== Market order sesuai displayedCoins ===== */
const filteredMarketData = computed(
  () =>
    displayedCoins
      .map((coin) => marketData.value.find((item) => item.name === coin))
      .filter(Boolean) as MarketItem[],
)
</script>

<style scoped>
/* optional */
</style>
