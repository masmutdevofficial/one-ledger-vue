<template>
  <div class="px-4 mb-20">
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
            @click="goToFutures(item.username)"
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

        <!-- Label bar: pakai label dari API -->
        <div class="flex justify-between text-xs text-gray-400 select-none">
          <span>{{ item.labelPnl }}</span>
          <span class="ml-[30px]">{{ item.labelRoi }}</span>
          <span>{{ item.labelAum }}</span>
        </div>

        <div class="flex justify-between items-center">
          <div :class="item.pnlClass + ' font-semibold text-lg select-none'">
            {{ item.pnl }}
          </div>
          <div class="text-teal-600 font-semibold text-sm select-none ml-[32px]">
            {{ item.roi }}
          </div>
          <div class="font-bold text-sm select-none">{{ item.aum }}</div>
        </div>

        <div class="flex items-start space-x-3">
          <!-- Kiri: Gambar -->
          <MiniAreaChart :series="item.chartSeries" :categories="item.chartCategories" />
          <!-- Kanan: Info -->
          <div class="flex-1">
            <div class="flex items-start justify-between text-xs text-gray-400 select-none">
              <div class="flex flex-col justify-center text-xs text-gray-400 select-none ml-23">
                <span class="mr-3">{{ item.labelMdd }}</span>
                <span
                  :class="
                    item.mddValue === '--' ? '' : 'font-semibold text-gray-900 select-none ml-1.5'
                  "
                >
                  {{ item.mddValue }}
                </span>
              </div>
              <div class="flex flex-col justify-center text-xs text-gray-400 select-none">
                <span>{{ item.labelSharpe }}</span>
                <span class="text-gray-900">{{ item.sharpe }}</span>
              </div>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import MiniAreaChart from '@/components/futures/MiniAreaChart.vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'

const router = useRouter()

/** ==== API Row ==== */
type ApiRow = {
  id: number
  name: string
  slug: string
  avatar_url?: string | null
  is_featured: boolean | 0 | 1
  copies_used: number
  copies_limit: number

  text_pnl_30d?: string | null
  text_roi_30d_pct?: string | null
  text_mdd_30d_pct?: string | null
  text_aum?: string | null
  text_sharpe_ratio?: string | null

  pnl_30d: number
  roi_30d_pct: number
  mdd_30d_pct: number
  aum: number
  sharpe_ratio: number
}

/** ==== UI type ==== */
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
  chartSeries: number[]
  chartCategories?: string[]

  // labels dari API
  labelPnl: string
  labelRoi: string
  labelAum: string
  labelMdd: string
  labelSharpe: string

  slug?: string
}

const copyTraders = ref<CopyTrader[]>([])

/** ==== Helpers ==== */
function fmt2(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function toPct(n: number) {
  return `${n.toFixed(2)}%`
}
function toSignedMoney(n: number) {
  const sign = n >= 0 ? '+' : ''
  return `${sign}${fmt2(n)}`
}
function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
const lbl = (v: string | null | undefined, fallback: string) => (v && v.trim() ? v : fallback)

function mapRow(r: ApiRow): CopyTrader {
  const isFull = r.copies_limit > 0 && r.copies_used >= r.copies_limit
  return {
    id: r.id,
    username: r.name,
    slug: r.slug,
    avatar: r.avatar_url || 'https://placehold.co/64x64/ddd/666?text=?',
    avatarAlt: `Profile avatar of ${r.name}`,
    badge: r.is_featured ? 'crown' : undefined,
    followerLabel1: String(r.copies_used),
    followerLabel2: `/${r.copies_limit}`,
    showClock: !!r.is_featured,

    button: isFull ? 'Full' : 'Copy',
    pnl: toSignedMoney(r.pnl_30d),
    pnlClass: r.pnl_30d >= 0 ? 'text-green-500' : 'text-red-500',
    roi: toPct(r.roi_30d_pct),
    aum: fmt2(r.aum),
    mddValue: toPct(r.mdd_30d_pct),
    sharpe: String(r.sharpe_ratio),

    // labels dinamis (fallback kalau kosong)
    labelPnl: lbl(r.text_pnl_30d, '30D PnL'),
    labelRoi: lbl(r.text_roi_30d_pct, '30D ROI'),
    labelAum: lbl(r.text_aum, 'AUM'),
    labelMdd: lbl(r.text_mdd_30d_pct, '30D MDD'),
    labelSharpe: lbl(r.text_sharpe_ratio, 'Sharpe Ratio'),

    // sparkline dummy (UI tetap)
    chartSeries: [10, 20, 15, 25, 20, 35, 28],
    chartCategories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  }
}

/** ==== Fetch data dari API ==== */
onMounted(async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token || !token.trim()) {
      copyTraders.value = []
      return
    }

    const res = await fetch('https://ledger.masmutdev.id/api/data-lable-copy-trading', {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) throw new Error(String(res.status))
    const data: ApiRow[] = await res.json()
    copyTraders.value = Array.isArray(data) ? data.map(mapRow) : []
  } catch {
    copyTraders.value = []
  }
})

/** ==== Navigasi ==== */
function goToFutures(username: string) {
  const item = copyTraders.value.find((i) => i.username === username)
  const slug = item?.slug || slugify(username)
  router.push(`/futures/${slug}`)
}
</script>
