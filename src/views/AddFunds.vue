<template>
  <div class="flex flex-col min-h-screen px-4 pt-6">
    <!-- Header -->
    <header class="flex items-center mb-6">
      <button aria-label="Back" class="text-black text-lg" @click="router.back()">
        <Icon icon="tabler:arrow-left" class="w-5 h-5" />
      </button>
      <h1 class="flex-1 text-center text-base font-semibold">Deposit USDT</h1>
      <div class="w-6"></div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow">
      <!-- QR Code -->
      <div class="flex justify-center mb-6">
        <!-- QR Code -->
        <img
          :src="deposit.usdt_qr"
          alt="QR code with shield icon in the center"
          class="w-36 h-36"
          width="150"
          height="150"
        />
      </div>

      <!-- Deposit Info -->
      <section
        aria-label="Deposit address details"
        class="border border-gray-200 rounded-xl p-4 mb-6 max-w-md mx-auto"
      >
        <div class="mb-4">
          <p class="text-gray-400 text-xs mb-1">Network</p>
          <p class="text-black text-sm font-semibold">Tron (TRC20)</p>
        </div>
        <hr class="border-gray-200 mb-4" />

        <!-- Deposit Address -->
        <div class="flex items-center justify-between">
          <div class="max-w-[70%]">
            <p class="text-gray-400 text-xs mb-1">Deposit Address</p>
            <p aria-label="Deposit address" class="text-black text-sm font-semibold break-all">
              {{ deposit.usdt_wallet }}
            </p>
          </div>
          <button
            aria-label="Copy deposit address"
            @click="copyToClipboard"
            class="text-gray-400 hover:text-gray-600 ml-2"
            type="button"
          >
            <Icon icon="tabler:copy" class="w-5 h-5" />
          </button>
        </div>
      </section>

      <!-- Info Notes -->
      <section class="max-w-md mx-auto text-xs text-gray-600 space-y-1 mb-10">
        <div class="flex justify-between">
          <span>Minimum deposit</span>
          <span class="font-semibold">100 USDT</span>
        </div>
        <div class="flex justify-between">
          <span>Credited (Trading enabled)</span>
          <span class="font-semibold">1 Confirmation</span>
        </div>
        <div class="flex justify-between">
          <span>Unlocked (Withdrawal enabled)</span>
          <span class="font-semibold">1 Confirmation</span>
        </div>
        <p class="text-gray-400 leading-tight">* Do not transact with Sanctioned Entities.</p>
        <p class="text-gray-400 leading-tight">* Don't send NFTs to this address.</p>
      </section>
    </main>

    <!-- Footer -->
    <footer class="w-full mb-20">
      <button
        type="button"
        @click="copyToClipboard"
        class="w-full bg-teal-400 active:bg-teal-500 text-white text-lg py-3 rounded-lg font-light transition-colors"
      >
        Save and Share Address
      </button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useApiAlertStore } from '@/stores/apiAlert'

const modal = useApiAlertStore()
const router = useRouter()

const defaultDeposit = {
  usdt_wallet: 'TRksMjUu2g4HSRo4Qaay8p71pzo8u5CVdy',
  usdt_qr: 'https://storage.googleapis.com/a1aa/image/53ffc1bc-cd09-4f53-8a7a-f59ba342a5f9.jpg',
}

const deposit = ref({ ...defaultDeposit })

onMounted(async () => {
  const token = localStorage.getItem('token')

  if (!token) {
    // Handle unauthorized, misal show alert, redirect, dsb
    // Contoh (jika pakai modal Pinia/alert store): modal.open('Unauthorized', 'Token tidak ditemukan.')
    deposit.value = { ...defaultDeposit }
    return
  }

  try {
    const res = await fetch('https://ledger.masmutdev.id/api/web-deposit', {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    if (!res.ok) throw new Error('Gagal ambil data')
    const data = await res.json()
    deposit.value = {
      usdt_wallet: data.usdt_wallet || defaultDeposit.usdt_wallet,
      usdt_qr: data.usdt_qr
        ? `https://ledger.masmutdev.id/storage/${data.usdt_qr}`
        : defaultDeposit.usdt_qr,
    }
  } catch {
    deposit.value = { ...defaultDeposit }
  }
})

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(deposit.value.usdt_wallet)
    modal.open('Copied!', 'Deposit address copied to clipboard.')
  } catch {
    modal.open('Failed', 'Copy to clipboard failed.')
  }
}
</script>
