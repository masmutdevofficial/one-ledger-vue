<template>
  <div class="flex flex-col min-h-screen px-4 pt-1">
    <!-- Header -->
    <header class="flex items-center mb-6">
      <button aria-label="Back" class="text-black text-lg" @click="router.back()">
        <Icon icon="tabler:arrow-left" class="w-5 h-5" />
      </button>
      <h1 class="flex-1 text-center text-base font-semibold">Deposit {{ selectedCoin.sym }}</h1>
      <div class="w-6"></div>
    </header>

    <!-- Asset Dropdown -->
    <div class="mb-4 w-25 mx-auto">
      <label class="sr-only">Select Asset</label>
      <div class="relative">
        <select v-model="selected" class="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2
             text-sm font-medium text-gray-700 text-center [text-align-last:center]
             pr-10 [&>option]:text-center">
          <option v-for="c in coins" :key="c.slug" :value="c.slug">
            {{ c.sym }}
          </option>
        </select>

        <Icon icon="tabler:chevron-down"
          class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
    </div>


    <!-- Main Content -->
    <main class="flex-grow">
      <!-- QR Code -->
      <div class="flex justify-center mb-6">
        <img :src="current.qr" :alt="`QR ${selectedCoin.sym}`" class="w-36 h-36 rounded-lg object-cover" width="150"
          height="150" />
      </div>

      <!-- Deposit Info -->
      <section aria-label="Deposit address details" class="border border-gray-200 rounded-xl p-4 mb-6 max-w-md mx-auto">
        <div class="mb-4">
          <p class="text-gray-400 text-xs mb-1">Network</p>
          <p class="text-black text-sm font-semibold">{{ meta[selected].network }}</p>
        </div>
        <hr class="border-gray-200 mb-4" />

        <!-- Deposit Address -->
        <div class="flex items-center justify-between">
          <div class="max-w-[70%]">
            <p class="text-gray-400 text-xs mb-1">Deposit Address</p>
            <p aria-label="Deposit address" class="text-black text-sm font-semibold break-all">
              {{ current.wallet }}
            </p>
          </div>
          <button aria-label="Copy deposit address" @click="copyToClipboard"
            class="text-gray-400 hover:text-gray-600 ml-2" type="button">
            <Icon icon="tabler:copy" class="w-5 h-5" />
          </button>
        </div>
      </section>

      <!-- Info Notes -->
      <section class="max-w-md mx-auto text-xs text-gray-600 space-y-1 mb-10">
        <div class="flex justify-between">
          <span>Minimum deposit</span>
          <span class="font-semibold">{{ meta[selected].min }}</span>
        </div>
        <div class="flex justify-between">
          <span>Credited (Trading enabled)</span>
          <span class="font-semibold">1 Confirmation</span>
        </div>
        <div class="flex justify-between">
          <span>Unlocked (Withdrawal enabled)</span>
          <span class="font-semibold">1 Confirmation</span>
        </div>
        <p class="text-gray-400 leading-tight">* Do not transact with Sanctioned Entities.</p>
        <p class="text-gray-400 leading-tight">* Don't send NFTs to this address.</p>
      </section>
    </main>

    <!-- Footer -->
    <footer class="w-full mb-20">
      <button type="button" @click="copyToClipboard"
        class="w-full bg-teal-400 active:bg-teal-500 text-white text-lg py-3 rounded-lg font-light transition-colors">
        Save and Share Address
      </button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useApiAlertStore } from '@/stores/apiAlert'

type CoinSlug =
  | 'usdt'
  | 'btc'
  | 'eth'
  | 'bnb'
  | 'sol'
  | 'ada'
  | 'avax'
  | 'trx'
  | 'xrp'
  | 'ltc'
  | 'doge'
  | 'algo'
  | 'sui'

type DepositApiResponse = Record<string, string | null> // fleksibel: usdt_wallet, usdt_qr, dst

interface AssetData {
  wallet: string
  qr: string
}
interface CoinItem {
  sym: string
  slug: CoinSlug
}

const API_BASE = 'https://abc.oneled.io'
const router = useRouter()
const modal = useApiAlertStore()

// Daftar koin: 3 utama + tambahan
const coins: CoinItem[] = [
  { sym: 'USDT', slug: 'usdt' },
  { sym: 'BTC', slug: 'btc' },
  { sym: 'ETH', slug: 'eth' },
  { sym: 'BNB', slug: 'bnb' },
  { sym: 'SOL', slug: 'sol' },
  { sym: 'ADA', slug: 'ada' },
  { sym: 'AVAX', slug: 'avax' },
  { sym: 'TRX', slug: 'trx' },
  { sym: 'XRP', slug: 'xrp' },
  { sym: 'LTC', slug: 'ltc' },
  { sym: 'DOGE', slug: 'doge' },
  { sym: 'ALGO', slug: 'algo' },
  { sym: 'SUI', slug: 'sui' },
]

// pilihan aktif = slug (lowercase)
const selected = ref<CoinSlug>('usdt')
const selectedCoin = computed(() => coins.find((c) => c.slug === selected.value) || coins[0])

// Metainfo (network & min) per coin slug (isi sesuai kebutuhanmu)
const meta: Record<CoinSlug, { network: string; min: string }> = {
  usdt: { network: 'Tron (TRC20)', min: '100 USDT' },
  btc: { network: 'Bitcoin Mainnet', min: '0.002 BTC' },
  eth: { network: 'Ethereum (ERC20)', min: '0.05 ETH' },

  bnb: { network: 'BSC (BEP20)', min: '0.20 BNB' },
  sol: { network: 'Solana', min: '2 SOL' },
  ada: { network: 'Cardano', min: '150 ADA' },
  avax: { network: 'Avalanche C-Chain', min: '2 AVAX' },
  trx: { network: 'Tron', min: '1000 TRX' },
  xrp: { network: 'XRP Ledger', min: '150 XRP' },
  ltc: { network: 'Litecoin', min: '0.50 LTC' },
  doge: { network: 'Dogecoin', min: '800 DOGE' },
  algo: { network: 'Algorand', min: '500 ALGO' },
  sui: { network: 'Sui Network', min: '50 SUI' },
}

// Placeholder default (bisa kamu ganti kapan-kapan)
const DUMMY_QR = 'https://dummyimage.com/300x300/eeeeee/222222.png'
const DEFAULT_WALLET_TRON = 'TRksMjUu2g4HSRo4Qaay8p71pzo8u5CVdy' // ganti jika perlu

const DEFAULTS: Record<CoinSlug, AssetData> = {
  usdt: { wallet: DEFAULT_WALLET_TRON, qr: DUMMY_QR },
  btc: { wallet: DEFAULT_WALLET_TRON, qr: DUMMY_QR },
  eth: { wallet: DEFAULT_WALLET_TRON, qr: DUMMY_QR },
  bnb: { wallet: DEFAULT_WALLET_TRON, qr: DUMMY_QR },
  sol: { wallet: DEFAULT_WALLET_TRON, qr: DUMMY_QR },
  ada: { wallet: DEFAULT_WALLET_TRON, qr: DUMMY_QR },
  avax: { wallet: DEFAULT_WALLET_TRON, qr: DUMMY_QR },
  trx: { wallet: DEFAULT_WALLET_TRON, qr: DUMMY_QR },
  xrp: { wallet: DEFAULT_WALLET_TRON, qr: DUMMY_QR },
  ltc: { wallet: DEFAULT_WALLET_TRON, qr: DUMMY_QR },
  doge: { wallet: DEFAULT_WALLET_TRON, qr: DUMMY_QR },
  algo: { wallet: DEFAULT_WALLET_TRON, qr: DUMMY_QR },
  sui: { wallet: DEFAULT_WALLET_TRON, qr: DUMMY_QR },
}

const data = ref<Record<CoinSlug, AssetData>>(
  Object.fromEntries(
    coins.map((c) => [c.slug, DEFAULTS[c.slug] ?? { wallet: '-', qr: DUMMY_QR }]),
  ) as Record<CoinSlug, AssetData>,
)

const buildFileUrl = (maybePath: string | null): string | null => {
  if (!maybePath) return null
  if (/^https?:\/\//i.test(maybePath)) return maybePath
  return `${API_BASE}/storage/${maybePath.replace(/^\/+/, '')}`
}

// Normalisasi respons API ke map slug -> {wallet,qr}
const normalize = (api: DepositApiResponse): Record<CoinSlug, AssetData> => {
  const out = {} as Record<CoinSlug, AssetData>
  for (const c of coins) {
    const w = (api[`${c.slug}_wallet`] as string | null) || ''
    const q = (api[`${c.slug}_qr`] as string | null) || ''
    const wallet = w.trim().length ? w : (DEFAULTS[c.slug]?.wallet ?? '-')
    const qr = buildFileUrl(q) ?? DEFAULTS[c.slug]?.qr ?? DUMMY_QR
    out[c.slug] = { wallet, qr }
  }
  return out
}

const current = computed<AssetData>(() => data.value[selected.value])

onMounted(async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    modal.open('Unauthorized', 'Token tidak ditemukan.')
    return
  }
  try {
    const res = await fetch(`${API_BASE}/api/web-deposit`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Gagal ambil data')
    const json = (await res.json()) as DepositApiResponse
    data.value = normalize(json)
  } catch (e) {
    modal.open('Gagal', 'Gagal memuat data deposit. Pakai data default.')
  }
})

const copyToClipboard = async (): Promise<void> => {
  try {
    await navigator.clipboard.writeText(current.value.wallet)
    modal.open('Copied!', 'Deposit address copied to clipboard.')
  } catch {
    modal.open('Failed', 'Copy to clipboard failed.')
  }
}
</script>
