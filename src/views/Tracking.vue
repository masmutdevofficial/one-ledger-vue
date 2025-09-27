<template>
  <div class="max-w-md mt-5 mx-4 no-ios-zoom">
    <h1 class="text-black text-lg font-normal mb-3">Payment Tracking</h1>

    <input
      id="paymentInstructionId"
      type="text"
      v-model="paymentInstructionId"
      placeholder="Payment Instruction ID"
      class="w-full bg-gray-100 text-gray-400 placeholder-gray-400 rounded-lg py-3 px-4 mb-1 text-sm font-normal focus:outline-none"
      :disabled="loading"
    />
    <small v-if="fieldError" class="block text-xs text-red-600 mb-3">{{ fieldError }}</small>

    <button
      type="button"
      class="w-full bg-teal-400 hover:bg-teal-500 text-white text-sm font-normal py-3 rounded-lg disabled:opacity-60"
      :disabled="loading"
      @click="handleContinue"
    >
      {{ loading ? 'Checking…' : 'Continue' }}
    </button>
  </div>

  <!-- ALERT lokal -->
  <div
    v-if="alert.open"
    class="fixed z-[60] top-4 left-1/2 -translate-x-1/2 max-w-md w-[92%]"
    role="alert"
    aria-live="assertive"
  >
    <div
      class="flex items-start gap-2 rounded-xl border px-3 py-2 shadow bg-white"
      :class="alert.type === 'success' ? 'border-teal-300' : 'border-red-300'"
    >
      <svg
        v-if="alert.type === 'success'"
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 text-teal-600 mt-0.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 text-red-600 mt-0.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div class="text-sm text-gray-900 flex-1">{{ alert.message }}</div>
      <button type="button" class="shrink-0 p-1 rounded hover:bg-gray-100" @click="closeAlert">
        ✕
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const API_BASE = 'https://one-ledger.masmutpanel.my.id/api' as const

const paymentInstructionId = ref<string>('')
const fieldError = ref<string>('')
const loading = ref<boolean>(false)

/* ===== Alert lokal ===== */
type AlertType = 'success' | 'error'
const alert = ref<{ open: boolean; type: AlertType; message: string; _t: number | null }>({
  open: false,
  type: 'success',
  message: '',
  _t: null,
})
function openAlert(type: AlertType, message: string, timeoutMs = 2400) {
  closeAlert()
  alert.value.open = true
  alert.value.type = type
  alert.value.message = message
  alert.value._t = window.setTimeout(() => closeAlert(), timeoutMs)
}
function closeAlert() {
  if (alert.value._t) {
    clearTimeout(alert.value._t)
    alert.value._t = null
  }
  alert.value.open = false
}

async function handleContinue() {
  fieldError.value = ''
  const pid = paymentInstructionId.value.trim()
  if (!pid) {
    fieldError.value = 'Please enter Payment Instruction ID.'
    return
  }

  const token = localStorage.getItem('token')
  if (!token) {
    openAlert('error', 'Unauthorized: token not found.')
    return
  }

  loading.value = true
  try {
    // Validasi berdasarkan payment_instruction_id
    const url = `${API_BASE}/validate-invoice?payment_instruction_id=${encodeURIComponent(pid)}`
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    let statusOk = false
    try {
      const data = (await res.json()) as { status?: boolean }
      statusOk = Boolean(data?.status)
    } catch {
      statusOk = false
    }

    if (statusOk) {
      router.push(`/detail-tracking?payment_instruction_id=${encodeURIComponent(pid)}`)
    } else {
      openAlert('error', 'Invalid Payment Instruction ID.')
    }
  } catch {
    openAlert('error', 'Failed to connect to server.')
  } finally {
    loading.value = false
  }
}
</script>
