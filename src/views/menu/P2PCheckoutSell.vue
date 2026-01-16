<!-- WithdrawStatusPage.vue (menggantikan PaymentPage.vue) -->
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter, useRoute } from 'vue-router'
import { useApiAlertStore } from '@/stores/apiAlert'

const router = useRouter()
const route = useRoute()
const modal = useApiAlertStore()

// ====== Query order_id ======
const orderId = computed<string | null>(() => {
  const raw = route.query.order_id
  return raw ? String(raw) : null
})

// ====== State umum ======
const pageError = ref<string | null>(null)
const loading = ref(true)

// ====== Data dari /withdraws/status ======
type WithdrawStatusResp = {
  order_id: string
  invoice: string
  status: 1 | 2 | 3
  status_label: 'pending' | 'approved' | 'rejected'
  success: boolean
  message: string

  amount?: number
  payment_method?: string | null
  via_bank?: string | null
  norek?: string | null
  pemilik?: string | null
  network?: string | null
  network_address?: string | null
  created_at?: string
  updated_at?: string
}

const data = ref<WithdrawStatusResp | null>(null)

const isPending = computed(() => data.value?.status === 1)
const isApproved = computed(() => data.value?.status === 2)
const isRejected = computed(() => data.value?.status === 3)

const badgeText = computed(() =>
  isApproved.value ? 'Approved' : isRejected.value ? 'Rejected' : 'Pending',
)
const badgeClass = computed(() =>
  isApproved.value
    ? 'bg-green-100 text-green-700 border-green-200'
    : isRejected.value
      ? 'bg-red-100 text-red-700 border-red-200'
      : 'bg-yellow-50 text-yellow-700 border-yellow-200',
)

const nf2 = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const amountDisplay = computed(() => {
  const n = Number(data.value?.amount ?? 0)
  return nf2.format(Number.isFinite(n) ? n : 0)
})

// ====== Copy helper ======
async function copyText(value: string, fieldLabel?: string) {
  try {
    await navigator.clipboard.writeText(value)
    modal.open(fieldLabel ? `${fieldLabel} copied` : 'Copied', 'Successfully copied to clipboard.')
  } catch {
    modal.open('Copy failed', 'Unable to copy to clipboard.')
  }
}

// ====== Header actions ======
function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/p2p-list')
}

// ====== Cek status (poll 15 detik) ======
let pollHandle: number | null = null
const POLL_MS = 15_000

async function fetchStatus() {
  if (!orderId.value) {
    pageError.value = 'Invalid order_id'
    loading.value = false
    return
  }
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Unauthorized.')

    // Pakai endpoint query-string: /withdraws/status?order_id=...
    const res = await fetch(
      `https://tech.oneled.io/api/withdraws/status?order_id=${encodeURIComponent(orderId.value)}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (res.status === 404) {
      throw new Error('Withdrawal not found.')
    }
    if (res.status === 403) {
      throw new Error('Forbidden.')
    }
    if (res.status === 401) {
      throw new Error('Unauthorized.')
    }
    if (!res.ok) {
      let msg = `HTTP ${res.status}`
      try {
        const j = await res.json()
        if (j?.message) msg = j.message
      } catch {}
      throw new Error(msg)
    }

    const j = (await res.json()) as WithdrawStatusResp
    data.value = j
    pageError.value = null
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to check withdraw status.'
    pageError.value = msg
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchStatus()
  // Polling tiap 15 detik
  pollHandle = window.setInterval(fetchStatus, POLL_MS)
})
onBeforeUnmount(() => {
  if (pollHandle) clearInterval(pollHandle)
})
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header -->
    <header class="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
      <button aria-label="Go back" class="text-black text-xl" @click="goBack">
        <Icon icon="tabler:arrow-left" width="24" height="24" />
      </button>
      <h1 class="text-base font-semibold">Withdraw Status</h1>
    </header>

    <!-- States -->
    <div v-if="loading" class="p-4 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="pageError" class="p-4 text-center text-xs text-red-500">{{ pageError }}</div>

    <!-- Main -->
    <main v-else class="flex-grow px-4 pt-5 pb-8">
      <section class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <!-- Status Badge -->
        <div class="flex items-center justify-between mb-4">
          <div class="font-semibold text-gray-900">Withdrawal</div>
          <span
            class="text-xs font-semibold px-2.5 py-1 rounded-md border"
            :class="badgeClass"
            aria-live="polite"
          >
            {{ badgeText }}
          </span>
        </div>

        <!-- Ringkasan penting -->
        <div class="grid grid-cols-1 gap-3 text-sm">
          <div class="flex items-center justify-between">
            <span class="text-gray-500">Order ID</span>
            <div class="flex items-center gap-2">
              <span class="font-semibold text-gray-900">{{ data?.order_id || '—' }}</span>
              <button
                aria-label="Copy order id"
                class="text-gray-500 hover:text-gray-700"
                :disabled="!data?.order_id"
                @click="copyText(data?.order_id || '', 'Order ID')"
              >
                <Icon icon="tabler:copy" width="18" height="18" />
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-gray-500">Amount</span>
            <span class="font-semibold text-gray-900">{{ amountDisplay }}</span>
          </div>

          <div class="flex items-center justify-between" v-if="data?.payment_method">
            <span class="text-gray-500">Payment Method</span>
            <span class="font-semibold text-gray-900">{{ data?.payment_method }}</span>
          </div>

          <div v-if="data?.via_bank" class="flex items-center justify-between">
            <span class="text-gray-500">Bank</span>
            <span class="font-semibold text-gray-900">{{ data?.via_bank }}</span>
          </div>

          <div v-if="data?.norek" class="flex items-center justify-between">
            <span class="text-gray-500">Account Number</span>
            <div class="flex items-center gap-2">
              <span class="font-semibold text-gray-900">{{ data?.norek }}</span>
              <button
                aria-label="Copy account number"
                class="text-gray-500 hover:text-gray-700"
                @click="copyText(data?.norek || '', 'Account number')"
              >
                <Icon icon="tabler:copy" width="18" height="18" />
              </button>
            </div>
          </div>

          <div v-if="data?.pemilik" class="flex items-center justify-between">
            <span class="text-gray-500">Account Name</span>
            <div class="flex items-center gap-2">
              <span class="font-semibold text-gray-900">{{ data?.pemilik }}</span>
              <button
                aria-label="Copy account name"
                class="text-gray-500 hover:text-gray-700"
                @click="copyText(data?.pemilik || '', 'Name')"
              >
                <Icon icon="tabler:copy" width="18" height="18" />
              </button>
            </div>
          </div>

          <div v-if="data?.network" class="flex items-center justify-between">
            <span class="text-gray-500">Network</span>
            <span class="font-semibold text-gray-900">{{ data?.network }}</span>
          </div>

          <div v-if="data?.network_address" class="flex items-center justify-between">
            <span class="text-gray-500">Address</span>
            <div class="flex items-center gap-2">
              <span class="font-semibold text-gray-900 truncate max-w-[180px]">{{
                data?.network_address
              }}</span>
              <button
                aria-label="Copy address"
                class="text-gray-500 hover:text-gray-700"
                @click="copyText(data?.network_address || '', 'Address')"
              >
                <Icon icon="tabler:copy" width="18" height="18" />
              </button>
            </div>
          </div>

          <div class="pt-2 text-xs text-gray-500">
            <div v-if="data?.created_at">
              Created: <b class="text-gray-800">{{ data.created_at }}</b>
            </div>
            <div v-if="data?.updated_at">
              Updated: <b class="text-gray-800">{{ data.updated_at }}</b>
            </div>
          </div>
        </div>

        <!-- Pesan status -->
        <p class="mt-4 text-xs" :class="isRejected ? 'text-red-600' : 'text-gray-500'">
          {{ data?.message || '' }}
        </p>
      </section>
    </main>
  </div>
</template>
