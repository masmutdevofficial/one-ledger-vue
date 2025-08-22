<template>
  <main class="px-4 py-4 flex-grow mb-20">
    <ul class="space-y-4">
      <RouterLink
        v-for="crypto in visibleList"
        :key="crypto.symbol"
        :to="`/trade?symbol=${crypto.symbol.toLowerCase()}usdt`"
        custom
        v-slot="{ navigate }"
      >
        <li
          class="flex justify-between items-center cursor-pointer hover:bg-gray-50 rounded-md px-3 py-2 transition-colors"
          @click="navigate"
        >
          <!-- KIRI -->
          <div class="flex items-center space-x-2">
            <img
              :src="iconPath(crypto.symbol)"
              :alt="crypto.symbol + ' icon'"
              class="w-5 h-5 rounded-full"
              width="20"
              height="20"
              @error="onIconError"
            />
            <div>
              <div class="flex items-center space-x-1">
                <span class="font-bold text-sm">{{ crypto.symbol }}</span>
                <span class="text-gray-400 text-xs select-none">/USDT</span>
                <span class="text-xs bg-gray-200 rounded px-1 select-none">
                  {{ crypto.leverage }}
                </span>
              </div>
              <div class="text-gray-400 text-xs mt-0.5 select-none">
                <!-- volume -->
                <span v-if="crypto.volume !== '-'">{{ crypto.volume }}</span>
                <span v-else class="animate-pulse">...</span>
              </div>
            </div>
          </div>

          <!-- KANAN -->
          <div class="flex items-center">
            <div class="text-right mr-3">
              <div class="font-bold text-[12px]">
                <span v-if="crypto.price !== '-'">{{ crypto.price }}</span>
                <span v-else class="animate-pulse">...</span>
              </div>
              <div class="text-gray-400 text-[10px] select-none">
                <span v-if="crypto.price !== '-'">${{ crypto.price }}</span>
                <span v-else class="animate-pulse">...</span>
              </div>
            </div>
            <div
              class="text-xs rounded-lg px-3 py-1 select-none font-semibold"
              :class="crypto.change >= 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'"
            >
              <span v-if="crypto.price !== '-'">
                {{ crypto.change >= 0 ? '+' : '' }}{{ crypto.change.toFixed(2) }}%
              </span>
              <span v-else class="animate-pulse">...</span>
            </div>
          </div>
        </li>
      </RouterLink>
    </ul>

    <!-- loading indicator ketika load more -->
    <div v-if="isLoadingMore" class="text-center py-3 text-gray-400 animate-pulse">loading...</div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Crypto {
  symbol: string
  leverage: string
  volume: string
  price: string
  change: number
}

// type Crypto harus sudah ada:
// type Crypto = { symbol: string; leverage: string; volume: string; price: string | number; change: number }

const cryptoList = ref<Crypto[]>([
  { symbol: 'BTC', leverage: '10x', volume: '-', price: '-', change: 0 },
  { symbol: 'ETH', leverage: '10x', volume: '-', price: '-', change: 0 },
  { symbol: 'BNB', leverage: '10x', volume: '-', price: '-', change: 0 },
  { symbol: 'SOL', leverage: '10x', volume: '-', price: '-', change: 0 },
  { symbol: 'LTC', leverage: '10x', volume: '-', price: '-', change: 0 },
  { symbol: 'LINK', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'TON', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'SUI', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'XRP', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'QTUM', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'THETA', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'ADA', leverage: '10x', volume: '-', price: '-', change: 0 },
  { symbol: 'RAD', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'BAND', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'ALGO', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'POL', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'DOGE', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'LUNA', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'GALA', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'PEPE', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'CFX', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'TRX', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'TRUMP', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'SHIB', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'ARB', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'FIL', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'API3', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'ENA', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'BIO', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'UNI', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'BTT', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'SATS', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'MEME', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'GT', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'OP', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'AAVE', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'SNAKES', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'TIA', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'SOON', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'ONDO', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'NEO', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'SKL', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'MX', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'FARTCOIN', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'RATS', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'ETC', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'TRB', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'AVAX', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'BCH', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'BSV', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'IOTA', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'CYBER', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'WIF', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'CORE', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'WLD', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'SEI', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'VIRTUAL', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'RENDER', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'MOODENG', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'JUP', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'PONKE', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'MNT', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'PNUT', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'EIGEN', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'GRASS', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'RAY', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'EPIC', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'ZRO', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'BERA', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'CA', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'IP', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'KAITO', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'OMNI', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'A8', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'OBOL', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'SAGA', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'ORCA', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'SHELL', leverage: '5x', volume: '-', price: '-', change: 0 },
  { symbol: 'NAKA', leverage: '5x', volume: '-', price: '-', change: 0 },
])

// Mapping ke simbol Huobi (lowercase). DOT/TRX dihapus.
const symbolMap: Record<string, string> = {
  BTC: 'btc',
  ETH: 'eth',
  BNB: 'bnb',
  SOL: 'sol',
  LTC: 'ltc',
  LINK: 'link',
  TON: 'ton',
  SUI: 'sui',
  XRP: 'xrp',
  QTUM: 'qtum',
  THETA: 'theta',
  ADA: 'ada',
  RAD: 'rad',
  BAND: 'band',
  ALGO: 'algo',
  POL: 'pol',
  DOGE: 'doge',
  LUNA: 'luna',
  GALA: 'gala',
  PEPE: 'pepe',
  CFX: 'cfx',
  TRX: 'trx',
  TRUMP: 'trump',
  SHIB: 'shib',
  ARB: 'arb',
  FIL: 'fil',
  API3: 'api3',
  ENA: 'ena',
  BIO: 'bio',
  UNI: 'uni',
  BTT: 'btt',
  SATS: 'sats',
  MEME: 'meme',
  GT: 'gt',
  OP: 'op',
  AAVE: 'aave',
  SNAKES: 'snakes',
  TIA: 'tia',
  SOON: 'soon',
  ONDO: 'ondo',
  NEO: 'neo',
  SKL: 'skl',
  MX: 'mx',
  FARTCOIN: 'fartcoin',
  RATS: 'rats',
  ETC: 'etc',
  TRB: 'trb',
  AVAX: 'avax',
  BCH: 'bch',
  BSV: 'bsv',
  IOTA: 'iota',
  CYBER: 'cyber',
  WIF: 'wif',
  CORE: 'core',
  WLD: 'wld',
  SEI: 'sei',
  VIRTUAL: 'virtual',
  RENDER: 'render',
  MOODENG: 'moodeng',
  JUP: 'jup',
  PONKE: 'ponke',
  MNT: 'mnt',
  PNUT: 'pnut',
  EIGEN: 'eigen',
  GRASS: 'grass',
  RAY: 'ray',
  EPIC: 'epic',
  ZRO: 'zro',
  BERA: 'bera',
  CA: 'ca',
  IP: 'ip',
  KAITO: 'kaito',
  OMNI: 'omni',
  A8: 'a8',
  OBOL: 'obol',
  SAGA: 'saga',
  ORCA: 'orca',
  SHELL: 'shell',
  NAKA: 'naka',
}

// Path icon dari /public (Vite serve di root). BASE_URL jaga-jaga kalau deploy di subpath.
const BASE = import.meta.env.BASE_URL || '/'
const ICON_FALLBACK = `${BASE}img/crypto/default.svg` // fallback icon

// /public/img/crypto/<lowercase>.svg
function iconPath(symbol: string) {
  return `${BASE}img/crypto/${symbol.toLowerCase()}.svg`
}

// Kalau icon missing, fallback agar nggak broken image
function onIconError(e: Event) {
  const el = e.target as HTMLImageElement | null
  if (el && el.src !== ICON_FALLBACK) el.src = ICON_FALLBACK
}

// === Infinite scroll setup ===
const pageSize = 10
const visibleCount = ref(pageSize)
const visibleList = ref<Crypto[]>([])
const isLoadingMore = ref(false)

function updateVisibleList() {
  visibleList.value = cryptoList.value.slice(0, visibleCount.value)
}

// infinite scroll handler
function onScroll() {
  const bottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100

  if (bottom && !isLoadingMore.value) {
    if (visibleCount.value < cryptoList.value.length) {
      isLoadingMore.value = true
      setTimeout(() => {
        visibleCount.value += pageSize
        updateVisibleList()
        isLoadingMore.value = false
      }, 1000) // animasi "loading..."
    }
  }
}

onMounted(() => {
  updateVisibleList()
  window.addEventListener('scroll', onScroll)
  connectWebSockets()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  disconnectWebSockets()
})

// === WebSocket aggregator ===
let ws: WebSocket | null = null

function connectWebSockets() {
  ws = new WebSocket('wss://z8gwowgckssc8c8s4co444c0.masmutpanel.my.id')

  ws.onopen = () => {
    console.log('[WS] Connected')
  }

  ws.onclose = () => {
    console.warn('[WS] Closed, reconnecting in 5s...')
    setTimeout(connectWebSockets, 5000) // ✅ diperbaiki namanya
  }

  ws.onerror = (err) => {
    console.error('[WS] Error:', err)
  }

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data)

      // --- ticker (last price) ---
      if (msg.type === 'ticker') {
        const sym = msg.symbol.toUpperCase().replace('USDT', '')
        const target = cryptoList.value.find((c) => c.symbol === sym)
        if (target) {
          target.price = msg.last.toFixed(6)
        }
      }

      // --- kline 1day ---
      if (msg.type === 'kline' && msg.period === '1day') {
        const sym = msg.symbol.toUpperCase().replace('USDT', '')
        const target = cryptoList.value.find((c) => c.symbol === sym)
        if (target) {
          const open = msg.open
          const close = msg.close
          const vol = msg.vol
          target.price = close.toFixed(6)
          target.volume = Number(vol).toLocaleString('en-US', { maximumFractionDigits: 2 })
          target.change = ((close - open) / open) * 100
        }
      }
    } catch (err) {
      console.error('WS parse error:', err)
    }
  }
}

function disconnectWebSockets() {
  if (ws) {
    ws.close()
    ws = null
  }
}
</script>
