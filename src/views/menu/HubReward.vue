<template>
  <div class="px-4 pt-6 pb-20 flex-grow max-w-md mx-auto w-full">
    <button aria-label="Go back" class="text-black text-xl" @click="goBack">
      <Icon icon="tabler:arrow-left" width="24" height="24" />
    </button>
    <h1 class="font-semibold text-lg leading-6 text-black mb-4">My Tasks</h1>
    <nav class="flex space-x-6 mb-4 text-sm font-medium">
      <button
        :class="[
          'relative',
          tab === 'ongoing'
            ? 'text-black after:absolute after:-bottom-1 after:left-0 after:w-6 after:h-[2px] after:bg-yellow-400 after:rounded'
            : 'text-gray-400',
        ]"
        @click="tab = 'ongoing'"
      >
        Ongoing
      </button>
      <button
        :class="
          tab === 'past'
            ? 'text-black after:absolute after:-bottom-1 after:left-0 after:w-6 after:h-[2px] after:bg-yellow-400 after:rounded'
            : 'text-gray-400'
        "
        @click="tab = 'past'"
      >
        Past
      </button>
    </nav>

    <!-- Ongoing Tasks -->
    <section v-if="tab === 'ongoing'">
      <div
        v-for="task in ongoingTasks"
        :key="task.id"
        aria-label="Ongoing task card"
        class="border border-black/10 rounded-lg p-4 space-y-3 max-w-md w-full mb-4"
      >
        <div class="flex items-center space-x-2">
          <Icon :icon="task.icon" class="w-5 h-5 text-cyan-600" />
          <p class="text-black text-sm font-semibold leading-5">
            {{ task.title }}
          </p>
        </div>
        <div class="text-xs text-gray-400 space-y-1">
          <div class="flex justify-between">
            <span>Progress</span>
            <span>
              <span class="text-cyan-600">{{ task.progress }}</span
              >/{{ task.target }} USDT
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span>Reward</span>
            <span class="flex items-center space-x-1">
              <Icon :icon="task.rewardIcon" class="w-4 h-4 text-yellow-400" />
              <span class="text-black">{{ task.rewardText }}</span>
            </span>
          </div>
          <div class="flex justify-between">
            <span>Time Left to Complete Task</span>
            <span>{{ task.timeLeft }}</span>
          </div>
        </div>
        <div class="flex justify-between items-center pt-1">
          <button aria-label="Info" class="text-gray-400 text-xs leading-none" title="More info">
            <Icon icon="tabler:info-circle" class="w-4 h-4" />
          </button>
          <button
            class="bg-cyan-400 text-white text-sm rounded-md px-6 py-2 font-light"
            type="button"
          >
            Do Task
          </button>
        </div>
      </div>
      <div v-if="ongoingTasks.length === 0" class="text-center text-gray-400 text-sm">
        No ongoing tasks
      </div>
    </section>

    <!-- Past Tasks -->
    <section v-else>
      <template v-if="pastTasks.length > 0">
        <div
          v-for="task in pastTasks"
          :key="task.id"
          class="border border-black/10 rounded-lg p-4 space-y-3 max-w-md w-full mb-4"
        >
          <div class="flex items-center space-x-2">
            <Icon :icon="task.icon" class="w-5 h-5 text-gray-400" />
            <p class="text-black text-sm font-semibold leading-5 line-through">
              {{ task.title }}
            </p>
          </div>
        </div>
      </template>
      <div v-else class="text-center text-gray-400 text-sm mt-10">No data available</div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
const router = useRouter()

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/buy-p2p')
}
type Task = {
  id: number
  title: string
  icon: string
  progress: number
  target: number
  rewardIcon: string
  rewardText: string
  timeLeft: string
}

// Data ongoing, bisa diisi dari API nanti
const ongoingTasks = ref<Task[]>([
  {
    id: 1,
    title: 'Trade > $5,000 on Futures or Spot, get 25 USDC token voucher.',
    icon: 'tabler:arrows-sync',
    progress: 0,
    target: 5000,
    rewardIcon: 'tabler:ticket',
    rewardText: '25 USDC Token Voucher',
    timeLeft: '01D : 23H : 30M',
  },
  // Tambah data task ongoing lain di sini kalau perlu
])

// Data past (kosong = muncul "No data available")
const pastTasks = ref<Task[]>([])

const tab = ref<'ongoing' | 'past'>('ongoing')
</script>
