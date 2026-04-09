# Laporan Optimasi Arsitektur — `one-ledger-vue`

> **Tanggal:** 9 April 2026
> **Scope:** `OneLedgerOld/one-ledger-vue/src/`
> **Stack:** Vue 3 (Composition API) · Pinia · Vue Router 4 · Tailwind CSS v4 · Vite 7 · PWA

---

## Daftar Isi

1. [Ringkasan Arsitektur Saat Ini](#1-ringkasan-arsitektur-saat-ini)
2. [CRITICAL — Harus Segera Diperbaiki](#2-critical--harus-segera-diperbaiki)
3. [HIGH — Sangat Disarankan Diperbaiki](#3-high--sangat-disarankan-diperbaiki)
4. [MEDIUM — Perlu Diperbaiki](#4-medium--perlu-diperbaiki)
5. [LOW — Nice to Have](#5-low--nice-to-have)
6. [Ringkasan Total Duplikasi](#6-ringkasan-total-duplikasi)
7. [Rekomendasi Prioritas Refactor](#7-rekomendasi-prioritas-refactor)

---

## 1. Ringkasan Arsitektur Saat Ini

### Stack Teknologi

| Layer      | Teknologi                                        |
| ---------- | ------------------------------------------------ |
| Framework  | Vue 3 (Composition API, `<script setup>`)        |
| State      | Pinia (hanya 1 store: `apiAlert`)                |
| Routing    | Vue Router 4 (history mode, lazy-loaded)         |
| Styling    | Tailwind CSS v4                                  |
| Build      | Vite 7 + PWA (`vite-plugin-pwa` / Workbox)       |
| HTTP       | Raw `fetch()` langsung di setiap komponen         |
| Realtime   | WebSocket manual ke `wss://ws.hyper-led.com`     |
| Charts     | ApexCharts + Lightweight Charts                  |
| Meta / SEO | `@vueuse/head`                                   |

### Struktur Folder

```
src/
├── main.ts                 → Bootstrap (Pinia, Router, Head)
├── App.vue                 → Device gate (mobile-only), anti-inspect, meta fetch
├── layouts/
│   └── MainLayout.vue      → Header, bottom nav, search, auth guard (564 baris)
├── router/index.ts         → 40+ routes, auth middleware (token validation per-navigasi)
├── views/                  → 30+ page-level components (monolith per halaman)
│   ├── auth/               → Login, Register, ForgotPassword, ResetPassword, OTP
│   ├── menu/               → SmartArbitrage, P2P, LaunchPool, HubReward, dll.
│   ├── DashboardUser.vue   → 1382 baris
│   ├── NewMarketCoin.vue   → 2485 baris ⚠️
│   ├── AssetsData.vue      → 1045 baris
│   ├── FuturesCopy.vue     → 861 baris
│   ├── MarketAll.vue       → 773 baris
│   └── ... (25+ file lainnya)
├── components/             → Shared component (sangat sedikit)
│   ├── ApiAlerts.vue       → Global alert modal
│   ├── A2HSButton.vue      → Install PWA button
│   ├── dashboard/          → 2 slider component
│   ├── futures/            → ChatCard, MiniAreaChart, SliderCopyTrade
│   ├── landing/            → DashboardSliderCrypto, SplineAreaChart
│   ├── menu/               → LanguageSelector, MenuSection
│   ├── trade/              → LightChart
│   └── transfer/           → TransferConfirmModal
├── composables/            → 4 composable
│   ├── useA2HS.ts          → Add to Home Screen
│   ├── useCoinWebSocket.ts → WebSocket untuk 1 koin (jarang dipakai)
│   ├── useNotificationCounter.ts → Polling notifikasi
│   └── useR2Files.ts       → Upload/manage R2 files
├── stores/                 → 1 store saja
│   └── apiAlert.ts         → Alert modal state
└── lib/
    └── api.ts              → Axios instance (hampir tidak terpakai)
```

### Alur Autentikasi

```
User Login → Token disimpan di localStorage
           → Setiap navigasi: router.beforeEach() → fetch('/api/auth-token')
           → Setiap API call: manual localStorage.getItem('token') + set header
```

### Alur Data Realtime

```
Setiap halaman (Dashboard, Market, Trade, Assets):
  → new WebSocket('wss://ws.hyper-led.com')
  → Manual subscribe/unsubscribe/snapshot
  → Manual reconnect (fixed 2s delay)
  → Synthetic coin polling (1-2s interval)
```

---

## 2. CRITICAL — Harus Segera Diperbaiki

### 2.1 Tidak Ada API Service Layer

**Severity:** 🔴 CRITICAL
**Impact:** Maintainability, Consistency, Security
**File terdampak:** 10+ view files

#### Deskripsi

Semua komponen memanggil `fetch()` langsung dengan URL hardcode. File `lib/api.ts` sudah menyediakan Axios instance dengan interceptor, tapi hampir tidak dipakai (hanya `useR2Files.ts`).

#### Contoh Masalah

```typescript
// ❌ DashboardUser.vue — fetch langsung dengan URL hardcode
const res = await fetch('https://tech.oneled.io/api/dashboard', {
  headers: {
    Accept: 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
})

// ❌ FuturesCopy.vue — URL tanpa /api prefix
const res = await fetch('https://tech.oneled.io/api/copy-traders', { ... })

// ❌ SendUSDT.vue — URL inkonsisten
const res = await fetch('https://tech.oneled.io/api/withdraw', { ... })
```

#### File yang Terpengaruh

| File                   | Jumlah `fetch()` calls |
| ---------------------- | ---------------------- |
| `DashboardUser.vue`    | 5+                     |
| `NewMarketCoin.vue`    | 8+                     |
| `AssetsData.vue`       | 4+                     |
| `FuturesCopy.vue`      | 4+                     |
| `MarketAll.vue`        | 3+                     |
| `TransferUSDT.vue`     | 3+                     |
| `SendUSDT.vue`         | 3+                     |
| `AddFunds.vue`         | 2+                     |
| `OrderHistory.vue`     | 2+                     |
| `MainLayout.vue`       | 2+                     |
| `NotificationTransactions.vue` | 1+              |
| `router/index.ts`      | 1                      |

#### Solusi yang Direkomendasikan

```typescript
// lib/api.ts — Perbaiki dan gunakan Axios instance yang sudah ada
import axios from 'axios'

const base = import.meta.env.VITE_API_BASE_URL || 'https://tech.oneled.io'

export const api = axios.create({
  baseURL: `${base}/api`,
  withCredentials: true,
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login?reason=unauthorized'
    }
    return Promise.reject(err)
  }
)

// Typed endpoint functions
export const dashboardApi = {
  getDashboard: () => api.get('/dashboard'),
  getNews: (page: number) => api.get('/news', { params: { page } }),
}

export const tradeApi = {
  placeOrder: (data: OrderPayload) => api.post('/orders', data),
  getOrderHistory: () => api.get('/orders/history'),
}
// ... dst
```

---

### 2.2 `SYMBOL_META` Duplikat 3 Kali

**Severity:** 🔴 CRITICAL
**Impact:** Maintainability, DRY Principle
**Total duplikasi:** ~900 baris

#### Deskripsi

Object `SYMBOL_META` berisi metadata 80+ cryptocurrency (nama, logo URL, quote currency) diduplikasi secara identik di 3 file berbeda. Menambahkan koin baru memerlukan edit di ketiga file secara manual.

#### Lokasi Duplikasi

| File                | Baris dimulai | Jumlah entry |
| ------------------- | ------------- | ------------ |
| `MainLayout.vue`    | ~145          | 80+          |
| `AssetsData.vue`    | ~50           | 80+          |
| `NewMarketCoin.vue` | ~100          | 80+          |

#### Contoh Kode yang Terduplikasi

```typescript
// ❌ Muncul IDENTIK di 3 file
const SYMBOL_META: Record<string, { name: string; logoUrl: string; quote: Quote }> = {
  BTC: { name: 'Bitcoin', logoUrl: localLogo('btc'), quote: 'USDT' },
  ETH: { name: 'Ethereum', logoUrl: localLogo('eth'), quote: 'USDT' },
  BNB: { name: 'BNB (Binance Coin)', logoUrl: localLogo('bnb'), quote: 'USDT' },
  SOL: { name: 'Solana', logoUrl: localLogo('sol'), quote: 'USDT' },
  LTC: { name: 'Litecoin', logoUrl: localLogo('ltc'), quote: 'USDT' },
  // ... 75+ entry lainnya
}
```

#### Solusi yang Direkomendasikan

```typescript
// lib/constants/symbols.ts — SATU sumber kebenaran
export type Quote = 'USDT'

export function localLogo(symbol: string): string {
  return `/img/crypto/${symbol}.svg`
}

export interface SymbolMeta {
  name: string
  logoUrl: string
  quote: Quote
}

export const SYMBOL_META: Record<string, SymbolMeta> = {
  BTC: { name: 'Bitcoin', logoUrl: localLogo('btc'), quote: 'USDT' },
  ETH: { name: 'Ethereum', logoUrl: localLogo('eth'), quote: 'USDT' },
  // ... semua entry di sini saja
}

export const SYMBOL_LIST = Object.keys(SYMBOL_META)
```

Kemudian di setiap file cukup:
```typescript
import { SYMBOL_META } from '@/lib/constants/symbols'
```

---

### 2.3 God Component — `NewMarketCoin.vue` (2485 baris)

**Severity:** 🔴 CRITICAL
**Impact:** Maintainability, Testability, Performance
**File:** `views/NewMarketCoin.vue`

#### Deskripsi

File ini menangani **8+ tanggung jawab berbeda** dalam satu komponen monolith:

| # | Tanggung Jawab              | Estimasi Baris |
| - | --------------------------- | -------------- |
| 1 | Chart (candle/line/area)    | ~400           |
| 2 | Orderbook depth display     | ~300           |
| 3 | Trade form (buy/sell)       | ~350           |
| 4 | Asset list + realtime price | ~250           |
| 5 | Pair selector / dropdown    | ~200           |
| 6 | WebSocket management (2 WS) | ~300           |
| 7 | Synthetic coin polling      | ~200           |
| 8 | Huobi kline backfill        | ~150           |
| 9 | Number formatting           | ~50            |
| 10| Template + styling          | ~285           |

#### Masalah

- Tidak bisa di-test secara terpisah
- Perubahan kecil di orderbook bisa break chart
- 2 koneksi WebSocket dikelola bersamaan
- Sulit di-review dan di-debug
- Re-render menyeret seluruh 2485 baris

#### Solusi yang Direkomendasikan

Pecah menjadi:

```
views/
  NewMarketCoin.vue          → Container (~100 baris, orchestration saja)

components/trade/
  ChartPanel.vue             → TradingView chart component
  OrderBook.vue              → Orderbook buy/sell depth
  TradeForm.vue              → Buy/Sell form + validation
  AssetList.vue              → User assets sidebar
  PairSelector.vue           → Coin pair dropdown/search

composables/
  useAggregatorSocket.ts     → Shared WebSocket logic
  useOrderbook.ts            → Orderbook data management
  useTradeChart.ts           → Chart data + timeframe
```

---

### 2.4 WebSocket Logic Duplikat 4 Kali

**Severity:** 🔴 CRITICAL
**Impact:** Maintainability, DRY, Reliability
**Total duplikasi:** ~400+ baris

#### Deskripsi

Pola WebSocket yang **identik** (connect → subscribe → unsubscribe → snapshot → reconnect) disalin di 4 file berbeda. Setiap file mengelola WebSocket secara independen.

#### Kode yang Terduplikasi

```typescript
// ❌ Pola ini muncul IDENTIK di 4 file:
let ws: WebSocket | null = null
let reconnectTimer: number | null = null

function connectAggregator() {
  if (ws) ws.close()
  ws = new WebSocket('wss://ws.hyper-led.com')

  ws.onopen = () => {
    doSubscribe(currentSymbols)
    requestSnapshot(currentSymbols)
  }

  ws.onclose = () => {
    reconnectTimer = window.setTimeout(connectAggregator, 2000)
  }

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data)
    // ... handle kline/ticker/orderbook
  }
}

function doSubscribe(symbols: string[]) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'subscribe', symbols }))
  }
}

function doUnsubscribe(symbols: string[]) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'unsubscribe', symbols }))
  }
}

function requestSnapshot(symbols: string[]) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'snapshot', symbols }))
  }
}
```

#### Lokasi Duplikasi

| File                 | Fungsi terduplikasi                                                |
| -------------------- | ------------------------------------------------------------------ |
| `DashboardUser.vue`  | `connectAggregator`, `doSubscribe`, `doUnsubscribe`, `requestSnapshot` |
| `NewMarketCoin.vue`  | `connectAggregator`, `doSubscribe`, `doUnsubscribe`, `requestSnapshot` |
| `MarketAll.vue`      | `connectAggregator`, `doSubscribe`, `doUnsubscribe`, `requestSnapshot` |
| `AssetsData.vue`     | `connectAggregator`, `doSubscribe`, `doUnsubscribe`, `requestSnapshot` |

#### Solusi yang Direkomendasikan

```typescript
// composables/useAggregatorSocket.ts
import { ref, onMounted, onUnmounted } from 'vue'

interface AggregatorOptions {
  symbols: () => string[]
  onKline?: (data: KlineMsg) => void
  onTicker?: (data: TickerMsg) => void
  onOrderbook?: (data: OrderbookMsg) => void
  reconnectMs?: number
}

export function useAggregatorSocket(options: AggregatorOptions) {
  const connected = ref(false)
  let ws: WebSocket | null = null
  let reconnectTimer: number | null = null

  function connect() { /* ... satu implementasi ... */ }
  function subscribe(symbols: string[]) { /* ... */ }
  function unsubscribe(symbols: string[]) { /* ... */ }
  function snapshot(symbols: string[]) { /* ... */ }
  function disconnect() { /* ... */ }

  onMounted(connect)
  onUnmounted(disconnect)

  return { connected, subscribe, unsubscribe, snapshot, disconnect }
}
```

---

## 3. HIGH — Sangat Disarankan Diperbaiki

### 3.1 Synthetic Coin Management Duplikat 4 Kali

**Severity:** 🟠 HIGH
**Impact:** Maintainability, DRY
**Total duplikasi:** ~600 baris

#### Deskripsi

Logika pengelolaan "synthetic coin" (koin custom dari backend) diduplikasi di 4 file. Termasuk fungsi-fungsi berikut:

| Fungsi                          | Deskripsi                                        |
| ------------------------------- | ------------------------------------------------ |
| `loadSyntheticPairs()`          | Fetch daftar synthetic pair dari API             |
| `loadSyntheticLogoMap()`        | Fetch logo map dari API                          |
| `isSyntheticSymbol()`           | Cek apakah simbol adalah synthetic               |
| `isDeletedSyntheticSymbol()`    | Cek apakah simbol synthetic sudah dihapus        |
| `hydrateSyntheticEverFromStorage()` | Load synthetic list dari localStorage        |
| `persistSyntheticEverToStorage()`   | Simpan synthetic list ke localStorage        |

#### File Terdampak

- `DashboardUser.vue`
- `NewMarketCoin.vue`
- `MarketAll.vue`
- `AssetsData.vue`

#### Solusi

```typescript
// composables/useSyntheticMarket.ts
export function useSyntheticMarket() {
  // Semua logika synthetic di sini
  return {
    syntheticPairs,
    syntheticLogoMap,
    isSyntheticSymbol,
    isDeletedSyntheticSymbol,
    loadSyntheticPairs,
    loadSyntheticLogoMap,
  }
}
```

---

### 3.2 Auth Logic Tersebar di 30+ Lokasi

**Severity:** 🟠 HIGH
**Impact:** Security, Maintainability
**Total lokasi:** 30+ `localStorage.getItem('token')`

#### Deskripsi

Setiap komponen melakukan autentikasi secara mandiri:

```typescript
// ❌ Pattern ini tersebar di 30+ lokasi
const token = localStorage.getItem('token')
if (!token) {
  router.push('/login?reason=unauthorized')
  return
}
const res = await fetch(url, {
  headers: {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  },
})
if (res.status === 401) {
  localStorage.removeItem('token')
  router.push('/login?reason=unauthorized')
}
```

#### Masalah

- Token retrieval tanpa null-safety di beberapa tempat
- Redirect logic berbeda-beda antar komponen
- Tidak ada centralized logout
- Token expired handling tidak konsisten

#### Solusi

```typescript
// composables/useAuth.ts
import { computed } from 'vue'
import { useRouter } from 'vue-router'

export function useAuth() {
  const router = useRouter()

  const token = computed(() => localStorage.getItem('token'))
  const isAuthenticated = computed(() => !!token.value?.trim())

  function logout(reason?: string) {
    localStorage.removeItem('token')
    router.replace({ path: '/login', query: reason ? { reason } : {} })
  }

  function getAuthHeaders(): Record<string, string> {
    return token.value
      ? { Accept: 'application/json', Authorization: `Bearer ${token.value}` }
      : { Accept: 'application/json' }
  }

  return { token, isAuthenticated, logout, getAuthHeaders }
}
```

---

### 3.3 Token Validation Setiap Navigasi

**Severity:** 🟠 HIGH
**Impact:** Performance, UX (lambat navigasi)
**File:** `router/index.ts`

#### Deskripsi

Router guard memanggil `fetch('/api/auth-token')` pada **setiap perpindahan halaman**, termasuk navigasi antar tab (Dashboard → Market → Trade).

```typescript
// ❌ router/index.ts — setiap navigasi = 1 HTTP request
router.beforeEach(async (to, from, next) => {
  if (token) {
    try {
      const res = await fetch('https://tech.oneled.io/api/auth-token', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })
      const data = await res.json()
      if (data.message === 'Unauthenticated.') {
        localStorage.removeItem('token')
        return next('/login?reason=unauthorized')
      }
      // ...
    } catch { /* ... */ }
  }
})
```

#### Masalah

- Navigasi terasa lambat karena menunggu HTTP response (~100-500ms per navigasi)
- Server dibebani request validasi berulang
- Offline/slow network = navigasi gagal
- URL hardcode (`https://tech.oneled.io`)

#### Solusi

```typescript
// Cache token validity selama 5 menit
let lastValidation = 0
const VALIDATION_TTL = 5 * 60 * 1000 // 5 menit

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token')

  if (token && Date.now() - lastValidation > VALIDATION_TTL) {
    try {
      const res = await api.get('/auth-token')
      if (res.data.message === 'Unauthenticated.') {
        localStorage.removeItem('token')
        return next('/login?reason=unauthorized')
      }
      lastValidation = Date.now()
    } catch {
      // Allow navigation, don't block on network failure
    }
  }
  // ...
})
```

---

### 3.4 Hardcoded URL Inkonsisten

**Severity:** 🟠 HIGH
**Impact:** Deployment, Configuration
**File terdampak:** 10+ file

#### Deskripsi

URL API dan WebSocket di-hardcode secara inkonsisten di berbagai file:

| URL Pattern                          | Ditemukan di                                                   |
| ------------------------------------ | -------------------------------------------------------------- |
| `https://tech.oneled.io/api`         | DashboardUser, NewMarketCoin, AssetsData, MarketAll, OrderHistory |
| `https://tech.oneled.io`             | FuturesCopy, SendUSDT, AddFunds                                |
| `wss://ws.hyper-led.com`             | DashboardUser, NewMarketCoin, MarketAll, AssetsData             |
| `https://api.huobi.pro`              | NewMarketCoin                                                  |
| `import.meta.env.VITE_API_BASE`      | Hanya MainLayout (fallback hardcoded)                          |
| `import.meta.env.VITE_API_BASE_URL`  | Hanya lib/api.ts                                               |

#### Masalah

- Mengganti domain API memerlukan edit 10+ file
- Dua env variable berbeda (`VITE_API_BASE` vs `VITE_API_BASE_URL`)
- Environment switching (dev/staging/prod) rawan error

#### Solusi

```typescript
// lib/config.ts — Satu sumber konfigurasi
export const config = {
  apiBase: import.meta.env.VITE_API_BASE_URL || 'https://tech.oneled.io',
  wsUrl: import.meta.env.VITE_WS_URL || 'wss://ws.hyper-led.com',
  huobiApi: import.meta.env.VITE_HUOBI_API || 'https://api.huobi.pro',
} as const
```

---

### 3.5 Tidak Ada Error Handling / Retry

**Severity:** 🟠 HIGH
**Impact:** Reliability, UX
**File terdampak:** Semua file dengan API call

#### Deskripsi

Hampir semua fetch/WebSocket error di-catch dan diabaikan tanpa feedback ke user:

```typescript
// ❌ Empty catch — user tidak tahu terjadi error
try {
  const res = await fetch(url)
  // ...
} catch {
  // NOTHING — data tidak termuat, user bingung
}
```

WebSocket reconnect menggunakan fixed delay tanpa exponential backoff:

```typescript
// ❌ Fixed 2s reconnect — bisa spam server saat down
ws.onclose = () => {
  reconnectTimer = window.setTimeout(connectAggregator, 2000)
}
```

#### Solusi

```typescript
// Exponential backoff untuk WebSocket
function connectWithBackoff(attempt = 0) {
  const delay = Math.min(1000 * 2 ** attempt, 30000) // max 30s
  reconnectTimer = setTimeout(() => {
    connect()
    // onclose akan memanggil connectWithBackoff(attempt + 1)
  }, delay)
}

// Error handling dengan user feedback
try {
  const res = await api.get('/dashboard')
  // ...
} catch (err) {
  apiAlertStore.open('Error', 'Gagal memuat data. Silakan coba lagi.')
  console.error('Dashboard fetch failed:', err)
}
```

---

### 3.6 Polling Terlalu Agresif

**Severity:** 🟠 HIGH
**Impact:** Performance (client + server), Battery
**File terdampak:** DashboardUser, MarketAll, NewMarketCoin, AssetsData, useNotificationCounter, MainLayout

#### Deskripsi

Beberapa polling berjalan simultan dengan interval sangat pendek:

| Polling                     | Interval   | File                       |
| --------------------------- | ---------- | -------------------------- |
| Synthetic ticker            | 1–2 detik  | Dashboard, Market, Assets, Trade |
| Synthetic pair check        | 10 detik   | Dashboard, Assets          |
| Notification count          | 5 detik    | useNotificationCounter     |
| Support unread              | 15 detik   | MainLayout                 |
| Trader list + password      | 5 detik    | FuturesCopy                |
| Assets list                 | 30 detik   | NewMarketCoin              |
| WebSocket reconnect         | 2 detik    | 4 file                     |

#### Masalah

- Jika user berada di Dashboard, bisa ada 4+ interval berjalan bersamaan
- Polling tetap berjalan saat tab background (kecuali `useNotificationCounter`)
- Drain baterai di mobile
- Server bisa dibebani dari banyak client

#### Solusi

```typescript
// Gunakan visibility-aware polling
function usePolling(fn: () => Promise<void>, intervalMs: number) {
  let timer: number | null = null

  function start() {
    if (timer) return
    fn()
    timer = window.setInterval(() => {
      if (document.hidden) return // skip saat tab tidak aktif
      fn()
    }, intervalMs)
  }

  function stop() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  onMounted(start)
  onUnmounted(stop)

  // Pause/resume saat visibility change
  const onVisChange = () => document.hidden ? stop() : start()
  onMounted(() => document.addEventListener('visibilitychange', onVisChange))
  onUnmounted(() => document.removeEventListener('visibilitychange', onVisChange))
}
```

---

## 4. MEDIUM — Perlu Diperbaiki

### 4.1 Number Formatting Duplikat

**Severity:** 🟡 MEDIUM
**Impact:** Maintainability, DRY
**Total duplikasi:** ~30+ baris

#### Deskripsi

Fungsi formatting angka disalin di 3+ file:

```typescript
// ❌ Muncul di Dashboard, Assets, NewMarketCoin
function formatNumberId(n: number): string {
  return n.toLocaleString('id-ID')
}

function moneyId(n: number): string {
  return n.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function signedPercent(n: number): string {
  const s = n >= 0 ? '+' : ''
  return `${s}${n.toFixed(2)}%`
}

function signedMoneyId(n: number): string {
  const s = n >= 0 ? '+' : ''
  return `${s}${moneyId(n)}`
}
```

#### Solusi

```typescript
// lib/format.ts
export function formatNumberId(n: number): string {
  return n.toLocaleString('id-ID')
}

export function moneyId(n: number, decimals = 2): string {
  return n.toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function signedPercent(n: number): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
}

export function signedMoneyId(n: number): string {
  return `${n >= 0 ? '+' : ''}${moneyId(n)}`
}
```

---

### 4.2 localStorage Cache Pattern Duplikat

**Severity:** 🟡 MEDIUM
**Impact:** Maintainability, DRY
**Total duplikasi:** ~160 baris

#### Deskripsi

Setiap view menerapkan caching ke localStorage secara mandiri dengan pola yang mirip:

```typescript
// ❌ Pola ini muncul di 4 file dengan nama cache berbeda
const CACHE_KEY = 'dashCache'         // atau 'portfolioCache', 'cryptoSnapshot', 'obCache'
const CACHE_TTL = 5 * 60 * 1000       // 5 menit

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.ts > CACHE_TTL) return null
    return parsed.data
  } catch { return null }
}

function saveCache(data: any) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }))
}
```

#### Lokasi

| File                | Cache Key           |
| ------------------- | ------------------- |
| `DashboardUser.vue` | `dashCache`         |
| `AssetsData.vue`    | `portfolioCache`    |
| `MarketAll.vue`     | `cryptoSnapshot`    |
| `NewMarketCoin.vue` | `obCache`           |

#### Solusi

```typescript
// composables/useLocalCache.ts
export function useLocalCache<T>(key: string, ttlMs = 5 * 60 * 1000) {
  function load(): T | null {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return null
      const { ts, data } = JSON.parse(raw)
      return Date.now() - ts > ttlMs ? null : data
    } catch { return null }
  }

  function save(data: T) {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }))
  }

  function clear() {
    localStorage.removeItem(key)
  }

  return { load, save, clear }
}
```

---

### 4.3 `window.location.href` di MainLayout

**Severity:** 🟡 MEDIUM
**Impact:** Performance, UX
**File:** `layouts/MainLayout.vue`

#### Deskripsi

Fungsi `chooseCoin()` menggunakan `window.location.href` untuk navigasi, menyebabkan full page reload yang menghancurkan state SPA:

```typescript
// ❌ MainLayout.vue
function chooseCoin(symbol: string) {
  window.location.href = `/trade?pair=${symbol}USDT`
}
```

#### Solusi

```typescript
// ✅ Gunakan Vue Router
function chooseCoin(symbol: string) {
  router.push({ path: '/trade', query: { pair: `${symbol}USDT` } })
}
```

---

### 4.4 Pinia Sangat Underutilized

**Severity:** 🟡 MEDIUM
**Impact:** Architecture, Data Sharing
**File:** `stores/apiAlert.ts` (satu-satunya store)

#### Deskripsi

Pinia sudah terinstall dan di-setup, tapi hanya digunakan untuk 1 store (`apiAlert`). Tidak ada store untuk:

| Data                      | Status saat ini                              |
| ------------------------- | -------------------------------------------- |
| Auth state (token, user)  | `localStorage.getItem('token')` scattered    |
| Portfolio data            | Fetch ulang di setiap view                   |
| Market prices             | WebSocket per-view, tidak shared             |
| User profile              | Fetch ulang di setiap view yang butuh        |
| Synthetic coin config     | Load ulang + duplicate state di setiap view  |
| Notification count        | Composable tapi tidak shared antar komponen  |

#### Solusi

Buat minimal 3 Pinia store tambahan:

```typescript
// stores/auth.ts
export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'))
  const user = ref<User | null>(null)
  // ...
})

// stores/market.ts
export const useMarketStore = defineStore('market', () => {
  const prices = ref<Map<string, TickerData>>()
  const syntheticPairs = ref<SyntheticPair[]>([])
  // ...
})

// stores/portfolio.ts
export const usePortfolioStore = defineStore('portfolio', () => {
  const assets = ref<Asset[]>([])
  const totalBalance = ref(0)
  // ...
})
```

---

### 4.5 Route Tanpa `name`

**Severity:** 🟡 MEDIUM
**Impact:** Maintainability, Robustness
**File:** `router/index.ts`

#### Deskripsi

Semua 40+ route tidak memiliki properti `name`. Navigasi hanya bisa dilakukan via path string, yang fragile dan error-prone.

```typescript
// ❌ Saat ini
{ path: 'dashboard', component: () => import('@/views/DashboardUser.vue') }

// ❌ Navigasi fragile
router.push('/dashboard')
router.push('/login?reason=unauthorized')
```

#### Solusi

```typescript
// ✅ Tambahkan name
{ path: 'dashboard', name: 'dashboard', component: () => import('@/views/DashboardUser.vue') }

// ✅ Navigasi yang aman
router.push({ name: 'dashboard' })
router.push({ name: 'login', query: { reason: 'unauthorized' } })
```

---

### 4.6 Duplikat Route `account`

**Severity:** 🟡 MEDIUM
**Impact:** Bug Potential
**File:** `router/index.ts`

#### Deskripsi

Path `/account` didefinisikan 2 kali dengan komponen berbeda:

```typescript
// ❌ Line ~51 (pertama)
{ path: 'account', component: () => import('@/views/NewAccountMenu.vue') }

// ❌ Line ~118 (kedua — override yang pertama)
{ path: 'account', component: () => import('@/views/DashboardUser.vue') }
```

Vue Router akan menggunakan route yang pertama cocok, route kedua tidak akan pernah tercapai (dead code) atau bisa menyebabkan perilaku tidak terduga.

#### Solusi

Hapus salah satu duplikat dan pastikan logika routing sesuai kebutuhan.

---

### 4.7 Anti-Inspect / Device Gate di App.vue

**Severity:** 🟡 MEDIUM
**Impact:** Code Quality, Separation of Concerns
**File:** `App.vue`

#### Deskripsi

Root component `App.vue` (175 baris) berisi ~100 baris logika yang tidak berhubungan dengan routing:

1. **Device gate** — Memblokir akses desktop dengan `isMobileLike()` check + resize listener
2. **Anti-inspect** — Mencegah right-click, F12, Ctrl+U, Ctrl+Shift+I
3. **Meta fetch** — Fetch metadata website dari API

#### Masalah

- Root component terlalu fat
- Anti-inspect mudah di-bypass dan bukan security measure yang efektif
- Device gate bisa menyebabkan masalah saat development/testing

#### Solusi

```typescript
// Pindahkan ke plugin/middleware terpisah
// plugins/deviceGate.ts
export function setupDeviceGate(app: App) { /* ... */ }

// plugins/antiInspect.ts
export function setupAntiInspect() { /* ... */ }

// main.ts
import { setupDeviceGate } from './plugins/deviceGate'
import { setupAntiInspect } from './plugins/antiInspect'

setupAntiInspect()
// App.vue cukup <RouterView /> saja
```

---

## 5. LOW — Nice to Have

### 5.1 TypeScript Tidak Strict

**Severity:** 🔵 LOW
**Impact:** Type Safety, Bug Prevention

#### Deskripsi

Codebase menggunakan TypeScript tapi tidak memanfaatkannya secara penuh:

```typescript
// ❌ Banyak `as any` cast
const h = (window as any).__antiInspect
const json = (await res.json().catch(() => null)) as null | { data?: Array<{ unread?: number }> }

// ❌ Untyped API response
const data = await res.json()
// data bisa apa saja — tidak ada validasi

// ❌ Empty catch tanpa type
} catch {
  // silent — tidak tahu error apa yang terjadi
}
```

#### Solusi

- Aktifkan `strict: true` di `tsconfig.json`
- Buat interface untuk semua API response
- Gunakan library seperti `zod` untuk runtime type validation
- Ganti `catch {}` dengan `catch (err: unknown)` + proper handling

---

### 5.2 Bahasa Campuran di Kode

**Severity:** 🔵 LOW
**Impact:** Readability, Consistency

#### Deskripsi

Komentar dan error message menggunakan campuran Bahasa Indonesia dan Inggris tanpa konsistensi:

```typescript
// ❌ Campuran bahasa
const publicPages = [/* ... */] // Halaman publik
// Cek jika route public
// Jika ada token, cek ke backend
// Jika token tidak valid (session expired)
throw new Error('Gagal mengambil meta')
// simpan refs ke window untuk cleanup
```

#### Solusi

Pilih satu bahasa untuk kode (disarankan Inggris) dan gunakan secara konsisten. Bahasa Indonesia bisa dipakai di UI strings / i18n files.

---

### 5.3 Tidak Ada Unit Test

**Severity:** 🔵 LOW
**Impact:** Quality Assurance, Regression Prevention

#### Deskripsi

Tidak ada test file yang ditemukan di folder frontend. Composables dan utility functions ideal untuk unit testing.

#### Solusi

```bash
npm install -D vitest @vue/test-utils jsdom
```

Prioritas testing:

1. Composables (`useAuth`, `useAggregatorSocket`, `useSyntheticMarket`)
2. Utility functions (`lib/format.ts`, `lib/config.ts`)
3. Komponen kecil (forms, modals)
4. Store (Pinia stores)

---

### 5.4 `DashboardUser.vue` Terlalu Besar

**Severity:** 🔵 LOW
**Impact:** Maintainability
**File:** `views/DashboardUser.vue` — 1382 baris

#### Deskripsi

Dashboard menangani terlalu banyak tanggung jawab:

| Tanggung Jawab                | Estimasi Baris |
| ----------------------------- | -------------- |
| Portfolio summary + PnL       | ~200           |
| Market ticker table + WS      | ~300           |
| News feed                     | ~100           |
| Synthetic coin polling        | ~200           |
| A2HS install prompt           | ~50            |
| Terms & conditions modal      | ~100           |
| localStorage cache            | ~80            |
| Number formatters             | ~50            |
| Template                      | ~300           |

#### Solusi

Pecah menjadi sub-komponen:

```
components/dashboard/
  PortfolioSummary.vue
  MarketTicker.vue
  NewsFeed.vue
  TermsModal.vue
```

---

## 6. Ringkasan Total Duplikasi

| Elemen yang Diduplikasi                   | File Terdampak | Estimasi Baris Duplikat |
| ----------------------------------------- | -------------- | ----------------------- |
| `SYMBOL_META` (80+ crypto entries)        | 3 file         | ~900 baris              |
| Hardcoded crypto list / `defaultPairs`    | 2 file         | ~160 baris              |
| WebSocket connect/subscribe/unsubscribe   | 4 file         | ~400 baris              |
| Synthetic coin management                 | 4 file         | ~600 baris              |
| Number formatters                         | 3 file         | ~30 baris               |
| `splitSymbol()` function                  | 2 file         | ~12 baris               |
| `isBrowser()` utility                     | 4 file         | ~4 baris                |
| localStorage cache (load/save/TTL)        | 4 file         | ~160 baris              |
| Token check boilerplate                   | 10+ file       | ~50+ baris              |
| Terms modal with scroll-to-read           | 2 file         | ~120 baris              |
| `recomputeTotals()` + RAF guard           | 2 file         | ~30 baris               |
| Alert pattern (local open/close/timer)    | 2 file         | ~40 baris               |
| **TOTAL ESTIMASI DUPLIKASI**              |                | **~2.500+ baris**       |

---

## 7. Rekomendasi Prioritas Refactor

Urutan pengerjaan berdasarkan **impact tertinggi** dan **effort terendah** lebih dulu:

### Phase 1 — Extract Shared Code (1–2 hari)

| # | Task                                                  | Effort | Impact     |
|---|-------------------------------------------------------|--------|------------|
| 1 | Buat `lib/constants/symbols.ts` → hapus 3 duplikat `SYMBOL_META` | Rendah | Tinggi |
| 2 | Buat `lib/format.ts` → pindahkan semua number formatter | Rendah | Sedang |
| 3 | Buat `lib/config.ts` → centralize semua URL/config   | Rendah | Tinggi     |
| 4 | Buat `composables/useLocalCache.ts`                   | Rendah | Sedang     |

### Phase 2 — Centralize Infrastructure (2–3 hari)

| # | Task                                                  | Effort  | Impact     |
|---|-------------------------------------------------------|---------|------------|
| 5 | Buat `composables/useAuth.ts` → replace 30+ token checks | Sedang | Tinggi |
| 6 | Migrasi semua `fetch()` ke `lib/api.ts` (Axios)      | Sedang  | Tinggi     |
| 7 | Buat `composables/useAggregatorSocket.ts`             | Sedang  | Tinggi     |
| 8 | Buat `composables/useSyntheticMarket.ts`              | Sedang  | Tinggi     |

### Phase 3 — Tambah Pinia Stores (1–2 hari)

| # | Task                                          | Effort | Impact  |
|---|-----------------------------------------------|--------|---------|
| 9 | Buat `stores/auth.ts`                         | Sedang | Tinggi  |
| 10| Buat `stores/market.ts`                       | Sedang | Sedang  |
| 11| Buat `stores/portfolio.ts`                    | Sedang | Sedang  |

### Phase 4 — Pecah God Components (3–5 hari)

| # | Task                                                      | Effort | Impact  |
|---|-----------------------------------------------------------|--------|---------|
| 12| Pecah `NewMarketCoin.vue` → 5–6 komponen                 | Tinggi | Tinggi  |
| 13| Pecah `DashboardUser.vue` → 4 sub-komponen               | Sedang | Sedang  |
| 14| Tambahkan `name` ke semua route + hapus duplikat route    | Rendah | Rendah  |

### Phase 5 — Polish (1–2 hari)

| # | Task                                                     | Effort | Impact  |
|---|----------------------------------------------------------|--------|---------|
| 15| Tambahkan exponential backoff ke WebSocket reconnect     | Rendah | Sedang  |
| 16| Kurangi polling frequency + visibility-aware polling     | Rendah | Sedang  |
| 17| Cache token validation di router guard                   | Rendah | Sedang  |
| 18| Pindahkan device gate & anti-inspect ke plugin terpisah  | Rendah | Rendah  |
| 19| Setup Vitest + test composables                          | Sedang | Rendah  |
| 20| Konsistenkan bahasa di komentar/error                    | Rendah | Rendah  |

---

**Estimasi total effort: 8–14 hari kerja** (1 developer)
**Estimasi pengurangan duplikasi: ~2.500 baris**
**Estimasi pengurangan total LOC: ~20-30%** (setelah refactor + deduplicate)
