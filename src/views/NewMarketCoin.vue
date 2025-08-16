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
            v-for="ask in top7Asks"
            :key="ask[0]"
            class="relative flex justify-between overflow-hidden rounded"
            style="height: 17.5px"
          >
            <!-- BG bar -->
            <div
              class="absolute left-0 top-0 h-full bg-red-100 z-0 transition-all duration-200"
              :style="{ width: `${((ask[1] / maxAskAmount) * 100).toFixed(2)}%` }"
            ></div>
            <!-- Data -->
            <p class="text-pink-400 text-[10px] text-start z-10 px-2 w-1/2">
              {{ ask[0].toLocaleString('en-US', { maximumFractionDigits: 2 }) }}
            </p>
            <p class="text-black text-[10px] text-right z-10 px-2 w-1/2">
              {{ ask[1].toLocaleString('en-US', { maximumFractionDigits: 5 }) }}
            </p>
          </div>
        </div>

        <!-- CURRENT PRICE (Bid Teratas, jika ada) -->
        <div class="text-center my-3" v-if="depthData">
          <p class="text-black font-semibold text-[16px]">
            {{
              depthData.tick.bids[0]?.[0]?.toLocaleString('en-US', { maximumFractionDigits: 2 }) ??
              '-'
            }}
          </p>
          <p class="text-[#7F7F7F] text-[10px]">
            ≈ ${{
              depthData.tick.bids[0]?.[0]?.toLocaleString('en-US', { maximumFractionDigits: 2 }) ??
              '-'
            }}
          </p>
        </div>

        <!-- BIDS (BUY, hijau) -->
        <div class="space-y-1" v-if="depthData">
          <div
            v-for="bid in top7Bids"
            :key="bid[0]"
            class="relative flex justify-between overflow-hidden rounded"
            style="height: 17.5px"
          >
            <!-- BG bar -->
            <div
              class="absolute right-0 top-0 h-full bg-green-100 z-0 transition-all duration-200"
              :style="{ width: `${((bid[1] / maxBidAmount) * 100).toFixed(2)}%` }"
            ></div>
            <!-- Data -->
            <p class="text-[#2DBE87] text-[10px] text-start z-10 px-2 w-1/2">
              {{ bid[0].toLocaleString('en-US', { maximumFractionDigits: 2 }) }}
            </p>
            <p class="text-black text-[10px] text-right z-10 px-2 w-1/2">
              {{ bid[1].toLocaleString('en-US', { maximumFractionDigits: 5 }) }}
            </p>
          </div>
        </div>
      </div>

      <!-- KANAN: FORM BELI/JUAL -->
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
          :value="
            marketPrice ? marketPrice.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '-'
          "
          class="w-full bg-gray-200 text-gray-400 text-sm font-normal rounded px-3 py-2 cursor-not-allowed"
        />

        <!-- TOTAL -->
        <div
          class="flex justify-between items-center bg-gray-100 rounded px-3 py-2 text-sm text-gray-500 font-normal mt-3"
        >
          <label for="totalUsdt" class="cursor-text">Total</label>

          <div class="relative z-50 text-gray-900 font-bold flex items-center space-x-1 right-10">
            <input
              id="totalAmount"
              ref="amountInputEl"
              type="text"
              inputmode="decimal"
              autocomplete="off"
              class="bg-transparent text-right outline-none w-36"
              :disabled="availableLoading || availableError"
              v-model="totalAmountInput"
              :placeholder="activeTab === 'buy' ? '0,00' : '0,00000000'"
              @focus="onAmountFocus"
              @blur="onAmountBlur"
              @input="onAmountTyping"
              @keydown.enter.prevent="onAmountCommit"
            />
            <span>{{ availableUnit }}</span>
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
              <template v-if="availableLoading">...</template>
              <template v-else-if="availableError">-</template>
              <template v-else>
                {{ available.toLocaleString('en-US', { maximumFractionDigits: 8 }) }}
                {{ availableUnit }}
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
          :disabled="submitting || !marketPrice || totalAmount <= 0"
          @click="submitTrade"
        >
          {{ (activeTab === 'buy' ? 'Buy ' : 'Sell ') + baseAsset }}
        </button>
        <p v-if="submitError" class="text-red-600 text-xs mt-2">{{ submitError }}</p>
      </div>
    </div>

    <div class="max-w-md mx-auto border border-gray-200 rounded-md p-5 mb-20">
      <div class="text-center">
        <p class="text-gray-400 text-sm font-normal mb-2" style="font-family: 'Inter', sans-serif">
          Let Top Traders Trade for You
        </p>
        <RouterLink
          to="/futures"
          role="button"
          class="inline-flex items-center justify-center text-gray-700 text-xs font-normal border border-gray-300 rounded px-4 py-1.5 hover:bg-gray-100 transition"
          style="font-family: 'Inter', sans-serif"
        >
          Copy Trading
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/* ──────────────────────────────────────────────────────────────────────────────
 * IMPORTS & TIPE DATA
 * ────────────────────────────────────────────────────────────────────────────*/
import { Icon } from '@iconify/vue'
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApiAlertStore } from '@/stores/apiAlert'
const modal = useApiAlertStore()

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
const selectedPair = ref('BTC/USDT') // BASE/QUOTE

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
 * ────────────────────────────────────────────────────────────────────────────*/
function toPair(input?: string): string {
  if (!input) return ''
  const v = input.toUpperCase().replace('/', '')
  if (!v.endsWith('USDT')) return ''
  const base = v.slice(0, -4)
  const pair = `${base}/USDT`
  return tradingPairs.includes(pair) ? pair : ''
}
function pairToQuery(pair: string): string {
  return pair.replace('/', '').toLowerCase()
}
function pairToApiSymbol(pair: string): string {
  return pair.replace('/', '').toUpperCase() // BTCUSDT
}
const baseAsset = computed(() => selectedPair.value.split('/')[0])

/* ──────────────────────────────────────────────────────────────────────────────
 * WEBSOCKET: DEPTH ORDERBOOK
 * ────────────────────────────────────────────────────────────────────────────*/
const ws = ref<WebSocket | null>(null)
const depthData = ref<DepthData | null>(null)

function connectWS(pairSymbol: string) {
  ws.value?.close()
  depthData.value = null
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
// Aman + sesuai urutan buku
const top7Asks = computed(() => {
  if (!depthData.value) return []
  const asks = [...depthData.value.tick.asks].sort((a, b) => a[0] - b[0]) // ASC
  return asks.slice(0, 7).reverse()
})

const top7Bids = computed(() => {
  if (!depthData.value) return []
  const bids = [...depthData.value.tick.bids].sort((a, b) => b[0] - a[0]) // DESC
  return bids.slice(0, 7)
})

const maxAskAmount = computed(() =>
  top7Asks.value.length ? Math.max(...top7Asks.value.map((a) => a[1])) : 1,
)

const maxBidAmount = computed(() =>
  top7Bids.value.length ? Math.max(...top7Bids.value.map((b) => b[1])) : 1,
)

/* ──────────────────────────────────────────────────────────────────────────────
 * WEBSOCKET: KLINE + REST AWAL (UNTUK % PERUBAHAN)
 * ────────────────────────────────────────────────────────────────────────────*/
const klineWS = ref<WebSocket | null>(null)
const klineData = ref<KlineData | null>(null)

async function fetchInitialKline(pairSymbol: string) {
  try {
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
  } catch {}
}
function connectKlineWS(pairSymbol: string) {
  klineWS.value?.close()
  klineData.value = null
  fetchInitialKline(pairSymbol)
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
const percentChange = computed(() => {
  if (!klineData.value) return null
  const { open, close } = klineData.value.tick
  if (!open) return null
  return ((close - open) / open) * 100
})

/* ──────────────────────────────────────────────────────────────────────────────
 * SALDO + SLIDER
 * ────────────────────────────────────────────────────────────────────────────*/
const amountPercent = ref<number>(0)
const rawPercent = ref<number>(0)
const isDragging = ref<boolean>(false)

const saldo = ref<number | null>(null) // USDT (BUY)
const coinTotal = ref<number | null>(null) // COIN (SELL)
const availableLoading = ref(true)
const availableError = ref(false)

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
const available = computed<number>(() =>
  activeTab.value === 'buy' ? (saldo.value ?? 0) : (coinTotal.value ?? 0),
)
const availableUnit = computed(() => (activeTab.value === 'buy' ? 'USDT' : baseAsset.value))
const canSlide = computed<boolean>(
  () => !availableLoading.value && !availableError.value && available.value > 0,
)

/** Track gradient */
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

const totalAmount = ref<number>(0)
const totalAmountInput = ref<string>('')

function roundTo(v: number, dp = 8): number {
  if (!Number.isFinite(v)) return 0
  return Number.parseFloat(v.toFixed(dp))
}
function syncPercentFromTotal() {
  const a = available.value
  const v = totalAmount.value
  const pct = a > 0 ? (v / a) * 100 : 0
  rawPercent.value = pct
  amountPercent.value = pct
}
function onInput(v: number) {
  if (!canSlide.value) return
  rawPercent.value = v
  const s = available.value
  totalAmount.value = roundTo((s * v) / 100, 8)
  if (!isEditingAmount.value) {
    totalAmountInput.value =
      activeTab.value === 'buy'
        ? formatLocaleDecimal(totalAmount.value)
        : formatLocaleDecimal(totalAmount.value)
  }
}

function commitSnap() {
  if (!canSlide.value) return
  amountPercent.value = snapToNearestMark(rawPercent.value)
  rawPercent.value = amountPercent.value
  const s = available.value
  totalAmount.value = roundTo((s * amountPercent.value) / 100, 8)
  if (!isEditingAmount.value) {
    totalAmountInput.value = formatLocaleDecimal(totalAmount.value)
  }
}
function setPercent(p: number) {
  if (!canSlide.value) return
  amountPercent.value = p
  rawPercent.value = p
  const s = available.value
  totalAmount.value = roundTo((s * p) / 100, 8)
  totalAmountInput.value =
    activeTab.value === 'buy' ? totalAmount.value.toFixed(2) : totalAmount.value.toFixed(8)
}
function handlePointerUp() {
  isDragging.value = false
  commitSnap()
}
// --- tambahkan di script ---
const amountInputEl = ref<HTMLInputElement | null>(null)
const isEditingAmount = ref(false)
const dp = computed(() => (activeTab.value === 'buy' ? 2 : 8))

// format ke "id-ID" → 20,00
function formatLocaleDecimal(num: number): string {
  if (!Number.isFinite(num)) return ''
  return num.toLocaleString('id-ID', {
    minimumFractionDigits: dp.value,
    maximumFractionDigits: dp.value,
  })
}

// parse dari string "20,00" / "20.000,00" ke number 20
function parseLocaleDecimal(str: string): number {
  if (!str) return NaN
  // buang spasi, buang pemisah ribuan (.)
  const cleaned = str.replace(/\s/g, '').replace(/\./g, '').replace(',', '.')
  return Number(cleaned)
}

// fokus: kalau nilai 0 → kosongkan, select agar langsung ketik
function onAmountFocus(e: FocusEvent) {
  isEditingAmount.value = true
  if (!totalAmount.value) totalAmountInput.value = ''
  requestAnimationFrame(() => (e.target as HTMLInputElement).select())
}

// saat ketik: filter karakter, JANGAN format di sini
function onAmountTyping() {
  // izinkan hanya angka, koma, titik
  totalAmountInput.value = totalAmountInput.value.replace(/[^\d.,]/g, '')
}

// commit (enter) = blur
function onAmountCommit() {
  amountInputEl.value?.blur()
}

// blur: parse → clamp → round → simpan → format tampilan
function onAmountBlur() {
  isEditingAmount.value = false

  const raw = (totalAmountInput.value || '').trim()
  let v = parseLocaleDecimal(raw)

  if (!Number.isFinite(v)) v = 0
  if (v < 0) v = 0
  const a = available.value
  if (a > 0 && v > a) v = a

  v = roundTo(v, dp.value) // fungsi roundTo milikmu
  totalAmount.value = v
  totalAmountInput.value = v ? formatLocaleDecimal(v) : ''
  syncPercentFromTotal()
}

/* ──────────────────────────────────────────────────────────────────────────────
 * SYNC DARI URL + RECONNECT WS
 * ────────────────────────────────────────────────────────────────────────────*/
function reconnectFor(pair: string) {
  const sym = pairToQuery(pair)
  connectWS(sym)
  connectKlineWS(sym)
}

function rawSymbolFromRoute(): string {
  return (route.query.symbol as string) ?? (route.query.pairSymbol as string) ?? ''
}

onMounted(() => {
  const pairFromUrl = toPair(rawSymbolFromRoute())
  selectedPair.value = pairFromUrl || 'BTC/USDT'
  reconnectFor(selectedPair.value)
  getAvailable()
})

watch(
  () => [route.query.symbol, route.query.pairSymbol],
  ([sym, pairSym]) => {
    const pair = toPair((sym as string) ?? (pairSym as string))
    if (pair && pair !== selectedPair.value) {
      selectedPair.value = pair
      reconnectFor(pair)
      getAvailable()
    }
  },
)

function selectPair(pair: string) {
  if (!tradingPairs.includes(pair)) return
  if (pair === selectedPair.value) {
    dropdownOpen.value = false
    return
  }
  selectedPair.value = pair
  dropdownOpen.value = false
  router.replace({ query: { ...route.query, symbol: pairToQuery(pair) } }) // <— standar pakai 'symbol'
  reconnectFor(pair)
  getAvailable()
}

/* ──────────────────────────────────────────────────────────────────────────────
 * CLEANUP
 * ────────────────────────────────────────────────────────────────────────────*/
onUnmounted(() => {
  ws.value?.close()
  klineWS.value?.close()
})

/* ──────────────────────────────────────────────────────────────────────────────
 * ORDER: MARKET PRICE & SUBMIT /trades
 * ────────────────────────────────────────────────────────────────────────────*/
const submitting = ref(false)
const submitError = ref<string>('')
const API_BASE = 'https://ledger.masmutdev.id/api' // sesuaikan

function bestBid(): number {
  const bids = depthData.value?.tick?.bids
  // Huobi: bids descending → top bid = index 0
  return Array.isArray(bids) && bids.length ? Number(bids[0][0]) : 0
}
function bestAsk(): number {
  const asks = depthData.value?.tick?.asks
  // Huobi: asks ascending → best ask = index 0  ✅
  return Array.isArray(asks) && asks.length ? Number(asks[0][0]) : 0
}

const marketPrice = computed<number>(() => (activeTab.value === 'buy' ? bestAsk() : bestBid()))

watch(activeTab, () => {
  // reset input saat pindah BUY/SELL dan refresh available
  totalAmount.value = 0
  totalAmountInput.value = ''
  rawPercent.value = 0
  amountPercent.value = 0
  getAvailable()
})

async function getAvailable() {
  availableLoading.value = true
  availableError.value = false
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('No token')

    if (activeTab.value === 'buy') {
      const res = await fetch(`${API_BASE}/saldo`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      const s = Number(data?.saldo ?? 0)
      saldo.value = Number.isFinite(s) ? s : 0
      coinTotal.value = null
    } else {
      const sym = pairToApiSymbol(selectedPair.value) // "BTCUSDT"
      const res = await fetch(`${API_BASE}/positions/${sym}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      })
      if (!res.ok) throw new Error()
      const data = await res.json() // { qty, avg_cost, ... }
      const t = Number(data?.qty ?? 0)
      coinTotal.value = Number.isFinite(t) ? t : 0
    }

    const a = available.value
    if (a <= 0) {
      totalAmount.value = 0
      totalAmountInput.value = ''
      rawPercent.value = 0
      amountPercent.value = 0
    } else {
      if (totalAmount.value > a) totalAmount.value = a
      totalAmountInput.value =
        activeTab.value === 'buy' ? totalAmount.value.toFixed(2) : totalAmount.value.toFixed(8)
      syncPercentFromTotal()
    }
  } catch {
    availableError.value = true
    if (activeTab.value === 'buy') saldo.value = null
    if (activeTab.value === 'sell') coinTotal.value = null
    amountPercent.value = 0
    rawPercent.value = 0
    totalAmount.value = 0
    totalAmountInput.value = ''
  } finally {
    availableLoading.value = false
  }
}

async function submitTrade() {
  if (submitting.value) return
  submitError.value = ''

  try {
    submitting.value = true

    const token = localStorage.getItem('token')
    if (!token) throw new Error('No token')

    const side = activeTab.value === 'buy' ? 'BUY' : 'SELL'

    // pakai top-of-book sesuai sisi
    let price = marketPrice.value
    if (!price || price <= 0) throw new Error('Harga market tidak tersedia')

    // sanity: spread wajar (opsional, tapi bagus buat cegah data depth aneh)
    const bid = bestBid()
    const ask = bestAsk()
    if (bid > 0 && ask > 0) {
      const spreadPct = ((ask - bid) / bid) * 100
      if (spreadPct > 2) {
        throw new Error(`Spread terlalu lebar (${spreadPct.toFixed(2)}%).`)
      }
      if (side === 'buy' && price !== ask) price = ask
      if (side === 'sell' && price !== bid) price = bid
    }

    const amount = Number(totalAmount.value)
    if (!(amount > 0)) throw new Error('Total tidak valid')

    // Qty coin:
    // BUY: USDT / price, SELL: langsung amount coin
    let qty = side === 'BUY' ? amount / price : amount

    // Clamp & FLOOR supaya tidak oversell gara-gara pembulatan
    if (side === 'SELL') {
      const maxQty = Number(coinTotal.value ?? 0)
      const EPS = 1e-10
      qty = Math.min(qty, Math.max(0, maxQty - EPS))
      qty = Math.floor(qty * 1e8) / 1e8
    } else {
      // BUY: floor juga aman (lebih konservatif)
      qty = Math.floor(qty * 1e8) / 1e8
    }

    if (!(qty > 0)) throw new Error('Qty = 0 setelah pembulatan')

    const payload = {
      symbol: pairToApiSymbol(selectedPair.value), // "BTCUSDT"
      side,
      price,
      qty,
      fee: 0,
    }

    const res = await fetch(`${API_BASE}/save-trades`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.message || `HTTP ${res.status}`)
    }

    await res.json()
    modal?.open?.('Success', 'Order Created')

    // refresh saldo/posisi & reset input
    await getAvailable()
    totalAmount.value = 0
    totalAmountInput.value = ''
    rawPercent.value = 0
    amountPercent.value = 0
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Gagal kirim order'
    submitError.value = msg
    modal?.open?.('error', msg)
  } finally {
    submitting.value = false
  }
}
</script>
