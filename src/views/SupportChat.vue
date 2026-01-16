<!-- eslint-disable @typescript-eslint/no-unused-expressions -->
<template>
  <div class=" h-full flex flex-col bg-white">
    <!-- Header -->
    <header class="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-md px-4 py-3 flex items-center gap-3">
      <button
        class="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition"
        aria-label="Back"
        @click="goBack"
      >
        <Icon icon="mdi:arrow-left" class="size-6" />
      </button>

      <div class="relative">
        <div class="size-9 rounded-full grid place-items-center bg-yellow-100">
          <Icon icon="mdi:robot-happy-outline" class="size-5 text-yellow-700" />
        </div>
      </div>

      <div class="leading-tight">
        <h1 class="text-base font-medium">Oneledger Assistant</h1>
        <p class="text-xs text-gray-500">Ask me anything</p>
      </div>
    </header>

    <!-- Messages -->
    <main ref="chatEl" class="mt-3 flex-1 overflow-y-auto px-4 pt-4 pb-2 space-y-3">
      <!-- Loading skeleton -->
      <template v-if="isLoading">
        <div class="flex justify-start">
          <div class="w-2/3 h-14 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
        <div class="flex justify-end">
          <div class="w-1/2 h-10 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
        <div class="flex justify-start">
          <div class="w-3/4 h-16 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </template>

      <template v-else>
        <div
          v-for="m in messages"
          :key="m.id"
          class="flex"
          :class="m.sender === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-[85%] rounded-2xl px-3 py-2 relative"
            :id="`msg-${m.id}`"
            :class="[
              m.sender === 'user' ? 'bg-black text-white' : 'bg-gray-100 text-gray-900',
              highlightedIds.has(String(m.id)) ? 'ring-2 ring-yellow-400' : ''
            ]"
          >
            <!-- Reply context inside bubble -->
            <div
              v-if="m.replyTo"
              class="mb-1 border-l-2 pl-2 text-xs opacity-80 cursor-pointer hover:underline"
              @click.stop="m.replyTo?.refId && jumpToMessage(m.replyTo.refId)"
              title="Jump to replied message"
            >
              Replying to {{ m.replyTo.sender === 'user' ? 'you' : 'assistant' }}:
              {{ m.replyTo.textSnippet }}
            </div>
            <!-- Text -->
            <p v-if="m.text" class="whitespace-pre-line break-words">
              {{ m.text }}
            </p>

            <!-- Attachments inside bubble -->
            <div v-if="m.attachments?.length" class="mt-2 grid gap-2" :class="attachmentsGridColsClass(m.attachments.length)">
              <template v-for="a in m.attachments" :key="a.id">
                <!-- Image preview -->
                <img
                  v-if="a.type === 'image'"
                  :src="a.url"
                  :alt="a.name"
                  class="w-28 h-28 object-cover rounded-lg border border-black/10 cursor-pointer"
                  @click.stop="openAttachment(a)"
                />
                <!-- PDF tile -->
                <div
                  v-else
                  class="w-28 h-28 rounded-lg border border-black/10 bg-white/70 grid place-items-center text-center p-2 cursor-pointer"
                  @click.stop="openAttachment(a)"
                >
                  <Icon icon="mdi:file-pdf-box" class="size-8 text-red-500" />
                  <p class="text-[11px] mt-1 line-clamp-2">{{ a.name }}</p>
                </div>
              </template>
            </div>

            <!-- time + ticks (bottom-right inside bubble) -->
            <div
              class="mt-1 flex items-center gap-1 text-[10px] leading-none"
              :class="m.sender === 'user' ? 'justify-end text-white/70' : 'justify-end text-gray-500'"
            >
              <span>{{ formatTime(m.createdAt) }}</span>
              <span v-if="m.sender === 'user'">
                <Icon
                  v-if="m.status === 'sent'"
                  icon="mdi:check"
                  class="size-3.5 align-middle text-white/70"
                />
                <Icon
                  v-else-if="m.status === 'delivered'"
                  icon="mdi:check-all"
                  class="size-3.5 align-middle text-white/70"
                />
                <Icon
                  v-else
                  icon="mdi:check-all"
                  class="size-3.5 align-middle text-sky-500"
                />
              </span>
            </div>
            <div
              class="mt-0.5 text-[11px]"
              :class="m.sender === 'user' ? 'text-white/70 text-right' : 'text-gray-600 text-left'"
            >
              <button type="button" class="hover:underline cursor-pointer" @click.stop="startReply(m)">
                Reply
              </button>
            </div>
          </div>
        </div>
      </template>
    </main>

    <!-- Previews (to be sent) -->
    <section v-if="pending.length" class="px-4 pb-2">
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(p, idx) in pending"
          :key="p.id"
          class="relative border border-gray-200 rounded-lg"
        >
          <img
            v-if="p.type === 'image'"
            :src="p.url"
            :alt="p.name"
            class="w-24 h-24 object-cover rounded-lg"
          />
          <div
            v-else
            class="w-24 h-24 rounded-lg grid place-items-center p-2 bg-gray-50"
          >
            <Icon icon="mdi:file-pdf-box" class="size-8 text-red-500" />
            <p class="text-[10px] text-gray-600 text-center line-clamp-2 mt-1">{{ p.name }}</p>
          </div>

          <button
            type="button"
            class="absolute -top-2 -right-2 size-6 rounded-full grid place-items-center
                   bg-black text-white shadow hover:opacity-90 active:scale-95"
            aria-label="Remove"
            @click="removePending(idx)"
          >
            <Icon icon="mdi:close" class="size-4" />
          </button>
        </div>
      </div>

      <p v-if="errorMsg" class="text-[12px] text-red-600 mt-1">{{ errorMsg }}</p>
    </section>

    <!-- Composer -->
    <form class="sticky bottom-0 bg-white border-t border-gray-200 shadow-md px-4 py-3" @submit.prevent="send">
      <!-- Reply bar -->
      <div v-if="replyTo" class="mb-2 text-xs text-gray-700 bg-gray-100 rounded p-2 flex items-center justify-between">
        <div>
          Replying to {{ replyTo.sender === 'user' ? 'you' : 'assistant' }}:
          <strong>{{ replyTo.textSnippet }}</strong>
        </div>
        <button type="button" class="ml-2 text-gray-500" @click="replyTo = null" aria-label="Cancel reply">×</button>
      </div>
      <div class="flex items-center gap-2">
        <!-- Input + plus button inside -->
        <div class="relative w-full">
          <input
            v-model="draft"
            type="text"
            autocomplete="off"
            placeholder="Search or ask question"
            class="w-full rounded-2xl bg-gray-100 px-4 py-3 pr-14 outline-none border border-transparent
                   focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-200 transition"
          />

          <!-- Plus -->
          <button
            type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 size-8 rounded-full grid place-items-center
                   bg-yellow-400 text-white shadow hover:brightness-95 active:scale-95 transition"
            aria-label="Add"
            @click="pickFiles"
          >
            <Icon icon="mdi:plus" class="size-5" />
          </button>

          <!-- Hidden file input -->
          <input
            ref="fileEl"
            type="file"
            class="hidden"
            multiple
            :accept="ACCEPT"
            @change="onFileChange"
          />
        </div>

        <!-- Send (outside input, right side) -->
        <button
          type="submit"
          class="h-11 px-4 rounded-xl grid place-items-center
                 bg-black text-white shadow hover:opacity-90 active:scale-95 transition
                 disabled:opacity-40"
          :disabled="isSendDisabled"
          aria-label="Send"
        >
          <Icon icon="mdi:send" class="size-5" />
        </button>
      </div>
    </form>

    <!-- Attachment Preview Modal -->
    <div
      v-if="isPreviewOpen"
      class="fixed inset-0 z-50 grid place-items-center bg-black/30 backdrop-blur-sm"
      @click="closePreview"
    >
      <div class="max-w-[92vw] max-h-[88vh] bg-white rounded-lg shadow-xl overflow-hidden" @click.stop>
        <div class="flex items-center justify-between px-4 py-2 border-b border-black/10">
          <div class="text-sm font-medium truncate max-w-[70vw]">{{ previewName }}</div>
          <button class="text-gray-600 hover:text-black px-2 py-1" @click="closePreview" aria-label="Close">✕</button>
        </div>
        <div class="p-2">
          <img v-if="previewType === 'image'" :src="previewUrl" :alt="previewName" class="max-w-[88vw] max-h-[78vh] object-contain" />
          <iframe v-else-if="previewType === 'pdf'" :src="previewUrl" class="w-[88vw] h-[78vh]" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onUnmounted, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'

type Sender = 'user' | 'bot'
type MsgStatus = 'sent' | 'delivered' | 'read'

interface AttachmentPreview {
  id: string
  name: string
  type: 'image' | 'pdf'
  size: number
  url: string // ObjectURL or server URL
  file?: File // present for unsent attachments
}

interface Message {
  id: string
  sender: Sender
  text?: string
  attachments?: AttachmentPreview[]
  status?: MsgStatus // hanya untuk 'user'
  createdAt: Date
  // optional reply context (client-side)
  replyTo?: { sender: Sender; textSnippet: string; refId?: number }
}

const router = useRouter()
const chatEl = ref<HTMLElement | null>(null)
const draft = ref('')
const pending = ref<AttachmentPreview[]>([])
const errorMsg = ref('')
const isLoading = ref(true)
const unreadCount = ref(0)
const conversationId = ref<number | null>(null)
const pollTimer = ref<number | null>(null)

const API_BASE = import.meta.env.VITE_API_BASE ?? 'https://abc.oneled.io/api'
const API_ORIGIN = API_BASE.replace(/\/?api\/?$/, '')
const CDN_BASE = (import.meta.env.VITE_CDN_URL as string | undefined) ?? 'https://cdn.one-led.io'

const fileEl = ref<HTMLInputElement | null>(null)
const MAX_FILES = 3
const MAX_SIZE = 2 * 1024 * 1024 // 2MB
const ACCEPT = '.pdf,.jpeg,.jpg,.webp,.png'

const messages = ref<Message[]>([])
const highlightedIds = ref<Set<string>>(new Set())

// Attachment preview modal state
const isPreviewOpen = ref(false)
const previewType = ref<'image' | 'pdf' | null>(null)
const previewUrl = ref('')
const previewName = ref('')

const isSendDisabled = computed(() => !draft.value.trim() && pending.value.length === 0)

// Reply state (selected message to reply to)
const replyTo = ref<{ sender: Sender; textSnippet: string } | null>(null)
const replyTargetId = ref<number | null>(null)

// Persisted reply context per message id and pending patches to reconcile after reload
const replyContextById = ref<Record<string, { sender: Sender; textSnippet: string }>>({})
const pendingReplyPatches = ref<Array<{
  text: string
  attNames: string[]
  reply: { sender: Sender; textSnippet: string }
  ts: number
}>>([])

/* ====== Actions ====== */
function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}

function pickFiles() {
  errorMsg.value = ''
  fileEl.value?.click()
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return

  const incoming = Array.from(input.files)
  const toAppend: AttachmentPreview[] = []

  for (const f of incoming) {
    if (!isAllowedType(f)) {
      errorMsg.value = 'Format tidak didukung. Gunakan: pdf, jpeg, jpg, webp, png.'
      continue
    }
    if (f.size > MAX_SIZE) {
      errorMsg.value = 'Ukuran file maksimal 2 MB per file.'
      continue
    }
    if (pending.value.length + toAppend.length >= MAX_FILES) {
      errorMsg.value = `Maksimal ${MAX_FILES} file.`
      break
    }

    const url = URL.createObjectURL(f)
    toAppend.push({
      id: uid(),
      name: f.name,
      size: f.size,
      type: f.type === 'application/pdf' ? 'pdf' : 'image',
      url,
      file: f,
    })
  }

  pending.value.push(...toAppend)
  input.value = '' // reset agar pemilihan file sama bisa diulang
}

function removePending(idx: number) {
  const item = pending.value[idx]
  if (item) URL.revokeObjectURL(item.url)
  pending.value.splice(idx, 1)
}

async function send() {
  const text = draft.value.trim()
  if (!text && pending.value.length === 0) return
  if (!conversationId.value) {
    await ensureConversation()
    if (!conversationId.value) return
  }

  const optimistic: Message = {
    id: uid(),
    sender: 'user',
    text: text || undefined,
    attachments: pending.value.length ? [...pending.value] : undefined,
    status: 'sent',
    createdAt: new Date(),
    replyTo: replyTo.value || undefined,
  }
  messages.value.push(optimistic)
  const oldPending = [...pending.value]
  draft.value = ''
  replyTo.value = null
  replyTargetId.value = null
  nextTick(scrollToBottom)

  try {
    // Create a pending patch so reply context is restored after reloading from server
    const patchReply = optimistic.replyTo
    if (patchReply) {
      pendingReplyPatches.value.push({
        text: optimistic.text || '',
        attNames: (optimistic.attachments || []).map(a => a.name || '').filter(Boolean),
        reply: patchReply,
        ts: Date.now(),
      })
    }

    const fd = new FormData()
    if (text) fd.append('message', text)

    let type: 'text' | 'image' | 'file' = 'text'
    if (oldPending.length) {
      const anyImage = oldPending.some((p) => p.type === 'image')
      type = anyImage ? 'image' : 'file'
      for (const p of oldPending) {
        if (p.file) fd.append('files[]', p.file, p.name)
      }
    }
    fd.append('type', type)
    if (replyTargetId.value) fd.append('reply_to_message_id', String(replyTargetId.value))

    await apiHttp('/cs/me/messages', { method: 'POST', body: fd })
    await loadMessages()
    unreadCount.value = 0
  } catch (e) {
    console.error('send fail', e)
    errorMsg.value = (e as Error)?.message || 'Failed to send'
  } finally {
    clearPendingBlobs()
  }
}

/* ====== Helpers ====== */
function isAllowedType(f: File) {
  const t = f.type
  if (t === 'application/pdf') return true
  if (t === 'image/jpeg' || t === 'image/png' || t === 'image/webp') return true
  // fallback cek ekstensi
  const ext = f.name.split('.').pop()?.toLowerCase()
  return ['pdf', 'jpeg', 'jpg', 'png', 'webp'].includes(ext || '')
}

function formatTime(d: Date) {
  const hh = d.getHours().toString().padStart(2, '0')
  const mm = d.getMinutes().toString().padStart(2, '0')
  return `${hh}:${mm}`
}

function uid() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

function clearPendingBlobs() {
  for (const p of pending.value) URL.revokeObjectURL(p.url)
  pending.value = []
}

function scrollToBottom() {
  const el = chatEl.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

function truncate(text: string, len: number) {
  if (!text) return ''
  return text.length > len ? text.slice(0, len) + '…' : text
}

function startReply(m: Message) {
  const firstAtt = m.attachments && m.attachments.length ? m.attachments[0] : undefined
  const text = m.text || (firstAtt ? firstAtt.name || firstAtt.type : '') || ''
  replyTo.value = { sender: m.sender, textSnippet: truncate(text, 24) }
  replyTargetId.value = Number(m.id) || null
}

function jumpToMessage(refId: number) {
  if (!refId) return
  const el = document.getElementById(`msg-${refId}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    highlightedIds.value.add(String(refId))
    window.setTimeout(() => {
      highlightedIds.value.delete(String(refId))
    }, 1200)
  }
}

function openAttachment(a: AttachmentPreview) {
  previewType.value = a.type
  previewUrl.value = a.url
  previewName.value = a.name
  isPreviewOpen.value = true
}

function closePreview() {
  isPreviewOpen.value = false
  previewType.value = null
  previewUrl.value = ''
  previewName.value = ''
}

function attachmentsGridColsClass(count: number) {
  // Map to explicit Tailwind classes to avoid purge issues
  return {
    'grid-cols-1': count === 1,
    'grid-cols-2': count === 2,
    'grid-cols-3': count >= 3,
  }
}

// simulateDelivery removed (now using real backend)

onUnmounted(() => {
  // bersihkan objectURL jika ada yang tersisa
  for (const p of pending.value) URL.revokeObjectURL(p.url)
  if (pollTimer.value) window.clearInterval(pollTimer.value)
})

/* ====== Backend integration ====== */
function getUserId(): number | null {
  try {
    const raw = localStorage.getItem('id')
    const n = Number(raw)
    return Number.isFinite(n) && n > 0 ? n : null
  } catch { return null }
}

async function apiHttp<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token')?.trim() ?? ''
  if (!token) throw new Error('Unauthorized')

  const headers = new Headers(init?.headers || undefined)
  headers.set('Accept', 'application/json')
  headers.set('Authorization', `Bearer ${token}`)

  const isForm = typeof FormData !== 'undefined' && init?.body instanceof FormData
  if (!isForm && init?.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const msg = (json && typeof json === 'object' && (json as any).message) ? (json as any).message : `HTTP ${res.status}`
    throw new Error(msg)
  }
  return json as T
}

async function ensureConversation() {
  if (conversationId.value) return conversationId.value
  const chat = await apiHttp<{ id: number }>('/cs/me/chat', { method: 'GET' })
  conversationId.value = Number(chat?.id)
  return conversationId.value
}

interface CsMessageItem {
  id: number
  id_users_sender: number
  body: string | null
  type: 'text' | 'image' | 'file'
  reply_to_message_id: number | null
  created_at: string
  attachments?: string | null
}

function parseAttachments(raw?: string | null): AttachmentPreview[] | undefined {
  if (!raw) return undefined
  const out: AttachmentPreview[] = []
  for (const row of raw.split(';;')) {
    if (!row) continue
    const parts = row.split('|')
    const oname = parts[0] || 'file'
    const spath = parts[1] || ''
    const mime = parts[2] || 'application/octet-stream'
    const size = Number(parts[3] || 0)
    if (!spath) continue

    const normalized = String(spath).replace(/^\/+/, '')
    const url = normalized.startsWith('http://') || normalized.startsWith('https://')
      ? normalized
      : normalized.startsWith('uploads/')
        ? `${CDN_BASE.replace(/\/+$/, '')}/${normalized}`
        : `${API_ORIGIN}/storage/${normalized}`

    out.push({
      id: uid(),
      name: oname,
      type: mime.startsWith('image/') ? 'image' : 'pdf',
      size,
      url,
    })
  }
  return out.length ? out : undefined
}

function mapServerMessage(m: CsMessageItem, me: number): Message {
  return {
    id: String(m.id),
    sender: Number(m.id_users_sender) === me ? 'user' : 'bot',
    text: m.body || undefined,
    attachments: parseAttachments(m.attachments),
    status: Number(m.id_users_sender) === me ? 'read' : undefined,
    createdAt: new Date(m.created_at),
    replyTo: undefined,
  }
}

async function loadMessages() {
  const me = getUserId() || 0
  const res = await apiHttp<{ data: CsMessageItem[] }>(`/cs/me/messages?limit=50`, { method: 'GET' })
  const rows = Array.isArray(res?.data) ? res.data : []
  const mapped = rows.map((m) => mapServerMessage(m, me))

  // Link reply contexts when referenced message is within the batch
  const mappedById = new Map<number, Message>(mapped.map(mm => [Number(mm.id), mm]))
  for (const item of rows) {
    const refId = item.reply_to_message_id ? Number(item.reply_to_message_id) : 0
    if (!refId) continue
    const msg = mappedById.get(Number(item.id))
    if (!msg) continue

    const refMsg = mappedById.get(refId)
    if (refMsg) {
      const firstAtt = refMsg.attachments && refMsg.attachments.length ? refMsg.attachments[0] : undefined
      const snippet = refMsg.text || (firstAtt ? firstAtt.name || firstAtt.type : '') || ''
      msg.replyTo = { sender: refMsg.sender, textSnippet: truncate(snippet, 24), refId }
    } else {
      const snippet = item.body || ''
      msg.replyTo = { sender: 'bot', textSnippet: truncate(snippet, 24), refId }
    }
  }

  // Rehydrate any known reply contexts by message id (fallback/persist)
  for (const msg of mapped) {
    const ctx = replyContextById.value[msg.id]
    if (ctx) msg.replyTo = ctx
  }
  messages.value = mapped
  // Attempt to match and persist reply context for the last sent message if pending
  applyPendingReplyPatches()
  await nextTick()
  scrollToBottom()
}

function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
  return true
}

function applyPendingReplyPatches() {
  if (!pendingReplyPatches.value.length || !messages.value.length) return
  const now = Date.now()
  // Try to match most recent user messages first
  const userMessages = messages.value.filter(m => m.sender === 'user').slice().reverse()
  const remaining: typeof pendingReplyPatches.value = []
  for (const patch of pendingReplyPatches.value) {
    // Expire patches older than 2 minutes to avoid wrong matches
    if (now - patch.ts > 2 * 60 * 1000) continue
    const match = userMessages.find(m => {
      const names = (m.attachments || []).map(a => a.name || '').filter(Boolean)
      return (m.text || '') === patch.text && arraysEqual(names, patch.attNames)
    })
    if (match) {
      replyContextById.value[match.id] = patch.reply
      match.replyTo = patch.reply
    } else {
      remaining.push(patch)
    }
  }
  pendingReplyPatches.value = remaining
}

async function fetchUnread() {
  const res = await apiHttp<{ data: Array<{ unread?: number }> }>('/cs/me/unread', { method: 'GET' })
  const rows = Array.isArray(res?.data) ? res.data : []
  unreadCount.value = rows.reduce((acc, r) => acc + Number(r?.unread || 0), 0)
}

async function init() {
  isLoading.value = true
  try {
    await ensureConversation()
    await loadMessages()
    unreadCount.value = 0
    // Poll every 15s
    pollTimer.value = window.setInterval(async () => {
      await loadMessages()
      unreadCount.value = 0
    }, 15000)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => { init() })
</script>
