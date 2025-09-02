<template>
  <div class="max-w-md mx-auto p-4 relative">
    <!-- Top filter bar -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-4 text-sm font-normal text-gray-900">
        <!-- Asset (display saja) -->
        <div class="flex items-center space-x-1 select-none">
          <img src="/img/crypto/tether-usdt.svg" alt="USDT" class="w-5 h-5 rounded-full" />
          <span>USDT</span>
          <Icon icon="tabler:chevron-down" class="w-3 h-3 opacity-30" />
        </div>

        <!-- Amount filter (jumlah USDT) -->
        <button type="button" class="flex items-center space-x-1 select-none" @click="toggleAmount()">
          <span>Amount</span>
          <Icon icon="tabler:chevron-down" class="w-3 h-3" />
        </button>

        <!-- Payment filter (berdasarkan Limit fiat) -->
        <button type="button" class="flex items-center space-x-1 select-none" @click="toggleLimit()">
          <span>Payment</span>
          <Icon icon="tabler:chevron-down" class="w-3 h-3" />
        </button>
      </div>
      <div>
        <Icon icon="tabler:filter" class="text-yellow-400 text-lg w-5 h-5" />
      </div>
    </div>

    <!-- POPUP: Amount -->
    <div v-if="showAmount" class="absolute z-10 bg-white border border-gray-200 rounded-lg p-3 shadow w-90">
      <label class="block text-xs text-gray-500 mb-1">Jumlah USDT</label>
      <div class="flex items-center space-x-2">
        <input v-model.number="amountUsdt" type="number" min="0" step="0.0001"
          class="flex-1 border border-gray-300 rounded px-2 py-1 text-sm" placeholder="mis. 150" />
        <button type="button" class="text-xs px-2 py-1 border rounded" @click="applyAmount">
          Apply
        </button>
        <button type="button" class="text-xs px-2 py-1 border rounded" @click="clearAmount">
          Clear
        </button>
      </div>
      <p class="mt-2 text-[11px] text-gray-500">
        Menampilkan penjual yang <em>available</em> ≥ jumlah USDT dan nilai fiat (USDT × harga)
        berada dalam rentang <em>Limit</em>.
      </p>
    </div>

    <!-- POPUP: Limit (Payment) -->
    <div v-if="showLimit" class="absolute z-10 bg-white border border-gray-200 rounded-lg p-3 shadow w-64 left-40">
      <label class="block text-xs text-gray-500 mb-2">Filter berdasarkan Limit (IDR)</label>
      <div class="space-y-1 text-sm">
        <label class="flex items-center space-x-2">
          <input type="radio" value="ALL" v-model="limitPreset" />
          <span>Semua</span>
        </label>
        <label class="flex items-center space-x-2">
          <input type="radio" value="LT1M" v-model="limitPreset" />
          <span>&lt; 1.000.000</span>
        </label>
        <label class="flex items-center space-x-2">
          <input type="radio" value="1-5M" v-model="limitPreset" />
          <span>1 — 5 juta</span>
        </label>
        <label class="flex items-center space-x-2">
          <input type="radio" value="5-10M" v-model="limitPreset" />
          <span>5 — 10 juta</span>
        </label>
        <label class="flex items-center space-x-2">
          <input type="radio" value="GTE10M" v-model="limitPreset" />
          <span>≥ 10 juta</span>
        </label>
      </div>
      <div class="mt-2 flex items-center space-x-2">
        <button type="button" class="text-xs px-2 py-1 border rounded" @click="applyLimit">
          Apply
        </button>
        <button type="button" class="text-xs px-2 py-1 border rounded" @click="clearLimit">
          Clear
        </button>
      </div>
      <p class="mt-2 text-[11px] text-gray-500">
        Menyaring berdasarkan rentang <em>Limit</em> fiat penjual.
      </p>
    </div>

    <!-- Trade items -->
    <div v-for="trade in filteredTrades" :key="trade.id" class="mb-3 border border-gray-200 rounded-lg p-3 text-[11px]">
      <div class="flex items-center space-x-2 mb-1">
        <div class="w-5 h-5">
          <img v-if="trade.avatarUrl && !trade.avatarBroken" :src="trade.avatarUrl" alt="Avatar"
            class="w-5 h-5 rounded-full object-cover" @error="trade.avatarBroken = true" />
          <div v-else
            class="bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold select-none">
            {{ trade.avatarText }}
          </div>
        </div>
        <span class="font-semibold text-gray-900">
          {{ trade.username }}
        </span>
      </div>

      <div class="text-[10px] text-gray-500 mb-1">
        Trade(s) {{ trade.trades }} ({{ trade.successRate }})
        <span class="ml-2"> ⚡ {{ trade.completionRate }} </span>
      </div>

      <div class="flex items-center justify-between mb-1">
        <div>
          <span class="text-[13px] font-extrabold text-gray-900">
            {{ trade.price }}
          </span>
          <span class="text-[10px] text-gray-500 ml-1">USDT</span>
        </div>
        <div class="text-[10px] text-gray-400 text-right">
          <template v-if="Array.isArray(trade.payment)">
            <div v-for="(pay, idx) in trade.payment" :key="idx">{{ pay }}</div>
          </template>
          <template v-else>
            {{ trade.payment }}
          </template>
        </div>
      </div>

      <div class="text-[10px] text-gray-500 mb-1">
        Limit <span class="font-semibold">{{ trade.limit }}</span>
      </div>
      <div class="text-[10px] text-gray-500 mb-3">
        Available <span class="font-semibold">{{ trade.available }}</span>
      </div>

      <div class="flex items-center justify-between">
        <div class="text-[10px] text-gray-400 flex items-center space-x-1">
          <Icon icon="tabler:clock" class="w-3 h-3" />
          <span>{{ trade.time }}</span>
        </div>

        <!-- BUY & SELL buttons -->
        <div class="flex items-center gap-2">
          <button class="bg-teal-500 text-white text-[10px] font-semibold rounded-md px-4 py-[3px]" type="button"
            @click="goDetail(trade.id)">
            Buy
          </button>
          <button class="bg-red-500 text-white text-[10px] font-semibold rounded-md px-4 py-[3px]" type="button"
            @click="goDetailSell(trade.id)">
            Sell
          </button>
        </div>
      </div>

      <div v-if="trade.verified"
        class="mt-2 inline-block border border-gray-300 rounded px-1 text-[10px] text-gray-600 font-semibold select-none">
        <Icon icon="tabler:check" class="inline-block w-3 h-3 mr-1" />
        Verification
      </div>
    </div>


    <div v-if="loading" class="text-center text-xs text-gray-400 select-none">Loading…</div>
    <div v-else-if="errorMsg" class="text-center text-xs text-red-500 select-none">
      {{ errorMsg }}
    </div>
    <div v-else-if="!filteredTrades.length" class="text-center text-xs text-gray-400 select-none">
      No Data Available
    </div>
    <div v-else class="text-center text-xs text-gray-400 select-none">No more data</div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
function goDetail(tradeId: number) {
  router.push(`/p2p-detail?id=${tradeId}`)
}
function goDetailSell(tradeId: number) {
  router.push(`/p2p-detail-sell?id=${tradeId}`)
}

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

  avatarUrl?: string | null
  avatarBroken?: boolean

  // numeric helpers untuk filter
  priceFiatNum: number
  limitMinFiatNum: number
  limitMaxFiatNum: number
  availableUsdtNum: number
}

const trades = ref<Trade[]>([])
const loading = ref(true)
const errorMsg = ref<string | null>(null)

// === FILTER STATE ===
const showAmount = ref(false)
const showLimit = ref(false)
const amountUsdt = ref<number | null>(null)

type LimitPreset = 'ALL' | 'LT1M' | '1-5M' | '5-10M' | 'GTE10M'
const limitPreset = ref<LimitPreset>('ALL')

// helpers format lokal
const nfId = (min = 0, max = 0) =>
  new Intl.NumberFormat('id-ID', { minimumFractionDigits: min, maximumFractionDigits: max })
function formatPct(n: number) {
  return nfId(2, 2).format(Number.isFinite(n) ? n : 0) + '%'
}
function formatRupiah(n: number) {
  return 'Rp ' + nfId(0, 0).format(Number.isFinite(n) ? n : 0)
}
function formatFiatRange(min: number, max: number, fiat = 'IDR') {
  return `${nfId(0, 0).format(min)} - ${nfId(0, 0).format(max)} ${fiat}`
}
function formatUsdt(n: number) {
  return `${nfId(2, 2).format(Number.isFinite(n) ? n : 0)} USDT`
}
function initialFrom(name: string) {
  const c = (name || '').trim().charAt(0)
  return c ? c.toUpperCase() : '?'
}

// contoh ikon (tidak dipakai di UI sekarang, tetap disediakan)
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
    avatarUrl: r.avatar_url || null,
    avatarBroken: false,

    // numeric utk filter
    priceFiatNum: r.price_fiat,
    limitMinFiatNum: r.limit_min_fiat,
    limitMaxFiatNum: r.limit_max_fiat,
    availableUsdtNum: r.available_asset,
  }
}

// ===== FILTER LOGIC =====
function overlaps(aMin: number, aMax: number, bMin: number, bMax: number) {
  return aMax >= bMin && aMin <= bMax
}
function limitBand(preset: LimitPreset): [number, number] | null {
  switch (preset) {
    case 'ALL':
      return null
    case 'LT1M':
      return [0, 1_000_000 - 1]
    case '1-5M':
      return [1_000_000, 5_000_000]
    case '5-10M':
      return [5_000_000, 10_000_000]
    case 'GTE10M':
      return [10_000_000, Number.POSITIVE_INFINITY]
  }
}

const filteredTrades = computed(() => {
  let arr = trades.value.slice()

  // Filter Limit (Payment)
  const band = limitBand(limitPreset.value)
  if (band) {
    const [bMin, bMax] = band
    arr = arr.filter((t) => overlaps(t.limitMinFiatNum, t.limitMaxFiatNum, bMin, bMax))
  }

  // Filter Amount (USDT)
  if (amountUsdt.value && amountUsdt.value > 0) {
    arr = arr.filter((t) => {
      if (t.availableUsdtNum < amountUsdt.value!) return false
      const needFiat = amountUsdt.value! * t.priceFiatNum
      return needFiat >= t.limitMinFiatNum && needFiat <= t.limitMaxFiatNum
    })
  }

  return arr
})

// ==== UI toggle/apply ====
function toggleAmount() {
  showAmount.value = !showAmount.value
  if (showAmount.value) showLimit.value = false
}
function toggleLimit() {
  showLimit.value = !showLimit.value
  if (showLimit.value) showAmount.value = false
}
function applyAmount() {
  showAmount.value = false
}
function clearAmount() {
  amountUsdt.value = null
  showAmount.value = false
}
function applyLimit() {
  showLimit.value = false
}
function clearLimit() {
  limitPreset.value = 'ALL'
  showLimit.value = false
}

// ==== fetch ====
async function fetchOffers() {
  loading.value = true
  errorMsg.value = null
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Unauthorized')

    // ganti ke relative path jika API sama domain: '/api/p2p-offers'
    const res = await fetch('https://one-ledger.masmutpanel.my.id/api/p2p-offers', {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
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
