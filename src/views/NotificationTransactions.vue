<template>
  <div class="max-w-md mx-auto space-y-6 px-4">
    <!-- Loading / Error / Empty -->
    <div v-if="loading" class="text-gray-500 text-sm py-6 text-center">Loading…</div>
    <div v-else-if="errorMsg" class="text-red-500 text-sm py-6 text-center">{{ errorMsg }}</div>
    <div v-else-if="cards.length === 0" class="text-gray-500 text-sm py-6 text-center">
      No Data Available
    </div>

    <!-- List cards -->
    <template v-else>
      <div v-for="c in cards" :key="c.key" class="space-y-2">
        <div class="bg-gray-100 rounded-xl p-6">
          <h2 class="text-black text-xl font-semibold leading-snug">{{ c.title }}</h2>
          <p class="text-black text-base leading-relaxed mt-2">
            {{ c.message }}
          </p>
        </div>
        <p class="text-gray-400 text-sm leading-relaxed">{{ c.timeShort }}</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

type DepositRow = {
  jumlah: number
  status: number // 1=processing, 2=success, lainnya=unknown/failed
  timestamp: string // ISO8601, contoh "2025-08-08T07:39:14Z"
}

const loading = ref(true)
const errorMsg = ref<string | null>(null)
const rows = ref<DepositRow[]>([])

onMounted(async () => {
  loading.value = true
  errorMsg.value = null
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Unauthorized')

    const res = await fetch('https://ledger.masmutdev.id/api/wallet/deposits', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
    if (!res.ok) {
      const t = await res.text()
      throw new Error(t || `Request failed (${res.status})`)
    }
    const data: DepositRow[] = await res.json()
    rows.value = Array.isArray(data) ? data : []
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Failed to load'
    rows.value = []
  } finally {
    loading.value = false
  }
})

/* Helpers */
function formatUtc(s: string) {
  // tampilkan "YYYY-MM-DD HH:mm:ss (UTC)"
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(
    d.getUTCHours(),
  )}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} (UTC)`
}
function formatShortLocal(s: string) {
  // "MM/DD HH:mm:ss" lokal
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}:${pad(d.getSeconds())}`
}
function fmtAmount(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function statusTitle(st: number) {
  if (st === 1) return 'USDT Deposit Processing'
  if (st === 2) return 'USDT Deposit Successful'
  return 'USDT Deposit Update'
}

/* Map rows → cards untuk template */
const cards = computed(() =>
  rows.value.map((r, idx) => {
    const title = statusTitle(r.status)
    const timeUtc = formatUtc(r.timestamp)
    const msg =
      r.status === 2
        ? `You have successfully deposited ${fmtAmount(r.jumlah)} USDT at ${timeUtc}. If you do not recognize this activity, please contact us immediately.`
        : r.status === 1
          ? `Your deposit of ${fmtAmount(r.jumlah)} USDT is currently processing. If you do not recognize this activity, please contact us immediately.`
          : `Your deposit of ${fmtAmount(r.jumlah)} USDT has an update at ${timeUtc}. If you do not recognize this activity, please contact us immediately.`
    return {
      key: `${r.timestamp}-${idx}`,
      title,
      message: msg,
      timeShort: formatShortLocal(r.timestamp),
    }
  }),
)
</script>
