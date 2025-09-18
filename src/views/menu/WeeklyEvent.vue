<template>
  <div class="max-w-md w-full mx-auto px-4 pt-4 pb-28">
    <!-- Top bar -->
    <div class="flex items-center justify-center mb-3">
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

    <!-- Card 1: Deposit >= 100 -->
    <div class="border border-gray-200 rounded-lg mb-3 p-3">
      <div class="flex items-center space-x-3 mb-1">
        <div class="flex justify-center items-center w-8 h-8 rounded-full border border-gray-300 text-teal-500">
          <Icon icon="tabler:currency-dollar" class="w-4 h-4" />
        </div>
        <p class="text-gray-700 text-sm leading-5">Deposit a minimum of 100 USDT Via On Chain</p>
      </div>
      <div class="flex justify-between items-center text-xs text-gray-400">
        <span>Reward <span class="text-teal-500 font-semibold">$5.00</span></span>
        <button class="text-white text-xs rounded px-3 py-0.5 transition-colors" :class="[
          btnClass(claim.bonus_deposit_100),
          isClaiming.deposit100 ? 'opacity-70 cursor-wait' : '',
        ]" :disabled="isDisabled(claim.bonus_deposit_100) || isClaiming.deposit100"
          @click="onClaim('deposit100', claim.bonus_deposit_100)">
          {{ buttonText('deposit100', claim.bonus_deposit_100) }}
        </button>
      </div>
    </div>

    <!-- Card 2: Deposit >= 1000 (Extra Rewards) -->
    <div class="border border-gray-200 rounded-lg mb-3 p-3 relative">
      <div
        class="absolute top-0 left-0 bg-yellow-100 rounded-sm px-2 py-0.5 flex items-center text-yellow-600 text-[10px] font-semibold space-x-1 select-none">
        <Icon icon="tabler:bolt" class="w-3 h-3" />
        <span>Extra Rewards</span>
      </div>
      <div class="flex items-center space-x-3 mb-1 mt-3">
        <div class="flex justify-center items-center w-8 h-8 rounded-full border border-gray-300 text-teal-500">
          <Icon icon="tabler:currency-dollar" class="w-4 h-4" />
        </div>
        <p class="text-gray-700 text-sm leading-5">Deposit a minimum of 1000 USDT Via On Chain</p>
      </div>
      <div class="flex justify-between items-center text-xs text-gray-400">
        <span>Reward <span class="text-teal-500 font-semibold">$50.00</span></span>
        <button class="text-white text-xs rounded px-3 py-0.5 transition-colors" :class="[
          btnClass(claim.bonus_deposit_1000),
          isClaiming.deposit1000 ? 'opacity-70 cursor-wait' : '',
        ]" :disabled="isDisabled(claim.bonus_deposit_1000) || isClaiming.deposit1000"
          @click="onClaim('deposit1000', claim.bonus_deposit_1000)">
          {{ buttonText('deposit1000', claim.bonus_deposit_1000) }}
        </button>
      </div>
    </div>

    <!-- Card 3: SPOT volume >= 500 -->
    <div class="border border-gray-200 rounded-lg mb-3 p-3">
      <div class="flex items-center space-x-3 mb-1">
        <div class="flex justify-center items-center w-8 h-8 rounded-full border border-gray-300 text-teal-500">
          <Icon icon="tabler:currency-dollar" class="w-4 h-4" />
        </div>
        <p class="text-gray-700 text-sm leading-5">
          Trade &gt; 500 USDT In total Volume<br />( Buys &amp; Sells ) on all SPOT trading pairs
        </p>
      </div>
      <div class="flex justify-between items-center text-xs text-gray-400">
        <span>Reward <span class="text-teal-500 font-semibold">$5.00</span></span>
        <button class="text-white text-xs rounded px-3 py-0.5 transition-colors" :class="[
          btnClass(claim.bonus_tradespot_500),
          isClaiming.tradespot500 ? 'opacity-70 cursor-wait' : '',
        ]" :disabled="isDisabled(claim.bonus_tradespot_500) || isClaiming.tradespot500"
          @click="onClaim('tradespot500', claim.bonus_tradespot_500)">
          {{ buttonText('tradespot500', claim.bonus_tradespot_500) }}
        </button>
      </div>
    </div>

    <!-- Card 4: COPY Trade >= 1000 (show progress) -->
    <div class="border border-gray-200 rounded-lg mb-3 p-3">
      <div class="flex items-center space-x-3 mb-1">
        <div class="flex justify-center items-center w-8 h-8 rounded-full border border-gray-300 text-teal-500">
          <Icon icon="tabler:currency-dollar" class="w-4 h-4" />
        </div>
        <p class="text-gray-700 text-sm leading-5">
          Trade &gt; on all COPY Trade
          <span class="text-teal-600 font-semibold">{{ claim.bonus_copytrade_1000 }}/6</span>
        </p>
      </div>
      <div class="flex justify-between items-center text-xs text-gray-400">
        <span>Reward <span class="text-teal-500 font-semibold">$200.00</span></span>
        <button class="text-white text-xs rounded px-3 py-0.5 transition-colors" :class="[
          btnClass(copyTradeStatus),
          isClaiming.copytrade1000 ? 'opacity-70 cursor-wait' : '',
        ]" :disabled="isDisabled(copyTradeStatus) || isClaiming.copytrade1000"
          @click="onClaim('copytrade1000', copyTradeStatus)">
          {{ buttonText('copytrade1000', copyTradeStatus) }}
        </button>
      </div>
    </div>

    <p class="text-center text-gray-300 text-xs mt-6 select-none">No more data</p>

    <!-- Bottom Nav -->
    <div class="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white shadow-md z-50">
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
    <div v-if="showModalTerm" class="fixed inset-0 z-50 flex items-center justify-center" aria-modal="true"
      role="dialog">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/30" @click="closeModalTerm"></div>

      <!-- Panel -->
      <div class="relative z-10 w-full max-w-lg mx-4 rounded-2xl bg-white shadow-xl" @click.stop>
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 class="text-[12px] font-semibold">Terms &amp; Conditions</h3>
          <button type="button" class="p-1 rounded hover:bg-gray-100" @click="closeModalTerm" aria-label="Close">
            <Icon icon="tabler:x" class="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <!-- Body -->
        <div ref="scrollArea" class="max-h-[70dvh] overflow-y-auto px-4 py-3 text-[12px] leading-relaxed text-gray-700"
          @scroll="onScroll">
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
          <button type="button" class="px-4 py-2 rounded-lg font-medium text-[12px]" :class="readDone
            ? 'bg-teal-600 text-white hover:bg-teal-700'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            " :disabled="!readDone" @click="acknowledge">
            I understand
          </button>
        </div>
      </div>
    </div>
    <!-- /Modal -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useApiAlertStore } from '@/stores/apiAlert'

/** ===== Constants ===== */
const API_BASE = 'https://one-ledger.masmutpanel.my.id/api'
const getToken = (): string =>
  typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''

/** ===== Alert ===== */
const modal = useApiAlertStore()

/** ===== Countdown ===== */
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
  if (saved) endTime = Number.parseInt(saved, 10)
  else {
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

  // Load claim data on mount
  void loadClaimData()
})

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId)
})

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

/** ===== Claim Data (from /claim-new-user) ===== */
type Tri = 0 | 1 | 2
type ApiClaimData = {
  bonus_deposit_100: Tri
  bonus_deposit_1000: Tri
  bonus_tradespot_500: Tri
  bonus_copytrade_1000: number
  /** true jika sudah pernah klaim copytrade1000 (dari tabel transaksi_klaim) */
  status_bonus_copytrade_1000: boolean
  notif: 0 | 1
}
type ApiClaimResp = {
  success: boolean
  data: ApiClaimData
  user_id: number
}

const claim = ref<ApiClaimData>({
  bonus_deposit_100: 0,
  bonus_deposit_1000: 0,
  bonus_tradespot_500: 0,
  bonus_copytrade_1000: 0,
  status_bonus_copytrade_1000: false,
  notif: 0,
})

async function loadClaimData(): Promise<void> {
  const token = getToken()
  if (!token) {
    modal.open('Unauthorized', 'Token not found.')
    return
  }
  try {
    const res = await fetch(`${API_BASE}/claim-new-user`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      credentials: 'include',
    })
    if (!res.ok) {
      const msg = await res.text().catch(() => `HTTP ${res.status}`)
      throw new Error(msg)
    }
    const json = (await res.json()) as ApiClaimResp
    if (!json?.success || !json.data) throw new Error('Invalid response payload.')
    const d = json.data as Partial<ApiClaimData> & Record<string, unknown>
    claim.value = {
      bonus_deposit_100: (d.bonus_deposit_100 as Tri) ?? 0,
      bonus_deposit_1000: (d.bonus_deposit_1000 as Tri) ?? 0,
      bonus_tradespot_500: (d.bonus_tradespot_500 as Tri) ?? 0,
      bonus_copytrade_1000: Number(d.bonus_copytrade_1000 ?? 0),
      status_bonus_copytrade_1000: Boolean(d.status_bonus_copytrade_1000),
      notif: (d.notif as 0 | 1) ?? 0,
    }
  } catch (e: unknown) {
    modal.open('Error', e instanceof Error ? e.message : 'Failed to load claim data.')
  }
}

/** ===== Claiming to API ===== */
type ClaimKind = 'deposit100' | 'deposit1000' | 'tradespot500' | 'copytrade1000'
type ApiClaimCreateResp = {
  success: boolean
  message?: string
  data?: { id: number; jenis: ClaimKind; reward: string; user_id: number }
}

const isClaiming = ref<Record<ClaimKind, boolean>>({
  deposit100: false,
  deposit1000: false,
  tradespot500: false,
  copytrade1000: false,
})

const claimedKinds = ref<Set<ClaimKind>>(new Set())

async function callClaimApi(kind: ClaimKind): Promise<ApiClaimCreateResp> {
  const token = getToken()
  if (!token) throw new Error('Token not found.')
  const res = await fetch(`${API_BASE}/claim-new-user/claim`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ jenis: kind }),
  })
  const txt = await res.text()
  const json: ApiClaimCreateResp = txt ? (JSON.parse(txt) as ApiClaimCreateResp) : { success: false }
  if (!res.ok || !json.success) {
    throw new Error(json?.message || `HTTP ${res.status}`)
  }
  return json
}

/** ===== UI helpers for claim status ===== */
function isDisabled(v: Tri): boolean {
  return v === 0 || v === 2
}
function labelText(v: Tri): string {
  return v === 2 ? 'Claimed' : 'Claim'
}
function btnClass(v: Tri): string {
  if (v === 1) return 'bg-teal-600 hover:bg-teal-700'
  return 'bg-gray-300 cursor-not-allowed'
}
function buttonText(kind: ClaimKind, status: Tri): string {
  if (isClaiming.value[kind]) return 'Claiming...'
  return labelText(status)
}

/**
 * COPY Trade status (Tri):
 * 0 = locked (progress < 5)
 * 1 = claimable (progress >= 5) dan belum pernah klaim (status_bonus_copytrade_1000 = false)
 * 2 = claimed (sudah pernah klaim di server ATAU baru diklaim di sesi ini)
 */
const copyTradeStatus = computed<Tri>(() => {
  if (claim.value.status_bonus_copytrade_1000) return 2
  if (claimedKinds.value.has('copytrade1000')) return 2
  const progress = Number(claim.value.bonus_copytrade_1000) || 0
  return progress >= 6 ? 1 : 0
})

/** Handle Claim click */
async function onClaim(kind: ClaimKind, status: Tri): Promise<void> {
  if (status === 0) {
    modal.open('Not eligible', 'You have not met the requirements yet.')
    return
  }
  if (status === 2) {
    modal.open('Already claimed', 'This reward has already been claimed.')
    return
  }
  if (isClaiming.value[kind]) return

  try {
    isClaiming.value[kind] = true
    const resp = await callClaimApi(kind)
    const rewardNum = Number(resp.data?.reward ?? 0)
    modal.open('Success', `Claim successful. Reward: $${rewardNum.toFixed(2)}`)

    // Update local UI state to "claimed"
    if (kind === 'deposit100') {
      claim.value.bonus_deposit_100 = 2
    } else if (kind === 'deposit1000') {
      claim.value.bonus_deposit_1000 = 2
    } else if (kind === 'tradespot500') {
      claim.value.bonus_tradespot_500 = 2
    } else if (kind === 'copytrade1000') {
      claimedKinds.value.add('copytrade1000')
    }
  } catch (e: unknown) {
    modal.open('Error', e instanceof Error ? e.message : 'Failed to claim reward.')
  } finally {
    isClaiming.value[kind] = false
  }
}
</script>
