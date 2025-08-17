<template>
  <main class="px-5 flex-grow mb-20">
    <!-- STATES (page-level) -->
    <div v-if="loading" class="py-10 text-center text-sm text-gray-500">Loading…</div>
    <div v-else-if="pageError" class="py-10 text-center text-sm text-red-500">{{ pageError }}</div>
    <div v-else-if="!trader" class="py-10 text-center text-sm text-gray-500">No Data Available</div>

    <!-- CONTENT -->
    <template v-else>
      <!-- Back -->
      <button
        aria-label="Back"
        class="mb-4 inline-flex items-center text-black"
        type="button"
        @click="goBack"
      >
        <Icon icon="tabler:arrow-left" class="w-6 h-6" />
      </button>

      <!-- Profile & title -->
      <div class="flex items-center gap-4 mb-1">
        <img
          :alt="`${trader.name} avatar`"
          class="w-12 h-12 rounded-full object-cover"
          :src="avatarUrl"
          @error="onAvatarError"
        />
        <h1 class="font-extrabold text-lg flex items-center gap-2">
          <span>{{ trader.name }}</span>
          <Icon
            v-if="trader.is_featured"
            icon="tabler:shield-check"
            class="w-5 h-5 text-amber-500"
          />
        </h1>
      </div>

      <p class="text-sm mb-2">Fixed ratio only. Target APR 400% / MDD {{ trader.mdd_30d_pct }}%.</p>

      <!-- Badge -->
      <div
        class="inline-flex items-center bg-[#FFF4D1] text-[#D6B94D] text-xs font-semibold rounded-md px-2 py-1 mb-5 select-none"
      >
        <Icon icon="tabler:coins" class="w-4 h-4 mr-1" />
        <span>Profit Sharing 10%</span>
      </div>

      <!-- Fixed Amount -->
      <h2 class="font-semibold text-base mb-1">Fixed Amount</h2>
      <label for="copyAmount" class="text-gray-400 text-xs mb-1 block">Copy Amount</label>

      <div class="flex items-center bg-gray-100 rounded-md h-10 mb-1 px-3">
        <input
          id="copyAmount"
          aria-label="Copy Amount input"
          v-model="amount"
          type="text"
          inputmode="decimal"
          class="bg-transparent w-full text-sm placeholder:text-gray-400 focus:outline-none"
          placeholder="Enter amount"
          :disabled="hasPendingOrder"
          :class="hasPendingOrder ? 'opacity-60 cursor-not-allowed' : ''"
        />
        <span class="text-xs font-semibold text-black ml-2">USDT</span>
        <button
          class="text-teal-400 text-xs font-semibold ml-3 disabled:opacity-50"
          type="button"
          @click="setMax"
          :disabled="hasPendingOrder"
        >
          Max
        </button>
      </div>

      <!-- input-level error only -->
      <small v-show="!!amountError" class="block text-red-500 text-xs mb-2">{{
        amountError
      }}</small>

      <div class="flex items-center gap-1 text-[10px] text-gray-400 mb-5">
        <span>Available</span>
        <span v-if="!loadingSaldo" class="font-normal"> {{ fmtUSDT(saldo) }} USDT </span>
        <span v-else class="font-normal">...</span>
        <button
          aria-label="Add"
          class="text-[#D6B94D] text-xs font-semibold"
          type="button"
          @click.prevent
          title="Add"
        >
          +
        </button>
      </div>

      <!-- Position Risk -->
      <h2 class="font-semibold text-base mb-2">Position Risk</h2>
      <div class="grid grid-cols-2 gap-4 mb-8">
        <!-- Take Profit -->
        <div>
          <label for="tp" class="text-gray-400 text-xs mb-1 block">Take Profit</label>
          <div class="relative">
            <input
              id="tp"
              v-model.number="tp"
              type="number"
              step="0.01"
              min="-100"
              max="100"
              inputmode="decimal"
              placeholder="0.00"
              class="w-full h-10 bg-gray-100 rounded-md px-3 pr-12 text-xs font-semibold text-black focus:outline-none"
              @input="fixComma($event)"
              :disabled="hasPendingOrder"
              :class="hasPendingOrder ? 'opacity-60 cursor-not-allowed' : ''"
            />
            <span
              class="absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-gray-700 pointer-events-none"
            >
              % ROI
            </span>
          </div>
        </div>

        <!-- Stop Loss -->
        <div>
          <label for="sl" class="text-gray-400 text-xs mb-1 block">Stop Loss</label>
          <div class="relative">
            <select
              id="sl"
              v-model.number="sl"
              :disabled="hasPendingOrder"
              :class="hasPendingOrder ? 'opacity-60 cursor-not-allowed' : ''"
              class="w-full h-10 bg-gray-100 rounded-md px-3 pr-12 text-xs font-semibold text-black focus:outline-none"
            >
              <option disabled value="">Select</option>
              <option v-for="n in 10" :key="n" :value="n * 10">{{ n * 10 }}%</option>
            </select>
            <span
              class="absolute inset-y-0 right-5 flex items-center text-xs font-semibold text-gray-700 pointer-events-none"
            >
              % ROI
            </span>
          </div>
        </div>
      </div>

      <!-- Summary (pakai data dari API untuk ROI & PnL) -->
      <div class="mb-8" v-if="showSummary">
        <!-- Summary (only after user enters a valid amount) -->
        <div class="flex justify-between text-xs text-gray-400 mb-1">
          <span class="underline">Net Copy Amount</span>
          <span class="text-black">{{ netCopyAmount }}</span>
        </div>
        <!-- ROI: show ONLY when there is a pending tx, and include progress % here -->
        <div v-if="hasPendingForPnl" class="flex justify-between text-xs text-gray-400 mb-1">
          <span class="underline">ROI</span>
          <span class="text-teal-400"> {{ Math.round(progress * 100) }}% </span>
        </div>

        <!-- PnL: keep only the animated money, remove the % from here -->
        <div v-if="hasPendingForPnl" class="flex justify-between text-xs text-gray-400 mb-1">
          <span class="underline">PNL</span>
          <span class="text-teal-400">
            {{ signedMoney(currentProfit, 4) }}
          </span>
        </div>
        <div v-if="hasPendingForPnl" class="flex justify-between text-[11px] text-gray-400 mb-1">
          <span class="underline">Current Value</span>
          <span class="text-black">{{ currentTotal.toFixed(4) }}</span>
        </div>
        <!-- When NO pending order: show submit -->
        <div v-if="!hasPendingOrder">
          <button
            class="mt-3 bg-teal-400 hover:bg-teal-500 text-white text-xs rounded-md py-1 px-3 float-right"
            type="button"
            :disabled="loadingSubmit"
            @click="submitWinLose"
          >
            {{ loadingSubmit ? 'Processing…' : 'Open Position' }}
          </button>
        </div>

        <!-- When there IS a pending order: hide submit, show countdown + progress -->
        <!-- <div v-else class="mt-3 float-right flex items-center gap-2">
          <div
            class="pointer-events-none select-none text-xs font-semibold rounded-md py-1 px-3 bg-gray-200 text-gray-600"
            title="Pending order in progress"
          >
            Pending… {{ remainingClock }}
          </div>
        </div> -->

        <p v-if="submitError" class="text-red-500 text-xs mt-2">{{ submitError }}</p>
        <p v-if="submitSuccess" class="text-green-500 text-xs mt-2">{{ submitSuccess }}</p>
      </div>
    </template>
  </main>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApiAlertStore } from '@/stores/apiAlert'

/* =========================
   Pinia modal helpers
========================= */
const modal = useApiAlertStore()
const alertSuccess = (msg: string, onClose?: () => void) => modal.open('Success', msg, onClose)
const alertError = (msg: string, onClose?: () => void) => modal.open('Error', msg, onClose)
const submitError = ref<string | null>(null)
const submitSuccess = ref<string | null>(null)
/* =========================
   API helpers
========================= */
const API_BASE = 'https://ledger.masmutdev.id/api'
async function authFetch(path: string, init: RequestInit = {}) {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('Token not found')

  const headers: HeadersInit = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
    ...(init.headers || {}),
  }
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })
  const text = await res.text()
  if (!res.ok) throw new Error(text.trim() || `HTTP ${res.status}`)
  return { text, json: () => JSON.parse(text) }
}

/* =========================
   Formatters
========================= */
function fmtUSDT(n: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  }).format(n)
}
function fmtMoney(n: number, dp = 4): string {
  if (!Number.isFinite(n)) return '0'
  return n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })
}
// function signedPercent(v: number): string {
//   if (!Number.isFinite(v)) return '0.00%'
//   const s = v >= 0 ? '+' : ''
//   return s + v.toFixed(2) + '%'
// }
function signedMoney(v: number, dp = 2): string {
  if (!Number.isFinite(v)) return '0'
  const s = v >= 0 ? '+' : ''
  return s + v.toFixed(dp)
}

/* =========================
   Page state
========================= */
type Trader = {
  id: number
  name: string
  slug: string
  avatar_url?: string | null
  is_featured: boolean
  copies_used: number
  copies_limit: number
  text_pnl_30d: string
  text_roi_30d_pct: string
  text_mdd_30d_pct: string
  text_aum: string
  text_sharpe_ratio: string
  pnl_30d: number
  roi_30d_pct: number
  mdd_30d_pct: number
  aum: number
  sharpe_ratio: number
  created_at?: string
  updated_at?: string
}

const router = useRouter()
const route = useRoute()

const trader = ref<Trader | null>(null)
const loading = ref(true)
const pageError = ref<string | null>(null)
const avatarBroken = ref(false)

let isAlive = true
const finalizeControllers = new Map<number, AbortController>()
onUnmounted(() => {
  isAlive = false
  // cancel any in-flight finalize requests
  finalizeControllers.forEach((ctrl) => ctrl.abort())
  finalizeControllers.clear()
})

function ensureAbsoluteUrl(u?: string | null): string | null {
  if (!u) return null
  if (/^https?:\/\//i.test(u)) return u
  const base = 'https://ledger.masmutdev.id/'
  return base + u.replace(/^\/+/, '')
}
const avatarUrl = computed(() => {
  const u = ensureAbsoluteUrl(trader.value?.avatar_url || null)
  return avatarBroken.value || !u ? 'https://placehold.co/48x48/png?text=?' : u
})
function onAvatarError() {
  avatarBroken.value = true
}
function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/copy')
}

const paramSlug = computed(() => {
  const p = route.params as Record<string, unknown>
  const raw = (p.slug ?? p.username ?? p.trader ?? p.id ?? '') as string
  return (raw ?? '').toString().trim()
})

async function loadTrader(slug: string) {
  loading.value = true
  pageError.value = null
  trader.value = null
  avatarBroken.value = false
  try {
    const { json } = await authFetch(`/data-lable-copy-trading/${encodeURIComponent(slug)}`)
    trader.value = json() as Trader
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    // 404 handled as "No Data Available"
    if (String(e.message).startsWith('HTTP 404')) {
      trader.value = null
    } else {
      pageError.value = e?.message ?? 'Failed to load data.'
      trader.value = null
    }
  } finally {
    loading.value = false
  }
}

/* =========================
   Balance & amount validation
========================= */
interface SaldoApi {
  status: 'success' | 'unauthorized'
  saldo?: string
  komisi?: string
}
const saldo = ref<number>(0)
const komisi = ref<number>(0)
const loadingSaldo = ref<boolean>(true)

async function fetchSaldo() {
  loadingSaldo.value = true
  try {
    const { json } = await authFetch('/get-saldo')
    const data = json() as SaldoApi
    if (data.status !== 'success') throw new Error('API status != success')
    saldo.value = Number(data.saldo ?? 0)
    komisi.value = Number(data.komisi ?? 0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    alertError(e?.message ?? 'Failed to load balance')
  } finally {
    loadingSaldo.value = false
  }
}

const amount = ref<string>('') // input value
const amountError = ref<string>('') // input-level error

const netCopyAmount = computed(() => {
  // if there’s a pending order, use its amount
  if (hasPendingOrder.value && activePending.value) {
    return fmtMoney(activePending.value.amount, 4)
  }

  // otherwise use the input
  const raw = (amount.value || '').replace(',', '.').trim()
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? fmtMoney(n, 4) : '0.0000'
})

function setMax() {
  amount.value = saldo.value.toString()
  amountError.value = ''
}

watch(amount, (val) => {
  const normalized = (val || '').replace(',', '.').trim()
  if (!normalized) {
    amountError.value = ''
    return
  }
  const num = Number(normalized)
  if (!Number.isFinite(num) || num <= 0) amountError.value = 'Invalid amount'
  else if (num > saldo.value) amountError.value = 'Amount cannot exceed available balance'
  else amountError.value = ''
})

const showSummary = computed(() => {
  // If there’s an active pending tx, always show the summary
  if (hasPendingForPnl.value) return true // or use hasPendingOrder / !!activePending.value

  // Otherwise, require a valid amount
  const raw = (amount.value || '').trim()
  if (!raw) return false
  const n = Number(raw.replace(',', '.'))
  return Number.isFinite(n) && n > 0 && !amountError.value
})

/* =========================
   TP / SL
========================= */
const tp = ref<number | null>(null) // integer 1..100 (server enforces >0)
const sl = ref<number | null>(null) // select 10..100

function fixComma(e: Event) {
  const el = e.target as HTMLInputElement
  if (!el) return
  el.value = el.value.replace(',', '.')
}

/* =========================
   Pending TX (localStorage) + PnL animation
========================= */
type PendingTx = { id: number; expiresAt: number; amount: number; tp: number }
const LS_KEY = 'pendingTxs'
const TTL_MS = 5 * 60 * 1000

const pendingList = ref<PendingTx[]>([])

function loadPending() {
  try {
    const arr = JSON.parse(localStorage.getItem(LS_KEY) || '[]') as PendingTx[]
    const now = Date.now()
    pendingList.value = arr.filter((x) => x && typeof x.id === 'number' && x.expiresAt > now)
    localStorage.setItem(LS_KEY, JSON.stringify(pendingList.value))
  } catch {
    pendingList.value = []
  }
}
function savePending() {
  localStorage.setItem(LS_KEY, JSON.stringify(pendingList.value))
}

function addPendingTx(id: number, amount: number, tp: number, ttlMs = TTL_MS) {
  loadPending()
  pendingList.value.push({ id, amount, tp, expiresAt: Date.now() + ttlMs })
  savePending()
}
function removePendingTx(id: number) {
  pendingList.value = pendingList.value.filter((x) => x.id !== id)
  savePending()
}

// keep `now` ticking for progress calc
const nowTick = ref(Date.now())
let tickHandle: number | undefined

const activePending = computed<PendingTx | null>(() => {
  if (!pendingList.value.length) return null
  return [...pendingList.value].sort((a, b) => a.expiresAt - b.expiresAt)[0]
})

const progress = computed(() => {
  const p = activePending.value
  if (!p) return 0
  const startAt = p.expiresAt - TTL_MS
  const ratio = (nowTick.value - startAt) / TTL_MS
  return Math.max(0, Math.min(1, ratio))
})
const currentProfit = computed(() => {
  const p = activePending.value
  if (!p) return 0
  const target = p.amount * (p.tp / 100)
  return target * progress.value
})
const currentTotal = computed(() => {
  const p = activePending.value
  if (!p) return 0
  return p.amount + currentProfit.value
})
const hasPendingForPnl = computed(() => !!activePending.value)

// Reuse hasPendingForPnl as the “order lock”
const hasPendingOrder = computed(() => hasPendingForPnl.value)

// const remainingMs = computed(() => {
//   const p = activePending.value
//   return p ? Math.max(0, p.expiresAt - nowTick.value) : 0
// })
// const remainingClock = computed(() => {
//   const ms = remainingMs.value
//   const mm = Math.floor(ms / 60000)
//   const ss = Math.floor((ms % 60000) / 1000)
//   return `${mm}:${String(ss).padStart(2, '0')}`
// })

// finalize
async function finalizeWinLose(txId: number) {
  const ctrl = new AbortController()
  finalizeControllers.set(txId, ctrl)

  try {
    const { json } = await authFetch('/win-lose/finalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction_id: txId }),
      signal: ctrl.signal,
    })

    const data = json()

    // always update storage + server-side balance, even if user navigates
    removePendingTx(txId)
    await fetchSaldo()

    // show success only if this component is still mounted
    if (isAlive) {
      alertSuccess('Transaction completed. Your balance has been updated.')
    }

    return data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    // ignore aborts caused by unmount/navigation
    if (e?.name === 'AbortError') return
    throw e
  } finally {
    finalizeControllers.delete(txId)
  }
}

function scheduleFinalize(txId: number, expiresAt: number) {
  const delay = Math.max(0, expiresAt - Date.now())
  window.setTimeout(() => {
    finalizeWinLose(txId).catch((e) => {
      console.error('Finalize failed:', e) // left pending; will retry on next mount
    })
  }, delay)
}

/* =========================
   Submit
========================= */
const loadingSubmit = ref(false)
async function submitWinLose() {
  if (hasPendingOrder.value) {
    return alertError(`You already have a pending order. Please wait to place a new one.`)
  }

  const normalized = (amount.value || '').replace(',', '.').trim()
  const amt = Number(normalized)
  if (!Number.isFinite(amt) || amt <= 0) return alertError('Amount is invalid')
  if (amountError.value) return alertError(amountError.value)
  if (!tp.value || tp.value < 1 || tp.value > 100) return alertError('Take Profit is invalid')
  if (!sl.value || sl.value < 10 || sl.value > 100) return alertError('Stop Loss is invalid')

  loadingSubmit.value = true
  try {
    const { json } = await authFetch('/win-lose/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_copy_traders: trader.value?.id, // <-- kirim id copy trader
        amount: amt,
        take_profit: tp.value,
        stop_loss: sl.value,
        order_time: 5,
      }),
    })
    const data = json() as { status: 'success'; transaction_id: number }

    // store + schedule finalize (you already have these)
    addPendingTx(data.transaction_id, amt, tp.value)
    const p = activePending.value || pendingList.value.find((x) => x.id === data.transaction_id)
    if (p) scheduleFinalize(p.id, p.expiresAt)

    // success notice (as you asked earlier)
    alertSuccess(
      'Transaction applied and processed in 5 minutes. Please wait until the process is complete.',
      () => {
        amount.value = ''
      }, // don’t refresh balance here; it changes on finalize
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    alertError(e?.message ?? 'Submit failed')
  } finally {
    loadingSubmit.value = false
  }
}

/* =========================
   Lifecycle
========================= */
watch(
  paramSlug,
  (s) => {
    if (!s) {
      loading.value = false
      trader.value = null
    } else {
      loadTrader(s)
    }
  },
  { immediate: true },
)

onMounted(() => {
  // start 1s ticker
  tickHandle = window.setInterval(() => {
    nowTick.value = Date.now()
  }, 1000)
  // initial saldo + pending tx
  fetchSaldo()
  loadPending()
  // schedule pending that exist
  const now = Date.now()
  pendingList.value.forEach((tx) => {
    if (tx.expiresAt <= now) finalizeWinLose(tx.id).catch(console.error)
    else scheduleFinalize(tx.id, tx.expiresAt)
  })
  // keep in sync if other tabs modify localStorage
  window.addEventListener('storage', (e) => {
    if (e.key === LS_KEY) loadPending()
  })
})
onUnmounted(() => {
  if (tickHandle) clearInterval(tickHandle)
})
</script>
