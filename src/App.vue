<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import { useHead } from '@vueuse/head'
import ApiAlerts from '@/components/ApiAlerts.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import { bootstrapA2HS } from '@/composables/useA2HS'

bootstrapA2HS()

// ====== isPhone inline (tanpa import) ======
function isPhone(): boolean {
  const ua = (
    navigator.userAgent ||
    (navigator as any).vendor ||
    (window as any).opera ||
    ''
  ).toLowerCase()
  const isMobileUA = /android|iphone|ipod|ipad|windows phone|blackberry|iemobile|opera mini/.test(
    ua,
  )
  const smallViewport = Math.min(window.innerWidth, window.innerHeight) <= 820
  const pointerCoarse =
    typeof window.matchMedia === 'function' ? window.matchMedia('(pointer: coarse)').matches : false
  return (isMobileUA || pointerCoarse) && smallViewport
}

type MetaDTO = {
  logo: string
  nama_website: string
  deskripsi: string
  keyword: string
} | null

const meta = ref<MetaDTO>(null)

const defaultMeta = {
  logo: '/favicon.ico',
  nama_website: 'ONE LEDGER',
  deskripsi: 'ONE LEDGER',
  keyword: 'oneledger',
  url: 'https://oneledger.cloud',
}

// fetch meta saat mounted
onMounted(async () => {
  try {
    const res = await fetch('https://one-ledger.masmutpanel.my.id/api/meta-web')
    if (!res.ok) throw new Error('Gagal mengambil meta')
    const data = await res.json()
    meta.value = data
  } catch {
    meta.value = null
  }
})

// head meta reaktif
const headMeta = computed(() => {
  const m = meta.value
  const title = m?.nama_website || defaultMeta.nama_website
  const desc = m?.deskripsi || defaultMeta.deskripsi
  const keywords = m?.keyword || defaultMeta.keyword
  const logo = m?.logo || defaultMeta.logo
  const url = defaultMeta.url

  return {
    title,
    meta: [
      { name: 'description', content: desc },
      { name: 'keywords', content: keywords },
      { property: 'og:title', content: title },
      { property: 'og:description', content: desc },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: url },
      { property: 'og:image', content: logo },
    ],
    link: [
      { rel: 'icon', href: logo },
      { rel: 'canonical', href: url },
    ],
  }
})
useHead(headMeta)

// ====== Layout dinamis ======
const route = useRoute()
const layout = computed(() => (route.meta.layout === 'auth' ? 'div' : MainLayout))

// ====== Mobile-only gating ======
const ok = ref(false)
function evalDevice() {
  ok.value = isPhone()
}

// ====== Blok klik kanan & shortcut devtools ======
const onContextMenu = (e: MouseEvent) => e.preventDefault()
const onKeyDown = (e: KeyboardEvent) => {
  const k = String(e.key || '').toLowerCase()
  if ((e.ctrlKey && k === 'u') || (e.metaKey && k === 'u')) {
    e.preventDefault()
    e.stopPropagation()
  }
  if (e.key === 'F12' || e.keyCode === 123) {
    e.preventDefault()
    e.stopPropagation()
  }
  if (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(k)) {
    e.preventDefault()
    e.stopPropagation()
  }
}

onMounted(() => {
  evalDevice()
  // window.addEventListener('resize', evalDevice) // aktifkan kalau mau cek ulang saat resize

  window.addEventListener('contextmenu', onContextMenu, { capture: true })
  window.addEventListener('keydown', onKeyDown, { capture: true })
})

onBeforeUnmount(() => {
  // window.removeEventListener('resize', evalDevice)
  window.removeEventListener('contextmenu', onContextMenu, { capture: true })
  window.removeEventListener('keydown', onKeyDown, { capture: true })
})
</script>

<template>
  <component :is="layout">
    <ApiAlerts />
    <RouterView v-if="ok" />
  </component>

  <teleport to="body">
    <div
      v-if="!ok"
      class="fixed inset-0 z-[999999] bg-white/95 backdrop-blur-sm flex items-center justify-center p-6 text-center"
      style="pointer-events: all"
    >
      <div class="max-w-sm">
        <h1 class="text-2xl font-bold mb-3">Mobile Only Access</h1>
        <p>Silakan buka menggunakan <b>smartphone</b>. Aplikasi hanya mendukung smartphone.</p>
      </div>
    </div>
  </teleport>
</template>
