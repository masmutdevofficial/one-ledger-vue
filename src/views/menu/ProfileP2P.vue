<template>
  <div class="max-w-md mx-auto p-6 relative mb-10">
    <!-- Header -->
    <div class="flex justify-between items-start mb-4">
      <div class="flex flex-col items-start space-x-4">
        <div class="w-16 h-16 rounded-full border border-[#a3b13f] overflow-hidden flex-shrink-0 mb-4">
          <img :alt="`${name} profile photo`" class="w-full h-full object-cover" :src="profileImageUrl" width="64"
            height="64" />
        </div>
        <div>
          <h1 class="text-lg font-semibold leading-tight uppercase tracking-wide">
            {{ name }}
          </h1>
          <p class="text-sm text-gray-600 max-w-[380px] leading-snug">
            {{ description }}
          </p>
        </div>
      </div>

      <button aria-label="Close" class="text-black text-2xl font-bold leading-none">
        <Icon icon="tabler:x" class="w-6 h-6" />
      </button>
    </div>

    <!-- Star badge -->
    <div class="flex justify-end mb-4 absolute top-18 right-6">
      <button type="button"
        class="flex items-center space-x-1 bg-white border border-gray-300 rounded-md px-3 py-1 text-gray-700 text-sm shadow-sm">
        <Icon icon="tabler:star" class="w-4 h-4" />
        <span>{{ formatInt(starCount) }}</span>
      </button>
    </div>

    <!-- Collapse arrow (visual only) -->
    <div class="flex justify-end mb-2 absolute top-33 right-6">
      <button aria-label="Toggle details" type="button" class="text-gray-600">
        <Icon icon="tabler:chevron-down" class="w-5 h-5" />
      </button>
    </div>

    <!-- Badges -->
    <div class="flex flex-wrap gap-2 mb-6">
      <span class="text-xs font-semibold text-yellow-700 bg-yellow-200 rounded px-2 py-0.5">
        10x to 20x leverage
      </span>
      <span class="text-xs font-semibold bg-gray-200 text-gray-800 rounded px-2 py-0.5">
        Top Performer
      </span>
      <span class="text-xs font-semibold bg-gray-200 text-gray-800 rounded px-2 py-0.5">
        Whale Manager
      </span>
    </div>

    <!-- Four stats -->
    <div class="grid grid-cols-4 gap-x-6 gap-y-2 text-[10px] text-gray-400 mb-4">
      <div>
        <div>Days trading</div>
        <div class="font-bold text-gray-900">{{ formatInt(daysTrading) }}</div>
      </div>
      <div>
        <div>Total copiers</div>
        <div class="font-bold text-gray-900">{{ formatInt(totalCopiers) }}</div>
      </div>
      <div>
        <div>Total group</div>
        <div class="font-bold text-gray-900">{{ formatInt(totalGroup) }}</div>
      </div>
      <div>
        <div>Phone number</div>
        <div class="font-bold text-gray-900">{{ phoneNumber }}</div>
      </div>
    </div>

    <hr class="border-gray-300 mb-4" />

    <!-- Balance / AUM / Min Copy / Profit Sharing -->
    <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-[12px] text-gray-400 mb-4">
      <div>
        <div>Leading Margin Balance (USDT)</div>
        <div class="font-bold text-gray-900">{{ formatMoney(leadingMarginBalance) }}</div>
      </div>
      <div>
        <div class="underline decoration-dotted underline-offset-2">AUM (USDT)</div>
        <div class="font-bold text-gray-900">{{ formatMoney(aum) }}</div>
      </div>
      <div>
        <div class="underline decoration-dotted underline-offset-2">Min. Copy Amount (USDT)</div>
        <div class="font-bold text-gray-900">
          {{ formatInt(minCopyMin) }}/{{ formatInt(minCopyMax) }}
        </div>
      </div>
      <div>
        <div class="underline decoration-dotted underline-offset-2">Profit Sharing</div>
        <div class="font-bold text-gray-900">{{ profitSharing.toFixed(2) }}%</div>
      </div>
    </div>

    <!-- Performance -->
    <h2 class="font-bold text-base mb-3">Performance</h2>
    <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-[12px] text-gray-400 mb-4">
      <div>
        <div>ROI (1Y)</div>
        <div class="font-bold text-teal-500">+{{ roi1y.toFixed(2) }}%</div>
      </div>
      <div>
        <div>PnL (USDT)</div>
        <div class="font-bold text-teal-500">+{{ formatMoney(pnlUsdt) }}</div>
      </div>
      <div>
        <div>Copiers PnL (USDT)</div>
        <div class="font-bold text-teal-500">+{{ formatMoney(copiersPnl) }}</div>
      </div>
      <div>
        <div>Sharpe Ratio</div>
        <div class="font-bold text-gray-900">{{ sharpeRatio }}</div>
      </div>
      <div>
        <div>MDD</div>
        <div class="font-bold text-gray-900">{{ mdd.toFixed(2) }}%</div>
      </div>
      <div>
        <div>Win Rate</div>
        <div class="font-bold text-gray-900">{{ winRate.toFixed(2) }}%</div>
      </div>
      <div>
        <div>Profitable Positions</div>
        <div class="font-bold text-gray-900">{{ formatInt(profitablePositions) }}</div>
      </div>
      <div>
        <div>Total Positions</div>
        <div class="font-bold text-gray-900">{{ formatInt(totalPositions) }}</div>
      </div>
    </div>

    <!-- Asset Preferences -->
    <h3 class="font-bold text-base mb-4">Asset Preferences</h3>
    <div class="flex items-center justify-between space-x-6 w-full">
      <!-- Donut (image) -->
      <div class="w-20 h-20 relative">
        <img src="/img/chart-profile.png" alt="Asset distribution donut chart" class="w-20 h-20 object-contain" />
      </div>

      <!-- Legend -->
      <div class="flex flex-col justify-between space-y-2 text-[12px] text-gray-900 relative right-20">
        <div v-for="it in assetPrefs" :key="it.label" class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded-sm" :style="{ backgroundColor: it.color }"></div>
          <span class="text-gray-400">{{ it.label }}</span>
          <span class="ml-8 text-gray-900">{{ it.value.toFixed(2) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

/* ---- Data default ---- */
const name = 'MICHAEL HARTONO'
const profileImageUrl = '/img/michael-hartono.jpeg'
const description =
  'Experienced Copy Trading Master with a strong track record in managing diversified trading strategies across, crypto, and commodities. Focused on consistent risk management, sustainable growth, and transparent results. Helping traders replicate proven strategies with disciplined execution and long-term profitability in mind.'

const starCount = 8177

const daysTrading = 380
const totalCopiers = 3011
const totalGroup = 19
const phoneNumber = '6287884722685'

const leadingMarginBalance = 249800.25
const aum = 836269.1
const minCopyMin = 100
const minCopyMax = 35000
const profitSharing = 10.0

const roi1y = 65.24
const pnlUsdt = 184500.3
const copiersPnl = 72350.25
const sharpeRatio = 2.8
const mdd = 18.9
const winRate = 64.25
const profitablePositions = 312
const totalPositions = 486

/* Legend data (warna harus match gambar chart-profile.png) */
const assetPrefs = [
  { label: 'BTC', value: 52.1, color: '#2563EB' },   // sesuaikan warna dengan chart
  { label: 'ETH', value: 34.55, color: '#F59E0B' },
  { label: 'SOL', value: 8.2, color: '#7DD3FC' },
  { label: 'OTHER', value: 5.15, color: '#9CA3AF' },
]

/* Helpers */
function formatMoney(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function formatInt(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}
</script>
