<!-- TradeHistoryCard.vue -->
<template>
  <div class="mx-5 mb-20">
    <div v-if="loading" class="text-sm text-gray-500 py-6 text-center">Loading history…</div>
    <div v-else-if="errorMsg" class="text-sm text-red-500 py-6 text-center">{{ errorMsg }}</div>
    <div v-else-if="list.length === 0" class="text-sm text-gray-500 py-6 text-center">Tidak ada history.</div>

    <div v-else class="space-y-6">
      <section v-for="it in list" :key="it.id" class="bg-[#F9FAFB] rounded-3xl p-6">
        <!-- Pair -->
        <h1 class="text-center font-extrabold text-lg mb-3">
          {{ it.coin }}
        </h1>

        <!-- Status -->
        <div class="flex flex-col items-center mb-4">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center mb-1"
            :class="it.pnl_usdt >= 0 ? 'bg-teal-500' : 'bg-red-500'"
          >
            <Icon :icon="it.pnl_usdt >= 0 ? 'tabler:check' : 'tabler:x'" class="text-white w-6 h-6" />
          </div>
          <p class="text-sm" :class="it.pnl_usdt >= 0 ? 'text-teal-600' : 'text-red-500'">
            {{ it.pnl_usdt >= 0 ? 'Success' : 'Failed' }}
          </p>
        </div>

        <!-- Top details -->
        <dl class="mb-4">
          <div class="flex justify-between mb-2">
            <dt class="text-gray-400 text-sm">Date</dt>
            <dd class="text-black text-sm font-normal">{{ it.created_at }}</dd>
          </div>
          <div class="flex justify-between mb-2">
            <dt class="text-gray-400 text-sm">Type</dt>
            <dd class="text-sm font-normal" :class="it.type.includes('Buy') ? 'text-[#3AA87D]' : 'text-red-500'">
              {{ it.type }}
            </dd>
          </div>
          <div class="flex justify-between mb-2">
            <dt class="text-gray-400 text-sm">Leverage</dt>
            <dd class="text-black text-sm font-normal">{{ it.leverage }}x</dd>
          </div>
        </dl>

        <hr class="border-gray-300 mb-3" />

        <!-- Trade detail -->
        <p class="font-semibold text-sm mb-3">Trade detail</p>
        <dl class="mb-4">
          <div class="flex justify-between mb-2">
            <dt class="text-gray-400 text-sm">Margin USDT</dt>
            <dd class="text-black text-sm font-normal">{{ fmtUsdt(it.margin_usdt) }}</dd>
          </div>
          <div class="flex justify-between mb-2">
            <dt class="text-gray-400 text-sm">Size USDT</dt>
            <dd class="text-black text-sm font-normal">{{ fmtUsdt(it.size_usdt) }}</dd>
          </div>
        </dl>

        <hr class="border-gray-300 mb-3" />

        <dl class="mb-6">
          <div class="flex justify-between mb-2">
            <dt class="text-gray-400 text-sm">Type SL</dt>
            <dd class="text-black text-sm font-normal">{{ it.type_sl }}</dd>
          </div>

          <div class="flex justify-between">
            <dt class="text-gray-400 text-sm">PNL USDT</dt>
            <dd class="text-sm font-semibold" :class="it.pnl_usdt >= 0 ? 'text-[#3AA87D]' : 'text-red-500'">
              {{ it.pnl_usdt >= 0 ? '+' : '' }}{{ fmtUsdt(it.pnl_usdt) }}
            </dd>
          </div>
        </dl>

        <div class="flex justify-center">
          <img src="/img/vertical-logo.png" alt="Logo" width="180" height="80" class="opacity-40" />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'

/** --- API base + helper --- */
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
  return JSON.parse(text)
}

/** --- Types yang dipakai UI --- */
type HistoryItem = {
  id: number | string
  coin: string
  created_at: string
  leverage: number
  margin_usdt: number
  size_usdt: number
  type_sl: string
  pnl_usdt: number
  type: string // "Buy/Long" | "Sell/Short"
}

/** --- State --- */
const route = useRoute()
const items = ref<HistoryItem[]>([])
const loading = ref(true)
const errorMsg = ref<string | null>(null)

/** --- Utils --- */
const fmtUsdt = (v: number) =>
  `${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`

/** Robust mapper: handle dua kemungkinan bentuk response (baru vs lama) */
function toHistoryItem(r: Record<string, unknown>): HistoryItem {
  const coin = String((r.coin ?? `${r.base ?? ''}/${r.quote ?? 'USDT'}`) || 'USDT')
  const created_at = String(r.created_at ?? '')
  const leverage = Number(r.leverage ?? r.tp ?? r.take_profit ?? 0)
  const amount = Number(r.margin_usdt ?? r.amount ?? 0)
  const size = Number(r.size_usdt ?? leverage * amount)
  // status: 2=Win, 3=Lose (jika ada)
  const statusNum = Number(r.status ?? 0)
  const computedPnl = size / 100
  const pnl_usdt =
    typeof r.pnl_usdt === 'number'
      ? Number(r.pnl_usdt)
      : statusNum === 3
      ? -computedPnl
      : computedPnl

  const type =
    typeof r.type === 'string'
      ? (r.type as string)
      : pnl_usdt >= 0
      ? 'Buy/Long'
      : 'Sell/Short'

  return {
    id: (r.id as number) ?? String(Math.random()),
    coin,
    created_at,
    leverage,
    margin_usdt: amount,
    size_usdt: size,
    type_sl: String(r.type_sl ?? 'Member-Based Equity SL'),
    pnl_usdt,
    type,
  }
}

/** --- Load --- */
async function load() {
  loading.value = true
  errorMsg.value = null
  items.value = []
  try {
    const username = String(route.params.username || '').trim()
    if (!username) throw new Error('Missing slug/username in route.')
    const resp = await authFetch(`/win-lose/history?slug=${encodeURIComponent(username)}`)
    if (resp.status !== 'success' || !Array.isArray(resp.data)) throw new Error('Unexpected response')

    items.value = (resp.data as Record<string, unknown>[]).map(toHistoryItem)
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : 'Failed to load'
  } finally {
    loading.value = false
  }
}

onMounted(load)

/** List untuk template */
const list = computed(() => items.value)
</script>
