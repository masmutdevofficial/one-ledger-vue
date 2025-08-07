<template>
  <div class="px-4">
    <h2 class="font-semibold text-base mb-2 select-none">Futures Copy</h2>
    <div class="text-sm font-semibold mb-4 select-none">Public</div>
    <!-- Filter bar -->
    <div class="flex items-center space-x-4 text-xs text-gray-400 mb-4 select-none">
      <div class="flex items-center space-x-1 cursor-pointer">
        <span>30D</span>
        <Icon icon="tabler:chevron-down" class="w-3 h-3" />
      </div>
      <div class="flex items-center space-x-1 cursor-pointer">
        <span>PnL</span>
        <Icon icon="tabler:chevron-down" class="w-3 h-3" />
      </div>
      <label class="flex items-center space-x-1 cursor-pointer select-none">
        <input checked class="w-4 h-4 rounded border-gray-300 text-black" type="checkbox" />
        <span class="underline text-gray-400">Smart Filter</span>
      </label>
    </div>
    <!-- List items -->
    <ul class="space-y-6">
      <li
        v-for="item in copyTraders"
        :key="item.id"
        class="flex flex-col space-y-2 border-b border-gray-100 pb-4"
      >
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-2">
            <img
              :alt="item.avatarAlt"
              class="w-8 h-8 rounded-full"
              height="32"
              :src="item.avatar"
              width="32"
            />
            <div class="flex flex-col justify-start">
              <div class="font-semibold text-sm flex items-center space-x-1 select-none">
                <span>{{ item.username }}</span>
                <Icon
                  v-if="item.badge === 'crown'"
                  icon="tabler:crown"
                  class="text-yellow-400 w-4 h-4"
                />
                <Icon
                  v-else-if="item.badge === 'graduation-cap'"
                  icon="tabler:school"
                  class="text-yellow-600 w-4 h-4"
                />
              </div>
              <div class="text-xs text-gray-400 flex items-center space-x-0.5 select-none">
                <Icon icon="tabler:users" class="w-3 h-3" />
                <span
                  ><b>{{ item.followerLabel1 }}</b
                  >{{ item.followerLabel2 }}</span
                >
                <Icon v-if="item.showClock" icon="tabler:clock" class="w-3 h-3" />
              </div>
            </div>
          </div>

          <button
            v-if="item.button === 'Copy'"
            class="bg-teal-300 text-white text-sm rounded-lg px-4 py-1 shadow-[0_0_8px_rgba(0,0,0,0.1)] select-none"
            type="button"
          >
            Copy
          </button>
          <button
            v-else
            class="bg-red-100 text-red-600 text-sm rounded-lg px-4 py-1 select-none"
            type="button"
            disabled
          >
            Full
          </button>
        </div>
        <div class="flex justify-between text-xs text-gray-400 select-none">
          <span>30D PnL</span>
          <span>30D ROI</span>
          <span>AUM</span>
        </div>
        <div class="flex justify-between items-center">
          <div :class="item.pnlClass + ' font-semibold text-lg select-none'">
            {{ item.pnl }}
          </div>
          <div class="text-teal-600 font-semibold text-sm select-none">
            {{ item.roi }}
          </div>
          <div class="font-bold text-sm select-none">{{ item.aum }}</div>
        </div>
        <div class="flex justify-between text-xs text-gray-400 select-none">
          <span>30D MDD</span>
          <span :class="item.mddValue === '--' ? '' : 'font-semibold text-gray-900 select-none'">
            {{ item.mddValue }}
          </span>
          <span>Sharpe Ratio</span>
          <span>{{ item.sharpe }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface CopyTrader {
  id: number
  username: string
  avatar: string
  avatarAlt: string
  badge?: 'crown' | 'graduation-cap'
  followerLabel1: string
  followerLabel2: string
  showClock?: boolean
  button: 'Copy' | 'Full'
  pnl: string
  pnlClass: string
  roi: string
  aum: string
  mddValue: string
  sharpe: string
}

const copyTraders: CopyTrader[] = [
  {
    id: 1,
    username: 'KNOTMAIN',
    avatar: 'https://storage.googleapis.com/a1aa/image/6ecfb30d-6fe9-4892-1ece-ea51a478d56c.jpg',
    avatarAlt: 'Profile avatar of KNOTMAIN with colorful abstract background',
    badge: 'crown',
    followerLabel1: '999',
    followerLabel2: '/1000',
    showClock: true,
    button: 'Copy',
    pnl: '+84,569.48',
    pnlClass: 'text-green-500',
    roi: '12.92%',
    aum: '5,191,333.58',
    mddValue: '10.26%',
    sharpe: '2.44',
  },
  {
    id: 2,
    username: '静态平衡',
    avatar: 'https://storage.googleapis.com/a1aa/image/a354fb7f-c018-413c-d1b5-a87c946093f5.jpg',
    avatarAlt: 'Profile avatar of 静态平衡 with blue and white abstract background',
    followerLabel1: '200',
    followerLabel2: '/200',
    button: 'Full',
    pnl: '+75,647.33',
    pnlClass: 'text-teal-600',
    roi: '9.93%',
    aum: '871,742.98',
    mddValue: '9.40%',
    sharpe: '2.69',
  },
  {
    id: 3,
    username: '江南西道',
    avatar: 'https://storage.googleapis.com/a1aa/image/5d38c912-b3a4-4cf8-5626-87a582b06834.jpg',
    avatarAlt: 'Profile avatar of 江南西道 with dark orange and black abstract background',
    followerLabel1: '205',
    followerLabel2: '/400',
    button: 'Copy',
    pnl: '+44,151.02',
    pnlClass: 'text-teal-600',
    roi: '60.19%',
    aum: '114,069.95',
    mddValue: '11.71%',
    sharpe: '--',
  },
  {
    id: 4,
    username: 'Cryptoxn',
    avatar: 'https://storage.googleapis.com/a1aa/image/7aaee1f0-269a-4c41-1c1c-d989a675425b.jpg',
    avatarAlt: 'Profile avatar of Cryptoxn with yellow and brown abstract background',
    badge: 'graduation-cap',
    followerLabel1: '526',
    followerLabel2: '/700',
    showClock: true,
    button: 'Copy',
    pnl: '+33,879.47',
    pnlClass: 'text-teal-600',
    roi: '22.83%',
    aum: '1,729,893.82',
    mddValue: '5.39%',
    sharpe: '3.14',
  },
]
</script>
