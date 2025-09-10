<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useNotificationCounter } from '@/composables/useNotificationCounter'

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
})

function isActive(path: string): boolean {
  return route.path.startsWith(path)
}

const noHeaderPaths = ['/account'] // bisa ditambah: '/account/settings', dll
const hideHeader = computed(() => noHeaderPaths.some((p) => route.path.startsWith(p)))
const hideBottomNav = computed(
  () =>
    route.name === 'chats' ||
    route.path.includes('/chats') ||
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
  POL: { name: 'Polygon Matic (POL)', logoUrl: localLogo('pol'), quote: 'USDT' },
  DOGE: { name: 'Dogecoin', logoUrl: localLogo('doge'), quote: 'USDT' },
  LUNA: { name: 'Terra (LUNA)', logoUrl: localLogo('luna'), quote: 'USDT' },
  GALA: { name: 'Gala', logoUrl: localLogo('gala'), quote: 'USDT' },
  PEPE: { name: 'Pepe', logoUrl: localLogo('pepe'), quote: 'USDT' },
  CFX: { name: 'Conflux', logoUrl: localLogo('cfx'), quote: 'USDT' },
  TRX: { name: 'TRON', logoUrl: localLogo('trx'), quote: 'USDT' },
  TRUMP: { name: 'TRUMP', logoUrl: localLogo('trump'), quote: 'USDT' },
  SHIB: { name: 'Shiba Inu', logoUrl: localLogo('shib'), quote: 'USDT' },
  ARB: { name: 'Arbitrum', logoUrl: localLogo('arb'), quote: 'USDT' },
  FIL: { name: 'Filecoin', logoUrl: localLogo('fil'), quote: 'USDT' },
  API3: { name: 'API3', logoUrl: localLogo('api3'), quote: 'USDT' },
  ENA: { name: 'Ethena', logoUrl: localLogo('ena'), quote: 'USDT' },
  BIO: { name: 'BIO', logoUrl: localLogo('bio'), quote: 'USDT' },
  UNI: { name: 'Uniswap', logoUrl: localLogo('uni'), quote: 'USDT' },
  BTT: { name: 'BitTorrent', logoUrl: localLogo('btt'), quote: 'USDT' },
  SATS: { name: 'SATS', logoUrl: localLogo('sats'), quote: 'USDT' },
  MEME: { name: 'MEME', logoUrl: localLogo('meme'), quote: 'USDT' },
  GT: { name: 'GateToken', logoUrl: localLogo('gt'), quote: 'USDT' },
  OP: { name: 'Optimism', logoUrl: localLogo('op'), quote: 'USDT' },
  AAVE: { name: 'Aave', logoUrl: localLogo('aave'), quote: 'USDT' },
  SNAKES: { name: 'SNAKES', logoUrl: localLogo('snakes'), quote: 'USDT' },
  TIA: { name: 'Celestia', logoUrl: localLogo('tia'), quote: 'USDT' },
  SOON: { name: 'SOON', logoUrl: localLogo('soon'), quote: 'USDT' },
  ONDO: { name: 'Ondo', logoUrl: localLogo('ondo'), quote: 'USDT' },
  NEO: { name: 'NEO', logoUrl: localLogo('neo'), quote: 'USDT' },
  SKL: { name: 'SKALE', logoUrl: localLogo('skl'), quote: 'USDT' },
  MX: { name: 'MEXC (MX)', logoUrl: localLogo('mx'), quote: 'USDT' },
  FARTCOIN: { name: 'Fartcoin', logoUrl: localLogo('fartcoin'), quote: 'USDT' },
  RATS: { name: 'RATS', logoUrl: localLogo('rats'), quote: 'USDT' },
  ETC: { name: 'Ethereum Classic', logoUrl: localLogo('etc'), quote: 'USDT' },
  TRB: { name: 'Tellor', logoUrl: localLogo('trb'), quote: 'USDT' },
  AVAX: { name: 'Avalanche', logoUrl: localLogo('avax'), quote: 'USDT' },
  BCH: { name: 'Bitcoin Cash', logoUrl: localLogo('bch'), quote: 'USDT' },
  BSV: { name: 'Bitcoin SV', logoUrl: localLogo('bsv'), quote: 'USDT' },
  IOTA: { name: 'IOTA', logoUrl: localLogo('iota'), quote: 'USDT' },
  CYBER: { name: 'Cyber', logoUrl: localLogo('cyber'), quote: 'USDT' },
  WIF: { name: 'dogwifhat', logoUrl: localLogo('wif'), quote: 'USDT' },
  CORE: { name: 'Core', logoUrl: localLogo('core'), quote: 'USDT' },
  WLD: { name: 'Worldcoin', logoUrl: localLogo('wld'), quote: 'USDT' },
  SEI: { name: 'Sei', logoUrl: localLogo('sei'), quote: 'USDT' },
  VIRTUAL: { name: 'VIRTUAL', logoUrl: localLogo('virtual'), quote: 'USDT' },
  RENDER: { name: 'Render', logoUrl: localLogo('render'), quote: 'USDT' },
  MOODENG: { name: 'MOODENG', logoUrl: localLogo('moodeng'), quote: 'USDT' },
  JUP: { name: 'Jupiter', logoUrl: localLogo('jup'), quote: 'USDT' },
  PONKE: { name: 'PONKE', logoUrl: localLogo('ponke'), quote: 'USDT' },
  MNT: { name: 'Mantle', logoUrl: localLogo('mnt'), quote: 'USDT' },
  PNUT: { name: 'PNUT', logoUrl: localLogo('pnut'), quote: 'USDT' },
  EIGEN: { name: 'EIGEN', logoUrl: localLogo('eigen'), quote: 'USDT' },
  GRASS: { name: 'GRASS', logoUrl: localLogo('grass'), quote: 'USDT' },
  RAY: { name: 'Raydium', logoUrl: localLogo('ray'), quote: 'USDT' },
  EPIC: { name: 'EPIC', logoUrl: localLogo('epic'), quote: 'USDT' },
  ZRO: { name: 'LayerZero (ZRO)', logoUrl: localLogo('zro'), quote: 'USDT' },
  BERA: { name: 'Berachain', logoUrl: localLogo('bera'), quote: 'USDT' },
  CA: { name: 'CA', logoUrl: localLogo('ca'), quote: 'USDT' },
  IP: { name: 'IP', logoUrl: localLogo('ip'), quote: 'USDT' },
  KAITO: { name: 'Kaito', logoUrl: localLogo('kaito'), quote: 'USDT' },
  OMNI: { name: 'Omni Network', logoUrl: localLogo('omni'), quote: 'USDT' },
  A8: { name: 'A8', logoUrl: localLogo('a8'), quote: 'USDT' },
  OBOL: { name: 'Obol', logoUrl: localLogo('obol'), quote: 'USDT' },
  SAGA: { name: 'Saga', logoUrl: localLogo('saga'), quote: 'USDT' },
  ORCA: { name: 'Orca', logoUrl: localLogo('orca'), quote: 'USDT' },
  SHELL: { name: 'Shell', logoUrl: localLogo('shell'), quote: 'USDT' },
  NAKA: { name: 'Nakamoto Games', logoUrl: localLogo('naka'), quote: 'USDT' },
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
        <!-- tetap mount widget tapi hidden -->
        <!-- Mount widget tapi sembunyikan launchernya -->
        <!-- Widget di-mount tapi disembunyikan -->
        <a
          href="https://tawk.to/chat/68b943c5971b36192093ca7a/1j49r1fhp"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Support"
          class="focus:outline-none"
        >
          <img src="/img/newmenu/support.png" alt="Menu" class="w-7 h-7 object-contain" />
        </a>
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
                  class="fixed inset-0 z-[1000] flex items-center justify-center"
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
