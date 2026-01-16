<template>
  <div class="max-w-md w-full mx-auto px-4 pt-4 pb-28 flex flex-col min-h-dvh">
    <!-- Top bar with back arrow and title -->
    <div class="flex items-center mb-6">
      <button aria-label="Go back" class="text-black text-xl pr-4" @click="goBack" type="button">
        <Icon icon="tabler:arrow-left" class="w-5 h-5" />
      </button>
      <h1 class="flex-1 text-center font-semibold text-base leading-5">
        Portfolio {{ symbolUpper }}
      </h1>
      <div class="w-8"></div>
    </div>

    <!-- Current APR box -->
    <div class="border border-black rounded-lg w-24 py-2 px-3 mb-6">
      <p class="text-xs text-center text-gray-700">Current APR</p>
      <p class="text-green-600 font-semibold text-lg text-center leading-none">
        {{ Number.isFinite(currentApr) && currentApr > 0 ? `${currentApr.toFixed(3)}%` : '—' }}
      </p>
    </div>

    <!-- Amount -->
    <label for="amount" class="text-sm font-semibold mb-1">Amount</label>
    <div class="relative mb-3">
      <input
        id="amount"
        v-model="amount"
        type="text"
        inputmode="decimal"
        placeholder="0.00"
        class="w-full rounded-lg bg-gray-100 pl-3 pr-20 py-3 text-base font-normal text-gray-900 placeholder-gray-400 focus:outline-none"
      />
      <span
        class="absolute right-16 top-1/2 -translate-y-1/2 text-gray-900 font-semibold text-base"
      >
        USDT
      </span>
      <button
        type="button"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 font-normal text-base"
        @click="setMax"
      >
        Max
      </button>
    </div>

    <!-- Recommended min holding period -->
    <div class="flex justify-between text-xs text-gray-400 mb-3">
      <p class="border-b border-dotted border-gray-300 pb-0.5">Recommended min holding period</p>
      <p class="font-semibold border-b border-dotted border-gray-300 pb-0.5">
        {{ holdingDay }} Days
      </p>
    </div>

    <!-- Fee level -->
    <div class="border border-gray-200 rounded-lg p-4 mb-10">
      <div class="flex justify-between mb-2">
        <p class="font-semibold text-sm text-gray-900">Your Fee Level</p>
        <p class="text-teal-400 text-sm font-normal">Regular User</p>
      </div>
      <div class="flex justify-between mb-1">
        <p class="text-gray-400 text-sm">Spot Fee Rate</p>
        <p class="text-gray-900 text-sm">0.0000%</p>
      </div>
      <div class="flex justify-between">
        <p class="text-gray-400 text-sm">Futures Fee Rate</p>
        <p class="text-gray-900 text-sm">0.0000%</p>
      </div>
    </div>

    <!-- Sticky consent & confirm -->
    <div class="fixed left-0 right-0 bottom-0 z-40">
      <div class="mx-auto max-w-md w-full bg-white border-t border-gray-200 px-4 pt-3 pb-4">
        <div class="flex items-start mb-0">
          <input
            id="agree"
            v-model="agree"
            type="checkbox"
            class="mr-2 w-4 h-4 text-teal-400 border-gray-300 rounded"
          />
          <label for="agree" class="text-xs text-gray-900 leading-tight">
            I have read and agreed to
          </label>
        </div>
        <button
          type="button"
          class="ml-[22px] text-teal-400 text-xs mb-3 block text-left"
          @click="openTerms"
        >
          Oneledger Smart Arbitage Service Agreement
        </button>

        <button
          type="button"
          class="w-full rounded-lg py-3 text-base font-normal"
          :class="
            !confirmDisabled
              ? 'bg-teal-400 text-white hover:bg-teal-500'
              : 'bg-teal-300/50 text-white cursor-not-allowed'
          "
          :disabled="confirmDisabled"
          @click="confirm"
        >
          Confirm
        </button>
      </div>
    </div>

    <!-- Terms Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <div class="absolute inset-0 bg-black/30" @click="closeTerms"></div>
      <div class="relative z-10 w-full max-w-lg mx-4 rounded-2xl bg-white shadow-xl" @click.stop>
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 class="text-base font-semibold">Terms &amp; Conditions</h3>
          <button
            type="button"
            class="p-1 rounded hover:bg-gray-100"
            @click="closeTerms"
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
            @click="closeTerms"
          >
            I understand
          </button>
        </div>
      </div>
    </div>
    <!-- /Terms Modal -->
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useApiAlertStore } from '@/stores/apiAlert'

const API_BASE = 'https://tech.oneled.io'
const TOKEN = localStorage.getItem('token') ?? ''
const modal = useApiAlertStore()

const route = useRoute()
const router = useRouter()
const symbolParam = computed<string>(() =>
  String(route.params.symbol || '')
    .trim()
    .toUpperCase(),
)
const symbolUpper = computed<string>(() => symbolParam.value)

/** TYPES */
interface SmartItem {
  id: number
  symbol: string
  current_apr: number
  holding_day: number
}
interface SmartResponse {
  status: 'success'
  data: SmartItem[]
  tx?: {
    id: number
    id_users: number
    id_smart_arbitrage: number
    symbol: string
    amount: string
    status: 'Pending' | 'Claimed'
    created_at: string
    updated_at: string
  }[]
}
interface GetSaldo {
  status: 'success'
  saldo: number
  saldo_smart_arbitrage: number
  komisi: number
}

/** STATE */
const currentApr = ref<number>(0)
const holdingDay = ref<number>(30)
const amount = ref<string>('') // input USDT
const agree = ref<boolean>(false) // consent
const saldoAvailable = ref<number>(0) // kolom saldo utk Max
const showModal = ref<boolean>(false)
const readDone = ref<boolean>(false)

/** HELPERS */
function lockScroll(lock: boolean): void {
  document.documentElement.style.overflow = lock ? 'hidden' : ''
}
function goBack(): void {
  if (window.history.length > 1) router.back()
  else router.push('/dashboard')
}
function setMax(): void {
  amount.value = saldoAvailable.value.toFixed(8)
}
const confirmDisabled = computed<boolean>(() => {
  const val = Number(amount.value || 0)
  return !agree.value || !(val > 0)
})

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
      ...(init?.headers ?? {}),
    },
    credentials: 'include',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

/** LOADERS */
async function loadSmart(): Promise<void> {
  const json = await fetchJson<SmartResponse>('/api/smart-arbitrage')

  // Cek jika user sudah punya transaksi Pending utk symbol ini -> redirect
  const hasPendingSame = (json.tx ?? []).some(
    (t) => t.status === 'Pending' && t.symbol.toUpperCase() === symbolParam.value,
  )
  if (hasPendingSame) {
    modal.open('Info', `Anda sudah memiliki transaksi Pending untuk ${symbolParam.value}.`, () => {
      router.replace('/smart-arbitrage')
    })
    // tetap lanjut return supaya tidak mengisi state lain
    return
  }

  // Ambil master untuk symbol ini
  const found = (json.data || []).find((x) => x.symbol.toUpperCase() === symbolParam.value)
  if (!found) {
    modal.open('Not Found', `Symbol ${symbolParam.value} tidak tersedia.`, () => {
      router.replace('/smart-arbitrage')
    })
    return
  }
  currentApr.value = Number(found.current_apr || 0)
  holdingDay.value = Number(found.holding_day || 30)
}

async function loadSaldo(): Promise<void> {
  const json = await fetchJson<GetSaldo>('/api/get-saldo')
  saldoAvailable.value = Number(json.saldo || 0)
}

/** ACTIONS */
async function confirm(): Promise<void> {
  if (confirmDisabled.value) return
  try {
    const body = {
      symbol: symbolParam.value,
      amount: Number(amount.value || 0),
      status: 'Pending',
    }
    await fetchJson('/api/transaksi-smart-arbitrage', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    modal.open('Success', 'Transaction created successfully.', () => {
      router.push('/smart-arbitrage')
    })
  } catch {
    modal.open('Error', 'Insufficient balance. Please top up your account to continue.')
  }
}

/** MODAL TERMS */
function openTerms(): void {
  showModal.value = true
  readDone.value = false
  lockScroll(true)
}
function closeTerms(): void {
  showModal.value = false
  lockScroll(false)
}
function onScroll(e: Event): void {
  const el = e.target as HTMLDivElement
  const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4
  if (atBottom) readDone.value = true
}

/** LIFECYCLE */
onMounted(async () => {
  if (!TOKEN) {
    modal.open('Unauthorized', 'Token tidak ditemukan. Silakan login.')
    return
  }
  lockScroll(false)
  try {
    await Promise.all([loadSmart(), loadSaldo()])
  } catch {
    modal.open('Error', 'Failed to load data.')
  }
})
onBeforeUnmount(() => lockScroll(false))
</script>
