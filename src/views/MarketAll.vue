<template>
  <main class="px-4 py-4 flex-grow mb-20">
    <ul class="space-y-4">
      <RouterLink
        v-for="crypto in cryptoList"
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
                {{ crypto.volume }}
              </div>
            </div>
          </div>

          <!-- KANAN -->
          <div class="flex items-center">
            <div class="text-right mr-3">
              <div class="font-bold text-base">{{ crypto.price }}</div>
              <div class="text-gray-400 text-xs select-none">${{ crypto.price }}</div>
            </div>
            <div
              class="text-xs rounded-lg px-3 py-1 select-none font-semibold"
              :class="[crypto.change >= 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white']"
            >
              {{ crypto.change >= 0 ? '+' : '' }}{{ crypto.change.toFixed(2) }}%
            </div>
          </div>
        </li>
      </RouterLink>
    </ul>
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
}

// Path icon dari /public (Vite serve di root). BASE_URL jaga-jaga kalau deploy di subpath.
const BASE = import.meta.env.BASE_URL || '/'
const ICON_FALLBACK = `${BASE}img/crypto/_default.svg` // siapkan file ini (opsional)

// /public/img/crypto/<lowercase>.svg
function iconPath(symbol: string) {
  return `${BASE}img/crypto/${symbol.toLowerCase()}.svg`
}

// Kalau icon missing, set fallback agar nggak broken image
function onIconError(e: Event) {
  const el = e.target as HTMLImageElement | null
  if (el && el.src !== ICON_FALLBACK) el.src = ICON_FALLBACK
}

async function fetchInitialData() {
  const promises = cryptoList.value.map(async (crypto) => {
    const base = symbolMap[crypto.symbol] || crypto.symbol.toLowerCase()
    const fullSymbol = `${base}usdt`

    try {
      // Get price & volume
      const mergedRes = await fetch(
        `https://api.huobi.pro/market/detail/merged?symbol=${fullSymbol}`,
      )
      const mergedData = await mergedRes.json()
      const price = mergedData?.tick?.close || 0
      const volume = mergedData?.tick?.amount || 0

      // Get open (for change)
      const klineRes = await fetch(
        `https://api.huobi.pro/market/history/kline?period=1day&size=2&symbol=${fullSymbol}`,
      )
      const klineData = await klineRes.json()
      const kline = klineData?.data?.[1] // candle ke-1 adalah hari ini
      const open = kline?.open || 0

      const target = cryptoList.value.find((c) => c.symbol === crypto.symbol)
      if (target && price && open) {
        target.price = price.toFixed(6)
        target.volume = Number(volume).toLocaleString('en-US', { maximumFractionDigits: 2 })
        target.change = ((price - open) / open) * 100
      }
    } catch (err) {
      console.warn(`Fallback fetch failed for ${fullSymbol}:`, err)
    }
  })

  await Promise.all(promises)
}

const sockets: Record<string, WebSocket> = {}

function connectWebSockets() {
  cryptoList.value.forEach((crypto) => {
    const base = symbolMap[crypto.symbol] || crypto.symbol.toLowerCase()
    const fullSymbol = `${base}usdt`
    const wsUrl = `wss://ledgersocketone.online/${fullSymbol}/1day`
    const ws = new WebSocket(wsUrl)

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        const tick = data.tick
        if (!tick) return

        const open = tick.open
        const close = tick.close
        const vol = tick.vol

        const target = cryptoList.value.find((c) => c.symbol === crypto.symbol)
        if (target) {
          target.price = close.toFixed(6)
          target.volume = Number(vol).toLocaleString('en-US', { maximumFractionDigits: 2 })
          target.change = ((close - open) / open) * 100
        }
      } catch (err) {
        console.error(`Failed to parse message for ${crypto.symbol}:`, err)
      }
    }

    ws.onerror = () => console.error(`[WS] Error for ${crypto.symbol}`)
    // ws.onclose = () => console.warn(`[WS] Closed for ${crypto.symbol}`)

    sockets[crypto.symbol] = ws
  })
}

function disconnectWebSockets() {
  Object.values(sockets).forEach((ws) => ws.close())
}

onMounted(async () => {
  await fetchInitialData()
  connectWebSockets()
})

onUnmounted(() => {
  disconnectWebSockets()
})
</script>
