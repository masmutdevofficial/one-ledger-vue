<template>
  <div class="max-w-md mx-auto space-y-6 px-4 mb-20">
    <!-- Loading / Error / Empty -->
    <div v-if="loading" class="text-gray-500 text-[10px] py-6 text-center">Loading…</div>
    <div v-else-if="errorMsg" class="text-red-500 text-[9px] py-6 text-center">{{ errorMsg }}</div>
    <div v-else-if="cards.length === 0" class="text-gray-500 text-[10px] py-6 text-center">
      No Data Available
    </div>

    <!-- List cards -->
    <template v-else>
      <div v-for="c in cards" :key="c.key" class="space-y-2">
        <div class="bg-gray-100 rounded-xl p-6">
          <h2 class="text-black text-sm font-semibold leading-snug">{{ c.title }}</h2>
          <p class="text-black text-[10px] leading-relaxed mt-2">
            {{ c.message }}
          </p>
        </div>
        <p class="text-gray-400 text-[10px] leading-relaxed">{{ c.timeShort }}</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

/** === Types dari API === */
type DepositRow = {
  jumlah: number
  status: number // 1=processing, 2=success, lainnya=unknown/failed
  timestamp: string // ISO-8601 (UTC)
}
type WithdrawRow = {
  jumlah: number
  status: number // 1=processing, 2=success, lainnya=unknown/failed
  timestamp: string // ISO-8601 (UTC)
}
type TransferRow = {
  dari: number
  ke: number
  tipe: 'in' | 'out'
  jumlah: number
  note: string | null
  timestamp: string // ISO-8601 (UTC)
  dari_email?: string | null // NEW (opsional untuk backward-compat)
  ke_email?: string | null // NEW (opsional untuk backward-compat)
}

/** === UI State === */
const loading = ref(true)
const errorMsg = ref<string | null>(null)

const deposits = ref<DepositRow[]>([])
const withdraws = ref<WithdrawRow[]>([])
const transfers = ref<TransferRow[]>([])

/** === Fetch helper === */
async function fetchJson<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return (await res.json()) as T
}

onMounted(async () => {
  loading.value = true
  errorMsg.value = null
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Unauthorized')

    const base = 'https://su.oneled.io/api/wallet'
    const [dRes, wRes, tRes] = await Promise.allSettled([
      fetchJson<DepositRow[]>(`${base}/deposits`, token),
      fetchJson<WithdrawRow[]>(`${base}/withdraws`, token),
      fetchJson<TransferRow[]>(`${base}/transfers`, token),
    ])

    if (dRes.status === 'fulfilled' && Array.isArray(dRes.value)) deposits.value = dRes.value
    if (wRes.status === 'fulfilled' && Array.isArray(wRes.value)) withdraws.value = wRes.value
    if (tRes.status === 'fulfilled' && Array.isArray(tRes.value)) transfers.value = tRes.value

    // Kumpulkan error parsial jika ada
    const partialErrors: string[] = []
    if (dRes.status === 'rejected') partialErrors.push('deposits')
    if (wRes.status === 'rejected') partialErrors.push('withdraws')
    if (tRes.status === 'rejected') partialErrors.push('transfers')
    if (
      partialErrors.length &&
      !(deposits.value.length || withdraws.value.length || transfers.value.length)
    ) {
      // semua gagal
      throw new Error(`Failed to load: ${partialErrors.join(', ')}`)
    } else if (partialErrors.length) {
      errorMsg.value = `Partial error on: ${partialErrors.join(', ')}`
    }
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Failed to load'
    deposits.value = []
    withdraws.value = []
    transfers.value = []
  } finally {
    loading.value = false
  }
})

/** === Format helpers === */
function formatUtc(s: string) {
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(
    d.getUTCHours(),
  )}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} (UTC)`
}
function formatShortLocal(s: string) {
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

/** === Title builders === */
function depositTitle(st: number) {
  if (st === 1) return 'USDT Deposit Processing'
  if (st === 2) return 'USDT Deposit Successful'
  return 'USDT Deposit Update'
}
function withdrawTitle(st: number) {
  if (st === 1) return 'USDT Withdrawal Processing'
  if (st === 2) return 'USDT Withdrawal Successful'
  return 'USDT Withdrawal Update'
}
function transferTitle(t: TransferRow) {
  return t.tipe === 'in' ? 'USDT Transfer Received' : 'USDT Transfer Sent'
}

/** === Cards === */
type Card = {
  key: string
  title: string
  message: string
  timeShort: string
  timestamp: string // untuk sorting
}

function cardFromDeposit(r: DepositRow, idx: number): Card {
  const timeUtc = formatUtc(r.timestamp)
  const msg =
    r.status === 2
      ? `You have successfully deposited ${fmtAmount(r.jumlah)} USDT at ${timeUtc}. If you do not recognize this activity, please contact us immediately.`
      : r.status === 1
        ? `Your deposit of ${fmtAmount(r.jumlah)} USDT is currently processing. If you do not recognize this activity, please contact us immediately.`
        : `Your deposit of ${fmtAmount(r.jumlah)} USDT has an update at ${timeUtc}. If you do not recognize this activity, please contact us immediately.`
  return {
    key: `dep-${r.timestamp}-${idx}`,
    title: depositTitle(r.status),
    message: msg,
    timeShort: formatShortLocal(r.timestamp),
    timestamp: r.timestamp,
  }
}

function cardFromWithdraw(r: WithdrawRow, idx: number): Card {
  const timeUtc = formatUtc(r.timestamp)
  const msg =
    r.status === 2
      ? `You have successfully withdrawn ${fmtAmount(r.jumlah)} USDT at ${timeUtc}. If you do not recognize this activity, please contact us immediately.`
      : r.status === 1
        ? `Your withdrawal of ${fmtAmount(r.jumlah)} USDT is currently processing. If you do not recognize this activity, please contact us immediately.`
        : `Your withdrawal of ${fmtAmount(r.jumlah)} USDT has an update at ${timeUtc}. If you do not recognize this activity, please contact us immediately.`
  return {
    key: `wd-${r.timestamp}-${idx}`,
    title: withdrawTitle(r.status),
    message: msg,
    timeShort: formatShortLocal(r.timestamp),
    timestamp: r.timestamp,
  }
}

function cardFromTransfer(r: TransferRow, idx: number): Card {
  const timeUtc = formatUtc(r.timestamp)

  // pakai email jika ada, kalau tidak fallback ke user #id
  const hasFromEmail = typeof r.dari_email === 'string' && r.dari_email.trim().length > 0
  const hasToEmail = typeof r.ke_email === 'string' && r.ke_email.trim().length > 0

  const counterpart =
    r.tipe === 'in'
      ? hasFromEmail
        ? `from ${r.dari_email!.trim()}`
        : `from user #${r.dari}`
      : hasToEmail
        ? `to ${r.ke_email!.trim()}`
        : `to user #${r.ke}`

  const note = r.note ? ` Note: ${r.note}` : ''

  const msg =
    r.tipe === 'in'
      ? `You received ${fmtAmount(r.jumlah)} USDT ${counterpart} at ${timeUtc}.${note}`
      : `You sent ${fmtAmount(r.jumlah)} USDT ${counterpart} at ${timeUtc}.${note}`

  return {
    key: `tf-${r.timestamp}-${idx}`,
    title: transferTitle(r),
    message: msg,
    timeShort: formatShortLocal(r.timestamp),
    timestamp: r.timestamp,
  }
}

/** Gabung semua rows -> cards lalu sort desc by timestamp */
const cards = computed<Card[]>(() => {
  const a: Card[] = []
  deposits.value.forEach((r, i) => a.push(cardFromDeposit(r, i)))
  withdraws.value.forEach((r, i) => a.push(cardFromWithdraw(r, i)))
  transfers.value.forEach((r, i) => a.push(cardFromTransfer(r, i)))
  return a.sort((x, y) => new Date(y.timestamp).getTime() - new Date(x.timestamp).getTime())
})
</script>
