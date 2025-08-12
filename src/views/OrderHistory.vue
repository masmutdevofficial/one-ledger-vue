<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, onMounted, computed } from 'vue'

type HistoryItem = {
  id: number | string
  id_users: number | string
  symbol: string
  jenis: 'BUY' | 'SELL' | string
  daily_pnl: string
  pnl: string // contoh: "1.02%"
  last_prices: string // disimpan string, parse ke number saat tampil
  balances: string | number
  detail_balances: string
  status_position: number | string
  time_order: string // "YYYY-MM-DD HH:mm:ss" UTC
  created_at: string
  updated_at: string
}

const API_BASE = 'https://ledger.masmutdev.id/api'

const loading = ref(true)
const errorMsg = ref<string | null>(null)
const items = ref<HistoryItem[]>([])

function fmtUsd(n: number) {
  return `${n.toLocaleString('en-US', { maximumFractionDigits: 2 })} USD`
}

function fmtCoin(n: number, sym: string) {
  return `${n.toFixed(8)} ${sym}`
}

function fmtDate(s: string) {
  // backend UTC "YYYY-MM-DD HH:mm:ss" → tampilkan apa adanya
  // atau bisa new Date(s + 'Z') kalau ingin localize
  return s
}

async function fetchHistory() {
  loading.value = true
  errorMsg.value = null
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Token tidak ada.')

    const res = await fetch(`${API_BASE}/crypto-history`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    if (!res.ok) {
      const t = await res.text()
      throw new Error(t || `Request failed (${res.status})`)
    }

    const data = await res.json()
    items.value = Array.isArray(data) ? data : []
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Gagal memuat data.'
    items.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchHistory)
</script>

<template>
  <div class="mx-5 mb-20">
    <!-- Loading / Error / Empty -->
    <div v-if="loading" class="text-sm text-gray-500 py-6 text-center">Loading history…</div>
    <div v-else-if="errorMsg" class="text-sm text-red-500 py-6 text-center">{{ errorMsg }}</div>
    <div v-else-if="items.length === 0" class="text-sm text-gray-500 py-6 text-center">
      Tidak ada history (closed orders).
    </div>

    <!-- List Kartu -->
    <div v-else class="space-y-6">
      <main v-for="it in items" :key="it.id" class="bg-[#F9FAFB] rounded-3xl p-6 flex-grow">
        <!-- Title -->
        <h1 class="text-center font-extrabold text-lg mb-3">{{ it.symbol }}/USD</h1>

        <!-- Status (Closed = success) -->
        <div class="flex flex-col items-center mb-3">
          <div class="w-10 h-10 rounded-full bg-[#3AA87D] flex items-center justify-center mb-1">
            <Icon icon="tabler:check" class="text-white w-6 h-6" />
          </div>
          <p class="text-gray-400 text-sm">Successful</p>
        </div>

        <!-- Order Info -->
        <dl class="mb-4">
          <div class="flex justify-between mb-2">
            <dt class="text-gray-400 text-sm">Order No.</dt>
            <dd class="text-black text-sm font-normal">{{ it.id }}</dd>
          </div>
          <div class="flex justify-between mb-2">
            <dt class="text-gray-400 text-sm">Date</dt>
            <dd class="text-black text-sm font-normal">{{ fmtDate(it.time_order) }}</dd>
          </div>
          <div class="flex justify-between mb-2">
            <dt class="text-gray-400 text-sm">Type</dt>
            <dd
              class="text-sm font-normal"
              :class="it.jenis === 'BUY' ? 'text-[#3AA87D]' : 'text-red-500'"
            >
              {{ it.jenis }}
            </dd>
          </div>
          <div class="flex justify-between mb-2">
            <dt class="text-gray-400 text-sm">Amount</dt>
            <dd class="text-black text-sm font-normal">
              <!-- balances disimpan dalam USDT di backend -->
              {{ fmtUsd(Number(it.balances)) }}
            </dd>
          </div>
        </dl>

        <hr class="border-gray-300 mb-3" />

        <!-- Trade Detail -->
        <p class="font-semibold text-sm mb-3">Trade detail</p>
        <dl class="mb-4">
          <div class="flex justify-between mb-2">
            <dt class="text-gray-400 text-sm">Price Buy</dt>
            <dd class="text-black text-sm font-normal">
              <!-- Kalau jenis BUY, anggap last_prices adalah harga buy; selain itu '-' -->
              <span v-if="it.jenis === 'BUY'">
                {{ Number(it.last_prices).toLocaleString('en-US', { maximumFractionDigits: 2 }) }}
                USD
              </span>
              <span v-else>-</span>
            </dd>
          </div>

          <div class="flex justify-between mb-2">
            <dt class="text-gray-400 text-sm">Price Sell</dt>
            <dd class="text-black text-sm font-normal">
              <!-- Kalau jenis SELL, anggap last_prices adalah harga sell; selain itu '-' -->
              <span v-if="it.jenis === 'SELL'">
                {{ Number(it.last_prices).toLocaleString('en-US', { maximumFractionDigits: 2 }) }}
                USD
              </span>
              <span v-else>-</span>
            </dd>
          </div>

          <div class="flex justify-between mb-2">
            <dt class="text-gray-400 text-sm">PNL</dt>
            <dd
              class="text-sm font-normal"
              :class="it.pnl?.startsWith('-') ? 'text-red-500' : 'text-[#3AA87D]'"
            >
              {{ it.pnl || '--' }}
            </dd>
          </div>
        </dl>

        <hr class="border-gray-300 mb-3" />

        <!-- Fee & Total (dummy/placeholder sesuai desain awal) -->
        <dl class="mb-6">
          <div class="flex justify-between mb-2">
            <dt class="text-gray-400 text-sm">Fee</dt>
            <dd class="text-black text-sm font-normal">0.00</dd>
          </div>
          <div class="flex justify-between mb-2">
            <dt class="text-gray-400 text-sm">Tax</dt>
            <dd class="text-black text-sm font-normal">0.00</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-400 text-sm">Total</dt>
            <dd class="text-[#3AA87D] text-sm font-normal">
              {{ fmtUsd(Number(it.balances)) }}
            </dd>
          </div>
        </dl>

        <!-- Logo -->
        <div class="flex justify-center">
          <img
            src="/img/vertical-logo.png"
            alt="OneLedger Logo"
            width="180"
            height="80"
            class="opacity-40"
          />
        </div>
      </main>
    </div>
  </div>
</template>
