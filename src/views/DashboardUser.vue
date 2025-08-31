<template>
  <div>
    <!-- Section: Total Value Summary -->
    <section class="bg-white mb-6 px-4 mt-2">
      <div class="flex flex-row justify-between items-center">
        <div class="flex flex-col">
          <div class="flex items-center space-x-1 text-gray-700 text-sm font-normal mb-1">
            <span>Est. Total Value</span>
            <!-- EYE: toggle hide/show -->
            <button type="button" class="inline-flex items-center" :aria-pressed="isTotalHidden ? 'true' : 'false'"
              :title="isTotalHidden ? 'Show balance' : 'Hide balance'" @click="toggleTotalHidden">
              <Icon :icon="isTotalHidden ? 'tabler:eye-off' : 'tabler:eye'" class="w-4 h-4" />
            </button>
          </div>

          <div class="flex items-baseline space-x-1 font-semibold text-3xl text-black mb-1">
            <span>{{ totalValueUsdtStr }}</span>
            <span class="text-base font-normal">USDT</span>
            <!-- CHEVRON DIHILANGKAN -->
          </div>

          <div class="text-gray-400 text-sm mb-2">≈ ${{ totalValueUsdStr }}</div>
        </div>

        <RouterLink to="/add-funds"
          class="bg-teal-500 flex justify-center items-center active:bg-teal-600 text-white rounded-md px-6 py-2 text-[10px] font-normal transition-colors w-[100px] text-center">
          Add Funds
        </RouterLink>
      </div>
      <div class="text-xs flex items-center text-black mb-4">
        Unrealized PnL
        <span class="font-semibold ml-1" :class="portfolioUpnlAbs >= 0 ? 'text-[#3ABBA3]' : 'text-red-500'">
          {{ signedMoneyId(portfolioUpnlAbs, 2) }}
          ({{ signedPercent(portfolioUpnlPct) }})
        </span>
        <Icon icon="tabler:chevron-right" class="ml-1 text-gray-400 w-4 h-4" />
      </div>
      <div class="grid grid-cols-4 gap-x-6 gap-y-6 mt-5">
        <RouterLink v-for="item in items" :key="item.to" :to="item.to" class="group flex flex-col items-center"
          :aria-label="item.label" @click.prevent="onMenuClick(item)">
          <div
            class="relative w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shadow-sm ring-1 ring-gray-200/60 hover:ring-gray-300 transition group-active:scale-95">
            <!-- notif pusher merah untuk menu Event -->
            <span v-if="isEventItem(item) && hasEventNotif"
              class="absolute -top-1 -right-1 inline-flex w-3 h-3 rounded-full bg-red-500/70 ring-2 ring-white badge-pulse"
              aria-hidden="true" />
            <img :src="item.img" :alt="item.label"
              :class="['object-contain', isP2PItem(item) ? 'w-5 h-5' : 'w-7 h-7']" />
          </div>
          <span class="mt-2 text-xs text-gray-700 text-center font-semibold">{{ item.label }}</span>
        </RouterLink>
      </div>
    </section>

    <!-- Section: Traders League and Market Table -->
    <section class="w-full bg-[#f0f7fc] rounded-2xl p-5 drop-shadow-md">
      <!-- Top Banner -->
      <SliderDashboard />

      <!-- Market Table -->
      <div class="bg-white rounded-2xl p-5 space-y-6">
        <!-- Tabs -->
        <div class="flex space-x-6 text-[13px] font-semibold text-[#6b7280]">
          <button class="text-black font-bold">Crypto</button>
          <router-link to="/futures">
            <button>Futures</button>
          </router-link>
        </div>

        <!-- Table Header -->
        <div class="grid grid-cols-[1fr_1fr_1fr] text-[12px] text-[#9ca3af] font-normal">
          <div>Name</div>
          <div class="text-right">Last Price</div>
          <div class="text-right">24h chg%</div>
        </div>

        <div class="space-y-4">
          <RouterLink :to="`/trade?symbol=${item.name.toLowerCase()}usdt`"
            class="grid grid-cols-[1fr_1fr_1fr] items-center hover:bg-gray-50 transition-colors duration-150 rounded-lg px-2 py-1"
            v-for="item in filteredMarketData" :key="item.name">
            <div class="flex items-center space-x-1 font-semibold text-[14px] text-black">
              <img :src="item.icon" :alt="item.name + ' icon'" class="w-3.5 h-3.5" width="14" height="14"
                @error="item.icon = ICON_FALLBACK" />
              <span>{{ item.name }}</span>
            </div>
            <div class="text-right">
              <div class="font-bold text-[12px] leading-none">
                {{ item.price !== null ? item.price : '...' }}
              </div>
              <div class="text-[10px] text-[#9ca3af] mt-0.5">
                {{ item.price !== null ? '$' + item.price : '...' }}
              </div>
            </div>
            <div class="text-right">
              <button :class="[
                'text-white text-[12px] font-semibold rounded-md px-3 py-1 ml-auto inline-block',
                item.change === null
                  ? 'bg-slate-500'
                  : item.change > 0
                    ? 'bg-green-500'
                    : item.change < 0
                      ? 'bg-red-500'
                      : 'bg-slate-500',
              ]">
                {{
                  item.change === null
                    ? '...'
                    : (item.change > 0 ? '+' : item.change < 0 ? '-' : '') + Math.abs(item.change).toFixed(2) + '%' }}
                  </button>
            </div>
          </RouterLink>
        </div>

        <!-- View More -->
        <RouterLink to="/market"
          class="block text-center text-[12px] text-[#9ca3af] font-normal cursor-pointer select-none hover:underline">
          View more
        </RouterLink>
      </div>
    </section>

    <!-- News -->
    <section class="w-full bg-[#f0f7fc] rounded-2xl p-5 pt-0 mt-0 drop-shadow-md pb-20 space-y-4">
      <div v-if="loading" class="text-center text-sm text-gray-500 py-10">Loading...</div>

      <div v-else-if="newsList.length === 0" class="text-center text-sm text-gray-500 py-10">
        No Data Available
      </div>

      <div v-else v-for="(news, index) in newsList" :key="index"
        class="bg-white rounded-2xl p-5 flex flex-col space-y-3 hover:bg-gray-50 transition-colors duration-150">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-1 text-gray-900 font-semibold text-sm">
            <span class="text-[10px] leading-none">•</span>
            <span>{{ news.date }}</span>
          </div>
          <div class="font-extrabold text-sm text-black">News</div>
        </div>

        <div class="text-gray-400 text-xs font-normal select-none">
          {{ news.time }}
        </div>

        <div class="flex items-start space-x-4">
          <img v-if="news && news.image" :src="`https://one-ledger.masmutpanel.my.id${news.image}`" alt="News Image"
            class="w-24 h-16 object-cover rounded-lg" />
          <div class="flex-1 space-y-1">
            <div class="font-extrabold text-black text-sm leading-[1.1]">
              {{ news.title }}
            </div>
            <div class="text-xs text-gray-500">
              {{ truncate(news.content, 25) }}
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <RouterLink :to="`/news/${news.slug}`" class="text-[#3ABBA3] text-xs font-semibold hover:underline">
            Read more
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Terms Modal -->
    <div v-if="showModalTerm" class="fixed inset-0 z-51 flex items-center justify-center" aria-modal="true"
      role="dialog">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/30" @click="closeModalTerm"></div>

      <!-- Panel -->
      <div class="relative z-10 w-full max-w-lg mx-4 rounded-2xl bg-white shadow-xl" @click.stop>
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 class="text-[12px] font-semibold">Terms &amp; Conditions</h3>
          <button type="button" class="p-1 rounded hover:bg-gray-100" @click="closeModalTerm" aria-label="Close">
            <Icon icon="tabler:x" class="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <!-- Body -->
        <div ref="termsScrollArea"
          class="max-h-[70dvh] overflow-y-auto px-4 py-3 text-[12px] leading-relaxed text-gray-700"
          @scroll="onTermsScroll">
          <p class="font-semibold">Terms &amp; Conditions – Ledger Wallet Exchange</p>
          <p class="mt-2">
            Welcome to Ledger Wallet Exchange. By accessing, registering, or using our platform, you agree to comply
            with and be bound by these Terms &amp; Conditions (“Terms”). Please read them carefully before using our
            services.
          </p>

          <h4 class="mt-3 font-semibold">1. Eligibility</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>You must be at least 18 years old (or the legal age in your jurisdiction).</li>
            <li>You must comply with all applicable laws and regulations in your country of residence.</li>
            <li>By creating an account, you confirm that all information provided is accurate and truthful.</li>
          </ul>

          <h4 class="mt-3 font-semibold">2. Account Registration &amp; Security</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
            <li>You agree not to share your account with third parties.</li>
            <li>Ledger Wallet Exchange will never ask for your password or private keys.</li>
          </ul>

          <h4 class="mt-3 font-semibold">3. KYC &amp; AML Compliance</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>Users must complete identity verification (KYC) as required by our AML policy.</li>
            <li>We reserve the right to suspend or terminate accounts that fail verification or raise compliance
              concerns.</li>
          </ul>

          <h4 class="mt-3 font-semibold">4. Services Provided</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>Buying, selling, and exchanging supported digital assets.</li>
            <li>Secure wallet integration powered by Ledger technology.</li>
            <li>Access to trading tools, market data, and APIs.</li>
          </ul>

          <h4 class="mt-3 font-semibold">5. Fees</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>All applicable trading, deposit, and withdrawal fees are outlined in our Fee Structure page.</li>
            <li>Fees may change without prior notice but will always be visible before confirming a transaction.</li>
          </ul>

          <h4 class="mt-3 font-semibold">6. Risks Disclaimer</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>Trading cryptocurrencies involves high risk and may result in loss of funds.</li>
            <li>Prices are volatile and not guaranteed by Ledger Wallet Exchange.</li>
            <li>You should not invest more than you can afford to lose.</li>
          </ul>

          <h4 class="mt-3 font-semibold">7. User Obligations</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>You agree not to use our platform for illegal activities (fraud, money laundering, terrorist financing,
              etc.).</li>
            <li>You are solely responsible for tax obligations in your jurisdiction.</li>
          </ul>

          <h4 class="mt-3 font-semibold">8. Security &amp; Wallet Responsibility</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>Assets are secured using Ledger wallet technology and cold storage solutions.</li>
            <li>You remain responsible for safeguarding your wallet recovery phrase and private keys.</li>
          </ul>

          <h4 class="mt-3 font-semibold">9. Suspension &amp; Termination</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>We may suspend or terminate accounts for violating these Terms, legal requirements, or security
              concerns.</li>
            <li>Users will be notified in case of termination, except where prohibited by law.</li>
          </ul>

          <h4 class="mt-3 font-semibold">10. Limitation of Liability</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>Ledger Wallet Exchange is not liable for losses due to market volatility, system downtime, or
              unauthorized access caused by user negligence.</li>
            <li>Services are provided “as is” without guarantees of uninterrupted availability.</li>
          </ul>

          <h4 class="mt-3 font-semibold">11. Amendments</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>We may update these Terms at any time.</li>
            <li>Continued use of the platform after updates constitutes acceptance of the revised Terms.</li>
          </ul>

          <h4 class="mt-3 font-semibold">12. Governing Law</h4>
          <p>These Terms are governed by the laws of Insert Jurisdiction. Any disputes shall be resolved through
            arbitration or courts in that jurisdiction.</p>

          <div class="h-2"></div>
        </div>

        <!-- Footer -->
        <div class="px-4 py-3 border-t border-gray-100 flex justify-end">
          <button type="button" class="px-4 py-2 rounded-lg font-medium text-[12px]"
            :class="termsReadDone ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'"
            :disabled="!termsReadDone" @click="acknowledgeTerms">
            I understand
          </button>
        </div>
      </div>
    </div>
    <!-- /Terms Modal -->

  </div>
</template>

<script setup lang="ts">
import { useApiAlertStore } from '@/stores/apiAlert'
import SliderDashboard from '@/components/dashboard/SliderDashboard.vue'
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'

/** ===== Konstanta ===== */
const API_BASE = 'https://one-ledger.masmutpanel.my.id/api'
const WS_BASE = 'wss://ledgersocketone.online'
const ICON_FALLBACK = '/img/crypto/_default.svg'
const iconPath = (s: string) => `/img/crypto/${s.toLowerCase()}.svg`
const isBrowser = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined'
const getToken = () => (isBrowser() ? localStorage.getItem('token') || '' : '')

/** ===== Terms modal (Dashboard) ===== */
const TERMS_KEY = 'termsLogin'
const showModalTerm = ref(false)
const termsReadDone = ref(false)
const termsScrollArea = ref<HTMLDivElement | null>(null)

function openModalTerm() {
  showModalTerm.value = true
  termsReadDone.value = false
  document.documentElement.style.overflow = 'hidden'
}
function closeModalTerm() {
  showModalTerm.value = false
  document.documentElement.style.overflow = ''
}
function onTermsScroll(e: Event) {
  const el = e.target as HTMLDivElement
  const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4
  if (atBottom) termsReadDone.value = true
}
function acknowledgeTerms() {
  localStorage.setItem(TERMS_KEY, 'true')
  closeModalTerm()
}

// === Terms gating ===
try {
  const accepted = localStorage.getItem(TERMS_KEY) === 'true'
  if (!accepted) openModalTerm()
} catch {
  // kalau gagal akses localStorage, tetap tampilkan modal
  openModalTerm()
}

/** ===== Persist hide/show saldo ===== */
const TV_HIDE_KEY = 'dashHideTotal:v1'
const isTotalHidden = ref(false)
function toggleTotalHidden() {
  isTotalHidden.value = !isTotalHidden.value
}
onMounted(() => {
  if (isBrowser()) {
    isTotalHidden.value = localStorage.getItem(TV_HIDE_KEY) === '1'
  }
})
watch(isTotalHidden, (v) => {
  if (isBrowser()) localStorage.setItem(TV_HIDE_KEY, v ? '1' : '0')
})

/** ===== Menu ===== */
interface MenuItem {
  label: string
  to: string
  img: string
}
const items: MenuItem[] = [
  { label: 'Arbitrage', to: '/smart-arbitrage', img: '/img/robot-logo.png' },
  { label: 'P2P', to: '/p2p', img: '/img/P2P.png' },
  { label: 'Megadrop', to: '/megadrop', img: '/img/newmenu/megadrop.png' },
  { label: 'Copy Trade', to: '/futures', img: '/img/CopyTrade.png' },
  { label: 'Event', to: '/event', img: '/img/newmenu/event.png' },
  { label: 'More', to: '/account', img: '/img/newmenu/more.png' },
]

const isP2PItem = (item: MenuItem) => item.label?.toLowerCase() === 'p2p'

const router = useRouter()

/** ===== Cache Dashboard (dipertahankan dari kode Anda) ===== */
type PriceEntry = { p: number; ts: number }
type OpenEntry = { o: number; ts: number }
type PosMini = { symbol: string; qty: number; avgCost: number }
type DashCache = {
  saldo?: { v: number; ts: number }
  positions?: { items: PosMini[]; ts: number }
  prices?: Record<string, PriceEntry>
  dayOpen?: Record<string, OpenEntry>
}
const DASH_LS_KEY = 'dashCache:v1'
const SALDO_TTL = 15_000
const POS_TTL = 5 * 60_000
const PRICE_TTL = 2 * 60_000
const OPEN_TTL = 60 * 60_000

let dcache: DashCache = { prices: {}, dayOpen: {} }
let saveTimer: ReturnType<typeof setTimeout> | null = null

function loadDashCache() {
  if (!isBrowser()) return
  try {
    const raw = localStorage.getItem(DASH_LS_KEY)
    dcache = raw ? (JSON.parse(raw) as DashCache) : { prices: {}, dayOpen: {} }
    dcache.prices ||= {}
    dcache.dayOpen ||= {}
  } catch {
    dcache = { prices: {}, dayOpen: {} }
  }
}
function saveDashCacheDebounced() {
  if (!isBrowser()) return
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = window.setTimeout(() => {
    try {
      localStorage.setItem(DASH_LS_KEY, JSON.stringify(dcache))
    } catch { }
    saveTimer = null
  }, 250)
}
function upsertSaldoCache(v: number) {
  dcache.saldo = { v, ts: Date.now() }
  saveDashCacheDebounced()
}
function upsertPositionsCache(items: PosMini[]) {
  dcache.positions = { items, ts: Date.now() }
  saveDashCacheDebounced()
}
function upsertPriceCache(symLower: string, price: number) {
  ; (dcache.prices ||= {})[symLower] = { p: price, ts: Date.now() }
  saveDashCacheDebounced()
}
function upsertOpenCache(symLower: string, open: number) {
  ; (dcache.dayOpen ||= {})[symLower] = { o: open, ts: Date.now() }
  saveDashCacheDebounced()
}

/** Hydrate UI dari cache */
function hydrateFromCache() {
  const now = Date.now()
  if (dcache.saldo && now - dcache.saldo.ts <= SALDO_TTL) saldo.value = Number(dcache.saldo.v) || 0
  if (dcache.positions && now - dcache.positions.ts <= POS_TTL) {
    positions.value = dcache.positions.items.map((it) => ({
      symbol: it.symbol,
      qty: it.qty,
      avg_cost: it.avgCost,
    }))
  }
  if (dcache.prices) {
    for (const [k, v] of Object.entries(dcache.prices)) {
      if (now - v.ts <= PRICE_TTL) priceMap[k.toUpperCase()] = v.p
    }
  }
  if (dcache.dayOpen) {
    for (const coin of displayedCoins) {
      const lower = symbolMap[coin] + 'usdt'
      const openRec = dcache.dayOpen[lower]
      const last = priceMap[lower.toUpperCase()]
      if (openRec && now - openRec.ts <= OPEN_TTL && Number.isFinite(last)) {
        const row = marketData.value.find((x) => x.name === coin)
        if (row) {
          row.price = last
          row.change = openRec.o ? ((last - openRec.o) / openRec.o) * 100 : null
        }
      }
    }
  }
  recomputeTotals()
}

/** ===== Summary (saldo & PnL) ===== */
const saldo = ref<number | null>(null)
const totalValue = ref<number | null>(null)
const portfolioUpnlAbs = ref<number>(0)
const portfolioUpnlPct = ref<number>(0)

/** String yang ditampilkan (respect isTotalHidden) */
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

/** ===== Positions ===== */
type PositionRow = { symbol: string; qty: string | number; avg_cost: string | number }
const positions = ref<PositionRow[]>([])
const priceMap = reactive<Record<string, number>>({})

/** ===== Market small table ===== */
interface MarketItem {
  name: string
  price: number | null
  change: number | null
  icon: string
}
const displayedCoins = ['BNB', 'BTC', 'ETH', 'SOL', 'XRP'] as const
const symbolMap: Record<string, string> = {
  BNB: 'bnb',
  BTC: 'btc',
  ETH: 'eth',
  SOL: 'sol',
  XRP: 'xrp',
}
const marketData = ref<MarketItem[]>(
  displayedCoins.map((c) => ({ name: c, price: null, change: null, icon: iconPath(c) })),
)

/** ===== Helpers (tetap) ===== */
const nfIdCache = new Map<string, Intl.NumberFormat>()
const nfId = (min: number, max: number) => {
  const key = `${min}-${max}`
  if (!nfIdCache.has(key))
    nfIdCache.set(
      key,
      new Intl.NumberFormat('id-ID', { minimumFractionDigits: min, maximumFractionDigits: max }),
    )
  return nfIdCache.get(key)!
}
const n = (v: unknown, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d)
const formatNumberId = (nu: number, digits = 2) =>
  Number.isFinite(nu) ? nfId(digits, digits).format(nu) : '0'
const moneyId = (nu: number, digits = 2) => `$${formatNumberId(nu, digits)}`
const signedPercent = (pct: number) =>
  (pct >= 0 ? '+' : '') + (Number.isFinite(pct) ? pct.toFixed(2) : '0.00') + '%'
const signedMoneyId = (nu: number, digits = 2) =>
  (nu >= 0 ? '+' : '-') + moneyId(Math.abs(nu), digits)
const truncate = (text: string, limit: number): string =>
  text.length > limit ? text.substring(0, limit) + '...' : text

/** ===== Totals ===== */
let totalsScheduled = false
function recomputeTotals() {
  if (totalsScheduled) return
  totalsScheduled = true
  requestAnimationFrame(() => {
    let sumValue = 0,
      sumUpnl = 0,
      sumCost = 0
    for (const p of positions.value) {
      const sym = String(p.symbol).toUpperCase()
      const last = n(priceMap[sym], 0)
      const qty = n(p.qty, 0)
      const avg = n(p.avg_cost, 0)
      sumValue += qty * last
      sumUpnl += (last - avg) * qty
      sumCost += avg * qty
    }
    portfolioUpnlAbs.value = sumUpnl
    portfolioUpnlPct.value = sumCost > 0 ? (sumUpnl / sumCost) * 100 : 0
    totalValue.value = (saldo.value ?? 0) + sumValue
    totalsScheduled = false
  })
}

/** ===== Notif Event ===== */
type ApiNotifResp = { success: boolean; notif: 0 | 1; unread: boolean; user_id: number }
type ApiResetResp = { success: boolean; updated: number; user_id: number }
const hasEventNotif = ref<boolean>(false)
async function loadEventNotif() {
  const token = getToken()
  if (!token) {
    hasEventNotif.value = false
    return
  }
  try {
    const res = await fetch(`${API_BASE}/claim-new-user/notif`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      credentials: 'include',
    })
    const data: ApiNotifResp | Record<string, never> = res.ok
      ? await res.json().catch(() => ({}))
      : {}
    hasEventNotif.value = !!(res.ok && 'unread' in data && (data as ApiNotifResp).unread)
  } catch {
    hasEventNotif.value = false
  }
}
async function resetEventNotif(): Promise<ApiResetResp> {
  const token = getToken()
  if (!token) throw new Error('No token')
  const res = await fetch(`${API_BASE}/claim-new-user/notif/reset`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`))
  const data = (await res.json()) as ApiResetResp
  hasEventNotif.value = false
  return data
}
function isEventItem(item: MenuItem): boolean {
  return item.to === '/event' || item.label.toLowerCase() === 'event'
}
async function onMenuClick(item: MenuItem) {
  if (isEventItem(item) && hasEventNotif.value) await resetEventNotif()
  router.push(item.to)
}

/** ===== Loaders ===== */
async function loadSaldo() {
  const token = getToken()
  if (!token) {
    saldo.value = 0
    return
  }
  const res = await fetch(`${API_BASE}/saldo`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    credentials: 'include',
  })
  const data = await res.json().catch(() => ({}) as Record<string, unknown>)
  const val =
    res.ok && (data as { status?: string; saldo?: number })?.status === 'success'
      ? n((data as { saldo?: number }).saldo, 0)
      : 0
  saldo.value = val
  upsertSaldoCache(Number(val))
}
async function loadPositions() {
  const token = getToken()
  if (!token) {
    positions.value = []
    upsertPositionsCache([])
    return
  }
  const res = await fetch(`${API_BASE}/positions-all`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    credentials: 'include',
  })
  const rows: PositionRow[] = res.ok ? await res.json().catch(() => []) : []
  const filtered = rows.filter((r) => n(r.qty, 0) > 0)
  positions.value = filtered
  const mini: PosMini[] = filtered.map((r) => ({
    symbol: String(r.symbol).toUpperCase(),
    qty: n(r.qty, 0),
    avgCost: n(r.avg_cost, 0),
  }))
  upsertPositionsCache(mini)
}

/** ===== WS (ringkas) ===== */
let activeLower = new Set<string>()
function rebuildActiveLower() {
  const s = new Set<string>()
  for (const p of positions.value) s.add(String(p.symbol).toLowerCase())
  for (const c of displayedCoins) s.add(symbolMap[c] + 'usdt')
  activeLower = s
}
watch(
  positions,
  () => {
    rebuildActiveLower()
    scheduleResubscribe()
  },
  { deep: true },
)

const pendingPrice: Record<string, number> = {}
const pendingKlineClose: Record<string, number> = {}
let flushTimer: ReturnType<typeof setTimeout> | null = null
function scheduleFlush() {
  if (flushTimer) return
  flushTimer = window.setTimeout(() => {
    const touched: string[] = []
    for (const [symUp, px] of Object.entries(pendingPrice)) {
      if (priceMap[symUp] !== px) {
        priceMap[symUp] = px
        touched.push(symUp)
      }
      delete pendingPrice[symUp]
    }
    for (const [symUp, close] of Object.entries(pendingKlineClose)) {
      if (priceMap[symUp] !== close) {
        priceMap[symUp] = close
        touched.push(symUp)
      }
      delete pendingKlineClose[symUp]
    }
    for (const symUp of touched) upsertPriceCache(symUp.toLowerCase(), priceMap[symUp])
    if (touched.length) recomputeTotals()
    for (const item of marketData.value) {
      const upper = (symbolMap[item.name] + 'usdt').toUpperCase()
      const last = priceMap[upper]
      if (last !== undefined) item.price = Number(last)
    }
    flushTimer = null
  }, 300)
}
let wsAgg: WebSocket | null = null
let wsTimer: ReturnType<typeof setTimeout> | null = null
const dayOpen: Record<string, number> = {}
function handleKline1d(symLower: string, open: number, close: number) {
  const symUp = symLower.toUpperCase()
  dayOpen[symUp] = open
  pendingKlineClose[symUp] = close
  upsertOpenCache(symLower, open)
  upsertPriceCache(symLower, close)
  const coin = displayedCoins.find((c) => symbolMap[c] + 'usdt' === symLower)
  if (coin && open) {
    const row = marketData.value.find((x) => x.name === coin)
    if (row) {
      row.price = close
      row.change = ((close - open) / open) * 100
    }
  }
  scheduleFlush()
}
function handleTicker(symLower: string, last: number) {
  const symUp = symLower.toUpperCase()
  pendingPrice[symUp] = last
  upsertPriceCache(symLower, last)
  scheduleFlush()
}
const KLINE_PERIODS = ['1day'] as const
let subscribedLower = new Set<string>()
let resubTimer: ReturnType<typeof setTimeout> | null = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function wsSend(obj: any) {
  if (wsAgg && wsAgg.readyState === WebSocket.OPEN) {
    try {
      wsAgg.send(JSON.stringify(obj))
    } catch { }
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
    if (!wsAgg || wsAgg.readyState !== WebSocket.OPEN) return
    const want = new Set(activeLower)
    const current = new Set(subscribedLower)
    const toSub: string[] = []
    const toUnsub: string[] = []
    for (const s of want) if (!current.has(s)) toSub.push(s)
    for (const s of current) if (!want.has(s)) toUnsub.push(s)
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
function connectAggregator() {
  if (wsAgg) {
    try {
      wsAgg.close()
    } catch { }
  }
  wsAgg = new WebSocket(WS_BASE)
  wsAgg.onopen = () => {
    subscribedLower = new Set()
    scheduleResubscribe()
  }
  wsAgg.onclose = () => {
    wsAgg = null
    if (wsTimer) clearTimeout(wsTimer)
    wsTimer = window.setTimeout(connectAggregator, 2000)
  }
  wsAgg.onerror = () => {
    try {
      wsAgg?.close()
    } catch { }
  }
  wsAgg.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data as string)
      if (msg?.type === 'snapshot' && Array.isArray(msg.items)) {
        for (const it of msg.items) {
          const symLower = String(it.symbol || '').toLowerCase()
          if (!symLower || !activeLower.has(symLower)) continue
          if (it.type === 'ticker' && Number.isFinite(Number(it.last))) {
            handleTicker(symLower, Number(it.last))
          } else if (it.type === 'kline' && it.period === '1day') {
            const o = Number(it.open),
              c = Number(it.close)
            if (Number.isFinite(o) && Number.isFinite(c)) handleKline1d(symLower, o, c)
          }
        }
        return
      }
      const symLower = String(msg.symbol || '').toLowerCase()
      if (!symLower || !activeLower.has(symLower)) return
      if (msg.type === 'ticker' && Number.isFinite(Number(msg.last))) {
        handleTicker(symLower, Number(msg.last))
        return
      }
      if (msg.type === 'kline' && msg.period === '1day') {
        const open = Number(msg.open),
          close = Number(msg.close)
        if (Number.isFinite(open) && Number.isFinite(close)) handleKline1d(symLower, open, close)
        return
      }
    } catch {
      /* ignore */
    }
  }
}

/** ===== News ===== */
interface ApiNewsItem {
  id: number
  title: string
  slug: string
  content: string
  image: string
  published_at: string
}
interface NewsItem extends ApiNewsItem {
  date: string
  time: string
}
const newsList = ref<NewsItem[]>([])
const loading = ref(true)
const modal = useApiAlertStore()

/** ===== Market computed ===== */
const filteredMarketData = computed(
  () =>
    displayedCoins
      .map((coin) => marketData.value.find((item) => item.name === coin))
      .filter(Boolean) as MarketItem[],
)

/** ===== Scroll & visibility ===== */
const onScroll = () => {
  const bottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100
  if (!bottom) return
}
const visHandler = () => {
  if (document.hidden) saveDashCacheDebounced()
}

/** ===== Lifecycle ===== */
onMounted(async () => {
  loadDashCache()
  hydrateFromCache()
  await Promise.all([loadSaldo(), loadPositions()])
  for (const p of positions.value) {
    const key = String(p.symbol).toUpperCase()
    priceMap[key] = priceMap[key] ?? 0
  }
  rebuildActiveLower()
  recomputeTotals()
  connectAggregator()
  window.addEventListener('scroll', onScroll, { passive: true })
  requestAnimationFrame(() => onScroll())
  const token = getToken()
  if (!token) {
    modal.open('Unauthorized', 'Token tidak ditemukan.')
  } else {
    try {
      const res = await fetch(`${API_BASE}/news`, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}) as Record<string, unknown>)
      if (res.ok && (data as { status?: string })?.status === 'success') {
        newsList.value = ((data as { data: ApiNewsItem[] }).data || []).map((item) => {
          const d = new Date(item.published_at)
          return {
            ...item,
            date: d.toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            }),
            time: d.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }),
          }
        })
      } else {
        modal.open('Error', (data as { message?: string })?.message || 'Gagal memuat berita.')
      }
    } catch (e: unknown) {
      modal.open(
        'Error',
        `Gagal terhubung ke server. ${e instanceof Error ? e.message : JSON.stringify(e)}`,
      )
    } finally {
      loading.value = false
    }
    await loadEventNotif()
  }
  if (isBrowser()) document.addEventListener('visibilitychange', visHandler, { passive: true })
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  if (isBrowser()) document.removeEventListener('visibilitychange', visHandler)
  if (wsAgg) {
    try {
      wsAgg.close()
    } catch { }
    wsAgg = null
  }
  if (wsTimer) {
    clearTimeout(wsTimer)
    wsTimer = null
  }
  try {
    if (isBrowser()) localStorage.setItem(DASH_LS_KEY, JSON.stringify(dcache))
  } catch { }
})
</script>

<style scoped>
@keyframes badge-pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.2);
  }
}

.badge-pulse {
  animation: badge-pulse 1.1s ease-in-out infinite;
  transform-origin: center;
  will-change: transform;
}
</style>
