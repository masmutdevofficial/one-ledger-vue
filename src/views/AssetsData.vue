<template>
  <div>
    <!-- ===== Summary ===== -->
    <section class="bg-white mb-6 px-4 mt-2">
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
        class="space-y-4 w-full rounded-2xl p-5 drop-shadow-md bg-white cursor-pointer hover:ring-2 hover:ring-teal-200 transition"
        @click="goAsset(a)"
      >
        <div class="flex justify-between items-center">
          <p class="text-gray-500 text-[10px] font-normal">Asset</p>
          <Icon icon="tabler:adjustments-horizontal" class="text-gray-400 text-[10px]" />
        </div>

        <div class="flex justify-between items-center text-[10px]">
          <div class="flex items-center space-x-2">
            <img
              :alt="`${a.base} logo`"
              class="rounded-full"
              :src="a.logoUrl"
              width="20"
              height="20"
            />
            <p class="font-bold text-black text-xs leading-4">
              {{ a.base }}
              <span class="font-normal text-gray-400 text-[10px]">/{{ a.quote }}</span>
            </p>
          </div>

          <button aria-label="Share" class="text-gray-400 hover:text-gray-600">
            <Icon icon="tabler:share-3" class="text-xs" />
          </button>
        </div>

        <!-- Unrealized PnL -->
        <div
          v-if="a.lastPrice > 0"
          class="flex justify-between items-center space-x-4 font-semibold text-xs leading-4"
          :class="a.uPnlAbs >= 0 ? 'text-green-600' : 'text-red-600'"
        >
          <p>{{ signedMoneyId(a.uPnlAbs, 2) }}</p>
          <p>{{ signedPercent(a.uPnlPct) }}</p>
        </div>
        <div v-else class="text-[10px] text-gray-400">—</div>

        <!-- Balances, Avg Cost, Last Price -->
        <div class="grid grid-cols-3 gap-2 text-[10px] text-gray-400 font-normal">
          <div>
            <span class="text-gray-600 block">Balances</span>
            <span class="text-black font-normal text-[10px] block">
              {{ formatNumberId(a.qty, 8) }} {{ a.base }}
            </span>
            <span class="block">{{ moneyId(a.valueUsd, 2) }}</span>
          </div>

          <div class="text-right">
            <span class="text-gray-600 block">Avg. Cost ({{ a.quote }})</span>
            <span class="text-black font-normal text-[10px] block">
              {{ formatNumberId(a.avgCost, 2) }}
            </span>
          </div>

          <div class="text-right mt-0.3">
            <span class="text-gray-600 block">Last Price ({{ a.quote }})</span>
            <span class="text-black font-normal text-[10px] block">
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
import { useRouter } from 'vue-router'

const router = useRouter()

interface SaldoResponse {
  status: string
  saldo: number
  koin: number
}

const saldoAwal = ref<number | null>(null)
const koinAwal = ref<number | null>(null)

// pakai file lokal agar stabil: simpan logo di public/img/usdt.svg
const USDT_ICON = '/img/crypto/usdt.svg'

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
    const res = await fetch('https://one-ledger.masmutpanel.my.id/api/saldo', {
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
const API_BASE = 'https://one-ledger.masmutpanel.my.id/api'
const WS_BASE = 'wss://ledgersocketone.online'
const BASE = import.meta.env.BASE_URL || '/'
const localLogo = (sym: string) => `${BASE}img/crypto/${sym.toLowerCase()}.svg`

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
  CFX: { name: 'Conflux', logoUrl: localLogo('cfx'), quote: 'USDT' },
  TRX: { name: 'TRON', logoUrl: localLogo('trx'), quote: 'USDT' },
  TRUMP: { name: 'MAGA (TRUMP)', logoUrl: localLogo('trump'), quote: 'USDT' },
  SHIB: { name: 'Shiba Inu', logoUrl: localLogo('shib'), quote: 'USDT' },
  ARB: { name: 'Arbitrum', logoUrl: localLogo('arb'), quote: 'USDT' },
  FIL: { name: 'Filecoin', logoUrl: localLogo('fil'), quote: 'USDT' },
  API3: { name: 'API3', logoUrl: localLogo('api3'), quote: 'USDT' },
  ENA: { name: 'Ethena', logoUrl: localLogo('ena'), quote: 'USDT' },
  BIO: { name: 'BIO', logoUrl: localLogo('bio'), quote: 'USDT' },
  UNI: { name: 'Uniswap', logoUrl: localLogo('uni'), quote: 'USDT' },
  BTT: { name: 'BitTorrent', logoUrl: localLogo('btt'), quote: 'USDT' },
  SATS: { name: 'SATS (Ordinals)', logoUrl: localLogo('sats'), quote: 'USDT' },
  MEME: { name: 'Memecoin (MEME)', logoUrl: localLogo('meme'), quote: 'USDT' },
  GT: { name: 'GateToken', logoUrl: localLogo('gt'), quote: 'USDT' },
  OP: { name: 'Optimism', logoUrl: localLogo('op'), quote: 'USDT' },
  AAVE: { name: 'Aave', logoUrl: localLogo('aave'), quote: 'USDT' },
  SNAKES: { name: 'SNAKES', logoUrl: localLogo('snakes'), quote: 'USDT' },
  TIA: { name: 'Celestia', logoUrl: localLogo('tia'), quote: 'USDT' },
  SOON: { name: 'SOON', logoUrl: localLogo('soon'), quote: 'USDT' },
  ONDO: { name: 'Ondo Finance', logoUrl: localLogo('ondo'), quote: 'USDT' },
  NEO: { name: 'NEO', logoUrl: localLogo('neo'), quote: 'USDT' },
  SKL: { name: 'SKALE', logoUrl: localLogo('skl'), quote: 'USDT' },
  MX: { name: 'MX Token', logoUrl: localLogo('mx'), quote: 'USDT' },
  FARTCOIN: { name: 'Fartcoin', logoUrl: localLogo('fartcoin'), quote: 'USDT' },
  RATS: { name: 'RATS', logoUrl: localLogo('rats'), quote: 'USDT' },
  ETC: { name: 'Ethereum Classic', logoUrl: localLogo('etc'), quote: 'USDT' },
  TRB: { name: 'Tellor (TRB)', logoUrl: localLogo('trb'), quote: 'USDT' },
  AVAX: { name: 'Avalanche', logoUrl: localLogo('avax'), quote: 'USDT' },
  BCH: { name: 'Bitcoin Cash', logoUrl: localLogo('bch'), quote: 'USDT' },
  BSV: { name: 'Bitcoin SV', logoUrl: localLogo('bsv'), quote: 'USDT' },
  IOTA: { name: 'IOTA', logoUrl: localLogo('iota'), quote: 'USDT' },
  CYBER: { name: 'Cyber', logoUrl: localLogo('cyber'), quote: 'USDT' },
  WIF: { name: 'dogwifhat', logoUrl: localLogo('wif'), quote: 'USDT' },
  CORE: { name: 'Core', logoUrl: localLogo('core'), quote: 'USDT' },
  WLD: { name: 'Worldcoin', logoUrl: localLogo('wld'), quote: 'USDT' },
  SEI: { name: 'Sei', logoUrl: localLogo('sei'), quote: 'USDT' },
  VIRTUAL: { name: 'Virtuals', logoUrl: localLogo('virtual'), quote: 'USDT' },
  RENDER: { name: 'Render', logoUrl: localLogo('render'), quote: 'USDT' },
  MOODENG: { name: 'Moodeng', logoUrl: localLogo('moodeng'), quote: 'USDT' },
  JUP: { name: 'Jupiter', logoUrl: localLogo('jup'), quote: 'USDT' },
  PONKE: { name: 'PONKE', logoUrl: localLogo('ponke'), quote: 'USDT' },
  MNT: { name: 'Mantle', logoUrl: localLogo('mnt'), quote: 'USDT' },
  PNUT: { name: 'Peanut', logoUrl: localLogo('pnut'), quote: 'USDT' },
  EIGEN: { name: 'Eigen', logoUrl: localLogo('eigen'), quote: 'USDT' },
  GRASS: { name: 'Grass', logoUrl: localLogo('grass'), quote: 'USDT' },
  RAY: { name: 'Raydium', logoUrl: localLogo('ray'), quote: 'USDT' },
  EPIC: { name: 'EPIC', logoUrl: localLogo('epic'), quote: 'USDT' },
  ZRO: { name: 'LayerZero', logoUrl: localLogo('zro'), quote: 'USDT' },
  BERA: { name: 'Berachain', logoUrl: localLogo('bera'), quote: 'USDT' },
  CA: { name: 'CA', logoUrl: localLogo('ca'), quote: 'USDT' },
  IP: { name: 'IP', logoUrl: localLogo('ip'), quote: 'USDT' },
  KAITO: { name: 'Kaito AI', logoUrl: localLogo('kaito'), quote: 'USDT' },
  OMNI: { name: 'Omni Network', logoUrl: localLogo('omni'), quote: 'USDT' },
  A8: { name: 'A8', logoUrl: localLogo('a8'), quote: 'USDT' },
  OBOL: { name: 'Obol Network', logoUrl: localLogo('obol'), quote: 'USDT' },
  SAGA: { name: 'Saga', logoUrl: localLogo('saga'), quote: 'USDT' },
  ORCA: { name: 'Orca', logoUrl: localLogo('orca'), quote: 'USDT' },
  SHELL: { name: 'Shell', logoUrl: localLogo('shell'), quote: 'USDT' },
  NAKA: { name: 'Nakamoto Games', logoUrl: localLogo('naka'), quote: 'USDT' },
}
// ── CACHE: saldo + positions + last prices ─────────────────────────────
type PriceCacheEntry = { p: number; ts: number }
type PositionsCacheItem = { symbol: string; qty: number; avgCost: number; lastPrice?: number }
type PortfolioCache = {
  ts: number
  saldo?: { v: number; ts: number }
  positions?: { items: PositionsCacheItem[]; ts: number }
  prices?: Record<string, PriceCacheEntry> // key: 'btcusdt'
}

const PORTF_LS_KEY = 'portfolioCache:v1'
const SALDO_TTL = 15 * 1000 // 15s
const POS_TTL = 5 * 60 * 1000 // 5m
const PRICE_TTL = 2 * 60 * 1000 // 2m

let portfCache: PortfolioCache = { ts: 0, prices: {} }
let portfSaveTimer: number | null = null

function loadPortfolioCache() {
  try {
    const raw = localStorage.getItem(PORTF_LS_KEY)
    portfCache = raw ? (JSON.parse(raw) as PortfolioCache) : { ts: 0, prices: {} }
    if (!portfCache.prices) portfCache.prices = {}
  } catch {
    portfCache = { ts: 0, prices: {} }
  }
}
function savePortfolioCacheDebounced() {
  if (portfSaveTimer) clearTimeout(portfSaveTimer)
  portfSaveTimer = window.setTimeout(() => {
    try {
      localStorage.setItem(PORTF_LS_KEY, JSON.stringify(portfCache))
    } catch {}
  }, 300)
}

function upsertSaldoCache(v: number) {
  portfCache.saldo = { v, ts: Date.now() }
  savePortfolioCacheDebounced()
}
function upsertPositionsCache(items: PositionsCacheItem[]) {
  portfCache.positions = { items, ts: Date.now() }
  savePortfolioCacheDebounced()
}
function upsertPriceCache(symLower: string, price: number) {
  if (!portfCache.prices) portfCache.prices = {}
  portfCache.prices[symLower] = { p: price, ts: Date.now() }
  savePortfolioCacheDebounced()
}

/** Hydrate saldo + assets dari cache */
function hydrateFromCache() {
  const now = Date.now()

  // saldo
  if (portfCache.saldo && now - portfCache.saldo.ts <= SALDO_TTL) {
    saldo.value = Number(portfCache.saldo.v) || 0
  }

  // positions -> assets (pakai meta/logo)
  if (portfCache.positions && now - portfCache.positions.ts <= POS_TTL) {
    const list: AssetItem[] = (portfCache.positions.items || []).map((it) => {
      const sym = String(it.symbol).toUpperCase() // e.g. BTCUSDT
      const { base, quote } = splitSymbol(sym)
      const meta = SYMBOL_META[base] ?? {
        name: base,
        logoUrl: 'https://placehold.co/20x20/777/fff/png?text=?',
        quote,
      }
      const lastCached = it.lastPrice ?? 0
      const qty = Number(it.qty) || 0
      const avg = Number(it.avgCost) || 0
      const last = Number(lastCached) || 0
      return {
        symbol: sym,
        base,
        quote: meta.quote,
        logoUrl: meta.logoUrl,
        qty,
        avgCost: avg,
        lastPrice: last,
        valueUsd: qty * last,
        uPnlAbs: (last - avg) * qty,
        uPnlPct: avg > 0 ? ((last - avg) / avg) * 100 : 0,
      }
    })

    // overlay last price dari cache harga jika lebih fresh
    const prices = portfCache.prices || {}
    for (const a of list) {
      const key = a.symbol.toLowerCase()
      const pe = prices[key]
      if (pe && now - pe.ts <= PRICE_TTL) {
        a.lastPrice = pe.p
        a.valueUsd = a.qty * a.lastPrice
        a.uPnlAbs = (a.lastPrice - a.avgCost) * a.qty
        a.uPnlPct = a.avgCost > 0 ? ((a.lastPrice - a.avgCost) / a.avgCost) * 100 : 0
      }
    }

    // urutkan & set
    list.sort((a, b) => b.valueUsd - a.valueUsd)
    assets.value = list
    recomputeTotals()
  }
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
    const v = Number(data.saldo) || 0
    saldo.value = v
    upsertSaldoCache(v) // ← simpan ke cache
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

    const res = await fetch(`${API_BASE}/positions-all`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const rows: PositionRow[] = await res.json()

    if (!Array.isArray(rows) || rows.length === 0) {
      assets.value = []
      upsertPositionsCache([]) // ← kosongkan cache positions juga
      recomputeTotals()
      return
    }

    // map → AssetItem
    const mapped: AssetItem[] = rows
      .filter((r) => normalizeNum(r.qty) > 0)
      .map((r) => {
        const sym = String(r.symbol).toUpperCase()
        const { base, quote } = splitSymbol(sym)
        const meta = SYMBOL_META[base] ?? {
          name: base,
          logoUrl: 'https://placehold.co/20x20/777/fff/png?text=?',
          quote,
        }
        const qty = normalizeNum(r.qty)
        const avg = normalizeNum(r.avg_cost)
        const last = 0
        return {
          symbol: sym,
          base,
          quote: meta.quote,
          logoUrl: meta.logoUrl,
          qty,
          avgCost: avg,
          lastPrice: last,
          valueUsd: qty * last,
          uPnlAbs: (last - avg) * qty,
          uPnlPct: avg > 0 ? ((last - avg) / avg) * 100 : 0,
        }
      })

    // overlay harga dari cache harga (kalau fresh)
    const now = Date.now()
    const prices = portfCache.prices || {}
    for (const a of mapped) {
      const key = a.symbol.toLowerCase()
      const pe = prices[key]
      if (pe && now - pe.ts <= PRICE_TTL) {
        a.lastPrice = pe.p
        a.valueUsd = a.qty * a.lastPrice
        a.uPnlAbs = (a.lastPrice - a.avgCost) * a.qty
        a.uPnlPct = a.avgCost > 0 ? ((a.lastPrice - a.avgCost) / a.avgCost) * 100 : 0
      }
    }

    mapped.sort((a, b) => b.valueUsd - a.valueUsd)
    assets.value = mapped
    recomputeTotals()

    // simpan positions ke cache (tanpa harga; kecil & bersih)
    const posItems: PositionsCacheItem[] = mapped.map((a) => ({
      symbol: a.symbol,
      qty: a.qty,
      avgCost: a.avgCost,
      // boleh simpan lastPrice juga agar hydrate lebih cepat walau price cache kosong
      lastPrice: a.lastPrice,
    }))
    upsertPositionsCache(posItems)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    errorAssets.value = e?.message || 'Gagal memuat assets.'
    assets.value = []
    recomputeTotals()
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
let aggWs: WebSocket | null = null
let reconnectTimer: number | null = null

// buffer agar tidak render tiap tick
const pending: Record<string, { last?: number; klineClose?: number }> = {}
let flushTimer: number | null = null
function scheduleFlush() {
  if (flushTimer) return
  flushTimer = window.setTimeout(() => {
    const touched: string[] = []

    for (const [symLower, payload] of Object.entries(pending)) {
      const symUp = symLower.toUpperCase()
      const a = assets.value.find((x) => x.symbol === symUp)
      if (!a) continue

      let priceUpdated = false
      if (payload.last !== undefined) {
        a.lastPrice = payload.last
        priceUpdated = true
      }
      if (payload.klineClose !== undefined) {
        a.lastPrice = payload.klineClose
        priceUpdated = true
      }

      if (priceUpdated) {
        a.valueUsd = a.qty * a.lastPrice
        a.uPnlAbs = (a.lastPrice - a.avgCost) * a.qty
        a.uPnlPct = a.avgCost > 0 ? ((a.lastPrice - a.avgCost) / a.avgCost) * 100 : 0
        touched.push(symLower)
      }
    }

    // total sekali
    recomputeTotals()

    // update cache harga untuk simbol yang tersentuh
    for (const k of touched) {
      const a = assets.value.find((x) => x.symbol.toLowerCase() === k)
      if (a && Number.isFinite(a.lastPrice)) upsertPriceCache(k, a.lastPrice)
    }

    // reset buffer
    for (const k of Object.keys(pending)) delete pending[k]
    flushTimer = null
  }, 300)
}

function connectAggregatorWs() {
  if (aggWs)
    try {
      aggWs.close()
    } catch {}

  aggWs = new WebSocket(WS_BASE) // contoh: wss://z8gwo.../ (tanpa path)
  aggWs.onopen = () => {
    /* connected */
  }

  aggWs.onclose = () => {
    aggWs = null
    if (reconnectTimer) clearTimeout(reconnectTimer)
    reconnectTimer = window.setTimeout(connectAggregatorWs, 2000)
  }

  aggWs.onerror = () => {
    try {
      aggWs?.close()
    } catch {}
  }

  aggWs.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data as string)
      // normalisasi symbol dari server (lowercase, mis. 'btcusdt')
      const symLower = String(msg.symbol || '').toLowerCase()
      if (!symLower) return

      if (msg.type === 'ticker' && Number.isFinite(Number(msg.last))) {
        pending[symLower] = pending[symLower] || {}
        pending[symLower].last = Number(msg.last)
        scheduleFlush()
        return
      }

      if (msg.type === 'kline' && msg.period === '1day') {
        const close = Number(msg.close)
        if (!Number.isFinite(close)) return
        pending[symLower] = pending[symLower] || {}
        pending[symLower].klineClose = close // ✅ hanya simpan close
        scheduleFlush()
        return
      }
    } catch {
      // abaikan parsing error
    }
  }
}

function goAsset(a: { symbol: string }) {
  const sym = String(a.symbol || '').toLowerCase() // e.g. BTCUSDT -> btcusdt
  if (!sym) return
  router.push({ path: '/trade', query: { symbol: sym } })
}

// Buat indeks symbol → AssetItem (uppercase, mis. 'BTCUSDT')
const assetMap = new Map<string, AssetItem>()

function rebuildAssetMap() {
  assetMap.clear()
  for (const a of assets.value) assetMap.set(a.symbol.toUpperCase(), a)
}

onMounted(async () => {
  loadPortfolioCache()
  hydrateFromCache() // ← isi UI dulu dari cache (jika valid)

  await loadSaldo() // ← tetap fetch, akan overwrite & update cache
  await loadAssets() // ← tetap fetch, akan overwrite & update cache
  connectAggregatorWs() // ← setelah assets terisi
})

// ✅ watcher pengganti (tanpa subscription)
watch(
  assets,
  () => {
    rebuildAssetMap()
    recomputeTotals()
  },
  { deep: true },
)

onUnmounted(() => {
  if (aggWs) {
    try {
      aggWs.close()
    } catch {}
    aggWs = null
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
})
</script>
