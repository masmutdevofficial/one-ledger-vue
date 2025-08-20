<template>
  <div class="max-w-md w-full mx-auto p-5 flex flex-col h-screen">
    <!-- Header -->
    <div class="flex items-center mb-6">
      <button @click="router.back()" aria-label="Back" class="text-gray-700 text-lg">
        <Icon icon="tabler:arrow-left" class="w-5 h-5" />
      </button>
      <h1 class="flex-grow text-center font-semibold text-base text-black">Send USDT</h1>
      <div class="w-6"></div>
    </div>

    <!-- Address -->
    <div class="mb-4">
      <label for="address" class="block text-xs font-normal text-gray-600 mb-1">Address</label>
      <div class="relative">
        <input
          id="address"
          type="text"
          v-model="address"
          placeholder="Long press to paste"
          class="w-full rounded-lg bg-gray-100 text-gray-400 text-xs font-normal py-2.5 pr-10 pl-3 placeholder-gray-400"
        />
        <div class="absolute right-3 top-1/2 -translate-y-1/2 flex space-x-2 text-gray-400 text-xs">
          <button aria-label="User icon" class="flex items-center justify-center">
            <Icon icon="tabler:user-circle" class="w-4 h-4" />
          </button>
          <button aria-label="Scan QR code" class="flex items-center justify-center">
            <Icon icon="tabler:scan" class="w-4 h-4" />
          </button>
        </div>
      </div>
      <p class="text-[12px] text-red-500 mt-1 font-normal">Please enter Recipient's Address</p>
    </div>

    <!-- Network -->
    <div class="mb-4">
      <label for="network" class="block text-xs font-normal text-gray-600 mb-1 flex items-center">
        Network
        <button aria-label="Info" class="ml-1 text-gray-400 text-xs">
          <Icon icon="tabler:info-circle" class="w-3.5 h-3.5" />
        </button>
      </label>
      <select
        id="network"
        v-model="selectedNetwork"
        class="w-full rounded-lg bg-gray-100 text-gray-700 text-xs font-normal py-2.5 px-3 cursor-pointer"
      >
        <option v-for="net in networks" :key="net.value" :value="net.value">
          {{ net.label }}
        </option>
      </select>
      <p class="text-[12px] text-gray-400 mt-1 font-normal leading-tight">
        CAUTION: Ensure the recipient address has been activated; otherwise, your withdrawal will
        fail.
      </p>
    </div>

    <!-- Amount -->
    <div class="mb-4">
      <label for="amount" class="block text-xs font-normal text-gray-600 mb-1">Amount</label>
      <div class="flex items-center rounded-lg bg-gray-100 py-2.5 px-3">
        <input
          id="amount"
          type="text"
          v-model="amount"
          placeholder="Minimum 10"
          class="flex-grow bg-transparent text-xs font-normal text-gray-400 placeholder-gray-400 outline-none"
        />
        <span class="text-xs font-normal text-gray-700 mr-3 select-none">USDT</span>
        <button @click="setMax" class="text-xs font-normal text-cyan-400">Max</button>
      </div>
      <div
        class="flex justify-end mt-1 text-[12px] text-gray-700 font-normal cursor-pointer select-none"
      >
        <span v-if="saldo !== null && !loading"
          >{{ saldo.toLocaleString('en-US', { minimumFractionDigits: 7 }) }} USDT</span
        >
        <span v-else-if="loading">...</span>
        <span v-else>-</span>
        <Icon icon="tabler:chevron-down" class="w-3 h-3 ml-1 text-gray-400" />
      </div>
    </div>

    <!-- Contract Information -->
    <div class="text-[12px] text-gray-400 font-normal leading-tight mb-6">
      <p>* Contract Information</p>
      <p>
        * Do not withdraw directly to a crowdfund or ICO. We will not credit your account with
        tokens from that sale.
      </p>
      <p>* Do not transact with Sanctioned Entities.</p>
    </div>

    <!-- Footer -->
    <div class="mt-20 flex items-center justify-between border-t border-gray-100 pt-4">
      <div>
        <span
          class="flex flex-row justify-start items-center text-xs font-semibold text-gray-900 leading-none"
        >
          <p class="mr-2">Receive amount</p>
          <button aria-label="Switch receive amount" class="text-gray-400 text-xs">
            <Icon icon="tabler:arrows-left-right" class="w-4 h-4" />
          </button>
        </span>
        <div class="flex items-center space-x-1">
          <p class="text-xl font-bold text-black leading-none">{{ receiveAmount }}</p>
          <p class="text-xs font-semibold text-gray-900 leading-none">USDT</p>
        </div>
        <p class="text-[12px] text-cyan-400 font-normal">Network fee 1,00 USDT</p>
      </div>
      <button
        type="button"
        :disabled="submitting"
        @click="submitWithdraw"
        class="bg-cyan-300 text-white text-sm font-semibold rounded-lg px-10 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="submitting">Processing...</span>
        <span v-else>Send</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useApiAlertStore } from '@/stores/apiAlert'

const router = useRouter()
const saldo = ref<number>(0)
const loading = ref(true)
const modal = useApiAlertStore()

const amount = ref<string>('')
const address = ref<string>('') // <-- Tambah ini untuk v-model
const submitting = ref(false)

const networks = [
  { label: 'Tron (TRC20)', value: 'trc20' },
  { label: 'Ethereum (ERC20)', value: 'erc20' },
  { label: 'BNB Smart Chain (BEP20)', value: 'bep20' },
]
const selectedNetwork = ref(networks[0].value)

// Komputasi receive amount
const receiveAmount = computed(() => {
  const value = parseFloat(amount.value.replace(',', '.')) || 0
  const afterFee = value - 1
  return afterFee > 0
    ? afterFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '0.00'
})

onMounted(async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      saldo.value = 0
      loading.value = false
      return
    }
    const res = await fetch('https://one-ledger.masmutpanel.my.id/api/get-saldo', {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    const data = await res.json()
    if (res.ok && data.status === 'success') {
      saldo.value = Number(data.saldo || 0)
    } else {
      saldo.value = 0
    }
  } catch {
    saldo.value = 0
  }
  loading.value = false
})

// Fungsi Max
function setMax() {
  if (!saldo.value || saldo.value === 0) {
    modal.open('Alert !', 'insufficient balance.')
    return
  }
  amount.value = saldo.value.toString()
}

// Fungsi submit withdraw
async function submitWithdraw() {
  if (submitting.value) return
  // Validasi address
  if (!address.value.trim()) {
    modal.open('Error', `Recipient address required`)
    return
  }

  // Validasi amount
  const rawAmount = parseFloat(amount.value.replace(',', '.')) || 0
  const sendAmount = rawAmount - 1

  if (!rawAmount || rawAmount < 10) {
    modal.open('Error', 'Minimum amount is 10')
    return
  }
  if (sendAmount <= 0) {
    modal.open('Error', 'Amount after fee must be greater than 0')
    return
  }
  if (rawAmount > saldo.value) {
    modal.open('Error', 'insufficient balance.')
    return
  }

  submitting.value = true
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      modal.open('Error', 'Token not found')
      submitting.value = false
      return
    }

    const res = await fetch('https://one-ledger.masmutpanel.my.id/api/save-withdraw', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        network: selectedNetwork.value,
        network_address: address.value.trim(),
        jumlah: sendAmount,
        // Tambah payment_method/dsb kalau memang perlu, kalau tidak ya sudah
      }),
    })
    const data = await res.json()
    if (res.ok && data.status === 'success') {
      modal.open('Success', 'Withdraw request submitted')
      // reset form / redirect
      amount.value = ''
      address.value = ''
      router.back()
    } else {
      modal.open('Error', data.message || 'Failed to submit withdraw')
    }
  } catch {
    modal.open('Error', 'Server error')
  } finally {
    submitting.value = false
  }
}
</script>
