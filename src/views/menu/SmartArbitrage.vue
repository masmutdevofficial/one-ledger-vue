<template>
  <div class="px-4 pt-4 flex-grow">
    <h1 class="font-semibold text-base mb-3">Smart Arbitrage</h1>
    <section class="mb-4">
      <div class="flex items-center space-x-2 mb-1 text-sm font-normal">
        <span>Total Balance</span>
        <button aria-label="Toggle visibility" class="text-gray-500">
          <Icon icon="tabler:eye" class="w-5 h-5" />
        </button>
        <button aria-label="Card icon" class="text-gray-500">
          <Icon icon="tabler:credit-card" class="w-5 h-5" />
        </button>
      </div>
      <div class="font-semibold flex flex-row justify-start items-center text-sm mb-1">
        <p>-- BTC</p>
        <Icon icon="tabler:chevron-down" class="w-5 h-5 ml-3" />
      </div>
      <div class="text-xs text-[#00bfa5]">
        30-Day Profit
        <span class="text-[#00bfa5] font-normal">{{ thirtyDayProfit }}</span>
      </div>
    </section>

    <section class="space-y-3">
      <div
        v-for="coin in coins"
        :key="coin.symbol"
        class="flex justify-between items-center border border-gray-200 rounded-xl px-4 py-3"
        :class="[
          coin.disabled ? 'cursor-default opacity-40 pointer-events-none' : 'cursor-pointer',
        ]"
      >
        <div class="flex items-center space-x-3">
          <img
            :alt="coin.name + ' logo'"
            class="w-6 h-6 rounded-full"
            :src="coin.image"
            height="24"
            width="24"
          />
          <span
            class="font-semibold text-sm flex items-center space-x-1"
            :class="coin.disabled ? 'text-gray-400' : ''"
          >
            <span>{{ coin.symbol }}/USDT</span>
            <Icon icon="tabler:diamond" class="w-3.5 h-3.5" />
          </span>
        </div>
        <div class="text-right" :class="coin.disabled ? 'text-gray-400' : ''">
          <div class="text-[#00bfa5] font-semibold text-sm leading-none">
            {{ coin.apy !== undefined ? coin.apy + '%' : '--' }}
          </div>
          <div class="text-xs text-gray-500 leading-none">
            30d APR:
            <span class="font-semibold">{{ coin.apr }}%</span>
          </div>
        </div>
      </div>
    </section>

    <p class="text-center text-gray-300 text-xs mt-10 mb-6">No more data</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

interface CoinInfo {
  symbol: string
  name: string
  image: string
  apy?: number
  apr: number
  disabled?: boolean
}

// Data coin, update gambar/icon sesuai kebutuhanmu
const coins = ref<CoinInfo[]>([
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    image: 'https://storage.googleapis.com/a1aa/image/a8176844-4797-4058-8a4b-d459f690df88.jpg',
    apy: 6.69,
    apr: 2.88,
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    image: 'https://storage.googleapis.com/a1aa/image/7524abe7-b141-4244-e0e0-a3d6f8307468.jpg',
    apy: 6.91,
    apr: 4.77,
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    image: 'https://storage.googleapis.com/a1aa/image/4879671e-f9ef-4e53-0964-1e9225e80997.jpg',
    apr: 2.74,
    disabled: true,
  },
  {
    symbol: 'XRP',
    name: 'Ripple',
    image: 'https://storage.googleapis.com/a1aa/image/faab8d3d-0b69-4c2a-9728-98e3682106e4.jpg',
    apy: 0.34,
    apr: 5.19,
  },
  {
    symbol: 'DOGE',
    name: 'Dogecoin',
    image: 'https://storage.googleapis.com/a1aa/image/7ff68fe2-0e8b-49f3-7fa2-5ecbcd8ca268.jpg',
    apy: 9.99,
    apr: 4.43,
  },
])

const thirtyDayProfit = '0.00 BTC'
</script>
