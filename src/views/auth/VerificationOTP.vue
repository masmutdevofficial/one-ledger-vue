<template>
  <div class="min-h-screen flex justify-center bg-black text-gray-900">
    <div class="relative w-full max-w-md bg-white min-h-screen flex flex-col">
      <RouterLink
        to="/register"
        class="absolute top-4 left-5 text-sm font-bold text-black hover:underline flex items-center"
      >
        <!-- Icon panah kiri -->
        <span style="font-size: 24px">⬅️</span>
      </RouterLink>

      <div class="mx-6 mt-20">
        <h2 class="text-lg font-semibold mb-0">Security Verification</h2>
        <h5 class="text-sm font-normal text-gray-500 mb-4">
          To continue, please finish all verification steps.
        </h5>

        <!-- Email Verification Code -->
        <div class="relative mb-3">
          <input
            v-model="emailCode"
            :disabled="loading"
            type="text"
            placeholder="Email Verification Code"
            class="w-full border border-gray-300 rounded-md py-2 px-3 pr-20 text-sm placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
          <!-- Countdown or Resend -->
          <span
            v-if="timer > 0"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 select-none"
          >
            {{ formattedTime }}
          </span>

          <button
            v-else
            @click="resendCode"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-black hover:underline font-semibold"
          >
            Resend
          </button>
        </div>

        <h5 class="text-sm font-normal text-gray-500 mb-4">
          A verification code will be sent to ***@***.com
        </h5>

        <!-- Submit -->
        <button
          type="button"
          :disabled="loading"
          class="mt-4 w-full bg-gray-800 text-white font-semibold text-sm rounded-full py-2 hover:bg-gray-700"
          @click="submitCode"
        >
          <span v-if="loading">Checking...</span>
          <span v-else>Submit</span>
        </button>
        <h5 class="text-sm text-center font-semibold text-black mb-4 underline mt-6">
          Security Verification Unavailable
        </h5>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useApiAlertStore } from '@/stores/apiAlert'
const modal = useApiAlertStore()

const timer = ref(60)
let interval: number | null = null

const emailCode = ref('')
const loading = ref(false)
const userId = ref<number | null>(null)

const formattedTime = computed(() => {
  const min = String(Math.floor(timer.value / 60)).padStart(2, '0')
  const sec = String(timer.value % 60).padStart(2, '0')
  return `${min}:${sec}`
})

function startTimer() {
  if (interval !== null) clearInterval(interval)
  timer.value = 60
  interval = setInterval(() => {
    if (timer.value > 0) {
      timer.value--
    } else {
      if (interval !== null) clearInterval(interval)
    }
  }, 1000) as unknown as number // casting agar aman di Vite
}

function resendCode() {
  startTimer() // hanya reset timer
}

const router = useRouter()

async function submitCode() {
  if (!userId.value) {
    modal.open('Error', 'User ID not found.')
    return
  }
  if (!emailCode.value) {
    modal.open('Error', 'Verification code is required.')
    return
  }
  loading.value = true
  try {
    const res = await fetch('http://localhost:8000/api/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ id: userId.value, otp: emailCode.value }),
    })
    const data = await res.json()

    if (data.status !== 'success') {
      modal.open('Verification Failed', data.message || 'OTP is invalid.')
      loading.value = false
      return
    }

    modal.open('Success', 'Verification successful!')
    setTimeout(() => {
      localStorage.removeItem('idReg')
      router.push('/login')
    }, 1500)
  } catch (error: unknown) {
    let msg = 'Failed to connect to server.'
    if (error instanceof Error) msg += ' ' + error.message
    else if (typeof error === 'string') msg += ' ' + error
    modal.open('Error', msg)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Ambil user id dari localStorage
  const idStr = localStorage.getItem('idReg')
  if (!idStr) {
    router.replace('/login')
    return
  }
  const id = Number(idStr)
  if (isNaN(id) || id <= 0) {
    router.replace('/login')
    return
  }
  userId.value = id

  startTimer()
})

onUnmounted(() => {
  if (interval !== null) clearInterval(interval)
})
</script>
