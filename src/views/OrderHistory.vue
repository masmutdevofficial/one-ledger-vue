<template>
  <div class="mx-5 mb-20">
    <div v-if="loading" class="text-sm text-gray-500 py-6 text-center">Loading history…</div>
    <div v-else-if="errorMsg" class="text-sm text-red-500 py-6 text-center">{{ errorMsg }}</div>
    <div v-else-if="items.length === 0" class="text-sm text-gray-500 py-6 text-center">
      Tidak ada history.
    </div>

    <div v-else class="space-y-6">
      <main v-for="it in items" :key="it.id" class="bg-[#F9FAFB] rounded-3xl p-6 flex-grow">
        <h1 class="text-center font-extrabold text-lg mb-3">
          {{ it.base }}/{{ it.quote || 'USDT' }}
        </h1>

        <div class="flex flex-col items-center mb-3">
          <div class="w-10 h-10 rounded-full flex items-center justify-center mb-1 bg-teal-500">
            <Icon icon="tabler:check" class="text-white w-6 h-6" />
          </div>
          <p class="text-gray-400 text-sm">{{ it.status }}</p>
        </div>

        <dl class="mb-4">
          <div class="flex justify-between mb-2">
            <dt class="text-gray-400 text-sm">Order No.</dt>
            <dd class="text-black text-sm font-normal">{{ it.id }}</dd>
          </div>
          <div class="flex justify-between mb-2">
            <dt class="text-gray-400 text-sm">Date</dt>
            <dd class="text-black text-sm font-normal">{{ fmtDate(it.executed_at) }}</dd>
          </div>
          <div class="flex justify-between mb-2">
            <dt class="text-gray-400 text-sm">Type</dt>
            <dd
              :class="it.side === 'BUY' ? 'text-[#3AA87D]' : 'text-red-500'"
              class="text-sm font-normal"
            >
              {{ it.type }} &middot; {{ it.side }}
            </dd>
          </div>
          <div class="flex justify-between mb-2">
            <dt class="text-gray-400 text-sm">Filled (Qty)</dt>
            <dd class="text-black text-sm font-normal">
              {{ fmtCoin(it.qty, it.base) }}
            </dd>
          </div>
        </dl>

        <hr class="border-gray-300 mb-3" />

        <p class="font-semibold text-sm mb-3">Trade detail</p>
        <dl class="mb-4">
          <div class="flex justify-between mb-2">
            <dt class="text-gray-400 text-sm">Price</dt>
            <dd class="text-black text-sm font-normal">{{ fmtUsdt(it.price) }}</dd>
          </div>

          <div class="flex justify-between mb-2">
            <dt class="text-gray-400 text-sm">Value</dt>
            <dd class="text-black text-sm font-normal">{{ fmtUsdt(it.value_usdt) }}</dd>
          </div>

          <div class="flex justify-between mb-2" v-if="it.side === 'SELL'">
            <dt class="text-gray-400 text-sm">Avg Cost (Before)</dt>
            <dd class="text-black text-sm font-normal">{{ fmtUsdt(it.avg_cost_before) }}</dd>
          </div>

          <div class="flex justify-between mb-2" v-if="it.side === 'SELL'">
            <dt class="text-gray-400 text-sm">Realized PnL</dt>
            <dd
              :class="Number(it.realized_pnl_usdt) < 0 ? 'text-red-500' : 'text-[#3AA87D]'"
              class="text-sm font-normal"
            >
              {{ fmtUsdt(it.realized_pnl_usdt) }}
              <span v-if="it.pnl_pct !== null"> ({{ fmtPct(it.pnl_pct) }}) </span>
            </dd>
          </div>
        </dl>

        <hr class="border-gray-300 mb-3" />

        <dl class="mb-6">
          <div class="flex justify-between mb-2">
            <dt class="text-gray-400 text-sm">Fee</dt>
            <dd class="text-black text-sm font-normal">{{ fmtUsdt(it.fee_usdt) }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-400 text-sm">Total</dt>
            <dd
              :class="it.side === 'BUY' ? 'text-red-600' : 'text-[#3AA87D]'"
              class="text-sm font-normal"
              title="BUY: USDT keluar (value+fee), SELL: USDT masuk (value-fee)"
            >
              {{ fmtUsdt(it.total_usdt) }}
            </dd>
          </div>
        </dl>

        <div class="flex justify-center">
          <img src="/img/vertical-logo.png" alt="Logo" width="180" height="80" class="opacity-40" />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, onMounted } from 'vue'

type Item = {
  id: number
  symbol: string
  base: string
  quote: string
  side: 'BUY' | 'SELL'
  type: 'Market' | string
  status: 'Filled' | string
  price: string | number
  qty: string | number
  value_usdt: string | number
  fee_usdt: string | number
  total_usdt: string | number
  avg_cost_before: string | number | null
  realized_pnl_usdt: string | number | null
  pnl_pct: string | number | null
  executed_at: string
}

const API_BASE = 'https://su.oneled.io/api'

const loading = ref(true)
const errorMsg = ref<string | null>(null)
const items = ref<Item[]>([])

function normalizeNumber(v: string | number | null): number {
  if (v === null || v === undefined) return NaN
  if (typeof v === 'number') return v
  return Number(String(v).replace(/,/g, ''))
}

function fmtUsdt(v: string | number | null) {
  const n = normalizeNumber(v)
  if (!Number.isFinite(n)) return '--'
  return `${n.toLocaleString('en-US', { maximumFractionDigits: 2 })} USDT`
}
function fmtCoin(v: string | number | null, sym: string) {
  const n = normalizeNumber(v)
  if (!Number.isFinite(n)) return '--'
  return `${n.toFixed(8)} ${sym}`
}
function fmtPct(v: string | number | null) {
  const n = normalizeNumber(v)
  if (!Number.isFinite(n)) return '--'
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}
function fmtDate(s: string) {
  // tampilkan lokal Asia/Jakarta
  try {
    const d = new Date(s)
    return d.toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return s
  }
}

async function fetchHistory() {
  loading.value = true
  errorMsg.value = null
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Token tidak ada.')

    const res = await fetch(`${API_BASE}/order-history`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    items.value = Array.isArray(data) ? data : []
  } catch (e: any) {
    errorMsg.value = e?.message || 'Gagal memuat data.'
    items.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchHistory)
</script>
