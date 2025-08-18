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
const invoiceStatus = ref<number | null>(null) // ⬅️ status dari API cek-invoice (contoh: 1=Pending, 2=Approved, 3=Rejected)
const invoiceApproved = computed(() => invoiceStatus.value === 2)

const transferredClicked = ref(false)
const rejectedSent = ref(false)

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
  const legacy = localStorage.getItem('paymentStartTime') // fallback lama
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

async function sendReject(inv: string) {
  if (rejectedSent.value) return
  rejectedSent.value = true
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Unauthorized.')
    await fetch('https://ledger.masmutdev.id/api/update-deposit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ invoice: inv, status: 3 }),
    })
  } catch {
    // abaikan error server
  }
}

function updateRemaining() {
  if (!invoiceId.value) return
  // Jika sudah approved, hentikan timer & jangan reject
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
      // auto reject
      sendReject(invoiceId.value)
      pageError.value = 'Payment Rejected'
    }
  }
}

// ====== Copy helper (pakai modal) ======
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
    await fetch('https://ledger.masmutdev.id/api/delete-deposit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ invoice: invoiceId.value }),
    })
  } catch {
    // abaikan
  } finally {
    clearTimer()
    pageError.value = 'Invalid Invoice ID'
  }
}

// ====== CTA "Transferred, Notify Seller" ======
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
      `https://ledger.masmutdev.id/api/cek-invoice?invoice=${encodeURIComponent(invoiceId.value)}`,
      { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } },
    )
    if (!res.ok) throw new Error('Invalid Invoice ID')

    const data = await res.json().catch(() => ({}))
    // Asumsi server mengembalikan field `status`
    // 1 = Pending, 2 = Approved, 3 = Rejected (contoh)
    invoiceStatus.value = typeof data?.status === 'number' ? data.status : null
    invoiceValid.value = true

    // Jika approved, hentikan timer (tidak perlu hitung mundur)
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

      <!-- Jika approved, tampilkan keterangan English dan sembunyikan countdown + tombol -->
      <template v-if="invoiceApproved">
        <p class="text-sm font-normal text-green-700">This deposit has been approved.</p>
      </template>

      <template v-else>
        <p class="text-xs font-normal mb-5">
          Order will be canceled in
          <span class="font-semibold">{{ formatTime(remaining) }}</span>
        </p>
      </template>

      <input
        type="text"
        readonly
        value="LucasFastpay"
        class="w-full rounded-lg border border-gray-300 px-4 py-3 mb-7 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-default"
        aria-label="Payment method"
      />

      <section class="space-y-5">
        <div>
          <p class="font-semibold text-sm mb-1">Transfer via: BCA</p>
        </div>

        <div>
          <p class="text-gray-500 text-xs mb-0.5">You Pay</p>
          <div class="flex items-center justify-between">
            <p class="font-bold text-base">Rp1.622.400,00</p>
            <button
              aria-label="Copy amount"
              class="text-black text-lg"
              @click="copyText('1622400', 'Amount')"
            >
              <Icon icon="tabler:copy" width="20" height="20" />
            </button>
          </div>
        </div>

        <div>
          <p class="text-gray-400 text-xs mb-0.5">Account Number</p>
          <div class="flex items-center justify-between">
            <p class="text-sm font-normal">8171787955</p>
            <button
              aria-label="Copy account number"
              class="text-black text-lg"
              @click="copyText('8171787955', 'Account number')"
            >
              <Icon icon="tabler:copy" width="20" height="20" />
            </button>
          </div>
        </div>

        <div>
          <p class="text-gray-400 text-xs mb-0.5">Name</p>
          <div class="flex items-center justify-between">
            <p class="text-sm font-normal">Atit</p>
            <button
              aria-label="Copy name"
              class="text-black text-lg"
              @click="copyText('Atit', 'Name')"
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
        class="w-full mt-8 bg-cyan-400 text-white text-base font-normal py-3 rounded-lg hover:bg-cyan-500"
        @click="notifySellerClicked"
      >
        Transferred, Notify Seller
      </button>
    </main>
  </div>
</template>
