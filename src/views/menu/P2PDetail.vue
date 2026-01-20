<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header -->
    <header class="relative flex items-center px-4 py-3 border-b border-gray-200">
      <button aria-label="Back" class="text-black text-xl pr-4 relative z-10" @click="goBack">
        <Icon icon="tabler:arrow-left" width="24" height="24" />
      </button>

      <!-- Centered title -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="flex items-center gap-2 font-semibold text-base">
          <img src="/img/crypto/tether-usdt.svg" alt="USDT" class="w-6 h-6 rounded-full" />
          <span>Buy USDT</span>
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
        <p class="text-sm font-medium text-gray-800 mb-1">Buy USDT</p>

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
          You Pay <span class="font-bold">{{ youPayIdr }}</span>
        </p>

        <p class="text-[10px] text-gray-400 mt-1" v-if="offer">
          ~ {{ new Intl.NumberFormat('en-US').format(offer.price_fiat) }} IDR / USDT
        </p>
      </section>

      <!-- Advertiser requirements -->
      <section>
        <p class="font-semibold mb-3">Advertiser's Requirements</p>

        <div class="flex items-center justify-between mb-1">
          <p class="font-bold text-sm flex items-center gap-1">
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
        <span v-else>Place Order</span>
      </button>
    </main>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useApiAlertStore } from '@/stores/apiAlert'

const router = useRouter()
const route = useRoute()
const modal = useApiAlertStore()

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/p2p')
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
  price_fiat: number // <— rate IDR per 1 USDT
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

// ===== Amount & submit state
const amountUsdt = ref<number | null>(null)
const submitLoading = ref(false)

const idParam = computed<number | null>(() => {
  const raw = route.query.id
  if (raw == null) return null
  const n = Number(raw)
  return Number.isInteger(n) && n > 0 ? n : null
})

const nf0 = new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

const POLL_MS = 10_000
let pollTimer: number | null = null
const kicked = ref(false)

function kickToP2P(message: string) {
  if (kicked.value) return
  kicked.value = true

  if (pollTimer != null) {
    window.clearInterval(pollTimer)
    pollTimer = null
  }

  modal.open('Offer unavailable', message, () => {
    router.replace('/p2p')
  })
}

const limitText = computed(() => {
  if (!offer.value) return ''
  const fiat = offer.value.fiat_currency || 'IDR'
  return `${nf0.format(offer.value.limit_min_fiat)} – ${nf0.format(offer.value.limit_max_fiat)} ${fiat}`
})

const youPayIdr = computed(() => {
  if (!offer.value || !amountUsdt.value) return '—'
  const v = amountUsdt.value * offer.value.price_fiat
  return `Rp ${nf0.format(v)}`
})

function clampToAvailable(usdt: number): number {
  if (!offer.value) return usdt
  return Math.min(usdt, offer.value.available_asset)
}

async function fetchOffer() {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('Unauthorized.')
  const res = await fetch(`https://tech.oneled.io/api/p2p-offers/${idParam.value}`, {
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

  const row = (await res.json()) as ApiRow
  offer.value = row
  if (row?.status !== 'active') {
    kickToP2P('This offer is no longer active. Please choose another advertiser.')
  }
}

function onClickMax() {
  if (!offer.value) return
  const rate = offer.value.price_fiat
  if (!rate || rate <= 0) {
    modal.open('Rate unavailable', 'Price rate (price_fiat) is not available.')
    return
  }
  const usdt = offer.value.limit_max_fiat / rate
  amountUsdt.value = Number(clampToAvailable(usdt).toFixed(2))
}

// ===== Place Order -> POST /api/deposits
type DepositResp = {
  id: number
  order_id: string
  invoice: string
  jumlah: number
  status: number
  timestamp: string
}

// tipe payload (opsional, biar rapi)
type DepositPayload = {
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

    const token = localStorage.getItem('token')
    if (!token) throw new Error('Unauthorized.')

    // pastikan offer sudah ada
    if (!offer.value) {
      await fetchOffer()
      if (!offer.value) throw new Error('Offer not loaded.')
    }

    const payload: DepositPayload = {
      jumlah: Number(amountUsdt.value.toFixed(2)),
      keterangan: String(idParam.value),
      advertiser_name: String(offer.value.advertiser_name || ''),
    }

    submitLoading.value = true

    const res = await fetch('https://tech.oneled.io/api/deposits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let payloadErr: any = null
      try {
        payloadErr = await res.json()
      } catch {}

      const msg = (payloadErr?.message ?? '').trim()
      const inv = payloadErr?.invoice
      const isPendingMsg =
        msg === 'Complete your pending order before creating a new request.' ||
        msg === 'A pending deposit already exists.'

      if (res.status === 409 && isPendingMsg && typeof inv === 'string' && inv.length > 0) {
        modal.open('Pending Order', msg, () =>
          router.push(`/p2p-checkout?invoice_id=${encodeURIComponent(inv)}`),
        )
        return
      }

      throw new Error(msg || `Request failed (HTTP ${res.status}).`)
    }

    const data: DepositResp = await res.json()

    modal.open('Order Created', ``, () => {
      router.push(`/p2p-checkout?invoice_id=${encodeURIComponent(data.invoice)}`)
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error.'
    modal.open('Order Failed', msg)
  } finally {
    submitLoading.value = false
  }
}

onMounted(async () => {
  try {
    if (!idParam.value) throw new Error('Invalid or missing id.')
    await fetchOffer()

    pollTimer = window.setInterval(async () => {
      if (kicked.value) return
      try {
        await fetchOffer()
      } catch {
        kickToP2P('This offer is no longer available. Please choose another advertiser.')
      }
    }, POLL_MS)
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Unknown error.'
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  if (pollTimer != null) {
    window.clearInterval(pollTimer)
    pollTimer = null
  }
})
</script>
