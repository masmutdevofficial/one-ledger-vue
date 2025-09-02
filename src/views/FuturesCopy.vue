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
      <h2 class="font-semibold text-base select-none">Collective Copy Trade</h2>
    </div>

    <div class="text-sm font-semibold mb-4 select-none">Private</div>

    <!-- Filter bar -->
    <div class="flex items-center space-x-4 text-xs text-gray-400 mb-4 select-none">
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

    <!-- List items -->
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
            @click="join(item)"
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

        <!-- Label bar -->
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

  <!-- Modal Password -->
  <div
    v-if="modal.open"
    class="fixed inset-0 z-51 flex items-center justify-center"
    aria-modal="true"
    role="dialog"
  >
    <div class="absolute inset-0 bg-black/30" @click="closeModal"></div>

    <form
      class="relative z-10 w-[92%] max-w-sm rounded-2xl bg-white p-5 shadow-lg"
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

/** ==== Fetch data ==== */
onMounted(async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token || !token.trim()) {
      copyTraders.value = []
      return
    }

    const res = await fetch('https://one-ledger.masmutpanel.my.id/api/data-lable-copy-trading', {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(String(res.status))
    const data: ApiRow[] = await res.json()
    copyTraders.value = Array.isArray(data) ? data.map(mapRow) : []
  } catch {
    copyTraders.value = []
  }
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
onUnmounted(() => closeAlert())

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

    // Cek status password
    const resStatus = await fetch(
      `https://one-ledger.masmutpanel.my.id/api/copy-traders/${encodeURIComponent(slug)}/password-status`,
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

    if (!has_password) {
      sessionStorage.setItem(`copy_access:${slug}`, '')
      openAlert('success', 'Access Granted. Sign In...')
      router.push(`/futures/${slug}`)
      return
    }

    // Ada password -> buka modal
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
  // simpan dulu target sebelum modal direset
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
      `https://one-ledger.masmutpanel.my.id/api/copy-traders/${encodeURIComponent(slug)}/password-check`,
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
      // simpan credential akses untuk halaman detail (opsional)
      sessionStorage.setItem(`copy_access:${slug}`, modal.value.password)
      if (data.bcrypt) sessionStorage.setItem(`copy_access_bcrypt:${slug}`, data.bcrypt)

      closeModal() // aman dipanggil sekarang
      openAlert('success', 'Valid password. Sign In...')
      // langsung ke detail pakai slug (tanpa mencari username)
      router.push(`/futures/${slug}`)
    } else {
      modal.value.error = 'Wrong Password.'
      openAlert('error', 'Wrong Password.')
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
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

/** Escape untuk tutup modal */
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && modal.value.open) closeModal()
}
window.addEventListener('keydown', onKey)
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>
