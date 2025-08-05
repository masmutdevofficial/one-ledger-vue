<template>
  <div class="relative pt-4 px-4 flex flex-col">
    <!-- Back arrow and title -->
    <div class="flex items-center mb-8">
      <button
        aria-label="Go back"
        class="text-black text-xl font-semibold leading-none"
        @click="goBack"
        type="button"
      >
        <Icon icon="tabler:arrow-left" class="w-5 h-5" />
      </button>
      <h1 class="flex-grow text-center text-black font-semibold text-base leading-none">
        Enter Amount
      </h1>
      <div class="w-6"></div>
    </div>
    <!-- Currency selector and amount -->
    <div class="flex flex-col items-center space-y-2 mb-6">
      <button
        aria-label="Select currency"
        class="flex items-center space-x-1 text-black font-semibold text-base leading-none"
        type="button"
        disabled
      >
        <img
          alt="USDT currency icon in teal circle"
          class="w-5 h-5"
          height="20"
          src="https://storage.googleapis.com/a1aa/image/bbb0943e-27ab-4116-efaf-7d0fc453e2e5.jpg"
          width="20"
        />
        <span>USDT</span>
        <Icon icon="tabler:chevron-down" class="w-3 h-3 text-black" />
      </button>
      <input
        v-model="amount"
        type="number"
        min="0"
        placeholder="10"
        class="text-black font-extrabold text-5xl leading-none text-center border-none bg-transparent focus:outline-none"
      />
      <button
        aria-label="Equivalent amount in dollars"
        class="flex items-center space-x-1 border border-gray-300 rounded-full px-3 py-1 text-gray-500 text-xs leading-none"
        type="button"
        disabled
      >
        <span>≈ ${{ amount || '0' }}</span>
        <Icon icon="tabler:arrows-left-right" class="w-3 h-3 text-gray-500" />
      </button>
    </div>
    <!-- Add Note -->
    <input
      v-model="note"
      type="text"
      placeholder="Add Note (optional)"
      class="text-[#3CBDBD] text-sm font-normal leading-none mb-20 border-none bg-transparent focus:outline-none text-center"
    />
  </div>
  <!-- Continue button fixed at bottom -->
  <div class="w-full px-4 pb-6 absolute mb-20 bottom-0 left-0 bg-white">
    <button
      aria-label="Continue"
      class="w-full bg-[#3CBDBD] text-white text-base font-normal py-3 rounded-lg"
      type="button"
      @click="handleContinue"
      :disabled="loading"
    >
      <span v-if="loading">Sending...</span>
      <span v-else>Continue</span>
    </button>
  </div>
</template>
<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useApiAlertStore } from '@/stores/apiAlert'

const router = useRouter()
const route = useRoute()
const modal = useApiAlertStore()

const amount = ref<string>('') // Input user
const note = ref<string>('') // Optional
const loading = ref(false)

onMounted(() => {
  const email = route.query.email
  if (!email) {
    modal.open('Error', 'No recipient email provided.')
    // Listen to modal closed, lalu redirect
    const stop = modal.$onAction(({ name }) => {
      if (name === 'close') {
        router.replace('/transfer')
        stop()
      }
    })
  }
})

// Tombol back
function goBack() {
  router.back()
}

async function handleContinue() {
  const email = route.query.email
  if (!email) return // redundant guard

  if (!amount.value || isNaN(+amount.value) || +amount.value <= 0) {
    modal.open('Error', 'Please enter a valid amount.')
    return
  }

  loading.value = true
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      modal.open('Unauthorized', 'Token not found.')
      loading.value = false
      return
    }
    const res = await fetch('https://ledger.masmutdev.id/api/save-transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: email,
        amount: +amount.value,
        note: note.value,
      }),
    })
    const data = await res.json()
    if (!res.ok || data.status !== 'success') {
      modal.open('Failed', data.message || 'Transfer failed')
      loading.value = false
      return
    }
    modal.open('Success', data.message || 'Transfer completed')
    setTimeout(() => {
      router.replace('/transfer')
    }, 1200)
  } catch {
    modal.open('Error', 'Server error')
  } finally {
    loading.value = false
  }
}
</script>
