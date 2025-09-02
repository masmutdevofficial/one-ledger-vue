<template>
  <div>
    <!-- ===== Summary ===== -->
    <section class="bg-white mb-6 px-4 mt-2">
      <div class="flex items-center space-x-1 text-gray-700 text-sm font-normal mb-1">
        <span>Est. Total Value</span>
        <!-- tombol mata: toggle hide/show -->
        <button
          type="button"
          class="inline-flex items-center"
          :aria-pressed="isTotalHidden ? 'true' : 'false'"
          :title="isTotalHidden ? 'Show balance' : 'Hide balance'"
          @click="isTotalHidden = !isTotalHidden"
        >
          <Icon :icon="isTotalHidden ? 'tabler:eye-off' : 'tabler:eye'" class="w-4 h-4" />
        </button>
      </div>

      <div class="flex items-baseline space-x-1 font-semibold text-3xl text-black mb-1">
        <!-- tampilkan nilai / '••••' -->
        <span>{{ totalValueUsdtStr }}</span>
        <span class="text-base font-normal">USDT</span>
        <!-- ikon dropdown DIHAPUS -->
      </div>

      <div class="text-gray-400 text-sm mb-2">≈ ${{ totalValueUsdStr }}</div>

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
    <RouterLink
      to="/smart-arbitrage"
      class="flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-md transition cursor-pointer"
      aria-label="Open Smart Arbitrage"
    >
      <div class="flex items-center space-x-3">
        <img alt="Robot logo" class="w-6 h-6" height="24" :src="ROBOT_ICON" width="24" />
        <div>
          <p class="text-gray-900 font-semibold text-sm leading-tight">Smart Arbitrage</p>
        </div>
      </div>
      <p class="text-gray-900 font-bold text-sm leading-tight">
        {{ smartArbText }}
      </p>
    </RouterLink>

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
import { useApiAlertStore } from '@/stores/apiAlert'

const router = useRouter()
const modal = useApiAlertStore()

// === Hide/Show total value (persist di localStorage) ===
const TV_HIDE_KEY = 'portfolioHideTotal:v1'
const isTotalHidden = ref(false)

onMounted(() => {
  try {
    isTotalHidden.value = localStorage.getItem(TV_HIDE_KEY) === '1'
  } catch {}
})
watch(isTotalHidden, (v) => {
  try {
    localStorage.setItem(TV_HIDE_KEY, v ? '1' : '0')
  } catch {}
})

// string tampilan untuk total value (IDR-style USDT & USD)
const totalValueUsdtStr = computed(() => {
  if (isTotalHidden.value) return '••••'
  return totalValue.value !== null
    ? totalValue.value.toLocaleString('id-ID', { minimumFractionDigits: 2 })
    : '...'
})

const totalValueUsdStr = computed(() => {
  if (isTotalHidden.value) return '••••'
  return totalValue.value !== null
    ? totalValue.value.toLocaleString('en-US', { minimumFractionDigits: 2 })
    : '...'
})

/** ===== Utils ===== */
const isBrowser = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined'

/** ===== Saldo ringkas (header) ===== */
interface SaldoResponse {
  status: 'success' | 'error' | string
  saldo: number
  saldo_smart_arbitrage?: number
  koin: number
}

const saldoAwal = ref<number | null>(null)
const koinAwal = ref<number | null>(null)
const USDT_ICON = '/img/crypto/usdt.svg'
const ROBOT_ICON = '/img/robot-logo.png'

const saldoText = computed(() =>
  saldoAwal.value !== null
    ? saldoAwal.value.toLocaleString('id-ID', {
        minimumFractionDigits: 6,
        maximumFractionDigits: 6,
      })
    : '...',
)
const smartArbAwal = ref<number | null>(null)

const smartArbText = computed(() =>
  smartArbAwal.value !== null
    ? smartArbAwal.value.toLocaleString('id-ID', {
        minimumFractionDigits: 6,
        maximumFractionDigits: 6,
      })
    : '...',
)

/** ===== Types Portfolio ===== */
type Quote = 'USDT' | 'USDC' | 'USD'
type PositionRow = {
  id: number
  id_users: number
  symbol: string // BTCUSDT
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

/** ===== Cache: saldo + positions + last prices ===== */
type PriceCacheEntry = { p: number; ts: number }
type PositionsCacheItem = { symbol: string; qty: number; avgCost: number; lastPrice?: number }
type PortfolioCache = {
  ts: number
  saldo?: { v: number; ts: number }
  positions?: { items: PositionsCacheItem[]; ts: number }
  prices?: Record<string, PriceCacheEntry> // key: 'btcusdt'
}
const PORTF_LS_KEY = 'portfolioCache:v1'
const SALDO_TTL = 15_000
const POS_TTL = 5 * 60_000
const PRICE_TTL = 2 * 60_000

let portfCache: PortfolioCache = { ts: 0, prices: {} }
let portfSaveTimer: ReturnType<typeof setTimeout> | null = null

function loadPortfolioCache() {
  if (!isBrowser()) return
  try {
    const raw = localStorage.getItem(PORTF_LS_KEY)
    portfCache = raw ? (JSON.parse(raw) as PortfolioCache) : { ts: 0, prices: {} }
    portfCache.prices ||= {}
  } catch {
    portfCache = { ts: 0, prices: {} }
  }
}
function savePortfolioCacheDebounced() {
  if (!isBrowser()) return
  if (portfSaveTimer) clearTimeout(portfSaveTimer)
  portfSaveTimer = window.setTimeout(() => {
    try {
      localStorage.setItem(PORTF_LS_KEY, JSON.stringify(portfCache))
    } catch {}
    portfSaveTimer = null
  }, 250)
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
  ;(portfCache.prices ||= {})[symLower] = { p: price, ts: Date.now() }
  savePortfolioCacheDebounced()
}

/** Hydrate saldo + assets dari cache */
function hydrateFromCache() {
  const now = Date.now()
  if (portfCache.saldo && now - portfCache.saldo.ts <= SALDO_TTL) {
    saldo.value = Number(portfCache.saldo.v) || 0
  }

  if (portfCache.positions && now - portfCache.positions.ts <= POS_TTL) {
    const list: AssetItem[] = (portfCache.positions.items || []).map((it) => {
      const sym = String(it.symbol).toUpperCase()
      const { base, quote } = splitSymbol(sym)
      const meta = SYMBOL_META[base] ?? { name: base, logoUrl: localLogo(base), quote }
      const qty = normalizeNum(it.qty)
      const avg = normalizeNum(it.avgCost)
      const last = normalizeNum(it.lastPrice)
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

    // overlay harga dari cache harga jika lebih fresh
    const prices = portfCache.prices || {}
    for (const a of list) {
      const pe = prices[a.symbol.toLowerCase()]
      if (pe && now - pe.ts <= PRICE_TTL) {
        a.lastPrice = pe.p
        a.valueUsd = a.qty * a.lastPrice
        a.uPnlAbs = (a.lastPrice - a.avgCost) * a.qty
        a.uPnlPct = a.avgCost > 0 ? ((a.lastPrice - a.avgCost) / a.avgCost) * 100 : 0
      }
    }

    list.sort((a, b) => b.valueUsd - a.valueUsd)
    assets.value = list
    rebuildAssetMap()
    recomputeTotals()
  }
}

/** ===== State saldo & portfolio ===== */
const saldo = ref<number | null>(null)
const totalValue = ref<number | null>(null)
const portfolioUpnlAbs = ref<number>(0)
const portfolioUpnlPct = ref<number>(0)

/** ===== State assets ===== */
const assets = ref<AssetItem[]>([])
const assetMap = new Map<string, AssetItem>() // UPPER symbol -> AssetItem
function rebuildAssetMap() {
  assetMap.clear()
  for (const a of assets.value) assetMap.set(a.symbol.toUpperCase(), a)
}

/** ===== Formatters ===== */
const nfCache = new Map<string, Intl.NumberFormat>()
const nfId = (min: number, max: number) => {
  const k = `${min}-${max}`
  if (!nfCache.has(k))
    nfCache.set(
      k,
      new Intl.NumberFormat('id-ID', { minimumFractionDigits: min, maximumFractionDigits: max }),
    )
  return nfCache.get(k)!
}
const formatNumberId = (nu: number, digits = 2) =>
  Number.isFinite(nu) ? nfId(digits, digits).format(nu) : '0'
const moneyId = (nu: number, digits = 2) => `$${formatNumberId(nu, digits)}`
const signedPercent = (pct: number) =>
  (pct >= 0 ? '+' : '') + (Number.isFinite(pct) ? pct.toFixed(2) : '0.00') + '%'
const signedMoneyId = (nu: number, digits = 2) =>
  (nu >= 0 ? '+' : '-') + moneyId(Math.abs(nu), digits)
/** ===== Helpers ===== */
function splitSymbol(sym: string): { base: string; quote: Quote } {
  const s = sym.toUpperCase()
  if (s.endsWith('USDT')) return { base: s.slice(0, -4), quote: 'USDT' }
  if (s.endsWith('USDC')) return { base: s.slice(0, -4), quote: 'USDC' }
  if (s.endsWith('USD')) return { base: s.slice(0, -3), quote: 'USD' }
  return { base: s, quote: 'USDT' }
}
function normalizeNum(v: string | number | null | undefined): number {
  if (v === null || v === undefined) return 0
  return typeof v === 'number' ? v : Number(v) || 0
}

/** ===== Loaders ===== */
async function loadSaldo() {
  const token = isBrowser() ? localStorage.getItem('token') : ''
  if (!token) return
  try {
    const res = await fetch(`${API_BASE}/saldo`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      credentials: 'include',
    })
    const data: SaldoResponse = await res
      .json()
      .catch(() => ({ status: 'error', saldo: 0, koin: 0 }))
    if (res.ok && data?.status === 'success') {
      const v = Number(data.saldo) || 0
      saldoAwal.value = v
      koinAwal.value = Number(data.koin) || 0
      saldo.value = v
      smartArbAwal.value = Number(data.saldo_smart_arbitrage) || 0 // <- ini ditambah
      upsertSaldoCache(v)
    } else {
      modal.open('Error', 'Gagal mengambil saldo.')
    }
  } catch (e: unknown) {
    modal.open('Error', `Gagal terhubung ke server saldo. ${e instanceof Error ? e.message : ''}`)
  }
}

const loadingAssets = ref(false)
const errorAssets = ref<string | null>(null)

async function loadAssets() {
  loadingAssets.value = true
  errorAssets.value = null
  try {
    const token = isBrowser() ? localStorage.getItem('token') : ''
    if (!token) throw new Error('Token tidak ada.')

    const res = await fetch(`${API_BASE}/positions-all`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      credentials: 'include',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const rows: PositionRow[] = await res.json()

    const mapped: AssetItem[] = rows
      .filter((r) => normalizeNum(r.qty) > 0)
      .map((r) => {
        const sym = String(r.symbol).toUpperCase()
        const { base, quote } = splitSymbol(sym)
        const meta = SYMBOL_META[base] ?? { name: base, logoUrl: localLogo(base), quote }
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

    // overlay cache harga (jika fresh)
    const now = Date.now()
    const prices = portfCache.prices || {}
    for (const a of mapped) {
      const pe = prices[a.symbol.toLowerCase()]
      if (pe && now - pe.ts <= PRICE_TTL) {
        a.lastPrice = pe.p
        a.valueUsd = a.qty * a.lastPrice
        a.uPnlAbs = (a.lastPrice - a.avgCost) * a.qty
        a.uPnlPct = a.avgCost > 0 ? ((a.lastPrice - a.avgCost) / a.avgCost) * 100 : 0
      }
    }

    mapped.sort((a, b) => b.valueUsd - a.valueUsd)
    assets.value = mapped
    rebuildAssetMap()
    recomputeTotals()

    const posItems: PositionsCacheItem[] = mapped.map((a) => ({
      symbol: a.symbol,
      qty: a.qty,
      avgCost: a.avgCost,
      lastPrice: a.lastPrice,
    }))
    upsertPositionsCache(posItems)
  } catch (e: unknown) {
    const msg: string = e instanceof Error ? e.message : 'Gagal memuat assets.'
    errorAssets.value = msg

    assets.value = []
    recomputeTotals()

    // <<< penting: kirim string, bukan string|null
    modal.open('Error', msg)
  } finally {
    loadingAssets.value = false
  }
}

/** ===== Totals (per-frame) ===== */
let totalsScheduled = false
function recomputeTotals() {
  if (totalsScheduled) return
  totalsScheduled = true
  requestAnimationFrame(() => {
    let sumValue = 0,
      sumUpnl = 0,
      cost = 0
    for (const a of assets.value) {
      sumValue += a.valueUsd || 0
      sumUpnl += a.uPnlAbs || 0
      cost += a.avgCost * a.qty
    }
    portfolioUpnlAbs.value = sumUpnl
    portfolioUpnlPct.value = cost > 0 ? (sumUpnl / cost) * 100 : 0
    totalValue.value = (saldo.value ?? 0) + sumValue
    totalsScheduled = false
  })
}

/** ===== Realtime via WebSocket (ticker + kline 1day) ===== */
/* Sesuai server terbaru: client WAJIB subscribe/unsubscribe + snapshot batched */
let aggWs: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null

const KLINE_PERIODS = ['1day'] as const
let subscribedLower = new Set<string>()
let resubTimer: ReturnType<typeof setTimeout> | null = null

function currentActiveSymbolsLower(): string[] {
  return Array.from(new Set(assets.value.map((a) => a.symbol.toLowerCase())))
}
function wsSend(obj: unknown) {
  if (aggWs && aggWs.readyState === WebSocket.OPEN) {
    try {
      aggWs.send(JSON.stringify(obj))
    } catch {}
  }
}
function doSubscribe(symbolsLower: string[]) {
  if (!symbolsLower.length) return
  wsSend({
    type: 'subscribe',
    channels: ['ticker', 'kline'],
    symbols: symbolsLower,
    periods: KLINE_PERIODS,
  })
}
function doUnsubscribe(symbolsLower: string[]) {
  if (!symbolsLower.length) return
  wsSend({
    type: 'unsubscribe',
    channels: ['ticker', 'kline'],
    symbols: symbolsLower,
    periods: KLINE_PERIODS,
  })
}
function requestSnapshot(symbolsLower: string[]) {
  if (!symbolsLower.length) return
  wsSend({ type: 'snapshot', symbols: symbolsLower, periods: KLINE_PERIODS })
}
function scheduleResubscribe() {
  if (resubTimer) return
  resubTimer = window.setTimeout(() => {
    resubTimer = null
    if (!aggWs || aggWs.readyState !== WebSocket.OPEN) return

    const want = new Set(currentActiveSymbolsLower())
    const curr = new Set(subscribedLower)

    const toSub: string[] = []
    const toUnsub: string[] = []

    for (const s of want) if (!curr.has(s)) toSub.push(s)
    for (const s of curr) if (!want.has(s)) toUnsub.push(s)

    if (toUnsub.length) {
      doUnsubscribe(toUnsub)
      for (const s of toUnsub) subscribedLower.delete(s)
    }
    if (toSub.length) {
      doSubscribe(toSub)
      requestSnapshot(toSub)
      for (const s of toSub) subscribedLower.add(s)
    }
  }, 200)
}

// buffer render
const pending: Record<string, { last?: number; klineClose?: number }> = {}
let flushTimer: ReturnType<typeof setTimeout> | null = null

function scheduleFlush() {
  if (flushTimer) return
  flushTimer = window.setTimeout(() => {
    const touched: string[] = []

    for (const [symLower, payload] of Object.entries(pending)) {
      const symUp = symLower.toUpperCase()
      const a = assetMap.get(symUp)
      if (!a) {
        delete pending[symLower]
        continue
      }

      let changed = false
      if (payload.last !== undefined && a.lastPrice !== payload.last) {
        a.lastPrice = payload.last
        changed = true
      }
      if (payload.klineClose !== undefined && a.lastPrice !== payload.klineClose) {
        a.lastPrice = payload.klineClose
        changed = true
      }
      if (changed) {
        a.valueUsd = a.qty * a.lastPrice
        a.uPnlAbs = (a.lastPrice - a.avgCost) * a.qty
        a.uPnlPct = a.avgCost > 0 ? ((a.lastPrice - a.avgCost) / a.avgCost) * 100 : 0
        touched.push(symLower)
      }
      delete pending[symLower]
    }

    if (touched.length) {
      recomputeTotals()
      for (const k of touched) {
        const a = assetMap.get(k.toUpperCase())
        if (a && Number.isFinite(a.lastPrice)) upsertPriceCache(k, a.lastPrice)
      }
    }

    flushTimer = null
  }, 300)
}

function connectAggregatorWs() {
  if (aggWs) {
    try {
      aggWs.close()
    } catch {}
    aggWs = null
  }

  aggWs = new WebSocket(WS_BASE)

  aggWs.onopen = () => {
    subscribedLower = new Set()
    scheduleResubscribe()
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

      // snapshot batched
      if (msg?.type === 'snapshot' && Array.isArray(msg.items)) {
        for (const it of msg.items) {
          const symLower = String(it.symbol || '').toLowerCase()
          if (!symLower) continue
          if (it.type === 'ticker' && Number.isFinite(Number(it.last))) {
            ;(pending[symLower] ||= {}).last = Number(it.last)
          } else if (it.type === 'kline' && it.period === '1day') {
            const c = Number(it.close)
            if (Number.isFinite(c)) (pending[symLower] ||= {}).klineClose = c
          }
        }
        scheduleFlush()
        return
      }

      // event individual
      const symLower = String(msg.symbol || '').toLowerCase()
      if (!symLower) return

      if (msg.type === 'ticker' && Number.isFinite(Number(msg.last))) {
        ;(pending[symLower] ||= {}).last = Number(msg.last)
        scheduleFlush()
        return
      }
      if (msg.type === 'kline' && msg.period === '1day') {
        const close = Number(msg.close)
        if (Number.isFinite(close)) {
          ;(pending[symLower] ||= {}).klineClose = close
          scheduleFlush()
        }
        return
      }
    } catch {
      /* ignore */
    }
  }
}

/** ===== Navigasi ===== */
function goAsset(a: { symbol: string }) {
  const sym = String(a.symbol || '').toLowerCase() // BTCUSDT -> btcusdt
  if (!sym) return
  router.push({ path: '/trade', query: { symbol: sym } })
}

/** ===== Lifecycle ===== */
let removeBeforeUnload: (() => void) | null = null

onMounted(() => {
  loadPortfolioCache()
  hydrateFromCache()

  // beforeunload listener
  if (isBrowser()) {
    const flush = () => {
      try {
        localStorage.setItem(PORTF_LS_KEY, JSON.stringify(portfCache))
      } catch {}
    }
    window.addEventListener('beforeunload', flush)
    removeBeforeUnload = () => window.removeEventListener('beforeunload', flush)
  }

  // async tasks
  ;(async () => {
    await loadSaldo()
    await loadAssets()
    connectAggregatorWs() // connect setelah assets terisi
  })().catch(() => {})
})

// resubscribe kalau daftar aset berubah
watch(
  assets,
  () => {
    rebuildAssetMap()
    recomputeTotals()
    scheduleResubscribe()
  },
  { deep: true },
)

onUnmounted(() => {
  if (removeBeforeUnload) {
    removeBeforeUnload()
    removeBeforeUnload = null
  }
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
