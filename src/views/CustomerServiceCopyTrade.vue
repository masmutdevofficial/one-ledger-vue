<template>
  <div>
    <!-- Header -->
    <header
      class="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 border-b border-gray-200 -mt-5"
    >
      <!-- back button -->
      <button class="p-2 rounded-lg hover:bg-gray-100" @click="goBack" title="Kembali">
        <Icon icon="tabler:arrow-left" class="w-6 h-6 text-gray-700" />
      </button>

      <!-- centered title -->
      <div class="min-w-0 text-center pr-9">
        <p class="text-xs font-semibold text-gray-500 truncate">{{ adminName }}</p>
      </div>

      <!-- right status -->
      <div class="justify-self-end text-xs text-gray-400">
        <span v-if="polling"></span>
      </div>
    </header>

    <!-- Messages -->
    <section ref="scrollWrap" class="overflow-y-auto bg-gray-50">
      <div class="h-screen max-w-3xl mx-auto px-3 py-4">
        <div class="flex justify-center">
          <button
            class="text-xs px-3 py-1.5 rounded-full border hover:bg-white shadow-sm"
            :disabled="loading || messages.length >= currentLimit"
            @click="loadOlder"
            v-show="messages.length >= 1"
          >
            {{ loading ? 'Loading…' : 'Load older' }}
          </button>
        </div>

        <ul class="mt-3 space-y-3">
          <li
            v-for="m in messages"
            :key="m.id"
            class="flex"
            :class="m.isMine ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[85%] rounded-2xl px-3 py-2 shadow-sm"
              :class="
                m.isMine
                  ? 'bg-emerald-600 text-white rounded-br-sm'
                  : 'bg-white text-gray-900 rounded-bl-sm'
              "
            >
              <!-- Reply preview -->
              <div
                v-if="m.reply_to_message_id"
                class="mb-2 border-l-4 pl-2"
                :class="m.isMine ? 'border-white/50' : 'border-emerald-500/40'"
              >
                <div class="text-xs line-clamp-2 opacity-80">
                  <template v-if="m.reply_type === 'text'">
                    {{ m.reply_body }}
                  </template>
                  <template v-else-if="m.reply_type === 'image'"> (image) </template>
                  <template v-else-if="m.reply_type === 'file'"> (file) </template>
                </div>
              </div>

              <!-- Body -->
              <div v-if="m.type === 'text'" class="whitespace-pre-wrap text-sm">
                {{ m.body }}
              </div>

              <!-- Attachments -->
              <div
                v-if="m.attachments && m.attachments.length"
                class="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2"
              >
                <template v-for="(att, ai) in m.attachments" :key="ai">
                  <!-- Image preview -->
                  <button
                    v-if="att.isImage"
                    @click="openPreview(att.url)"
                    class="block relative border rounded-lg overflow-hidden group"
                  >
                    <img :src="att.url" class="w-full h-28 object-cover" />
                    <div
                      class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition"
                    ></div>
                  </button>

                  <!-- File item -->
                  <a
                    v-else
                    class="flex items-center gap-2 border rounded-lg p-2 hover:bg-gray-50"
                    :href="att.url"
                    target="_blank"
                  >
                    <Icon icon="tabler:file" class="w-5 h-5" />
                    <span class="text-xs truncate">{{ att.name }}</span>
                    <span class="text-[10px] text-gray-500 ml-auto">
                      {{ formatBytes(att.sizeBytes) }}
                    </span>
                  </a>
                </template>
              </div>

              <!-- Footer (meta + reply action) -->
              <div class="flex items-center gap-3 mt-1">
                <span class="text-[10px] opacity-70">
                  {{ formatTime(m.created_at) }}
                </span>
                <button
                  class="ml-auto text-[11px] opacity-75 hover:opacity-100 inline-flex items-center gap-1"
                  @click="beginReply(m)"
                >
                  <Icon icon="mdi:reply" class="w-3.5 h-3.5" />
                  Reply
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- Composer -->
    <footer
      class="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white shadow-md z-50"
    >
      <div class="max-w-3xl mx-auto px-3 py-3">
        <!-- Reply banner -->
        <div v-if="replyTo" class="mb-2 flex items-start gap-2 border rounded-xl p-2 bg-gray-50">
          <Icon icon="mdi:reply" class="w-4 h-4 text-emerald-600 mt-0.5" />
          <div class="min-w-0 flex-1">
            <div class="text-xs font-medium">Replying to #{{ replyTo.id }}</div>
            <div class="text-xs text-gray-600 line-clamp-2">
              <template v-if="replyTo.type === 'text'">{{ replyTo.body }}</template>
              <template v-else-if="replyTo.type === 'image'">(image)</template>
              <template v-else>(file)</template>
            </div>
          </div>
          <button @click="cancelReply" class="p-1 rounded hover:bg-gray-200/60">
            <Icon icon="mdi:close" class="w-4 h-4" />
          </button>
        </div>

        <!-- Composer box -->
        <div class="relative" :class="files.length ? '' : ''">
          <!-- Floating attachments preview (above textarea) -->
          <div
            v-if="files.length"
            class="absolute -top-20 left-0 right-0 flex gap-2 overflow-x-auto pb-1"
          >
            <div
              v-for="(f, i) in files"
              :key="i"
              class="flex w-50 items-center gap-2 border rounded-lg bg-white/90 shadow px-2 py-1"
            >
              <!-- Preview rule: show thumbnail if image AND previewable -->
              <template v-if="isPreviewableImage(f)">
                <img :src="previewUrlFor(i)" class="w-9 h-9 object-cover rounded" :alt="f.name" />
              </template>
              <template v-else>
                <Icon
                  :icon="f.type.startsWith('image/') ? 'tabler:photo' : 'tabler:file'"
                  class="w-6 h-6 text-gray-700"
                />
              </template>

              <div class="min-w-0">
                <div class="text-[11px] font-medium truncate max-w-[140px]">{{ f.name }}</div>
                <div class="text-[10px] text-gray-500">{{ formatBytes(f.size) }}</div>
              </div>

              <button class="p-1 hover:text-red-500" @click="removeFile(i)">
                <Icon icon="mdi:close" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="relative">
            <!-- Textarea -->
            <textarea
              v-model="draft"
              @keydown.enter.exact.prevent="send"
              placeholder="Tulis pesan…"
              class="w-full resize-none border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-10 pl-12 pr-14"
            />

            <!-- Tombol file (kiri, di dalam input) -->
            <label
              class="absolute left-2 top-1/2 pb-2 -translate-y-1/2 cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-xl hover:bg-gray-100"
              title="Lampirkan"
            >
              <input
                type="file"
                class="hidden"
                multiple
                @change="pickFiles"
                accept=".png,.jpg,.jpeg,.webp,.pdf,image/png,image/jpeg,image/webp,application/pdf"
              />
              <Icon icon="mdi:paperclip" class="w-5 h-5 text-gray-700" />
            </label>

            <!-- Tombol send (kanan, di dalam input) -->
            <button
              class="absolute right-2 top-5 -translate-y-1/2 inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
              :disabled="sending || (!draft.trim() && !files.length)"
              @click="send"
              title="Kirim"
            >
              <Icon v-if="!sending" icon="mdi:send" class="w-5 h-5" />
              <svg v-else class="animate-spin w-5 h-5" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                  fill="none"
                  opacity=".2"
                />
                <path
                  d="M22 12a10 10 0 0 1-10 10"
                  stroke="currentColor"
                  stroke-width="4"
                  fill="none"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>

    <!-- Image Preview -->
    <div
      v-if="previewUrl"
      class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      @click.self="previewUrl = ''"
    >
      <img :src="previewUrl" class="max-h-full max-w-full rounded-lg shadow-2xl" />
      <button class="absolute top-4 right-4 text-white" @click="previewUrl = ''">
        <Icon icon="mdi:close" class="w-7 h-7" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter, useRoute } from 'vue-router'
import { useApiAlertStore } from '@/stores/apiAlert'

/** ================== Config ================== */
const API_BASE =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE ??
  'https://one-ledger.masmutpanel.my.id/api'
const POLL_MS = 3500
const PAGE_STEP = 50
const MAX_LIMIT = 200

const router = useRouter()
const route = useRoute()
const modal = useApiAlertStore()

/** ================== State ================== */
// ---- Types ----
type RawMsg = {
  id: number
  id_users_sender: number
  sender_display_name: string
  body: string | null
  type: 'text' | 'image' | 'file'
  reply_to_message_id: number | null
  created_at: string
  reply_body?: string | null
  reply_type?: 'text' | 'image' | 'file' | null
  attachments?: string | null // GC concat dari backend
}

type ViewAttachment = {
  name: string
  url: string
  mime: string
  sizeBytes: number
  isImage: boolean
}

type ViewMsg = Omit<RawMsg, 'attachments'> & {
  isMine: boolean
  attachments: ViewAttachment[]
}

const chatId = ref<number | null>(null) // <-- thread_id (hasil resolve)
const copyTraderId = ref<number | null>(null) // <-- dari URL /chats/:copyTraderId
const myUserId = ref<number | null>(null)

const messages = ref<ViewMsg[]>([])
const currentLimit = ref<number>(PAGE_STEP)
const loading = ref(false)
const sending = ref(false)
const polling = ref(false)
const draft = ref('')
const files = ref<File[]>([])
const replyTo = ref<ViewMsg | null>(null)
const scrollWrap = ref<HTMLElement | null>(null)
const previewUrl = ref('')

let pollTimer: ReturnType<typeof setInterval> | null = null

// === Limits & allowed types ===
const MAX_FILES = 3
const MAX_FILE_BYTES = 2 * 1024 * 1024 // 2 MB

const ALLOWED_IMAGE_MIME = new Set([
  'image/png',
  'image/jpeg', // jpg/jpeg
  'image/jpg',
  'image/webp',
])
const ALLOWED_FILE_MIME = new Set(['application/pdf'])

function isAllowedMime(f: File) {
  const m = (f.type || '').toLowerCase()
  if (ALLOWED_IMAGE_MIME.has(m)) return true
  if (ALLOWED_FILE_MIME.has(m)) return true
  return false
}

/** ================== Header helpers ================== */
const csName = ref<string>('')

async function fetchCsName() {
  if (!copyTraderId.value) return
  const res = await fetch(`${API_BASE}/chat-copy-trader/cs-name/${copyTraderId.value}`, {
    headers: authHeaders(),
    credentials: 'include',
  })
  if (!res.ok) return
  const j: { cs_name: string } = await res.json()
  csName.value = j.cs_name || ''
}

const adminName = computed(() => csName.value)

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}

/** ================== Utils ================== */
function authHeaders() {
  const token = localStorage.getItem('token') || ''
  return {
    Authorization: token ? `Bearer ${token}` : '',
    Accept: 'application/json',
  }
}

// Laravel Sanctum default: /api/get-account-data → user auth
async function fetchMe() {
  const res = await fetch(`${API_BASE}/get-account-data`, {
    headers: authHeaders(),
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const me = await res.json()
  myUserId.value = Number(me.id)
}

async function ensureChatByCopyTrader() {
  const idParam = route.params.threadId || route.params.copyTraderId || route.params.id
  const parsed = Number(Array.isArray(idParam) ? idParam[0] : idParam)
  if (!parsed || Number.isNaN(parsed)) throw new Error('copy_trader_id tidak valid di URL')
  copyTraderId.value = parsed

  const url = `${API_BASE}/chat-copy-trader/me/chat?copy_trader_id=${copyTraderId.value}`
  const res = await fetch(url, { headers: authHeaders(), credentials: 'include' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const j: { id: number; id_users_customer: number } = await res.json()
  chatId.value = j.id // <-- ini thread_id
  myUserId.value = myUserId.value ?? j.id_users_customer
}

function parseAttachments(s: string | null | undefined): ViewAttachment[] {
  if (!s) return []
  return s
    .split(';;')
    .filter(Boolean)
    .map((chunk) => {
      const [name, storage_path, mime, size] = chunk.split('|')
      const url = storage_path?.startsWith('http')
        ? storage_path
        : `https://one-ledger.masmutpanel.my.id/storage/${storage_path}`
      const sizeBytes = Number(size || 0)
      const isImage = (mime || '').startsWith('image/')
      return { name, url, mime, sizeBytes, isImage }
    })
}

function toViewMsg(raw: RawMsg): ViewMsg {
  return {
    ...raw,
    isMine: myUserId.value !== null && raw.id_users_sender === myUserId.value,
    attachments: parseAttachments(raw.attachments),
  }
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
  })
}
function formatBytes(n: number) {
  if (!n) return '0 B'
  const k = 1024,
    units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(n) / Math.log(k))
  return `${(n / Math.pow(k, i)).toFixed(i ? 1 : 0)} ${units[i]}`
}

function openPreview(url: string) {
  previewUrl.value = url
}

/** ---- Local previews for composer (JPEG/WEBP) ---- */
const objectUrls = ref<string[]>([]) // per index in files
function isPreviewableImage(f: File) {
  const m = (f.type || '').toLowerCase()
  return m === 'image/jpeg' || m === 'image/jpg' || m === 'image/webp'
}
function rebuildObjectUrls() {
  for (const u of objectUrls.value) URL.revokeObjectURL(u)
  objectUrls.value = files.value.map((f) => (isPreviewableImage(f) ? URL.createObjectURL(f) : ''))
}
function previewUrlFor(i: number) {
  return objectUrls.value[i] || ''
}
watch(files, rebuildObjectUrls, { deep: true })
onUnmounted(() => {
  for (const u of objectUrls.value) URL.revokeObjectURL(u)
})

/** ================== API ================== */

async function fetchMessages(limit = currentLimit.value) {
  if (!chatId.value) return
  loading.value = true
  try {
    const url = `${API_BASE}/chat-copy-trader/me/messages?thread_id=${chatId.value}&limit=${Math.min(
      limit,
      MAX_LIMIT,
    )}`
    const res = await fetch(url, { headers: authHeaders(), credentials: 'include' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const j: { data: RawMsg[] } = await res.json()
    messages.value = j.data.map(toViewMsg)
  } finally {
    loading.value = false
  }
}

function startPolling() {
  stopPolling()
  pollTimer = setInterval(async () => {
    try {
      polling.value = true
      await fetchMessages(currentLimit.value)
    } catch {
      // ignore
    } finally {
      polling.value = false
    }
  }, POLL_MS)
}
function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

async function loadOlder() {
  const wrap = scrollWrap.value
  const anchor = wrap ? wrap.scrollHeight - wrap.scrollTop : 0
  currentLimit.value = Math.min(currentLimit.value + PAGE_STEP, MAX_LIMIT)
  await fetchMessages(currentLimit.value)
  await nextTick()
  if (wrap) wrap.scrollTop = Math.max(0, wrap.scrollHeight - anchor)
}

/** ================== Actions ================== */
function pickFiles(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files) return

  const selected = Array.from(input.files)
  input.value = ''
  const errors: string[] = []

  const slotsLeft = Math.max(0, MAX_FILES - files.value.length)
  if (slotsLeft <= 0) {
    modal.open('Error', `You can attach up to ${MAX_FILES} files per message.`)
    return
  }

  let added = 0
  for (const f of selected) {
    if (added >= slotsLeft) {
      errors.push(`Only up to ${MAX_FILES} files can be attached at once.`)
      break
    }
    if (f.size > MAX_FILE_BYTES) {
      errors.push(`"${f.name}" exceeds the 2 MB size limit.`)
      continue
    }
    if (!isAllowedMime(f)) {
      errors.push(
        `"${f.name}" is not an allowed file type. Only PNG, JPG, JPEG, WEBP images, or PDF are allowed.`,
      )
      continue
    }
    files.value.push(f)
    added++
  }

  if (errors.length) {
    const uniq = Array.from(new Set(errors))
    modal.open('Error', uniq.join('\n'))
  }
}

function removeFile(i: number) {
  files.value.splice(i, 1)
}

function beginReply(m: ViewMsg) {
  replyTo.value = m
}
function cancelReply() {
  replyTo.value = null
}

async function send() {
  if (!chatId.value) {
    modal.open('Error', 'Chat belum siap (thread belum dibuat).')
    return
  }
  // … validasi file/text seperti sebelumnya …

  const fd = new FormData()
  let type: 'text' | 'image' | 'file' = 'text'
  if (files.value.length) {
    const allImg = files.value.every((f) => f.type.startsWith('image/'))
    type = allImg && !draft.value.trim() ? 'image' : 'file'
  }
  fd.append('thread_id', String(chatId.value)) // <-- kirim thread_id yang valid
  fd.append('type', type)
  if (draft.value.trim()) fd.append('message', draft.value)
  if (replyTo.value) fd.append('reply_to_message_id', String(replyTo.value.id))
  files.value.forEach((f) => fd.append('files[]', f))

  const res = await fetch(`${API_BASE}/chat-copy-trader/me/messages`, {
    method: 'POST',
    headers: { ...authHeaders() },
    credentials: 'include',
    body: fd,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  await res.json()
  // reset & refresh
  draft.value = ''
  files.value = []
  replyTo.value = null
  await fetchMessages(currentLimit.value)
}

/** ================== Lifecycle ================== */
onMounted(async () => {
  await fetchMe() // dapatkan myUserId
  await ensureChatByCopyTrader() // resolve copy_trader_id -> thread_id
  await fetchMessages(currentLimit.value)
  await fetchCsName()
  startPolling()
})
onUnmounted(() => stopPolling())
</script>

<style scoped>
/* kecilin scrollbar area chat */
section::-webkit-scrollbar {
  width: 10px;
}
section::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}
section::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.15);
}
</style>
