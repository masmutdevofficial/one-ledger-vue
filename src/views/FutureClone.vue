<template>
  <div>
    <!-- TOP NAV -->
    <header class="flex items-center justify-between px-4 py-2 border-b border-gray-200">
      <nav class="flex items-center space-x-6 text-gray-600 text-sm font-semibold">
        <a href="#" class="text-black font-extrabold flex items-center space-x-1">
          <span>USD</span>
          <span class="text-xs font-normal">ⓢ-M</span>
        </a>
        <a href="#" class="hover:text-gray-800">COIN-M</a>
        <a href="#" class="hover:text-gray-800">Options</a>
        <a href="#" class="hover:text-gray-800 flex items-center relative">
          <span>Smart Money</span>
          <span
            class="absolute -top-3 right-0 text-[10px] font-semibold bg-yellow-300 text-black rounded-full px-[6px] py-[1px] leading-none">New</span>
        </a>
      </nav>

      <button aria-label="Menu" class="text-gray-700">
        <Icon icon="tabler:menu-2" class="w-6 h-6" />
      </button>
    </header>

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
              <span class="font-bold text-xs text-gray-800">Perp</span>
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
        <button aria-label="Gift" class="relative">
          <Icon icon="tabler:gift" class="w-5 h-5" />
          <span class="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
        </button>
        <button aria-label="Chart" class="relative">
          <Icon icon="tabler:chart-candle" class="w-5 h-5" />
        </button>
        <button aria-label="Percentage" class="relative">
          <Icon icon="tabler:plus-equal" class="w-5 h-5" />
        </button>
        <button aria-label="More options" class="relative">
          <Icon icon="tabler:dots" class="w-5 h-5" />
          <span class="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
        </button>
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
        <!-- Stub chart (UI-only, no library) -->
        <LightChart :series-type="kind" :candle-data="[]" :data="[]"
          :options="{ timeScale: { rightOffset: 12, barSpacing: 5 } }" :fit="false" :initial-bars="180"
          :right-offset="12" :auto-follow="true" />
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
        <!-- Funding & Countdown in 2 columns -->
        <div class="text-[12px] flex flex-col justify-start items-start mb-3">
          <span class="underline decoration-dotted underline-offset-2 text-gray-400 font-semibold">Funding /
            Countdown</span>
          <span class=" text-gray-900 font-semibold">0,0052% / 00:08:44</span>
        </div>


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
        <!-- Mode / Leverage / Side -->
        <div class="grid grid-cols-3 gap-2">
          <button
            class="w-full text-center text-[10px] font-normal border border-gray-300 rounded-md px-2 py-[2px] bg-white cursor-default select-none">
            Isolated
          </button>
          <button
            class="w-full text-center text-[10px] font-normal border border-gray-300 rounded-md px-2 py-[2px] bg-white cursor-default select-none">
            150x
          </button>
          <button
            class="w-full text-center text-[10px] font-normal border border-gray-300 rounded-md px-2 py-[2px] bg-white cursor-default select-none">
            S
          </button>
        </div>

        <div class="space-y-2 text-sm">
          <!-- Avbl -->
          <div class="flex items-center justify-between">
            <span class="text-gray-400 text-xs">Avbl</span>
            <div class="flex items-center space-x-1 text-gray-900 text-xs">
              <span>0,00 USDT</span>
              <Icon icon="tabler:arrows-left-right" class="w-4 h-4 text-yellow-400" />
            </div>
          </div>

          <!-- Order type -->
          <div class="flex items-center justify-between bg-gray-100 rounded-lg px-3 py-2 text-[12px]">
            <div class="flex items-center justify-between space-x-2 w-full">
              <Icon icon="tabler:info-circle-filled" class="w-4 h-4 text-gray-400" />
              <button type="button" class="flex items-center font-semibold text-gray-900">
                Limit
              </button>
              <Icon icon="tabler:chevron-down" class="w-4 h-4 ml-1 text-gray-500" />
            </div>
          </div>

          <!-- Price -->
          <div class="flex items-center justify-between  text-[12px] w-full space-x-2">
            <div class="bg-gray-100 flex-row flex items-center justify-between px-2 rounded-lg w-[97%] py-[4px]">
              <Icon icon="tabler:minus" class="w-4 h-4" />
              <div class="flex-1 text-center ">
                <div class="text-[10px] text-gray-400 leading-none mb-1 ">Price (USDT)</div>
                <div class="font-semibold text-[12px] text-gray-900 leading-tight">{{ marketPrice ?
                  marketPrice.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '-'
                  }}</div>
              </div>
              <Icon icon="tabler:plus" class="w-4 h-4" />
            </div>

            <div class="flex items-center space-x-2 bg-gray-100 rounded-lg py-[4px]">
              <button type="button" class="h-8 px-3 text-gray-900 font-semibold">
                BBO
              </button>
            </div>
          </div>

          <!-- Amount -->
          <div class="flex items-center justify-between bg-gray-100 rounded-lg px-2 py-[4px] text-[12px]">
            <Icon icon="tabler:minus" class="w-4 h-4" />

            <div class="flex-1 text-center">
              <div class="text-[10px] text-gray-400 leading-none">Amount (USDT)</div>
            </div>
            <Icon icon="tabler:plus" class="w-4 h-4" />
            <div class="flex items-center space-x-2">
              <button type="button" class="h-8 px-3 rounded-md text-gray-900 font-semibold flex items-center">
                USDT
                <Icon icon="tabler:chevron-down" class="w-4 h-4 ml-1 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        <!-- SLIDER -->
        <div class="w-full">
          <input type="range" v-model.number="rawPercent" min="0" max="100" step="1" :style="sliderStyle"
            @input="onInput(($event.target as HTMLInputElement).valueAsNumber)" @change="commitSnap"
            @pointerdown="isDragging = true" @pointerup="handlePointerUp"
            class="w-full h-2 rounded-lg appearance-none cursor-pointer accent-teal-600 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:mt-[-4px]" />

          <div class="flex justify-between text-xs text-gray-400 mt-1">
            <button v-for="m in marks" :key="m" type="button" @click="setPercent(m)" class="select-none transition"
              :class="[amountPercent === m ? 'text-gray-900 font-semibold' : '']">
              {{ m }}%
            </button>
          </div>
        </div>

        <form class="space-y-4 text-sm text-gray-800">
          <!-- Options -->
          <fieldset class="space-y-2">
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

          <!-- Buy/Long -->
          <div class="space-y-1">
            <div class="flex justify-between text-xs text-gray-600">
              <span>Max</span><span>0,0 USDT</span>
            </div>
            <div class="flex justify-between text-xs text-gray-600">
              <span>Cost</span><span>0 USDT</span>
            </div>
            <button type="button"
              class="w-full bg-teal-500 text-white rounded-md py-2 font-medium hover:bg-green-700 transition-colors">
              Buy/Long
            </button>
          </div>

          <!-- Sell/Short -->
          <div class="space-y-1">
            <div class="flex justify-between text-xs text-gray-600">
              <span>Max</span><span>0,0 USDT</span>
            </div>
            <div class="flex justify-between text-xs text-gray-600">
              <span>Cost</span><span>0 USDT</span>
            </div>
            <button type="button"
              class="w-full bg-red-500 text-white rounded-md py-2 font-medium hover:bg-red-700 transition-colors">
              Sell/Short
            </button>
          </div>
        </form>

      </div>
    </div>

    <div class="max-w-md mx-auto p-4 mb-10">
      <!-- Tabs + History icon -->
      <nav class="flex items-center gap-6 text-sm font-normal text-gray-500">
        <button type="button" class="relative font-semibold text-black hover:text-black">
          Positions (0)
          <span class="absolute -bottom-1 left-0 w-8 h-0.5 bg-yellow-400 rounded-full"></span>
        </button>

        <button type="button" class="hover:text-gray-800">Open Orders (0)</button>
        <button type="button" class="hover:text-gray-800">Futures Grid</button>

        <!-- Riwayat (history) icon di paling kanan -->
        <button type="button" aria-label="History"
          class="ml-auto inline-flex items-center justify-end p-1 text-gray-400 hover:text-gray-600 hover:border-gray-400">
          <Icon icon="tabler:file-report" class="w-4 h-4" />
        </button>
      </nav>

      <!-- Empty state -->
      <div class="mt-20 flex flex-col items-center text-center px-4">
        <img src="https://storage.googleapis.com/a1aa/image/b275b4fd-4166-4f3b-ab7c-794a25a1615e.jpg"
          alt="Empty state illustration" class="w-10 h-10 mb-4" width="40" height="40" />
        <p class="font-semibold text-black text-sm mb-1">Available funds: 0,00 USDT</p>
        <p class="text-xs text-gray-400 mb-4">Transfer funds to your Futures Wallet</p>
        <button type="button"
          class="bg-gray-100 text-gray-700 text-xs rounded px-4 py-1 border border-gray-300 hover:bg-gray-200">
          Transfer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import {
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted,
  defineComponent,
  h,
} from 'vue'
import { useRoute, useRouter } from 'vue-router'

/** =========================
 *  UI STATE (tetap ditampilkan)
 *  ========================= */
const showChart = ref(false)
type SeriesKind = 'candlestick' | 'line' | 'area'
const kind = ref<SeriesKind>('candlestick')
const tfs = ['5m', '15m', '1h', '1d'] as const
type TF = (typeof tfs)[number]
const tf = ref<TF>('1h')

const activeTab = ref<'buy' | 'sell'>('buy')
const dropdownOpen = ref(false)
const selectedPair = ref('BTC/USDT')

const tradingPairs = [
  'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'LTC/USDT', 'LINK/USDT', 'TON/USDT', 'SUI/USDT', 'XRP/USDT',
  'QTUM/USDT', 'THETA/USDT', 'ADA/USDT', 'RAD/USDT', 'BAND/USDT', 'ALGO/USDT', 'POL/USDT', 'DOGE/USDT',
  'LUNA/USDT', 'GALA/USDT', 'PEPE/USDT', 'CFX/USDT', 'TRX/USDT', 'TRUMP/USDT', 'SHIB/USDT', 'ARB/USDT',
  'FIL/USDT', 'API3/USDT', 'ENA/USDT', 'BIO/USDT', 'UNI/USDT', 'BTT/USDT', 'SATS/USDT', 'MEME/USDT',
  'GT/USDT', 'OP/USDT', 'AAVE/USDT', 'SNAKES/USDT', 'TIA/USDT', 'SOON/USDT', 'ONDO/USDT', 'NEO/USDT',
  'SKL/USDT', 'MX/USDT', 'FARTCOIN/USDT', 'RATS/USDT', 'ETC/USDT', 'TRB/USDT', 'AVAX/USDT', 'BCH/USDT',
  'BSV/USDT', 'IOTA/USDT', 'CYBER/USDT', 'WIF/USDT', 'CORE/USDT', 'WLD/USDT', 'SEI/USDT', 'VIRTUAL/USDT',
  'RENDER/USDT', 'MOODENG/USDT', 'JUP/USDT', 'PONKE/USDT', 'MNT/USDT', 'PNUT/USDT', 'EIGEN/USDT',
  'GRASS/USDT', 'RAY/USDT', 'EPIC/USDT', 'ZRO/USDT', 'BERA/USDT', 'CA/USDT', 'IP/USDT', 'KAITO/USDT',
  'OMNI/USDT', 'A8/USDT', 'OBOL/USDT', 'SAGA/USDT', 'ORCA/USDT', 'SHELL/USDT', 'NAKA/USDT'
]

/** =========================
 *  Helpers Pair & Route
 *  ========================= */
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
function rawSymbolFromRoute(): string {
  return (route.query.symbol as string) ?? (route.query.pairSymbol as string) ?? ''
}
function selectPair(pair: string) {
  if (!tradingPairs.includes(pair)) return
  if (pair === selectedPair.value) {
    dropdownOpen.value = false
    return
  }
  selectedPair.value = pair
  dropdownOpen.value = false
  router.replace({ query: { ...route.query, symbol: pairToQuery(pair) } })
  scheduleResubscribe()
}

/** =========================
 *  Orderbook + % Change
 *  ========================= */
interface DepthTick { asks: [number, number][], bids: [number, number][] }
interface DepthData { ch: string; ts: number; tick: DepthTick }
const depthData = ref<DepthData | null>(null)
const asksTop = ref<[number, number][]>([])
const bidsTop = ref<[number, number][]>([])
const klineDailyOHLC = ref<{ open: number; close: number; ts: number } | null>(null)

const top12Asks = computed(() => asksTop.value)
const top12Bids = computed(() => bidsTop.value)
const maxAskAmount = computed(() => top12Asks.value.length ? Math.max(...top12Asks.value.map(a => a[1])) : 1)
const maxBidAmount = computed(() => top12Bids.value.length ? Math.max(...top12Bids.value.map(b => b[1])) : 1)

function bestBid(): number {
  const bids = depthData.value?.tick?.bids
  return Array.isArray(bids) && bids.length ? Number(bids[0][0]) : 0
}
function bestAsk(): number {
  const asks = depthData.value?.tick?.asks
  return Array.isArray(asks) && asks.length ? Number(asks[0][0]) : 0
}
const marketPrice = computed<number>(() => (activeTab.value === 'buy' ? bestAsk() : bestBid()))
const percentChange = computed(() => {
  const k = klineDailyOHLC.value
  if (!k || !k.open) return null
  return ((k.close - k.open) / k.open) * 100
})

/** =========================
 *  WebSocket (Only)
 *  ========================= */
const aggWS = ref<WebSocket | null>(null)
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let flushTimer: ReturnType<typeof setTimeout> | null = null
let pendingDepth: { ts: number; asks: [number, number][]; bids: [number, number][]; sym: string } | null = null

function wsSend(obj: unknown) {
  if (aggWS.value && aggWS.value.readyState === WebSocket.OPEN) {
    try { aggWS.value.send(JSON.stringify(obj)) } catch { }
  }
}
function subscribe(symLower: string) {
  // Depth + 1day kline (for % change)
  wsSend({ type: 'subscribe', channels: ['depth', 'kline'], symbols: [symLower], periods: ['1day'], limit: 300 })
  wsSend({ type: 'snapshot', symbols: [symLower], periods: ['1day'], limit: 300 })
}
function unsubscribe(symLower: string) {
  wsSend({ type: 'unsubscribe', channels: ['depth', 'kline'], symbols: [symLower], periods: ['1day'] })
}
let subscribedSym: string | null = null
function scheduleResubscribe() {
  const ws = aggWS.value
  if (!ws || ws.readyState !== WebSocket.OPEN) return
  const sym = pairToQuery(selectedPair.value)
  if (subscribedSym && subscribedSym !== sym) {
    unsubscribe(subscribedSym)
  }
  subscribe(sym)
  subscribedSym = sym
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
          asks: asksAsc.slice(0, 20),
          bids: bidsDesc.slice(0, 20),
        },
      }
      asksTop.value = asksAsc.slice(0, 12)
      bidsTop.value = bidsDesc.slice(0, 12)
      pendingDepth = null
    }
    flushTimer = null
  }, 80)
}

function connectAggregatorWS() {
  try { aggWS.value?.close() } catch { }
  aggWS.value = new WebSocket('wss://ledgersocketone.online')

  aggWS.value.onopen = () => {
    subscribedSym = null
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

      // Snapshot
      if (msg?.type === 'snapshot' && Array.isArray(msg.items)) {
        const want = pairToQuery(selectedPair.value)
        for (const it of msg.items) {
          const symLower = String(it.symbol || '').toLowerCase()
          if (!symLower || symLower !== want) continue
          if (it.type === 'depth') {
            const bids = Array.isArray(it.bids) ? it.bids as [number, number][] : []
            const asks = Array.isArray(it.asks) ? it.asks as [number, number][] : []
            pendingDepth = { ts: Number(it.ts) || Date.now(), asks, bids, sym: symLower }
          } else if (it.type === 'kline' && it.period === '1day') {
            const open = Number(it.open), close = Number(it.close)
            if (Number.isFinite(open) && Number.isFinite(close)) {
              klineDailyOHLC.value = { open, close, ts: Number(it.ts) || Date.now() }
            }
          }
        }
        scheduleFlush()
        return
      }

      // Stream
      const type: string | undefined = msg?.type
      const symLower = String(msg.symbol || '').toLowerCase()
      if (!type || !symLower || symLower !== pairToQuery(selectedPair.value)) return

      if (type === 'depth') {
        const bids = Array.isArray(msg.bids) ? msg.bids as [number, number][] : []
        const asks = Array.isArray(msg.asks) ? msg.asks as [number, number][] : []
        pendingDepth = { ts: Number(msg.ts) || Date.now(), asks, bids, sym: symLower }
        scheduleFlush()
        return
      }

      if (type === 'kline' && msg.period === '1day') {
        const open = Number(msg.open), close = Number(msg.close)
        if (Number.isFinite(open) && Number.isFinite(close)) {
          klineDailyOHLC.value = { open, close, ts: Number(msg.ts) || Date.now() }
        }
        return
      }
    } catch { /* ignore */ }
  }
}

/** =========================
 *  Form (UI only; no business logic)
 *  ========================= */
const availableUnit = computed(() => (activeTab.value === 'buy' ? 'USDT' : baseAsset.value))
const totalAmountInput = ref<string>('')
const amountInputEl = ref<HTMLInputElement | null>(null)
const isEditingAmount = ref(false)
function onAmountFocus(e: FocusEvent) {
  isEditingAmount.value = true
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
}

/* Slider (visual only) */
const marks = [0, 25, 50, 75, 100]
const rawPercent = ref<number>(0)
const amountPercent = ref<number>(0)
const isDragging = ref<boolean>(false)
function setPercent(p: number) {
  amountPercent.value = p
  rawPercent.value = p
}
function onInput(v: number) {
  rawPercent.value = v
}
function commitSnap() {
  // snap ke marks terdekat (visual)
  let nearest = 0, best = Infinity
  for (const m of marks) {
    const d = Math.abs(rawPercent.value - m)
    if (d < best) { best = d; nearest = m }
  }
  amountPercent.value = nearest
  rawPercent.value = nearest
}
function handlePointerUp() {
  isDragging.value = false
  commitSnap()
}
const sliderStyle = computed(() => {
  const p = isDragging.value ? rawPercent.value : amountPercent.value
  return { background: `linear-gradient(to right, #22c55e ${p}%, #e5e7eb ${p}%)` }
})

/** =========================
 *  Stub Chart Component
 *  ========================= */
const LightChart = defineComponent({
  name: 'LightChartStub',
  props: {
    seriesType: { type: String, default: 'candlestick' },
    candleData: { type: Array, default: () => [] },
    data: { type: Array, default: () => [] },
    options: { type: Object, default: () => ({}) },
    fit: { type: Boolean, default: false },
    initialBars: { type: Number, default: 180 },
    rightOffset: { type: Number, default: 12 },
    autoFollow: { type: Boolean, default: true },
  },
  setup() {
    return () =>
      h(
        'div',
        {
          class:
            'w-full h-[240px] bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center text-xs text-gray-400 select-none',
        },
        'Chart preview',
      )
  },
})

/** =========================
 *  Lifecycle & watchers
 *  ========================= */
onMounted(() => {
  const pairFromUrl = toPair(rawSymbolFromRoute())
  selectedPair.value = pairFromUrl || 'BTC/USDT'
  connectAggregatorWS()
  scheduleResubscribe()
})
watch([() => route.query.symbol, () => route.query.pairSymbol], ([sym, pairSym]) => {
  const pair = toPair((sym as string) ?? (pairSym as string))
  if (pair && pair !== selectedPair.value) {
    selectedPair.value = pair
    dropdownOpen.value = false
    router.replace({ query: { ...route.query, symbol: pairToQuery(pair) } })
    scheduleResubscribe()
  }
})
watch(tf, () => {
  // keep for UI toggle; no extra logic needed
})
onUnmounted(() => {
  try { aggWS.value?.close() } catch { }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
})
</script>
