<template>
  <div>
    <!-- ===== Summary ===== -->
    <section class="bg-white mb-6 px-4 mt-5">
      <div class="flex items-center space-x-1 text-gray-700 text-sm font-normal mb-1">
        <span>Est. Total Value</span>
        <Icon icon="tabler:eye" class="w-4 h-4" />
      </div>

      <div class="flex items-baseline space-x-1 font-semibold text-3xl text-black mb-1">
        <span>
          {{
            totalValue !== null
              ? totalValue.toLocaleString('id-ID', { minimumFractionDigits: 2 })
              : '...'
          }}
        </span>
        <span class="text-base font-normal">USDT</span>
        <Icon icon="tabler:chevron-down" class="text-base w-4 h-4" />
      </div>

      <div class="text-gray-400 text-sm mb-2">
        ≈ ${{
          totalValue !== null
            ? totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })
            : '...'
        }}
      </div>

      <div class="text-xs flex items-center text-black mb-4">
        Unrealized PnL
        <span
          class="font-semibold ml-1"
          :class="portfolioUpnlAbs >= 0 ? 'text-[#3ABBA3]' : 'text-red-500'"
        >
          {{ signedMoneyId(portfolioUpnlAbs, 2) }}
          ({{ signedPercent(portfolioUpnlPct) }})
        </span>
        <Icon icon="tabler:chevron-right" class="ml-1 text-gray-400 w-4 h-4" />
      </div>

      <div class="grid grid-cols-3 gap-3">
        <RouterLink
          to="/add-funds"
          class="bg-teal-500 flex justify-center items-center active:bg-teal-600 text-black rounded-md px-6 py-2 text-[10px] font-normal transition-colors w-full text-center"
        >
          Add Funds
        </RouterLink>
        <RouterLink
          to="/send"
          class="bg-[#E6E6E6] flex justify-center items-center text-black rounded-md px-6 py-2 text-[10px] font-semibold w-full text-center"
        >
          Send
        </RouterLink>
        <RouterLink
          to="/transfer"
          class="bg-[#E6E6E6] flex justify-center items-center text-black rounded-md px-6 py-2 text-[10px] font-semibold w-full text-center"
        >
          Transfer
        </RouterLink>
      </div>
    </section>
    <div class="flex items-center justify-between px-4 py-3">
      <div class="flex items-center space-x-3">
        <img alt="USDT logo" class="w-6 h-6" height="24" :src="USDT_ICON" width="24" />
        <div>
          <p class="text-gray-900 font-semibold text-sm leading-tight">USDT</p>
          <p class="text-gray-400 text-xs leading-tight">TetherUS</p>
        </div>
      </div>
      <p class="text-gray-900 font-bold text-sm leading-tight">
        {{ saldoText }}
      </p>
    </div>
    <!-- ===== Assets ===== -->
    <div class="mb-20">
      <div v-if="loadingAssets" class="text-sm text-gray-500 px-5 py-3">Loading assets…</div>
      <div v-else-if="errorAssets" class="text-sm text-red-500 px-5 py-3">{{ errorAssets }}</div>
      <div v-else-if="assets.length === 0" class="text-sm text-center text-gray-500 px-5 py-3">
        No Data Available
      </div>

      <section
        v-else
        v-for="a in assets"
        :key="a.symbol"
        class="space-y-4 w-full rounded-2xl p-5 drop-shadow-md bg-white"
      >
        <div class="flex justify-between items-center">
          <p class="text-gray-500 text-[12px] font-normal">Asset</p>
          <Icon icon="tabler:adjustments-horizontal" class="text-gray-400 text-[12px]" />
        </div>

        <div class="flex justify-between items-center text-[12px]">
          <div class="flex items-center space-x-2">
            <img
              :alt="`${a.base} logo`"
              class="rounded-full"
              :src="a.logoUrl"
              width="20"
              height="20"
            />
            <p class="font-bold text-black text-base leading-5">
              {{ a.base }}
              <span class="font-normal text-gray-400 text-sm">/{{ a.quote }}</span>
            </p>
          </div>

          <button aria-label="Share" class="text-gray-400 hover:text-gray-600">
            <Icon icon="tabler:share-3" class="text-base" />
          </button>
        </div>

        <!-- Unrealized PnL -->
        <div
          class="flex justify-between items-center space-x-4 font-semibold text-base leading-5"
          :class="a.uPnlAbs >= 0 ? 'text-green-600' : 'text-red-600'"
        >
          <p>{{ signedMoneyId(a.uPnlAbs, 2) }}</p>
          <p>{{ signedPercent(a.uPnlPct) }}</p>
        </div>

        <!-- Balances, Avg Cost, Last Price -->
        <div class="grid grid-cols-3 gap-2 text-xs text-gray-400 font-normal">
          <div>
            <span class="text-gray-600 block">Balances</span>
            <span class="text-black font-normal text-[12px] block">
              {{ formatNumberId(a.qty, 8) }} {{ a.base }}
            </span>
            <span class="block">{{ moneyId(a.valueUsd, 2) }}</span>
          </div>

          <div class="text-right">
            <span class="text-gray-600 block">Avg. Cost ({{ a.quote }})</span>
            <span class="text-black font-normal text-[12px] block">
              {{ formatNumberId(a.avgCost, 2) }}
            </span>
          </div>

          <div class="text-right">
            <span class="text-gray-600 block">Last Price ({{ a.quote }})</span>
            <span class="text-black font-normal text-[12px] block">
              {{ formatNumberId(a.lastPrice, 2) }}
            </span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { Icon } from '@iconify/vue'

interface SaldoResponse {
  status: string
  saldo: number
  koin: number
}

const saldoAwal = ref<number | null>(null)
const koinAwal = ref<number | null>(null)

// pakai file lokal agar stabil: simpan logo di public/img/usdt.svg
const USDT_ICON = '/img/crypto/usdt.png'

const saldoText = computed(() =>
  saldoAwal.value !== null
    ? saldoAwal.value.toLocaleString('id-ID', {
        minimumFractionDigits: 6,
        maximumFractionDigits: 6,
      })
    : '...',
)

onMounted(async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Token tidak ada')
    const res = await fetch('https://ledger.masmutdev.id/api/saldo', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
    const data: SaldoResponse = await res.json()
    if (res.ok && data.status === 'success') {
      saldoAwal.value = Number(data.saldo) || 0
      koinAwal.value = Number(data.koin) || 0
    } else {
      console.error('Gagal ambil saldo:', data)
    }
  } catch (err) {
    console.error('Fetch error:', err)
  }
})

/** ===== Types ===== */
type Quote = 'USDT' | 'USDC' | 'USD'
type PositionRow = {
  id: number
  id_users: number
  symbol: string // e.g. BTCUSDT
  qty: string | number
  avg_cost: string | number
  realized_pnl: string | number
  created_at: string
  updated_at: string
}
type AssetItem = {
  symbol: string
  base: string
  quote: Quote
  logoUrl: string
  qty: number
  avgCost: number
  lastPrice: number
  valueUsd: number
  uPnlAbs: number
  uPnlPct: number
}

/** ===== Konstanta ===== */
const API_BASE = 'https://ledger.masmutdev.id/api'
const WS_BASE = 'wss://ledgersocketone.online'
const SYMBOL_META: Record<string, { name: string; logoUrl: string; quote: Quote }> = {
  BTC: {
    name: 'Bitcoin',
    logoUrl: 'https://placehold.co/20x20/orange/fff/png?text=B',
    quote: 'USDT',
  },
  ETH: {
    name: 'Ethereum',
    logoUrl: 'https://placehold.co/20x20/666/fff/png?text=E',
    quote: 'USDT',
  },
  SOL: { name: 'Solana', logoUrl: 'https://placehold.co/20x20/000/fff/png?text=S', quote: 'USDT' },
}

/** ===== State saldo & portfolio ===== */
const saldo = ref<number | null>(null)
const totalValue = ref<number | null>(null) // saldo + sum(asset value)
const portfolioUpnlAbs = ref<number>(0)
const portfolioUpnlPct = ref<number>(0)

/** ===== State assets ===== */
const assets = ref<AssetItem[]>([])
const loadingAssets = ref(false)
const errorAssets = ref<string | null>(null)

/** ===== Helpers ===== */
const nfId = (min: number, max: number) =>
  new Intl.NumberFormat('id-ID', { minimumFractionDigits: min, maximumFractionDigits: max })
function formatNumberId(n: number, digits = 2): string {
  return Number.isFinite(n) ? nfId(digits, digits).format(n) : '0'
}
function moneyId(n: number, digits = 2): string {
  return `$${formatNumberId(n, digits)}`
}
function signedPercent(pct: number): string {
  const sign = pct >= 0 ? '+' : ''
  return sign + (Number.isFinite(pct) ? pct.toFixed(2) : '0.00') + '%'
}
function signedMoneyId(n: number, digits = 2): string {
  const sign = n >= 0 ? '+' : '-'
  return sign + moneyId(Math.abs(n), digits)
}
function splitSymbol(sym: string): { base: string; quote: Quote } {
  const s = sym.toUpperCase()
  if (s.endsWith('USDT')) return { base: s.slice(0, -4), quote: 'USDT' }
  if (s.endsWith('USDC')) return { base: s.slice(0, -4), quote: 'USDC' }
  if (s.endsWith('USD')) return { base: s.slice(0, -3), quote: 'USD' }
  return { base: s, quote: 'USDT' }
}
function normalizeNum(v: string | number | null | undefined): number {
  if (v === null || v === undefined) return 0
  if (typeof v === 'number') return v
  return Number(String(v)) || 0
}

/** ===== Loaders ===== */
async function loadSaldo() {
  const token = localStorage.getItem('token')
  if (!token) return
  const res = await fetch(`${API_BASE}/saldo`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  const data = await res.json().catch(() => ({}))
  if (res.ok && data?.status === 'success') {
    saldo.value = Number(data.saldo) || 0
  } else {
    saldo.value = 0
  }
}

async function loadAssets() {
  loadingAssets.value = true
  errorAssets.value = null
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Token tidak ada.')

    // 1) Ambil semua posisi
    const res = await fetch(`${API_BASE}/positions-all`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const rows: PositionRow[] = await res.json()

    if (!Array.isArray(rows) || rows.length === 0) {
      assets.value = []
      recomputeTotals()
      ensureTickerSubscriptions() // akan menutup semua socket kalau ada
      return
    }

    // 2) Map awal asset (lastPrice 0; akan diisi WS)
    const mapped: AssetItem[] = rows
      .filter((r) => normalizeNum(r.qty) > 0)
      .map((r) => {
        const sym = String(r.symbol).toUpperCase()
        const { base, quote } = splitSymbol(sym)
        const meta = SYMBOL_META[base] ?? {
          name: base,
          logoUrl: 'https://placehold.co/20x20/777/fff/png?text=?',
          quote: quote as Quote,
        }
        const qty = normalizeNum(r.qty)
        const avg = normalizeNum(r.avg_cost)
        const last = 0
        const value = qty * last
        const uAbs = (last - avg) * qty
        const uPct = avg > 0 ? ((last - avg) / avg) * 100 : 0
        return {
          symbol: sym,
          base,
          quote: meta.quote,
          logoUrl: meta.logoUrl,
          qty,
          avgCost: avg,
          lastPrice: last,
          valueUsd: value,
          uPnlAbs: uAbs,
          uPnlPct: uPct,
        }
      })

    // urutkan by nilai terbesar
    mapped.sort((a, b) => b.valueUsd - a.valueUsd)
    assets.value = mapped

    // 3) subscribe WS ticker untuk simbol-simbol yang ada
    ensureTickerSubscriptions()

    // 4) Hitung total portfolio
    recomputeTotals()
  } catch (e: any) {
    errorAssets.value = e?.message || 'Gagal memuat assets.'
    assets.value = []
    recomputeTotals()
    ensureTickerSubscriptions()
  } finally {
    loadingAssets.value = false
  }
}

/** Hitung total value & portfolio uPNL */
function recomputeTotals() {
  const sumValue = assets.value.reduce((acc, a) => acc + (a.valueUsd || 0), 0)
  const sumUpnl = assets.value.reduce((acc, a) => acc + (a.uPnlAbs || 0), 0)
  const cost = assets.value.reduce((acc, a) => acc + a.avgCost * a.qty, 0)

  portfolioUpnlAbs.value = sumUpnl
  portfolioUpnlPct.value = cost > 0 ? (sumUpnl / cost) * 100 : 0

  const s = saldo.value ?? 0
  totalValue.value = s + sumValue
}

/** ===== Realtime via WebSocket (ticker) ===== */
const sockets = new Map<string, WebSocket>()
const reconnectTimers = new Map<string, number>() // id timer

function parseLastPrice(payload: any): number {
  // Versi relay custom: { ch:'ticker', symbol:'btcusdt', last:123, ts:... }
  if (payload && payload.ch === 'ticker' && 'last' in payload) {
    const v = Number(payload.last)
    return Number.isFinite(v) ? v : 0
  }
  // Versi raw Huobi: { ch:'market.btcusdt.trade.detail', tick: { data: [{ price }] } }
  if (payload?.ch?.includes('.trade.detail')) {
    const v = Number(payload?.tick?.data?.[0]?.price)
    return Number.isFinite(v) ? v : 0
  }
  return 0
}

function connectTicker(symbolUpper: string) {
  const sym = symbolUpper.toLowerCase() // 'btcusdt'
  const key = `${sym}-ticker`

  // kalau sudah ada, jangan duplikasi
  if (sockets.has(key)) return

  const url = `${WS_BASE}/${sym}/ticker`
  const ws: WebSocket | null = new WebSocket(url)

  ws.onopen = () => {
    // console.log('ticker open', sym)
  }

  ws.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data as string)
      const last = parseLastPrice(msg)
      if (!last) return
      // update asset terkait
      const symbolUp = symbolUpper.toUpperCase()
      const a = assets.value.find((x) => x.symbol === symbolUp)
      if (!a) return
      a.lastPrice = last
      a.valueUsd = a.qty * last
      a.uPnlAbs = (last - a.avgCost) * a.qty
      a.uPnlPct = a.avgCost > 0 ? ((last - a.avgCost) / a.avgCost) * 100 : 0
      recomputeTotals()
    } catch {}
  }

  ws.onclose = () => {
    sockets.delete(key)
    // jadwalkan reconnect kalau aset masih ada
    if (assets.value.some((a) => a.symbol.toLowerCase() === sym)) {
      const t = window.setTimeout(() => connectTicker(symbolUpper), 2000)
      reconnectTimers.set(key, t)
    }
  }

  ws.onerror = () => {
    ws?.close()
  }

  sockets.set(key, ws)
}

function ensureTickerSubscriptions() {
  // Tutup socket yang tidak lagi dibutuhkan
  for (const [key, sock] of sockets.entries()) {
    const sym = key.replace('-ticker', '').toUpperCase()
    if (!assets.value.some((a) => a.symbol === sym)) {
      try {
        sock.close()
      } catch {}
      sockets.delete(key)
    }
  }
  // Buka socket untuk aset yang belum tersubscribe
  for (const a of assets.value) {
    connectTicker(a.symbol)
  }
}

onMounted(async () => {
  await loadSaldo()
  await loadAssets()
})

// Jika nanti kamu refresh assets (mis. setelah trade), pastikan panggil loadAssets() lagi.
// Tambah watcher untuk menjaga subscription jika daftar assets berubah manual.
watch(assets, () => ensureTickerSubscriptions(), { deep: true })

onUnmounted(() => {
  for (const ws of sockets.values()) {
    try {
      ws.close()
    } catch {}
  }
  sockets.clear()
  for (const t of reconnectTimers.values()) {
    clearTimeout(t)
  }
  reconnectTimers.clear()
})
</script>
