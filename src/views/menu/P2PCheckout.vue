<!-- PaymentPage.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter, useRoute } from 'vue-router'
import { useApiAlertStore } from '@/stores/apiAlert'

const router = useRouter()
const route = useRoute()
const modal = useApiAlertStore()

// ====== Query invoice_id ======
const invoiceId = computed<string | null>(() => {
  const raw = route.query.invoice_id
  return raw ? String(raw) : null
})

// ====== State umum ======
const pageError = ref<string | null>(null)
const invoiceValid = ref(false)
const invoiceStatus = ref<number | null>(null) // 1=Pending, 2=Approved, 3=Rejected
const invoiceApproved = computed(() => invoiceStatus.value === 2)

const transferredClicked = ref(false)
const rejectedSent = ref(false)

// ====== Data dari cek-invoice ======
type InvoiceData = {
  id: number
  order_id: string
  invoice: string
  keterangan: string
  jumlah: number
  status: number
  created_at: string
  advertiser_name: string | null
  account_name: string | null
  account_number: string | null
  account_bank: string | null
  totalDibayar: number
}
const invoiceData = ref<InvoiceData | null>(null)

// ====== Timer 30 menit (per-invoice) ======
const DURATION = 30 * 60 * 1000
const remaining = ref<number>(DURATION)
let startTime = 0
let timer: number | null = null

function lsKey(inv: string) {
  return `paymentStartTime:${inv}`
}
function getStartTime(inv: string): number {
  const k = lsKey(inv)
  const v = localStorage.getItem(k)
  if (v && !Number.isNaN(Number(v))) return Number(v)
  const legacy = localStorage.getItem('paymentStartTime')
  if (legacy && !Number.isNaN(Number(legacy))) {
    localStorage.setItem(k, legacy)
    localStorage.removeItem('paymentStartTime')
    return Number(legacy)
  }
  const now = Date.now()
  localStorage.setItem(k, String(now))
  return now
}
function clearTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}
const nf0 = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

const formattedJumlah = computed(() => {
  if (!invoiceData.value) return '—'
  return `Rp ${nf0.format(invoiceData.value.totalDibayar)}`
})

async function sendReject(inv: string) {
  if (rejectedSent.value) return
  rejectedSent.value = true
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Unauthorized.')
    await fetch('https://one-ledger.masmutpanel.my.id/api/update-deposit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ invoice: inv, status: 3 }),
    })
  } catch {
    /* abaikan */
  }
}

function updateRemaining() {
  if (!invoiceId.value) return
  if (invoiceApproved.value) {
    clearTimer()
    return
  }

  const now = Date.now()
  const diff = DURATION - (now - startTime)
  remaining.value = diff > 0 ? diff : 0
  if (remaining.value <= 0) {
    clearTimer()
    if (!transferredClicked.value && invoiceValid.value && !invoiceApproved.value) {
      sendReject(invoiceId.value)
      pageError.value = 'Payment Rejected'
    }
  }
}

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
  else router.push('/buy-p2p')
}

async function cancelOrder() {
  if (!invoiceId.value || !invoiceValid.value) {
    pageError.value = 'Invalid Invoice ID'
    return
  }
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Unauthorized.')
    await fetch('https://one-ledger.masmutpanel.my.id/api/delete-deposit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ invoice: invoiceId.value }),
    })
  } catch {
    /* abaikan */
  } finally {
    clearTimer()
    pageError.value = 'Invalid Invoice ID'
  }
}

// ====== CTA ======
function notifySellerClicked() {
  transferredClicked.value = true
  modal.open('Notified', 'Seller has been notified.')
}

// ====== Cek invoice ======
async function checkInvoice() {
  if (!invoiceId.value) {
    pageError.value = 'Invalid Invoice ID'
    return
  }
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Unauthorized.')

    const res = await fetch(
      `https://one-ledger.masmutpanel.my.id/api/cek-invoice?invoice=${encodeURIComponent(invoiceId.value)}`,
      { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } },
    )
    if (!res.ok) throw new Error('Invalid Invoice ID')

    const data = (await res.json()) as Partial<InvoiceData> & { status?: number }
    invoiceStatus.value = typeof data?.status === 'number' ? data.status! : null
    invoiceValid.value = true

    // simpan field yg diperlukan untuk tampilan
    invoiceData.value = {
      id: Number(data.id ?? 0),
      order_id: String(data.order_id ?? ''),
      invoice: String(data.invoice ?? ''),
      keterangan: String(data.keterangan ?? ''),
      jumlah: Number(data.jumlah ?? 0),
      status: Number(data.status ?? 0),
      created_at: String(data.created_at ?? ''),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      advertiser_name: (data as any).advertiser_name ?? null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      account_name: (data as any).account_name ?? null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      account_number: (data as any).account_number ?? null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      account_bank: (data as any).account_bank ?? null,
      totalDibayar: Number(data.totalDibayar ?? 0),
    }

    if (invoiceApproved.value) {
      clearTimer()
    }
  } catch {
    invoiceValid.value = false
    pageError.value = 'Invalid Invoice ID'
  }
}

// ====== Lifecycle ======
onMounted(async () => {
  await checkInvoice()
  if (invoiceValid.value && invoiceId.value && !invoiceApproved.value) {
    startTime = getStartTime(invoiceId.value)
    updateRemaining()
    timer = window.setInterval(updateRemaining, 1000)
  }
})
onBeforeUnmount(() => {
  clearTimer()
})
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header -->
    <header class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
      <button aria-label="Go back" class="text-black text-xl" @click="goBack">
        <Icon icon="tabler:arrow-left" width="24" height="24" />
      </button>

      <button v-if="!pageError" class="text-gray-400 text-sm underline" @click="cancelOrder">
        Cancel the Order
      </button>
    </header>

    <!-- ERROR PAGE -->
    <div v-if="pageError" class="flex-grow px-5 pt-10">
      <h1 class="text-center text-red-600 font-semibold">{{ pageError }}</h1>
    </div>

    <!-- NORMAL PAGE -->
    <main v-else class="flex-grow px-5 pt-5">
      <h1 class="text-xl font-normal mb-1">Open For Payment</h1>

      <template v-if="invoiceApproved">
        <p class="text-sm font-normal text-green-700">This deposit has been approved.</p>
      </template>
      <template v-else>
        <p class="text-xs font-normal mb-5">
          Order will be canceled in
          <span class="font-semibold">{{ formatTime(remaining) }}</span>
        </p>
      </template>

      <!-- Payment method (advertiser_name) -->
      <input
        type="text"
        readonly
        :value="invoiceData?.advertiser_name ?? ''"
        class="w-full rounded-lg border border-gray-300 px-4 py-3 mb-7 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-default"
        aria-label="Payment method"
      />

      <section class="space-y-5">
        <div>
          <!-- account_bank -->
          <p class="font-semibold text-sm mb-1">
            Transfer via: {{ invoiceData?.account_bank ?? '-' }}
          </p>
        </div>

        <div>
          <p class="text-gray-500 text-xs mb-0.5">You Pay</p>
          <div class="flex items-center justify-between">
            <!-- jumlah -->
            <p class="font-bold text-base">{{ formattedJumlah }}</p>
            <button
              aria-label="Copy amount"
              class="text-black text-lg"
              :disabled="!invoiceData"
              @click="copyText(String(invoiceData?.totalDibayar ?? ''), 'Amount')"
            >
              <Icon icon="tabler:copy" width="20" height="20" />
            </button>
          </div>
        </div>

        <div>
          <p class="text-gray-400 text-xs mb-0.5">Account Number</p>
          <div class="flex items-center justify-between">
            <!-- account_number -->
            <p class="text-sm font-normal">{{ invoiceData?.account_number ?? '—' }}</p>
            <button
              aria-label="Copy account number"
              class="text-black text-lg"
              :disabled="!invoiceData?.account_number"
              @click="copyText(invoiceData?.account_number ?? '', 'Account number')"
            >
              <Icon icon="tabler:copy" width="20" height="20" />
            </button>
          </div>
        </div>

        <div>
          <p class="text-gray-400 text-xs mb-0.5">Name</p>
          <div class="flex items-center justify-between">
            <!-- account_name -->
            <p class="text-sm font-normal">{{ invoiceData?.account_name ?? '—' }}</p>
            <button
              aria-label="Copy name"
              class="text-black text-lg"
              :disabled="!invoiceData?.account_name"
              @click="copyText(invoiceData?.account_name ?? '', 'Name')"
            >
              <Icon icon="tabler:copy" width="20" height="20" />
            </button>
          </div>
        </div>
      </section>

      <!-- Tombol disembunyikan jika approved -->
      <button
        v-if="!invoiceApproved"
        type="button"
        class="w-full mt-8 bg-[#00bf63] text-white text-base font-normal py-3 rounded-lg hover:bg-cyan-500"
        @click="notifySellerClicked"
      >
        Request Bank Details from Seller
      </button>
    </main>
  </div>
</template>
