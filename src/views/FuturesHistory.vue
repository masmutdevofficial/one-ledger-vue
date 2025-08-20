<template>
  <button
    aria-label="Back"
    class="mb-4 ml-4 inline-flex items-center text-black"
    type="button"
    @click="goBack"
  >
    <Icon icon="tabler:arrow-left" class="w-6 h-6" />
  </button>
  <div class="flex flex-col p-5">
    <!-- Back -->

    <div v-if="loading" class="text-sm text-gray-500 py-10 text-center">Loading…</div>
    <div v-else-if="errorMsg" class="text-sm text-red-500 py-10 text-center">{{ errorMsg }}</div>
    <div v-else-if="rows.length === 0" class="text-sm text-gray-500 py-10 text-center">
      No history
    </div>

    <div v-else class="space-y-4">
      <div v-for="r in rows" :key="r.id">
        <div class="flex justify-between text-gray-900 font-normal text-sm leading-5">
          <span>Open position</span>
          <span>Take profit/Stop lose</span>
        </div>
        <div class="flex justify-between text-gray-500 font-normal text-xs leading-4 mt-1">
          <span>{{ fmtDateTime(r.created_at) }}</span>
          <span
            :class="[
              'font-semibold',
              Number(r.status) === 2
                ? 'text-green-600'
                : Number(r.status) === 3
                  ? 'text-red-600'
                  : 'text-gray-500',
            ]"
          >
            PNL/ROI {{ signedFixed(calcPnl(r), 4) }} ({{ Number(r.take_profit) }}%)
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/copy')
}

// --- API base + helper (plain + token) ---
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

// --- types ---
type Row = {
  id: number
  id_users: number
  id_copy_traders: number
  amount: string | number
  take_profit: number
  stop_loss: number
  status: number // 2 win, 3 lose
  order_time: number
  created_at: string
  updated_at: string
}

// --- state ---
const route = useRoute()
const rows = ref<Row[]>([])
const loading = ref(true)
const errorMsg = ref<string | null>(null)

// --- utils ---
function fmtDateTime(s: string) {
  // server returns "YYYY-MM-DD HH:mm:ss"
  return s
}

function calcPnl(r: Row): number {
  const amount = parseFloat(String(r.amount))
  const tp = parseFloat(String(r.take_profit))
  if (!Number.isFinite(amount) || !Number.isFinite(tp)) return 0
  const gross = amount * (tp / 100) // e.g. 10 * 10% = 1
  const st = Number(r.status)
  return st === 2 ? gross : st === 3 ? -gross : 0
}

function signedFixed(n: number, dp = 4): string {
  const sign = n >= 0 ? '+' : '-'
  return sign + Math.abs(n).toFixed(dp)
}
// --- load ---
async function load() {
  loading.value = true
  errorMsg.value = null
  rows.value = []
  try {
    const username = String(route.params.username || '').trim()
    if (!username) throw new Error('Missing slug/username in route.')
    const data = await authFetch(`/win-lose/history?slug=${encodeURIComponent(username)}`)
    if (data.status !== 'success') throw new Error('Unexpected response')
    rows.value = data.data as Row[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    errorMsg.value = e?.message ?? 'Failed to load'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
