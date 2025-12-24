<template>
  <div class="max-w-md mt-5 mx-4 no-ios-zoom">
    <h1 class="text-black text-lg font-normal mb-3">Send to OneLedger User</h1>

    <input
      id="emailPhone"
      type="text"
      v-model="emailPhone"
      placeholder="Email/Phone"
      class="w-full bg-gray-100 text-gray-400 placeholder-gray-400 rounded-lg py-3 px-4 mb-1 text-sm font-normal focus:outline-none"
      :disabled="false"
    />
    <small v-if="fieldError" class="block text-xs text-red-600 mb-3">{{ fieldError }}</small>

    <button
      type="button"
      class="w-full bg-teal-400 hover:bg-teal-500 text-white text-sm font-normal py-3 rounded-lg"
      @click="handleContinue"
    >
      Continue
    </button>
  </div>

  <!-- Modal Password (lokal) -->
  <div
    v-if="pwModal.open"
    class="fixed inset-0 z-51 flex items-center justify-center"
    aria-modal="true"
    role="dialog"
  >
    <div class="absolute inset-0 bg-black/30" @click="closePwModal"></div>

    <form
      class="no-ios-zoom relative z-10 w-[92%] max-w-sm rounded-2xl bg-white p-5 shadow-lg"
      @submit.prevent="submitPassword"
    >
      <div class="mb-3">
        <h3 class="text-base font-semibold">Security Check</h3>
        <p class="mt-1 text-xs text-gray-600">
          Enter your security password (same as your login password) to continue.
        </p>
      </div>

      <label class="block text-xs text-gray-600 mb-1">Password</label>
      <input
        v-model="pwModal.password"
        type="password"
        inputmode="text"
        autocomplete="current-password"
        required
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
      />

      <p v-if="pwModal.error" class="mt-2 text-xs text-red-600">{{ pwModal.error }}</p>

      <div class="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          class="text-xs px-3 py-1.5 rounded border border-gray-300"
          @click="closePwModal"
          :disabled="pwModal.loading"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="text-xs px-3 py-1.5 rounded bg-teal-500 text-white disabled:opacity-60"
          :disabled="pwModal.loading"
        >
          {{ pwModal.loading ? 'Verifying…' : 'Verify & Continue' }}
        </button>
      </div>
    </form>
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

const API_BASE = 'https://abc.oneled.io/api'

const emailPhone = ref<string>('')
const fieldError = ref<string>('')

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

/* ===== Modal password ===== */
const pwModal = ref<{ open: boolean; password: string; loading: boolean; error: string }>({
  open: false,
  password: '',
  loading: false,
  error: '',
})

function handleContinue() {
  fieldError.value = ''
  if (!emailPhone.value.trim()) {
    fieldError.value = 'Please enter email or phone.'
    return
  }

  const token = localStorage.getItem('token')
  if (!token) {
    openAlert('error', 'Unauthorized: token not found.')
    return
  }

  // buka modal password
  pwModal.value.open = true
  pwModal.value.password = ''
  pwModal.value.error = ''
}

function closePwModal() {
  if (pwModal.value.loading) return
  pwModal.value.open = false
  pwModal.value.password = ''
  pwModal.value.error = ''
}

async function submitPassword() {
  pwModal.value.error = ''
  const token = localStorage.getItem('token')
  if (!token) {
    openAlert('error', 'Unauthorized: token not found.')
    return
  }
  if (!pwModal.value.password.trim()) {
    pwModal.value.error = 'Password is required.'
    return
  }

  pwModal.value.loading = true
  try {
    // 1) verify password (text/plain)
    const res = await fetch(`${API_BASE}/verify-transfer-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/plain, */*',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password: pwModal.value.password }),
    })
    const msg = await res.text()

    if (res.status === 200) {
      // 2) continue: check email/phone target
      const res2 = await fetch(`${API_BASE}/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: emailPhone.value }),
      })

      if (!res2.ok) {
        // coba ambil detail error json/text
        let errText = `Failed to verify recipient (HTTP ${res2.status}).`
        try {
          const t = await res2.text()
          errText = t || errText
        } catch {}
        openAlert('error', errText)
        pwModal.value.loading = false
        return
      }

      const data = (await res2.json()) as {
        status?: string
        data?: { email?: string }
        message?: string
      }
      if (data.status === 'success' && data.data && data.data.email) {
        closePwModal()
        router.push(`/transfer-detail?email=${encodeURIComponent(data.data.email)}`)
      } else {
        openAlert('error', data.message || 'User not found or not verified!')
      }
    } else if (res.status === 401) {
      pwModal.value.error = msg || 'Unauthorized.'
    } else if (res.status === 422) {
      // pesan dari API: "Password is incorrect." atau lainnya
      pwModal.value.error = msg || 'Password is incorrect.'
    } else {
      pwModal.value.error = msg || `Verification failed (HTTP ${res.status}).`
    }
  } catch {
    pwModal.value.error = 'Failed to connect to server.'
  } finally {
    pwModal.value.loading = false
  }
}
</script>
