import { ref, onMounted, onUnmounted } from 'vue'

export interface MarketItem {
  name: string
  price: number
  change: number
  icon?: string
}

export function useCoinWebSocket(coin: string, interval: string = '1min') {
  const marketData = ref<MarketItem | null>(null)
  let ws: WebSocket | null = null

  // Compose endpoint URL
  function getWsUrl() {
    // Aggregator terbaru: 1 endpoint (broadcast)
    return `wss://ws.hyper-led.com`
  }

  function connect() {
    if (ws) ws.close()
    ws = new WebSocket(getWsUrl())

    ws.onopen = () => {
      // opsional: callback on open
    }

    ws.onerror = (err) => {
      // opsional: tangani error
      console.error('WebSocket error:', err)
    }

    ws.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data as string)

        const symLower = String(msg?.symbol || '').toLowerCase()
        if (!symLower || symLower !== coin.toLowerCase()) return

        // Format aggregator: { type:'kline', symbol, period, open, close, ... }
        if (msg?.type === 'kline') {
          const period = String(msg?.period || '')
          if (period !== interval) return

          const open = Number(msg?.open)
          const close = Number(msg?.close)
          if (!Number.isFinite(open) || !Number.isFinite(close) || open === 0) return

          const name = symLower.replace('usdt', '').toUpperCase()
          const changeNum = ((close - open) / open) * 100

          marketData.value = {
            name,
            price: close,
            change: Number(changeNum.toFixed(2)),
            icon: '/img/fire.png',
          }
          return
        }

        // Fallback: ticker update (tanpa change)
        if (msg?.type === 'ticker') {
          const last = Number(msg?.last)
          if (!Number.isFinite(last)) return
          const name = symLower.replace('usdt', '').toUpperCase()
          marketData.value = {
            name,
            price: last,
            change: marketData.value?.change ?? 0,
            icon: '/img/fire.png',
          }
        }
      } catch (e) {
        // Optional: log parsing error
        console.error('Error parsing WebSocket data:', e)
      }
    }
  }

  onMounted(connect)

  // Jika kamu ingin coin/interval bisa diganti dinamis, aktifkan watch di bawah ini:
  // watch([() => coin, () => interval], connect)

  onUnmounted(() => {
    if (ws) ws.close()
  })

  return { marketData }
}
