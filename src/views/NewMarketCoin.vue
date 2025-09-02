<template>
  <div>
    <!-- SYMBOL ROW -->
    <section class="flex items-center justify-between px-4 py-2 pb-0">
      <!-- HEADER: pair dropdown + toggle chart -->
      <div class="flex items-center justify-between">
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
      </div>

      <div class="flex items-center space-x-4 text-gray-400">
        <RouterLink to="/event" aria-label="Gift" class="relative inline-flex">
          <Icon icon="tabler:gift" class="w-5 h-5" />
          <span class="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
        </RouterLink>
        <button aria-label="Chart" class="relative">
          <Icon :icon="showChart ? 'tabler:brand-databricks' : 'tabler:chart-bar'" class="w-5 h-5 cursor-pointer"
            :aria-pressed="showChart" @click="showChart = !showChart" />
        </button>
        <RouterLink to="/history" aria-label="More options" class="relative">
          <Icon icon="tabler:dots" class="w-5 h-5" />
          <span class="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
        </RouterLink>
      </div>
    </section>


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
              (depthData.tick.bids[0]?.[0] ?? 0).toLocaleString('en-US', {
                maximumFractionDigits: 2,
              })
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
        <LightChart :series-type="kind" :candle-data="dataForChart.candleData" :data="dataForChart.data" :options="{
          timeScale: {
            // typical defaults:
            rightOffset: 12,
            barSpacing: 5,
          },
        }" :fit="false" :initial-bars="180" :right-offset="12" :auto-follow="true" />
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
              (depthData.tick.bids[0]?.[0] ?? 0).toLocaleString('en-US', {
                maximumFractionDigits: 2,
              })
            }}
          </p>
          <p class="text-[#7F7F7F] text-[10px]">
            ≈ ${{
              (depthData.tick.bids[0]?.[0] ?? 0).toLocaleString('en-US', {
                maximumFractionDigits: 2,
              })
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
        <!-- Order type -->
        <div class="flex items-center justify-between bg-gray-100 rounded-lg px-3 py-2 text-[12px]">
          <div class="flex items-center justify-between space-x-2 w-full">
            <Icon icon="tabler:info-circle-filled" class="w-4 h-4 text-gray-400" />
            <button type="button" class="flex items-center font-semibold text-gray-900">
              Market
            </button>
            <Icon icon="tabler:chevron-down" class="w-4 h-4 ml-1 text-gray-500" />
          </div>
        </div>

        <!-- Price -->
        <div class="flex items-center justify-between text-[12px] w-full space-x-2">
          <div class="bg-gray-100 flex-row flex items-center justify-between px-2 rounded-lg w-[97%] py-[4px]">
            <Icon icon="tabler:minus" class="w-4 h-4" />
            <div class="flex-1 text-center">
              <div class="text-[10px] text-gray-400 leading-none mb-1">Price (USDT)</div>
              <div class="font-semibold text-[12px] text-gray-900 leading-tight">
                {{
                  marketPrice
                    ? marketPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })
                    : '-'
                }}
              </div>
            </div>
            <Icon icon="tabler:plus" class="w-4 h-4" />
          </div>

          <div class="flex items-center space-x-2 bg-gray-100 rounded-lg py-[4px]">
            <button type="button" class="h-8 px-3 text-gray-900 font-semibold">BBO</button>
          </div>
        </div>

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

        <!-- Amount -->
        <div class="flex items-center bg-gray-100 rounded-lg px-2 py-[4px] text-[12px] gap-2">
          <Icon icon="tabler:minus" class="w-4 h-4 shrink-0" />

          <div class="text-center">
            <label for="totalAmount" class="text-[10px] text-gray-400 leading-none cursor-text">
              Amount ({{ availableUnit || 'USDT' }})
            </label>

            <div class="relative z-50 text-gray-900 font-bold inline-block">
              <input id="totalAmount" ref="amountInputEl" type="text" inputmode="decimal" autocomplete="off"
                class="bg-transparent text-center outline-none w-28 sm:w-32 md:w-36"
                :disabled="availableLoading || availableError" v-model="totalAmountInput"
                :placeholder="activeTab === 'buy' ? '0,00' : '0,00000000'" @focus="onAmountFocus" @blur="onAmountBlur"
                @input="onAmountTyping" @keydown.enter.prevent="onAmountCommit" />
            </div>
          </div>

          <Icon icon="tabler:plus" class="w-4 h-4 shrink-0" />
        </div>

        <!-- SLIDER -->
        <div class="w-full">
          <input type="range" v-model.number="rawPercent" min="0" max="100" step="1" :disabled="!canSlide"
            :style="sliderStyle" @input="onInput(($event.target as HTMLInputElement).valueAsNumber)"
            @change="commitSnap" @pointerdown="isDragging = true" @pointerup="handlePointerUp"
            class="w-full h-2 rounded-lg appearance-none cursor-pointer accent-teal-600 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:mt-[-4px] disabled:cursor-not-allowed disabled:[&::-webkit-slider-thumb]:bg-gray-300" />

          <div class="flex justify-between text-xs text-gray-400 mt-1">
            <button v-for="m in marks" :key="m" type="button" @click="setPercent(m)" class="select-none transition"
              :class="[
                canSlide ? 'hover:text-gray-600' : 'cursor-not-allowed',
                amountPercent === m ? 'text-gray-900 font-semibold' : '',
              ]">
              {{ m }}%
            </button>
          </div>
        </div>

        <!-- Options -->
        <fieldset class="space-y-2 text-[12px]">
          <legend class="sr-only">Order options</legend>

          <label for="opt-tpsl" class="flex items-center gap-2 cursor-pointer">
            <input id="opt-tpsl" type="radio" name="orderType" class="h-4 w-4 accent-teal-500" />
            <span>TP/SL</span>
          </label>

          <div class="flex items-center gap-2">
            <label for="opt-reduce" class="flex items-center gap-2 flex-1 cursor-pointer">
              <input id="opt-reduce" type="radio" name="orderType" class="h-4 w-4 accent-teal-500" />
              <span>Reduce Only</span>
            </label>

            <label for="tif" class="sr-only">Time in Force</label>
            <select id="tif" name="timeInForce"
              class="ml-auto text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-600">
              <option>GTC</option>
            </select>
          </div>
        </fieldset>

        <!-- AVBL -->
        <div class="text-xs space-y-1">
          <div class="flex justify-between text-gray-400 italic">
            <span>Avbl</span>
            <span class="text-gray-900 not-italic flex items-center gap-1">
              <template v-if="availableLoading">...</template>
              <template v-else-if="availableError">-</template>
              <template v-else>
                {{ available.toLocaleString('en-US', { maximumFractionDigits: 8 }) }}
                {{ availableUnit }}
              </template>
            </span>
          </div>
          <div class="flex justify-between text-xs text-gray-600">
            <span>Max</span><span>0,0 {{ availableUnit || 'USDT' }}</span>
          </div>
          <div class="flex justify-between text-xs text-gray-600">
            <span>Cost</span><span>0 {{ availableUnit || 'USDT' }}</span>
          </div>
        </div>

        <!-- SUBMIT -->
        <button :class="[
          'w-full text-white text-sm font-medium py-2 rounded mt-3',
          activeTab === 'buy' ? 'bg-teal-600' : 'bg-red-600',
        ]" :disabled="submitting || !marketPrice || totalAmount <= 0" @click="submitTrade">
          {{ (activeTab === 'buy' ? 'Buy ' : 'Sell ') + baseAsset }}
        </button>
        <p v-if="submitError" class="text-red-600 text-xs mt-2">{{ submitError }}</p>
      </div>
    </div>

    <!-- ===== Assets ===== -->
    <div class="mb-20">
      <div v-if="loadingAssets" class="text-sm text-gray-500 px-5 py-3">Loading assets…</div>
      <div v-else-if="errorAssets" class="text-sm text-red-500 px-5 py-3">{{ errorAssets }}</div>
      <div v-else-if="assets.length === 0" class="text-sm text-center text-gray-500 px-5 py-3">
        No Data Available
      </div>

      <section v-else v-for="a in assets" :key="a.symbol"
        class="space-y-4 w-full rounded-2xl p-5 drop-shadow-md bg-white cursor-pointer hover:ring-2 hover:ring-teal-200 transition"
        @click="goAsset(a)">
        <div class="flex justify-between items-center">
          <p class="text-gray-500 text-[10px] font-normal">Asset</p>
          <Icon icon="tabler:adjustments-horizontal" class="text-gray-400 text-[10px]" />
        </div>

        <div class="flex justify-between items-center text-[10px]">
          <div class="flex items-center space-x-2">
            <img :alt="`${a.base} logo`" class="rounded-full" :src="a.logoUrl" width="20" height="20" />
            <p class="font-bold text-black text-xs leading-4">
              {{ a.base }}
              <span class="font-normal text-gray-400 text-[10px]">/{{ a.quote }}</span>
            </p>
          </div>

          <button aria-label="Share" class="text-gray-400 hover:text-gray-600">
            <Icon icon="tabler:share-3" class="text-xs" />
          </button>
        </div>

        <!-- Unrealized PnL -->
        <div v-if="a.lastPrice > 0" class="flex justify-between items-center space-x-4 font-semibold text-xs leading-4"
          :class="a.uPnlAbs >= 0 ? 'text-green-600' : 'text-red-600'">
          <p>{{ signedMoneyId(a.uPnlAbs, 2) }}</p>
          <p>{{ signedPercent(a.uPnlPct) }}</p>
        </div>
        <div v-else class="text-[10px] text-gray-400">—</div>

        <!-- Balances, Avg Cost, Last Price -->
        <div class="grid grid-cols-3 gap-2 text-[10px] text-gray-400 font-normal">
          <div>
            <span class="text-gray-600 block">Balances</span>
            <span class="text-black font-normal text-[10px] block">
              {{ formatNumberId(a.qty, 8) }} {{ a.base }}
            </span>
            <span class="block">{{ moneyId(a.valueUsd, 2) }}</span>
          </div>

          <div class="text-right">
            <span class="text-gray-600 block">Avg. Cost ({{ a.quote }})</span>
            <span class="text-black font-normal text-[10px] block">
              {{ formatNumberId(a.avgCost, 2) }}
            </span>
          </div>

          <div class="text-right mt-0.3">
            <span class="text-gray-600 block">Last Price ({{ a.quote }})</span>
            <span class="text-black font-normal text-[10px] block">
              {{ formatNumberId(a.lastPrice, 2) }}
            </span>
          </div>
        </div>
      </section>
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

// ===== TF yang dipakai klien =====
const tfs = ['5m', '15m', '1h', '1d'] as const
type TF = (typeof tfs)[number]
const tf = ref<TF>('1h')

const modal = useApiAlertStore()
const isBrowser = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined'
// ===== Assets (state) =====
type Quote = 'USDT' | 'USDC' | 'USD'
type PositionRow = {
  symbol: string
  qty: string | number
  avg_cost: string | number
}
type AssetItem = {
  symbol: string
  base: string
  quote: Quote
  logoUrl: string
  qty: number
  avgCost: number
  lastPrice: number
  valueUsd: number
  uPnlAbs: number
  uPnlPct: number
}

const assets = ref<AssetItem[]>([])
const loadingAssets = ref(false)
const errorAssets = ref<string | null>(null)

// ===== Assets (utils) =====
function splitSymbol(sym: string): { base: string; quote: Quote } {
  const s = sym.toUpperCase()
  if (s.endsWith('USDT')) return { base: s.slice(0, -4), quote: 'USDT' }
  if (s.endsWith('USDC')) return { base: s.slice(0, -4), quote: 'USDC' }
  if (s.endsWith('USD')) return { base: s.slice(0, -3), quote: 'USD' }
  return { base: s, quote: 'USDT' }
}
const formatNumberId = (nu: number, digits = 2) =>
  Number.isFinite(nu)
    ? nu.toLocaleString('id-ID', { minimumFractionDigits: digits, maximumFractionDigits: digits })
    : '0'
const moneyId = (nu: number, digits = 2) => `$${formatNumberId(nu, digits)}`
const signedPercent = (pct: number) =>
  (pct >= 0 ? '+' : '') + (Number.isFinite(pct) ? pct.toFixed(2) : '0.00') + '%'
const signedMoneyId = (nu: number, digits = 2) =>
  (nu >= 0 ? '+' : '-') + moneyId(Math.abs(nu), digits)

// local logo helper
const BASE = import.meta.env.BASE_URL || '/'
const localLogo = (sym: string) => `${BASE}img/crypto/${sym.toLowerCase()}.svg`

// ===== Assets (loader) =====
async function loadAssets() {
  loadingAssets.value = true
  errorAssets.value = null
  try {
    const token = isBrowser() ? localStorage.getItem('token') : ''
    if (!token) throw new Error('Token tidak ada.')

    const res = await fetch(`${API_BASE}/positions-all`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      credentials: 'include',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const rows: PositionRow[] = await res.json()

    const mapped: AssetItem[] = rows
      .filter((r) => Number(r.qty) > 0)
      .map((r) => {
        const sym = String(r.symbol).toUpperCase()
        const { base, quote } = splitSymbol(sym)
        const qty = Number(r.qty) || 0
        const avg = Number(r.avg_cost) || 0
        const last = 0 // tanpa WS realtime
        return {
          symbol: sym,
          base,
          quote,
          logoUrl: localLogo(base),
          qty,
          avgCost: avg,
          lastPrice: last,
          valueUsd: qty * last,
          uPnlAbs: (last - avg) * qty,
          uPnlPct: avg > 0 ? ((last - avg) / avg) * 100 : 0,
        }
      })

    mapped.sort((a, b) => b.valueUsd - a.valueUsd)
    assets.value = mapped
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Gagal memuat assets.'
    errorAssets.value = msg
    assets.value = []
    // pakai Pinia alert sesuai aturan proyek
    modal.open('Error', msg)
  } finally {
    loadingAssets.value = false
  }
}

// ===== Assets (nav) =====
function goAsset(a: { symbol: string }) {
  const sym = String(a.symbol || '').toLowerCase()
  if (!sym) return
  router.push({ path: '/trade', query: { symbol: sym } })
}

// ====== Assets realtime WS (ticker + kline 1day) ======
type KlinePeriod = '1day'
const ASSETS_WS_URL = 'wss://ledgersocketone.online'

// fast lookup untuk update harga
const assetMap = new Map<string, AssetItem>()
function rebuildAssetMap() {
  assetMap.clear()
  for (const a of assets.value) assetMap.set(a.symbol.toUpperCase(), a)
}

// WS state
let assetsWs: WebSocket | null = null
let assetsReconnectTimer: ReturnType<typeof setTimeout> | null = null

const ASSET_KLINE_PERIODS: KlinePeriod[] = ['1day']
let assetsSubscribedLower = new Set<string>() // symbols lower yang sudah disubscribe
let assetsResubTimer: ReturnType<typeof setTimeout> | null = null


interface DepthTick {
  asks: [number, number][]
  bids: [number, number][]
}
interface DepthData {
  ch: string
  ts: number
  tick: DepthTick
}

// include 60min utk 1h
type OriginPeriod = '5min' | '15min' | '30min' | '60min' | '1day'

type ObCacheEntry = {
  k1d?: { open: number; close: number; ts: number }
  depth?: { bids: [number, number][]; asks: [number, number][]; ts: number }
}
type ObCache = Record<string, ObCacheEntry>

const OB_LS_KEY = 'obCache:v1'
const DEPTH_CACHE_TTL = 10_000
const KLINE_CACHE_TTL = 5 * 60_000
const DEPTH_TOP_N = 20
const WANT_BARS = 300

let obCache: ObCache = {}
let obSaveTimer: ReturnType<typeof setTimeout> | null = null

function loadObCache() {
  if (!isBrowser()) return
  try {
    obCache = JSON.parse(localStorage.getItem(OB_LS_KEY) || '{}')
  } catch {
    obCache = {}
  }
}
function saveObCacheDebounced() {
  if (!isBrowser()) return
  if (obSaveTimer) clearTimeout(obSaveTimer)
  obSaveTimer = window.setTimeout(() => {
    try {
      localStorage.setItem(OB_LS_KEY, JSON.stringify(obCache))
    } catch { }
    obSaveTimer = null
  }, 250)
}
function setObCache(key: string, patch: Partial<ObCacheEntry>) {
  obCache[key] = { ...(obCache[key] || {}), ...patch }
  saveObCacheDebounced()
}
function flushObCacheNow() {
  if (!isBrowser()) return
  try {
    localStorage.setItem(OB_LS_KEY, JSON.stringify(obCache))
  } catch { }
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
      open: entry.k1d.open,
      high: entry.k1d.open,
      low: entry.k1d.open,
      close: entry.k1d.close,
      vol: 0,
    })
    scheduleChartFlush()
  }
}

const activeTab = ref<'buy' | 'sell'>('buy')
const dropdownOpen = ref(false)
const selectedPair = ref('BTC/USDT')

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
  return pair.replace('/', '').toUpperCase()
}
const baseAsset = computed(() => selectedPair.value.split('/')[0])

const depthData = ref<DepthData | null>(null)
const asksTop = ref<[number, number][]>([])
const bidsTop = ref<[number, number][]>([])

const aggWS = ref<WebSocket | null>(null)
let reconnectTimer: ReturnType<typeof setTimeout> | null = null

let flushTimer: ReturnType<typeof setTimeout> | null = null
let pendingDepth: {
  ts: number
  asks: [number, number][]
  bids: [number, number][]
  sym: string
} | null = null

const klineDailyOHLC = ref<{ open: number; close: number; ts: number } | null>(null)

type CandleBuf = {
  time: UTCTimestamp
  open: number
  high: number
  low: number
  close: number
  vol: number
}
const buf5m = new Map<number, CandleBuf>()
const buf15m = new Map<number, CandleBuf>()
const buf30m = new Map<number, CandleBuf>() // (dipertahankan bila sewaktu-waktu dipakai)
const buf60m = new Map<number, CandleBuf>()
const buf1d = new Map<number, CandleBuf>()

function mapForPeriod(p: OriginPeriod) {
  if (p === '5min') return buf5m
  if (p === '15min') return buf15m
  if (p === '30min') return buf30m
  if (p === '60min') return buf60m
  return buf1d
}
function periodMs(p: OriginPeriod) {
  if (p === '5min') return 300_000 // ← harus 300.000 ms
  if (p === '15min') return 900_000
  if (p === '30min') return 1_800_000
  if (p === '60min') return 3_600_000
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

/* ============ TF → OriginPeriod + limit (300 bar) ============ */
function tfPlan(x: TF): { base: OriginPeriod; baseLimit: number; dailyLimit: number } {
  if (x === '5m') return { base: '5min', baseLimit: WANT_BARS, dailyLimit: WANT_BARS }
  if (x === '15m') return { base: '15min', baseLimit: WANT_BARS, dailyLimit: WANT_BARS }
  if (x === '1h') return { base: '60min', baseLimit: WANT_BARS, dailyLimit: WANT_BARS }
  // '1d'
  return { base: '1day', baseLimit: WANT_BARS, dailyLimit: WANT_BARS }
}
function needPeriodsForTF(x: TF): OriginPeriod[] {
  const { base } = tfPlan(x)
  const set = new Set<OriginPeriod>([base, '1day']) // 1day utk % change
  return Array.from(set)
}

/* ============ Subscribe/Unsubscribe/Snapshot (dengan limit) ============ */
let subscribedSym: string | null = null
const subscribedPeriods = new Set<OriginPeriod>()
let resubTimer: ReturnType<typeof setTimeout> | null = null

function wsSend(obj: unknown) {
  if (aggWS.value && aggWS.value.readyState === WebSocket.OPEN) {
    try {
      aggWS.value.send(JSON.stringify(obj))
    } catch { }
  }
}
function subscribeFor(
  symLower: string,
  periods: OriginPeriod[],
  limit: number,
  withBookTicker = false,
) {
  const channels = withBookTicker ? ['depth', 'ticker', 'kline'] : ['kline']
  wsSend({ type: 'subscribe', channels, symbols: [symLower], periods, limit })
}
function snapshotFor(symLower: string, periods: OriginPeriod[], limit: number) {
  wsSend({ type: 'snapshot', symbols: [symLower], periods, limit })
}
function doUnsubscribe(symLower: string, periods: OriginPeriod[]) {
  wsSend({
    type: 'unsubscribe',
    channels: ['depth', 'ticker', 'kline'],
    symbols: [symLower],
    periods,
  })
}

/*
  Resubscribe strategy:
  - Unsub yang tidak dibutuhkan (jika ganti symbol / TF)
  - Sub base period dengan limit sesuai tfPlan + depth/ticker sekali
  - Sub 1day (kalau beda dari base) dengan limit 300, hanya kline
  - Kirim snapshot per grup agar limit-nya pas
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

    // ganti symbol ⇒ lepas semua lama
    if (subscribedSym && subscribedSym !== sym) {
      if (subscribedPeriods.size) doUnsubscribe(subscribedSym, Array.from(subscribedPeriods))
      subscribedPeriods.clear()
    } else if (subscribedSym === sym) {
      // symbol sama ⇒ lepas period yang tak dibutuhkan
      const toUnsub: OriginPeriod[] = []
      for (const p of subscribedPeriods) if (!wantPeriods.has(p)) toUnsub.push(p)
      if (toUnsub.length) doUnsubscribe(sym, toUnsub)
      for (const p of toUnsub) subscribedPeriods.delete(p)
    }

    const needBook = !subscribedSym || subscribedSym !== sym || subscribedPeriods.size === 0

    // SUB base
    if (!subscribedPeriods.has(plan.base)) {
      subscribeFor(sym, [plan.base], plan.baseLimit, needBook)
      snapshotFor(sym, [plan.base], plan.baseLimit)
      subscribedPeriods.add(plan.base)
    }

    // SUB 1day utk % (jika base ≠ 1day)
    if (!subscribedPeriods.has('1day') && plan.base !== '1day') {
      subscribeFor(sym, ['1day'], plan.dailyLimit, false)
      snapshotFor(sym, ['1day'], plan.dailyLimit)
      subscribedPeriods.add('1day')
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
        depth: {
          asks: depthData.value.tick.asks,
          bids: depthData.value.tick.bids,
          ts: pendingDepth.ts,
        },
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

function seriesFromBufferForTF(): CandlestickData[] {
  if (tf.value === '5m') {
    const keys = Array.from(buf5m.keys()).sort((a, b) => a - b)
    const data = keys.map((k) => {
      const c = buf5m.get(k)!
      return { time: c.time, open: c.open, high: c.high, low: c.low, close: c.close }
    })
    return data.slice(-WANT_BARS)
  }
  if (tf.value === '15m') {
    const keys = Array.from(buf15m.keys()).sort((a, b) => a - b)
    const data = keys.map((k) => {
      const c = buf15m.get(k)!
      return { time: c.time, open: c.open, high: c.high, low: c.low, close: c.close }
    })
    return data.slice(-WANT_BARS)
  }
  if (tf.value === '1h') {
    const keys = Array.from(buf60m.keys()).sort((a, b) => a - b)
    const data = keys.map((k) => {
      const c = buf60m.get(k)!
      return { time: c.time, open: c.open, high: c.high, low: c.low, close: c.close }
    })
    return data.slice(-WANT_BARS)
  }
  // '1d'
  const keys = Array.from(buf1d.keys()).sort((a, b) => a - b)
  const data = keys.map((k) => {
    const c = buf1d.get(k)!
    return { time: c.time, open: c.open, high: c.high, low: c.low, close: c.close }
  })
  return data.slice(-WANT_BARS)
}
function scheduleChartFlush() {
  if (chartFlushTimer) return
  chartFlushTimer = window.setTimeout(() => {
    const candles = seriesFromBufferForTF()
    chartCandles.value = candles
    chartLine.value = candles.map((k) => ({ time: k.time, value: k.close }))
    chartArea.value = chartLine.value
    chartFlushTimer = null
  }, 60)
}

/* ===== WS Connect & messages ===== */
function connectAggregatorWS() {
  try {
    aggWS.value?.close()
  } catch { }
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
    try {
      aggWS.value?.close()
    } catch { }
  }

  aggWS.value.onmessage = (e: MessageEvent) => {
    try {
      const msg = JSON.parse(e.data as string)

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
            const open = Number(it.open),
              close = Number(it.close)
            const high = Number(it.high),
              low = Number(it.low),
              vol = Number(it.vol)
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
    } catch {
      /* ignore */
    }
  }
}

/* ===== Derivatives for template ===== */
const top12Asks = computed(() => asksTop.value)
const top12Bids = computed(() => bidsTop.value)
const maxAskAmount = computed(() =>
  top12Asks.value.length ? Math.max(...top12Asks.value.map((a) => a[1])) : 1,
)
const maxBidAmount = computed(() =>
  top12Bids.value.length ? Math.max(...top12Bids.value.map((b) => b[1])) : 1,
)
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
  buf5m.clear()
  buf15m.clear()
  buf30m.clear()
  buf60m.clear()
  buf1d.clear()
  scheduleChartFlush()
}

/* ===== Slider & saldo (tetap) ===== */
const amountPercent = ref<number>(0)
const rawPercent = ref<number>(0)
const isDragging = ref<boolean>(false)
const saldo = ref<number | null>(null)
const coinTotal = ref<number | null>(null)
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
const sliderStyle = computed(() => {
  if (!canSlide.value)
    return {
      background: 'linear-gradient(to right, #e5e7eb 0%, #e5e7eb 100%)',
      cursor: 'not-allowed',
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
  const a = available.value,
    v = totalAmount.value
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
    totalAmountInput.value = formatLocaleDecimal(totalAmount.value)
  }
}
function commitSnap() {
  if (!canSlide.value) return
  amountPercent.value = snapToNearestMark(rawPercent.value)
  rawPercent.value = amountPercent.value
  const s = available.value
  totalAmount.value = roundTo((s * amountPercent.value) / 100, 8)
  if (!isEditingAmount.value) totalAmountInput.value = formatLocaleDecimal(totalAmount.value)
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
const amountInputEl = ref<HTMLInputElement | null>(null)
const isEditingAmount = ref(false)
const dp = computed(() => (activeTab.value === 'buy' ? 2 : 8))
function formatLocaleDecimal(num: number): string {
  if (!Number.isFinite(num)) return ''
  return num.toLocaleString('id-ID', {
    minimumFractionDigits: dp.value,
    maximumFractionDigits: dp.value,
  })
}
function parseLocaleDecimal(str: string): number {
  if (!str) return NaN
  const cleaned = str.replace(/\s/g, '').replace(/\./g, '').replace(',', '.')
  return Number(cleaned)
}
function onAmountFocus(e: FocusEvent) {
  isEditingAmount.value = true
  if (!totalAmount.value) totalAmountInput.value = ''
  requestAnimationFrame(() => (e.target as HTMLInputElement).select())
}
function onAmountTyping() {
  totalAmountInput.value = totalAmountInput.value.replace(/[^\d.,]/g, '')
}
function onAmountCommit() {
  amountInputEl.value?.blur()
}
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

function assetSymbolsLower(): string[] {
  return Array.from(new Set(assets.value.map((a) => a.symbol.toLowerCase())))
}

function assetsWsSend(obj: unknown) {
  if (assetsWs && assetsWs.readyState === WebSocket.OPEN) {
    try { assetsWs.send(JSON.stringify(obj)) } catch { }
  }
}

function assetsDoSubscribe(symbolsLower: string[]) {
  if (!symbolsLower.length) return
  assetsWsSend({
    type: 'subscribe',
    channels: ['ticker', 'kline'],
    symbols: symbolsLower,
    periods: ASSET_KLINE_PERIODS,
  })
}
function assetsDoUnsubscribe(symbolsLower: string[]) {
  if (!symbolsLower.length) return
  assetsWsSend({
    type: 'unsubscribe',
    channels: ['ticker', 'kline'],
    symbols: symbolsLower,
    periods: ASSET_KLINE_PERIODS,
  })
}
function assetsRequestSnapshot(symbolsLower: string[]) {
  if (!symbolsLower.length) return
  assetsWsSend({ type: 'snapshot', symbols: symbolsLower, periods: ASSET_KLINE_PERIODS })
}

// resubscribe ketika daftar aset berubah
function assetsScheduleResubscribe() {
  if (assetsResubTimer) return
  assetsResubTimer = window.setTimeout(() => {
    assetsResubTimer = null
    if (!assetsWs || assetsWs.readyState !== WebSocket.OPEN) return

    const want = new Set(assetSymbolsLower())
    const curr = new Set(assetsSubscribedLower)

    const toSub: string[] = []
    const toUnsub: string[] = []

    for (const s of want) if (!curr.has(s)) toSub.push(s)
    for (const s of curr) if (!want.has(s)) toUnsub.push(s)

    if (toUnsub.length) {
      assetsDoUnsubscribe(toUnsub)
      for (const s of toUnsub) assetsSubscribedLower.delete(s)
    }
    if (toSub.length) {
      assetsDoSubscribe(toSub)
      assetsRequestSnapshot(toSub)
      for (const s of toSub) assetsSubscribedLower.add(s)
    }
  }, 200)
}

// buffer untuk mengurangi rerender
const assetsPending: Record<string, { last?: number; klineClose?: number }> = {}
let assetsFlushTimer: ReturnType<typeof setTimeout> | null = null

function assetsScheduleFlush() {
  if (assetsFlushTimer) return
  assetsFlushTimer = window.setTimeout(() => {
    for (const [symLower, payload] of Object.entries(assetsPending)) {
      const a = assetMap.get(symLower.toUpperCase())
      if (!a) { delete assetsPending[symLower]; continue }

      let changed = false
      if (payload.last !== undefined && a.lastPrice !== payload.last) {
        a.lastPrice = payload.last
        changed = true
      }
      if (payload.klineClose !== undefined && a.lastPrice !== payload.klineClose) {
        a.lastPrice = payload.klineClose
        changed = true
      }
      if (changed) {
        a.valueUsd = a.qty * a.lastPrice
        a.uPnlAbs = (a.lastPrice - a.avgCost) * a.qty
        a.uPnlPct = a.avgCost > 0 ? ((a.lastPrice - a.avgCost) / a.avgCost) * 100 : 0
      }
      delete assetsPending[symLower]
    }
    assetsFlushTimer = null
  }, 300)
}

function connectAssetsWs() {
  if (assetsWs) {
    try { assetsWs.close() } catch { }
    assetsWs = null
  }

  assetsWs = new WebSocket(ASSETS_WS_URL)

  assetsWs.onopen = () => {
    assetsSubscribedLower = new Set()
    assetsScheduleResubscribe()
  }

  assetsWs.onclose = () => {
    assetsWs = null
    if (assetsReconnectTimer) clearTimeout(assetsReconnectTimer)
    assetsReconnectTimer = window.setTimeout(connectAssetsWs, 2000)
  }

  assetsWs.onerror = () => {
    try { assetsWs?.close() } catch { }
  }

  assetsWs.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data as string)

      // snapshot batched
      if (msg?.type === 'snapshot' && Array.isArray(msg.items)) {
        for (const it of msg.items) {
          const symLower = String(it.symbol || '').toLowerCase()
          if (!symLower) continue
          if (it.type === 'ticker' && Number.isFinite(Number(it.last))) {
            (assetsPending[symLower] ||= {}).last = Number(it.last)
          } else if (it.type === 'kline' && it.period === '1day') {
            const c = Number(it.close)
            if (Number.isFinite(c)) (assetsPending[symLower] ||= {}).klineClose = c
          }
        }
        assetsScheduleFlush()
        return
      }

      // event individual
      const symLower = String(msg.symbol || '').toLowerCase()
      if (!symLower) return

      if (msg.type === 'ticker' && Number.isFinite(Number(msg.last))) {
        (assetsPending[symLower] ||= {}).last = Number(msg.last)
        assetsScheduleFlush()
        return
      }
      if (msg.type === 'kline' && msg.period === '1day') {
        const close = Number(msg.close)
        if (Number.isFinite(close)) {
          (assetsPending[symLower] ||= {}).klineClose = close
          assetsScheduleFlush()
        }
        return
      }
    } catch {
      /* ignore */
    }
  }
}

// panggil saat mounted
onMounted(async () => {
  await loadAssets()
  rebuildAssetMap()
  connectAssetsWs()
})
watch(
  assets,
  () => {
    rebuildAssetMap()
    assetsScheduleResubscribe()
  },
  { deep: true },
)
onUnmounted(() => {
  if (assetsWs) {
    try { assetsWs.close() } catch { }
    assetsWs = null
  }
  if (assetsReconnectTimer) {
    clearTimeout(assetsReconnectTimer)
    assetsReconnectTimer = null
  }
})

/* ===== URL sync & lifecycle ===== */
function rawSymbolFromRoute(): string {
  return (route.query.symbol as string) ?? (route.query.pairSymbol as string) ?? ''
}

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
  if (pair === selectedPair.value) {
    dropdownOpen.value = false
    return
  }
  selectedPair.value = pair
  dropdownOpen.value = false
  router.replace({ query: { ...route.query, symbol: pairToQuery(pair) } })
  resetLocalData()
  scheduleResubscribe()
  getAvailable()
}
watch(tf, () => {
  scheduleResubscribe()
  scheduleChartFlush()
})

onUnmounted(() => {
  try {
    aggWS.value?.close()
  } catch { }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
})

/* ===== Order submit (tetap) ===== */
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
      totalAmount.value = 0
      totalAmountInput.value = ''
      rawPercent.value = 0
      amountPercent.value = 0
    } else {
      if (totalAmount.value > a) totalAmount.value = a
      totalAmountInput.value =
        activeTab.value === 'buy'
          ? (totalAmount.value || 0).toFixed(2)
          : (totalAmount.value || 0).toFixed(8)
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

const PENDING_LS_KEY = 'pendingTxs'
function hasPendingTxs(): boolean {
  if (!isBrowser()) return false
  const raw = localStorage.getItem(PENDING_LS_KEY)
  if (!raw) return false
  try {
    const arr = JSON.parse(raw)
    return Array.isArray(arr) && arr.length > 0
  } catch {
    return false
  }
}

/* ===== Order submit (updated) ===== */
type SaveTradePayload = {
  symbol: string
  side: 'BUY' | 'SELL'
  price: number
  qty: number
  fee: number
  event_price: number // ⬅️ NEW
}

async function submitTrade() {
  if (submitting.value) return
  submitError.value = ''
  if (hasPendingTxs()) {
    modal.open(
      'Error',
      'You already have a pending copy trade. Please wait until it completes before placing a new order.',
    )
    return
  }
  try {
    submitting.value = true
    const token = isBrowser() ? localStorage.getItem('token') : ''
    if (!token) throw new Error('No token')

    const side = activeTab.value === 'buy' ? 'BUY' : 'SELL'
    let price = marketPrice.value
    if (!price || price <= 0) throw new Error('Market price is not available')

    const bid = bestBid(),
      ask = bestAsk()
    if (bid > 0 && ask > 0) {
      const spreadPct = ((ask - bid) / bid) * 100
      if (spreadPct > 2) throw new Error(`Spread too wide (${spreadPct.toFixed(2)}%).`)
      if (side === 'BUY' && price !== ask) price = ask
      if (side === 'SELL' && price !== bid) price = bid
    }

    const amount = Number(totalAmount.value)
    if (!(amount > 0)) throw new Error('Invalid total')

    let qty = side === 'BUY' ? amount / price : amount
    if (side === 'SELL') {
      const maxQty = Number(coinTotal.value ?? 0)
      const EPS = 1e-10
      qty = Math.min(qty, Math.max(0, maxQty - EPS))
      qty = Math.floor(qty * 1e8) / 1e8
    } else {
      qty = Math.floor(qty * 1e8) / 1e8
    }
    if (!(qty > 0)) throw new Error('Qty becomes 0 after rounding')

    // event_price as USDT net:
    // BUY  -> amount + fee  (what you actually spend; if fee=0, same as amount)
    // SELL -> price*qty - fee (what you actually receive)
    const netBuy = amount + 0 // fee is 0 in your payload, adjust if you add fee later
    const netSell = price * qty - 0 // fee=0 in payload; if you add fee, subtract it here

    const payload: SaveTradePayload = {
      symbol: pairToApiSymbol(selectedPair.value),
      side,
      price,
      qty,
      fee: 0,
      event_price: side === 'BUY' ? netBuy : netSell, // ⬅️ send USDT net
    }

    const res = await fetch(`${API_BASE}/save-trades`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
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
    totalAmount.value = 0
    totalAmountInput.value = ''
    rawPercent.value = 0
    amountPercent.value = 0
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to submit order'
    submitError.value = msg
    modal.open('Error', msg)
  } finally {
    submitting.value = false
  }
}

/* ===== Chart props ===== */
const dataForChart = computed(() => {
  if (kind.value === 'candlestick')
    return { candleData: chartCandles.value, data: [] as LineData[] }
  if (kind.value === 'line') return { candleData: [] as CandlestickData[], data: chartLine.value }
  return { candleData: [] as CandlestickData[], data: chartArea.value }
})
</script>
