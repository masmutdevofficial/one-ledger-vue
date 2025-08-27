<template>
  <div class="w-full max-w-md mx-auto p-4">
    <div class="flex flex-row items-center mb-3">
      <h1 class="font-semibold text-sm">Smart Arbitrage</h1>
    </div>

    <!-- Header -->
    <div class="flex justify-between items-start mb-2">
      <div>
        <p class="text-[12px] text-gray-700 font-normal flex items-center gap-1">
          Total Balance
          <button
            type="button"
            class="text-gray-400 cursor-pointer"
            :aria-pressed="showBalance ? 'true' : 'false'"
            :aria-label="showBalance ? 'Hide balance' : 'Show balance'"
            @click="toggleShow"
          >
            <Icon :icon="showBalance ? 'tabler:eye' : 'tabler:eye-off'" />
          </button>
        </p>

        <button
          type="button"
          class="text-[16px] font-extrabold text-black mt-1 flex items-center gap-1"
        >
          ≈ <span>{{ displayTotal }}</span> USD
        </button>

        <p class="text-[12px] mt-1 font-normal">
          30-Day Profit ≈
          <span class="font-semibold" :class="showBalance ? 'text-green-500' : 'text-gray-400'">
            {{ displayProfit }}
          </span>
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
      <template v-for="coin in filteredCoins" :key="coin.symbol">
        <!-- ENABLED (bisa klik) -->
        <RouterLink
          v-if="!coin.disabled"
          :to="`/smart-arbitrage/detail/${coin.symbol.toLowerCase()}`"
          class="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 hover:bg-gray-100 transition"
        >
          <div class="flex items-center gap-3 relative">
            <div class="relative w-12 h-12">
              <img
                src="/img/crypto/usdt.svg"
                alt="USDT logo"
                class="absolute z-2 left-6.5 top-3 w-6 h-6 rounded-full"
              />
              <img
                :src="`/img/crypto/${coin.symbol.toLowerCase()}.svg`"
                :alt="`${coin.symbol} logo`"
                class="absolute inset-0 w-7 h-7 m-auto rounded-full"
              />
            </div>
            <span class="text-black font-semibold text-[12px]">{{ coin.pair }}</span>
          </div>
          <div class="text-right">
            <p class="font-semibold text-[12px] leading-none text-teal-500">
              {{ formatPct(coin.currentApr) }}
            </p>
            <p class="text-gray-400 text-[10px] leading-none mt-2">
              30d APR: <b class="text-gray-800">{{ formatPct(coin.currentApr) }}</b>
            </p>
          </div>
        </RouterLink>

        <!-- DISABLED (ada Pending, tidak bisa klik) -->
        <div
          v-else
          class="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 opacity-60 cursor-not-allowed select-none"
          aria-disabled="true"
          title="You have a pending transaction for this asset"
        >
          <div class="flex items-center gap-3 relative">
            <div class="relative w-12 h-12">
              <img
                src="/img/crypto/usdt.svg"
                alt="USDT logo"
                class="absolute z-2 left-6.5 top-3 w-6 h-6 rounded-full"
              />
              <img
                :src="`/img/crypto/${coin.symbol.toLowerCase()}.svg`"
                :alt="`${coin.symbol} logo`"
                class="absolute inset-0 w-7 h-7 m-auto rounded-full"
              />
            </div>
            <span class="text-black font-semibold text-[12px]">{{ coin.pair }}</span>
          </div>
          <div class="text-right">
            <p class="font-semibold text-[12px] leading-none text-teal-500">
              {{ formatPct(coin.currentApr) }}
            </p>
            <p class="text-gray-400 text-[10px] leading-none mt-2">
              30d APR: <b class="text-gray-800">{{ formatPct(coin.currentApr) }}</b>
            </p>
          </div>
        </div>
      </template>
    </div>

    <p class="text-center text-gray-400 text-[12px] mt-6 font-normal" v-if="!filteredCoins.length">
      No more data
    </p>

    <!-- Bottom Nav -->
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

    <!-- Modal Terms -->
    <div
      v-if="showModalTerm"
      class="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <div class="absolute inset-0 bg-black/30" @click="closeModalTerm"></div>
      <div class="relative z-10 w-full max-w-lg mx-4 rounded-2xl bg-white shadow-xl" @click.stop>
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

          <div class="h-2"></div>
        </div>

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
import { useApiAlertStore } from '@/stores/apiAlert'

/** KONFIGURASI */
const API_BASE = 'https://one-ledger.masmutpanel.my.id'
const TOKEN = localStorage.getItem('token') ?? ''

/** STORE ALERT */
const modal = useApiAlertStore()

/** STATE UI HEADER */
const showBalance = ref<boolean>(true)
function toggleShow(): void {
  showBalance.value = !showBalance.value
}

/** SALDO (TOTAL BALANCE DIAMBIL DARI saldo_smart_arbitrage) */
const saldoSmart = ref<number>(0)
const displayTotal = computed<string>(() => (showBalance.value ? usd(saldoSmart.value) : '****'))
const displayProfit = computed<string>(() => (showBalance.value ? '$0.00' : '****')) // belum ada endpoint profit

/** TIPE DATA */
interface ApiSmartItem {
  id: number
  symbol: string
  current_apr: number
  holding_day: number
  created_at: string
  updated_at: string
}

interface ApiSaldoResponse {
  status: 'success'
  saldo: number
  saldo_smart_arbitrage: number
  komisi: number
}

interface ApiTxItem {
  id: number
  id_users: number
  id_smart_arbitrage: number
  symbol: string
  amount: string
  status: 'Pending' | 'Claimed'
  created_at: string
  updated_at: string
}

interface ApiSummaryItem {
  id_smart_arbitrage: number
  symbol: string
  total_pending_amount: string
  total_pending_tx: number
}

interface ApiSmartResponse {
  status: 'success'
  data: ApiSmartItem[]
  tx?: ApiTxItem[]
  summary_by_symbol?: ApiSummaryItem[]
}

interface Coin {
  id: number
  symbol: string
  pair: string
  currentApr: number
  disabled: boolean
}

/** LIST COIN DARI API */
const coins = ref<Coin[]>([])
const query = ref<string>('')

const filteredCoins = computed<ReadonlyArray<Coin>>(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return coins.value
  return coins.value.filter(
    (c) => c.pair.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q),
  )
})

async function loadSmartList(): Promise<void> {
  try {
    const json = await fetchJson<ApiSmartResponse>('/api/smart-arbitrage')

    // id_smart_arbitrage yang PENDING
    const pendingIds = new Set<number>(
      (json.tx ?? [])
        .filter((t) => t.status === 'Pending')
        .map((t) => Number(t.id_smart_arbitrage)),
    )

    coins.value = (json.data || []).map((it) => ({
      id: it.id,
      symbol: it.symbol.toUpperCase(),
      pair: `${it.symbol.toUpperCase()}/USDT`,
      currentApr: Number(it.current_apr || 0),
      disabled: pendingIds.has(Number(it.id)),
    }))
  } catch (err) {
    console.error('loadSmartList error:', err)
    modal.open('Error', 'Gagal mengambil daftar Smart Arbitrage.')
  }
}

/** HELPERS */
function usd(n: number): string {
  // tampil USD 2 desimal
  return `$${Number(n || 0).toFixed(2)}`
}
function formatPct(n: number): string {
  return `${Number(n || 0).toFixed(2)}%`
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
      ...(init?.headers ?? {}),
    },
    credentials: 'include', // Sanctum
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

/** LOADERS */
async function loadSaldo(): Promise<void> {
  try {
    const json = await fetchJson<ApiSaldoResponse>('/api/get-saldo')
    saldoSmart.value = Number(json.saldo_smart_arbitrage || 0)
  } catch (err) {
    console.error('loadSaldo error:', err)
    modal.open('Error', 'Gagal mengambil saldo (saldo_smart_arbitrage).')
  }
}

/** LIFECYCLE */
const route = useRoute()
const showModalTerm = ref<boolean>(false)
const readDone = ref<boolean>(false)
const scrollArea = ref<HTMLDivElement | null>(null)

function openModalTerm(): void {
  showModalTerm.value = true
  readDone.value = false
  document.documentElement.style.overflow = 'hidden'
}
function closeModalTerm(): void {
  showModalTerm.value = false
  document.documentElement.style.overflow = ''
}
function onScroll(e: Event): void {
  const el = e.target as HTMLDivElement
  const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4
  if (atBottom) readDone.value = true
}
function acknowledge(): void {
  closeModalTerm()
}

watch(
  () => route.fullPath,
  () => {
    if (showModalTerm.value) closeModalTerm()
  },
)

onMounted(async () => {
  if (!TOKEN) {
    modal.open('Unauthorized', 'Token tidak ditemukan. Silakan login ulang.', () => {
      // optional: redirect
    })
    return
  }
  document.documentElement.style.overflow = ''
  await Promise.all([loadSaldo(), loadSmartList()])
})

onBeforeUnmount(() => {
  document.documentElement.style.overflow = ''
})
</script>
