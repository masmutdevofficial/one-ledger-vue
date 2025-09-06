<template>
  <div class="px-4 mb-20 relative">
    <div class="flex flex-row justify-between items-center mb-4">
      <h2 class="font-semibold text-base select-none">Collective Copy Trade</h2>
      <button
        aria-label="Back"
        class="mr-2 inline-flex items-center text-black"
        type="button"
        @click="goBack"
      >
        <Icon icon="tabler:x" class="w-4 h-4" />
      </button>
    </div>

    <div class="flex flex-row justify-between items-center mb-4">
      <div class="flex flex-col justify-start items-start">
        <div class="text-sm font-semibold mb-4 select-none">Private</div>

        <!-- Filter bar -->
        <div class="flex items-center space-x-4 text-xs text-gray-400 select-none">
          <div class="flex items-center">
            <span>30D</span>
          </div>

          <!-- PnL filter -->
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
      </div>
      <button
        type="button"
        class="border border-gray-400 bg-white text-gray-600 text-[12px] rounded-lg px-4 py-1 select-none active:bg-gray-200 transition-colors"
        @click="openModalTerm"
        aria-haspopup="dialog"
        :aria-expanded="showModalTerm ? 'true' : 'false'"
        aria-controls="modal-terms"
      >
        T & C
      </button>
    </div>

    <!-- Modal Terms -->
    <div
      v-if="showModalTerm"
      id="modal-terms"
      class="fixed inset-0 z-[51] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <div class="absolute inset-0 bg-black/30" @click="closeModalTerm"></div>

      <div class="relative z-10 w-full max-w-lg mx-4 rounded-2xl bg-white shadow-xl" @click.stop>
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

        <div
          ref="scrollArea"
          class="max-h-[70dvh] overflow-y-auto px-4 py-3 text-[12px] leading-relaxed text-gray-700 space-y-4"
          @scroll="onScroll"
        >
          <!-- 1. Join the Pool -->
          <div>
            <h4 class="mt-1 font-semibold">1. Join the Pool</h4>
            <ul class="list-disc pl-5 space-y-1 mt-1">
              <li>
                Each member who wishes to participate in the collective trading pool must deposit
                funds according to the agreed amount.
              </li>
              <li>
                Funds will be automatically secured in the smart contract for the duration of the
                trading session.
              </li>
              <li>
                All trading activities within the Pool are directed by the Master Trader. While
                entry (opening) may be performed manually by members following the minimum
                requirements, all closing of positions is executed collectively and automatically.
              </li>
              <li>By joining, you agree to follow the Pool rules.</li>
            </ul>
          </div>

          <!-- 2. How Trading Works -->
          <div>
            <h4 class="mt-1 font-semibold">2. How Trading Works</h4>
            <ul class="list-disc pl-5 space-y-1 mt-1">
              <li>
                Trading positions are opened according to the applied strategy, with members
                required to follow the minimum entry instructions.
              </li>
              <li>
                Closing of all trading positions is executed collectively and automatically under
                the Master Trader’s direction.
              </li>
              <li>
                All profit and loss calculations are performed automatically by the smart contract.
              </li>
              <li>
                Followers can only participate in a maximum of 5 open positions at the same time.
              </li>
            </ul>
          </div>

          <!-- 3. Profit Distribution -->
          <div>
            <h4 class="mt-1 font-semibold">3. Profit Distribution</h4>
            <ul class="list-disc pl-5 space-y-1 mt-1">
              <li>
                Profits and losses are shared proportionally based on each member’s contribution.
              </li>
              <li>
                Final results will be displayed on the dashboard and can be withdrawn once the
                session is completed.
              </li>
              <li>
                If service fees apply, they are not automatically deducted from profit. Members are
                required to pay service fees manually as instructed by the Pool management.
              </li>
            </ul>
          </div>

          <!-- 4. Discipline Rules -->
          <div>
            <h4 class="mt-1 font-semibold">4. Discipline Rules</h4>
            <ul class="list-disc pl-5 space-y-1 mt-1">
              <li>
                If a member fails to meet obligations (e.g., cancels participation, insufficient
                balance, or attempts to withdraw funds early), their funds will remain locked until
                the entire trading session ends.
              </li>
              <li>In such cases, the member cannot withdraw early.</li>
              <li>
                This rule ensures fairness, consistency, and avoids disruptions to the collective
                session.
              </li>
            </ul>
          </div>

          <!-- 5. Things to Understand -->
          <div>
            <h4 class="mt-1 font-semibold">5. Things to Understand</h4>
            <ul class="list-disc pl-5 space-y-1 mt-1">
              <li>Trading cryptocurrencies offers potential profit, but also involves risk.</li>
              <li>
                Profit is not guaranteed in every session as results depend on market conditions.
              </li>
              <li>By participating, members acknowledge and accept the risks involved.</li>
            </ul>
          </div>

          <!-- 6. Smart Contract Transparency -->
          <div>
            <h4 class="mt-1 font-semibold">6. Smart Contract Transparency</h4>
            <ul class="list-disc pl-5 space-y-1 mt-1">
              <li>
                All rules are coded into the smart contract, ensuring transparency and automation.
              </li>
              <li>No party can alter the final outcome once the session is in progress.</li>
            </ul>
          </div>

          <div class="h-2"></div>
        </div>

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

    <!-- List items -->
    <ul class="space-y-6 h-[540px] overflow-y-auto mb-10">
      <li
        v-for="item in sortedTraders"
        :key="item.id"
        class="flex flex-col space-y-2 border border-gray-200 rounded-lg p-4"
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
              <div class="font-semibold text-[12px] flex items-center space-x-1 select-none">
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
              <div class="text-[12px] text-gray-400 flex items-center space-x-0.5 select-none">
                <Icon icon="tabler:users" class="w-3 h-3" />
                <span>
                  <b>{{ item.followerLabel1 }}</b
                  >{{ item.followerLabel2 }}
                </span>
                <Icon v-if="item.showClock" icon="tabler:clock" class="w-3 h-3" />
              </div>
            </div>
          </div>

          <button
            v-if="item.button === 'Join'"
            class="bg-teal-300 text-white text-[12px] rounded-lg px-4 py-1 shadow-[0_0_8px_rgba(0,0,0,0.1)] select-none"
            type="button"
            @click="join(item)"
          >
            Join
          </button>
          <button
            v-else
            class="bg-red-100 text-red-600 text-[12px] rounded-lg px-4 py-1 select-none"
            type="button"
            disabled
          >
            Full
          </button>
        </div>

        <!-- Label bar -->
        <div class="flex justify-between text-[12px] text-gray-400 select-none">
          <span>{{ item.labelPnl }}</span>
          <span>{{ item.labelAum }}</span>
        </div>

        <div class="flex justify-between items-center">
          <div :class="item.pnlClass + ' font-semibold text-[12px] select-none'">
            {{ item.pnl }}
          </div>
          <div class="font-bold text-[12px] select-none">{{ item.aum }}</div>
        </div>

        <div class="flex items-start space-x-3">
          <div class="flex-1">
            <div class="flex items-start justify-between text-[12px] text-gray-400 select-none">
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
                <div class="text-gray-900 font-semibold text-[12px] select-none">
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

  <!-- Modal Password -->
  <div
    v-if="modal.open"
    class="fixed inset-0 z-51 flex items-center justify-center"
    aria-modal="true"
    role="dialog"
  >
    <div class="absolute inset-0 bg-black/30" @click="closeModal"></div>

    <form
      class="relative z-10 w-[92%] max-w-sm rounded-2xl bg-white p-5 shadow-lg no-ios-zoom"
      @submit.prevent="submitPassword"
    >
      <div class="mb-3">
        <h3 class="text-base font-semibold">Enter Password</h3>
        <p class="mt-1 text-xs text-gray-500 select-none">
          Access to <b>{{ modal.trader?.username }}</b> is protected by a password.
        </p>
      </div>

      <label class="block text-xs text-gray-600 mb-1 select-none">Password</label>
      <input
        v-model="modal.password"
        type="password"
        inputmode="text"
        autocomplete="current-password"
        required
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
      />

      <p v-if="modal.error" class="mt-2 text-xs text-red-600">{{ modal.error }}</p>

      <div class="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          class="text-xs px-3 py-1.5 rounded border border-gray-300"
          @click="closeModal"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="text-xs px-3 py-1.5 rounded bg-teal-500 text-white disabled:opacity-60"
          :disabled="modal.loading"
        >
          {{ modal.loading ? 'Checking…' : 'Sign In' }}
        </button>
      </div>
    </form>
  </div>

  <!-- ALERT (lokal) -->
  <div
    v-if="alert.open"
    class="fixed z-[60] top-4 left-1/2 -translate-x-1/2 max-w-md mx-4"
    role="alert"
    aria-live="assertive"
  >
    <div
      class="flex items-start gap-2 rounded-xl border px-3 py-2 shadow bg-white"
      :class="alert.type === 'success' ? 'border-teal-300' : 'border-red-300'"
    >
      <Icon
        v-if="alert.type === 'success'"
        icon="tabler:circle-check"
        class="w-5 h-5 text-teal-600 mt-0.5"
      />
      <Icon v-else icon="tabler:alert-triangle" class="w-5 h-5 text-red-600 mt-0.5" />
      <div class="text-sm text-gray-900 flex-1">{{ alert.message }}</div>
      <button
        type="button"
        class="shrink-0 p-1 rounded hover:bg-gray-100"
        aria-label="Tutup"
        @click="closeAlert()"
      >
        <Icon icon="tabler:x" class="w-4 h-4 text-gray-500" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { ref, onMounted, computed, onUnmounted, nextTick } from 'vue'

const router = useRouter()

/** ==== NAV ==== */
function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/copy')
}

/** ==== Terms Modal ==== */
const showModalTerm = ref(false)
const readDone = ref(false)
const scrollArea = ref<HTMLElement | null>(null)

function openModalTerm() {
  showModalTerm.value = true
  readDone.value = false
  nextTick(() => {
    if (scrollArea.value) scrollArea.value.scrollTop = 0
  })
}
function closeModalTerm() {
  showModalTerm.value = false
}
function onScroll(e: Event) {
  const el = e.target as HTMLElement
  readDone.value = el.scrollTop + el.clientHeight >= el.scrollHeight - 8
}
function acknowledge() {
  closeModalTerm()
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
  status: 'draft' | 'published'
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
  pnl: string
  pnlNum: number
  pnlClass: string
  roi: string
  aum: string
  mddValue: string
  sharpe: string
  chartSeries: number[]
  chartCategories?: string[]
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
    labelPnl: lbl(r.text_pnl_30d, '30D PnL'),
    labelRoi: lbl(r.text_roi_30d_pct, '30D ROI'),
    labelAum: lbl(r.text_aum, 'AUM'),
    labelMdd: lbl(r.text_mdd_30d_pct, '30D MDD'),
    labelSharpe: lbl(r.text_sharpe_ratio, 'Sharpe Ratio'),
    chartSeries: [10, 20, 15, 25, 20, 35, 28],
    chartCategories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  }
}

/** ==== Filter PnL ==== */
const showPnl = ref(false)
type PnlOrder = 'ASC' | 'DESC'
const pnlOrder = ref<PnlOrder>('DESC')
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
  arr.sort((a, b) => (pnlOrder.value === 'DESC' ? b.pnlNum - a.pnlNum : a.pnlNum - b.pnlNum))
  return arr
})

/** ==== Polling Config ==== */
const API_BASE = 'https://one-ledger.masmutpanel.my.id'
const POLL_MS = 5000
const hasPasswordBySlug = ref<Record<string, boolean>>({})
let pollId: number | null = null
let inFlightList: AbortController | null = null
let inFlightPwd: AbortController | null = null

/** ==== Fetch list (Join/Full, angka) ==== */
async function fetchTradersList(): Promise<void> {
  try {
    const token = localStorage.getItem('token')
    if (!token || !token.trim()) {
      copyTraders.value = []
      return
    }

    inFlightList?.abort()
    inFlightList = new AbortController()

    const res = await fetch(`${API_BASE}/api/data-lable-copy-trading`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      signal: inFlightList.signal,
    })
    if (!res.ok) throw new Error(String(res.status))
    const data: ApiRow[] = await res.json()

    // hanya tampilkan published
    const mapped = Array.isArray(data)
      ? data.filter((r) => (r.status ?? 'published') === 'published').map(mapRow)
      : []
    copyTraders.value = mapped
  } catch {
    // diam
  }
}

/** ==== Fetch password-status per trader ==== */
async function fetchPasswordStatuses(): Promise<void> {
  const token = localStorage.getItem('token')?.trim() ?? ''
  if (!token) return
  if (copyTraders.value.length === 0) return

  inFlightPwd?.abort()
  inFlightPwd = new AbortController()

  const nextMap: Record<string, boolean> = { ...hasPasswordBySlug.value }
  for (const t of copyTraders.value) {
    const slug = t.slug || slugify(t.username)
    try {
      const url = `${API_BASE}/api/copy-traders/${encodeURIComponent(slug)}/password-status`
      const res = await fetch(url, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        signal: inFlightPwd.signal,
      })
      if (!res.ok) {
        // 404 atau error lain -> anggap false (tidak perlu password)
        nextMap[slug] = false
      } else {
        const { has_password } = (await res.json()) as { has_password: boolean }
        nextMap[slug] = !!has_password
      }

      // Jika modal sedang terbuka untuk trader ini dan sekarang tidak perlu password -> auto masuk
      if (modal.value.open && modal.value.trader) {
        const curSlug = modal.value.trader.slug || slugify(modal.value.trader.username)
        if (curSlug === slug && nextMap[slug] === false) {
          closeModal()
          sessionStorage.setItem(`copy_access:${slug}`, '')
          openAlert('success', 'Access Granted. Sign In...')
          router.push(`/futures/${slug}`)
        }
      }
    } catch {
      // diam; biarkan status sebelumnya
    }
  }
  hasPasswordBySlug.value = nextMap
}

/** ==== Polling start/stop ==== */
function startPolling(): void {
  if (pollId !== null) return
  // panggilan awal
  void fetchTradersList().then(() => fetchPasswordStatuses())

  pollId = window.setInterval(async () => {
    if (document.hidden) return
    await fetchTradersList()
    await fetchPasswordStatuses()
  }, POLL_MS) as unknown as number
}

function stopPolling(): void {
  if (pollId !== null) {
    clearInterval(pollId)
    pollId = null
  }
  inFlightList?.abort()
  inFlightPwd?.abort()
}

function onVisibility(): void {
  if (document.hidden) stopPolling()
  else startPolling()
}

/** ==== Lifecycle ==== */
onMounted(() => {
  startPolling()
  document.addEventListener('visibilitychange', onVisibility, { passive: true })
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisibility)
  stopPolling()
  closeAlert()
})

/** ==== ALERT lokal ==== */
type AlertType = 'success' | 'error'
const alert = ref<{ open: boolean; type: AlertType; message: string; _t?: number | null }>({
  open: false,
  type: 'success',
  message: '',
  _t: null,
})
function openAlert(type: AlertType, message: string, timeoutMs = 2500) {
  closeAlert()
  alert.value.open = true
  alert.value.type = type
  alert.value.message = message
  alert.value._t = window.setTimeout(() => closeAlert(), timeoutMs)
}
function closeAlert() {
  if (alert.value._t) {
    clearTimeout(alert.value._t)
    alert.value._t = null
  }
  alert.value.open = false
}

/** ==== Modal & Join Flow ==== */
interface ModalState {
  open: boolean
  trader: CopyTrader | null
  password: string
  loading: boolean
  error: string | null
}
const modal = ref<ModalState>({
  open: false,
  trader: null,
  password: '',
  loading: false,
  error: null,
})

async function join(item: CopyTrader) {
  try {
    const token = localStorage.getItem('token')?.trim() ?? ''
    if (!token) {
      openAlert('error', 'Unauthenticated.')
      return
    }

    const slug = item.slug || slugify(item.username)

    // pakai hasil polling bila tersedia; jika belum, fetch sekali
    let needPwd = hasPasswordBySlug.value[slug]
    if (typeof needPwd === 'undefined') {
      try {
        const resStatus = await fetch(
          `${API_BASE}/api/copy-traders/${encodeURIComponent(slug)}/password-status`,
          { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } },
        )
        if (resStatus.status === 404) {
          openAlert('error', 'Copy trader not found.')
          return
        }
        if (!resStatus.ok) {
          openAlert('error', `Error checking password status (${resStatus.status}).`)
          return
        }
        const { has_password } = (await resStatus.json()) as { has_password: boolean }
        needPwd = !!has_password
        hasPasswordBySlug.value = { ...hasPasswordBySlug.value, [slug]: needPwd }
      } catch {
        openAlert('error', 'Error checking access.')
        return
      }
    }

    if (!needPwd) {
      sessionStorage.setItem(`copy_access:${slug}`, '')
      openAlert('success', 'Access Granted. Sign In...')
      router.push(`/futures/${slug}`)
      return
    }

    // Perlu password -> buka modal
    modal.value.open = true
    modal.value.trader = item
    modal.value.password = ''
    modal.value.error = null
    await nextTick()
  } catch {
    openAlert('error', 'Error checking access.')
  }
}

async function submitPassword() {
  if (!modal.value.trader) return
  const t = modal.value.trader
  const slug = t.slug || slugify(t.username)

  try {
    modal.value.loading = true
    modal.value.error = null

    const token = localStorage.getItem('token')?.trim() ?? ''
    if (!token) {
      modal.value.loading = false
      openAlert('error', 'Unauthenticated.')
      return
    }

    const res = await fetch(
      `${API_BASE}/api/copy-traders/${encodeURIComponent(slug)}/password-check`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: modal.value.password }),
      },
    )

    if (res.status === 404) {
      modal.value.loading = false
      openAlert('error', 'Copy trader not found.')
      return
    }
    if (!res.ok) {
      modal.value.loading = false
      openAlert('error', `Error validating password (${res.status}).`)
      return
    }

    const raw = await res.text()
    const data = JSON.parse(raw) as
      | { status: 'success'; code: 'OK' | 'NO_PASSWORD_SET'; bcrypt?: string }
      | { status: 'error'; code: 'INVALID_PASSWORD'; bcrypt?: string }

    if (data.status === 'success') {
      sessionStorage.setItem(`copy_access:${slug}`, modal.value.password)
      if (data.bcrypt) sessionStorage.setItem(`copy_access_bcrypt:${slug}`, data.bcrypt)

      closeModal()
      openAlert('success', 'Valid password. Sign In...')
      router.push(`/futures/${slug}`)
    } else {
      modal.value.error = 'Wrong Password.'
      openAlert('error', 'Wrong Password.')
    }
  } catch {
    openAlert('error', 'Error while checking password.')
  } finally {
    modal.value.loading = false
  }
}

function closeModal() {
  modal.value.open = false
  modal.value.trader = null
  modal.value.password = ''
  modal.value.error = null
}

/** ==== Escape untuk tutup modal ==== */
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && modal.value.open) closeModal()
}
window.addEventListener('keydown', onKey)
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>
