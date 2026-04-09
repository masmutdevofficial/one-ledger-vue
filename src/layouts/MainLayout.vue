<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useNotificationCounter } from '@/composables/useNotificationCounter'
import { SYMBOL_META } from '@/lib/constants/symbols'
import { config } from '@/lib/config'

// ===== Support chat unread (internal Laravel API) =====
const supportUnread = ref(0)
const supportLabel = computed(() => (supportUnread.value > 99 ? '99+' : String(supportUnread.value)))
let supportTimer: number | null = null

async function fetchSupportUnread() {
  try {
    const token = localStorage.getItem('token')?.trim() ?? ''
    if (!token) {
      supportUnread.value = 0
      return
    }

    const res = await fetch(`${config.apiUrl}/cs/me/unread`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    })
    const json = (await res.json().catch(() => null)) as null | { data?: Array<{ unread?: number }> }
    if (!res.ok) throw new Error((json as any)?.message || `HTTP ${res.status}`)

    const rows = Array.isArray(json?.data) ? json.data : []
    supportUnread.value = rows.reduce((acc, r) => acc + Number(r?.unread || 0), 0)
  } catch {
    supportUnread.value = 0
  }
}

// state modal
const showRestrict = ref(false)

// TODO: ganti logika eligibility sesuai kebutuhan Anda
function isEligibleForFutures(): boolean {
  // misal cek umur akun / status KYC / flag backend dsb.
  return false
}

function closeRestrict() {
  showRestrict.value = false
}

// handler klik futures: cegah navigasi + tampilkan notice
async function onClickFutures(e: MouseEvent) {
  e.preventDefault() // kita handle navigasinya manual

  // 1) Navigasi ke halaman /future DULU
  if (!isActive('/future')) {
    await router.push('/future')
  }

  // 2) Setelah berada di halaman /future, cek eligibility.
  //    Jika belum eligible => tampilkan notice.
  if (!isEligibleForFutures()) {
    showRestrict.value = true
  }
}

const { notificationCount, notificationLabel, badgeClass, handleClickNotification } =
  useNotificationCounter()

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

  // kick off support unread polling for authenticated pages
  if (!publicPages.includes(route.path)) {
    await fetchSupportUnread()
    if (supportTimer) window.clearInterval(supportTimer)
    supportTimer = window.setInterval(fetchSupportUnread, 15000)
  }
})

onBeforeUnmount(() => {
  if (supportTimer) window.clearInterval(supportTimer)
})

function isActive(path: string): boolean {
  return route.path.startsWith(path)
}

const noHeaderPaths = ['/account', '/customer-service'] // bisa ditambah: '/account/settings', dll
const hideHeader = computed(() => noHeaderPaths.some((p) => route.path.startsWith(p)))
const hideBottomNav = computed(
  () =>
    route.name === 'chats' ||
    route.path.includes('/chats') ||
    route.name === 'customer-service' ||
    route.path.includes('/customer-service') ||
    route.name === 'smart-arbitrage' ||
    route.path.includes('/smart-arbitrage') ||
    route.name === 'event' ||
    route.path.includes('/event') ||
    route.name === 'more' ||
    route.path.includes('/more') ||
    route.name === 'profile-copy-trade' ||
    route.path.includes('/profile-copy-trade'),
)

const teal600Filter = {
  filter:
    'brightness(0) saturate(100%) invert(33%) sepia(86%) saturate(373%) hue-rotate(130deg) brightness(92%) contrast(90%)',
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
  isFocused.value = true
  nextTick(() => inputRef.value?.focus())
  router.push(`/trade?symbol=${coin.symbol.toLowerCase()}usdt`)
}

onMounted(() => {
  window.addEventListener('focus', onFocus)
})

onBeforeUnmount(() => {
  window.removeEventListener('focus', onFocus)
  if (supportTimer) window.clearInterval(supportTimer)
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
                'absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-red-500 text-white font-bold animate-pulse min-w-4 px-1',
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

        <!-- Support (link to customer-service with unread badge) -->
        <RouterLink
          to="/customer-service"
          aria-label="Support"
          class="focus:outline-none relative inline-block"
        >
          <img src="/img/newmenu/support.png" alt="Menu" class="w-7 h-7 object-contain" />
          <span
            v-if="supportUnread > 0"
            :class="[
                'absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-red-500 text-white font-bold animate-pulse min-w-4 px-1',
              badgeClass,
            ]"
          >
            {{ supportLabel }}
          </span>
        </RouterLink>
      </nav>

      <!-- Search Bar hanya di /dashboard -->
      <div
        v-if="$route.path === '/dashboard' || $route.path === '/market'"
        :class="
          $route.path === '/market' ? 'sticky top-15 z-40 bg-white border-b border-gray-200' : ''
        "
      >
        <div :class="['w-full px-4 pb-4', $route.path === '/market' ? 'pt-3' : 'mt-3']">
          <div class="relative w-full no-ios-zoom">
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
        :class="['/dashboard', '/customer-service'].includes($route.path) ? '-pt-5' : 'pt-5'"
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
            v-if="!hideBottomNav"
            class="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white shadow-md z-50"
          >
            <div class="flex justify-around items-center py-2">
              <RouterLink
                to="/dashboard"
                class="flex flex-col items-center"
                :class="isActive('/dashboard') ? 'text-teal-600' : 'text-gray-400'"
              >
                <img alt="Home" src="/img/logo-symetric.png" class="w-4 h-4 object-contain" />
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
                class="flex flex-col items-center ml-2"
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

              <!-- FUTURES (blokir + notice) -->
              <RouterLink
                to="/future"
                class="flex flex-col items-center"
                :class="isActive('/future') ? 'text-teal-600' : 'text-gray-400'"
                @click.prevent="onClickFutures"
              >
                <img
                  alt="Trade"
                  src="/img/futures.png"
                  class="w-4 h-4 object-contain filter"
                  :style="isActive('/future') ? teal600Filter : null"
                />
                <span class="text-xs mt-1 text-center">Futures</span>
              </RouterLink>

              <!-- Notice di-teleport ke body -->
              <teleport to="body">
                <div
                  v-if="showRestrict"
                  class="fixed inset-0 z-1000 flex items-center justify-center"
                  role="dialog"
                  aria-modal="true"
                >
                  <button
                    type="button"
                    class="absolute inset-0 bg-black/40"
                    aria-label="Close"
                    @click="closeRestrict"
                  />
                  <div class="relative mx-4 w-full max-w-sm rounded-lg bg-white p-4 shadow-lg">
                    <div class="flex items-start gap-2">
                      <div>
                        <h3 class="font-semibold text-black mb-1">⚠️ Notice</h3>
                        <p class="text-sm text-gray-700">
                          Your account is still new.<br />
                          The Futures Trading feature will be available once your account has been
                          active for a longer period.
                        </p>
                        <p class="text-sm text-gray-500 mt-2">
                          This is to ensure security and provide you with the best trading
                          experience.<br />
                          Thank you for your understanding.
                        </p>
                      </div>
                    </div>
                    <div class="mt-4 flex justify-end">
                      <button
                        type="button"
                        class="px-3 py-1.5 rounded-md border border-gray-300 text-sm"
                        @click="closeRestrict"
                      >
                        OK
                      </button>
                    </div>
                  </div>
                </div>
              </teleport>

              <RouterLink
                to="/assets"
                class="flex flex-col items-center"
                :class="isActive('/assets') ? 'text-teal-600' : 'text-gray-400'"
              >
                <Icon icon="tabler:wallet" class="w-4 h-4 mt-0.5" />
                <span class="text-xs mt-1">Assets</span>
              </RouterLink>
            </div>
          </div>
        </template>
      </main>
    </div>
  </div>
</template>
