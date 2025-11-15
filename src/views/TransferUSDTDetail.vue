<template>
  <div class="relative pt-4 px-4 flex flex-col no-ios-zoom">
    <!-- Back arrow and title -->
    <div class="flex items-center mb-8 no-ios-zoom">
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
    <div class="no-ios-zoom flex flex-col items-center space-y-2 mb-6">
      <button
        aria-label="Select currency"
        class="flex items-center space-x-1 text-black font-semibold text-base leading-none"
        type="button"
        disabled
      >
        <img src="/img/crypto/usdt.svg" alt="USDT" class="w-5 h-5 rounded-full object-contain" />
        <span>USDT</span>
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
      @click="openConfirm"
      :disabled="loading"
    >
      <span v-if="loading">Sending...</span>
      <span v-else>Continue</span>
    </button>
  </div>
  <TransferConfirmModal
    :show="showConfirm"
    :email="email"
    :amount="amount"
    :balance="balance"
    :loading="confirming"
    @close="showConfirm = false"
    @confirm="handleContinue"
  />
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useApiAlertStore } from '@/stores/apiAlert'
import TransferConfirmModal from '@/components/transfer/TransferConfirmModal.vue'

const router = useRouter()
const route = useRoute()
const modal = useApiAlertStore()

const amount = ref('')
const note = ref('')
const loading = ref(false)
const showConfirm = ref(false)
const confirming = ref(false)

// --- Email dari query param
const email = (route.query.email as string) || ''

// Ambil saldo user dari API saat halaman dibuka
const balance = ref(0)
onMounted(async () => {
  if (!email) {
    modal.open('Error', 'No recipient email provided.')
    const stop = modal.$onAction(({ name }) => {
      if (name === 'close') {
        router.replace('/transfer')
        stop()
      }
    })
    return
  }
  try {
    const token = localStorage.getItem('token')
    if (!token) return
    const res = await fetch('https://su.oneled.io/api/get-saldo', {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    const data = await res.json()
    if (res.ok && data.status === 'success') balance.value = Number(data.saldo)
  } catch {}
})

function goBack() {
  router.back()
}

// Open modal konfirmasi transfer
function openConfirm() {
  if (!amount.value || isNaN(+amount.value) || +amount.value <= 0) {
    modal.open('Error', 'Please enter a valid amount.')
    return
  }
  showConfirm.value = true
}

// Handle transfer
async function handleContinue() {
  confirming.value = true
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      modal.open('Unauthorized', 'Token not found.')
      confirming.value = false
      return
    }
    const res = await fetch('https://su.oneled.io/api/save-transfer', {
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
      confirming.value = false
      return
    }
    showConfirm.value = false
    modal.open('Success', data.message || 'Transfer completed')
    setTimeout(() => {
      router.replace('/transfer')
    }, 1200)
  } catch {
    modal.open('Error', 'Server error')
  } finally {
    confirming.value = false
  }
}
</script>
