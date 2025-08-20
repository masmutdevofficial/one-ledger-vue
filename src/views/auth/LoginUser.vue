<template>
  <div class="min-h-screen flex justify-center bg-black text-gray-900">
    <div class="relative w-full max-w-md bg-white min-h-screen flex flex-col">
      <RouterLink
        to="/register"
        class="absolute top-4 right-6 text-sm font-bold text-gray-700 hover:underline"
      >
        Sign Up
      </RouterLink>

      <div class="mx-6 mt-12">
        <h2 class="text-lg font-semibold mb-4">Log In</h2>

        <form @submit.prevent="login">
          <input
            v-model="identity"
            type="text"
            placeholder="Email"
            class="w-full border border-gray-300 rounded-md py-2 px-3 mb-3 text-sm placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
          <div class="relative mb-3">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Password"
              class="w-full border border-gray-300 rounded-md py-2 px-3 pr-10 text-sm placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            <!-- Ganti Icon sesuai kebutuhan, di sini pakai emoji saja -->
            <Icon
              :icon="showPassword ? 'tabler:eye-off' : 'tabler:eye'"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5 cursor-pointer"
              style="font-size: 20px"
              @click="showPassword = !showPassword"
            />
          </div>
          <RouterLink to="/forgot-password" class="text-sm font-bold text-gray-700 hover:underline">
            Forgot Password?
          </RouterLink>
          <button
            type="submit"
            :disabled="loading"
            class="mt-4 w-full bg-gray-800 text-white font-semibold text-sm rounded-full py-2 hover:bg-gray-700 disabled:opacity-60"
          >
            <span v-if="loading">Logging in...</span>
            <span v-else>Log In</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApiAlertStore } from '@/stores/apiAlert' // perhatikan path stores!
import { Icon } from '@iconify/vue'

const modal = useApiAlertStore()
const route = useRoute()
const router = useRouter()

onMounted(() => {
  if (route.query.reason === 'unauthorized') {
    modal.open('Failed', 'You must be logged in to access this page.')
  }
})

const showPassword = ref(false)
const identity = ref<string>('')
const password = ref<string>('')
const loading = ref(false)

async function login() {
  loading.value = true
  try {
    const res = await fetch('https://one-ledger.masmutpanel.my.id/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        identity: identity.value,
        password: password.value,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      if (data.otp_sent && data.id) {
        localStorage.setItem('idReg', String(data.id))
        modal.open('Verification Required', data.message || 'Please verify OTP.')
        setTimeout(() => {
          router.push('/verification')
        }, 3000)
        loading.value = false
        return
      }
      modal.open('Login Failed', data.message || 'Login failed.')
      loading.value = false
      return
    }
    localStorage.setItem('token', data.token)
    router.push('/dashboard')
  } catch (error: unknown) {
    let msg = 'Gagal terhubung ke server.'
    if (error instanceof Error) {
      msg += ' ' + error.message
    } else if (typeof error === 'string') {
      msg += ' ' + error
    }
    modal.open('Error', msg)
  } finally {
    loading.value = false
  }
}
</script>
