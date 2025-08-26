<template>
  <div class="w-full max-w-xl rounded-lg border shadow-sm bg-white overflow-hidden">
    <div class="h-[560px] flex flex-col overflow-hidden">
      <!-- List chat -->
      <div ref="listEl" class="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
        <template v-for="m in messages" :key="m.id">
          <div class="flex items-start gap-2 text-sm leading-relaxed">
            <span class="shrink-0 font-medium" :style="{ color: userColor(m.user) }">
              {{ m.user }}:
            </span>
            <p class="whitespace-pre-wrap break-words">
              {{ m.text }}
              <span
                v-if="m.streaming"
                class="inline-block w-[7px] h-[1.1em] align-[-0.2em] bg-gray-400 animate-pulse ml-0.5"
              />
            </p>
          </div>
        </template>
        <div v-if="!copyTraderId" class="text-sm text-gray-500">Memuat…</div>
      </div>

      <!-- Input + emoji -->
      <div class="sticky bottom-0 bg-white/90 backdrop-blur px-3 py-2 shadow-md">
        <form @submit.prevent="handleSend" class="relative flex items-end gap-2">
          <div class="relative">
            <button
              type="button"
              @click="toggleEmoji()"
              class="inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100 active:bg-gray-200"
              title="Emoji"
              ref="emojiBtnRef"
            >
              <Icon icon="tabler:mood-smile" class="w-5 h-5 text-gray-700" />
            </button>
            <div
              v-if="emojiOpen"
              ref="emojiPanelRef"
              class="absolute bottom-full left-0 mb-2 w-64 rounded-xl border bg-white shadow p-2 z-10"
            >
              <div class="text-xs text-gray-500 px-1 pb-1">Emoji</div>
              <div class="max-h-56 overflow-y-auto pr-1 overscroll-contain">
                <div class="grid grid-cols-8 gap-1 text-[22px] leading-none">
                  <button
                    v-for="(e, i) in frequentEmojis"
                    :key="i"
                    type="button"
                    class="h-8 w-8 rounded hover:bg-gray-100"
                    @click="insertEmoji(e)"
                  >
                    {{ e }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <textarea
            ref="taRef"
            v-model="draft"
            @keydown.enter.exact.prevent="handleSend"
            @keydown.enter.shift.stop
            @keyup="captureSelection"
            @mouseup="captureSelection"
            @select="captureSelection"
            rows="1"
            placeholder="Tulis pesan..."
            class="w-full resize-none outline-none rounded-xl px-3 py-3 pr-12 text-sm max-h-32 overflow-auto bg-gray-50 border border-gray-200 focus:border-teal-300 focus:ring-1 focus:ring-teal-300"
          />
          <button
            type="submit"
            :disabled="!canSend || sending || !copyTraderId"
            class="inline-flex items-center justify-center rounded-md p-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Kirim"
          >
            <Icon icon="tabler:send-2" class="w-5 h-5 text-blue-600" />
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useApiAlertStore } from '@/stores/apiAlert'

/** ========= CONFIG ========= */
const API_BASE = 'https://one-ledger.masmutpanel.my.id/api'
/** ========================= */

type ChatMessage = {
  id: number
  user: string
  text: string
  streaming?: boolean
  created_at?: string
}
type ApiMessage = {
  id: number
  copy_trader_id: number
  user_id: number
  username: string
  message: string
  created_at: string
}
type NotifRow = {
  id: number
  user_id: number
  username: string
  amount: string
  status: number
  created_at: string
}
type LookupResp = { data: { id: number; name: string; slug: string } }
type ListResp = { data: ApiMessage[]; last_id: number | null }
type NewResp = { data: ApiMessage[] }
type NotifResp = { data: NotifRow | null }

const route = useRoute()
const modal = useApiAlertStore()

/** ===== AUTH + REQUEST (tanpa any) ===== */
function getToken(): string {
  return localStorage.getItem('token') ?? ''
}
function parseJsonSafe(input: string): unknown {
  try {
    return JSON.parse(input) as unknown
  } catch {
    return input as unknown
  }
}
function extractErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === 'object' && data !== null) {
    const maybeMsg =
      (data as { message?: unknown; error?: unknown }).message ??
      (data as { error?: unknown }).error
    if (typeof maybeMsg === 'string') return maybeMsg
  }
  return fallback
}
async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  if (!token) {
    modal.open('Auth', 'Token tidak ditemukan')
    throw new Error('Unauthorized')
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
    credentials: 'include',
  })
  const text = await res.text()
  const data: unknown = text ? parseJsonSafe(text) : null
  if (!res.ok) {
    const msg = extractErrorMessage(data, `HTTP ${res.status}`)
    modal.open('Request gagal', msg)
    throw new Error(msg)
  }
  return data as T
}
/** ===================================== */

/** ===== Resolve copyTraderId dari /futures/:username ===== */
const copyTraderId = ref<number | null>(null)
async function resolveCopyTraderId(): Promise<void> {
  const usernameParam = String(route.params.username ?? '').trim()
  if (!usernameParam) {
    modal.open('Error', 'Param :username tidak ada di URL')
    return
  }
  const resp = await apiRequest<LookupResp>(
    `/copy-traders/lookup?name=${encodeURIComponent(usernameParam)}`,
  )
  copyTraderId.value = resp?.data?.id ?? null
  if (!copyTraderId.value) modal.open('Error', 'Copy trader tidak ditemukan')
}
/** ================================================ */

/** ========== STATE & UI ========== */
const messages = ref<ChatMessage[]>([])
let lastId: number | null = null
let pollHandle: number | null = null
let pollNotifHandle: number | null = null
const POLL_MS = 2000
const POLL_NOTIF_MS = 5000

const draft = ref<string>('')
const sending = ref<boolean>(false)
const canSend = computed(() => draft.value.trim().length > 0)

const listEl = ref<HTMLDivElement | null>(null)
function isAtBottom(): boolean {
  const el = listEl.value
  if (!el) return true
  return el.scrollHeight - el.scrollTop - el.clientHeight < 8
}
function scrollToBottom(): void {
  const el = listEl.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}
onMounted(() => scrollToBottom())
watch(
  () => messages.value.length,
  async () => {
    const stick = isAtBottom()
    await nextTick()
    if (stick) scrollToBottom()
  },
)

function userColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  const hue = hash % 360
  return `hsl(${hue} 65% 45%)`
}
/** ============================== */

/** ========== EMOJI ========== */
const emojiOpen = ref(false)
const emojiBtnRef = ref<HTMLButtonElement | null>(null)
const emojiPanelRef = ref<HTMLDivElement | null>(null)
const taRef = ref<HTMLTextAreaElement | null>(null)
const frequentEmojis = [
  '😀',
  '😂',
  '😊',
  '😍',
  '😅',
  '😘',
  '😢',
  '👍',
  '🙏',
  '🎉',
  '🔥',
  '🤔',
  '😎',
  '🥰',
  '👏',
  '🤯',
  '🙌',
  '💪',
  '💖',
  '🤝',
  '🥲',
  '😴',
  '😇',
  '😡',
  '💯',
  '💀',
  '😜',
  '😏',
  '🫡',
  '🤤',
  '🤗',
  '🤭',
]

function toggleEmoji(): void {
  emojiOpen.value = !emojiOpen.value
}
function closeEmojiIfClickOutside(ev: MouseEvent): void {
  const p = emojiPanelRef.value,
    b = emojiBtnRef.value
  if (!p || !b) return
  const t = ev.target as Node
  if (!p.contains(t) && !b.contains(t)) emojiOpen.value = false
}
onMounted(() => document.addEventListener('mousedown', closeEmojiIfClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', closeEmojiIfClickOutside))

const selStart = ref(0),
  selEnd = ref(0)
function captureSelection(): void {
  const ta = taRef.value
  if (!ta) return
  selStart.value = ta.selectionStart ?? 0
  selEnd.value = ta.selectionEnd ?? 0
}
function insertEmoji(emoji: string): void {
  const ta = taRef.value
  const s = selStart.value,
    e = selEnd.value
  const v = draft.value
  draft.value = v.slice(0, s) + emoji + v.slice(e)
  nextTick(() => {
    if (ta) {
      const pos = s + emoji.length
      ta.focus()
      ta.setSelectionRange(pos, pos)
      captureSelection()
    }
  })
}
/** =========================== */

/** ========== API HELPERS (polling) ========== */
function mapApiMsg(m: ApiMessage): ChatMessage {
  return { id: m.id, user: m.username, text: m.message, created_at: m.created_at }
}
async function loadInitial(): Promise<void> {
  if (!copyTraderId.value) return
  const res = await apiRequest<ListResp>(`/copy-traders/${copyTraderId.value}/community?limit=50`)
  const mapped = (res.data ?? []).map(mapApiMsg)
  messages.value = mapped
  lastId = res.last_id ?? (mapped.length ? mapped[mapped.length - 1].id : null)
}
async function pollNew(): Promise<void> {
  if (!copyTraderId.value || lastId == null) return
  const res = await apiRequest<NewResp>(
    `/copy-traders/${copyTraderId.value}/community?after_id=${lastId}`,
  )
  const incoming = (res.data ?? []).map(mapApiMsg)
  if (incoming.length) {
    for (const m of incoming) messages.value.push(m)
    lastId = incoming[incoming.length - 1].id
  }
}
let lastNotifId: number | null = null
async function pollNotif(): Promise<void> {
  if (!copyTraderId.value) return
  const res = await apiRequest<NotifResp>(`/copy-traders/${copyTraderId.value}/notif-latest`)
  const row = res.data
  if (!row) return
  if (lastNotifId === null) {
    lastNotifId = row.id
    return
  }
  if (row.id !== lastNotifId) {
    lastNotifId = row.id
    const label = row.status === 2 ? 'Win' : row.status === 3 ? 'Lose' : 'Pending'
    modal.open('Transaksi Baru', `${row.username} • ${label} • Amount ${row.amount}`)
  }
}
/** ========================================== */

/** ========== LIFECYCLE ========== */
onMounted(async () => {
  try {
    await resolveCopyTraderId()
    if (!copyTraderId.value) return
    await loadInitial()
    pollHandle = window.setInterval(pollNew, POLL_MS)
    pollNotifHandle = window.setInterval(pollNotif, POLL_NOTIF_MS)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Gagal init chat'
    modal.open('Error', msg)
  }
})
onBeforeUnmount((): void => {
  if (pollHandle) clearInterval(pollHandle)
  if (pollNotifHandle) clearInterval(pollNotifHandle)
})
/** ============================= */

/** ========== SEND ========== */
async function handleSend(): Promise<void> {
  if (!canSend.value || sending.value || !copyTraderId.value) return
  try {
    sending.value = true
    const text = draft.value.trim()
    draft.value = ''

    const created = await apiRequest<ApiMessage>(`/copy-traders/${copyTraderId.value}/community`, {
      method: 'POST',
      body: JSON.stringify({ message: text }),
    })
    const mapped = mapApiMsg(created)
    messages.value.push(mapped)
    if (lastId == null || mapped.id > lastId) lastId = mapped.id
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Gagal mengirim pesan'
    modal.open('Error', msg)
  } finally {
    sending.value = false
  }
}
</script>
