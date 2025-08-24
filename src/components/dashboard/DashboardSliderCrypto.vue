<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import SplineAreaChart from '@/components/landing/SplineAreaChart.vue'

interface CryptoItem {
  symbol: string
  price: string
  growth: string
  icon: string
  bg: string
  chart: number[]
  labels: string[]
}

const items = ref<CryptoItem[]>([
  {
    symbol: 'BTC',
    price: '$109,465.86',
    growth: '+76.04%',
    icon: '/crypto/btc.svg',
    bg: 'bg-yellow-400',
    chart: [100, 120, 115, 130, 160, 140, 180, 190, 200, 210, 220, 230],
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
  {
    symbol: 'ETH',
    price: '$4,865.22',
    growth: '+45.21%',
    icon: '/crypto/eth.svg',
    bg: 'bg-indigo-500',
    chart: [50, 55, 53, 60, 62, 58, 65, 72, 80, 90, 100, 105],
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
  {
    symbol: 'XRP',
    price: '$0.89',
    growth: '+12.07%',
    icon: '/crypto/xrp.svg',
    bg: 'bg-blue-500',
    chart: [10, 11, 9, 13, 14, 12, 15, 20, 18, 21, 23, 25],
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
])

const activeIndex = ref(0)

const scrollToIndex = (index: number) => {
  activeIndex.value = index
}

// Gesture Handling
let touchStartX = 0

const handleTouchStart = (e: TouchEvent) => {
  touchStartX = e.changedTouches[0].clientX
  stopAutoSlide()
}

const handleTouchEnd = (e: TouchEvent) => {
  const touchEndX = e.changedTouches[0].clientX
  const diff = touchEndX - touchStartX

  if (diff > 50 && activeIndex.value > 0) {
    activeIndex.value--
  } else if (diff < -50 && activeIndex.value < items.value.length - 1) {
    activeIndex.value++
  }

  startAutoSlide()
}

// Auto Slide
let intervalId: ReturnType<typeof setInterval> | undefined

const startAutoSlide = () => {
  stopAutoSlide()
  intervalId = setInterval(() => {
    activeIndex.value = (activeIndex.value + 1) % items.value.length
  }, 3000)
}

const stopAutoSlide = () => {
  if (intervalId) clearInterval(intervalId)
}

onMounted(() => {
  startAutoSlide()
})

onBeforeUnmount(() => {
  stopAutoSlide()
})
</script>

<template>
  <div class="bg-white rounded-xl shadow px-4 py-3 space-y-4">
    <!-- Slide Container -->
    <div class="relative w-full overflow-hidden">
      <div
        class="flex transition-transform duration-300 ease-in-out"
        :style="{ transform: `translateX(-${activeIndex * 100}%)` }"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
      >
        <div v-for="(item, index) in items" :key="index" class="min-w-full flex-shrink-0">
          <div class="bg-white rounded-xl p-1 space-y-2">
            <!-- Header -->
            <div class="flex justify-between items-center">
              <div class="flex items-center space-x-1">
                <div
                  class="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  :class="item.bg"
                >
                  <img :src="item.icon" alt="crypto icon" class="w-3.5 h-3.5 object-contain" />
                </div>
                <span class="font-semibold text-gray-900 text-base">{{ item.symbol }}</span>
                <span class="text-gray-400 text-sm font-normal">{{ item.price }}</span>
              </div>
              <span
                class="bg-slate-100 text-gray-500 text-xs border border-gray-300 rounded px-2 py-0.5"
              >
                Top Cryptocurrencies
              </span>
            </div>
            <div class="relative flex justify-between items-center">
              <div class="flex flex-col items-start">
                <span class="text-green-600 font-semibold">{{ item.growth }}</span>
                <p class="text-gray-400 text-xs">Past 1 year(s) to date</p>
              </div>
              <!-- Hapus ClientOnly, langsung render -->
              <SplineAreaChart class="relative" :series="item.chart" :categories="item.labels" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dot Indicators -->
    <div class="relative flex justify-start space-x-4 left-[-15px]">
      <div
        class="absolute w-[20px] h-2 rounded-lg bg-green-600 transition-transform duration-300 left-[1rem]"
        :style="{ transform: `translateX(${activeIndex * 1.5}rem)` }"
      ></div>

      <div
        v-for="(_, i) in items"
        :key="i"
        class="w-2 h-2 rounded-full bg-green-200 cursor-pointer"
        @click="scrollToIndex(i)"
      ></div>
    </div>
  </div>
</template>
