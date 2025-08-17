<!-- BuyUsdtPage.vue -->
<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, onMounted } from 'vue'

const router = useRouter()
const route = useRoute()

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/buy-p2p')
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

// ===== Amount & rate state
const amountUsdt = ref<number | null>(null) // manual input; placeholder 100
const rateIdrPerUsdt = ref<number | null>(null) // IDR per 1 USDT
const rateLoading = ref(false)
const rateError = ref<string | null>(null)

const idParam = computed<number | null>(() => {
  const raw = route.query.id
  if (raw == null) return null
  const n = Number(raw)
  return Number.isInteger(n) && n > 0 ? n : null
})

const nf0 = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const nf2 = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const limitText = computed(() => {
  if (!offer.value) return ''
  const fiat = offer.value.fiat_currency || 'IDR'
  return `${nf0.format(offer.value.limit_min_fiat)} – ${nf0.format(offer.value.limit_max_fiat)} ${fiat}`
})

const youPayIdr = computed(() => {
  if (!rateIdrPerUsdt.value || !amountUsdt.value) return '—'
  const v = amountUsdt.value * rateIdrPerUsdt.value
  return `Rp ${nf0.format(v)}`
})

function clampToAvailable(usdt: number): number {
  if (!offer.value) return usdt
  // optional clamp ke ketersediaan
  return Math.min(usdt, offer.value.available_asset)
}

async function fetchOffer() {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('Unauthorized.')
  const res = await fetch(`https://ledger.masmutdev.id/api/p2p-offers/${idParam.value}`, {
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
  offer.value = await res.json()
}

async function fetchRate() {
  rateLoading.value = true
  rateError.value = null
  try {
    // 1) CoinGecko: tether price in IDR
    // GET https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=idr
    const r1 = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=idr',
    )
    if (r1.ok) {
      const j = await r1.json()
      const v = j?.tether?.idr
      if (typeof v === 'number' && v > 0) {
        rateIdrPerUsdt.value = v
        return
      }
    }
    // 2) Fallback exchangerate.host: USD→IDR, treat USDT≈USD
    // GET https://api.exchangerate.host/latest?base=USD&symbols=IDR
    const r2 = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=IDR')
    if (!r2.ok) throw new Error('Rate fetch failed.')
    const j2 = await r2.json()
    const v2 = j2?.rates?.IDR
    if (typeof v2 === 'number' && v2 > 0) {
      rateIdrPerUsdt.value = v2
      return
    }
    throw new Error('Rate not available.')
  } catch (e) {
    rateError.value = e instanceof Error ? e.message : 'Rate error.'
    rateIdrPerUsdt.value = null
  } finally {
    rateLoading.value = false
  }
}

function onClickMax() {
  if (!offer.value) return
  if (!rateIdrPerUsdt.value) {
    rateError.value = 'Currency rate is not available.'
    return
  }
  // Convert limit_max_fiat (IDR) -> USDT
  const usdt = offer.value.limit_max_fiat / rateIdrPerUsdt.value
  // Bulatkan ke 2 desimal & clamp ke available
  amountUsdt.value = Number(nf2.format(clampToAvailable(usdt)).replace(/\./g, '').replace(',', '.')) // safer: use toFixed
  amountUsdt.value = Number(clampToAvailable(usdt).toFixed(2))
}

onMounted(async () => {
  try {
    if (!idParam.value) throw new Error('Invalid or missing id.')
    await Promise.all([fetchOffer(), fetchRate()])
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Unknown error.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header -->
    <header class="flex items-center px-4 py-3 border-b border-gray-200">
      <button aria-label="Back" class="text-black text-xl pr-4" @click="goBack">
        <Icon icon="tabler:arrow-left" width="24" height="24" />
      </button>

      <div class="flex items-center space-x-2 mx-auto font-semibold text-base">
        <div
          class="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-bold"
        >
          T
        </div>
        <span>Buy USDT</span>
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
            <!-- INPUT amount USDT -->
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

        <p class="text-[10px] text-gray-400 mt-1">
          <span v-if="rateLoading">Fetching rate…</span>
          <span v-else-if="rateError">{{ rateError }}</span>
          <span v-else-if="rateIdrPerUsdt"
            >~ {{ new Intl.NumberFormat('id-ID').format(rateIdrPerUsdt!) }} IDR / USDT</span
          >
        </p>
      </section>

      <!-- Advertiser requirements -->
      <section>
        <p class="font-semibold mb-3">Advertiser's Requirements</p>

        <div class="flex items-center justify-between mb-1">
          <p class="font-bold text-sm flex items-center gap-1">
            <span>{{ offer?.advertiser_name }}</span>
            <img
              alt="Diamond icon"
              src="https://storage.googleapis.com/a1aa/image/ab42fbab-67ff-4fcb-d330-b463e18db3f3.jpg"
              class="w-4 h-4"
            />
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
        class="w-full mt-8 bg-teal-500 text-white text-base font-normal py-3 rounded-lg hover:bg-green-700"
      >
        Place Order
      </button>
    </main>
  </div>
</template>
