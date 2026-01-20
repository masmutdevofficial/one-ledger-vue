<template>
  <div class="px-4 pt-0 space-y-4 mb-20">
    <button aria-label="Go back" class="text-black text-xl" @click="goBack">
      <Icon icon="tabler:arrow-left" width="24" height="24" />
    </button>
    <section
      v-for="quest in quests"
      :key="quest.id"
      class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative"
      :aria-label="`Quest card for ${quest.name}`"
    >
      <div class="flex items-center space-x-3 mb-2">
        <img
          :alt="quest.logoAlt"
          class="w-8 h-8 rounded-full flex-shrink-0"
          height="32"
          :src="quest.logo"
          width="32"
        />
        <div>
          <h2 class="font-semibold text-gray-900 text-base leading-5">
            {{ quest.name }}
          </h2>
          <p class="text-gray-400 text-xs leading-4 mt-0.5">
            {{ quest.date }}
          </p>
        </div>
        <span
          v-if="quest.status"
          class="absolute top-4 right-4 bg-gray-300 text-gray-700 text-xs font-semibold rounded px-2 py-0.5 select-none flex items-center gap-1"
        >
          <Icon v-if="quest.statusIcon" :icon="quest.statusIcon" class="w-4 h-4" />
          {{ quest.status }}
        </span>
      </div>
      <dl class="text-gray-400 text-xs space-y-1">
        <div class="flex justify-between">
          <dt>Supported Network</dt>
          <dd>
            <img
              :alt="quest.networkAlt"
              class="inline-block"
              height="16"
              :src="quest.network"
              width="16"
            />
          </dd>
        </div>
        <div class="flex justify-between font-normal">
          <dt>Participants</dt>
          <dd class="text-gray-900 font-semibold">
            {{ quest.participants.toLocaleString('en-US') }}
          </dd>
        </div>
        <div class="flex justify-between font-normal">
          <dt>Quest Rewards</dt>
          <dd class="text-gray-900 font-bold">
            {{ quest.rewards }}
          </dd>
        </div>
      </dl>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
const router = useRouter()

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/buy-p2p')
}

interface Quest {
  id: number
  name: string
  logo: string
  logoAlt: string
  date: string
  status?: string
  statusIcon?: string // optional, icon untuk status
  network: string
  networkAlt: string
  participants: number
  rewards: string
}

const quests: Quest[] = [
  {
    id: 1,
    name: 'KernelDAO',
    logo: 'https://storage.googleapis.com/a1aa/image/96e6e704-ccb7-40be-02a8-6e4787bd5773.jpg',
    logoAlt: 'KernelDAO logo, a red circle with white stylized icon inside',
    date: '2025-04-14',
    status: 'Ended',
    statusIcon: '', // Kosong, ganti misal ingin tabler:alert-circle, dst
    network: 'img/crypto/bnb.svg',
    networkAlt: 'Yellow Binance Smart Chain icon',
    participants: 1758158,
    rewards: '40M KERNEL',
  },
  {
    id: 2,
    name: 'Solv Protocol',
    logo: 'https://storage.googleapis.com/a1aa/image/5303c8cc-7d9c-4648-2c6f-f353aaf94522.jpg',
    logoAlt: 'Solv Protocol logo, a purple circle with white stylized icon inside',
    date: '2025-01-18',
    status: 'Ended',
    statusIcon: '',
    network: 'img/crypto/bnb.svg',
    networkAlt: 'Yellow Binance Smart Chain icon',
    participants: 1327684,
    rewards: '588M SOLV',
  },
  {
    id: 3,
    name: 'Lista',
    logo: '/img/lista.png',
    logoAlt: 'Lista logo',
    date: '2024-06-20',
    status: 'Ended',
    statusIcon: '',
    network: 'img/crypto/bnb.svg',
    networkAlt: 'Yellow Binance Smart Chain icon',
    participants: 1247412,
    rewards: '100M LISTA',
  },
  {
    id: 4,
    name: 'BounceBit',
    logo: 'https://storage.googleapis.com/a1aa/image/696a012d-7e14-4823-cac0-3622682bb2f4.jpg',
    logoAlt: 'BounceBit logo, a black circle with white stylized icon inside',
    date: '2024-05-13',
    status: 'Ended',
    statusIcon: '',
    network: 'img/crypto/bnb.svg',
    networkAlt: 'Yellow Binance Smart Chain icon',
    participants: 822609,
    rewards: '168M BB',
  },
]
</script>
