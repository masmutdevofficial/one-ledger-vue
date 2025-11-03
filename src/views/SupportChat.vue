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
      <div
        v-for="m in messages"
        :key="m.id"
        class="flex"
        :class="m.sender === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[85%] rounded-2xl px-3 py-2 relative"
          :class="m.sender === 'user' ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'"
        >
          <!-- Text -->
          <p v-if="m.text" class="whitespace-pre-line break-words">
            {{ m.text }}
          </p>

          <!-- Attachments inside bubble -->
          <div v-if="m.attachments?.length" class="mt-2 grid grid-cols-3 gap-2">
            <template v-for="a in m.attachments" :key="a.id">
              <!-- Image preview -->
              <img
                v-if="a.type === 'image'"
                :src="a.url"
                :alt="a.name"
                class="w-28 h-28 object-cover rounded-lg border border-black/10"
              />
              <!-- PDF tile -->
              <div
                v-else
                class="w-28 h-28 rounded-lg border border-black/10 bg-white/70 grid place-items-center text-center p-2"
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
        </div>
      </div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onUnmounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'

type Sender = 'user' | 'bot'
type MsgStatus = 'sent' | 'delivered' | 'read'

interface AttachmentPreview {
  id: string
  name: string
  type: 'image' | 'pdf'
  size: number
  url: string // ObjectURL
}

interface Message {
  id: string
  sender: Sender
  text?: string
  attachments?: AttachmentPreview[]
  status?: MsgStatus // hanya untuk 'user'
  createdAt: Date
}

const router = useRouter()
const chatEl = ref<HTMLElement | null>(null)
const draft = ref('')
const pending = ref<AttachmentPreview[]>([])
const errorMsg = ref('')

const fileEl = ref<HTMLInputElement | null>(null)
const MAX_FILES = 3
const MAX_SIZE = 2 * 1024 * 1024 // 2MB
const ACCEPT = '.pdf,.jpeg,.jpg,.webp,.png'

const messages = ref<Message[]>([
  {
    id: uid(),
    sender: 'bot',
    text: 'Hello! How can we assist you today?',
    createdAt: new Date(),
  },
])

const isSendDisabled = computed(() => !draft.value.trim() && pending.value.length === 0)

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

function send() {
  const text = draft.value.trim()
  if (!text && pending.value.length === 0) return

  const msg: Message = {
    id: uid(),
    sender: 'user',
    text: text || undefined,
    attachments: pending.value.length ? [...pending.value] : undefined,
    status: 'sent',
    createdAt: new Date(),
  }

  messages.value.push(msg)
  draft.value = ''
  clearPendingBlobs()
  nextTick(scrollToBottom)

  // Simulasi status WhatsApp
  simulateDelivery(msg.id)

  // Simulasi balasan bot
  setTimeout(() => {
    messages.value.push({
      id: uid(),
      sender: 'bot',
      text: 'Terima kasih! Kami akan cek pertanyaan Anda.',
      createdAt: new Date(),
    })
    nextTick(scrollToBottom)
  }, 900)
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

function simulateDelivery(id: string) {
  // delivered
  setTimeout(() => {
    const m = messages.value.find(x => x.id === id)
    if (m && m.sender === 'user') m.status = 'delivered'
  }, 700)

  // read
  setTimeout(() => {
    const m = messages.value.find(x => x.id === id)
    if (m && m.sender === 'user') m.status = 'read'
  }, 1600)
}

onUnmounted(() => {
  // bersihkan objectURL jika ada yang tersisa
  for (const p of pending.value) URL.revokeObjectURL(p.url)
})
</script>
