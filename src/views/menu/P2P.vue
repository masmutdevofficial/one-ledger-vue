<template>
  <div class="max-w-md mx-auto p-4">
    <!-- Top filter bar -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-4 text-sm font-normal text-gray-900">
        <div class="flex items-center space-x-1 cursor-pointer select-none">
          <img src="/img/crypto/tether-usdt.svg" alt="USDT" class="w-5 h-5 rounded-full" />
          <span>USDT</span>
          <Icon icon="tabler:chevron-down" class="w-3 h-3" />
        </div>
        <div class="flex items-center space-x-1 cursor-pointer select-none">
          <span>Amount</span>
          <Icon icon="tabler:chevron-down" class="w-3 h-3" />
        </div>
        <div class="flex items-center space-x-1 cursor-pointer select-none">
          <span>Payment</span>
          <Icon icon="tabler:chevron-down" class="w-3 h-3" />
        </div>
      </div>
      <div>
        <Icon icon="tabler:filter" class="text-yellow-400 text-lg w-5 h-5" />
      </div>
    </div>

    <!-- Trade items -->
    <div v-for="trade in trades" :key="trade.id" class="mb-6">
      <div class="flex items-center space-x-2 mb-1">
        <div class="w-6 h-6">
          <img
            v-if="trade.avatarUrl && !trade.avatarBroken"
            :src="trade.avatarUrl"
            alt="Avatar"
            class="w-6 h-6 rounded-full object-cover"
            @error="trade.avatarBroken = true"
          />
          <div
            v-else
            class="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold select-none"
          >
            {{ trade.avatarText }}
          </div>
        </div>

        <span class="text-sm font-semibold text-gray-900">
          {{ trade.username }}
        </span>
      </div>
      <div class="text-xs text-gray-500 mb-1">
        Trade(s) {{ trade.trades }} ({{ trade.successRate }})
        <span class="ml-2"> ⚡ {{ trade.completionRate }} </span>
      </div>
      <div class="flex items-center justify-between mb-1">
        <div>
          <span class="text-base font-extrabold text-gray-900">
            {{ trade.price }}
          </span>
          <span class="text-xs font-normal text-gray-500 ml-1">USDT</span>
        </div>
        <div class="text-xs text-gray-400 text-right">
          <template v-if="Array.isArray(trade.payment)">
            <div v-for="(pay, idx) in trade.payment" :key="idx">
              {{ pay }}
              <span v-if="pay.includes('⚡')"></span>
            </div>
          </template>
          <template v-else>
            {{ trade.payment }}
          </template>
        </div>
      </div>
      <div class="text-xs text-gray-500 mb-1">
        Limit
        <span class="font-semibold">{{ trade.limit }}</span>
      </div>
      <div class="text-xs text-gray-500 mb-3">
        Available
        <span class="font-semibold">{{ trade.available }}</span>
      </div>
      <div class="flex items-center justify-between">
        <div class="text-xs text-gray-400 flex items-center space-x-1">
          <Icon icon="tabler:clock" class="w-3 h-3" />
          <span>{{ trade.time }}</span>
        </div>
        <button
          class="bg-teal-500 text-white text-xs font-semibold rounded-md px-6 py-1"
          type="button"
          @click="goDetail(trade.id)"
        >
          Buy
        </button>
      </div>
      <div
        v-if="trade.verified"
        class="mt-2 inline-block border border-gray-300 rounded px-1 text-xs text-gray-600 font-semibold select-none"
      >
        <Icon icon="tabler:check" class="inline-block w-3 h-3 mr-1" />
        Verification
      </div>
    </div>

    <div v-if="loading" class="text-center text-xs text-gray-400 select-none">Loading…</div>
    <div v-else-if="errorMsg" class="text-center text-xs text-red-500 select-none">
      {{ errorMsg }}
    </div>
    <div v-else-if="!trades.length" class="text-center text-xs text-gray-400 select-none">
      No Data Available
    </div>
    <div v-else class="text-center text-xs text-gray-400 select-none">No more data</div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function goDetail(tradeId: number) {
  router.push(`/p2p-detail?id=${tradeId}`)
}
// type Emoji = { src: string; alt: string }

type Trade = {
  id: number
  avatarText: string
  username: string
  emojis: { src: string; alt: string }[]
  trades: number
  successRate: string
  completionRate: string
  price: string
  payment: string | string[]
  limit: string
  available: string
  time: string
  verified?: boolean

  // NEW
  avatarUrl?: string | null
  avatarBroken?: boolean
}

// ==== UI state
const trades = ref<Trade[]>([])
const loading = ref(true)
const errorMsg = ref<string | null>(null)

// ==== helpers format lokal ID
const nfId = (min = 0, max = 0) =>
  new Intl.NumberFormat('id-ID', { minimumFractionDigits: min, maximumFractionDigits: max })

function formatPct(n: number) {
  if (!Number.isFinite(n)) return '0,00%'
  return nfId(2, 2).format(n) + '%'
}
function formatRupiah(n: number) {
  if (!Number.isFinite(n)) return 'Rp 0'
  return 'Rp ' + nfId(0, 0).format(n)
}
function formatFiatRange(min: number, max: number, fiat = 'IDR') {
  return `${nfId(0, 0).format(min)} - ${nfId(0, 0).format(max)} ${fiat}`
}
function formatUsdt(n: number) {
  // tampil 2 desimal agar ringkas, bisa diubah ke 4/6 kalau mau
  return `${nfId(2, 2).format(n)} USDT`
}
function initialFrom(name: string) {
  const c = (name || '').trim().charAt(0)
  return c ? c.toUpperCase() : '?'
}

// contoh ikon gambar kecil (emoji) utk petir (fast)
const EMOJI_LIGHTNING =
  'https://storage.googleapis.com/a1aa/image/bdf2b390-7b1a-47de-ae86-662743046566.jpg'

type ApiRow = {
  id: number
  advertiser_name: string
  avatar_url?: string | null
  trades_count: number
  completion_rate_pct: number
  is_fast: boolean
  side: 'buy' | 'sell'
  asset_symbol: string // USDT
  fiat_currency: string // IDR
  price_fiat: number
  limit_min_fiat: number
  limit_max_fiat: number
  available_asset: number
  payment_window_minutes: number
  is_verified: boolean
  status: 'active' | 'inactive'
  payment_methods?: { id: number; code: string; name: string; is_instant: boolean }[]
}

function mapRow(r: ApiRow): Trade {
  const pays = r.payment_methods?.map((m) => `${m.name}${m.is_instant ? ' ⚡' : ''}`) ?? []
  return {
    id: r.id,
    avatarText: initialFrom(r.advertiser_name),
    username: r.advertiser_name,
    emojis: r.is_fast ? [{ src: EMOJI_LIGHTNING, alt: 'Lightning emoji' }] : [],
    trades: r.trades_count,
    successRate: formatPct(r.completion_rate_pct),
    completionRate: formatPct(r.completion_rate_pct),
    price: formatRupiah(r.price_fiat),
    payment: pays.length ? pays : 'Bank Transfer',
    limit: formatFiatRange(r.limit_min_fiat, r.limit_max_fiat, r.fiat_currency || 'IDR'),
    available: formatUsdt(r.available_asset),
    time: `${r.payment_window_minutes} min`,
    verified: !!r.is_verified,

    // NEW
    avatarUrl: r.avatar_url || null,
    avatarBroken: false,
  }
}

async function fetchOffers() {
  loading.value = true
  errorMsg.value = null
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Unauthorized')

    // kalau API satu domain, cukup '/api/p2p-offers'
    const res = await fetch('https://one-ledger.masmutpanel.my.id/api/p2p-offers', {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }
    const data: ApiRow[] = await res.json()
    trades.value = Array.isArray(data) ? data.map(mapRow) : []
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Gagal memuat data.'
    trades.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchOffers)
</script>
