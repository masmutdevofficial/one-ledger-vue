<template>
  <div class="flex flex-col min-h-screen px-4 pt-1">
    <!-- Header -->
    <header class="flex items-center mb-6">
      <button aria-label="Back" class="text-black text-lg" @click="router.back()">
        <Icon icon="tabler:arrow-left" class="w-5 h-5" />
      </button>
      <h1 class="flex-1 text-center text-base font-semibold">Deposit {{ selected }}</h1>
      <div class="w-6"></div>
    </header>

    <!-- Asset Switcher -->
    <nav class="grid grid-cols-3 gap-2 mb-4 max-w-md mx-auto">
      <button v-for="sym in symbols" :key="sym" type="button" class="py-2 rounded-lg border text-sm font-medium w-16"
        :class="sym === selected ? 'bg-teal-500 text-white' : 'bg-gray-100 border-gray-200 text-gray-600'"
        @click="selected = sym">
        {{ sym }}
      </button>
    </nav>

    <!-- Main Content -->
    <main class="flex-grow">
      <!-- QR Code -->
      <div class="flex justify-center mb-6">
        <img :src="current.qr" :alt="`QR ${selected}`" class="w-36 h-36 rounded-lg object-cover" width="150"
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

type AssetSymbol = 'USDT' | 'BTC' | 'ETH'

interface DepositApiResponse {
  usdt_wallet: string | null
  usdt_qr: string | null
  btc_wallet: string | null
  btc_qr: string | null
  eth_wallet: string | null
  eth_qr: string | null
}

interface AssetData {
  wallet: string
  qr: string
}

const API_BASE = 'https://one-ledger.masmutpanel.my.id'
const router = useRouter()
const modal = useApiAlertStore()

const symbols: AssetSymbol[] = ['USDT', 'BTC', 'ETH']
const selected = ref<AssetSymbol>('USDT')

const defaultData: Record<AssetSymbol, AssetData> = {
  USDT: {
    wallet: 'TRksMjUu2g4HSRo4Qaay8p71pzo8u5CVdy',
    qr: 'https://storage.googleapis.com/a1aa/image/53ffc1bc-cd09-4f53-8a7a-f59ba342a5f9.jpg',
  },
  BTC: {
    wallet: 'bc1qqexampleexampleexampleexampleexample0',
    qr: 'https://dummyimage.com/300x300/eeeeee/222222.png&text=BTC+QR',
  },
  ETH: {
    wallet: '0x2F1F4d6e7f8A9b102c6fE0D5d5a0C1b2C3d4E5F6',
    qr: 'https://dummyimage.com/300x300/eeeeee/222222.png&text=ETH+QR',
  },
}

const meta: Record<AssetSymbol, { network: string; min: string }> = {
  USDT: { network: 'Tron (TRC20)', min: '100 USDT' },
  BTC: { network: 'Bitcoin Mainnet', min: '0.002 BTC' },
  ETH: { network: 'Ethereum (ERC20)', min: '0.05 ETH' },
}

const data = ref<Record<AssetSymbol, AssetData>>({ ...defaultData })

const buildFileUrl = (maybePath: string | null): string | null => {
  if (!maybePath) return null
  if (maybePath.startsWith('http://') || maybePath.startsWith('https://')) return maybePath
  return `${API_BASE}/storage/${maybePath.replace(/^\/+/, '')}`
}

const normalize = (api: DepositApiResponse): Record<AssetSymbol, AssetData> => {
  // Ambil dari API jika ada (non-null & non-empty), kalau tidak pakai default
  const fromApi = {
    USDT: {
      wallet: api.usdt_wallet && api.usdt_wallet.trim().length > 0 ? api.usdt_wallet : null,
      qr: buildFileUrl(api.usdt_qr),
    },
    BTC: {
      wallet: api.btc_wallet && api.btc_wallet.trim().length > 0 ? api.btc_wallet : null,
      qr: buildFileUrl(api.btc_qr),
    },
    ETH: {
      wallet: api.eth_wallet && api.eth_wallet.trim().length > 0 ? api.eth_wallet : null,
      qr: buildFileUrl(api.eth_qr),
    },
  } as Record<AssetSymbol, { wallet: string | null; qr: string | null }>

  return {
    USDT: {
      wallet: fromApi.USDT.wallet ?? defaultData.USDT.wallet,
      qr: fromApi.USDT.qr ?? defaultData.USDT.qr,
    },
    BTC: {
      wallet: fromApi.BTC.wallet ?? defaultData.BTC.wallet,
      qr: fromApi.BTC.qr ?? defaultData.BTC.qr,
    },
    ETH: {
      wallet: fromApi.ETH.wallet ?? defaultData.ETH.wallet,
      qr: fromApi.ETH.qr ?? defaultData.ETH.qr,
    },
  }
}

const current = computed<AssetData>(() => data.value[selected.value])

onMounted(async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    modal.open('Unauthorized', 'Token tidak ditemukan.')
    data.value = { ...defaultData }
    return
  }

  try {
    const res = await fetch(`${API_BASE}/api/web-deposit`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    if (!res.ok) throw new Error('Gagal ambil data')
    const json = (await res.json()) as DepositApiResponse
    data.value = normalize(json)
  } catch (e) {
    data.value = { ...defaultData }
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
