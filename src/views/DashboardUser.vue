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
                {{ item.price }}
              </div>
              <div class="text-[12px] text-[#9ca3af] mt-0.5">${{ item.price }}</div>
            </div>
            <div>
              <button
                :class="[
                  'text-white text-[12px] font-semibold rounded-md px-3 py-1 ml-auto block',
                  item.change > 0
                    ? 'bg-green-500'
                    : item.change < 0
                      ? 'bg-red-500'
                      : 'bg-slate-500',
                ]"
              >
                {{ item.change > 0 ? '+' : item.change < 0 ? '-' : ''
                }}{{ Math.abs(item.change).toFixed(2) }}%
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
        <!-- Header -->
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-1 text-gray-900 font-semibold text-sm">
            <span class="text-[10px] leading-none">•</span>
            <span>{{ news.date }}</span>
          </div>
          <div class="font-extrabold text-sm text-black">News</div>
        </div>

        <!-- Time -->
        <div class="text-gray-400 text-xs font-normal select-none">
          {{ news.time }}
        </div>

        <!-- Content -->
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
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'

interface MarketItem {
  name: string
  price: number
  change: number
  icon: string
}

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

const ICON_FALLBACK = '/img/crypto/_default.svg' // siapkan file fallback optional
function iconPath(symbol: string) {
  return `/img/crypto/${symbol.toLowerCase()}.svg`
}

type PositionRow = {
  symbol: string // e.g. BTCUSDT
  qty: string | number
  avg_cost: string | number
}

const API_BASE = 'https://one-ledger.masmutpanel.my.id/api'
const WS_BASE = 'wss://ledgersocketone.online'

/** ===== State summary ===== */
const saldo = ref<number | null>(null) // dari /saldo
const totalValue = ref<number | null>(null) // saldo + Σ(qty * last)
const portfolioUpnlAbs = ref<number>(0) // Σ((last-avg)*qty)
const portfolioUpnlPct = ref<number>(0) // ΣuPNL / Σcost * 100

/** ===== State positions & harga ===== */
const positions = ref<PositionRow[]>([]) // dari /positions-all
const priceMap = reactive<Record<string, number>>({}) // { BTCUSDT: 12345 }
const sockets = new Map<string, WebSocket>()
const reconnectTimers = new Map<string, number>()

/** ===== Helpers ===== */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function n(v: any, d = 0) {
  const x = Number(v)
  return Number.isFinite(x) ? x : d
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseLastPrice(payload: any): number {
  // Versi relay custom: { ch:'ticker', symbol:'btcusdt', last:123, ts:... }
  if (payload?.ch === 'ticker' && 'last' in payload) return n(payload.last, 0)
  // Versi Huobi raw: { ch:'market.btcusdt.trade.detail', tick:{data:[{price}]}}
  if (payload?.ch?.includes('.trade.detail')) return n(payload?.tick?.data?.[0]?.price, 0)
  return 0
}

/** ===== Recompute totals ===== */
function recomputeTotals() {
  let sumValue = 0
  let sumUpnl = 0
  let sumCost = 0

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

/** ===== WS ticker per simbol ===== */
function connectTicker(symbolUpper: string) {
  const symLower = symbolUpper.toLowerCase() // 'btcusdt'
  const key = `${symLower}-ticker`
  if (sockets.has(key)) return

  const url = `${WS_BASE}/${symLower}/ticker`
  const ws: WebSocket | null = new WebSocket(url)

  ws.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data as string)
      const last = parseLastPrice(msg)
      if (!last) return
      priceMap[symbolUpper] = last
      recomputeTotals()
    } catch {}
  }

  ws.onclose = () => {
    sockets.delete(key)
    // auto-reconnect selama simbol masih ada di posisi
    if (positions.value.some((p) => String(p.symbol).toUpperCase() === symbolUpper)) {
      const t = window.setTimeout(() => connectTicker(symbolUpper), 2000)
      reconnectTimers.set(key, t)
    }
  }

  ws.onerror = () => {
    try {
      ws?.close()
    } catch {}
  }
  sockets.set(key, ws)
}

function ensureTickerSubscriptions() {
  // tutup yang tidak perlu
  for (const [key, sock] of sockets.entries()) {
    const symUp = key.replace('-ticker', '').toUpperCase()
    if (!positions.value.some((p) => String(p.symbol).toUpperCase() === symUp)) {
      try {
        sock.close()
      } catch {}
      sockets.delete(key)
    }
  }
  // buka yang belum terhubung
  for (const p of positions.value) {
    connectTicker(String(p.symbol).toUpperCase())
  }
}

/** ===== Loaders awal ===== */
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
  // ambil hanya yang qty > 0
  positions.value = rows.filter((r) => n(r.qty, 0) > 0)
}

/** ===== Mount / Unmount ===== */
onMounted(async () => {
  await Promise.all([loadSaldo(), loadPositions()])
  // inisialisasi harga ke 0 untuk semua simbol agar recompute tidak NaN
  for (const p of positions.value) priceMap[String(p.symbol).toUpperCase()] = 0
  recomputeTotals()
  ensureTickerSubscriptions()
})

// opsional: kalau kamu sudah broadcast event dari backend setelah trade,
// pasang listener di sini untuk refresh qty/saldo tanpa reload halaman:
window.addEventListener('portfolio-updated', async () => {
  await Promise.all([loadSaldo(), loadPositions()])
  ensureTickerSubscriptions()
  recomputeTotals()
})

onUnmounted(() => {
  for (const ws of sockets.values()) {
    try {
      ws.close()
    } catch {}
  }
  sockets.clear()
  for (const t of reconnectTimers.values()) clearTimeout(t)
  reconnectTimers.clear()
})

/** ===== Formatting yang kamu sudah punya (dipakai template) ===== */
const nfId = (min: number, max: number) =>
  new Intl.NumberFormat('id-ID', { minimumFractionDigits: min, maximumFractionDigits: max })
function formatNumberId(nu: number, digits = 2) {
  return Number.isFinite(nu) ? nfId(digits, digits).format(nu) : '0'
}
function moneyId(nu: number, digits = 2) {
  return `$${formatNumberId(nu, digits)}`
}
function signedPercent(pct: number) {
  const s = pct >= 0 ? '+' : ''
  return s + (Number.isFinite(pct) ? pct.toFixed(2) : '0.00') + '%'
}
function signedMoneyId(nu: number, digits = 2) {
  const s = nu >= 0 ? '+' : '-'
  return s + moneyId(Math.abs(nu), digits)
}

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

const truncate = (text: string, limit: number): string =>
  text.length > limit ? text.substring(0, limit) + '...' : text

onMounted(async () => {
  const token = localStorage.getItem('token')

  if (!token) {
    modal.open('Unauthorized', 'Token tidak ditemukan.')
    return
  }

  try {
    const res = await fetch('https://one-ledger.masmutpanel.my.id/api/news', {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await res.json()

    if (!res.ok) {
      modal.open('Error', data.message || 'Gagal memuat berita.')
      return
    }

    if (data.status === 'success') {
      newsList.value = (data.data as ApiNewsItem[]).map((item) => {
        const published = new Date(item.published_at)
        const date = published.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        })
        const time = published.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })

        return {
          ...item,
          date,
          time,
        }
      })
    }
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : JSON.stringify(e)
    modal.open('Error', `Gagal terhubung ke server. ${errorMessage}`)
  } finally {
    loading.value = false
  }
})
const displayedCoins = ['BNB', 'BTC', 'ETH', 'SOL', 'XRP']
const marketData = ref<MarketItem[]>([])

// Map simbol jika perlu mapping ke nama Huobi
const symbolMap: Record<string, string> = {
  BNB: 'bnb',
  BTC: 'btc',
  ETH: 'eth',
  SOL: 'sol',
  XRP: 'xrp',
}

// Ambil data awal dari API Huobi
async function fetchInitialMarketData() {
  const promises = displayedCoins.map(async (coin) => {
    const symbol = symbolMap[coin] + 'usdt'

    try {
      const mergedRes = await fetch(`https://api.huobi.pro/market/detail/merged?symbol=${symbol}`)
      const mergedData = await mergedRes.json()
      const price = mergedData?.tick?.close || 0

      const klineRes = await fetch(
        `https://api.huobi.pro/market/history/kline?period=1day&size=2&symbol=${symbol}`,
      )
      const klineData = await klineRes.json()
      const kline = klineData?.data?.[1]
      const open = kline?.open || 0

      if (price && open) {
        marketData.value.push({
          name: coin,
          price: price,
          change: ((price - open) / open) * 100,
          icon: iconPath(coin),
        })
      }
    } catch (err) {
      console.warn(`API fallback failed for ${coin}`, err)
    }
  })

  await Promise.all(promises)
}

// WebSocket integrasi
function connectWebSocket(coin: string) {
  const symbol = symbolMap[coin] + 'usdt'
  const url = `wss://ledgersocketone.online/${symbol}/1day`
  const ws = new WebSocket(url)

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      const tick = data?.tick
      if (!tick) return

      const open = tick.open
      const close = tick.close

      const index = marketData.value.findIndex((item) => item.name === coin)
      const updated: MarketItem = {
        name: coin,
        price: close,
        change: ((close - open) / open) * 100,
        icon: iconPath(coin),
      }

      if (index >= 0) {
        marketData.value[index] = updated
      } else {
        marketData.value.push(updated)
      }
    } catch (err) {
      console.error(`WS parse error for ${coin}`, err)
    }
  }

  ws.onerror = () => console.error(`[WS] Error on ${coin}`)
  // ws.onclose = () => console.warn(`[WS] Closed for ${coin}`)
}

// Inisialisasi
onMounted(() => {
  fetchInitialMarketData()
  displayedCoins.forEach((coin) => connectWebSocket(coin))
})

// Urutkan sesuai displayedCoins
const filteredMarketData = computed(
  () =>
    displayedCoins
      .map((coin) => marketData.value.find((item) => item.name === coin))
      .filter(Boolean) as MarketItem[],
)
</script>

<style scoped>
/* Tambahan gaya jika perlu */
</style>
