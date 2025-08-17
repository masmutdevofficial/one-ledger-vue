<!-- PaymentPage.vue -->
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { useApiAlertStore } from '@/stores/apiAlert'

const router = useRouter()
const modal = useApiAlertStore()

const DURATION = 30 * 60 * 1000

function getStartTime(): number {
  const key = 'paymentStartTime'
  const stored = localStorage.getItem(key)
  if (stored) return parseInt(stored, 10)
  const now = Date.now()
  localStorage.setItem(key, now.toString())
  return now
}

const startTime = getStartTime()
const remaining = ref<number>(DURATION)
let timer: number | null = null

function updateRemaining(): void {
  const now = Date.now()
  const diff = DURATION - (now - startTime)
  remaining.value = diff > 0 ? diff : 0
  if (remaining.value <= 0) {
    if (timer) clearInterval(timer)
    router.replace('/buy-p2p')
  }
}

onMounted(() => {
  updateRemaining()
  timer = window.setInterval(updateRemaining, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function goBack(): void {
  if (window.history.length > 1) router.back()
  else router.push('/buy-p2p')
}

function cancelOrder(): void {
  router.push('/buy-p2p')
}

async function copyText(value: string, fieldLabel?: string): Promise<void> {
  try {
    // Tulis ke clipboard
    await navigator.clipboard.writeText(value)
    // Modal sukses (bahasa Inggris)
    const label = fieldLabel ? `${fieldLabel} copied` : 'Copied'
    modal.open(label, 'Successfully copied to clipboard.')
  } catch {
    // Fallback modal error sederhana
    modal.open('Copy failed', 'Unable to copy to clipboard.')
  }
}
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <header class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
      <button aria-label="Go back" class="text-black text-xl" @click="goBack">
        <Icon icon="tabler:arrow-left" width="24" height="24" />
      </button>
      <button class="text-gray-400 text-sm underline" @click="cancelOrder">Cancel the Order</button>
    </header>

    <main class="flex-grow px-5 pt-5">
      <h1 class="text-xl font-normal mb-1">Open For Payment</h1>
      <p class="text-xs font-normal mb-5">
        Order will be canceled in
        <span class="font-semibold">{{ formatTime(remaining) }}</span>
      </p>

      <input
        type="text"
        readonly
        value="LucasFastpay"
        class="w-full rounded-lg border border-gray-300 px-4 py-3 mb-7 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-default"
        aria-label="Payment method"
      />

      <section class="space-y-5">
        <div>
          <p class="font-semibold text-sm mb-1">Transfer via: BCA</p>
        </div>

        <div>
          <p class="text-gray-500 text-xs mb-0.5">You Pay</p>
          <div class="flex items-center justify-between">
            <p class="font-bold text-base">Rp1.622.400,00</p>
            <button
              aria-label="Copy amount"
              class="text-black text-lg"
              @click="copyText('1622400', 'Amount')"
            >
              <Icon icon="tabler:copy" width="20" height="20" />
            </button>
          </div>
        </div>

        <div>
          <p class="text-gray-400 text-xs mb-0.5">Account Number</p>
          <div class="flex items-center justify-between">
            <p class="text-sm font-normal">8171787955</p>
            <button
              aria-label="Copy account number"
              class="text-black text-lg"
              @click="copyText('8171787955', 'Account number')"
            >
              <Icon icon="tabler:copy" width="20" height="20" />
            </button>
          </div>
        </div>

        <div>
          <p class="text-gray-400 text-xs mb-0.5">Name</p>
          <div class="flex items-center justify-between">
            <p class="text-sm font-normal">Atit</p>
            <button
              aria-label="Copy name"
              class="text-black text-lg"
              @click="copyText('Atit', 'Name')"
            >
              <Icon icon="tabler:copy" width="20" height="20" />
            </button>
          </div>
        </div>
      </section>

      <button
        type="button"
        class="w-full mt-8 bg-cyan-400 text-white text-base font-normal py-3 rounded-lg hover:bg-cyan-500"
      >
        Transferred, Notify Seller
      </button>
    </main>
  </div>
</template>
