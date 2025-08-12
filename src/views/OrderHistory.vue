<template>
  <div class="mx-5 mb-20">
    <div v-if="loading" class="text-sm text-gray-500 py-6 text-center">Loading history…</div>
    <div v-else-if="errorMsg" class="text-sm text-red-500 py-6 text-center">{{ errorMsg }}</div>
    <div v-else-if="items.length === 0" class="text-sm text-gray-500 py-6 text-center">
      Tidak ada history (closed orders).
    </div>

    <div v-else class="space-y-6">
      <main v-for="it in items" :key="it.id" class="bg-[#F9FAFB] rounded-3xl p-6 flex-grow">
        <h1 class="text-center font-extrabold text-lg mb-3">{{ it.symbol }}/USDT</h1>

        <div class="flex flex-col items-center mb-3">
          <div class="w-10 h-10 rounded-full bg-[#3AA87D] flex items-center justify-center mb-1">
            <Icon icon="tabler:check" class="text-white w-6 h-6" />
          </div>
          <p class="text-gray-400 text-sm">Successful</p>
        </div>

        <dl class="mb-4">
          <div class="flex justify-between mb-2">
            <dt class="text-gray-400 text-sm">Order No.</dt>
            <dd class="text-black text-sm font-normal">{{ it.id }}</dd>
          </div>
          <div class="flex justify-between mb-2">
            <dt class="text-gray-400 text-sm">Date</dt>
            <dd class="text-black text-sm font-normal">{{ fmtDate(it.time_order) }}</dd>
          </div>
          <div class="flex justify-between mb-2">
            <dt class="text-gray-400 text-sm">Type</dt>
            <dd
              :class="it.jenis === 'BUY' ? 'text-[#3AA87D]' : 'text-red-500'"
              class="text-sm font-normal"
            >
              {{ it.jenis }}
            </dd>
          </div>
          <div class="flex justify-between mb-2">
            <dt class="text-gray-400 text-sm">Amount</dt>
            <dd class="text-black text-sm font-normal">
              {{ amountText(it) }}
            </dd>
          </div>
        </dl>

        <hr class="border-gray-300 mb-3" />

        <p class="font-semibold text-sm mb-3">Trade detail</p>
        <dl class="mb-4">
          <div class="flex justify-between mb-2">
            <dt class="text-gray-400 text-sm">Price Buy</dt>
            <dd class="text-black text-sm font-normal">
              <span v-if="it.jenis === 'BUY'">{{ fmtLastPrice(it.last_prices) }}</span>
              <span v-else>-</span>
            </dd>
          </div>

          <div class="flex justify-between mb-2">
            <dt class="text-gray-400 text-sm">Price Sell</dt>
            <dd class="text-black text-sm font-normal">
              <span v-if="it.jenis === 'SELL'">{{ fmtLastPrice(it.last_prices) }}</span>
              <span v-else>-</span>
            </dd>
          </div>

          <div class="flex justify-between mb-2">
            <dt class="text-gray-400 text-sm">PNL</dt>
            <dd
              :class="it.pnl?.startsWith('-') ? 'text-red-500' : 'text-[#3AA87D]'"
              class="text-sm font-normal"
            >
              {{ it.pnl || '--' }}
            </dd>
          </div>
        </dl>

        <hr class="border-gray-300 mb-3" />

        <dl class="mb-6">
          <div class="flex justify-between mb-2">
            <dt class="text-gray-400 text-sm">Fee</dt>
            <dd class="text-black text-sm font-normal">0.00</dd>
          </div>
          <div class="flex justify-between mb-2">
            <dt class="text-gray-400 text-sm">Tax</dt>
            <dd class="text-black text-sm font-normal">0.00</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-400 text-sm">Total</dt>
            <dd class="text-[#3AA87D] text-sm font-normal">
              {{ totalText(it) }}
            </dd>
          </div>
        </dl>

        <div class="flex justify-center">
          <img
            src="/img/vertical-logo.png"
            alt="OneLedger Logo"
            width="180"
            height="80"
            class="opacity-40"
          />
        </div>
      </main>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, onMounted } from 'vue'

type HistoryItem = {
  id: number | string
  id_users: number | string
  symbol: string
  jenis: 'BUY' | 'SELL' | string
  daily_pnl: string
  pnl: string // contoh: "-0.33%"
  last_prices: string // contoh: "119,523"
  balances?: string | number // legacy (jika masih ada)
  balances_buy?: string | number // USDT (BUY)
  balances_sell?: string | number // COIN (SELL, 8 desimal)
  detail_balances: string
  profit?: string | number // BUY: qty BTC; SELL: USDT
  status_position: number | string
  time_order: string // "YYYY-MM-DD HH:mm:ss" (UTC)
  created_at: string
  updated_at: string
}

const API_BASE = 'https://ledger.masmutdev.id/api'

const loading = ref(true)
const errorMsg = ref<string | null>(null)
const items = ref<HistoryItem[]>([])

/* Helpers --------------------------------------------------- */
function normalizeNumber(v: string | number): number {
  if (typeof v === 'number') return v
  if (typeof v === 'string') return Number(v.replace(/,/g, ''))
  return Number(v as any)
}

function fmtUsdt(n: number) {
  if (!Number.isFinite(n)) return '--'
  return `${n.toLocaleString('en-US', { maximumFractionDigits: 2 })} USDT`
}

function fmtCoin(n: number, sym: string) {
  if (!Number.isFinite(n)) return '--'
  return `${n.toFixed(8)} ${sym}`
}

function fmtLastPrice(s: string) {
  const n = normalizeNumber(s)
  if (!Number.isFinite(n)) return '--'
  return `${n.toLocaleString('en-US', { maximumFractionDigits: 2 })} USDT`
}

function fmtDate(s: string) {
  return s // tampilkan apa adanya (UTC)
}

/** Amount (baris "Amount"):
 *  - BUY  -> uang yang dibelanjakan (balances_buy, USDT)
 *  - SELL -> jumlah coin yang dijual (balances_sell, BTC)
 */
function amountText(it: HistoryItem) {
  if (it.jenis === 'BUY') {
    const val = Number(it.balances_buy ?? it.balances ?? 0)
    return fmtUsdt(val)
  } else {
    const qty = Number(it.balances_sell ?? 0)
    return fmtCoin(qty, it.symbol)
  }
}

/** Total:
 *  - BUY  -> profit = qty BTC didapat (8 desimal)
 *  - SELL -> profit = USDT diterima (2 desimal)
 *  fallback kalau profit tidak ada:
 *    - BUY: hitung qty ≈ balances_buy / last_price
 *    - SELL: hitung USDT ≈ balances_sell * last_price
 */
function totalText(it: HistoryItem) {
  const last = normalizeNumber(it.last_prices)
  if (it.jenis === 'BUY') {
    const qty = Number(it.profit ?? 0) || Number(it.balances_buy ?? 0) / (last || Infinity)
    return fmtCoin(qty, it.symbol)
  } else {
    const usdt = Number(it.profit ?? 0) || Number(it.balances_sell ?? 0) * (last || 0)
    return fmtUsdt(usdt)
  }
}

async function fetchHistory() {
  loading.value = true
  errorMsg.value = null
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Token tidak ada.')

    const res = await fetch(`${API_BASE}/crypto-history`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    if (!res.ok) {
      const t = await res.text()
      throw new Error(t || `Request failed (${res.status})`)
    }

    const data = await res.json()
    items.value = Array.isArray(data) ? data : []
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Gagal memuat data.'
    items.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchHistory)
</script>
