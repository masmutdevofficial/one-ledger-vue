<template>
  <main class="px-5 flex-grow mb-20">
    <!-- STATES -->
    <div v-if="loading" class="py-10 text-center text-sm text-gray-500">Loading…</div>
    <div v-else-if="errorMsg" class="py-10 text-center text-sm text-red-500">{{ errorMsg }}</div>
    <div v-else-if="!trader" class="py-10 text-center text-sm text-gray-500">No Data Available</div>

    <!-- CONTENT -->
    <template v-else>
      <!-- Back -->
      <button
        aria-label="Back"
        class="mb-4 inline-flex items-center text-black"
        type="button"
        @click="goBack"
      >
        <Icon icon="tabler:arrow-left" class="w-6 h-6" />
      </button>

      <!-- Profile & title -->
      <div class="flex items-center gap-4 mb-1">
        <img
          :alt="`${trader.name} avatar`"
          class="w-12 h-12 rounded-full object-cover"
          :src="avatarUrl"
          @error="onAvatarError"
        />
        <h1 class="font-extrabold text-lg flex items-center gap-2">
          <span>{{ trader.name }}</span>
          <Icon
            v-if="trader.is_featured"
            icon="tabler:shield-check"
            class="w-5 h-5 text-amber-500"
          />
        </h1>
      </div>

      <!-- sub title (opsional, bisa ganti sesuai kebutuhan) -->
      <p class="text-sm mb-2">Fixed ratio only. Target APR 400% / MDD {{ trader.mdd_30d_pct }}%.</p>

      <!-- Badge -->
      <div
        class="inline-flex items-center bg-[#FFF4D1] text-[#D6B94D] text-xs font-semibold rounded-md px-2 py-1 mb-5 select-none"
      >
        <Icon icon="tabler:coins" class="w-4 h-4 mr-1" />
        <span>Profit Sharing 10%</span>
      </div>

      <!-- Fixed Amount -->
      <h2 class="font-semibold text-base mb-1">Fixed Amount</h2>
      <label for="copyAmount" class="text-gray-400 text-xs mb-1 block">Copy Amount</label>
      <div class="flex items-center bg-gray-100 rounded-md h-10 mb-1 px-3">
        <input
          id="copyAmount"
          aria-label="Copy Amount input"
          type="text"
          inputmode="decimal"
          class="bg-transparent w-full text-sm placeholder:text-gray-400 focus:outline-none"
          placeholder=""
        />
        <span class="text-xs font-semibold text-black ml-2">USDT</span>
        <button class="text-teal-400 text-xs font-semibold ml-3" type="button">Max</button>
      </div>
      <div class="flex items-center gap-1 text-[10px] text-gray-400 mb-5">
        <span>Available</span>
        <span class="font-normal">0,0022919 USDT</span>
        <button aria-label="Add" class="text-[#D6B94D] text-xs font-semibold" type="button">
          +
        </button>
      </div>

      <!-- Position Risk -->
      <h2 class="font-semibold text-base mb-2">Position Risk</h2>
      <div class="grid grid-cols-2 gap-4 mb-8">
        <!-- Take Profit -->
        <div>
          <label for="tp" class="text-gray-400 text-xs mb-1 block">Take Profit</label>
          <div class="relative">
            <input
              id="tp"
              v-model.number="tp"
              type="number"
              step="0.01"
              min="-100"
              max="100"
              inputmode="decimal"
              placeholder="0.00"
              class="w-full h-10 bg-gray-100 rounded-md px-3 pr-12 text-xs font-semibold text-black focus:outline-none"
              @input="fixComma($event)"
            />
            <span
              class="absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-gray-700 pointer-events-none"
            >
              % ROI
            </span>
          </div>
        </div>

        <!-- Stop Loss -->
        <div>
          <label for="sl" class="text-gray-400 text-xs mb-1 block">Stop Loss</label>
          <div class="relative">
            <input
              id="sl"
              v-model.number="sl"
              type="number"
              step="0.01"
              min="-100"
              max="100"
              inputmode="decimal"
              placeholder="0.00"
              class="w-full h-10 bg-gray-100 rounded-md px-3 pr-12 text-xs font-semibold text-black focus:outline-none"
              @input="fixComma($event)"
            />
            <span
              class="absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-gray-700 pointer-events-none"
            >
              % ROI
            </span>
          </div>
        </div>
      </div>

      <!-- Summary (pakai data dari API untuk ROI & PnL) -->
      <div class="mb-8">
        <div class="flex justify-between text-xs text-gray-400 mb-1">
          <span class="underline">Net Copy Amount</span>
          <span class="text-black">10.000,0000</span>
        </div>
        <div class="flex justify-between text-xs text-gray-400 mb-1">
          <span class="underline">{{ trader.text_roi_30d_pct || '30D ROI' }}</span>
          <span class="text-teal-400">{{ signedPercent(trader.roi_30d_pct) }}</span>
        </div>
        <div class="flex justify-between text-xs text-gray-400 mb-1">
          <span class="underline">{{ trader.text_pnl_30d || '30D PnL' }} (USDT)</span>
          <span :class="trader.pnl_30d >= 0 ? 'text-teal-400' : 'text-red-500'">
            {{ signedMoney(trader.pnl_30d, 4) }}
          </span>
        </div>
        <button
          class="mt-3 bg-teal-400 hover:bg-teal-500 text-white text-xs rounded-md py-1 px-3 float-right"
          type="button"
        >
          Close Position
        </button>
      </div>
    </template>
  </main>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const tp = ref<number | null>(null) // contoh: 20.5
const sl = ref<number | null>(null)

/** Ganti koma menjadi titik agar 20,5 -> 20.5 */
function fixComma(e: Event) {
  const el = e.target as HTMLInputElement
  if (!el) return
  // normalize: ganti koma -> titik
  el.value = el.value.replace(',', '.')
}
// Pakai beberapa kemungkinan nama param, ambil yang pertama ketemu
const paramSlug = computed(() => {
  const p = route.params as Record<string, unknown>
  const raw = (p.slug ?? p.username ?? p.trader ?? p.id ?? '') as string
  return (raw ?? '').toString().trim()
})

// Base URL API (explicit, biar nggak salah path)
const API_BASE = 'https://ledger.masmutdev.id/api'

// ----- State & types -----
type Trader = {
  id: number
  name: string
  slug: string
  avatar_url?: string | null
  is_featured: boolean
  copies_used: number
  copies_limit: number
  text_pnl_30d: string
  text_roi_30d_pct: string
  text_mdd_30d_pct: string
  text_aum: string
  text_sharpe_ratio: string
  pnl_30d: number
  roi_30d_pct: number
  mdd_30d_pct: number
  aum: number
  sharpe_ratio: number
  created_at?: string
  updated_at?: string
}

const trader = ref<Trader | null>(null)
const loading = ref(true)
const errorMsg = ref<string | null>(null)
const avatarBroken = ref(false)

// Helpers
function ensureAbsoluteUrl(u?: string | null): string | null {
  if (!u) return null
  if (/^https?:\/\//i.test(u)) return u
  const base = 'https://ledger.masmutdev.id/'
  return base + u.replace(/^\/+/, '')
}
const avatarUrl = computed(() => {
  const u = ensureAbsoluteUrl(trader.value?.avatar_url || null)
  return avatarBroken.value || !u ? 'https://placehold.co/48x48/png?text=?' : u
})
function onAvatarError() {
  avatarBroken.value = true
}
function signedPercent(v: number): string {
  if (!Number.isFinite(v)) return '0,00%'
  const s = v >= 0 ? '+' : ''
  return s + v.toFixed(2) + '%'
}
function signedMoney(v: number, dp = 2): string {
  if (!Number.isFinite(v)) return '0'
  const s = v >= 0 ? '+' : ''
  return s + v.toFixed(dp)
}
function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/copy')
}

// Fetcher
async function loadTrader(slug: string) {
  loading.value = true
  errorMsg.value = null
  trader.value = null
  avatarBroken.value = false

  try {
    const headers: Record<string, string> = { Accept: 'application/json' }
    const token = localStorage.getItem('token')
    if (token && token.trim()) headers.Authorization = `Bearer ${token}`

    const res = await fetch(`${API_BASE}/data-lable-copy-trading/${encodeURIComponent(slug)}`, {
      headers,
    })

    if (res.status === 404) {
      // No Data
      trader.value = null
      return
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = (await res.json()) as Trader
    trader.value = data
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Gagal memuat data.'
    trader.value = null
  } finally {
    loading.value = false
  }
}

// Trigger fetch begitu paramSlug terisi (dan ulangi saat berubah)
watch(
  paramSlug,
  (s) => {
    if (!s) {
      loading.value = false
      trader.value = null
      return
    }
    loadTrader(s)
  },
  { immediate: true },
)
</script>
