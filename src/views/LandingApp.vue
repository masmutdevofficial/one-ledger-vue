<template>
  <div class="w-full h-screen bg-[#eaf3ec] rounded-lg text-center relative p-4">
    <!-- Ilustrasi Koin -->
    <div class="flex justify-center">
      <img
        src="/img/coin-box.png"
        alt="Gift box with coins"
        class="w-28 h-32 object-contain"
        width="120"
        height="140"
      />
    </div>

    <!-- Judul & Subjudul -->
    <h1 class="mt-2 text-lg sm:text-xl font-semibold text-black">
      <span class="text-[#00b38a] font-semibold">11,000 USDT</span> Bonus for New Users
    </h1>
    <p class="mt-1 text-sm text-gray-500">Sign up now for limited-time rewards</p>

    <!-- Countdown -->
    <div class="mt-3 flex justify-center space-x-2 text-xs text-gray-700 font-semibold">
      <div class="bg-white rounded-md px-2 py-1 shadow-sm">{{ days }}</div>
      <div class="pt-1">d</div>
      <div class="bg-white rounded-md px-2 py-1 shadow-sm">{{ hours }}</div>
      <div class="pt-1">h</div>
      <div class="bg-white rounded-md px-2 py-1 shadow-sm">{{ minutes }}</div>
      <div class="pt-1">m</div>
      <div class="bg-white rounded-md px-2 py-1 shadow-sm">{{ seconds }}</div>
      <div class="pt-1">s</div>
    </div>

    <!-- Cards -->
    <div class="mt-5 flex justify-between space-x-3 px-2">
      <!-- Sign Up -->
      <div class="bg-white rounded-lg p-3 flex-1 shadow-sm text-left">
        <p class="font-semibold text-sm text-black">Sign Up</p>
        <p class="text-[#00b38a] font-semibold text-sm mt-1">20 USDT</p>
        <p class="text-xs text-gray-400 mt-0.5">Max Reward</p>
      </div>

      <!-- Deposit / Trade -->
      <div class="bg-white rounded-lg p-3 flex-1 shadow-sm text-left">
        <p class="font-semibold text-sm text-black">Deposit/Trade</p>
        <p class="text-[#00b38a] font-semibold text-sm mt-1">8,000 USDT</p>
        <p class="text-xs text-gray-400 mt-0.5">Futures Trial Funds</p>
      </div>

      <!-- Earn -->
      <div class="bg-white rounded-lg p-3 flex-1 shadow-sm text-left">
        <p class="font-semibold text-sm text-black">Earn</p>
        <p class="text-[#00b38a] font-semibold text-sm mt-1">100%</p>
        <p class="text-xs text-gray-400 mt-0.5">Max APR</p>
      </div>
    </div>

    <div class="mt-5">
      <!-- Header -->
      <div class="flex items-center justify-between mb-3">
        <span class="text-gray-700 text-sm font-normal">Rewards Hub</span>
        <!-- Icon diganti emoji panah sementara -->
        <Icon icon="tabler:arrow-narrow-right" style="font-size: 24px; margin-right: 2px" />
      </div>

      <!-- CTA Button -->
      <RouterLink
        to="/login"
        class="block w-full bg-black text-white font-semibold text-base rounded-full py-3 mb-4 text-center"
      >
        Sign Up / Log In
      </RouterLink>

      <DashboardSliderCrypto />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { RouterLink } from 'vue-router'
import DashboardSliderCrypto from '@/components/landing/DashboardSliderCrypto.vue'
import { Icon } from '@iconify/vue'
import { ref, onMounted, onUnmounted } from 'vue'

const days = ref(0)
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)

const COUNTDOWN_KEY = 'landingCountdown'
const COUNTDOWN_DURATION = 3 * 24 * 60 * 60 * 1000 // 3 hari
let interval: number

function convert(ms: number) {
  const d = Math.floor(ms / (1000 * 60 * 60 * 24))
  const h = Math.floor((ms / (1000 * 60 * 60)) % 24)
  const m = Math.floor((ms / (1000 * 60)) % 60)
  const s = Math.floor((ms / 1000) % 60)
  return { d, h, m, s }
}

function startCountdown(endTime: number) {
  interval = window.setInterval(() => {
    const now = Date.now()
    let diff = endTime - now

    if (diff <= 0) {
      endTime = now + COUNTDOWN_DURATION
      localStorage.setItem(COUNTDOWN_KEY, endTime.toString())
      diff = COUNTDOWN_DURATION
    }

    const { d, h, m, s } = convert(diff)
    days.value = d
    hours.value = h
    minutes.value = m
    seconds.value = s
  }, 1000)
}

onMounted(() => {
  const saved = localStorage.getItem(COUNTDOWN_KEY)
  const endTime = saved ? parseInt(saved) : Date.now() + COUNTDOWN_DURATION
  localStorage.setItem(COUNTDOWN_KEY, endTime.toString())

  startCountdown(endTime)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>
