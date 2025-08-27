<template>
  <div class="max-w-md w-full mx-auto px-4 mb-20">
    <!-- Top bar -->
    <div class="flex items-center justify-between mb-3">
      <button aria-label="Go back" class="text-black text-sm" @click="goBack">
        <Icon icon="tabler:arrow-left" class="w-6 h-6" />
      </button>
      <p class="text-center text-gray-400 text-[14px] leading-6">
        Complete this month’s challenge and unlock<br />an exclusive reward!
      </p>
      <div class="w-6"></div>
    </div>

    <!-- Countdown -->
    <p class="text-center text-gray-400 text-[12px] leading-5 mb-6 flex justify-center gap-2">
      <span>
        <span class="text-teal-500 font-semibold">{{ timeLeft.days }}</span>
        <span class="text-gray-400">D</span>
      </span>
      <span>
        <span class="text-teal-500 font-semibold">{{ timeLeft.hours }}</span>
        <span class="text-gray-400">H</span>
      </span>
      <span>
        <span class="text-teal-500 font-semibold">{{ timeLeft.minutes }}</span>
        <span class="text-gray-400">M</span>
      </span>
      <span>
        <span class="text-teal-500 font-semibold">{{ timeLeft.seconds }}</span>
        <span class="text-gray-400">S</span>
      </span>
    </p>

    <!-- Card 1 -->
    <div class="border border-gray-200 rounded-lg mb-3 p-3">
      <div class="flex items-center space-x-3 mb-1">
        <div
          class="flex justify-center items-center w-8 h-8 rounded-full border border-gray-300 text-teal-500 text-lg"
        >
          <Icon icon="tabler:currency-dollar" class="w-4 h-4" />
        </div>
        <p class="text-gray-700 text-[12px] leading-5">
          Deposit a minimum of 100 USDT Via On Chain
        </p>
      </div>
      <div class="flex justify-between items-center text-[12px] text-gray-400">
        <span>Reward <span class="text-teal-500 font-semibold">$5.00</span></span>
        <button class="bg-teal-500 text-white text-[12px] rounded px-3 py-0.5">Claim</button>
      </div>
    </div>

    <!-- Card 2 with Extra Rewards label -->
    <div class="border border-gray-200 rounded-lg mb-3 p-3 relative">
      <div
        class="absolute top-0 left-0 bg-yellow-100 rounded-lg px-2 py-0.5 flex items-center text-yellow-600 text-[10px] font-semibold space-x-1 select-none"
      >
        <Icon icon="tabler:bolt" class="w-3 h-3" />
        <span>Extra Rewards</span>
      </div>
      <div class="flex items-center space-x-3 mb-1 mt-3">
        <div
          class="flex justify-center items-center w-8 h-8 rounded-full border border-gray-300 text-teal-500 text-lg"
        >
          <Icon icon="tabler:currency-dollar" class="w-4 h-4" />
        </div>
        <p class="text-gray-700 text-[12px] leading-5">
          Deposit a minimum of 1000 USDT Via On Chain
        </p>
      </div>
      <div class="flex justify-between items-center text-[12px] text-gray-400">
        <span>Reward <span class="text-teal-500 font-semibold">$50.00</span></span>
        <button class="bg-teal-500 text-white text-[12px] rounded px-3 py-0.5">Claim</button>
      </div>
    </div>

    <!-- Card 3 -->
    <div class="border border-gray-200 rounded-lg mb-3 p-3">
      <div class="flex items-center space-x-3 mb-1">
        <div
          class="flex justify-center items-center w-8 h-8 rounded-full border border-gray-300 text-teal-500 text-lg"
        >
          <Icon icon="tabler:currency-dollar" class="w-4 h-4" />
        </div>
        <p class="text-gray-700 text-[12px] leading-5">
          Trade &gt; 500 USDT In total Volume<br />
          ( Buys &amp; Sells ) on all SPOT trading pairs
        </p>
      </div>
      <div class="flex justify-between items-center text-[12px] text-gray-400">
        <span>Reward <span class="text-teal-500 font-semibold">$5.00</span></span>
        <button class="bg-teal-500 text-white text-[12px] rounded px-3 py-0.5">Claim</button>
      </div>
    </div>

    <!-- Card 4 -->
    <div class="border border-gray-200 rounded-lg mb-3 p-3">
      <div class="flex items-center space-x-3 mb-1">
        <div
          class="flex justify-center items-center w-8 h-8 rounded-full border border-gray-300 text-teal-500 text-lg"
        >
          <Icon icon="tabler:currency-dollar" class="w-4 h-4" />
        </div>
        <p class="text-gray-700 text-[12px] leading-5">
          Trade &gt; 1000 USDT on all COPY Trade 0/5
        </p>
      </div>
      <div class="flex justify-between items-center text-[12px] text-gray-400">
        <span>Reward <span class="text-teal-500 font-semibold">$200.00</span></span>
        <button class="bg-teal-500 text-white text-[12px] rounded px-3 py-0.5">Claim</button>
      </div>
    </div>

    <p class="text-center text-gray-300 text-[12px] mt-6 select-none">No more data</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

const router = useRouter()

// default countdown: 29d 19h 54m 35s
const defaultSeconds = 29 * 24 * 60 * 60 + 19 * 60 * 60 + 54 * 60 + 35

const timeLeft = ref({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
})

let interval: number | null = null

function updateTimeLeft(total: number) {
  const d = Math.floor(total / (24 * 3600))
  const h = Math.floor((total % (24 * 3600)) / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  timeLeft.value = { days: d, hours: h, minutes: m, seconds: s }
}

onMounted(() => {
  const saved = localStorage.getItem('challengeEnd')
  let endTime: number
  if (saved) {
    endTime = parseInt(saved, 10)
  } else {
    endTime = Math.floor(Date.now() / 1000) + defaultSeconds
    localStorage.setItem('challengeEnd', endTime.toString())
  }

  function tick() {
    const now = Math.floor(Date.now() / 1000)
    const left = Math.max(endTime - now, 0)
    updateTimeLeft(left)
  }

  tick()
  interval = window.setInterval(tick, 1000)
})

onBeforeUnmount(() => {
  if (interval) clearInterval(interval)
})

function goBack() {
  router.back()
}
</script>
