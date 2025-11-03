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

const BASE = 'https://api-chat-oneled.masmut.dev'
const SERVICE_KEY = 'Frontera'

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
    const uploaded = oldPending.length
      ? await Promise.all(oldPending.map(up => uploadFile(up)))
      : []
    const atts = uploaded.map(u => ({ type: u.type, url: u.url, file_name: u.name, mime_type: u.mime }))
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
    await svcHttp(`/svc/conversations/${conversationId.value}/messages`, {
      method: 'POST',
      body: JSON.stringify({ body: text || undefined, replyToMessageId: replyTargetId.value ?? undefined, attachments: atts })
    })
    await loadMessages()
    await markRead()
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

async function svcHttp<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const userId = getUserId()
  if (!userId) throw new Error('User id not found in localStorage')
  const headers: Record<string, string> = { 'x-service-key': SERVICE_KEY, 'x-user-id': String(userId) }
  const extra = init?.headers
  if (extra instanceof Headers) {
    extra.forEach((v, k) => { headers[k] = v })
  } else if (Array.isArray(extra)) {
    for (const [k, v] of extra) headers[k] = v
  } else if (extra && typeof extra === 'object') {
    Object.assign(headers, extra as Record<string, string>)
  }
  const hasBody = typeof init?.body === 'string'
  if (hasBody && !headers['Content-Type']) headers['Content-Type'] = 'application/json'
  const res = await fetch(`${BASE}${path}`, { ...init, headers })
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try { const j = await res.json(); if (j && j.message) msg = j.message } catch {}
    throw new Error(msg)
  }
  const json = await res.json()
  if (json && json.status === 'success' && 'data' in json) return json.data as T
  return json as T
}

async function uploadFile(p: AttachmentPreview): Promise<{ url: string; name: string; mime: string; type: 'image' | 'pdf' }> {
  if (!p.file) return { url: p.url, name: p.name, mime: p.type === 'image' ? 'image/*' : 'application/pdf', type: p.type }
  const fd = new FormData()
  fd.append('file', p.file)
  const res = await fetch(`${BASE}/api/uploads`, { method: 'POST', body: fd })
  if (!res.ok) throw new Error('Upload failed')
  const json = await res.json().catch(() => null)
  const item = Array.isArray(json?.data) ? json.data[0] : json?.data
  if (!item?.url) throw new Error('Invalid upload response')
  return { url: item.url, name: item.file_name || p.name, mime: item.mime_type || 'application/octet-stream', type: p.type }
}

async function ensureConversation() {
  if (conversationId.value) return conversationId.value
  const data = await svcHttp<Array<{ id: number }>>('/svc/conversations/direct', { method: 'POST' })
  const id = Array.isArray(data) ? data[0]?.id : undefined
  conversationId.value = Number(id)
  return conversationId.value
}

interface SvcAttachment { type: 'image' | 'pdf'; url: string; file_name?: string | null; mime_type?: string | null; byte_size?: number | null }
interface SvcMessageItem { id: number; conversation_id: number; sender_id: number | null; body: string | null; reply_to_message_id: number | null; created_at: string; attachments?: SvcAttachment[] }

function mapServerMessage(m: SvcMessageItem, me: number): Message {
  const attachments: AttachmentPreview[] | undefined = Array.isArray(m.attachments) && m.attachments.length
    ? m.attachments.map((a) => ({ id: uid(), name: a.file_name || 'file', type: a.type, size: a.byte_size || 0, url: a.url }))
    : undefined
  return {
    id: String(m.id),
    sender: m.sender_id && Number(m.sender_id) === me ? 'user' : 'bot',
    text: m.body || undefined,
    attachments,
    createdAt: new Date(m.created_at)
  }
}

async function loadMessages() {
  if (!conversationId.value) await ensureConversation()
  const me = getUserId() || 0
  const rows = await svcHttp<SvcMessageItem[]>(`/svc/conversations/${conversationId.value}/messages?limit=50`)
  const mapped = rows.slice().reverse().map((m) => mapServerMessage(m, me))
  // Link server-side reply contexts when referenced message is within the batch
  const byId = new Map(rows.map(r => [Number(r.id), r]))
  for (let i = 0; i < mapped.length; i++) {
    const original = rows[rows.length - 1 - i]
    if (!original) continue
    if (original.reply_to_message_id) {
      const ref = byId.get(Number(original.reply_to_message_id))
      if (ref) {
        const firstAtt = (ref.attachments || [])[0]
        const snippet = ref.body || (firstAtt ? firstAtt.file_name || firstAtt.type : '') || ''
          mapped[i].replyTo = { sender: ref.sender_id && Number(ref.sender_id) === me ? 'user' : 'bot', textSnippet: truncate(snippet, 24), refId: Number(original.reply_to_message_id) }
      }
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
  const rows = await svcHttp<Array<{ conversation_id: number; unread: number }>>('/svc/unread')
  unreadCount.value = rows.reduce((acc, r) => acc + Number(r.unread || 0), 0)
}

async function markRead() {
  if (!conversationId.value) return
  await svcHttp(`/svc/conversations/${conversationId.value}/read`, { method: 'POST' })
  unreadCount.value = 0
}

async function init() {
  isLoading.value = true
  try {
    await ensureConversation()
    await loadMessages()
    await markRead()
    await fetchUnread()
    // Poll every 15s
    pollTimer.value = window.setInterval(async () => {
      await loadMessages()
      await markRead()
      await fetchUnread()
    }, 15000)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => { init() })
</script>
