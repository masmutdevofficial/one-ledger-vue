<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header -->
    <header class="relative flex items-center px-4 py-3 border-b border-gray-200">
      <button aria-label="Back" class="text-black text-xl pr-4 relative z-10" @click="goBack">
        <Icon icon="tabler:arrow-left" width="24" height="24" />
      </button>

      <!-- Centered title -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="flex items-center gap-2 font-semibold text/base">
          <img src="/img/crypto/tether-usdt.svg" alt="USDT" class="w-6 h-6 rounded-full" />
          <span>Sell USDT</span>
        </div>
      </div>
    </header>

    <!-- States -->
    <div v-if="loading" class="p-4 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="errorMsg" class="p-4 text-center text-xs text-red-500">{{ errorMsg }}</div>

    <!-- Main -->
    <main v-else class="px-4 pt-6 flex-grow">
      <!-- Amount -->
      <section class="bg-gray-100 rounded-xl p-5 mb-6">
        <p class="text-sm font-medium text-gray-800 mb-1">Sell USDT</p>

        <div class="flex items-baseline justify-between">
          <div class="flex items-center space-x-2">
            <input
              v-model.number="amountUsdt"
              type="number"
              step="0.01"
              min="0"
              inputmode="decimal"
              placeholder="100"
              class="bg-transparent outline-none border-b border-gray-300 focus:border-teal-500 text-3xl font-extrabold leading-none w-36"
              aria-label="Amount in USDT"
            />
            <span class="text-base font-semibold pt-1">USDT</span>
          </div>

          <button
            type="button"
            class="text-yellow-500 font-semibold text-sm select-none hover:underline"
            @click="onClickMax"
          >
            Max
          </button>
        </div>

        <p class="text-xs text-gray-400 mt-1">Limit {{ limitText }}</p>

        <p class="text-base font-normal mt-4">
          You Receive <span class="font-bold">{{ youReceiveIdr }}</span>
        </p>

        <p class="text-[10px] text-gray-400 mt-1" v-if="offer">
          ~ {{ new Intl.NumberFormat('id-ID').format(offer.price_fiat) }} IDR / USDT
        </p>
      </section>

      <!-- Advertiser requirements -->
      <section>
        <p class="font-semibold mb-3">Advertiser's Requirements</p>

        <div class="flex items-center justify-between mb-1">
          <p class="text-sm font-bold flex items-center gap-1">
            <span>{{ offer?.advertiser_name }}</span>
          </p>

          <p class="text-xs text-gray-500 flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-green-600 inline-block"></span>
            <span>Online</span>
            <Icon icon="tabler:chevron-right" width="14" height="14" />
          </p>
        </div>

        <ul class="text-xs text-gray-400 leading-tight list-disc pl-4 space-y-1">
          <li>Syarat dan Ketentuan Transaksi:</li>
          <li>Kami tidak menerima pembayaran dari pihak ketiga.</li>
          <li>
            Kami tidak menerima pembayaran dari metode pembayaran digital seperti GOPAY, DANA,
            Shopeepay, OVO, dll.
          </li>
          <li>Kami tidak menerima pembayaran dari bank digital (Bank Jago, Fliptech, VISA).</li>
        </ul>
      </section>

      <button
        type="button"
        class="w-full mt-8 bg-teal-500 text-white text-base font-normal py-3 rounded-lg hover:bg-green-700 disabled:opacity-60"
        :disabled="submitLoading || !amountUsdt || amountUsdt <= 0 || !idParam"
        @click="placeOrder"
      >
        <span v-if="submitLoading">Processing…</span>
        <span v-else>Place Sell Order</span>
      </button>
    </main>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { useApiAlertStore } from '@/stores/apiAlert'

const router = useRouter()
const route = useRoute()
const modal = useApiAlertStore()

const API_BASE = 'https://one-ledger.masmutpanel.my.id'
const TOKEN = () => localStorage.getItem('token') || ''

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/sell-p2p')
}

type ApiRow = {
  id: number
  advertiser_name: string
  avatar_url?: string | null
  trades_count: number
  completion_rate_pct: number
  is_fast: boolean
  side: 'buy' | 'sell'
  asset_symbol: string
  fiat_currency: string
  price_fiat: number
  limit_min_fiat: number
  limit_max_fiat: number
  available_asset: number
  payment_window_minutes: number
  is_verified: boolean
  status: 'active' | 'inactive'
}

const loading = ref(true)
const errorMsg = ref<string | null>(null)
const offer = ref<ApiRow | null>(null)

const amountUsdt = ref<number | null>(null)
const submitLoading = ref(false)

const idParam = computed<number | null>(() => {
  const raw = route.query.id
  if (raw == null) return null
  const n = Number(Array.isArray(raw) ? raw[0] : raw)
  return Number.isInteger(n) && n > 0 ? n : null
})

const nf0 = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

const limitText = computed(() => {
  if (!offer.value) return ''
  const fiat = offer.value.fiat_currency || 'IDR'
  return `${nf0.format(offer.value.limit_min_fiat)} – ${nf0.format(offer.value.limit_max_fiat)} ${fiat}`
})

const youReceiveIdr = computed(() => {
  if (!offer.value || !amountUsdt.value) return '—'
  const v = amountUsdt.value * offer.value.price_fiat
  return `Rp ${nf0.format(v)}`
})

function clampToAvailable(usdt: number): number {
  if (!offer.value) return usdt
  return Math.min(usdt, offer.value.available_asset)
}

/** ===== Saldo API ===== */
type SaldoRespSuccess = { status: 'success'; saldo: number; komisi: number }
type SaldoRespError = { status: 'error'; message: string }
type SaldoResponse = SaldoRespSuccess | SaldoRespError

async function fetchSaldo(): Promise<number> {
  const token = TOKEN()
  if (!token) throw new Error('Unauthorized.')

  const res = await fetch(`${API_BASE}/api/saldo`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  })

  let data: SaldoResponse
  try {
    data = (await res.json()) as SaldoResponse
  } catch {
    throw new Error(`Failed to parse saldo response (HTTP ${res.status}).`)
  }

  if (!res.ok) {
    const msg = 'message' in data ? data.message : `Request failed (HTTP ${res.status}).`
    throw new Error(msg)
  }
  if (data.status !== 'success') throw new Error('Failed to fetch saldo.')

  const s = Number(data.saldo)
  if (!Number.isFinite(s) || s < 0) throw new Error('Invalid saldo value.')
  return s
}

async function fetchOffer() {
  const token = TOKEN()
  if (!token) throw new Error('Unauthorized.')
  const res = await fetch(`${API_BASE}/api/p2p-offers/${idParam.value}`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    let msg = 'Failed to fetch offer.'
    try {
      const j = await res.json()
      if (j?.message) msg = j.message
    } catch {}
    throw new Error(msg)
  }
  offer.value = (await res.json()) as ApiRow
}

async function onClickMax() {
  try {
    const saldo = await fetchSaldo()
    let maxUsdt = saldo

    maxUsdt = clampToAvailable(maxUsdt)

    if (offer.value && offer.value.price_fiat > 0) {
      const byLimit = offer.value.limit_max_fiat / offer.value.price_fiat
      maxUsdt = Math.min(maxUsdt, byLimit)
    }

    amountUsdt.value = Number(maxUsdt.toFixed(2))
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error.'
    modal.open('Gagal mengambil saldo', msg)
  }
}

/** ===== Cek data-account (bank & norek) ===== */
async function ensureAccountBankFilled(): Promise<boolean> {
  const token = TOKEN()
  if (!token) return true

  try {
    const res = await fetch(`${API_BASE}/api/data-account`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })
    if (!res.ok) return true // jangan blokir kalau API error

    const data = (await res.json()) as { bank?: string | null; norek?: string | null }
    const hasBank = !!(data.bank && String(data.bank).trim())
    const hasNorek = !!(data.norek && String(data.norek).trim())

    if (!hasBank || !hasNorek) {
      modal.open(
        'Alert !',
        'Please complete your Bank Account and Account Number on the Account Info page.',
        () => router.push('/account'),
      )
      return false
    }
    return true
  } catch {
    return true
  }
}

/** ===== Place Sell Order -> POST /api/withdraws ===== */
type WithdrawResp = {
  id: number
  order_id: string
  invoice: string
  jumlah: number
  status: number
  timestamp: string
}

type WithdrawPayload = {
  jumlah: number
  keterangan: string
  advertiser_name: string
}

async function placeOrder() {
  try {
    if (!idParam.value) throw new Error('Invalid or missing id.')
    if (amountUsdt.value == null || amountUsdt.value <= 0) {
      throw new Error('Amount is required.')
    }

    // Guard: pastikan bank & norek terisi
    const okAccount = await ensureAccountBankFilled()
    if (!okAccount) return

    const token = TOKEN()
    if (!token) throw new Error('Unauthorized.')

    if (!offer.value) {
      await fetchOffer()
      if (!offer.value) throw new Error('Offer not loaded.')
    }

    const payload: WithdrawPayload = {
      jumlah: Number(amountUsdt.value.toFixed(2)),
      keterangan: String(idParam.value),
      advertiser_name: String(offer.value.advertiser_name || ''),
    }

    submitLoading.value = true

    const res = await fetch(`${API_BASE}/api/withdraws`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      let payloadErr: unknown = null
      try {
        payloadErr = await res.json()
      } catch {}

      const errObj = payloadErr as { message?: string; invoice?: string }
      const msg = (errObj?.message ?? '').trim()
      const inv = errObj?.invoice
      const isPendingMsg =
        msg === 'Complete your pending order before creating a new request.' ||
        msg === 'A pending withdrawal already exists.' ||
        msg === 'A pending request already exists.'

      if (res.status === 409 && isPendingMsg && typeof inv === 'string' && inv.length > 0) {
        modal.open('Pending Withdrawal', msg, () =>
          router.push(`/p2p-checkout-sell?order_id=${encodeURIComponent(inv)}`),
        )
        return
      }

      throw new Error(msg || `Request failed (HTTP ${res.status}).`)
    }

    const data: WithdrawResp = await res.json()

    modal.open('Sell Order Created', ``, () => {
      router.push(`/p2p-checkout-sell?order_id=${encodeURIComponent(data.invoice)}`)
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error.'
    modal.open('Sell Order Failed', msg)
  } finally {
    submitLoading.value = false
  }
}

onMounted(async () => {
  try {
    if (!idParam.value) throw new Error('Invalid or missing id.')
    await fetchOffer()
    // Cek kelengkapan bank & norek saat buka halaman
    await ensureAccountBankFilled()
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Unknown error.'
  } finally {
    loading.value = false
  }
})
</script>
