<template>
  <div class="px-4 mb-20 relative">
    <div class="flex flex-row justify-start items-center mb-4">
      <button
        aria-label="Back"
        class="mr-2 inline-flex items-center text-black"
        type="button"
        @click="goBack"
      >
        <Icon icon="tabler:arrow-left" class="w-6 h-6" />
      </button>
      <h2 class="font-semibold text-base select-none">Futures Copy</h2>
    </div>

    <div class="text-sm font-semibold mb-4 select-none">Private</div>

    <!-- Filter bar -->
    <div class="flex items-center space-x-4 text-xs text-gray-400 mb-4 select-none">
      <!-- 30D tanpa ikon -->
      <div class="flex items-center">
        <span>30D</span>
      </div>

      <!-- PnL filter (dropdown: Terbanyak / Terkecil) -->
      <div class="relative">
        <button
          type="button"
          class="flex items-center space-x-1 cursor-pointer"
          @click="togglePnlMenu"
        >
          <span>PnL</span>
          <Icon icon="tabler:chevron-down" class="w-3 h-3" />
        </button>

        <div
          v-if="showPnl"
          class="absolute z-20 mt-2 bg-white border border-gray-200 rounded-lg p-3 shadow w-56"
        >
          <div class="text-[11px] text-gray-500 mb-2">Urutkan PnL</div>
          <div class="space-y-2 text-sm">
            <label class="flex items-center space-x-2">
              <input type="radio" value="DESC" v-model="pnlOrder" />
              <span>Terbanyak (highest first)</span>
            </label>
            <label class="flex items-center space-x-2">
              <input type="radio" value="ASC" v-model="pnlOrder" />
              <span>Terkecil (lowest first)</span>
            </label>
          </div>
          <div class="mt-3 flex items-center space-x-2">
            <button type="button" class="text-xs px-2 py-1 border rounded" @click="applyPnl">
              Apply
            </button>
            <button type="button" class="text-xs px-2 py-1 border rounded" @click="closePnl">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- List items (pakai hasil sorting) -->
    <ul class="space-y-6">
      <li
        v-for="item in sortedTraders"
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
            v-if="item.button === 'Join'"
            class="bg-teal-300 text-white text-sm rounded-lg px-4 py-1 shadow-[0_0_8px_rgba(0,0,0,0.1)] select-none"
            type="button"
            @click="goToFutures(item.username)"
          >
            Join
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
          <span>{{ item.labelAum }}</span>
        </div>

        <div class="flex justify-between items-center">
          <div :class="item.pnlClass + ' font-semibold text-lg select-none'">
            {{ item.pnl }}
          </div>
          <div class="font-bold text-sm select-none">{{ item.aum }}</div>
        </div>

        <div class="flex items-start space-x-3">
          <div class="flex-1">
            <div class="flex items-start justify-between text-xs text-gray-400 select-none">
              <div class="flex flex-col justify-start">
                <span>{{ item.labelMdd }}</span>
                <span
                  :class="item.mddValue === '--' ? '' : 'font-semibold text-gray-900 select-none'"
                >
                  {{ item.mddValue }}
                </span>
              </div>
              <div class="flex flex-col justify-center items-center">
                <span>{{ item.labelRoi }}</span>
                <div class="text-gray-900 font-semibold text-xs select-none">
                  {{ item.roi }}
                </div>
              </div>
              <div class="flex flex-col justify-center">
                <span>{{ item.labelSharpe }}</span>
                <span class="text-gray-900 font-semibold text-end">{{ item.sharpe }}</span>
              </div>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'

const router = useRouter()

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/copy')
}

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
  button: 'Join' | 'Full'
  pnl: string // formatted
  pnlNum: number // numeric for sorting
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

    button: isFull ? 'Full' : 'Join',
    pnl: toSignedMoney(r.pnl_30d),
    pnlNum: r.pnl_30d,
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

/** ==== Filter PnL ==== */
const showPnl = ref(false)
type PnlOrder = 'ASC' | 'DESC'
const pnlOrder = ref<PnlOrder>('DESC') // default: Terbanyak (highest first)

function togglePnlMenu() {
  showPnl.value = !showPnl.value
}
function applyPnl() {
  showPnl.value = false
}
function closePnl() {
  showPnl.value = false
}

const sortedTraders = computed(() => {
  const arr = copyTraders.value.slice()
  arr.sort((a, b) => {
    return pnlOrder.value === 'DESC' ? b.pnlNum - a.pnlNum : a.pnlNum - b.pnlNum
  })
  return arr
})

/** ==== Fetch data dari API ==== */
onMounted(async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token || !token.trim()) {
      copyTraders.value = []
      return
    }

    const res = await fetch('https://one-ledger.masmutpanel.my.id/api/data-lable-copy-trading', {
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
