<template>
  <div class="px-4 pt-0 space-y-4 flex-1 overflow-auto mb-20">
    <button aria-label="Go back" class="text-black text-xl" @click="goBack">
      <Icon icon="tabler:arrow-left" width="24" height="24" />
    </button>
    <section
      v-for="airdrop in airdrops"
      :key="airdrop.id"
      :aria-label="`${airdrop.token} airdrop details`"
      class="bg-white rounded-[12px] p-4 shadow-sm border border-[#F0F0F0] relative"
    >
      <span
        class="absolute top-2 right-3 text-[10px] font-semibold text-[#4B5563] bg-[#F3F4F6] px-2 py-[2px] rounded-[8px] flex items-center gap-1"
      >
        <Icon v-if="airdrop.statusIcon" :icon="airdrop.statusIcon" class="w-3.5 h-3.5" />
        {{ airdrop.status }}
      </span>
      <div class="flex items-center space-x-3 mb-2">
        <img
          :alt="airdrop.logoAlt"
          class="w-8 h-8 flex-shrink-0 rounded-full"
          height="32"
          :src="airdrop.logo"
          width="32"
        />
        <div>
          <h2 class="font-semibold text-base text-[#0B1437] leading-5">
            {{ airdrop.token }}
            <span class="font-normal text-xs text-[#6B7280] ml-1"> HODLer Airdrops </span>
          </h2>
          <p class="text-sm text-[#9CA3AF] mt-0.5">
            {{ airdrop.total }}
          </p>
        </div>
      </div>
      <p class="text-xs text-[#9CA3AF] mb-1">Average Airdrop</p>
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-1 text-sm font-semibold text-[#0B1437]">
          <img
            alt="Binance Coin icon yellow circle with BNB symbol"
            class="w-4 h-4"
            height="16"
            :src="airdrop.baseCoinIcon"
            width="16"
          />
          <span>Per {{ airdrop.baseCoin }}</span>
        </div>
        <div class="text-right">
          <p class="font-semibold text-sm text-[#0B1437]">
            {{ airdrop.avgAmount }} {{ airdrop.token }}
          </p>
          <p class="text-xs text-[#9CA3AF]">≈{{ airdrop.avgValue }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
const router = useRouter()

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/buy-p2p')
}
interface Airdrop {
  id: number
  token: string
  logo: string
  logoAlt: string
  status: string
  statusIcon?: string // tabler icon name, optional
  total: string
  baseCoin: string
  baseCoinIcon: string
  avgAmount: string
  avgValue: string
}

const airdrops: Airdrop[] = [
  {
    id: 1,
    token: 'SAHARA',
    logo: 'https://storage.googleapis.com/a1aa/image/8801b649-6527-4842-7185-fe4a2aa2c348.jpg',
    logoAlt: 'SAHARA logo black and white stylized icon',
    status: 'Distributed',
    // statusIcon: 'tabler:check', // Bisa isi icon jika mau, contoh: 'tabler:check'
    total: '125,000,000 SAHARA',
    baseCoin: 'BNB',
    baseCoinIcon:
      'https://storage.googleapis.com/a1aa/image/db692739-e0bb-487e-ba87-6ec3d44763fa.jpg',
    avgAmount: '7.2399',
    avgValue: '8,977.45 IDR',
  },
  {
    id: 2,
    token: 'NEWT',
    logo: 'https://storage.googleapis.com/a1aa/image/d945c8b1-2330-4f40-7267-d511f078929c.jpg',
    logoAlt: 'NEWT black and white circular logo icon',
    status: 'Distributed',
    total: '12,500,000 NEWT',
    baseCoin: 'BNB',
    baseCoinIcon:
      'https://storage.googleapis.com/a1aa/image/db692739-e0bb-487e-ba87-6ec3d44763fa.jpg',
    avgAmount: '0.7243',
    avgValue: '3,945.65 IDR',
  },
  {
    id: 3,
    token: 'SPK',
    logo: 'https://storage.googleapis.com/a1aa/image/cdde2e14-726b-4afa-119c-620743868fe3.jpg',
    logoAlt: 'SPK logo pink and orange star icon',
    status: 'Distributed',
    total: '200,000,000 SPK',
    baseCoin: 'BNB',
    baseCoinIcon:
      'https://storage.googleapis.com/a1aa/image/db692739-e0bb-487e-ba87-6ec3d44763fa.jpg',
    avgAmount: '11.5733',
    avgValue: '6,684.09 IDR',
  },
  {
    id: 4,
    token: 'LAYER',
    logo: 'https://storage.googleapis.com/a1aa/image/966426e4-c8ee-47e9-d66c-d429ca9c013c.jpg',
    logoAlt: 'LAYER green circular logo with white L icon',
    status: 'Distributed',
    total: '6,000,000 LAYER',
    baseCoin: 'BNB',
    baseCoinIcon:
      'https://storage.googleapis.com/a1aa/image/db692739-e0bb-487e-ba87-6ec3d44763fa.jpg',
    avgAmount: '0.3436',
    avgValue: '3,523.81 IDR',
  },
]
</script>
