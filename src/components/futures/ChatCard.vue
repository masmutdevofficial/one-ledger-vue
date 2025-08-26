<template>
  <div class="w-full max-w-xl rounded-lg border shadow-sm bg-white overflow-hidden">
    <div class="h-[560px] flex flex-col overflow-hidden">
      <!-- List chat: gaya live streaming -->
      <div ref="listEl" class="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
        <template v-for="m in messages" :key="m.id">
          <div class="flex items-start gap-2 text-sm leading-relaxed">
            <!-- username -->
            <span class="shrink-0 font-medium" :style="{ color: userColor(m.user) }">
              {{ m.user }}:
            </span>
            <!-- isi pesan -->
            <p class="whitespace-pre-wrap break-words">
              {{ m.text }}
              <span
                v-if="m.streaming"
                class="inline-block w-[7px] h-[1.1em] align-[-0.2em] bg-gray-400 animate-pulse ml-0.5"
              />
            </p>
          </div>
        </template>
      </div>

      <!-- Input + emoji -->
      <div class="sticky bottom-0 bg-white/90 backdrop-blur px-3 py-2 shadow-md">
        <form @submit.prevent="handleSend" class="relative flex items-end gap-2">
          <!-- emoji button -->
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

            <!-- emoji popover -->
            <div
              v-if="emojiOpen"
              ref="emojiPanelRef"
              class="absolute bottom-full left-0 mb-2 w-64 rounded-xl border bg-white shadow p-2 z-10"
            >
              <div class="text-xs text-gray-500 px-1 pb-1">Emoji</div>
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
            :disabled="!canSend || sending"
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
import { ref, nextTick, watch, onMounted, onBeforeUnmount, computed, defineExpose } from 'vue'
import { Icon } from '@iconify/vue'
import { useApiAlertStore } from '@/stores/apiAlert'

type ChatMessage = {
  id: number
  user: string
  text: string
  streaming?: boolean
}

const modal = useApiAlertStore()

// contoh awal
const messages = ref<ChatMessage[]>([
  { id: 1, user: 'Siti', text: 'Halo semua 👋' },
  { id: 2, user: 'Budi', text: 'Gas live chat-nya!' },
])
let nextId = 3

// user yang sedang kirim dari input lokal
const CURRENT_USER = 'Masmut'

// --- input state ---
const draft = ref<string>('')
const sending = ref<boolean>(false)
const canSend = computed(() => draft.value.trim().length > 0)

// --- list & scroll ---
const listEl = ref<HTMLDivElement | null>(null)
function scrollToBottom() {
  const el = listEl.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}
onMounted(() => scrollToBottom())
watch(
  () => messages.value.length,
  async () => {
    await nextTick()
    scrollToBottom()
  },
)

// --- username color (konsisten per user) ---
function userColor(name: string) {
  // hash ke hue 0-360 (stabil untuk nama yang sama)
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  }
  const hue = hash % 360
  return `hsl(${hue} 65% 45%)`
}

// --- emoji picker ---
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

function toggleEmoji() {
  emojiOpen.value = !emojiOpen.value
}
function closeEmojiIfClickOutside(ev: MouseEvent) {
  const p = emojiPanelRef.value
  const b = emojiBtnRef.value
  if (!p || !b) return
  const target = ev.target as Node
  if (!p.contains(target) && !b.contains(target)) emojiOpen.value = false
}
onMounted(() => document.addEventListener('mousedown', closeEmojiIfClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', closeEmojiIfClickOutside))

// caret selection tracking
const selStart = ref(0)
const selEnd = ref(0)
function captureSelection() {
  const ta = taRef.value
  if (!ta) return
  selStart.value = ta.selectionStart ?? 0
  selEnd.value = ta.selectionEnd ?? 0
}
function insertEmoji(emoji: string) {
  const ta = taRef.value
  const start = selStart.value
  const end = selEnd.value
  const value = draft.value
  draft.value = value.slice(0, start) + emoji + value.slice(end)
  nextTick(() => {
    if (ta) {
      const pos = start + emoji.length
      ta.focus()
      ta.setSelectionRange(pos, pos)
      captureSelection()
    }
  })
}

// --- streaming API (untuk pesan masuk dari user lain) ---
function pushIncoming(user: string, text: string) {
  messages.value.push({ id: nextId++, user, text })
}

function pushIncomingStreaming(user: string, fullText: string, speedMs = 18) {
  const id = nextId++
  const msg: ChatMessage = { id, user, text: '', streaming: true }
  messages.value.push(msg)

  let i = 0
  const timer = setInterval(() => {
    msg.text += fullText[i] ?? ''
    i++
    // force reactive update
    messages.value = messages.value.map((m) => (m.id === id ? { ...msg } : m))
    if (i >= fullText.length) {
      clearInterval(timer)
      msg.streaming = false
      messages.value = messages.value.map((m) => (m.id === id ? { ...msg } : m))
    }
  }, speedMs)
}

// --- kirim dari input lokal (tetap kiri, karena gaya live stream) ---
async function handleSend() {
  if (!canSend.value || sending.value) return
  try {
    sending.value = true
    const text = draft.value.trim()
    draft.value = ''
    messages.value.push({ id: nextId++, user: CURRENT_USER, text })

    // Integrasi API jika perlu (Sanctum: pakai Bearer)
    // await apiFetch('/api/chat/send', { method: 'POST', body: { message: text } })
  } catch (e: any) {
    modal.open('Error', e?.message ?? 'Terjadi kesalahan')
  } finally {
    sending.value = false
  }
}

// Ekspos untuk dipanggil parent (socket, SSE, dsb.)
defineExpose({ pushIncoming, pushIncomingStreaming })
</script>
