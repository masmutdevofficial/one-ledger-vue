<template>
  <div>
    <!-- Section: Total Value Summary -->
    <section class="bg-white mb-6 px-4 mt-5">
      <!-- Header -->
      <div class="flex items-center space-x-1 text-gray-700 text-sm font-normal mb-1">
        <span>Est. Total Value</span>
        <!-- Icon 👁️ ganti tabler:eye -->
        <Icon icon="tabler:eye" class="w-4 h-4" />
      </div>

      <!-- Total Value -->
      <div class="flex items-baseline space-x-1 font-semibold text-3xl text-black mb-1">
        <span>{{
          saldo !== null ? saldo.toLocaleString('id-ID', { minimumFractionDigits: 2 }) : '...'
        }}</span>
        <span class="text-base font-normal">USDT</span>
        <!-- Icon ▼ ganti tabler:chevron-down -->
        <Icon icon="tabler:chevron-down" class="text-base w-4 h-4" />
      </div>

      <!-- USD Equivalent -->
      <div class="text-gray-400 text-sm mb-2">
        ≈ ${{
          saldo !== null ? saldo.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '...'
        }}
      </div>

      <!-- PNL -->
      <div class="text-xs flex items-center text-black mb-4">
        Today's PNL
        <span class="text-[#3ABBA3] font-semibold"> +0,00938701 USDT (+0,84%) </span>
        <!-- Icon ➡️ ganti tabler:chevron-right -->
        <Icon icon="tabler:chevron-right" class="ml-1 text-gray-400 w-4 h-4" />
      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-3">
        <RouterLink
          to="/add-funds"
          class="bg-teal-400 active:bg-teal-500 text-white rounded-md px-6 py-2 text-base font-normal transition-colors"
        >
          Add Funds
        </RouterLink>
        <RouterLink
          to="/send"
          class="bg-[#E6E6E6] text-black rounded-md px-6 py-2 text-base font-semibold"
        >
          Send
        </RouterLink>
        <RouterLink
          to="/transfer"
          class="bg-[#E6E6E6] text-black rounded-md px-6 py-2 text-base font-semibold"
        >
          Transfer
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
          <button>Futures</button>
        </div>

        <!-- Table Header -->
        <div class="grid grid-cols-[1fr_1fr_1fr] text-[12px] text-[#9ca3af] font-normal">
          <div>Name</div>
          <div class="text-right">Last Price</div>
          <div class="text-right">24h chg%</div>
        </div>

        <!-- Tampilkan loading jika belum siap -->
        <div
          v-if="!isMarketReady"
          class="flex flex-col items-center justify-center py-8 text-gray-500"
        >
          <!-- Spinner -->
          <div
            class="w-6 h-6 mb-2 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"
          ></div>
          <div>Loading market data...</div>
        </div>

        <!-- Table Rows -->
        <div v-else class="space-y-4">
          <div
            class="grid grid-cols-[1fr_1fr_1fr] items-center"
            v-for="item in filteredMarketData"
            :key="item.name"
          >
            <div class="flex items-center space-x-1 font-semibold text-[14px] text-black">
              <span>{{ item.name }}</span>
              <img
                v-if="item.icon"
                :src="item.icon"
                :alt="item.name + ' icon'"
                class="w-3.5 h-3.5"
                width="14"
                height="14"
              />
            </div>
            <div class="text-right">
              <div class="font-bold text-[16px] leading-none">
                {{ item.price }}
              </div>
              <div class="text-[12px] text-[#9ca3af] mt-0.5">${{ item.price }}</div>
            </div>
            <div>
              <button
                :class="[
                  'text-white text-[12px] font-semibold rounded-md px-3 py-1 ml-auto block',
                  item.change > 0
                    ? 'bg-green-500'
                    : item.change < 0
                      ? 'bg-red-500'
                      : 'bg-slate-500',
                ]"
              >
                {{ item.change > 0 ? '+' : item.change < 0 ? '-' : ''
                }}{{ Math.abs(item.change).toFixed(2) }}%
              </button>
            </div>
          </div>
        </div>

        <!-- View More -->
        <RouterLink
          to="/market"
          class="block text-center text-[12px] text-[#9ca3af] font-normal cursor-pointer select-none hover:underline"
        >
          View more
        </RouterLink>
      </div>
    </section>

    <section class="w-full bg-[#f0f7fc] rounded-2xl p-5 pt-0 mt-0 drop-shadow-md pb-20 space-y-4">
      <div v-if="loading" class="text-center text-sm text-gray-500 py-10">Loading...</div>

      <div v-else-if="newsList.length === 0" class="text-center text-sm text-gray-500 py-10">
        No Data Available
      </div>

      <div
        v-else
        v-for="(news, index) in newsList"
        :key="index"
        class="bg-white rounded-2xl p-5 flex flex-col space-y-3 hover:bg-gray-50 transition-colors duration-150"
      >
        <!-- Header -->
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-1 text-gray-900 font-semibold text-sm">
            <span class="text-[10px] leading-none">•</span>
            <span>{{ news.date }}</span>
          </div>
          <div class="font-extrabold text-sm text-black">News</div>
        </div>

        <!-- Time -->
        <div class="text-gray-400 text-xs font-normal select-none">
          {{ news.time }}
        </div>

        <!-- Content -->
        <div class="flex items-start space-x-4">
          <img
            :src="`http://127.0.0.1:8000${news.image}`"
            alt="News Image"
            class="w-24 h-16 object-cover rounded-lg"
          />
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
          <RouterLink
            :to="`/news/${news.slug}`"
            class="text-[#3ABBA3] text-xs font-semibold hover:underline"
          >
            Read more
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useApiAlertStore } from '@/stores/apiAlert'
import SliderDashboard from '@/components/dashboard/SliderDashboard.vue'
import { ref, onMounted, computed } from 'vue'
import { useCoinWebSocket } from '@/composables/useCoinWebSocket'
import { watch } from 'vue'
import { Icon } from '@iconify/vue'

interface MarketItem {
  name: string
  price: number
  change: number
  icon?: string
}

interface SaldoResponse {
  status: string
  saldo: number
  komisi: number
}

const saldo = ref<number | null>(null)
const komisi = ref<number | null>(null)

onMounted(async () => {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('https://ledger.masmutdev.id/api/saldo', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })

    const data: SaldoResponse = await res.json()

    if (res.ok && data.status === 'success') {
      saldo.value = data.saldo
      komisi.value = data.komisi
    } else {
      console.error('Gagal ambil saldo:', data)
    }
  } catch (err) {
    console.error('Fetch error:', err)
  }
})

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

const truncate = (text: string, limit: number): string =>
  text.length > limit ? text.substring(0, limit) + '...' : text

onMounted(async () => {
  const token = localStorage.getItem('token')

  if (!token) {
    modal.open('Unauthorized', 'Token tidak ditemukan.')
    return
  }

  try {
    const res = await fetch('https://ledger.masmutdev.id/api/news', {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await res.json()

    if (!res.ok) {
      modal.open('Error', data.message || 'Gagal memuat berita.')
      return
    }

    if (data.status === 'success') {
      newsList.value = (data.data as ApiNewsItem[]).map((item) => {
        const published = new Date(item.published_at)
        const date = published.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        })
        const time = published.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })

        return {
          ...item,
          date,
          time,
        }
      })
    }
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : JSON.stringify(e)
    modal.open('Error', `Gagal terhubung ke server. ${errorMessage}`)
  } finally {
    loading.value = false
  }
})

// Daftar koin yang mau ditampilkan
const displayedCoins = ['BNB', 'BTC', 'ETH', 'SOL', 'XRP']
const isMarketReady = ref(false)
const expectedCount = displayedCoins.length

// Buat marketData sebagai array
const marketData = ref<MarketItem[]>([])

// Loop untuk tiap koin, konekkan WebSocket masing-masing
displayedCoins.forEach((coin) => {
  // Pairnya harus usdt, dan lowercase (ex: btcusdt/1min)
  const { marketData: singleMarket } = useCoinWebSocket(`${coin.toLowerCase()}usdt`, '1day')

  // Watch perubahan dan update marketData utama
  watch(singleMarket, (val) => {
    if (!val) return

    const idx = marketData.value.findIndex((item) => item.name === coin)
    if (idx >= 0) {
      marketData.value[idx] = val
    } else {
      marketData.value.push(val)
    }

    // Cek apakah semua coin sudah ada
    if (marketData.value.length === expectedCount && !isMarketReady.value) {
      isMarketReady.value = true
    }
  })
})

// Market data yang sudah difilter dan urut sesuai displayedCoins
const filteredMarketData = computed(
  () =>
    displayedCoins
      .map((coin) => marketData.value.find((item) => item.name === coin))
      .filter(Boolean) as MarketItem[],
)
</script>

<style scoped>
/* Tambahan gaya jika perlu */
</style>
