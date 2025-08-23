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

        <!-- ASKS -->
        <div class="space-y-1" v-if="depthReady">
          <div
            v-for="(ask, i) in top5Asks"
            :key="`ask-${ask[0]}-${i}`"
            class="relative flex justify-between overflow-hidden rounded"
            style="height: 28px"
          >
            <div
              class="absolute left-0 top-0 h-full bg-red-100 z-0 transition-all duration-200"
              :style="{ width: ((Number(ask[1]) / maxAskAmount) * 100).toFixed(2) + '%' }"
            />
            <p class="text-pink-400 text-sm text-right z-10 px-2 w-1/2">
              {{ Number(ask[0]).toLocaleString('en-US', { maximumFractionDigits: 2 }) }}
            </p>
            <p class="text-black text-sm text-left z-10 px-2 w-1/2">
              {{ Number(ask[1]).toLocaleString('en-US', { maximumFractionDigits: 5 }) }}
            </p>
          </div>
        </div>

        <!-- CURRENT PRICE -->
        <div class="text-center my-3" v-if="depthReady">
          <p class="text-[#2DBE87] font-semibold text-[28px]">
            {{ formatUsd2(depthData?.tick?.bids?.[0]?.[0]) }}
          </p>
          <p class="text-[#7F7F7F] text-[14px]">
            ≈ ${{ formatUsd2(depthData?.tick?.bids?.[0]?.[0]) }}
          </p>
        </div>

        <!-- BIDS -->
        <div class="space-y-1" v-if="depthReady">
          <div
            v-for="(bid, i) in top5Bids"
            :key="`bid-${bid[0]}-${i}`"
            class="relative flex justify-between overflow-hidden rounded"
            style="height: 28px"
          >
            <div
              class="absolute right-0 top-0 h-full bg-green-100 z-0 transition-all duration-200"
              :style="{ width: ((Number(bid[1]) / maxBidAmount) * 100).toFixed(2) + '%' }"
            />
            <p class="text-[#2DBE87] text-sm text-right z-10 px-2 w-1/2">
              {{ Number(bid[0]).toLocaleString('en-US', { maximumFractionDigits: 2 }) }}
            </p>
            <p class="text-black text-sm text-left z-10 px-2 w-1/2">
              {{ Number(bid[1]).toLocaleString('en-US', { maximumFractionDigits: 5 }) }}
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
          :value="
            depthData?.tick?.bids?.[0]?.[0]?.toLocaleString('en-US', {
              maximumFractionDigits: 2,
            }) ?? '-'
          "
          class="w-full bg-gray-200 text-gray-400 text-sm font-normal rounded px-3 py-2 cursor-not-allowed"
        />

        <!-- TOTAL: bisa ketik manual, sinkron dengan slider -->
        <div
          class="flex justify-between items-center bg-gray-100 rounded px-3 py-2 text-sm text-gray-500 font-normal mt-3"
        >
          <label for="totalUsdt" class="cursor-text">Total</label>

          <div class="relative z-50 text-gray-900 font-bold flex items-center space-x-1 right-10">
            <input
              id="totalAmount"
              type="number"
              inputmode="decimal"
              :step="activeTab === 'buy' ? 0.01 : 0.00000001"
              min="0"
              :max="available"
              class="bg-transparent text-right outline-none w-36"
              :disabled="availableLoading || availableError"
              v-model="totalAmountInput"
              @input="onTotalManualInputStr"
              :placeholder="activeTab === 'buy' ? '0.00' : '0.00000000'"
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
          @click.prevent="submitOrder"
        >
          {{ (activeTab === 'buy' ? 'Buy ' : 'Sell ') + baseAsset }}
        </button>
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
      <div class="max-w-md mx-auto mt-2 text-[11px] text-gray-500">
        <div>WS: {{ wsConnected ? 'connected' : 'disconnected' }}</div>
        <div>Selected: {{ pairToQuery(selectedPair) }}</div>
        <div>Last symbol from WS: {{ lastSym }}</div>
        <div>Depth msgs: {{ depthCount }} | Kline msgs: {{ klineCount }}</div>
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
  'CFX/USDT',
  'TRX/USDT',
  'TRUMP/USDT',
  'SHIB/USDT',
  'ARB/USDT',
  'FIL/USDT',
  'API3/USDT',
  'ENA/USDT',
  'BIO/USDT',
  'UNI/USDT',
  'BTT/USDT',
  'SATS/USDT',
  'MEME/USDT',
  'GT/USDT',
  'OP/USDT',
  'AAVE/USDT',
  'SNAKES/USDT',
  'TIA/USDT',
  'SOON/USDT',
  'ONDO/USDT',
  'NEO/USDT',
  'SKL/USDT',
  'MX/USDT',
  'FARTCOIN/USDT',
  'RATS/USDT',
  'ETC/USDT',
  'TRB/USDT',
  'AVAX/USDT',
  'BCH/USDT',
  'BSV/USDT',
  'IOTA/USDT',
  'CYBER/USDT',
  'WIF/USDT',
  'CORE/USDT',
  'WLD/USDT',
  'SEI/USDT',
  'VIRTUAL/USDT',
  'RENDER/USDT',
  'MOODENG/USDT',
  'JUP/USDT',
  'PONKE/USDT',
  'MNT/USDT',
  'PNUT/USDT',
  'EIGEN/USDT',
  'GRASS/USDT',
  'RAY/USDT',
  'EPIC/USDT',
  'ZRO/USDT',
  'BERA/USDT',
  'CA/USDT',
  'IP/USDT',
  'KAITO/USDT',
  'OMNI/USDT',
  'A8/USDT',
  'OBOL/USDT',
  'SAGA/USDT',
  'ORCA/USDT',
  'SHELL/USDT',
  'NAKA/USDT',
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
 * WEBSOCKET: AGGREGATOR (1 koneksi untuk depth + kline)
 * ────────────────────────────────────────────────────────────────────────────*/
const ws = ref<WebSocket | null>(null)
const depthData = ref<DepthData | null>(null)
const klineData = ref<KlineData | null>(null)

type Level = [number, number] // [price, amount]

function toLevels(arr: unknown): Level[] {
  if (!Array.isArray(arr)) return []
  return (arr as unknown[]).map((x): Level => {
    const row = x as [unknown, unknown]
    const p = Number(row?.[0])
    const q = Number(row?.[1])
    return [Number.isFinite(p) ? p : 0, Number.isFinite(q) ? q : 0]
  })
}

const wsConnected = ref(false)
const depthCount = ref(0)
const klineCount = ref(0)
const lastSym = ref<string>('')

function sameSym(a?: string, b?: string) {
  return String(a || '').toLowerCase() === String(b || '').toLowerCase()
}

function connectAggregator(pairSymbol: string) {
  ws.value?.close()
  depthData.value = null
  klineData.value = null
  depthCount.value = 0
  klineCount.value = 0
  wsConnected.value = false

  const wanted = String(pairSymbol).toLowerCase() // 'btcusdt'
  ws.value = new WebSocket('wss://ledgersocketone.online')

  ws.value.onopen = () => {
    wsConnected.value = true
    console.log('[WS] Connected to aggregator, pair =', wanted)
  }

  ws.value.onclose = () => {
    wsConnected.value = false
    console.warn('[WS] Closed, reconnecting in 5s...')
    setTimeout(() => connectAggregator(wanted), 5000)
  }

  ws.value.onmessage = (e: MessageEvent) => {
    try {
      const msg = JSON.parse(e.data)
      // simpan symbol terakhir yang datang (buat sanity check)
      lastSym.value = String(msg?.symbol || msg?.ch?.split?.('.')?.[1] || '')

      // DEPTH (aggregator)
      if (msg?.type === 'depth') {
        if (!sameSym(msg.symbol, wanted)) return
        const bids = toLevels(msg.bids).sort((a, b) => b[0] - a[0])
        const asks = toLevels(msg.asks).sort((a, b) => a[0] - b[0])

        // jika kosong, jangan set depthReady true
        if (!bids.length && !asks.length) return

        depthData.value = { ch: 'depth', ts: Number(msg.ts ?? Date.now()), tick: { bids, asks } }
        depthCount.value++
        return
      }

      // DEPTH (fallback huobi)
      if (typeof msg?.ch === 'string' && msg.ch.includes('depth')) {
        const parts = msg.ch.split('.')
        if (!sameSym(parts?.[1], wanted)) return
        const t = msg.tick ?? {}
        const bids = toLevels(t.bids).sort((a, b) => b[0] - a[0])
        const asks = toLevels(t.asks).sort((a, b) => a[0] - b[0])
        if (!bids.length && !asks.length) return

        depthData.value = { ch: 'depth', ts: Number(msg.ts ?? Date.now()), tick: { bids, asks } }
        depthCount.value++
        return
      }

      // KLINE (aggregator)
      if (msg?.type === 'kline' && msg.period === '1day') {
        if (!sameSym(msg.symbol, wanted)) return
        klineData.value = {
          ch: 'kline',
          ts: Number(msg.ts ?? Date.now()),
          tick: { open: Number(msg.open ?? 0), close: Number(msg.close ?? 0) },
        }
        klineCount.value++
        return
      }

      // KLINE (fallback huobi)
      if (typeof msg?.ch === 'string' && msg.ch.includes('kline.1day')) {
        const parts = msg.ch.split('.')
        if (!sameSym(parts?.[1], wanted)) return
        klineData.value = {
          ch: 'kline',
          ts: Number(msg.ts ?? Date.now()),
          tick: { open: Number(msg?.tick?.open ?? 0), close: Number(msg?.tick?.close ?? 0) },
        }
        klineCount.value++
        return
      }
    } catch (err) {
      console.error('WS parse error:', err)
    }
  }
}

/** Turunan tampilan */
const top5Asks = computed<Level[]>(() => {
  const a = depthData.value?.tick?.asks ?? []
  // asks harus ASC → terbaik index 0
  return a.slice(0, 5)
})
const top5Bids = computed<Level[]>(() => {
  const b = depthData.value?.tick?.bids ?? []
  // bids harus DESC → terbaik index 0
  return b.slice(0, 5)
})

// ready bila minimal ada 1 level
const depthReady = computed<boolean>(() => {
  const asks = depthData.value?.tick?.asks ?? []
  const bids = depthData.value?.tick?.bids ?? []
  return asks.length > 0 || bids.length > 0
})

const maxAskAmount = computed<number>(() => {
  const arr = top5Asks.value
  if (!arr.length) return 1
  const m = Math.max(...arr.map((a) => Number(a[1]) || 0))
  return m > 0 ? m : 1
})
const maxBidAmount = computed<number>(() => {
  const arr = top5Bids.value
  if (!arr.length) return 1
  const m = Math.max(...arr.map((b) => Number(b[1]) || 0))
  return m > 0 ? m : 1
})

/* ──────────────────────────────────────────────────────────────────────────────
 * WEBSOCKET: KLINE + REST AWAL (UNTUK % PERUBAHAN)
 * ────────────────────────────────────────────────────────────────────────────*/
// const klineWS = ref<WebSocket | null>(null)

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

// function connectKlineWS(pairSymbol: string) {
//   klineWS.value?.close()
//   klineData.value = null
//   fetchInitialKline(pairSymbol) // ambil nilai awal

//   klineWS.value = new WebSocket(
//     `wss://ledgersocketone.online/${pairSymbol}/1day`,
//   )
//   klineWS.value.onmessage = (e: MessageEvent) => {
//     try {
//       const data = JSON.parse(e.data) as KlineData
//       if (
//         data &&
//         typeof (data as KlineData).tick !== 'undefined' &&
//         (data as KlineData).ch?.includes('kline')
//       ) {
//         klineData.value = data as KlineData
//       }
//     } catch {}
//   }
// }

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

const saldo = ref<number | null>(null) // saldo USDT (untuk BUY)
const coinTotal = ref<number | null>(null) // total coin (untuk SELL)

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

// nilai numerik untuk perhitungan
const totalAmount = ref<number>(0)
// nilai string untuk input (biar bisa kosong/0 saat ketik)
const totalAmountInput = ref<string>('')

function roundTo(v: number, dp = 8): number {
  if (!Number.isFinite(v)) return 0
  return Number.parseFloat(v.toFixed(dp))
}

// sinkron persen dari total
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
  totalAmountInput.value =
    activeTab.value === 'buy' ? totalAmount.value.toFixed(2) : totalAmount.value.toFixed(8)
}

function commitSnap() {
  if (!canSlide.value) return
  amountPercent.value = snapToNearestMark(rawPercent.value)
  rawPercent.value = amountPercent.value
  const s = available.value
  totalAmount.value = roundTo((s * amountPercent.value) / 100, 8)
  totalAmountInput.value =
    activeTab.value === 'buy' ? totalAmount.value.toFixed(2) : totalAmount.value.toFixed(8)
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

// input manual (string) → parse & clamp
function onTotalManualInputStr() {
  const a = available.value
  const rawAny = totalAmountInput.value as unknown
  const raw = (typeof rawAny === 'string' ? rawAny : String(rawAny ?? '')).trim()

  // kosong → biarin input kosong, tapi state numeric = 0
  if (raw === '') {
    totalAmount.value = 0
    // jangan ubah totalAmountInput di sini (biar tetap kosong)
    syncPercentFromTotal()
    return
  }

  // parse angka (antisipasi koma)
  let v = Number(raw.replace(',', ''))
  if (!Number.isFinite(v)) return

  // clamp ke [0, available]
  if (v < 0) v = 0
  if (a > 0 && v > a) v = a

  // pembulatan sesuai tab
  v = roundTo(v, activeTab.value === 'buy' ? 2 : 8)
  totalAmount.value = v

  // sinkronkan kembali input dalam bentuk string terformat
  totalAmountInput.value = activeTab.value === 'buy' ? v.toFixed(2) : v.toFixed(8)

  syncPercentFromTotal()
}
// reset saat pindah BUY/SELL
watch(activeTab, () => {
  totalAmount.value = 0
  totalAmountInput.value = ''
  rawPercent.value = 0
  amountPercent.value = 0
  getAvailable()
})

// ambil available (USDT/coin)
async function getAvailable() {
  availableLoading.value = true
  availableError.value = false
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('No token')

    if (activeTab.value === 'buy') {
      const res = await fetch('https://one-ledger.masmutpanel.my.id/api/saldo', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      const s = Number(data?.saldo ?? 0)
      saldo.value = Number.isFinite(s) ? s : 0
      coinTotal.value = null
    } else {
      const res = await fetch(
        `https://one-ledger.masmutpanel.my.id/api/crypto-total/${baseAsset.value}`,
        {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        },
      )
      if (!res.ok) throw new Error()
      const data = await res.json()
      const t = Number(data?.total_amount ?? 0)
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
    saldo.value = activeTab.value === 'buy' ? null : saldo.value
    coinTotal.value = activeTab.value === 'sell' ? null : coinTotal.value
    amountPercent.value = 0
    rawPercent.value = 0
    totalAmount.value = 0
    totalAmountInput.value = ''
  } finally {
    availableLoading.value = false
  }
}

/* ──────────────────────────────────────────────────────────────────────────────
 * SYNC DARI URL + RECONNECT WS
 *   - Sumber kebenaran: route.query.pairSymbol (btcusdt)
 *   - Inisialisasi onMounted, lalu pantau perubahan query.
 * ────────────────────────────────────────────────────────────────────────────*/
function reconnectFor(pair: string) {
  const sym = pairToQuery(pair) // 'BTC/USDT' -> 'btcusdt'
  connectAggregator(sym)
  fetchInitialKline(sym) // hanya jika mau fallback REST sekali
}

onMounted(() => {
  // Ambil dari URL
  const pairFromUrl = toPair(route.query.pairSymbol as string)
  selectedPair.value = pairFromUrl || 'BTC/USDT'

  // Connect WS pertama kali (aggregator tunggal)
  reconnectFor(selectedPair.value)

  // Ambil saldo & open orders
  getAvailable()
  getOpenOrders()
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
})
const submitting = ref(false)
const submitError = ref<string | null>(null)
const API_BASE = 'https://one-ledger.masmutpanel.my.id/api' // sesuaikan

function nowIsoUtc() {
  return new Date().toISOString()
}

interface OpenOrder {
  id: number
  id_users: number
  symbol: string
  daily_pnl: string
  pnl: string
  last_prices: string
  balances: number
  jenis: string
  detail_balances: string
  status_position: number
  time_order: string
  timestamp: string
  created_at?: string
  updated_at?: string
}

async function readErrorMessage(res: Response): Promise<string> {
  // coba JSON
  try {
    const data = await res.clone().json()
    if (typeof data?.message === 'string' && data.message) return data.message
    // Laravel validation: { errors: { field: ["msg"] } }
    if (data?.errors && typeof data.errors === 'object') {
      const firstKey = Object.keys(data.errors)[0]
      const firstMsg = Array.isArray(data.errors[firstKey]) ? data.errors[firstKey][0] : null
      if (firstMsg) return String(firstMsg)
    }
  } catch {}
  // fallback: text
  try {
    const t = await res.clone().text()
    if (t) return t
  } catch {}
  return `Request failed (${res.status})`
}

function bestBid(): number {
  const bids = depthData.value?.tick?.bids
  // bid terbaik biasanya di index 0
  return Array.isArray(bids) && bids.length ? Number(bids[0][0]) : 0
}

function bestAsk(): number {
  const asks = depthData.value?.tick?.asks
  // banyak feed menaruh ask terbaik di elemen terakhir
  return Array.isArray(asks) && asks.length ? Number(asks[asks.length - 1][0]) : 0
}

async function submitOrder() {
  if (submitting.value) return
  submitError.value = null

  const token = localStorage.getItem('token')
  if (!token) {
    const msg = 'Token tidak ada.'
    submitError.value = msg
    modal.open('Failed', msg)
    return
  }

  const pct = Number(percentChange.value ?? 0)
  const amt = Number(totalAmount.value || 0)

  // pakai harga pasar yang tepat:
  // BUY → ambil ask teratas; SELL → ambil bid teratas

  const price = activeTab.value === 'buy' ? bestAsk() : bestBid()

  const dailyPnl = ((amt * pct) / 100).toFixed(8)

  // VALIDASI sisi UI biar gak kirim 0
  if (activeTab.value === 'buy' && amt < 10) {
    modal.open('Failed', 'Minimum purchase amount is 10 USDT.')
    return
  }
  if (activeTab.value === 'sell' && amt < 0.00000001) {
    modal.open('Failed', 'Minimum sell amount is 0.00000001.')
    return
  }

  const endpoint =
    activeTab.value === 'buy'
      ? `${API_BASE}/save-transactions-crypto-buy`
      : `${API_BASE}/save-transactions-crypto-sell`

  const PRICE_FMT_PAYLOAD = new Intl.NumberFormat('en-US', {
    useGrouping: true,
    maximumFractionDigits: 0,
  })

  // potong desimal biar konsisten (119848.01 -> "119,848")
  function formatLastPriceForPayload(price: number): string {
    if (!Number.isFinite(price)) return '0'
    return PRICE_FMT_PAYLOAD.format(Math.trunc(price))
  }

  // Payload berbeda:
  const payload =
    activeTab.value === 'buy'
      ? {
          symbol: baseAsset.value,
          daily_pnl: dailyPnl,
          pnl: `${pct.toFixed(2)}%`,
          last_prices: formatLastPriceForPayload(price),
          balances_buy: Number(amt.toFixed(2)), // USDT dipakai (>= 10)
          status_position: 1,
          time_order: nowIsoUtc(),
        }
      : {
          symbol: baseAsset.value,
          daily_pnl: dailyPnl,
          pnl: `${pct.toFixed(2)}%`,
          last_prices: formatLastPriceForPayload(price),
          balances_sell: Number(amt.toFixed(8)), // JUMLAH COIN dijual (>= 1e-8)
          status_position: 2, // biasanya Close saat sell
          time_order: nowIsoUtc(),
        }

  submitting.value = true
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const msg = await readErrorMessage(res)
      modal.open('Failed', msg)
      throw new Error(msg)
    }

    // const data: { success: boolean; message: string; id: number } = await res.json()

    amountPercent.value = 0
    rawPercent.value = 0
    totalAmount.value = 0
    totalAmountInput.value = ''

    modal.open(`${activeTab.value === 'buy' ? 'Buy' : 'Sell'} Succesfull`, ` Order Created.`, () =>
      window.location.reload(),
    )
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed kirim order.'
    submitError.value = msg
    modal.open('Failed', msg)
  } finally {
    submitting.value = false
  }
}

const openOrders = ref<OpenOrder[]>([])
const loadingOrders = ref(true)
const errorOrders = ref(false)

async function getOpenOrders() {
  loadingOrders.value = true
  errorOrders.value = false
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Token tidak ada.')

    const res = await fetch('https://one-ledger.masmutpanel.my.id/api/open-orders-crypto', {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) throw new Error('Failed ambil data open orders.')

    const data = await res.json()
    openOrders.value = Array.isArray(data) ? data : []
  } catch {
    errorOrders.value = true
    openOrders.value = []
  } finally {
    loadingOrders.value = false
  }
}

function formatUsd2(v: unknown): string {
  const n = Number(v)
  return Number.isFinite(n) ? n.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '-'
}

onMounted(() => {
  reconnectFor(selectedPair.value)
  getAvailable()
  getOpenOrders()
})
watch(activeTab, () => getAvailable())
watch(
  () => route.query.pairSymbol,
  () => getAvailable(),
)
</script>
