<template>
  <div class="w-full max-w-md mx-auto p-4">
    <div class="flex flex-row items-center mb-3">
      <!-- <button aria-label="Go back" class="text-black text-[12px] mr-2" @click="goBack">
        <Icon icon="tabler:arrow-left" width="24" height="24" />
      </button> -->
      <h1 class="font-semibold text-sm">Smart Arbitrage</h1>
    </div>

    <!-- Header -->
    <div class="flex justify-between items-start mb-2">
      <div>
        <p class="text-[12px] text-gray-700 font-normal flex items-center gap-1">
          Total Balance
          <Icon icon="tabler:eye" class="text-gray-400" />
        </p>

        <button
          type="button"
          class="text-[16px] font-extrabold text-black mt-1 flex items-center gap-1"
        >
          ≈ <span>$0.00</span> USD
          <Icon icon="tabler:chevron-down" class="text-xs" />
        </button>

        <p class="text-[12px] mt-1 font-normal">
          30-Day Profit ≈
          <span class="text-green-500 font-semibold">$0.00</span>
        </p>
      </div>

      <img src="/img/robot-logo.png" alt="Menu" class="w-20 h-20 object-contain mr-4" />
    </div>

    <!-- Search -->
    <div class="mb-3 flex items-center">
      <label for="search" class="block text-xs text-gray-400 font-normal"> Asset Name </label>
      <Icon icon="tabler:search" class="text-gray-400 ml-1" />
    </div>

    <!-- List -->
    <div class="space-y-3">
      <RouterLink
        v-for="coin in filteredCoins"
        :key="coin.pair"
        :to="`/smart-arbitrage/detail/${coin.symbol.toLowerCase()}`"
        class="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 hover:bg-gray-100 transition"
      >
        <div class="flex items-center gap-3 relative">
          <img
            :src="coin.logoUrl"
            :alt="`${coin.symbol} logo`"
            class="w-6 h-6 rounded-full"
            width="32"
            height="32"
          />
          <!-- overlay coin logo -->
          <img
            :src="`/img/crypto/usdt.svg`"
            :alt="`USDT logo`"
            class="absolute inset-0 w-4 h-4 top-1.5 left-3.5"
          />
          <span class="text-black font-semibold text-[12px]">{{ coin.pair }}</span>
        </div>

        <div class="text-right">
          <p
            class="font-semibold text-[12px] leading-none"
            :class="coin.changePct >= 0 ? 'text-teal-500' : 'text-red-500'"
          >
            {{ formatPct(coin.changePct) }}
          </p>
          <p class="text-gray-400 text-[10px] leading-none mt-2">
            30d APR: <b class="text-gray-800">{{ formatPct(coin.apr30d) }}</b>
          </p>
        </div>
      </RouterLink>
    </div>

    <p class="text-center text-gray-400 text-[12px] mt-6 font-normal">No more data</p>

    <div
      class="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white shadow-md z-50"
    >
      <div class="flex justify-around items-center py-2 space-x-3">
        <RouterLink to="/dashboard" class="flex flex-col items-center text-gray-400">
          <img alt="Home" src="/img/home-alt.png" class="w-4 h-4 object-contain" />
          <span class="text-xs mt-1 font-semibold">Home</span>
        </RouterLink>
        <div @click="openModalTerm" class="flex flex-col items-center cursor-pointer text-gray-400">
          <img alt="Term" src="/img/term.png" class="w-4 h-4 object-contain" />
          <span class="text-xs mt-1 font-semibold">Term</span>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="showModalTerm"
      class="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/30" @click="closeModalTerm"></div>

      <!-- Panel -->
      <div class="relative z-10 w-full max-w-lg mx-4 rounded-2xl bg-white shadow-xl" @click.stop>
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 class="text-base font-semibold">Terms &amp; Conditions</h3>
          <button
            type="button"
            class="p-1 rounded hover:bg-gray-100"
            @click="closeModalTerm"
            aria-label="Close"
          >
            <Icon icon="tabler:x" class="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <!-- Body (scrollable) -->
        <div
          ref="scrollArea"
          class="max-h-[70dvh] overflow-y-auto px-4 py-3 text-sm leading-relaxed text-gray-700"
          @scroll="onScroll"
        >
          <p class="font-semibold">Terms &amp; Conditions – Smart Arbitrage (Lock Coin APR)</p>

          <h4 class="mt-3 font-semibold">Lock Coin APR Program</h4>
          <p>
            The Smart Arbitrage – Lock Coin APR feature allows users to lock their crypto assets for
            a fixed period in exchange for an Annual Percentage Rate (APR) reward.
          </p>
          <p>The minimum lock-up period is 1 month (30 calendar days).</p>

          <h4 class="mt-3 font-semibold">Early Withdrawal</h4>
          <p>
            If the user withdraws funds before completing 1 full month, the following conditions
            apply:
          </p>
          <ul class="list-disc pl-5 space-y-1">
            <li>A 1% penalty fee will be deducted from the total withdrawn amount.</li>
            <li>All accrued APR interest will be canceled and not paid out.</li>
          </ul>

          <h4 class="mt-3 font-semibold">Withdrawal After Maturity</h4>
          <p>If funds are withdrawn after the 1-month lock-up period, the user is entitled to:</p>
          <ul class="list-disc pl-5 space-y-1">
            <li>The full principal amount (no deduction).</li>
            <li>The APR interest as calculated by the system.</li>
          </ul>

          <h4 class="mt-3 font-semibold">APR Calculation</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>
              Interest is calculated based on the locked amount and the lock-up duration, in
              accordance with system rules.
            </li>
            <li>
              APR interest is only valid if the user completes the full lock-up period (≥ 1 month).
            </li>
          </ul>

          <h4 class="mt-3 font-semibold">Risks &amp; Responsibility</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>Users acknowledge that crypto assets are subject to market volatility.</li>
            <li>
              The platform is not responsible for any loss in asset value caused by market
              fluctuations.
            </li>
            <li>
              By joining this program, users are deemed to have understood and accepted all
              associated risks.
            </li>
          </ul>

          <h4 class="mt-3 font-semibold">Amendments</h4>
          <p>
            The platform reserves the right to review and amend these terms at any time, with prior
            notice to users.
          </p>

          <!-- spacer kecil agar mudah mencapai bottom -->
          <div class="h-2"></div>
        </div>

        <!-- Footer -->
        <div class="px-4 py-3 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            class="px-4 py-2 rounded-lg font-medium"
            :class="
              readDone
                ? 'bg-teal-600 text-white hover:bg-teal-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            "
            :disabled="!readDone"
            @click="acknowledge"
          >
            I understand
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import { useRoute } from 'vue-router'
// const router = useRouter()
const route = useRoute() // kalau butuh

// function goBack() {
//   if (window.history.length > 1) router.back()
//   else router.push('/buy-p2p')
// }

interface Coin {
  symbol: 'BTC' | 'ETH' | 'SOL' | 'XRP' | 'DOGE'
  pair: string
  changePct: number
  apr30d: number
  logoUrl: string
}

// Dummy data (tanpa API)
const coins: ReadonlyArray<Coin> = [
  {
    symbol: 'BTC',
    pair: 'BTC/USDT',
    changePct: 3.43,
    apr30d: 7.68,
    logoUrl: '/img/crypto/btc.svg',
  },
  {
    symbol: 'ETH',
    pair: 'ETH/USDT',
    changePct: 6.85,
    apr30d: 6.95,
    logoUrl: '/img/crypto/eth.svg',
  },
  {
    symbol: 'SOL',
    pair: 'SOL/USDT',
    changePct: 10.95,
    apr30d: 4.67,
    logoUrl: '/img/crypto/sol.svg',
  },
  {
    symbol: 'XRP',
    pair: 'XRP/USDT',
    changePct: 10.95,
    apr30d: 6.26,
    logoUrl: '/img/crypto/xrp.svg',
  },
  {
    symbol: 'DOGE',
    pair: 'DOGE/USDT',
    changePct: 10.95,
    apr30d: 6.73,
    logoUrl: '/img/crypto/doge.svg',
  },
] as const

const query = ref<string>('')

const filteredCoins = computed<ReadonlyArray<Coin>>(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return coins
  return coins.filter((c) => c.pair.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q))
})

function formatPct(n: number): string {
  const sign = n >= 0 ? '' : ''
  return `${sign}${n.toFixed(2)}%`
}

const showModalTerm = ref<boolean>(false)
const readDone = ref<boolean>(false)
const scrollArea = ref<HTMLDivElement | null>(null)

function openModalTerm(): void {
  showModalTerm.value = true
  readDone.value = false
  // lock body scroll
  document.documentElement.style.overflow = 'hidden'
}
function closeModalTerm(): void {
  showModalTerm.value = false
  document.documentElement.style.overflow = ''
}
function onScroll(e: Event): void {
  const el = e.target as HTMLDivElement
  // dianggap "dibaca" saat posisi scroll mencapai (atau >) bottom
  const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4
  if (atBottom) readDone.value = true
}
function acknowledge(): void {
  // aksi setelah user paham; saat ini cukup menutup modal
  closeModalTerm()
}

// safety: jika route berubah saat modal terbuka, tutup dan reset overflow
watch(
  () => route.fullPath,
  () => {
    if (showModalTerm.value) closeModalTerm()
  },
)

onMounted(() => {
  // jika modal sudah kebuka karena hot-reload, jangan kunci scroll permanen
  if (!showModalTerm.value) document.documentElement.style.overflow = ''
})
onBeforeUnmount(() => {
  document.documentElement.style.overflow = ''
})
</script>

<style scoped>
/* opsional: tidak ada custom style */
</style>
