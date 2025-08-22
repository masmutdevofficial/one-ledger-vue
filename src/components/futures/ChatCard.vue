<template>
  <div class="w-full max-w-xl rounded-lg border shadow-sm bg-white overflow-hidden">
    <!-- Body -->
    <div class="h-[560px] flex flex-col overflow-hidden">
      <!-- List chat: scrollable, tidak menggeser input -->
      <div ref="listEl" class="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        <template v-for="(m, i) in messages" :key="i">
          <div class="flex" :class="m.me ? 'justify-end' : 'justify-start'">
            <div
              class="max-w-[75%] rounded-lg px-3 py-2 text-sm leading-relaxed"
              :class="
                m.me
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-900 rounded-bl-sm'
              "
            >
              <p class="whitespace-pre-wrap break-words">{{ m.text }}</p>
            </div>
          </div>
        </template>
      </div>

      <!-- Sticky input -->
      <div class="sticky bottom-0 bg-white/90 backdrop-blur px-3 py-2 shadow-md">
        <form @submit.prevent="handleSend" class="relative">
          <textarea
            v-model="draft"
            @keydown.enter.exact.prevent="handleSend"
            @keydown.enter.shift.stop
            rows="1"
            placeholder="Tulis pesan..."
            class="w-full resize-none outline-none rounded-xl px-3 py-3 pr-12 text-sm max-h-32 overflow-auto bg-gray-50 border border-gray-200 focus:border-teal-300 focus:ring-1 focus:ring-teal-300"
          />
          <!-- tombol kirim di pojok kanan atas textarea -->
          <button
            type="submit"
            :disabled="!canSend || sending"
            class="absolute top-2 right-2 inline-flex items-center justify-center rounded-md p-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
import { ref, nextTick, watch, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useApiAlertStore } from '@/stores/apiAlert'

type ChatMessage = {
  text: string
  me?: boolean
}

const modal = useApiAlertStore()

// contoh data awal
const messages = ref<ChatMessage[]>([
  { text: 'Halo!', me: false },
  { text: 'Hai, ada yang bisa kubantu?', me: true },
])

const draft = ref<string>('')
const sending = ref<boolean>(false)

const canSend = computed(() => draft.value.trim().length > 0)

const listEl = ref<HTMLDivElement | null>(null)

function scrollToBottom() {
  const el = listEl.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

onMounted(() => {
  scrollToBottom()
})

// auto scroll saat ada pesan baru
watch(
  () => messages.value.length,
  async () => {
    await nextTick()
    scrollToBottom()
  },
)

async function handleSend() {
  if (!canSend.value || sending.value) return
  try {
    sending.value = true
    const text = draft.value.trim()
    draft.value = ''

    // push pesan saya
    messages.value.push({ text, me: true })

    // TODO: kirim ke server di sini jika perlu
    // contoh: panggil API dengan token sanctum
    // const token = localStorage.getItem('token')
    // if (!token) {
    //   modal.open('Auth', 'Token tidak ditemukan')
    //   return
    // }
    // const res = await fetch(`${API_BASE}/chat/send`, {
    //   method: 'POST',
    //   headers: {
    //     Accept: 'application/json',
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${token}`,
    //   },
    //   body: JSON.stringify({ message: text }),
    // })
    // if (!res.ok) {
    //   const err = await res.json().catch(() => ({}))
    //   modal.open('Gagal', err.message ?? 'Gagal mengirim pesan')
    // }

    // simulasi balasan anonim (hapus saat integrasi nyata)
    setTimeout(() => {
      messages.value.push({ text: 'Pesan diterima.', me: false })
    }, 600)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    modal.open('Error', e?.message ?? 'Terjadi kesalahan')
  } finally {
    sending.value = false
  }
}
</script>
