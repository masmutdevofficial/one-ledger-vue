<template>
  <div class="min-h-screen flex justify-center bg-black text-gray-900">
    <div class="relative w-full max-w-md bg-white min-h-screen flex flex-col">
      <div class="mx-6 mt-20">
        <h2 class="text-lg font-semibold mb-4">Reset Password</h2>

        <div class="no-ios-zoom" v-if="tokenValid">
          <!-- Password -->
          <div class="no-ios-zoom relative mb-3">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="New Password"
              class="w-full border border-gray-300 rounded-md py-2 px-3 pr-10 text-sm placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              @click="showPassword = !showPassword"
              style="font-size: 18px"
            >
              <Icon :icon="showPassword ? 'tabler:eye-off' : 'tabler:eye'" />
            </button>
          </div>

          <!-- Confirm Password -->
          <div class="no-ios-zoom relative mb-6">
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Confirm New Password"
              class="w-full border border-gray-300 rounded-md py-2 px-3 pr-10 text-sm placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              @click="showConfirmPassword = !showConfirmPassword"
              style="font-size: 18px"
            >
              <Icon :icon="showConfirmPassword ? 'tabler:eye-off' : 'tabler:eye'" />
            </button>
          </div>

          <button
            type="button"
            :disabled="loading"
            @click="submitPassword"
            class="w-full bg-gray-800 text-white font-semibold text-sm rounded-full py-2 hover:bg-gray-700 disabled:opacity-60"
          >
            <span v-if="loading">Processing...</span>
            <span v-else>Update Password</span>
          </button>
        </div>

        <div v-else>
          <p class="text-center text-red-500 mt-4">Checking token...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useApiAlertStore } from '@/stores/apiAlert'
import { Icon } from '@iconify/vue'

const router = useRouter()
const route = useRoute()
const modal = useApiAlertStore()

const token = ref<string>('')
const tokenValid = ref(false)
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const password = ref<string>('')
const confirmPassword = ref<string>('')

async function checkToken() {
  if (!token.value) {
    redirectToLogin('Invalid or missing token.')
    return
  }

  try {
    const res = await fetch('https://su.oneled.io/api/validate-reset-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ token: token.value }),
    })

    const data = await res.json()

    if (data.status === 'valid') {
      tokenValid.value = true
    } else {
      redirectToLogin(data.message || 'Invalid token.')
    }
  } catch {
    redirectToLogin('Server error. Please try again.')
  }
}

function redirectToLogin(msg: string) {
  modal.open('Invalid Token', msg)
  setTimeout(() => {
    modal.close()
    router.replace('/login')
  }, 1500)
}

async function submitPassword() {
  if (!password.value || !confirmPassword.value) {
    modal.open('Error', 'Both password fields are required.')
    return
  }

  if (password.value !== confirmPassword.value) {
    modal.open('Error', 'Passwords do not match.')
    return
  }

  loading.value = true
  try {
    const res = await fetch('https://su.oneled.io/api/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        token: token.value,
        password: password.value,
      }),
    })

    const data = await res.json()

    if (data.status === 'success') {
      modal.open('Success', 'Password updated successfully.')
      setTimeout(() => {
        modal.close()
        router.replace('/login')
      }, 1500)
    } else {
      modal.open('Failed', data.message || 'Reset failed.')
    }
  } catch {
    modal.open('Error', 'Network/server error.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  token.value = String(route.query.token || '')
  checkToken()
})
</script>
