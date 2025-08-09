<template>
  <div>
    <div class="flex items-center justify-between max-w-md mx-4 mt-4">
      <div class="relative inline-block">
        <!-- Trigger Dropdown -->
        <div
          class="flex items-center space-x-1 cursor-pointer"
          @click="dropdownOpen = !dropdownOpen"
        >
          <span class="font-semibold text-black text-base">{{ selectedPair }}</span>
          <Icon icon="tabler:chevron-down" class="text-black text-base" />
        </div>

        <!-- Dropdown -->
        <div
          v-if="dropdownOpen"
          class="absolute z-50 mt-2 w-40 bg-white border border-gray-200 rounded shadow-md"
        >
          <ul class="max-h-64 overflow-auto">
            <li
              v-for="pair in tradingPairs"
              :key="pair"
              @click="selectPair(pair)"
              class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
            >
              {{ pair }}
            </li>
          </ul>
        </div>
      </div>
      <div class="flex items-center space-x-4 text-gray-400 text-lg">
        <Icon icon="tabler:chart-bar" />
        <Icon icon="tabler:dots" />
      </div>
    </div>
    <div class="max-w-md mx-4 mt-1">
      <span
        class="text-sm font-semibold"
        :class="percentChange !== null && percentChange >= 0 ? 'text-teal-600' : 'text-red-600'"
      >
        {{
          percentChange !== null
            ? (percentChange > 0 ? '+' : '') + percentChange.toFixed(2) + '%'
            : '-'
        }}
      </span>
    </div>

    <div class="grid grid-cols-2 gap-4 max-w-md md:max-w-4xl mx-auto mt-4 px-4">
      <!-- KIRI: SELL + BUY LIST -->
      <div>
        <!-- SELL LIST -->
        <div class="flex justify-between text-gray-400 text-xs pb-1">
          <span>Price (USDT)</span>
          <span>Amount ({{ baseAsset }})</span>
        </div>

        <!-- ASKS (SELL, merah) -->
        <div class="space-y-1" v-if="depthData">
          <div
            v-for="ask in top5Asks"
            :key="ask[0]"
            class="relative flex justify-between overflow-hidden rounded"
            style="height: 28px"
          >
            <!-- BG bar -->
            <div
              class="absolute left-0 top-0 h-full bg-red-100 z-0 transition-all duration-200"
              :style="{ width: `${((ask[1] / maxAskAmount) * 100).toFixed(2)}%` }"
            ></div>
            <!-- Data -->
            <p class="text-pink-400 text-sm text-right z-10 px-2 w-1/2">
              {{ ask[0].toLocaleString('en-US', { maximumFractionDigits: 2 }) }}
            </p>
            <p class="text-black text-sm text-left z-10 px-2 w-1/2">
              {{ ask[1].toLocaleString('en-US', { maximumFractionDigits: 5 }) }}
            </p>
          </div>
        </div>

        <!-- CURRENT PRICE (Bid Teratas, jika ada) -->
        <div class="text-center my-3" v-if="depthData">
          <p class="text-[#2DBE87] font-semibold text-[28px]">
            {{
              depthData.tick.bids[0]?.[0]?.toLocaleString('en-US', { maximumFractionDigits: 2 }) ??
              '-'
            }}
          </p>
          <p class="text-[#7F7F7F] text-[14px]">
            ≈ ${{
              depthData.tick.bids[0]?.[0]?.toLocaleString('en-US', { maximumFractionDigits: 2 }) ??
              '-'
            }}
          </p>
        </div>

        <!-- BIDS (BUY, hijau) -->
        <div class="space-y-1" v-if="depthData">
          <div
            v-for="bid in top5Bids"
            :key="bid[0]"
            class="relative flex justify-between overflow-hidden rounded"
            style="height: 28px"
          >
            <!-- BG bar -->
            <div
              class="absolute right-0 top-0 h-full bg-green-100 z-0 transition-all duration-200"
              :style="{ width: `${((bid[1] / maxBidAmount) * 100).toFixed(2)}%` }"
            ></div>
            <!-- Data -->
            <p class="text-[#2DBE87] text-sm text-right z-10 px-2 w-1/2">
              {{ bid[0].toLocaleString('en-US', { maximumFractionDigits: 2 }) }}
            </p>
            <p class="text-black text-sm text-left z-10 px-2 w-1/2">
              {{ bid[1].toLocaleString('en-US', { maximumFractionDigits: 5 }) }}
            </p>
          </div>
        </div>
      </div>

      <!-- KANAN: FORM BELI -->
      <div class="space-y-3">
        <!-- TOGGLE -->
        <div
          class="flex rounded-lg border border-gray-300 overflow-hidden text-sm font-semibold select-none"
        >
          <button
            class="cursor-pointer flex-1 py-1.5 px-4"
            :class="[
              activeTab === 'buy' ? 'bg-teal-500 text-white' : 'text-gray-400',
              'transition-colors duration-200',
            ]"
            @click="activeTab = 'buy'"
          >
            Buy
          </button>
          <button
            class="cursor-pointer flex-1 py-1.5 px-4"
            :class="[
              activeTab === 'sell' ? 'bg-red-500 text-white' : 'text-gray-400',
              'transition-colors duration-200',
            ]"
            @click="activeTab = 'sell'"
          >
            Sell
          </button>
        </div>

        <!-- MARKET DROPDOWN -->
        <div>
          <button
            class="w-full flex items-center justify-center bg-gray-100 text-gray-900 text-sm font-bold px-3 py-2 rounded"
          >
            <span>Market</span>
          </button>
        </div>

        <!-- MARKET PRICE -->
        <input
          type="text"
          disabled
          placeholder="Market Price"
          class="w-full bg-gray-200 text-gray-400 text-sm font-normal rounded px-3 py-2 cursor-not-allowed"
        />

        <!-- TOTAL: tampilkan nilai USDT sesuai persen x saldo -->
        <div
          class="flex justify-between items-center bg-gray-100 rounded px-3 py-2 text-sm text-gray-500 font-normal mt-3"
        >
          <span>Total</span>
          <div class="text-gray-900 font-bold flex items-center space-x-1">
            <span>
              <template v-if="saldoLoading">--</template>
              <template v-else-if="saldoError">--</template>
              <template v-else>
                {{ totalUSDT.toLocaleString('en-US', { maximumFractionDigits: 8 }) }}
              </template>
            </span>
            <span>USDT</span>
            <Icon icon="tabler:chevron-down" class="text-gray-600" />
          </div>
        </div>

        <!-- SLIDER INPUT -->
        <div class="w-full">
          <input
            type="range"
            v-model.number="rawPercent"
            min="0"
            max="100"
            step="1"
            :disabled="!canSlide"
            :style="sliderStyle"
            @input="onInput(($event.target as HTMLInputElement).valueAsNumber)"
            @change="commitSnap"
            @pointerdown="isDragging = true"
            @pointerup="handlePointerUp"
            class="w-full h-2 rounded-lg appearance-none cursor-pointer accent-teal-600 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:mt-[-4px] disabled:cursor-not-allowed disabled:[&::-webkit-slider-thumb]:bg-gray-300"
          />

          <div class="flex justify-between text-xs text-gray-400 mt-1">
            <button
              v-for="m in marks"
              :key="m"
              type="button"
              @click="setPercent(m)"
              class="select-none transition"
              :class="[
                canSlide ? 'hover:text-gray-600' : 'cursor-not-allowed',
                amountPercent === m ? 'text-gray-900 font-semibold' : '',
              ]"
            >
              {{ m }}%
            </button>
          </div>
        </div>

        <div class="text-xs space-y-1">
          <div class="flex justify-between text-gray-400 italic">
            <span>Avbl</span>
            <span class="text-gray-900 normal-case not-italic flex items-center gap-1">
              <template v-if="saldoLoading">...</template>
              <template v-else-if="saldoError">-</template>
              <template v-else>
                {{ saldo?.toLocaleString('en-US', { maximumFractionDigits: 8 }) }} USDT
              </template>
              <Icon icon="tabler:plus" class="text-yellow-400 text-[10px]" />
            </span>
          </div>
          <div class="flex justify-between text-gray-300 italic">
            <span>Max Buy</span>
            <span class="text-gray-900 not-italic">0,00000 BTC</span>
          </div>
          <div class="flex justify-between text-gray-300 italic">
            <span>Est. Fee</span>
            <span class="text-gray-900 not-italic">-- BTC</span>
          </div>
        </div>

        <!-- SUBMIT BUTTON -->
        <button
          :class="[
            'cursor-pointer w-full text-white text-sm font-medium py-2 rounded mt-3',
            activeTab === 'buy' ? 'bg-teal-600' : 'bg-red-600',
          ]"
        >
          {{ (activeTab === 'buy' ? 'Buy ' : 'Sell ') + baseAsset }}
        </button>
      </div>
    </div>

    <div class="max-w-md mx-auto border border-gray-200 rounded-md p-5">
      <!-- Header -->
      <div class="flex justify-between items-center mb-3">
        <h2 class="text-sm font-semibold text-gray-900">Open Orders (0)</h2>
        <button aria-label="Open orders icon" class="text-gray-500 hover:text-gray-700">
          <Icon icon="tabler:file-description" class="text-lg" />
        </button>
      </div>

      <div class="border-b border-yellow-400 w-10 mb-5"></div>

      <!-- Current pair info -->
      <div class="flex justify-between items-center text-gray-400 text-xs mb-3">
        <span>Current pair assets</span>
        <button aria-label="Settings" class="hover:text-gray-600">
          <Icon icon="tabler:settings" class="text-sm" />
        </button>
      </div>

      <!-- BTC info -->
      <div class="flex justify-between items-center mb-3">
        <!-- Logo + Label -->
        <div class="flex items-center space-x-2">
          <div class="flex items-center space-x-1">
            <img
              src="https://storage.googleapis.com/a1aa/image/2ee22ff5-4f92-4caf-225e-c87410dc52b2.jpg"
              alt="Bitcoin logo"
              class="w-5 h-5"
            />
            <span class="font-semibold text-gray-900 text-base">BTC</span>
          </div>
          <span class="text-gray-400 text-sm">Bitcoin</span>
        </div>

        <!-- Share Icon -->
        <button aria-label="Share" class="text-gray-400 hover:text-gray-600">
          <Icon icon="tabler:share-3" />
        </button>
      </div>

      <!-- PnL Info -->
      <div class="flex justify-between text-xs text-gray-500 mb-1">
        <span>Daily PnL</span>
        <span>PnL%</span>
      </div>
      <div class="flex justify-between mb-5">
        <span class="text-teal-500 font-semibold text-sm">+$0,00016922</span>
        <span class="text-teal-500 font-semibold text-sm">+0,24%</span>
      </div>

      <!-- Stats Summary -->
      <div class="flex justify-between text-center mb-5">
        <div class="flex flex-col">
          <span class="font-semibold text-gray-900 text-sm">0.00</span>
          <span class="text-gray-400 text-xs">$0,06983393</span>
          <span class="text-gray-500 text-xs mt-1">Balances</span>
        </div>
        <div class="flex flex-col">
          <span class="font-semibold text-gray-900 text-sm">$81.546,54</span>
          <span class="text-gray-500 text-xs mt-1">Avg. Cost</span>
        </div>
        <div class="flex flex-col">
          <span class="font-semibold text-gray-900 text-sm">109.166,20</span>
          <span class="text-gray-500 text-xs mt-1">Last Price (USDC)</span>
        </div>
      </div>

      <!-- CTA -->
      <p class="text-center text-gray-400 text-xs mb-3">Let Top Traders Trade for You</p>
      <div class="flex justify-center mb-40">
        <router-link to="/futures">
          <button
            type="button"
            class="border border-gray-300 rounded-md px-4 py-1 text-sm text-gray-900 hover:bg-gray-100"
          >
            Copy Trading
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/* ──────────────────────────────────────────────────────────────────────────────
 * IMPORTS & TIPE DATA
 * ────────────────────────────────────────────────────────────────────────────*/
import { Icon } from '@iconify/vue' // (dipakai di template)
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/** Orderbook depth tick */
interface DepthTick {
  asks: [number, number][]
  bids: [number, number][]
}
interface DepthData {
  ch: string
  ts: number
  tick: DepthTick
}

/** Kline (untuk hitung % perubahan) */
interface KlineTick {
  open: number
  close: number
}
interface KlineData {
  ch: string
  ts: number
  tick: KlineTick
}

/* ──────────────────────────────────────────────────────────────────────────────
 * STATE DASAR (UI)
 * ────────────────────────────────────────────────────────────────────────────*/
const activeTab = ref<'buy' | 'sell'>('buy')
const dropdownOpen = ref(false)
const selectedPair = ref('BTC/USDT') // format tampilan: BASE/QUOTE

const tradingPairs = [
  'BTC/USDT',
  'ETH/USDT',
  'BNB/USDT',
  'SOL/USDT',
  'LTC/USDT',
  'LINK/USDT',
  'TON/USDT',
  'SUI/USDT',
  'XRP/USDT',
  'QTUM/USDT',
  'THETA/USDT',
  'ADA/USDT',
  'RAD/USDT',
  'BAND/USDT',
  'ALGO/USDT',
  'POL/USDT',
  'DOGE/USDT',
  'LUNA/USDT',
  'GALA/USDT',
  'PEPE/USDT',
]

const route = useRoute()
const router = useRouter()

/* ──────────────────────────────────────────────────────────────────────────────
 * HELPERS KONVERSI PAIR <-> URL SYMBOL
 *  - URL: pairSymbol = 'btcusdt'
 *  - UI : selectedPair = 'BTC/USDT'
 * ────────────────────────────────────────────────────────────────────────────*/
/** 'btcusdt' | 'BTC/USDT' -> 'BTC/USDT' (return '' kalau invalid) */
function toPair(input?: string): string {
  if (!input) return ''
  const v = input.toUpperCase().replace('/', '') // buang '/'
  if (!v.endsWith('USDT')) return '' // asumsi quote USDT
  const base = v.slice(0, -4)
  const pair = `${base}/USDT`
  return tradingPairs.includes(pair) ? pair : ''
}

/** 'BTC/USDT' -> 'btcusdt' */
function pairToQuery(pair: string): string {
  return pair.replace('/', '').toLowerCase()
}

/** BASE/QUOTE dari selectedPair */
const baseAsset = computed(() => selectedPair.value.split('/')[0])
// const quoteAsset = computed(() => selectedPair.value.split('/')[1] ?? 'USDT')

/* ──────────────────────────────────────────────────────────────────────────────
 * WEBSOCKET: DEPTH ORDERBOOK
 * ────────────────────────────────────────────────────────────────────────────*/
const ws = ref<WebSocket | null>(null)
const depthData = ref<DepthData | null>(null)

function connectWS(pairSymbol: string) {
  ws.value?.close()
  depthData.value = null
  // pairSymbol = 'btcusdt'
  ws.value = new WebSocket(`wss://ledgersocketone.online/${pairSymbol}/depth`)
  ws.value.onmessage = (e: MessageEvent) => {
    try {
      const data = JSON.parse(e.data) as DepthData
      if (
        data &&
        typeof (data as DepthData).tick !== 'undefined' &&
        (data as DepthData).ch?.includes('depth')
      ) {
        depthData.value = data as DepthData
      }
    } catch {}
  }
}

/** Turunan tampilan */
const top5Asks = computed(() =>
  depthData.value ? depthData.value.tick.asks.slice(-5).reverse() : [],
)
const top5Bids = computed(() => (depthData.value ? depthData.value.tick.bids.slice(0, 5) : []))
const maxAskAmount = computed(() =>
  top5Asks.value.length ? Math.max(...top5Asks.value.map((a) => a[1])) : 1,
)
const maxBidAmount = computed(() =>
  top5Bids.value.length ? Math.max(...top5Bids.value.map((b) => b[1])) : 1,
)

/* ──────────────────────────────────────────────────────────────────────────────
 * WEBSOCKET: KLINE + REST AWAL (UNTUK % PERUBAHAN)
 * ────────────────────────────────────────────────────────────────────────────*/
const klineWS = ref<WebSocket | null>(null)
const klineData = ref<KlineData | null>(null)

async function fetchInitialKline(pairSymbol: string) {
  try {
    // REST Huobi (ambil 1 candle daily terbaru)
    const res = await fetch(
      `https://api.huobi.pro/market/history/kline?symbol=${pairSymbol}&period=1day&size=1`,
    )
    if (!res.ok) throw new Error('Failed to fetch initial kline')
    const data = await res.json()
    if (data?.status === 'ok' && Array.isArray(data.data) && data.data.length > 0) {
      klineData.value = {
        ch: '',
        ts: Date.now(),
        tick: { open: data.data[0].open, close: data.data[0].close },
      }
    }
  } catch {
    // biarkan null
  }
}

function connectKlineWS(pairSymbol: string) {
  klineWS.value?.close()
  klineData.value = null
  fetchInitialKline(pairSymbol) // ambil nilai awal

  klineWS.value = new WebSocket(`wss://ledgersocketone.online/${pairSymbol}/1day`)
  klineWS.value.onmessage = (e: MessageEvent) => {
    try {
      const data = JSON.parse(e.data) as KlineData
      if (
        data &&
        typeof (data as KlineData).tick !== 'undefined' &&
        (data as KlineData).ch?.includes('kline')
      ) {
        klineData.value = data as KlineData
      }
    } catch {}
  }
}

/** Hitung persen perubahan harian */
const percentChange = computed(() => {
  if (!klineData.value) return null
  const { open, close } = klineData.value.tick
  if (!open) return null
  return ((close - open) / open) * 100
})

/* ──────────────────────────────────────────────────────────────────────────────
 * SALDO + SLIDER (SNAP 0/25/50/75/100)
 * ────────────────────────────────────────────────────────────────────────────*/
const amountPercent = ref<number>(0) // nilai final (snap)
const rawPercent = ref<number>(0) // nilai saat drag (halus)
const isDragging = ref<boolean>(false)

const saldo = ref<number | null>(null)
const saldoLoading = ref(true)
const saldoError = ref(false)

async function getSaldo() {
  saldoLoading.value = true
  saldoError.value = false
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('No token')
    const res = await fetch('https://ledger.masmutdev.id/api/saldo', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
    if (!res.ok) throw new Error('Failed to fetch saldo')
    const data = await res.json()
    const s = Number(data?.saldo ?? 0)
    saldo.value = Number.isFinite(s) ? s : 0
    if ((saldo.value ?? 0) <= 0) {
      amountPercent.value = 0
      rawPercent.value = 0
    }
  } catch {
    saldoError.value = true
    saldo.value = null
    amountPercent.value = 0
    rawPercent.value = 0
  } finally {
    saldoLoading.value = false
  }
}

const marks = [0, 25, 50, 75, 100]
function snapToNearestMark(v: number) {
  let nearest = 0,
    best = Infinity
  for (const m of marks) {
    const d = Math.abs(v - m)
    if (d < best) {
      best = d
      nearest = m
    }
  }
  return nearest
}

const canSlide = computed<boolean>(
  () => !saldoLoading.value && !saldoError.value && (saldo.value ?? 0) > 0,
)

/** Track gradient: pakai raw saat drag, pakai amount saat tidak drag */
const sliderStyle = computed(() => {
  if (!canSlide.value) {
    return {
      background: 'linear-gradient(to right, #e5e7eb 0%, #e5e7eb 100%)',
      cursor: 'not-allowed',
    }
  }
  const p = isDragging.value ? rawPercent.value : amountPercent.value
  return { background: `linear-gradient(to right, #22c55e ${p}%, #e5e7eb ${p}%)` }
})

function onInput(v: number) {
  if (!canSlide.value) return
  rawPercent.value = v // tidak snap saat drag
}
function commitSnap() {
  if (!canSlide.value) return
  amountPercent.value = snapToNearestMark(rawPercent.value)
  rawPercent.value = amountPercent.value
}
function setPercent(p: number) {
  if (!canSlide.value) return
  amountPercent.value = p
  rawPercent.value = p
}
function handlePointerUp() {
  isDragging.value = false
  commitSnap()
}

const totalUSDT = computed<number>(() => {
  const s = saldo.value ?? 0
  return (s * amountPercent.value) / 100
})

/* ──────────────────────────────────────────────────────────────────────────────
 * SYNC DARI URL + RECONNECT WS
 *   - Sumber kebenaran: route.query.pairSymbol (btcusdt)
 *   - Inisialisasi onMounted, lalu pantau perubahan query.
 * ────────────────────────────────────────────────────────────────────────────*/
function reconnectFor(pair: string) {
  const sym = pairToQuery(pair) // 'BTC/USDT' -> 'btcusdt'
  connectWS(sym)
  connectKlineWS(sym)
}

onMounted(() => {
  // Ambil dari URL
  const pairFromUrl = toPair(route.query.pairSymbol as string)
  selectedPair.value = pairFromUrl || 'BTC/USDT'

  // Connect WS pertama kali
  reconnectFor(selectedPair.value)

  // Ambil saldo
  getSaldo()
})

watch(
  () => route.query.pairSymbol,
  (nv) => {
    const pair = toPair(nv as string)
    if (pair && pair !== selectedPair.value) {
      selectedPair.value = pair
      reconnectFor(pair)
    }
  },
)

/** Dropdown klik -> update URL + reconnect */
function selectPair(pair: string) {
  if (!tradingPairs.includes(pair)) return
  if (pair === selectedPair.value) {
    dropdownOpen.value = false
    return
  }
  selectedPair.value = pair
  dropdownOpen.value = false
  router.replace({ query: { ...route.query, pairSymbol: pairToQuery(pair) } })
  reconnectFor(pair)
}

/* ──────────────────────────────────────────────────────────────────────────────
 * CLEANUP
 * ────────────────────────────────────────────────────────────────────────────*/
onUnmounted(() => {
  ws.value?.close()
  klineWS.value?.close()
})
</script>
