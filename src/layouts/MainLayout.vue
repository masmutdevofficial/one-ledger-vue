<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'

// Halaman publik
const publicPages = [
  '/',
  '/login',
  '/register',
  '/verification',
  '/forgot-password',
  '/reset-password',
]
const router = useRouter()
const route = useRoute()
const isPublicPage = computed(() => publicPages.includes(route.path))

const isLoading = ref(true)
const isClient = ref(false)

onMounted(async () => {
  isClient.value = true // Pastikan loader muncul dulu di client

  // Cek hanya di client
  if (!publicPages.includes(route.path)) {
    const token = localStorage.getItem('token')
    const hasToken = !!token && token.trim() !== ''
    if (!hasToken) {
      await router.replace({
        path: '/login',
        query: { reason: 'unauthorized' },
      })
      // Jangan tampilkan slot, loader tetap sampai pindah halaman
      return
    }
  }
  isLoading.value = false
})

function isActive(path: string): boolean {
  return route.path.startsWith(path)
}

const noHeaderPaths = ['/account'] // bisa ditambah: '/account/settings', dll
const hideHeader = computed(() => noHeaderPaths.some((p) => route.path.startsWith(p)))

const teal600Filter = {
  filter:
    'brightness(0) saturate(100%) invert(33%) sepia(86%) saturate(373%) hue-rotate(130deg) brightness(92%) contrast(90%)',
}
// ---- Notification Badge
const API_BASE = 'https://one-ledger.masmutpanel.my.id/api'
function getToken(): string | null {
  return localStorage.getItem('token')
}

const loading = ref(false)
const notificationCount = ref<number>(0)

const notificationLabel = computed(() =>
  notificationCount.value > 99 ? '99+' : String(notificationCount.value),
)

const badgeClass = computed(() =>
  notificationCount.value > 99 ? 'w-5 h-5 text-[10px]' : 'w-4 h-4 text-[8px]',
)

async function fetchNotificationCount(): Promise<void> {
  const token = getToken()
  if (!token) {
    notificationCount.value = 0
    return
  }
  try {
    loading.value = true
    const res = await fetch(`${API_BASE}/notifications/count`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      // credentials: 'include', // aktifkan hanya jika pakai cookie Sanctum
    })
    if (res.status === 401) {
      localStorage.removeItem('token')
      await router.replace({ path: '/login', query: { reason: 'unauthorized' } })
      return
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as { count?: number }
    notificationCount.value = Number.isFinite(data.count as number) ? (data.count as number) : 0
  } catch {
    notificationCount.value = 0
  } finally {
    loading.value = false
  }
}

async function markAllRead(): Promise<void> {
  const token = getToken()
  if (!token) return
  try {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      // credentials: 'include',
    })
    if (res.status === 401) {
      localStorage.removeItem('token')
      await router.replace({ path: '/login', query: { reason: 'unauthorized' } })
      return
    }
    notificationCount.value = 0
  } catch {
    // silent
  }
}

async function handleClickNotification(): Promise<void> {
  await markAllRead()
  router.push('/notification')
}

type Quote = 'USDT'
function localLogo(symbol: string): string {
  // pakai logo lokal; biarkan 404 kalau belum ada, list tetap muncul
  return `/img/crypto/${symbol}.svg`
}

const SYMBOL_META: Record<string, { name: string; logoUrl: string; quote: Quote }> = {
  BTC: { name: 'Bitcoin', logoUrl: localLogo('btc'), quote: 'USDT' },
  ETH: { name: 'Ethereum', logoUrl: localLogo('eth'), quote: 'USDT' },
  BNB: { name: 'BNB (Binance Coin)', logoUrl: localLogo('bnb'), quote: 'USDT' },
  SOL: { name: 'Solana', logoUrl: localLogo('sol'), quote: 'USDT' },
  LTC: { name: 'Litecoin', logoUrl: localLogo('ltc'), quote: 'USDT' },
  LINK: { name: 'Chainlink', logoUrl: localLogo('link'), quote: 'USDT' },
  TON: { name: 'Toncoin', logoUrl: localLogo('ton'), quote: 'USDT' },
  SUI: { name: 'Sui', logoUrl: localLogo('sui'), quote: 'USDT' },
  XRP: { name: 'XRP', logoUrl: localLogo('xrp'), quote: 'USDT' },
  QTUM: { name: 'Qtum', logoUrl: localLogo('qtum'), quote: 'USDT' },
  THETA: { name: 'Theta Network', logoUrl: localLogo('theta'), quote: 'USDT' },
  ADA: { name: 'Cardano', logoUrl: localLogo('ada'), quote: 'USDT' },
  RAD: { name: 'Radworks (RAD)', logoUrl: localLogo('rad'), quote: 'USDT' },
  BAND: { name: 'Band Protocol', logoUrl: localLogo('band'), quote: 'USDT' },
  ALGO: { name: 'Algorand', logoUrl: localLogo('algo'), quote: 'USDT' },
  POL: { name: 'Polygon (POL)', logoUrl: localLogo('pol'), quote: 'USDT' },
  DOGE: { name: 'Dogecoin', logoUrl: localLogo('doge'), quote: 'USDT' },
  LUNA: { name: 'Terra (LUNA)', logoUrl: localLogo('luna'), quote: 'USDT' },
  GALA: { name: 'Gala', logoUrl: localLogo('gala'), quote: 'USDT' },
  PEPE: { name: 'Pepe', logoUrl: localLogo('pepe'), quote: 'USDT' },
}

const searchQuery = ref('')
const isFocused = ref(false)
let blurTimer: number | null = null

const inputRef = ref<HTMLInputElement | null>(null)

const filteredCoins = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []

  const entries = Object.entries(SYMBOL_META).map(([symbol, meta]) => ({
    symbol,
    name: meta.name,
    logoUrl: meta.logoUrl,
    quote: meta.quote,
  }))

  // cocokkan by startsWith lalu includes
  const starts = entries.filter(
    (c) => c.symbol.toLowerCase().startsWith(q) || c.name.toLowerCase().startsWith(q),
  )
  const includes = entries.filter(
    (c) =>
      (c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)) &&
      !starts.some((s) => s.symbol === c.symbol),
  )
  return [...starts, ...includes].slice(0, 10)
})

watch(searchQuery, (q) => {
  const val = q.trim()
  // buka dropdown ketika ada minimal 1 huruf
  if (val.length >= 1) {
    isFocused.value = true
  } else {
    // kosong → boleh ditutup
    isFocused.value = false
  }
})

function onFocus() {
  if (blurTimer) {
    clearTimeout(blurTimer)
    blurTimer = null
  }
  isFocused.value = true
}
function onBlur() {
  // tunda biar bisa klik item
  blurTimer = window.setTimeout(() => {
    isFocused.value = false
  }, 150)
}

function chooseCoin(coin: { symbol: string }) {
  searchQuery.value = coin.symbol
  // tetap tampilkan list & fokus input agar lanjut edit/replace
  isFocused.value = true
  nextTick(() => inputRef.value?.focus())
  window.location.href = `/trade?symbol=${coin.symbol.toLowerCase()}usdt`
}

onMounted(() => {
  fetchNotificationCount()
  window.addEventListener('focus', onFocus)
})
onBeforeUnmount(() => {
  window.removeEventListener('focus', onFocus)
})
</script>

<template>
  <div class="min-h-screen flex justify-center bg-black text-gray-900">
    <div class="w-full max-w-md bg-white min-h-screen flex flex-col relative">
      <!-- Header -->
      <!-- Top Navbar -->
      <nav
        v-if="!hideHeader"
        class="flex items-center justify-between px-4 py-3 w-full sticky top-0 z-50 bg-white shadow-sm"
      >
        <!-- Left Buttons -->
        <div class="flex space-x-6 items-center">
          <RouterLink to="/account" aria-label="Menu" class="focus:outline-none">
            <img src="/img/newmenu/menu.png" alt="Menu" class="w-7 h-7 object-contain" />
          </RouterLink>
          <RouterLink
            to="/notification"
            aria-label="Chat"
            class="focus:outline-none relative inline-block"
            @click.prevent="handleClickNotification"
          >
            <img src="/img/newmenu/notification.png" alt="Menu" class="w-7 h-7 object-contain" />

            <span
              v-if="notificationCount > 0"
              :class="[
                'absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-red-500 text-white font-bold animate-pulse min-w-[1rem] px-1',
                badgeClass,
              ]"
            >
              {{ notificationLabel }}
            </span>
          </RouterLink>
        </div>

        <!-- Spot/Futures Toggle -->
        <div
          class="relative flex items-center bg-gray-100 rounded-lg px-1.5 py-1 mr-5 text-sm font-medium"
        >
          <RouterLink
            to="/dashboard"
            class="px-3 py-1 rounded-lg transition"
            :class="isActive('/dashboard') ? 'bg-white text-black' : 'text-gray-600'"
          >
            Spot
          </RouterLink>
          <RouterLink
            to="/futures"
            class="px-3 py-1 rounded-lg transition"
            :class="isActive('/futures') ? 'bg-white text-black' : 'text-gray-600'"
          >
            Copy Trade
          </RouterLink>
        </div>

        <!-- Support -->
        <RouterLink to="#" aria-label="Support" class="focus:outline-none">
          <img src="/img/newmenu/support.png" alt="Menu" class="w-7 h-7 object-contain" />
        </RouterLink>
      </nav>

      <!-- Search Bar hanya di /dashboard -->
      <div v-if="$route.path === '/dashboard'">
        <div class="w-full px-4 pb-4 mt-3">
          <div class="relative w-full">
            <input
              v-model="searchQuery"
              type="search"
              placeholder="#HotJulyPPI"
              class="w-full rounded-xl bg-gray-100 text-gray-700 placeholder-gray-500 px-4 py-2 text-sm focus:outline-none pr-10"
              @focus="onFocus"
              @blur="onBlur"
              autocomplete="off"
            />
            <Icon
              icon="tabler:search"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none"
            />

            <!-- Suggestions -->
            <div
              v-if="isFocused && filteredCoins.length > 0"
              class="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-64 overflow-y-auto"
            >
              <button
                v-for="coin in filteredCoins"
                :key="coin.symbol"
                type="button"
                class="w-full flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer text-left"
                @mousedown.prevent="chooseCoin(coin)"
              >
                <img :src="coin.logoUrl" alt="" class="w-5 h-5 mr-2" />
                <span class="font-semibold text-gray-800 mr-1">{{ coin.symbol }}</span>
                <span class="text-gray-500 text-sm">({{ coin.name }})</span>
                <span class="ml-auto text-xs text-gray-400">{{ coin.quote }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- Main Content -->
      <main
        class="flex-1 overflow-y-auto relative"
        :class="$route.path === '/dashboard' ? '-pt-5' : 'pt-5'"
      >
        <!-- Loader -->
        <div
          v-if="isLoading && !isPublicPage"
          class="absolute inset-0 flex flex-col items-center justify-center bg-white z-50"
        >
          <svg
            class="animate-spin h-8 w-8 text-teal-600 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <span class="text-gray-600">Loading...</span>
        </div>
        <!-- Konten utama -->
        <template v-else>
          <router-view />

          <!-- Bottom Navigation -->
          <div
            class="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white shadow-md z-50"
          >
            <div class="flex justify-around items-center py-2">
              <RouterLink
                to="/dashboard"
                class="flex flex-col items-center"
                :class="isActive('/dashboard') ? 'text-teal-600' : 'text-gray-400'"
              >
                <img alt="Home" src="/img/logo.png" class="w-4 h-4 object-contain rotate-33" />
                <span class="text-xs mt-1 font-semibold">Home</span>
              </RouterLink>

              <RouterLink
                to="/market"
                class="flex flex-col items-center ml-2"
                :class="isActive('/market') ? 'text-teal-600' : 'text-gray-400'"
              >
                <img
                  alt="Market"
                  src="/img/markets-icon.png"
                  class="w-4 h-4 object-contain filter"
                  :style="isActive('/market') ? teal600Filter : null"
                />
                <span class="text-xs mt-1">Market</span>
              </RouterLink>

              <RouterLink
                to="/trade"
                class="flex flex-col items-center ml-4"
                :class="isActive('/trade') ? 'text-teal-600' : 'text-gray-400'"
              >
                <img
                  alt="Trade"
                  src="/img/trade-icon.png"
                  class="w-4 h-4 object-contain filter"
                  :style="isActive('/trade') ? teal600Filter : null"
                />
                <span class="text-xs mt-1">Trade</span>
              </RouterLink>

              <RouterLink
                to="/history"
                class="flex flex-col items-center"
                :class="isActive('/history') ? 'text-teal-600' : 'text-gray-400'"
              >
                <Icon icon="tabler:history" class="w-4 h-4 mt-[2px]" />
                <span class="text-xs mt-1 text-center">Order History</span>
              </RouterLink>

              <RouterLink
                to="/assets"
                class="flex flex-col items-center"
                :class="isActive('/assets') ? 'text-teal-600' : 'text-gray-400'"
              >
                <Icon icon="tabler:wallet" class="w-4 h-4 mt-[2px]" />
                <span class="text-xs mt-1">Assets</span>
              </RouterLink>
            </div>
          </div>
        </template>
      </main>
    </div>
  </div>
</template>
