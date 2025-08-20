<template>
  <div class="max-w-md mt-5 mx-4">
    <h1 class="text-black text-lg font-normal mb-3">Send to OneLedger User</h1>
    <input
      id="emailPhone"
      type="text"
      v-model="emailPhone"
      placeholder="Email/Phone"
      class="w-full bg-gray-100 text-gray-400 placeholder-gray-400 rounded-lg py-3 px-4 mb-4 text-sm font-normal focus:outline-none"
      :disabled="loading"
    />
    <button
      type="button"
      class="w-full bg-teal-400 text-white text-sm font-normal py-3 rounded-lg"
      @click="handleContinue"
      :disabled="loading"
    >
      <span v-if="loading">Checking...</span>
      <span v-else>Continue</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useApiAlertStore } from '@/stores/apiAlert'

const router = useRouter()
const emailPhone = ref('')
const loading = ref(false)
const modal = useApiAlertStore()

async function handleContinue() {
  if (!emailPhone.value.trim()) {
    modal.open('Error', 'Please enter email or phone!')
    return
  }

  const token = localStorage.getItem('token')
  if (!token) {
    modal.open('Unauthorized', 'Token not found.')
    return
  }

  loading.value = true
  try {
    const res = await fetch('https://one-ledger.masmutpanel.my.id/api/check-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email: emailPhone.value }),
    })
    const data = await res.json()
    if (data.status === 'success' && data.data && data.data.email) {
      router.push(`/transfer-detail?email=${encodeURIComponent(data.data.email)}`)
    } else {
      modal.open('Error', data.message || 'User not found or not verified!')
    }
  } catch {
    modal.open('Error', 'Failed to connect to server!')
  }
  loading.value = false
}
</script>
