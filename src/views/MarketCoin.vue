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
          class="absolute z-10 mt-2 w-40 bg-white border border-gray-200 rounded shadow-md"
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
      <span class="text-teal-600 text-sm font-semibold">+2,37%</span>
    </div>

    <div class="grid grid-cols-2 gap-4 max-w-md md:max-w-4xl mx-auto mt-4 px-4">
      <!-- KIRI: SELL + BUY LIST -->
      <div>
        <!-- SELL LIST -->
        <div class="flex justify-between text-gray-400 text-xs pb-1">
          <span>Price (USDT)</span>
          <span>Amount (BTC)</span>
        </div>
        <div class="space-y-1">
          <div class="flex justify-between">
            <p class="text-pink-400 text-sm text-right">108.846,99</p>
            <p class="text-black text-sm text-left">0,34346</p>
          </div>
          <div class="flex justify-between">
            <p class="text-pink-400 text-sm text-right">108.846,98</p>
            <p class="text-black text-sm text-left">0,00010</p>
          </div>
          <div class="flex justify-between">
            <p class="text-pink-400 text-sm text-right">108.846,97</p>
            <p class="text-black text-sm text-left">0,11880</p>
          </div>
          <div class="flex justify-between">
            <p class="text-pink-400 text-sm text-right">108.846,96</p>
            <p class="text-black text-sm text-left">0,00010</p>
          </div>
          <div class="flex justify-between">
            <p class="text-pink-400 text-sm text-right">108.846,14</p>
            <p class="text-black text-sm text-left">8,19817</p>
          </div>
        </div>

        <!-- CURRENT PRICE -->
        <div class="text-center my-3">
          <p class="text-[#2DBE87] font-semibold text-[28px]">108.846,14</p>
          <p class="text-[#7F7F7F] text-[14px]">≈ $108.846,14</p>
        </div>

        <!-- BUY LIST -->
        <div class="space-y-1">
          <div class="flex justify-between">
            <p class="text-[#2DBE87]">108.846,13</p>
            <p class="text-black">0,56438</p>
          </div>
          <div class="flex justify-between">
            <p class="text-[#2DBE87]">108.846,12</p>
            <p class="text-black">0,00087</p>
          </div>
          <div class="flex justify-between">
            <p class="text-[#2DBE87]">108.845,65</p>
            <p class="text-black">0,00006</p>
          </div>
          <div class="flex justify-between">
            <p class="text-[#2DBE87]">108.845,29</p>
            <p class="text-black">0,01015</p>
          </div>
          <div class="flex justify-between">
            <p class="text-[#2DBE87]">108.844,83</p>
            <p class="text-black">0,00010</p>
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
              activeTab === 'sell' ? 'bg-teal-500 text-white' : 'text-gray-400',
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

        <!-- TOTAL DROPDOWN -->
        <div
          class="flex justify-between items-center bg-gray-100 rounded px-3 py-2 text-sm text-gray-500 font-normal"
        >
          <span>Total</span>
          <button class="text-gray-900 font-bold flex items-center space-x-1">
            <span>USDT</span>
            <Icon icon="tabler:chevron-down" class="text-gray-600" />
          </button>
        </div>

        <!-- SLIDER INPUT -->
        <div class="w-full">
          <input
            type="range"
            v-model="amountPercent"
            min="0"
            max="100"
            step="1"
            :style="{
              background: `linear-gradient(to right, #22c55e ${amountPercent}%, #e5e7eb ${amountPercent}%)`,
            }"
            class="w-full h-2 rounded-lg appearance-none cursor-pointer accent-teal-600 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:mt-[-4px]"
          />
          <div class="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
        <div class="text-xs space-y-1">
          <div class="flex justify-between text-gray-400 italic">
            <span>Avbl</span>
            <span class="text-gray-900 normal-case not-italic flex items-center gap-1">
              0,0022919 USDT
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
            activeTab === 'buy' ? 'bg-teal-600' : 'bg-teal-600',
          ]"
        >
          {{ activeTab === 'buy' ? 'Buy BTC' : 'Sell BTC' }}
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
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

const activeTab = ref<'buy' | 'sell'>('buy')
const amountPercent = ref(0)
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
]

function selectPair(pair: string) {
  selectedPair.value = pair
  dropdownOpen.value = false
}
</script>
