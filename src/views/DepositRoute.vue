<!-- AddFundsEntry.vue -->
<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack(): void {
  // gunakan history back; fallback ke home bila tidak ada history
  if (window.history.length > 1) router.back()
  else router.push('/')
}

function goP2P(): void {
  router.push('/p2p')
}

function goOnChainDeposit(): void {
  router.push('/on-chain-deposit')
}
</script>

<template>
  <div class="p-4">
    <!-- Navigation and currency -->
    <div class="flex justify-between items-center mb-6">
      <button
        type="button"
        aria-label="Back"
        class="inline-flex items-center gap-2 text-black text-sm font-semibold hover:opacity-80"
        @click="goBack"
      >
        <Icon icon="tabler:arrow-left" width="22" height="22" />
        <span class="text-xs">Back</span>
      </button>

      <button
        type="button"
        class="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1 text-[10px] font-semibold hover:bg-gray-50"
      >
        <img src="/img/crypto/usdt.svg" alt="USDT" class="w-5 h-5 rounded-full object-contain" />
        <span>USDT</span>
      </button>
    </div>

    <!-- Content -->
    <div>
      <h2 class="font-semibold text-sm mb-3">I don’t have crypto assets</h2>

      <button
        type="button"
        class="w-full border border-gray-300 rounded-lg p-4 flex items-center gap-4 mb-8 hover:bg-gray-50"
        @click="goP2P"
      >
        <div class="text-black">
          <Icon icon="tabler:users" width="24" height="24" />
        </div>
        <div class="text-left">
          <p class="font-semibold text-xs leading-tight">Buy with USD (P2P)</p>
          <p class="text-gray-400 text-[10px] leading-tight mt-1">
            Buy from users. Competitive prices. Local payments
          </p>
        </div>
        <Icon icon="tabler:chevron-right" class="ml-auto" width="20" height="20" />
      </button>

      <h2 class="font-semibold text-sm mb-3">I have crypto assets</h2>

      <button
        type="button"
        class="w-full border border-gray-300 rounded-lg p-4 flex items-center gap-4 hover:bg-gray-50"
        @click="goOnChainDeposit"
      >
        <div class="text-black">
          <Icon icon="tabler:arrow-down" width="24" height="24" />
        </div>
        <div class="text-left">
          <p class="font-semibold text-xs leading-tight">On-Chain Deposit</p>
          <p class="text-gray-400 text-[10px] leading-tight mt-1">
            Deposit crypto from other exchanges/wallets to Binance.
          </p>
        </div>
        <Icon icon="tabler:chevron-right" class="ml-auto" width="20" height="20" />
      </button>
    </div>
  </div>
</template>
