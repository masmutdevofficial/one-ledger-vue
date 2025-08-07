<template>
  <div class="max-w-md mx-auto p-4">
    <!-- Top filter bar -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-4 text-sm font-normal text-gray-900">
        <div class="flex items-center space-x-1 cursor-pointer select-none">
          <img
            alt="USDT coin icon"
            class="w-5 h-5 rounded-full"
            height="20"
            src="https://storage.googleapis.com/a1aa/image/5f0cf905-cc74-4690-75ed-3741d9e2aed4.jpg"
            width="20"
          />
          <span>USDT</span>
          <Icon icon="tabler:chevron-down" class="w-3 h-3" />
        </div>
        <div class="flex items-center space-x-1 cursor-pointer select-none">
          <span>Amount</span>
          <Icon icon="tabler:chevron-down" class="w-3 h-3" />
        </div>
        <div class="flex items-center space-x-1 cursor-pointer select-none">
          <span>Payment</span>
          <Icon icon="tabler:chevron-down" class="w-3 h-3" />
        </div>
      </div>
      <div>
        <Icon icon="tabler:filter" class="text-yellow-400 text-lg w-5 h-5" />
      </div>
    </div>

    <!-- Trade items -->
    <div v-for="trade in trades" :key="trade.id" class="mb-6">
      <div class="flex items-center space-x-2 mb-1">
        <div
          class="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold select-none"
        >
          {{ trade.avatarText }}
        </div>
        <span class="text-sm font-semibold text-gray-900">
          {{ trade.username }}
        </span>
        <img
          v-for="(emoji, idx) in trade.emojis"
          :key="idx"
          :alt="emoji.alt"
          class="w-3.5 h-3.5"
          height="14"
          :src="emoji.src"
          width="14"
        />
      </div>
      <div class="text-xs text-gray-500 mb-1">
        Trade(s) {{ trade.trades }} ({{ trade.successRate }})
        <span class="ml-2"> ⚡ {{ trade.completionRate }} </span>
      </div>
      <div class="flex items-center justify-between mb-1">
        <div>
          <span class="text-base font-extrabold text-gray-900">
            {{ trade.price }}
          </span>
          <span class="text-xs font-normal text-gray-500 ml-1">USDT</span>
        </div>
        <div class="text-xs text-gray-400 text-right">
          <template v-if="Array.isArray(trade.payment)">
            <div v-for="(pay, idx) in trade.payment" :key="idx">
              {{ pay }}
              <span v-if="pay.includes('⚡')"></span>
            </div>
          </template>
          <template v-else>
            {{ trade.payment }}
          </template>
        </div>
      </div>
      <div class="text-xs text-gray-500 mb-1">
        Limit
        <span class="font-semibold">{{ trade.limit }}</span>
      </div>
      <div class="text-xs text-gray-500 mb-3">
        Available
        <span class="font-semibold">{{ trade.available }}</span>
      </div>
      <div class="flex items-center justify-between">
        <div class="text-xs text-gray-400 flex items-center space-x-1">
          <Icon icon="tabler:clock" class="w-3 h-3" />
          <span>{{ trade.time }}</span>
        </div>
        <button
          class="bg-green-500 text-white text-xs font-semibold rounded-md px-6 py-1"
          type="button"
        >
          Buy
        </button>
      </div>
      <div
        v-if="trade.verified"
        class="mt-2 inline-block border border-gray-300 rounded px-1 text-xs text-gray-600 font-semibold select-none"
      >
        <Icon icon="tabler:check" class="inline-block w-3 h-3 mr-1" />
        Verification
      </div>
    </div>
    <div class="text-center text-xs text-gray-400 select-none">No more data</div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

type Emoji = { src: string; alt: string }

type Trade = {
  id: number
  avatarText: string
  username: string
  emojis: Emoji[]
  trades: number
  successRate: string
  completionRate: string
  price: string
  payment: string | string[]
  limit: string
  available: string
  time: string
  verified?: boolean
}

const trades: Trade[] = [
  {
    id: 1,
    avatarText: 'L',
    username: 'LucasFastpay',
    emojis: [
      {
        src: 'https://storage.googleapis.com/a1aa/image/ef459f7a-0780-4494-7d6f-54e40e376a28.jpg',
        alt: 'Fire emoji',
      },
    ],
    trades: 1366,
    successRate: '99,00%',
    completionRate: '98,20%',
    price: 'Rp 16.280',
    payment: 'Yap! (BNI)',
    limit: '3.000.000 - 10.000.000 IDR',
    available: '6.348,05 USDT',
    time: '15 min',
  },
  {
    id: 2,
    avatarText: 'N',
    username: 'Nap_Rut_Nhanh_Gon',
    emojis: [
      {
        src: 'https://storage.googleapis.com/a1aa/image/ef459f7a-0780-4494-7d6f-54e40e376a28.jpg',
        alt: 'Fire emoji',
      },
    ],
    trades: 2749,
    successRate: '100,00%',
    completionRate: '75,86%',
    price: 'Rp 16.280',
    payment: 'Bank Transfer ⚡',
    limit: '8.000.001 - 20.000.000 IDR',
    available: '3.380,27 USDT',
    time: '30 min',
  },
  {
    id: 3,
    avatarText: 'P',
    username: 'PANTHER_Z',
    emojis: [
      {
        src: 'https://storage.googleapis.com/a1aa/image/bdf2b390-7b1a-47de-ae86-662743046566.jpg',
        alt: 'Lightning emoji',
      },
    ],
    trades: 850,
    successRate: '100,00%',
    completionRate: '100,00%',
    price: 'Rp 16.281',
    payment: ['Bank Transfer ⚡', 'Mandiri Pay ⚡'],
    limit: '10.000.000 - 62.338.830 IDR',
    available: '3.828,93 USDT',
    time: '15 min',
    verified: true,
  },
  {
    id: 4,
    avatarText: 'I',
    username: 'INPUTCHANGER星FAST',
    emojis: [
      {
        src: 'https://storage.googleapis.com/a1aa/image/ef459f7a-0780-4494-7d6f-54e40e376a28.jpg',
        alt: 'Fire emoji',
      },
    ],
    trades: 3616,
    successRate: '100,00%',
    completionRate: '99,66%',
    price: 'Rp 16.281',
    payment: ['Permata Me ⚡', 'Bank Transfer ⚡'],
    limit: '5.000.000 - 51.516.631 IDR',
    available: '3.164,21 USDT',
    time: '15 min',
    verified: true,
  },
]
</script>
