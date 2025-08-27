<template>
  <div class="max-w-md w-full mx-auto px-4 pt-4 pb-28">
    <!-- Top bar -->
    <div class="flex items-center justify-between mb-3">
      <button aria-label="Go back" class="text-black text-xl" @click="goBack">
        <Icon icon="tabler:arrow-left" class="w-6 h-6" />
      </button>
      <p class="text-center text-gray-400 text-base leading-6">
        Complete this month’s challenge and unlock<br />an exclusive reward!
      </p>
      <div class="w-6"></div>
    </div>

    <!-- Countdown -->
    <p class="text-center text-gray-400 text-sm leading-5 mb-6 flex justify-center gap-2">
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
          class="flex justify-center items-center w-8 h-8 rounded-full border border-gray-300 text-teal-500"
        >
          <Icon icon="tabler:currency-dollar" class="w-4 h-4" />
        </div>
        <p class="text-gray-700 text-sm leading-5">Deposit a minimum of 100 USDT Via On Chain</p>
      </div>
      <div class="flex justify-between items-center text-xs text-gray-400">
        <span>Reward <span class="text-teal-500 font-semibold">$5.00</span></span>
        <button class="bg-teal-500 text-white text-xs rounded px-3 py-0.5">Claim</button>
      </div>
    </div>

    <!-- Card 2 with Extra Rewards label -->
    <div class="border border-gray-200 rounded-lg mb-3 p-3 relative">
      <div
        class="absolute top-0 left-0 bg-yellow-100 rounded-sm px-2 py-0.5 flex items-center text-yellow-600 text-[10px] font-semibold space-x-1 select-none"
      >
        <Icon icon="tabler:bolt" class="w-3 h-3" />
        <span>Extra Rewards</span>
      </div>
      <div class="flex items-center space-x-3 mb-1 mt-3">
        <div
          class="flex justify-center items-center w-8 h-8 rounded-full border border-gray-300 text-teal-500"
        >
          <Icon icon="tabler:currency-dollar" class="w-4 h-4" />
        </div>
        <p class="text-gray-700 text-sm leading-5">Deposit a minimum of 1000 USDT Via On Chain</p>
      </div>
      <div class="flex justify-between items-center text-xs text-gray-400">
        <span>Reward <span class="text-teal-500 font-semibold">$50.00</span></span>
        <button class="bg-teal-500 text-white text-xs rounded px-3 py-0.5">Claim</button>
      </div>
    </div>

    <!-- Card 3 -->
    <div class="border border-gray-200 rounded-lg mb-3 p-3">
      <div class="flex items-center space-x-3 mb-1">
        <div
          class="flex justify-center items-center w-8 h-8 rounded-full border border-gray-300 text-teal-500"
        >
          <Icon icon="tabler:currency-dollar" class="w-4 h-4" />
        </div>
        <p class="text-gray-700 text-sm leading-5">
          Trade &gt; 500 USDT In total Volume<br />
          ( Buys &amp; Sells ) on all SPOT trading pairs
        </p>
      </div>
      <div class="flex justify-between items-center text-xs text-gray-400">
        <span>Reward <span class="text-teal-500 font-semibold">$5.00</span></span>
        <button class="bg-teal-500 text-white text-xs rounded px-3 py-0.5">Claim</button>
      </div>
    </div>

    <!-- Card 4 -->
    <div class="border border-gray-200 rounded-lg mb-3 p-3">
      <div class="flex items-center space-x-3 mb-1">
        <div
          class="flex justify-center items-center w-8 h-8 rounded-full border border-gray-300 text-teal-500"
        >
          <Icon icon="tabler:currency-dollar" class="w-4 h-4" />
        </div>
        <p class="text-gray-700 text-sm leading-5">Trade &gt; 1000 USDT on all COPY Trade 0/5</p>
      </div>
      <div class="flex justify-between items-center text-xs text-gray-400">
        <span>Reward <span class="text-teal-500 font-semibold">$200.00</span></span>
        <button class="bg-teal-500 text-white text-xs rounded px-3 py-0.5">Claim</button>
      </div>
    </div>
    <p class="text-center text-gray-300 text-xs mt-6 select-none">No more data</p>

    <!-- Bottom Nav -->
    <div
      class="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white shadow-md z-50"
    >
      <div class="flex justify-around items-center py-2 space-x-3">
        <RouterLink to="/dashboard" class="flex flex-col items-center text-gray-400">
          <img alt="Home" src="/img/home-alt.png" class="w-4 h-4 object-contain" />
          <span class="text-xs mt-1 font-semibold">Home</span>
        </RouterLink>
        <div @click="openModalTerm" class="flex flex-col items-center cursor-pointer text-gray-400">
          <img alt="Term" src="/img/term.png" class="w-4 h-4 object-contain" />
          <span class="text-xs mt-1 font-semibold">Term</span>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="showModalTerm"
      class="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/30" @click="closeModalTerm"></div>

      <!-- Panel -->
      <div class="relative z-10 w-full max-w-lg mx-4 rounded-2xl bg-white shadow-xl" @click.stop>
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 class="text-[12px] font-semibold">Terms &amp; Conditions</h3>
          <button
            type="button"
            class="p-1 rounded hover:bg-gray-100"
            @click="closeModalTerm"
            aria-label="Close"
          >
            <Icon icon="tabler:x" class="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <!-- Body (scrollable) -->
        <div
          ref="scrollArea"
          class="max-h-[70dvh] overflow-y-auto px-4 py-3 text-[12px] leading-relaxed text-gray-700"
          @scroll="onScroll"
        >
          <p class="font-semibold">Terms &amp; Conditions – First-Time User Bonus</p>

          <h4 class="mt-3 font-semibold">Eligibility</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>
              The bonus is available only for users who are registering for the first time on the
              platform.
            </li>
            <li>
              Users who have previously created an account or have already claimed any bonuses are
              not eligible.
            </li>
          </ul>

          <h4 class="mt-3 font-semibold">Bonus Claim</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>
              The bonus must be claimed within the specified time frame after registration, as
              indicated by the platform.
            </li>
            <li>Each eligible user can claim the bonus only once.</li>
          </ul>

          <h4 class="mt-3 font-semibold">Restrictions</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>The bonus is non-transferable.</li>
            <li>
              Any attempt to create multiple accounts or manipulate eligibility will result in
              forfeiture of the bonus and may lead to account suspension.
            </li>
          </ul>

          <h4 class="mt-3 font-semibold">Usage &amp; Terms</h4>
          <p>
            The platform reserves the right to modify or terminate the bonus program at any time.
          </p>

          <h4 class="mt-3 font-semibold">Dispute &amp; Responsibility</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>Decisions by the platform regarding bonus eligibility and claims are final.</li>
            <li>Users are responsible for understanding the terms before claiming the bonus.</li>
          </ul>

          <div class="h-2"></div>
        </div>

        <!-- Footer -->
        <div class="px-4 py-3 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            class="px-4 py-2 rounded-lg font-medium text-[12px]"
            :class="
              readDone
                ? 'bg-teal-600 text-white hover:bg-teal-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            "
            :disabled="!readDone"
            @click="acknowledge"
          >
            I understand
          </button>
        </div>
      </div>
    </div>
    <!-- /Modal -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

const router = useRouter()

// countdown default 29d 19h 54m 35s
const defaultSeconds = 29 * 24 * 60 * 60 + 19 * 60 * 60 + 54 * 60 + 35

const timeLeft = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
let intervalId: number | undefined

function updateTimeLeft(total: number): void {
  const d = Math.floor(total / 86400)
  const h = Math.floor((total % 86400) / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  timeLeft.value = { days: d, hours: h, minutes: m, seconds: s }
}

onMounted(() => {
  const saved = localStorage.getItem('challengeEnd')
  let endTime: number
  if (saved) {
    endTime = Number.parseInt(saved, 10)
  } else {
    endTime = Math.floor(Date.now() / 1000) + defaultSeconds
    localStorage.setItem('challengeEnd', String(endTime))
  }
  const tick = (): void => {
    const now = Math.floor(Date.now() / 1000)
    const left = Math.max(endTime - now, 0)
    updateTimeLeft(left)
  }
  tick()
  intervalId = window.setInterval(tick, 1000)
})
onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId)
})

function goBack(): void {
  router.back()
}

/** ===== Terms Modal ===== */
const showModalTerm = ref(false)
const readDone = ref(false)
const scrollArea = ref<HTMLDivElement | null>(null)

function openModalTerm(): void {
  showModalTerm.value = true
  readDone.value = false
  document.documentElement.style.overflow = 'hidden'
}
function closeModalTerm(): void {
  showModalTerm.value = false
  document.documentElement.style.overflow = ''
}
function onScroll(e: Event): void {
  const el = e.target as HTMLDivElement
  const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4
  if (atBottom) readDone.value = true
}
function acknowledge(): void {
  closeModalTerm()
}
</script>
