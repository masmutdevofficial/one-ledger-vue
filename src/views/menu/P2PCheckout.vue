<!-- PaymentPage.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter, useRoute } from 'vue-router'
import { useApiAlertStore } from '@/stores/apiAlert'

// ====== Router & Store ======
const router = useRouter()
const route = useRoute()
const alert = useApiAlertStore()

// ====== Query invoice_id (string kosong jika tidak ada) ======
const invoiceId = computed(() => String(route.query.invoice_id ?? ''))

// ====== State umum ======
const pageError = ref<string | null>(null)
const invoiceValid = ref(false)
const invoiceStatus = ref<number | null>(null) // 1=Pending, 2=Approved, 3=Rejected
const invoiceApproved = computed(() => invoiceStatus.value === 2)
const refresh = () => router.go(0)

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

// ====== Upload bukti ======
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const showUploadModal = ref(false)
const uploading = ref(false)

const API_BASE = 'https://su.oneled.io'
const getToken = () => localStorage.getItem('token') || ''

function triggerFileSelect() {
  fileInput.value?.click()
}
function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files && files[0]) {
    selectedFile.value = files[0]
    showUploadModal.value = true
  }
}
function cancelUpload() {
  showUploadModal.value = false
}
function formatSize(bytes?: number) {
  if (bytes == null) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let v = bytes
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`
}
async function confirmUpload() {
  if (!selectedFile.value) {
    alert.open('No file selected', 'Please choose a file to upload.')
    return
  }
  if (!invoiceId.value) {
    alert.open('Missing invoice', 'invoice_id is required in URL.')
    return
  }

  uploading.value = true
  try {
    const form = new FormData()
    form.append('file', selectedFile.value)

    const res = await fetch(
      `${API_BASE}/api/deposit/${encodeURIComponent(invoiceId.value)}/bukti`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: 'application/json',
        },
        body: form,
      },
    )

    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data?.message || 'Upload failed')

    showUploadModal.value = false
    alert.open('Success', 'Proof uploaded successfully.')
  } catch (err: any) {
    alert.open('Upload error', err?.message || 'Failed to upload file.')
  } finally {
    uploading.value = false
  }
}

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
    await fetch(`${API_BASE}/api/update-deposit`, {
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
      pageError.value =
        'Payment rejected Or Complete your pending order before creating a new request.'
    }
  }
}

// ====== Copy helper ======
async function copyText(value: string, fieldLabel?: string) {
  try {
    await navigator.clipboard.writeText(value)
    alert.open(fieldLabel ? `${fieldLabel} copied` : 'Copied', 'Successfully copied to clipboard.')
  } catch {
    alert.open('Copy failed', 'Unable to copy to clipboard.')
  }
}

// ====== Header actions ======
function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/buy-p2p')
}
async function cancelOrder() {
  if (!invoiceId.value || !invoiceValid.value) {
    pageError.value = 'Your Order Has Been Canceled'
    return
  }
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Unauthorized.')
    await fetch(`${API_BASE}/api/delete-deposit`, {
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
    pageError.value = 'Your Order Has Been Canceled'
  }
}

// ====== CTA ======
function notifySellerClicked() {
  transferredClicked.value = true
  alert.open('Notified', 'Seller has been notified.')
}

// ====== Cek invoice (load awal) ======
async function checkInvoice() {
  if (!invoiceId.value) {
    pageError.value = 'Invalid Invoice ID'
    return
  }
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Unauthorized.')

    const res = await fetch(
      `${API_BASE}/api/cek-invoice?invoice=${encodeURIComponent(invoiceId.value)}`,
      {
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        cache: 'no-store',
      },
    )
    if (!res.ok) throw new Error('Invalid Invoice ID')

    const data = (await res.json()) as Partial<InvoiceData> & { status?: number }
    invoiceStatus.value = typeof data?.status === 'number' ? data.status! : null
    invoiceValid.value = true

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

    if (invoiceApproved.value) clearTimer()
  } catch {
    invoiceValid.value = false
    pageError.value = 'Invalid Invoice ID'
  }
}

/* ====== Polling invoice fields (5s) ======
   - refresh: status, account_number, account_name, account_bank, totalDibayar
   - stop saat approved / tab hidden / unmount
*/
const INVOICE_POLL_MS = 5000
let pollTimer: number | null = null
let pollBusy = false
let inFlightCtrl: AbortController | null = null

async function pollInvoiceLight() {
  if (!invoiceId.value) return
  if (pollBusy) return
  if (document.hidden) return

  pollBusy = true
  inFlightCtrl?.abort()
  inFlightCtrl = new AbortController()

  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Unauthorized.')

    const res = await fetch(
      `${API_BASE}/api/cek-invoice?invoice=${encodeURIComponent(invoiceId.value)}`,
      {
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        cache: 'no-store',
        signal: inFlightCtrl.signal,
      },
    )
    if (!res.ok) throw new Error('HTTP ' + res.status)

    const data = (await res.json()) as Partial<InvoiceData> & { status?: number }

    // update status
    const newStatus = typeof data?.status === 'number' ? data.status! : null
    const wasApproved = invoiceApproved.value
    invoiceStatus.value = newStatus

    // update fields yang ditampilkan (hanya jika berubah)
    if (invoiceData.value) {
      const next: InvoiceData = {
        ...invoiceData.value,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        account_name: (data as any)?.account_name ?? invoiceData.value.account_name,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        account_number: (data as any)?.account_number ?? invoiceData.value.account_number,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        account_bank: (data as any)?.account_bank ?? invoiceData.value.account_bank,
        totalDibayar:
          typeof data.totalDibayar === 'number'
            ? Number(data.totalDibayar)
            : invoiceData.value.totalDibayar,
        status: typeof data.status === 'number' ? Number(data.status) : invoiceData.value.status,
      }

      // assign hanya jika ada perubahan supaya re-render hemat
      const changed =
        next.account_name !== invoiceData.value.account_name ||
        next.account_number !== invoiceData.value.account_number ||
        next.account_bank !== invoiceData.value.account_bank ||
        next.totalDibayar !== invoiceData.value.totalDibayar ||
        next.status !== invoiceData.value.status

      if (changed) invoiceData.value = next
    } else {
      // jika sebelumnya null (kasus edge), isi minimal
      invoiceData.value = {
        id: Number(data.id ?? 0),
        order_id: String(data.order_id ?? ''),
        invoice: String(data.invoice ?? ''),
        keterangan: String(data.keterangan ?? ''),
        jumlah: Number(data.jumlah ?? 0),
        status: Number(data.status ?? 0),
        created_at: String(data.created_at ?? ''),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        advertiser_name: (data as any)?.advertiser_name ?? null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        account_name: (data as any)?.account_name ?? null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        account_number: (data as any)?.account_number ?? null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        account_bank: (data as any)?.account_bank ?? null,
        totalDibayar: Number(data.totalDibayar ?? 0),
      }
    }

    // jika baru jadi approved, hentikan timer & polling
    if (!wasApproved && invoiceApproved.value) {
      clearTimer()
      stopInvoicePolling()
    }
  } catch {
    // diamkan error polling
  } finally {
    pollBusy = false
  }
}

function startInvoicePolling() {
  if (pollTimer !== null) return
  // trigger sekali di awal
  void pollInvoiceLight()
  pollTimer = window.setInterval(() => {
    void pollInvoiceLight()
  }, INVOICE_POLL_MS) as unknown as number
}
function stopInvoicePolling() {
  if (pollTimer !== null) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  inFlightCtrl?.abort()
}

// ====== Lifecycle ======
onMounted(async () => {
  await checkInvoice()

  if (invoiceValid.value && invoiceId.value && !invoiceApproved.value) {
    startTime = getStartTime(invoiceId.value)
    updateRemaining()
    timer = window.setInterval(updateRemaining, 1000)

    // mulai polling ringan tiap 5 detik
    startInvoicePolling()
  }

  // hentikan polling saat tab tidak aktif; lanjut saat aktif lagi
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopInvoicePolling()
    else if (invoiceValid.value && !invoiceApproved.value) startInvoicePolling()
  })
})

onBeforeUnmount(() => {
  clearTimer()
  stopInvoicePolling()
})
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header -->
    <header class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
      <!-- Kiri: tombol back + judul & status -->
      <div class="flex items-center gap-3 min-w-0">
        <button aria-label="Go back" class="text-black" @click="goBack">
          <Icon icon="tabler:arrow-left" width="24" height="24" />
        </button>

        <div class="flex flex-col min-w-0">
          <h1 class="text-lg font-medium leading-tight truncate">Open For Payment</h1>

          <template v-if="invoiceApproved">
            <p class="text-xs text-green-700">This deposit has been approved.</p>
          </template>
          <template v-else>
            <p class="text-xs text-gray-600">
              Order will be canceled in
              <span class="font-semibold">{{ formatTime(remaining) }}</span>
            </p>
          </template>
        </div>
      </div>

      <!-- Kanan: aksi -->
      <div class="flex flex-col items-end mr-1 gap-3 min-w-0">
        <button
          v-if="!pageError"
          class="text-gray-500 text-sm underline shrink-0"
          @click="cancelOrder"
        >
          Cancel the Order
        </button>

        <button
          type="button"
          class="text-gray-500 text-sm underline shrink-0 inline-flex items-center gap-1"
          @click="refresh"
        >
          Refresh
          <img src="/img/refresh.png" alt="Refresh" class="w-4 h-4 object-contain" />
        </button>
      </div>
    </header>

    <!-- ERROR PAGE -->
    <div v-if="pageError" class="flex-grow px-5 pt-10">
      <h1 class="text-center text-[#d9d9d9] font-bold">{{ pageError }}</h1>
    </div>

    <!-- NORMAL PAGE -->
    <main v-else class="flex-grow px-5 pt-5">
      <!-- Payment method (advertiser_name) -->
      <input
        type="text"
        readonly
        :value="invoiceData?.advertiser_name ?? ''"
        class="w-full rounded-lg border border-gray-300 px-4 py-3 mb-7 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-default"
        aria-label="Payment method"
      />

      <section class="space-y-5">
        <!-- Bar info + upload -->
        <div class="flex items-center relative">
          <p class="font-semibold text-sm m-0 truncate flex-1">
            Transfer via: {{ invoiceData?.account_bank ?? '-' }}
          </p>

          <!-- Trigger pilih file -->
          <img
            src="/img/upload.png"
            alt="Upload"
            class="absolute h-7 w-[120px] object-contain -right-5 cursor-pointer"
            @click="triggerFileSelect"
          />

          <!-- Input file tersembunyi -->
          <input
            ref="fileInput"
            type="file"
            accept="image/*,application/pdf"
            class="hidden"
            @change="onFileChange"
          />
        </div>

        <!-- Modal konfirmasi upload -->
        <div
          v-if="showUploadModal"
          class="fixed inset-0 z-[60] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          <div class="absolute inset-0 bg-black/30" @click="cancelUpload"></div>

          <div
            class="relative z-10 w-full max-w-md mx-4 rounded-2xl bg-white shadow-xl"
            @click.stop
          >
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 class="text-sm font-semibold">Confirm file upload</h3>
              <button
                type="button"
                class="p-1 rounded hover:bg-gray-100"
                @click="cancelUpload"
                aria-label="Close"
              >
                <Icon icon="tabler:x" class="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div class="px-4 py-3 text-sm text-gray-700 space-y-3">
              <p>Are you sure you want to upload this file?</p>

              <div class="rounded-lg border border-gray-200 p-3 bg-gray-50">
                <p class="font-medium truncate">
                  {{ selectedFile?.name || 'No file selected' }}
                </p>
                <p class="text-xs text-gray-500" v-if="selectedFile">
                  {{ formatSize(selectedFile?.size) }}
                </p>
              </div>
            </div>

            <div class="px-4 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                class="px-4 py-2 rounded-lg text-sm bg-gray-200 text-gray-700"
                @click="cancelUpload"
              >
                Cancel
              </button>
              <button
                type="button"
                class="px-4 py-2 rounded-lg text-sm text-white"
                :class="uploading ? 'bg-teal-400 cursor-wait' : 'bg-teal-600 hover:bg-teal-700'"
                :disabled="uploading"
                @click="confirmUpload"
              >
                {{ uploading ? 'Uploading...' : 'Upload' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Amount -->
        <div>
          <p class="text-gray-500 text-xs mb-0.5">You Pay</p>
          <div class="flex items-center justify-between">
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

        <!-- Account number -->
        <div>
          <p class="text-gray-400 text-xs mb-0.5">Account Number</p>
          <div class="flex items-center justify-between">
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

        <!-- Account name -->
        <div>
          <p class="text-gray-400 text-xs mb-0.5">Name</p>
          <div class="flex items-center justify-between">
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

      <!-- CTA -->
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
