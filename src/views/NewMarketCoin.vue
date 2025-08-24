<template>
  <div>
    <!-- HEADER: pair dropdown + toggle chart -->
    <div class="flex items-center justify-between max-w-md mx-4 mt-4">
      <div class="flex flex-row items-center">
        <button v-if="showChart" class="rounded-lg pr-2 py-1 text-black" @click="showChart = false"
          :aria-pressed="false">
          <Icon icon="tabler:arrow-left" class="w-5 h-5" />
        </button>

        <div class="relative inline-block">
          <!-- Trigger Dropdown -->
          <div class="flex items-center space-x-1 cursor-pointer" @click="dropdownOpen = !dropdownOpen">
            <span class="font-semibold text-black text-base">{{ selectedPair }}</span>
            <Icon icon="tabler:chevron-down" class="text-black text-base" />
          </div>

          <!-- Dropdown -->
          <div v-if="dropdownOpen" class="absolute z-50 mt-2 w-40 bg-white border border-gray-200 rounded shadow-md">
            <ul class="max-h-64 overflow-auto">
              <li v-for="pair in tradingPairs" :key="pair" @click="selectPair(pair)"
                class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black">
                {{ pair }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="flex items-center space-x-4 text-gray-400 text-lg">
        <Icon :icon="showChart ? 'tabler:brand-databricks' : 'tabler:chart-bar'" class="w-5 h-5 cursor-pointer"
          :aria-pressed="showChart" @click="showChart = !showChart" />
      </div>
    </div>

    <!-- PRICE + CHANGE -->
    <div class="max-w-md mx-4 mt-1">
      <div class="text-start" v-if="depthData && showChart">
        <p class="text-teal-500 font-semibold text-[20px]">
          {{
            (depthData.tick.bids[0]?.[0] ?? 0).toLocaleString('en-US', { maximumFractionDigits: 2 })
          }}
        </p>
        <div class="flex flex-row items-center">
          <p class="text-[#7F7F7F] text-[10px]">
            ≈ ${{
              (depthData.tick.bids[0]?.[0] ?? 0).toLocaleString('en-US', { maximumFractionDigits: 2 })
            }}
          </p>
          <span class="ml-1 text-[10px] font-semibold"
            :class="percentChange !== null && percentChange >= 0 ? 'text-teal-600' : 'text-red-600'">
            {{
              percentChange !== null
                ? (percentChange > 0 ? '+' : '') + percentChange.toFixed(2) + '%'
                : '-'
            }}
          </span>
        </div>
      </div>

      <span v-else class="text-sm font-semibold"
        :class="percentChange !== null && percentChange >= 0 ? 'text-teal-600' : 'text-red-600'">
        {{
          percentChange !== null
            ? (percentChange > 0 ? '+' : '') + percentChange.toFixed(2) + '%'
            : '-'
        }}
      </span>
    </div>

    <!-- CHART + TF -->
    <div v-if="showChart" class="grid grid-cols-[50px_1fr] gap-2 items-stretch w-full relative">
      <aside class="rounded-xl border border-white/10 p-2">
        <div class="flex flex-col gap-2 text-xs">
          <button class="pl-1 px-2 py-1 rounded-lg border transition-colors" :class="{
            'bg-teal-500 text-white border-teal-500': kind === 'candlestick',
            'hover:bg-white/5': kind !== 'candlestick',
          }" :aria-pressed="kind === 'candlestick'" @click="kind = 'candlestick'">
            <Icon icon="tabler:chart-candle" class="w-5 h-5" />
          </button>

          <button class="pl-1 px-2 py-1 rounded-lg border transition-colors" :class="{
            'bg-teal-500 text-white border-teal-500': kind === 'line',
            'hover:bg-white/5': kind !== 'line',
          }" :aria-pressed="kind === 'line'" @click="kind = 'line'">
            <Icon icon="tabler:chart-line" class="w-5 h-5" />
          </button>

          <button class="pl-1 px-2 py-1 rounded-lg border transition-colors" :class="{
            'bg-teal-500 text-white border-teal-500': kind === 'area',
            'hover:bg-white/5': kind !== 'area',
          }" :aria-pressed="kind === 'area'" @click="kind = 'area'">
            <Icon icon="tabler:chart-area" class="w-5 h-5" />
          </button>
        </div>
      </aside>

      <section class="rounded-2xl min-w-0 overflow-hidden">
        <LightChart class="block w-full min-w-0" :series-type="kind" :candle-data="dataForChart.candleData"
          :data="dataForChart.data" :options="chartOptions" :series-options="seriesOptions" :fit="true" />
      </section>

      <div class="flex flex-row items-center absolute -top-8.5 right-4 space-x-2">
        <button v-for="t in tfs" :key="t"
          class="px-1.5 py-1 rounded-md border text-[11px] leading-none transition-colors" :class="{
            'bg-teal-500 text-white border-teal-500': tf === t,
            'hover:bg-white/5': tf !== t,
          }" :aria-pressed="tf === t" @click="tf = t">
          {{ t }}
        </button>
      </div>
    </div>

    <!-- MINI ORDERBOOK (di bawah chart) -->
    <div v-if="showChart" class="flex flex-row justify-between items-center mx-4 mb-1">
      <p class="text-[10px] text-gray-400">Bid</p>
      <p class="text-[10px] text-gray-400">Ask</p>
      <div class="w-[40px] flex justify-center items-center bg-gray-100 rounded-sm text-gray-400">
        <p class="text-[10px] ml-1">12</p>
        <Icon icon="tabler:chevron-down" class="text-gray-700 w-3 h-3" />
      </div>
    </div>

    <div v-if="showChart" class="flex w-full justify-between items-center">
      <!-- BIDS -->
      <div class="space-y-1 w-full" v-if="depthData">
        <div v-for="bid in top12Bids" :key="bid[0]" class="relative flex justify-between overflow-hidden rounded"
          style="height: 17.5px">
          <div class="absolute right-0 top-0 h-full bg-green-100 z-0 transition-all duration-200"
            :style="{ width: `${((bid[1] / maxBidAmount) * 100).toFixed(2)}%` }" />
          <p class="text-black text-[10px] z-10 px-2 w-1/2">
            {{ bid[1].toLocaleString('en-US', { maximumFractionDigits: 5 }) }}
          </p>
          <p class="text-[#2DBE87] text-[10px] text-right z-10 px-2 w-1/2">
            {{ bid[0].toLocaleString('en-US', { maximumFractionDigits: 2 }) }}
          </p>
        </div>
      </div>

      <!-- ASKS -->
      <div class="space-y-1 w-full" v-if="depthData">
        <div v-for="ask in top12Asks" :key="ask[0]" class="relative flex justify-between overflow-hidden rounded"
          style="height: 17.5px">
          <div class="absolute left-0 top-0 h-full bg-red-100 z-0 transition-all duration-200"
            :style="{ width: `${((ask[1] / maxAskAmount) * 100).toFixed(2)}%` }" />
          <p class="text-pink-400 text-[10px] z-10 px-2 w-1/2">
            {{ ask[0].toLocaleString('en-US', { maximumFractionDigits: 2 }) }}
          </p>
          <p class="text-black text-[10px] text-right z-10 px-2 w-1/2">
            {{ ask[1].toLocaleString('en-US', { maximumFractionDigits: 5 }) }}
          </p>
        </div>
      </div>
    </div>

    <!-- QUICK BUY/SELL -->
    <div v-if="showChart" class="flex justify-between items-center mx-1 my-2 mb-20">
      <div class="w-full flex items-center gap-2">
        <button
          class="w-full flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
          @click="showChart = false">
          Buy
        </button>
        <button
          class="w-full flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 bg-red-500 text-white hover:bg-red-600 transition-colors"
          @click="showChart = false">
          Sell
        </button>
      </div>
    </div>

    <!-- ORDERBOOK + FORM (mode tanpa chart) -->
    <div v-else class="grid grid-cols-2 gap-4 max-w-md md:max-w-4xl mx-auto mt-4 px-4">
      <!-- LEFT: ORDERBOOK -->
      <div>
        <div class="flex justify-between text-gray-400 text-xs pb-1">
          <span>Price (USDT)</span>
          <span>Amount ({{ baseAsset }})</span>
        </div>

        <!-- ASKS -->
        <div class="space-y-1" v-if="depthData">
          <div v-for="ask in top12Asks" :key="ask[0]" class="relative flex justify-between overflow-hidden rounded"
            style="height: 17.5px">
            <div class="absolute left-0 top-0 h-full bg-red-100 z-0 transition-all duration-200"
              :style="{ width: `${((ask[1] / maxAskAmount) * 100).toFixed(2)}%` }" />
            <p class="text-pink-400 text-[10px] z-10 px-2 w-1/2">
              {{ ask[0].toLocaleString('en-US', { maximumFractionDigits: 2 }) }}
            </p>
            <p class="text-black text-[10px] text-right z-10 px-2 w-1/2">
              {{ ask[1].toLocaleString('en-US', { maximumFractionDigits: 5 }) }}
            </p>
          </div>
        </div>

        <!-- MID PRICE -->
        <div class="text-center my-3" v-if="depthData">
          <p class="text-black font-semibold text-[16px]">
            {{
              (depthData.tick.bids[0]?.[0] ?? 0).toLocaleString('en-US', { maximumFractionDigits: 2 })
            }}
          </p>
          <p class="text-[#7F7F7F] text-[10px]">
            ≈ ${{
              (depthData.tick.bids[0]?.[0] ?? 0).toLocaleString('en-US', { maximumFractionDigits: 2 })
            }}
          </p>
        </div>

        <!-- BIDS -->
        <div class="space-y-1" v-if="depthData">
          <div v-for="bid in top12Bids" :key="bid[0]" class="relative flex justify-between overflow-hidden rounded"
            style="height: 17.5px">
            <div class="absolute right-0 top-0 h-full bg-green-100 z-0 transition-all duration-200"
              :style="{ width: `${((bid[1] / maxBidAmount) * 100).toFixed(2)}%` }" />
            <p class="text-[#2DBE87] text-[10px] z-10 px-2 w-1/2">
              {{ bid[0].toLocaleString('en-US', { maximumFractionDigits: 2 }) }}
            </p>
            <p class="text-black text-[10px] text-right z-10 px-2 w-1/2">
              {{ bid[1].toLocaleString('en-US', { maximumFractionDigits: 5 }) }}
            </p>
          </div>
        </div>
      </div>

      <!-- RIGHT: ORDER FORM -->
      <div class="space-y-3">
        <!-- TOGGLE -->
        <div class="flex rounded-lg border border-gray-300 overflow-hidden text-sm font-semibold select-none">
          <button class="flex-1 py-1.5 px-4 transition-colors"
            :class="[activeTab === 'buy' ? 'bg-teal-500 text-white' : 'text-gray-400']" @click="activeTab = 'buy'">
            Buy
          </button>
          <button class="flex-1 py-1.5 px-4 transition-colors"
            :class="[activeTab === 'sell' ? 'bg-red-500 text-white' : 'text-gray-400']" @click="activeTab = 'sell'">
            Sell
          </button>
        </div>

        <!-- MARKET -->
        <div>
          <button
            class="w-full flex items-center justify-center bg-gray-100 text-gray-900 text-sm font-bold px-3 py-2 rounded">
            <span>Market</span>
          </button>
        </div>

        <!-- MARKET PRICE (disabled) -->
        <input type="text" disabled placeholder="Market Price"
          :value="marketPrice ? marketPrice.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '-'"
          class="w-full bg-gray-200 text-gray-400 text-sm font-normal rounded px-3 py-2 cursor-not-allowed" />

        <!-- TOTAL -->
        <div
          class="flex justify-between items-center bg-gray-100 rounded px-3 py-2 text-sm text-gray-500 font-normal mt-3">
          <label for="totalAmount" class="cursor-text">Total</label>

          <div class="relative z-50 text-gray-900 font-bold inline-block shrink-0">
            <input id="totalAmount" ref="amountInputEl" type="text" inputmode="decimal" autocomplete="off"
              class="bg-transparent text-right outline-none w-28 sm:w-32 md:w-36 pr-12"
              :disabled="availableLoading || availableError" v-model="totalAmountInput"
              :placeholder="activeTab === 'buy' ? '0,00' : '0,00000000'" @focus="onAmountFocus" @blur="onAmountBlur"
              @input="onAmountTyping" @keydown.enter.prevent="onAmountCommit" />
            <span class="pointer-events-none absolute inset-y-0 right-2 flex items-center text-black font-medium">
              {{ availableUnit }}
            </span>
          </div>
        </div>

        <!-- SLIDER -->
        <div class="w-full">
          <input type="range" v-model.number="rawPercent" min="0" max="100" step="1" :disabled="!canSlide"
            :style="sliderStyle" @input="onInput(($event.target as HTMLInputElement).valueAsNumber)"
            @change="commitSnap" @pointerdown="isDragging = true" @pointerup="handlePointerUp" class="w-full h-2 rounded-lg appearance-none cursor-pointer accent-teal-600
              [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal-600
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:mt-[-4px]
              disabled:cursor-not-allowed disabled:[&::-webkit-slider-thumb]:bg-gray-300" />

          <div class="flex justify-between text-xs text-gray-400 mt-1">
            <button v-for="m in marks" :key="m" type="button" @click="setPercent(m)" class="select-none transition"
              :class="[canSlide ? 'hover:text-gray-600' : 'cursor-not-allowed', amountPercent === m ? 'text-gray-900 font-semibold' : '']">
              {{ m }}%
            </button>
          </div>
        </div>

        <!-- AVBL -->
        <div class="text-xs space-y-1">
          <div class="flex justify-between text-gray-400 italic">
            <span>Avbl</span>
            <span class="text-gray-900 not-italic flex items-center gap-1">
              <template v-if="availableLoading">...</template>
              <template v-else-if="availableError">-</template>
              <template v-else>
                {{ available.toLocaleString('en-US', { maximumFractionDigits: 8 }) }} {{ availableUnit }}
              </template>
              <Icon icon="tabler:plus" class="text-yellow-400 text-[10px]" />
            </span>
          </div>
          <div class="flex justify-between text-gray-300 italic">
            <span>Max Buy</span>
            <span class="text-gray-900 not-italic">—</span>
          </div>
          <div class="flex justify-between text-gray-300 italic">
            <span>Est. Fee</span>
            <span class="text-gray-900 not-italic">—</span>
          </div>
        </div>

        <!-- SUBMIT -->
        <button
          :class="['w-full text-white text-sm font-medium py-2 rounded mt-3', activeTab === 'buy' ? 'bg-teal-600' : 'bg-red-600']"
          :disabled="submitting || !marketPrice || totalAmount <= 0" @click="submitTrade">
          {{ (activeTab === 'buy' ? 'Buy ' : 'Sell ') + baseAsset }}
        </button>
        <p v-if="submitError" class="text-red-600 text-xs mt-2">{{ submitError }}</p>
      </div>
    </div>

    <!-- CTA BAWAH -->
    <div v-if="!showChart" class="max-w-md mx-auto border border-gray-200 rounded-md p-5 mb-20">
      <div class="text-center">
        <p class="text-gray-400 text-sm font-normal mb-2">Let Top Traders Trade for You</p>
        <RouterLink to="/futures" role="button"
          class="inline-flex items-center justify-center text-gray-700 text-xs font-normal border border-gray-300 rounded px-4 py-1.5 hover:bg-gray-100 transition">
          Copy Trading
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApiAlertStore } from '@/stores/apiAlert'
import LightChart from '@/components/trade/LightChart.vue'
import type { CandlestickData, LineData, AreaData, UTCTimestamp } from 'lightweight-charts'

const showChart = ref(false)

type SeriesKind = 'candlestick' | 'line' | 'area'
const kind = ref<SeriesKind>('candlestick')
const tfs = ['1m', '1h', '1d', '30d'] as const
type TF = (typeof tfs)[number]
const tf = ref<TF>('1h')

const modal = useApiAlertStore()
const isBrowser = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined'

interface DepthTick { asks: [number, number][], bids: [number, number][] }
interface DepthData { ch: string; ts: number; tick: DepthTick }
type OriginPeriod = '1min' | '15min' | '30min' | '1day'

type ObCacheEntry = {
  k1d?: { open: number; close: number; ts: number }
  depth?: { bids: [number, number][]; asks: [number, number][]; ts: number }
}
type ObCache = Record<string, ObCacheEntry>

const OB_LS_KEY = 'obCache:v1'
const DEPTH_CACHE_TTL = 10_000
const KLINE_CACHE_TTL = 5 * 60_000
const DEPTH_TOP_N = 20
const MIN_BARS = 60

let obCache: ObCache = {}
let obSaveTimer: ReturnType<typeof setTimeout> | null = null

function loadObCache() {
  if (!isBrowser()) return
  try { obCache = JSON.parse(localStorage.getItem(OB_LS_KEY) || '{}') } catch { obCache = {} }
}
function saveObCacheDebounced() {
  if (!isBrowser()) return
  if (obSaveTimer) clearTimeout(obSaveTimer)
  obSaveTimer = window.setTimeout(() => {
    try { localStorage.setItem(OB_LS_KEY, JSON.stringify(obCache)) } catch { }
    obSaveTimer = null
  }, 250)
}
function setObCache(key: string, patch: Partial<ObCacheEntry>) {
  obCache[key] = { ...(obCache[key] || {}), ...patch }
  saveObCacheDebounced()
}
function flushObCacheNow() {
  if (!isBrowser()) return
  try { localStorage.setItem(OB_LS_KEY, JSON.stringify(obCache)) } catch { }
}
function hydrateFromCache(pair: string) {
  const key = pairToQuery(pair)
  const entry = obCache[key]
  if (!entry) return
  const now = Date.now()

  if (entry.depth && now - entry.depth.ts <= DEPTH_CACHE_TTL) {
    depthData.value = {
      ch: `market.${key}.depth.step0`,
      ts: entry.depth.ts,
      tick: {
        bids: [...(entry.depth.bids || [])].slice(0, DEPTH_TOP_N).sort((a, b) => b[0] - a[0]),
        asks: [...(entry.depth.asks || [])].slice(0, DEPTH_TOP_N).sort((a, b) => a[0] - b[0]),
      },
    }
    asksTop.value = depthData.value.tick.asks.slice(0, 12)
    bidsTop.value = depthData.value.tick.bids.slice(0, 12)
  }
  if (entry.k1d && now - entry.k1d.ts <= KLINE_CACHE_TTL) {
    klineDailyOHLC.value = { open: entry.k1d.open, close: entry.k1d.close, ts: entry.k1d.ts }
    upsertCandleBuffer('1day', entry.k1d.ts, {
      open: entry.k1d.open, high: entry.k1d.open, low: entry.k1d.open, close: entry.k1d.close, vol: 0,
    })
    scheduleChartFlush()
  }
}

const activeTab = ref<'buy' | 'sell'>('buy')
const dropdownOpen = ref(false)
const selectedPair = ref('BTC/USDT')

const tradingPairs = [
  'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'LTC/USDT', 'LINK/USDT', 'TON/USDT', 'SUI/USDT', 'XRP/USDT', 'QTUM/USDT',
  'THETA/USDT', 'ADA/USDT', 'RAD/USDT', 'BAND/USDT', 'ALGO/USDT', 'POL/USDT', 'DOGE/USDT', 'LUNA/USDT', 'GALA/USDT', 'PEPE/USDT',
  'CFX/USDT', 'TRX/USDT', 'TRUMP/USDT', 'SHIB/USDT', 'ARB/USDT', 'FIL/USDT', 'API3/USDT', 'ENA/USDT', 'BIO/USDT', 'UNI/USDT',
  'BTT/USDT', 'SATS/USDT', 'MEME/USDT', 'GT/USDT', 'OP/USDT', 'AAVE/USDT', 'SNAKES/USDT', 'TIA/USDT', 'SOON/USDT', 'ONDO/USDT',
  'NEO/USDT', 'SKL/USDT', 'MX/USDT', 'FARTCOIN/USDT', 'RATS/USDT', 'ETC/USDT', 'TRB/USDT', 'AVAX/USDT', 'BCH/USDT', 'BSV/USDT',
  'IOTA/USDT', 'CYBER/USDT', 'WIF/USDT', 'CORE/USDT', 'WLD/USDT', 'SEI/USDT', 'VIRTUAL/USDT', 'RENDER/USDT', 'MOODENG/USDT',
  'JUP/USDT', 'PONKE/USDT', 'MNT/USDT', 'PNUT/USDT', 'EIGEN/USDT', 'GRASS/USDT', 'RAY/USDT', 'EPIC/USDT', 'ZRO/USDT', 'BERA/USDT',
  'CA/USDT', 'IP/USDT', 'KAITO/USDT', 'OMNI/USDT', 'A8/USDT', 'OBOL/USDT', 'SAGA/USDT', 'ORCA/USDT', 'SHELL/USDT', 'NAKA/USDT',
]

const route = useRoute()
const router = useRouter()

function toPair(input?: string): string {
  if (!input) return ''
  const v = input.toUpperCase().replace('/', '')
  if (!v.endsWith('USDT')) return ''
  const base = v.slice(0, -4)
  const pair = `${base}/USDT`
  return tradingPairs.includes(pair) ? pair : ''
}
function pairToQuery(pair: string): string { return pair.replace('/', '').toLowerCase() }
function pairToApiSymbol(pair: string): string { return pair.replace('/', '').toUpperCase() }
const baseAsset = computed(() => selectedPair.value.split('/')[0])

const depthData = ref<DepthData | null>(null)
const asksTop = ref<[number, number][]>([]) // ASC, best=0
const bidsTop = ref<[number, number][]>([]) // DESC, best=0

const aggWS = ref<WebSocket | null>(null)
let reconnectTimer: ReturnType<typeof setTimeout> | null = null

let flushTimer: ReturnType<typeof setTimeout> | null = null
let pendingDepth: { ts: number; asks: [number, number][]; bids: [number, number][]; sym: string } | null = null

const klineDailyOHLC = ref<{ open: number; close: number; ts: number } | null>(null)

type CandleBuf = { time: UTCTimestamp; open: number; high: number; low: number; close: number; vol: number }
const buf1m = new Map<number, CandleBuf>()
const buf15m = new Map<number, CandleBuf>()
const buf30m = new Map<number, CandleBuf>()
const buf1d = new Map<number, CandleBuf>()

function mapForPeriod(p: OriginPeriod) {
  if (p === '1min') return buf1m
  if (p === '15min') return buf15m
  if (p === '30min') return buf30m
  return buf1d
}
function periodMs(p: OriginPeriod) {
  if (p === '1min') return 60_000
  if (p === '15min') return 900_000
  if (p === '30min') return 1_800_000
  return 86_400_000
}
function bucketSec(tsMs: number, p: OriginPeriod) {
  const ms = periodMs(p)
  return Math.floor(tsMs / ms) * (ms / 1000)
}
function upsertCandleBuffer(
  p: OriginPeriod,
  tsMs: number,
  ohlc: { open: number; high: number; low: number; close: number; vol: number },
) {
  const m = mapForPeriod(p)
  const key = bucketSec(tsMs, p)
  const prev = m.get(key)
  if (!prev) {
    m.set(key, { time: key as UTCTimestamp, ...ohlc })
  } else {
    prev.high = Math.max(prev.high, ohlc.high)
    prev.low = Math.min(prev.low, ohlc.low)
    prev.close = ohlc.close
    prev.vol = (prev.vol || 0) + (ohlc.vol || 0)
  }
}

/* ============ TF → OriginPeriod + limit (minimal 60 bar) ============ */
function tfPlan(x: TF): { base: OriginPeriod; baseLimit: number; dailyLimit: number } {
  if (x === '1m') return { base: '1min', baseLimit: MIN_BARS, dailyLimit: MIN_BARS }
  if (x === '1h') return { base: '15min', baseLimit: MIN_BARS * 4, dailyLimit: MIN_BARS }
  if (x === '30d') return { base: '1day', baseLimit: MIN_BARS, dailyLimit: MIN_BARS }
  // '1d'
  return { base: '1day', baseLimit: MIN_BARS, dailyLimit: MIN_BARS }
}
function needPeriodsForTF(x: TF): OriginPeriod[] {
  const { base } = tfPlan(x)
  const set = new Set<OriginPeriod>([base, '1day']) // selalu minta 1day utk % change
  return Array.from(set)
}

/* ============ Subscribe/Unsubscribe/Snapshot (dengan limit) ============ */
let subscribedSym: string | null = null
const subscribedPeriods = new Set<OriginPeriod>()
let resubTimer: ReturnType<typeof setTimeout> | null = null

function wsSend(obj: unknown) {
  if (aggWS.value && aggWS.value.readyState === WebSocket.OPEN) {
    try { aggWS.value.send(JSON.stringify(obj)) } catch { }
  }
}
function subscribeFor(symLower: string, periods: OriginPeriod[], limit: number, withBookTicker = false) {
  const channels = withBookTicker ? ['depth', 'ticker', 'kline'] : ['kline']
  wsSend({ type: 'subscribe', channels, symbols: [symLower], periods, limit })
}
function snapshotFor(symLower: string, periods: OriginPeriod[], limit: number) {
  wsSend({ type: 'snapshot', symbols: [symLower], periods, limit })
}
function doUnsubscribe(symLower: string, periods: OriginPeriod[]) {
  wsSend({ type: 'unsubscribe', channels: ['depth', 'ticker', 'kline'], symbols: [symLower], periods })
}

/*
  Resubscribe strategy:
  - Unsub yang tidak dibutuhkan (jika ganti symbol / TF)
  - Sub base period dgn limit sesuai tfPlan + depth/ticker sekali
  - Sub 1day (kalau beda dari base) dgn limit 60, hanya kline
  - Kirim snapshot terpisah per grup agar limit-nya tepat
*/
function scheduleResubscribe() {
  if (resubTimer) return
  resubTimer = window.setTimeout(() => {
    resubTimer = null
    const ws = aggWS.value
    if (!ws || ws.readyState !== WebSocket.OPEN) return

    const sym = pairToQuery(selectedPair.value)
    const plan = tfPlan(tf.value)
    const wantPeriods = new Set<OriginPeriod>(needPeriodsForTF(tf.value))

    // jika ganti symbol: lepas semua lama
    if (subscribedSym && subscribedSym !== sym) {
      if (subscribedPeriods.size) doUnsubscribe(subscribedSym, Array.from(subscribedPeriods))
      subscribedPeriods.clear()
    } else if (subscribedSym === sym) {
      // masih symbol sama: lepas period yang tak dibutuhkan
      const toUnsub: OriginPeriod[] = []
      for (const p of subscribedPeriods) if (!wantPeriods.has(p)) toUnsub.push(p)
      if (toUnsub.length) doUnsubscribe(sym, toUnsub)
      for (const p of toUnsub) subscribedPeriods.delete(p)
    }

    const needBook = !subscribedSym || subscribedSym !== sym || subscribedPeriods.size === 0

    // SUB base (dengan depth/ticker jika perlu)
    if (!subscribedPeriods.has(plan.base)) {
      subscribeFor(sym, [plan.base], plan.baseLimit, needBook)
      snapshotFor(sym, [plan.base], plan.baseLimit)
      subscribedPeriods.add(plan.base)
    }

    // SUB 1day utk % (kecuali base=1day sudah dicakup)
    if (!subscribedPeriods.has('1day')) {
      if (plan.base !== '1day') {
        subscribeFor(sym, ['1day'], plan.dailyLimit, false)
        snapshotFor(sym, ['1day'], plan.dailyLimit)
        subscribedPeriods.add('1day')
      }
    }

    subscribedSym = sym
  }, 150)
}

function scheduleFlush() {
  if (flushTimer) return
  flushTimer = window.setTimeout(() => {
    const curPairKey = pairToQuery(selectedPair.value)
    if (pendingDepth && pendingDepth.sym === curPairKey) {
      const asksAsc = [...pendingDepth.asks].sort((a, b) => a[0] - b[0])
      const bidsDesc = [...pendingDepth.bids].sort((a, b) => b[0] - a[0])

      depthData.value = {
        ch: `market.${curPairKey}.depth.step0`,
        ts: pendingDepth.ts,
        tick: {
          asks: asksAsc.slice(0, DEPTH_TOP_N),
          bids: bidsDesc.slice(0, DEPTH_TOP_N),
        },
      }
      asksTop.value = asksAsc.slice(0, 12)
      bidsTop.value = bidsDesc.slice(0, 12)

      setObCache(curPairKey, {
        depth: { asks: depthData.value.tick.asks, bids: depthData.value.tick.bids, ts: pendingDepth.ts },
      })
      pendingDepth = null
    }
    flushTimer = null
  }, 80)
}

/* ===== Chart ===== */
const chartCandles = ref<CandlestickData[]>([])
const chartLine = ref<LineData[]>([])
const chartArea = ref<AreaData[]>([])
let chartFlushTimer: ReturnType<typeof setTimeout> | null = null

function aggregate(from: Map<number, CandleBuf>, targetMs: number): CandlestickData[] {
  const groups = new Map<number, CandleBuf[]>()
  for (const [sec, cb] of from) {
    const k = Math.floor((sec * 1000) / targetMs) * (targetMs / 1000)
    const arr = groups.get(k) || []
    arr.push(cb)
    groups.set(k, arr)
  }
  const out: CandlestickData[] = []
  const keys = Array.from(groups.keys()).sort((a, b) => a - b)
  for (const k of keys) {
    const arr = groups.get(k)!.sort((a, b) => a.time - b.time)
    const open = arr[0].open
    const close = arr[arr.length - 1].close
    let high = -Infinity, low = Infinity
    for (const c of arr) { high = Math.max(high, c.high); low = Math.min(low, c.low) }
    out.push({ time: k as UTCTimestamp, open, high, low, close })
  }
  return out
}
function seriesFromBufferForTF(): CandlestickData[] {
  if (tf.value === '1m') {
    const keys = Array.from(buf1m.keys()).sort((a, b) => a - b)
    const data = keys.map(k => {
      const c = buf1m.get(k)!
      return { time: c.time, open: c.open, high: c.high, low: c.low, close: c.close }
    })
    return data.slice(-Math.max(MIN_BARS, data.length)) // min 60; boleh >60
  }
  if (tf.value === '1h') {
    const data = aggregate(buf15m, 3_600_000)
    return data.slice(-Math.max(MIN_BARS, data.length))
  }
  // '1d' & '30d' keduanya harian; 30d sekarang min 60 bar
  const keys = Array.from(buf1d.keys()).sort((a, b) => a - b)
  const data = keys.map(k => {
    const c = buf1d.get(k)!
    return { time: c.time, open: c.open, high: c.high, low: c.low, close: c.close }
  })
  const need = MIN_BARS // 60 bar minimal
  return data.slice(-Math.max(need, data.length))
}
function scheduleChartFlush() {
  if (chartFlushTimer) return
  chartFlushTimer = window.setTimeout(() => {
    const candles = seriesFromBufferForTF()
    chartCandles.value = candles
    chartLine.value = candles.map(k => ({ time: k.time, value: k.close }))
    chartArea.value = chartLine.value
    chartFlushTimer = null
  }, 60)
}

/* ===== WS Connect & messages ===== */
function connectAggregatorWS() {
  try { aggWS.value?.close() } catch { }
  aggWS.value = new WebSocket('wss://ledgersocketone.online')

  aggWS.value.onopen = () => {
    subscribedSym = null
    subscribedPeriods.clear()
    scheduleResubscribe()
  }
  aggWS.value.onclose = () => {
    if (reconnectTimer) clearTimeout(reconnectTimer)
    reconnectTimer = window.setTimeout(connectAggregatorWS, 2000)
  }
  aggWS.value.onerror = () => {
    try { aggWS.value?.close() } catch { }
  }

  aggWS.value.onmessage = (e: MessageEvent) => {
    try {
      const msg = JSON.parse(e.data as string)

      // snapshot batched
      if (msg?.type === 'snapshot' && Array.isArray(msg.items)) {
        const want = pairToQuery(selectedPair.value)
        for (const it of msg.items) {
          const symLower = String(it.symbol || '').toLowerCase()
          if (!symLower || symLower !== want) continue
          if (it.type === 'depth') {
            const bids = Array.isArray(it.bids) ? (it.bids as [number, number][]) : []
            const asks = Array.isArray(it.asks) ? (it.asks as [number, number][]) : []
            pendingDepth = { ts: it.ts, asks, bids, sym: symLower }
          } else if (it.type === 'kline') {
            const p = String(it.period) as OriginPeriod
            const open = Number(it.open), close = Number(it.close)
            const high = Number(it.high), low = Number(it.low), vol = Number(it.vol)
            if (Number.isFinite(open) && Number.isFinite(close)) {
              upsertCandleBuffer(p, Number(it.ts), { open, high, low, close, vol })
              if (p === '1day') {
                klineDailyOHLC.value = { open, close, ts: Number(it.ts) }
                setObCache(want, { k1d: { open, close, ts: Number(it.ts) } })
              }
            }
          }
        }
        scheduleFlush()
        scheduleChartFlush()
        return
      }

      const type: string | undefined = msg?.type
      const symLower = String(msg.symbol || '').toLowerCase()
      if (!type || !symLower || symLower !== pairToQuery(selectedPair.value)) return

      if (type === 'depth') {
        const bids = Array.isArray(msg.bids) ? (msg.bids as [number, number][]) : []
        const asks = Array.isArray(msg.asks) ? (msg.asks as [number, number][]) : []
        pendingDepth = { ts: Number(msg.ts), asks, bids, sym: symLower }
        scheduleFlush()
        return
      }

      if (type === 'kline') {
        const p = String(msg.period) as OriginPeriod
        const open = Number(msg.open)
        const close = Number(msg.close)
        const high = Number(msg.high)
        const low = Number(msg.low)
        const vol = Number(msg.vol)
        const ts = Number(msg.ts)
        if (Number.isFinite(open) && Number.isFinite(close)) {
          upsertCandleBuffer(p, ts, { open, high, low, close, vol })
          if (p === '1day') {
            klineDailyOHLC.value = { open, close, ts }
            setObCache(symLower, { k1d: { open, close, ts } })
          }
          scheduleChartFlush()
        }
        return
      }
    } catch { /* ignore */ }
  }
}

/* ===== Derivatives for template ===== */
const top12Asks = computed(() => asksTop.value)
const top12Bids = computed(() => bidsTop.value)
const maxAskAmount = computed(() => top12Asks.value.length ? Math.max(...top12Asks.value.map(a => a[1])) : 1)
const maxBidAmount = computed(() => top12Bids.value.length ? Math.max(...top12Bids.value.map(b => b[1])) : 1)
const percentChange = computed(() => {
  const k = klineDailyOHLC.value
  if (!k || !k.open) return null
  return ((k.close - k.open) / k.open) * 100
})

function resetLocalData() {
  depthData.value = null
  asksTop.value = []
  bidsTop.value = []
  pendingDepth = null
  klineDailyOHLC.value = null
  buf1m.clear(); buf15m.clear(); buf30m.clear(); buf1d.clear()
  scheduleChartFlush()
}

/* ===== Slider & saldo (unchanged) ===== */
const amountPercent = ref<number>(0)
const rawPercent = ref<number>(0)
const isDragging = ref<boolean>(false)
const saldo = ref<number | null>(null)
const coinTotal = ref<number | null>(null)
const availableLoading = ref(true)
const availableError = ref(false)
const marks = [0, 25, 50, 75, 100]
function snapToNearestMark(v: number) { let nearest = 0, best = Infinity; for (const m of marks) { const d = Math.abs(v - m); if (d < best) { best = d; nearest = m } } return nearest }
const available = computed<number>(() => activeTab.value === 'buy' ? (saldo.value ?? 0) : (coinTotal.value ?? 0))
const availableUnit = computed(() => activeTab.value === 'buy' ? 'USDT' : baseAsset.value)
const canSlide = computed<boolean>(() => !availableLoading.value && !availableError.value && available.value > 0)
const sliderStyle = computed(() => {
  if (!canSlide.value) return { background: 'linear-gradient(to right, #e5e7eb 0%, #e5e7eb 100%)', cursor: 'not-allowed' }
  const p = isDragging.value ? rawPercent.value : amountPercent.value
  return { background: `linear-gradient(to right, #22c55e ${p}%, #e5e7eb ${p}%)` }
})
const totalAmount = ref<number>(0)
const totalAmountInput = ref<string>('')
function roundTo(v: number, dp = 8): number { if (!Number.isFinite(v)) return 0; return Number.parseFloat(v.toFixed(dp)) }
function syncPercentFromTotal() { const a = available.value, v = totalAmount.value; const pct = a > 0 ? (v / a) * 100 : 0; rawPercent.value = pct; amountPercent.value = pct }
function onInput(v: number) { if (!canSlide.value) return; rawPercent.value = v; const s = available.value; totalAmount.value = roundTo((s * v) / 100, 8); if (!isEditingAmount.value) { totalAmountInput.value = formatLocaleDecimal(totalAmount.value) } }
function commitSnap() { if (!canSlide.value) return; amountPercent.value = snapToNearestMark(rawPercent.value); rawPercent.value = amountPercent.value; const s = available.value; totalAmount.value = roundTo((s * amountPercent.value) / 100, 8); if (!isEditingAmount.value) totalAmountInput.value = formatLocaleDecimal(totalAmount.value) }
function setPercent(p: number) { if (!canSlide.value) return; amountPercent.value = p; rawPercent.value = p; const s = available.value; totalAmount.value = roundTo((s * p) / 100, 8); totalAmountInput.value = activeTab.value === 'buy' ? totalAmount.value.toFixed(2) : totalAmount.value.toFixed(8) }
function handlePointerUp() { isDragging.value = false; commitSnap() }
const amountInputEl = ref<HTMLInputElement | null>(null)
const isEditingAmount = ref(false)
const dp = computed(() => (activeTab.value === 'buy' ? 2 : 8))
function formatLocaleDecimal(num: number): string { if (!Number.isFinite(num)) return ''; return num.toLocaleString('id-ID', { minimumFractionDigits: dp.value, maximumFractionDigits: dp.value }) }
function parseLocaleDecimal(str: string): number { if (!str) return NaN; const cleaned = str.replace(/\s/g, '').replace(/\./g, '').replace(',', '.'); return Number(cleaned) }
function onAmountFocus(e: FocusEvent) { isEditingAmount.value = true; if (!totalAmount.value) totalAmountInput.value = ''; requestAnimationFrame(() => (e.target as HTMLInputElement).select()) }
function onAmountTyping() { totalAmountInput.value = totalAmountInput.value.replace(/[^\d.,]/g, '') }
function onAmountCommit() { amountInputEl.value?.blur() }
function onAmountBlur() {
  isEditingAmount.value = false
  const raw = (totalAmountInput.value || '').trim()
  let v = parseLocaleDecimal(raw)
  if (!Number.isFinite(v)) v = 0
  if (v < 0) v = 0
  const a = available.value
  if (a > 0 && v > a) v = a
  v = roundTo(v, dp.value)
  totalAmount.value = v
  totalAmountInput.value = v ? formatLocaleDecimal(v) : ''
  syncPercentFromTotal()
}

/* ===== URL sync & lifecycle ===== */
function rawSymbolFromRoute(): string { return (route.query.symbol as string) ?? (route.query.pairSymbol as string) ?? '' }

onMounted(() => {
  loadObCache()
  if (isBrowser()) {
    const flush = () => flushObCacheNow()
    window.addEventListener('beforeunload', flush)
    onUnmounted(() => window.removeEventListener('beforeunload', flush))
  }

  const pairFromUrl = toPair(rawSymbolFromRoute())
  selectedPair.value = pairFromUrl || 'BTC/USDT'

  hydrateFromCache(selectedPair.value)
  connectAggregatorWS()
  scheduleResubscribe()
  getAvailable()
})

watch([() => route.query.symbol, () => route.query.pairSymbol], ([sym, pairSym]) => {
  const pair = toPair((sym as string) ?? (pairSym as string))
  if (pair && pair !== selectedPair.value) {
    selectedPair.value = pair
    dropdownOpen.value = false
    router.replace({ query: { ...route.query, symbol: pairToQuery(pair) } })
    resetLocalData()
    scheduleResubscribe()
    getAvailable()
  }
})
function selectPair(pair: string) {
  if (!tradingPairs.includes(pair)) return
  if (pair === selectedPair.value) { dropdownOpen.value = false; return }
  selectedPair.value = pair
  dropdownOpen.value = false
  router.replace({ query: { ...route.query, symbol: pairToQuery(pair) } })
  resetLocalData()
  scheduleResubscribe()
  getAvailable()
}
watch(tf, () => { scheduleResubscribe(); scheduleChartFlush() })

onUnmounted(() => {
  try { aggWS.value?.close() } catch { }
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null }
})

/* ===== Order submit ===== */
const submitting = ref(false)
const submitError = ref<string>('')
const API_BASE = 'https://one-ledger.masmutpanel.my.id/api'

function bestBid(): number {
  const bids = depthData.value?.tick?.bids
  return Array.isArray(bids) && bids.length ? Number(bids[0][0]) : 0
}
function bestAsk(): number {
  const asks = depthData.value?.tick?.asks
  return Array.isArray(asks) && asks.length ? Number(asks[0][0]) : 0
}
const marketPrice = computed<number>(() => (activeTab.value === 'buy' ? bestAsk() : bestBid()))

watch(activeTab, () => {
  totalAmount.value = 0
  totalAmountInput.value = ''
  rawPercent.value = 0
  amountPercent.value = 0
  getAvailable()
})

async function getAvailable() {
  const API = API_BASE
  availableLoading.value = true
  availableError.value = false
  try {
    const token = isBrowser() ? localStorage.getItem('token') : ''
    if (!token) throw new Error('No token')

    if (activeTab.value === 'buy') {
      const res = await fetch(`${API}/saldo`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        credentials: 'include',
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const s = Number(data?.saldo ?? 0)
      saldo.value = Number.isFinite(s) ? s : 0
      coinTotal.value = null
    } else {
      const sym = pairToApiSymbol(selectedPair.value)
      const res = await fetch(`${API}/positions/${sym}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        credentials: 'include',
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const t = Number(data?.qty ?? 0)
      coinTotal.value = Number.isFinite(t) ? t : 0
    }

    const a = available.value
    if (a <= 0) {
      totalAmount.value = 0; totalAmountInput.value = ''; rawPercent.value = 0; amountPercent.value = 0
    } else {
      if (totalAmount.value > a) totalAmount.value = a
      totalAmountInput.value = activeTab.value === 'buy' ? (totalAmount.value || 0).toFixed(2) : (totalAmount.value || 0).toFixed(8)
      syncPercentFromTotal()
    }
  } catch {
    availableError.value = true
    if (activeTab.value === 'buy') saldo.value = null
    if (activeTab.value === 'sell') coinTotal.value = null
    amountPercent.value = 0; rawPercent.value = 0; totalAmount.value = 0; totalAmountInput.value = ''
  } finally {
    availableLoading.value = false
  }
}

const PENDING_LS_KEY = 'pendingTxs'
function hasPendingTxs(): boolean {
  if (!isBrowser()) return false
  const raw = localStorage.getItem(PENDING_LS_KEY)
  if (!raw) return false
  try { const arr = JSON.parse(raw); return Array.isArray(arr) && arr.length > 0 } catch { return false }
}

async function submitTrade() {
  if (submitting.value) return
  submitError.value = ''

  if (hasPendingTxs()) {
    modal.open('Error', 'You already have a pending copy trade. Please wait until it completes before placing a new order.')
    return
  }

  try {
    submitting.value = true

    const token = isBrowser() ? localStorage.getItem('token') : ''
    if (!token) throw new Error('No token')

    const side = activeTab.value === 'buy' ? 'BUY' : 'SELL'
    let price = marketPrice.value
    if (!price || price <= 0) throw new Error('Harga market tidak tersedia')

    const bid = bestBid(), ask = bestAsk()
    if (bid > 0 && ask > 0) {
      const spreadPct = ((ask - bid) / bid) * 100
      if (spreadPct > 2) throw new Error(`Spread terlalu lebar (${spreadPct.toFixed(2)}%).`)
      if (side === 'BUY' && price !== ask) price = ask
      if (side === 'SELL' && price !== bid) price = bid
    }

    const amount = Number(totalAmount.value)
    if (!(amount > 0)) throw new Error('Total tidak valid')

    let qty = side === 'BUY' ? amount / price : amount
    if (side === 'SELL') {
      const maxQty = Number(coinTotal.value ?? 0)
      const EPS = 1e-10
      qty = Math.min(qty, Math.max(0, maxQty - EPS))
      qty = Math.floor(qty * 1e8) / 1e8
    } else {
      qty = Math.floor(qty * 1e8) / 1e8
    }
    if (!(qty > 0)) throw new Error('Qty = 0 setelah pembulatan')

    const payload = { symbol: pairToApiSymbol(selectedPair.value), side, price, qty, fee: 0 }

    const res = await fetch(`${API_BASE}/save-trades`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.message || `HTTP ${res.status}`)
    }

    await res.json()
    modal.open('Success', 'Order Created')

    await getAvailable()
    totalAmount.value = 0; totalAmountInput.value = ''; rawPercent.value = 0; amountPercent.value = 0
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Gagal kirim order'
    submitError.value = msg
    modal.open('Error', msg)
  } finally {
    submitting.value = false
  }
}

/* ===== Chart props ===== */
const chartOptions = { timeScale: { timeVisible: true, secondsVisible: false } }
const seriesOptions = {}
const dataForChart = computed(() => {
  if (kind.value === 'candlestick') return { candleData: chartCandles.value, data: [] as LineData[] }
  if (kind.value === 'line') return { candleData: [] as CandlestickData[], data: chartLine.value }
  return { candleData: [] as CandlestickData[], data: chartArea.value }
})
</script>
