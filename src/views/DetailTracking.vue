<template>
  <div class="w-full mx-auto px-4 py-3 bg-white shadow-md rounded-md scale-font-50">
    <!-- INVALID -->
    <div v-if="invalid" class="flex items-center justify-center h-48">
      <p class="text-red-600 font-bold text-xl text-center">INVALID TRACKING NUMBER</p>
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

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 px-5 py-4 text-sm text-gray-700">
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
            <div class="w-6 h-6 rounded-full bg-[#0071bc] flex items-center justify-center text-white text-xs">
              <Icon icon="tabler:arrow-down" />
            </div>
            <div class="w-[2px] bg-[#0071bc] flex-1 mt-1"></div>
          </div>

          <div class="bg-gray-100 px-4 ml-3 py-3 rounded text-xs font-semibold text-gray-700 uppercase">
            INSTRUCTING BANK
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 ml-3 gap-x-8 gap-y-2 mt-2 text-xs text-gray-700">
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
            <div class="w-6 h-6 rounded-full bg-[#0071bc] flex items-center justify-center text-white text-xs">
              <Icon icon="tabler:arrow-down" />
            </div>
            <div class="w-[2px] bg-[#0071bc] flex-1 mt-1"></div>
          </div>

          <div class="bg-gray-100 px-4 ml-3 py-3 rounded text-xs font-semibold text-gray-700 uppercase">
            INTERMEDIARY BANK
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 ml-3 mt-2 text-xs text-gray-700">
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
            <div class="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs" :class="beneficiaryBgClass">
              <Icon :icon="beneficiaryIcon" />
            </div>
          </div>

          <div class="bg-gray-100 px-4 ml-3 py-3 rounded text-xs font-semibold text-gray-700 uppercase">
            BENEFICIARY / INSTRUCTED BANK
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 ml-3 mt-2 text-xs text-gray-700">
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
                    ? data.payment_credited_at + (data.payment_credited_tz ? ' ' + data.payment_credited_tz : '')
                    : '-'
                }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer class="flex justify-center gap-4 py-5 bg-white rounded-b-md border-t border-gray-300 mb-10">
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

<script setup lang="ts">
import { ref, computed, onMounted, type Ref, type ComputedRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

const API_BASE = 'https://tech.oneled.io/api' as const

type Status = 'Pending' | 'InProgress' | 'Completed' | 'Cancelled' | 'Failed'

interface SwiftPaymentTrackingManual {
  id: number
  id_users: number
  status: Status
  credited_to_beneficiary: boolean
  gpi_tracking_number: string
  payment_instruction_id: string | null
  charges_option: 'SHA' | 'OUR' | 'BEN' | null
  instructed_amount: number
  instructed_currency: string
  credited_amount: number | null
  credited_currency: string | null
  value_date: string | null
  total_time_text: string | null
  total_time_minutes: number | null
  instructing_bic: string | null
  instructing_bank_name: string | null
  instructing_bank_country: string | null
  instructing_tx_ref: string | null
  instructing_duration_text: string | null
  instructing_duration_minutes: number | null
  intermediary_bic: string | null
  intermediary_bank_name: string | null
  intermediary_bank_country: string | null
  intermediary_duration_text: string | null
  intermediary_duration_minutes: number | null
  intermediary_cum_deduction_text: string | null
  beneficiary_bic: string | null
  beneficiary_bank_name: string | null
  beneficiary_bank_country: string | null
  beneficiary_duration_text: string | null
  beneficiary_duration_minutes: number | null
  beneficiary_cum_deduction_text: string | null
  payment_credited_at: string | null
  payment_credited_tz: string | null
  notes?: string | null
  created_at: string
}

type ValidateResp = { status?: boolean }
type DataInvoiceResp =
  | { status: 'success'; data: SwiftPaymentTrackingManual }
  | { status: 'error'; message?: string }

const route = useRoute()
const router = useRouter()

const loading = ref<boolean>(true)
const invalid = ref<boolean>(false)
const data: Ref<Partial<SwiftPaymentTrackingManual>> = ref({})

/* Helpers */
const isNil = (v: unknown): v is null | undefined | '' => v === null || v === undefined || v === ''
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v as number)
const fmt = (v: unknown): string | number => (isNil(v) ? '-' : (v as string | number))

const amountWithCcy = (amt: unknown, ccy: unknown): string => {
  if (isNil(amt) && isNil(ccy)) return '-'
  if (isNil(amt)) return '-'
  if (isNil(ccy)) return String(amt as number)
  const n = Number(amt)
  return `${String(ccy)} ${
    Number.isFinite(n)
      ? n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : amt
  }`
}

/* Status UI */
const statusIcon: ComputedRef<string> = computed(() => {
  const s = String(data.value?.status || '').toLowerCase()
  if (s === 'completed') return 'tabler:circle-check'
  if (s === 'failed' || s === 'cancelled') return 'tabler:alert-triangle'
  if (s === 'inprogress' || s === 'in progress' || s === 'pending') return 'tabler:clock'
  return 'tabler:help'
})
const statusClass: ComputedRef<string> = computed(() => {
  const s = String(data.value?.status || '').toLowerCase()
  if (s === 'completed') return 'text-green-700'
  if (s === 'failed' || s === 'cancelled') return 'text-red-600'
  if (s === 'inprogress' || s === 'in progress') return 'text-amber-600'
  if (s === 'pending') return 'text-gray-600'
  return 'text-gray-600'
})

const normalizedStatus: ComputedRef<string> = computed(() =>
  String(data.value?.status || '').toLowerCase(),
)

const beneficiaryIcon: ComputedRef<string> = computed(() => {
  const s = normalizedStatus.value
  if (s === 'completed') return 'tabler:circle-check'
  if (s === 'failed' || s === 'cancelled') return 'tabler:alert-triangle'
  if (s === 'inprogress' || s === 'in progress' || s === 'pending') return 'tabler:clock'
  return 'tabler:help'
})

const beneficiaryBgClass: ComputedRef<string> = computed(() => {
  const s = normalizedStatus.value
  if (s === 'completed') return 'bg-green-700'
  if (s === 'failed' || s === 'cancelled') return 'bg-red-600'
  if (s === 'inprogress' || s === 'in progress') return 'bg-amber-600'
  if (s === 'pending') return 'bg-gray-500'
  return 'bg-gray-400'
})

/* Fetch detail (Sanctum token; server identifikasi user dari Bearer token) */
async function fetchDetail(): Promise<void> {
  loading.value = true
  invalid.value = false

  const token = localStorage.getItem('token')

  // Ambil id dari URL: utamakan payment_instruction_id; fallback gpi_tracking_number
  const paymentInstructionId = String(
    (route.query.payment_instruction_id as string) ||
      (route.query.gpi_tracking_number as string) ||
      '',
  ).trim()

  if (!token || !paymentInstructionId) {
    invalid.value = true
    loading.value = false
    return
  }

  try {
    // 1) validate by payment_instruction_id
    const validateUrl = `${API_BASE}/validate-invoice?payment_instruction_id=${encodeURIComponent(
      paymentInstructionId,
    )}`
    const vres = await fetch(validateUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    let isValid = false
    try {
      const vjson = (await vres.json()) as ValidateResp
      isValid = Boolean(vjson?.status)
    } catch {
      isValid = false
    }

    if (!isValid) {
      invalid.value = true
      return
    }

    // 2) fetch data-invoice (coba pakai payment_instruction_id; fallback ke gpi_tracking_number)
    let detailUrl = `${API_BASE}/data-invoice?payment_instruction_id=${encodeURIComponent(
      paymentInstructionId,
    )}`
    let dres = await fetch(detailUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    // fallback kalau endpoint hanya kenal gpi_tracking_number:
    if (!dres.ok) {
      detailUrl = `${API_BASE}/data-invoice?gpi_tracking_number=${encodeURIComponent(
        paymentInstructionId,
      )}`
      dres = await fetch(detailUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
    }

    if (!dres.ok) {
      invalid.value = true
      return
    }

    const djson = (await dres.json()) as DataInvoiceResp
    if (djson?.status === 'success' && (djson as any).data) {
      const payload = (djson as Extract<DataInvoiceResp, { status: 'success' }>).data
      ;(payload as any).credited_to_beneficiary = Boolean((payload as any).credited_to_beneficiary)
      data.value = payload
      invalid.value = false
    } else {
      invalid.value = true
    }
  } catch {
    invalid.value = true
  } finally {
    loading.value = false
  }
}

function closePage(): void {
  if (window.history.length > 1) window.history.back()
  else router.push('/')
}

onMounted(fetchDetail)
</script>

<style scoped>
/* Paksa semua font-size di dalam komponen menjadi 10px */
.scale-font-50,
.scale-font-50 * {
  font-size: 10px !important;
}
</style>
