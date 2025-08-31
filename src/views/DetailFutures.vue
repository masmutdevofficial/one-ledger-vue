<!-- eslint-disable @typescript-eslint/no-explicit-any -->
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
      <div class="flex items-center justify-between mb-1">
        <div class="flex items-center gap-4">
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

        <router-link
          v-if="trader && trader.id"
          :to="`/chats/${trader.id}`"
          class="ml-4 inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 active:bg-gray-200"
          aria-label="Open chat"
          title="Message"
        >
          <img src="/img/chat-copy-trader.png" alt="Menu" class="w-5 h-5 object-contain" />
        </router-link>
      </div>

      <p class="text-sm mb-2">Fixed ratio only. Target APR 400% / MDD {{ trader.mdd_30d_pct }}%.</p>

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
      <div class="flex flex-row justify-between items-start">
        <h2 class="font-semibold text-base mb-2">Position Risk</h2>
        <button
          v-if="trader?.slug"
          type="button"
          class="inline-flex items-center text-gray-600 hover:text-black"
          @click="goHistory"
          aria-label="Open futures history"
        >
          <Icon icon="tabler:file-description" class="w-4 h-4" />
        </button>
      </div>
      <div class="grid grid-cols-1 gap-4 mb-8">
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

      <!-- Summary -->
      <div class="mb-8" v-if="showSummary">
        <div class="flex justify-between text-xs text-gray-400 mb-1">
          <span class="underline">Net Copy Amount</span>
          <span class="text-black">{{ netCopyAmount }}</span>
        </div>

        <div v-if="hasPendingForPnl" class="flex justify-between text-xs text-gray-400 mb-1">
          <span class="underline">PNL</span>
          <span class="text-teal-400">{{ signedMoney(currentProfit, 4) }}</span>
        </div>

        <div v-if="!hasPendingOrder" class="pb-5">
          <button
            class="mt-3 bg-teal-400 hover:bg-teal-500 text-white text-xs rounded-md py-1 px-3 float-right"
            type="button"
            :disabled="loadingSubmit"
            @click="submitWinLose"
          >
            {{ loadingSubmit ? 'Processing…' : 'Open Position' }}
          </button>
        </div>

        <p v-if="submitError" class="text-red-500 text-xs mt-2">{{ submitError }}</p>
        <p v-if="submitSuccess" class="text-green-500 text-xs mt-2">{{ submitSuccess }}</p>
      </div>

      <ChatCard />
    </template>
  </main>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApiAlertStore } from '@/stores/apiAlert'
import ChatCard from '@/components/futures/ChatCard.vue'

/* ===== ALERT pakai Pinia store ===== */
const apiAlert = useApiAlertStore()
const alertSuccess = (msg: string, onClose?: () => void) => apiAlert.open('Success', msg, onClose)
const alertError = (msg: string, onClose?: () => void) => apiAlert.open('Error', msg, onClose)

/* ===== Helpers API ===== */
const API_BASE = 'https://one-ledger.masmutpanel.my.id/api'
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

/* ===== Formatters ===== */
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
function signedMoney(v: number, dp = 2): string {
  if (!Number.isFinite(v)) return '0'
  const s = v >= 0 ? '+' : ''
  return s + v.toFixed(dp)
}

/* ===== Types & state ===== */
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
  finalizeControllers.forEach((c) => c.abort())
  finalizeControllers.clear()
})

function ensureAbsoluteUrl(u?: string | null): string | null {
  if (!u) return null
  if (/^https?:\/\//i.test(u)) return u
  const base = 'https://one-ledger.masmutpanel.my.id/'
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

/* ===== [ACCESS GUARD] ===== */
async function ensureAccess(slug: string): Promise<boolean> {
  try {
    const code = sessionStorage.getItem(`copy_access:${slug}`) || ''
    const { json } = await authFetch(`/copy-traders/${encodeURIComponent(slug)}/access-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: code }),
    })
    const res = json() as { status: 'success' | 'error'; code: string }
    if (res.status === 'success') return true
    alertError('Akses ditolak')
  } catch {
    alertError('Gagal memverifikasi akses')
  }
  router.replace('/futures')
  return false
}

/* ===== Load Trader ===== */
async function loadTrader(slug: string) {
  loading.value = true
  pageError.value = null
  trader.value = null
  avatarBroken.value = false
  try {
    const ok = await ensureAccess(slug)
    if (!ok) return

    const { json } = await authFetch(`/data-lable-copy-trading/${encodeURIComponent(slug)}`)
    trader.value = json() as Trader
  } catch (e: any) {
    if (String(e?.message || '').startsWith('HTTP 404')) {
      trader.value = null
    } else {
      pageError.value = e?.message ?? 'Failed to load data.'
      trader.value = null
    }
  } finally {
    loading.value = false
  }
}

function goHistory() {
  const slug = trader.value?.slug
  if (!slug) return
  router.push({ path: `/futures/${slug}/history` })
}

/* ===== Balance & amount validation ===== */
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
  } catch (e: any) {
    alertError(e?.message ?? 'Failed to load balance')
  } finally {
    loadingSaldo.value = false
  }
}

const amount = ref<string>('') // input value
const amountError = ref<string>('') // input-level error

const netCopyAmount = computed(() => {
  if (hasPendingOrder.value && activePending.value) return fmtMoney(activePending.value.amount, 4)
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
  if (hasPendingForPnl.value) return true
  const raw = (amount.value || '').trim()
  if (!raw) return false
  const n = Number(raw.replace(',', '.'))
  return Number.isFinite(n) && n > 0 && !amountError.value
})

/* ===== TP / SL ===== */
const tp = ref<number | null>(null)
const sl = ref<number | null>(null)

async function fetchTakeProfit(): Promise<void> {
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Unauthorized.')

    const res = await fetch(`${API_BASE}/users/me/take-profit`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      let msg = `HTTP ${res.status}`
      try {
        msg = await res.text()
      } catch {}
      throw new Error(msg)
    }
    const data = await res.json()
    const v = Number(data?.take_profit)
    tp.value = Number.isInteger(v) && v > 0 ? v : null
  } catch {
    tp.value = null
  }
}

onMounted(fetchTakeProfit)

/* ===== Pending TX & PnL animation ===== */
type PendingTx = { id: number; expiresAt: number; amount: number; tp: number }
const LS_KEY = 'pendingTxs'
const TTL_MS = 5 * 60 * 1000

const pendingList = ref<PendingTx[]>([])

// penanda tx yang sudah pernah mengurangi saldo lokal
let processedSaldoTxIds = new Set<number>()
// guard agar tidak mengurangi saldo pada load awal
let initSaldoSyncDone = false

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

// Kurangi saldo lokal ketika ada pending tx BARU
watch(
  pendingList,
  (newList) => {
    // skip pengurangan pada load awal: tandai semua id sebagai sudah diproses
    if (!initSaldoSyncDone) {
      processedSaldoTxIds = new Set<number>(newList.map((t) => t.id))
      initSaldoSyncDone = true
      return
    }
    for (const tx of newList) {
      if (!processedSaldoTxIds.has(tx.id)) {
        // tx baru → kurangi saldo lokal agar langsung terlihat
        saldo.value = Math.max(0, saldo.value - tx.amount)
        processedSaldoTxIds.add(tx.id)
      }
    }
  },
  { deep: true },
)

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
const hasPendingOrder = computed(() => hasPendingForPnl.value)

/* ===== finalize ===== */
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
    removePendingTx(txId)
    await fetchSaldo()
    if (isAlive) alertSuccess('Take Profit Reached. Your position has hit the target profit')
    return data
  } catch (e: any) {
    if (e?.name === 'AbortError') return
    throw e
  } finally {
    finalizeControllers.delete(txId)
  }
}
function scheduleFinalize(txId: number, expiresAt: number) {
  const delay = Math.max(0, expiresAt - Date.now())
  window.setTimeout(() => {
    finalizeWinLose(txId).catch((e) => console.error('Finalize failed:', e))
  }, delay)
}

/* ===== Submit ===== */
const submitError = ref<string | null>(null)
const submitSuccess = ref<string | null>(null)
const loadingSubmit = ref(false)

async function submitWinLose() {
  if (hasPendingOrder.value) {
    return alertError('You already have a pending order. Please wait to place a new one.')
  }

  const normalized = (amount.value || '').replace(',', '.').trim()
  const amt = Number(normalized)
  if (!Number.isFinite(amt) || amt <= 0) return alertError('Amount is invalid')
  if (amountError.value) return alertError(amountError.value)
  if (!tp.value || tp.value < 1 || tp.value > 100)
    return alertError('Your order quantity or price exceeds the range. please adjust your order')
  if (!sl.value || sl.value < 10 || sl.value > 100)
    return alertError('Your order quantity or price exceeds the range. please adjust your order')

  loadingSubmit.value = true
  try {
    const { json } = await authFetch('/win-lose/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_copy_traders: trader.value?.id, // kirim id copy trader
        amount: amt,
        take_profit: tp.value,
        stop_loss: sl.value,
        order_time: 5,
      }),
    })
    const data = json() as { status: 'success'; transaction_id: number }

    // Simpan pending → watcher akan otomatis mengurangi saldo lokal sekali saja
    addPendingTx(data.transaction_id, amt, tp.value)

    // Jadwalkan finalize
    const p = activePending.value || pendingList.value.find((x) => x.id === data.transaction_id)
    if (p) scheduleFinalize(p.id, p.expiresAt)

    alertSuccess('Order created.')
  } catch (e: any) {
    alertError(e?.message ?? 'Submit failed')
  } finally {
    loadingSubmit.value = false
  }
}

/* ===== Lifecycle ===== */
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
  // 1s ticker
  tickHandle = window.setInterval(() => {
    nowTick.value = Date.now()
  }, 1000)

  // initial saldo + pending tx
  fetchSaldo()
  loadPending()

  // schedule existing pending
  const now = Date.now()
  pendingList.value.forEach((tx) => {
    if (tx.expiresAt <= now) finalizeWinLose(tx.id).catch(console.error)
    else scheduleFinalize(tx.id, tx.expiresAt)
  })

  // sync across tabs; watcher akan kurangi saldo untuk tx baru dari tab lain
  window.addEventListener('storage', (e) => {
    if (e.key === 'pendingTxs') loadPending()
  })
})
onUnmounted(() => {
  if (tickHandle) clearInterval(tickHandle)
})
</script>
