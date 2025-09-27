<template>
  <div class="w-full mx-auto px-4 py-3 bg-white shadow-md rounded-md scale-font-50">
    <!-- INVALID -->
    <div v-if="invalid" class="flex items-center justify-center h-48">
      <p class="text-red-600 font-bold text-xl text-center">INVALID INVOICE ID</p>
    </div>

    <!-- LOADING -->
    <div v-else-if="loading" class="py-10 text-center text-gray-600">Loading…</div>

    <!-- DETAIL -->
    <template v-else>
      <header class="bg-[#0071bc] flex items-center justify-between px-5 py-3 rounded-t-md">
        <h1 class="text-white font-bold text-sm flex items-center gap-2">
          <Icon icon="tabler:world" class="text-base" />
          Payment Tracking
        </h1>
        <button
          aria-label="Close"
          type="button"
          class="text-white text-xl font-bold leading-none hover:text-gray-200"
          @click="closePage"
        >
          &times;
        </button>
      </header>

      <section class="border border-t-0 border-gray-300 rounded-b-md">
        <div class="flex justify-between items-center border-b border-gray-300 px-5 py-3 text-sm">
          <div class="flex items-center gap-2 font-semibold text-gray-700">
            <span>Status:</span>
            <span class="flex items-center gap-1 font-bold" :class="statusClass">
              <Icon :icon="statusIcon" class="text-base" />
              {{ fmt(data.status) }}
            </span>
          </div>
          <div class="text-gray-700">
            {{ data.credited_to_beneficiary === true ? 'Credited to beneficiary account' : '-' }}
          </div>
        </div>

        <div
          class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 px-5 py-4 text-sm text-gray-700"
        >
          <div>
            <p class="font-semibold">GPI Tracking Number</p>
            <p>{{ fmt(data.gpi_tracking_number) }}</p>
          </div>
          <div>
            <p class="font-semibold">Instructed Amount</p>
            <p>{{ amountWithCcy(data.instructed_amount, data.instructed_currency) }}</p>
          </div>

          <div>
            <p class="font-semibold">Payment Instruction ID</p>
            <p>{{ fmt(data.payment_instruction_id) }}</p>
          </div>
          <div>
            <p class="font-semibold">Credited Amount</p>
            <p>{{ amountWithCcy(data.credited_amount, data.credited_currency) }}</p>
          </div>

          <div>
            <p class="font-semibold">Value Date</p>
            <p>{{ fmt(data.value_date) }}</p>
          </div>
          <div>
            <p class="font-semibold">Deductions</p>
            <p>{{ fmt(data.charges_option) }}</p>
          </div>

          <div>
            <p class="font-semibold">Total Time</p>
            <p>
              {{
                fmt(data.total_time_text) ||
                (isNum(data.total_time_minutes) ? data.total_time_minutes + ' Minutes' : '-')
              }}
            </p>
          </div>
        </div>
      </section>

      <section class="py-4 space-y-4">
        <!-- Instructing Bank -->
        <div class="relative pl-5">
          <div class="absolute left-0 top-2 flex flex-col items-center">
            <div
              class="w-6 h-6 rounded-full bg-[#0071bc] flex items-center justify-center text-white text-xs"
            >
              <Icon icon="tabler:arrow-down" />
            </div>
            <div class="w-[2px] bg-[#0071bc] flex-1 mt-1"></div>
          </div>

          <div
            class="bg-gray-100 px-4 ml-3 py-3 rounded text-xs font-semibold text-gray-700 uppercase"
          >
            INSTRUCTING BANK
          </div>

          <div
            class="grid grid-cols-1 sm:grid-cols-2 ml-3 gap-x-8 gap-y-2 mt-2 text-xs text-gray-700"
          >
            <div>
              <p class="font-semibold">BIC</p>
              <p>{{ fmt(data.instructing_bic) }}</p>
              <p class="font-semibold mt-2">Bank</p>
              <p>{{ fmt(data.instructing_bank_name) }}</p>
              <p>{{ fmt(data.instructing_bank_country) }}</p>
            </div>
            <div>
              <p class="font-semibold">Transaction Reference Number</p>
              <p>{{ fmt(data.instructing_tx_ref) }}</p>
              <p class="font-semibold mt-2">Duration</p>
              <p>
                {{
                  fmt(data.instructing_duration_text) ||
                  (isNum(data.instructing_duration_minutes)
                    ? data.instructing_duration_minutes + ' Minutes'
                    : '-')
                }}
              </p>
            </div>
          </div>
        </div>

        <!-- Intermediary Bank -->
        <div class="relative pl-5">
          <div class="absolute left-0 top-2 flex flex-col items-center">
            <div
              class="w-6 h-6 rounded-full bg-[#0071bc] flex items-center justify-center text-white text-xs"
            >
              <Icon icon="tabler:arrow-down" />
            </div>
            <div class="w-[2px] bg-[#0071bc] flex-1 mt-1"></div>
          </div>

          <div
            class="bg-gray-100 px-4 ml-3 py-3 rounded text-xs font-semibold text-gray-700 uppercase"
          >
            INTERMEDIARY BANK
          </div>

          <div
            class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 ml-3 mt-2 text-xs text-gray-700"
          >
            <div>
              <p class="font-semibold">BIC</p>
              <p>{{ fmt(data.intermediary_bic) }}</p>
              <p class="font-semibold mt-2">Bank</p>
              <p>{{ fmt(data.intermediary_bank_name) }}</p>
              <p>{{ fmt(data.intermediary_bank_country) }}</p>
              <p class="font-semibold mt-2">Duration</p>
              <p>
                {{
                  fmt(data.intermediary_duration_text) ||
                  (isNum(data.intermediary_duration_minutes)
                    ? data.intermediary_duration_minutes + ' Minutes'
                    : '-')
                }}
              </p>
            </div>
            <div>
              <p class="font-semibold">Cumulative Deduction</p>
              <p>{{ fmt(data.intermediary_cum_deduction_text) }}</p>
            </div>
          </div>
        </div>

        <!-- Beneficiary / Instructed Bank -->
        <div class="relative pl-5">
          <div class="absolute left-0 top-2 flex flex-col items-center">
            <div
              class="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
              :class="beneficiaryBgClass"
            >
              <Icon :icon="beneficiaryIcon" />
            </div>
          </div>

          <div
            class="bg-gray-100 px-4 ml-3 py-3 rounded text-xs font-semibold text-gray-700 uppercase"
          >
            BENEFICIARY / INSTRUCTED BANK
          </div>

          <div
            class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 ml-3 mt-2 text-xs text-gray-700"
          >
            <div>
              <p class="font-semibold">BIC</p>
              <p>{{ fmt(data.beneficiary_bic) }}</p>
              <p class="font-semibold mt-2">Bank</p>
              <p>{{ fmt(data.beneficiary_bank_name) }}</p>
              <p>{{ fmt(data.beneficiary_bank_country) }}</p>
              <p class="font-semibold mt-2">Duration</p>
              <p>
                {{
                  fmt(data.beneficiary_duration_text) ||
                  (isNum(data.beneficiary_duration_minutes)
                    ? data.beneficiary_duration_minutes + ' Minutes'
                    : '-')
                }}
              </p>
            </div>
            <div>
              <p class="font-semibold">Cumulative Deduction</p>
              <p>{{ fmt(data.beneficiary_cum_deduction_text) }}</p>
              <p class="font-semibold mt-2">Payment Credited to Beneficiary</p>
              <p>
                {{
                  fmt(data.payment_credited_at)
                    ? data.payment_credited_at +
                      (data.payment_credited_tz ? ' ' + data.payment_credited_tz : '')
                    : '-'
                }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer class="flex justify-center gap-4 py-5 bg-white rounded-b-md border-t border-gray-300">
        <button
          type="button"
          class="border border-[#0071bc] hover:bg-[#e6f0fa] text-[#0071bc] text-sm font-normal px-5 py-2 rounded flex items-center gap-2"
          @click="closePage"
        >
          <Icon icon="tabler:x" class="text-base" />
          Close
        </button>
      </footer>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

const API_URL = 'https://new-ota.masmutpanel.my.id/api/get_invoice_id.php'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const invalid = ref(false)
const data = ref({}) // payload data bila valid

// Helpers
const isNil = (v) => v === null || v === undefined || v === ''
const isNum = (v) => typeof v === 'number' && !Number.isNaN(v)
const fmt = (v) => (isNil(v) ? '-' : v)

const amountWithCcy = (amt, ccy) => {
  if (isNil(amt) && isNil(ccy)) return '-'
  if (isNil(amt)) return '-'
  if (isNil(ccy)) return String(amt)
  return `${ccy} ${Number(amt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Status UI
const statusIcon = computed(() => {
  const s = (data.value?.status || '').toLowerCase()
  if (s === 'completed') return 'tabler:circle-check'
  if (s === 'failed' || s === 'cancelled') return 'tabler:alert-triangle'
  if (s === 'inprogress') return 'tabler:clock'
  return 'tabler:help'
})
const statusClass = computed(() => {
  const s = (data.value?.status || '').toLowerCase()
  if (s === 'completed') return 'text-green-700'
  if (s === 'failed' || s === 'cancelled') return 'text-red-600'
  if (s === 'inprogress') return 'text-amber-600'
  if (s === 'pending') return 'text-gray-600'
  return 'text-gray-600'
})

const normalizedStatus = computed(() => (data.value?.status || '').toLowerCase())

const beneficiaryIcon = computed(() => {
  const s = normalizedStatus.value
  if (s === 'completed') return 'tabler:circle-check'
  if (s === 'failed' || s === 'cancelled') return 'tabler:alert-triangle'
  if (s === 'inprogress' || s === 'pending') return 'tabler:clock'
  return 'tabler:help'
})

const beneficiaryBgClass = computed(() => {
  const s = normalizedStatus.value
  if (s === 'completed') return 'bg-green-700'
  if (s === 'failed' || s === 'cancelled') return 'bg-red-600'
  if (s === 'inprogress') return 'bg-amber-600'
  if (s === 'pending') return 'bg-gray-500'
  return 'bg-gray-400'
})

// Get user id from localStorage (support beberapa bentuk penyimpanan)
function getUserId() {
  // prior: user_id langsung
  const uid = localStorage.getItem('user_id')
  if (uid && /^\d+$/.test(uid)) return Number(uid)
  // ada juga yang menyimpan 'user'
  const raw = localStorage.getItem('user')
  if (!raw) return null
  if (/^\d+$/.test(raw)) return Number(raw)
  try {
    const obj = JSON.parse(raw)
    if (obj && typeof obj === 'object') {
      if (typeof obj.id === 'number') return obj.id
      if (typeof obj.user_id === 'number') return obj.user_id
      if (typeof obj.id === 'string' && /^\d+$/.test(obj.id)) return Number(obj.id)
      if (typeof obj.user_id === 'string' && /^\d+$/.test(obj.user_id)) return Number(obj.user_id)
    }
  } catch {}
  return null
}

async function fetchDetail() {
  const invoiceId = route.query.invoice_id
  const idUsers = getUserId()

  if (!invoiceId || !idUsers) {
    invalid.value = true
    loading.value = false
    return
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_users: idUsers,
        payment_instruction_id: String(invoiceId),
      }),
    })

    const contentType = res.headers.get('content-type') || ''
    if (!res.ok) {
      // Endpoint kirim "Invalid ID" (text/plain) saat error/invalid
      if (contentType.includes('application/json')) {
        const j = await res.json()
        invalid.value = true
      } else {
        const t = (await res.text()).trim()
        invalid.value = true
      }
      return
    }

    if (contentType.includes('application/json')) {
      const json = await res.json()
      if (json?.status === 'success' && json?.data) {
        data.value = json.data
        invalid.value = false
      } else {
        invalid.value = true
      }
    } else {
      const text = (await res.text()).trim()
      invalid.value = text.toLowerCase() === 'invalid id'
    }
  } catch (_) {
    invalid.value = true
  } finally {
    loading.value = false
  }
}

function closePage() {
  // kembali ke halaman sebelumnya atau root
  if (window.history.length > 1) window.history.back()
  else router.push('/')
}

onMounted(fetchDetail)
</script>

<style scoped>
/* Paksa semua font-size di dalam komponen menjadi 10px (sesuai permintaan sebelumnya) */
.scale-font-50,
.scale-font-50 * {
  font-size: 10px !important;
}
</style>
