<template>
  <div>
    <!-- Section: Total Value Summary -->
    <section class="bg-white mb-6 px-4 mt-5">
      <!-- Header -->
      <div class="flex items-center space-x-1 text-gray-700 text-sm font-normal mb-1">
        <span>Est. Total Value</span>
        <!-- Icon 👁️ ganti tabler:eye -->
        <Icon icon="tabler:eye" class="w-4 h-4" />
      </div>

      <!-- Total Value -->
      <div class="flex items-baseline space-x-1 font-semibold text-3xl text-black mb-1">
        <span>{{
          saldo !== null ? saldo.toLocaleString('id-ID', { minimumFractionDigits: 2 }) : '...'
        }}</span>
        <span class="text-base font-normal">USDT</span>
        <!-- Icon ▼ ganti tabler:chevron-down -->
        <Icon icon="tabler:chevron-down" class="text-base w-4 h-4" />
      </div>

      <!-- USD Equivalent -->
      <div class="text-gray-400 text-sm mb-2">
        ≈ ${{
          saldo !== null ? saldo.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '...'
        }}
      </div>

      <!-- PNL -->
      <div class="text-xs flex items-center text-black mb-4">
        Today's PNL
        <span class="text-[#3ABBA3] font-semibold"> +0,00938701 USDT (+0,84%) </span>
        <!-- Icon ➡️ ganti tabler:chevron-right -->
        <Icon icon="tabler:chevron-right" class="ml-1 text-gray-400 w-4 h-4" />
      </div>

      <!-- Action Buttons -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <RouterLink
          to="/add-funds"
          class="bg-teal-400 active:bg-teal-500 text-white rounded-md px-6 py-2 text-base font-normal transition-colors w-full text-center"
        >
          Add Funds
        </RouterLink>

        <RouterLink
          to="/send"
          class="bg-[#E6E6E6] text-black rounded-md px-6 py-2 text-base font-semibold w-full text-center"
        >
          Send
        </RouterLink>

        <RouterLink
          to="/transfer"
          class="bg-[#E6E6E6] text-black rounded-md px-6 py-2 text-base font-semibold w-full text-center"
        >
          Transfer
        </RouterLink>
      </div>
    </section>
    <div class="mb-20">
      <div v-if="loadingAssets" class="text-sm text-gray-500 px-5 py-3">Loading assets…</div>
      <div v-else-if="errorAssets" class="text-sm text-red-500 px-5 py-3">{{ errorAssets }}</div>
      <div v-else-if="assets.length === 0" class="text-sm text-gray-500 px-5 py-3">
        No Data Available
      </div>

      <section
        v-else
        v-for="a in assets"
        :key="a.symbol"
        class="space-y-4 w-full rounded-2xl p-5 drop-shadow-md"
      >
        <div class="flex justify-between items-center">
          <p class="text-gray-500 text-sm font-normal">Current pair assets</p>
          <Icon icon="tabler:adjustments-horizontal" class="text-gray-400 text-sm" />
        </div>

        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-2">
            <img
              :alt="`${a.name} logo`"
              class="flex-shrink-0 rounded-full"
              :src="a.logoUrl"
              width="20"
              height="20"
            />
            <p class="font-bold text-black text-base leading-5">
              {{ a.symbol }}
              <span class="font-normal text-gray-400 text-sm">{{ a.name }}</span>
            </p>
          </div>

          <button aria-label="Share" class="text-gray-400 hover:text-gray-600">
            <Icon icon="tabler:share-3" class="text-base" />
          </button>
        </div>

        <div
          class="flex justify-between items-center space-x-4 font-semibold text-base leading-5"
          :class="a.changePct >= 0 ? 'text-green-600' : 'text-red-600'"
        >
          <p>{{ signedMoneyId(a.changeAbsUsd, 8) }}</p>
          <p>{{ signedPercent(a.changePct) }}</p>
        </div>

        <div class="flex justify-between text-xs text-gray-400 font-normal">
          <div class="flex flex-col">
            <span class="text-gray-600 font-normal text-xs">Balances</span>
            <span class="text-black font-normal text-sm">
              {{ formatNumberId(a.balanceCoin, 8) }}
            </span>
            <span>{{ moneyId(a.balanceUsd, a.balanceUsdDigits) }}</span>
          </div>

          <!-- <div class="flex flex-col text-right">
          <span class="text-gray-600 font-normal text-xs">Avg. Cost</span>
          <span class="text-black font-normal text-sm">
            {{ moneyId(a.avgCostUsd, 2) }}
          </span>
        </div> -->

          <div class="flex flex-col text-right">
            <span class="text-gray-600 font-normal text-xs">Last Price ({{ a.quote }})</span>
            <span class="text-black font-normal text-sm">
              {{ formatNumberId(a.lastPrice, 2) }}
            </span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'

/** ---------- Saldo ---------- */
interface SaldoResponse {
  status: string
  saldo: number
  koin: number
}
const saldo = ref<number | null>(null)
const koin = ref<number | null>(null)

async function loadSaldo() {
  const token = localStorage.getItem('token')
  if (!token) return
  const res = await fetch('https://ledger.masmutdev.id/api/saldo', {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  const data: SaldoResponse = await res.json()
  if (res.ok && data.status === 'success') {
    saldo.value = data.saldo
    koin.value = data.koin
  }
}

/** ---------- Types ---------- */
type Quote = 'USDT' | 'USDC' | 'USD'

type HistoryRow = {
  id: string | number
  symbol: string
  jenis: 'BUY' | 'SELL' | string
  daily_pnl: string
  pnl: string
  last_prices: string
  balances_buy?: string
  balances_sell?: string
  profit?: string
  time_order: string
  created_at: string
  updated_at: string
}

type AssetItem = {
  symbol: string
  name: string
  logoUrl: string
  quote: Quote
  changeAbsUsd: number
  changePct: number
  balanceCoin: number
  balanceUsd: number
  balanceUsdDigits?: number
  lastPrice: number
  ts: number
}

/** ---------- Helpers ---------- */
const SYMBOL_META: Record<string, { name: string; logoUrl: string; quote: Quote }> = {
  BTC: {
    name: 'Bitcoin',
    logoUrl: 'https://placehold.co/20x20/orange/fff/png?text=B',
    quote: 'USDT',
  },
  ETH: {
    name: 'Ethereum',
    logoUrl: 'https://placehold.co/20x20/gray/fff/png?text=E',
    quote: 'USDT',
  },
  SOL: { name: 'Solana', logoUrl: 'https://placehold.co/20x20/000/fff/png?text=S', quote: 'USDT' },
}

const nfId = (min: number, max: number) =>
  new Intl.NumberFormat('id-ID', { minimumFractionDigits: min, maximumFractionDigits: max })

function formatNumberId(n: number, digits = 2): string {
  return Number.isFinite(n) ? nfId(digits, digits).format(n) : '0'
}
function moneyId(n: number, digits = 2): string {
  return `$${formatNumberId(n, digits)}`
}
function signedPercent(pct: number): string {
  return (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%'
}
function signedMoneyId(n: number, digits = 2): string {
  return (n >= 0 ? '+' : '') + moneyId(Math.abs(n), digits)
}
function normalizeNumber(v: string | number | null | undefined): number {
  if (v === null || v === undefined) return 0
  if (typeof v === 'number') return v
  return Number(String(v).replace(/,/g, '')) || 0
}
function parsePercent(s: string): number {
  const m = String(s).match(/[-+]?\d+(?:\.\d+)?/)
  return m ? Number(m[0]) : 0
}
function toTs(s: string): number {
  const d = new Date(s.replace(' ', 'T') + 'Z')
  return isNaN(d.getTime()) ? Date.now() : d.getTime()
}

/** ---------- Data dari /crypto-history ---------- */
const assets = ref<AssetItem[]>([])
const loadingAssets = ref(false)
const errorAssets = ref<string | null>(null)

async function loadAssets() {
  loadingAssets.value = true
  errorAssets.value = null
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Token tidak ada.')

    const res = await fetch('https://ledger.masmutdev.id/api/crypto-history', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`Request failed (${res.status})`)

    const rows: HistoryRow[] = await res.json()

    const mapped: AssetItem[] = rows.map((h) => {
      const meta = SYMBOL_META[h.symbol] ?? {
        name: h.symbol,
        logoUrl: 'https://placehold.co/20x20/777/fff/png?text=?',
        quote: 'USDT' as Quote,
      }

      const last = normalizeNumber(h.last_prices)
      const pnlPct = parsePercent(h.pnl)
      const absUsd = normalizeNumber(h.daily_pnl)
      const isBuy = String(h.jenis).toUpperCase() === 'BUY'

      let qtyCoin = 0
      let usdVal = 0

      if (isBuy) {
        qtyCoin = normalizeNumber(h.profit) || normalizeNumber(h.balances_buy) / (last || Infinity)
        usdVal = qtyCoin * last
      } else {
        qtyCoin = normalizeNumber(h.balances_sell)
        usdVal = normalizeNumber(h.profit) || qtyCoin * last
      }

      return {
        symbol: h.symbol,
        name: meta.name,
        logoUrl: meta.logoUrl,
        quote: meta.quote,
        changeAbsUsd: absUsd,
        changePct: pnlPct,
        balanceCoin: Number.isFinite(qtyCoin) ? qtyCoin : 0,
        balanceUsd: Number.isFinite(usdVal) ? usdVal : 0,
        balanceUsdDigits: 2,
        lastPrice: Number.isFinite(last) ? last : 0,
        ts: toTs(h.time_order || h.updated_at || h.created_at),
      }
    })

    mapped.sort((a, b) => b.ts - a.ts)
    assets.value = mapped
  } catch (e) {
    errorAssets.value = e instanceof Error ? e.message : 'Gagal memuat crypto-history.'
    assets.value = []
  } finally {
    loadingAssets.value = false
  }
}

/** ---------- Mount ---------- */
onMounted(async () => {
  await Promise.all([loadSaldo(), loadAssets()])
})
</script>

<style scoped>
/* Tambahan gaya jika perlu */
</style>
