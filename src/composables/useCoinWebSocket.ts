// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ref, onMounted, onUnmounted, watch } from 'vue'

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
    // Contoh: wss://ws.hyper-ledger.io/btcusdt/1min
    // interval = '1min', '15min', 'depth', dst
    return `wss://ws.hyper-ledger.io/${coin.toLowerCase()}/${interval}`
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
        const msg = JSON.parse(event.data)

        if (msg.ch && msg.ch.includes('kline') && msg.tick) {
          // Parse symbol dari msg.ch
          const chParts = msg.ch.split('.')
          const symbol = chParts[1] // ex: 'bnbusdt'
          const period = chParts[3] // ex: '30min'

          // Cek interval yang diinginkan
          if (period !== interval) return

          const name = symbol.replace('usdt', '').toUpperCase()
          const price = Number(msg.tick.close)
          let changeNum = 0
          if (msg.tick.open !== undefined && msg.tick.close !== undefined) {
            changeNum =
              ((Number(msg.tick.close) - Number(msg.tick.open)) / Number(msg.tick.open)) * 100
          }
          const icon = '/img/fire.png'

          marketData.value = {
            name,
            price,
            change: Number(changeNum.toFixed(2)),
            icon,
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
