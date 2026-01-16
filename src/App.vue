<script setup lang="ts">
import { RouterView } from 'vue-router'
import ApiAlerts from '@/components/ApiAlerts.vue'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useHead } from '@vueuse/head'
import { bootstrapA2HS } from '@/composables/useA2HS'
bootstrapA2HS()

const meta = ref<{
  logo: string
  nama_website: string
  deskripsi: string
  keyword: string
} | null>(null)

const defaultMeta = {
  logo: '/favicon.ico',
  nama_website: 'ONE LEDGER',
  deskripsi: 'ONE LEDGER',
  keyword: 'oneledger',
  url: 'https://oneledger.cloud',
}

// === Mobile-only + anti-inspect (best-effort) ===
const blockedByDevice = ref(true)

function isMobileLike() {
  const ua = navigator.userAgent || ''
  const uaMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false
  const maxWidth = window.matchMedia?.('(max-width: 900px)').matches ?? window.innerWidth <= 900
  return (uaMobile || coarse) && maxWidth
}

function applyAntiInspect(enable: boolean) {
  const onCtx = (e: MouseEvent) => e.preventDefault()
  const onKey = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase()
    // F12
    if (k === 'f12') e.preventDefault()
    // Ctrl/Cmd + U/S/P    (view-source, save, print)
    if ((e.ctrlKey || e.metaKey) && ['u', 's', 'p'].includes(k)) e.preventDefault()
    // Ctrl/Cmd+Shift+I/J/C (DevTools)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(k)) e.preventDefault()
  }
  const onDrag = (e: DragEvent) => e.preventDefault()

  if (enable) {
    document.addEventListener('contextmenu', onCtx, { passive: false })
    document.addEventListener('keydown', onKey, { passive: false })
    document.addEventListener('dragstart', onDrag, { passive: false })
    // simpan refs ke window untuk cleanup
    ;(window as any).__antiInspect = { onCtx, onKey, onDrag }
  } else {
    const h = (window as any).__antiInspect
    if (h) {
      document.removeEventListener('contextmenu', h.onCtx as any)
      document.removeEventListener('keydown', h.onKey as any)
      document.removeEventListener('dragstart', h.onDrag as any)
      delete (window as any).__antiInspect
    }
  }
}

function evaluateDeviceGate() {
  blockedByDevice.value = !isMobileLike()
}

onMounted(async () => {
  // device gate awal + on resize/orientation
  evaluateDeviceGate()
  const ro = () => evaluateDeviceGate()
  window.addEventListener('resize', ro)
  window.addEventListener('orientationchange', ro)
  ;(window as any).__gateHandlers = ro

  // aktifkan anti-inspect
  applyAntiInspect(true)

  // fetch meta
  try {
    const res = await fetch('https://tech.oneled.io/api/meta-web')
    if (!res.ok) throw new Error('Gagal mengambil meta')
    const data = await res.json()
    meta.value = data
  } catch {
    meta.value = null
  }
})

onUnmounted(() => {
  const ro = (window as any).__gateHandlers
  if (ro) {
    window.removeEventListener('resize', ro)
    window.removeEventListener('orientationchange', ro)
    delete (window as any).__gateHandlers
  }
  applyAntiInspect(false)
})

// Head (tetap reactive)
const headMeta = computed(() => {
  const data = meta.value
  return {
    title: data?.nama_website || defaultMeta.nama_website,
    meta: [
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
      },
      { name: 'description', content: data?.deskripsi || defaultMeta.deskripsi },
      { name: 'keywords', content: data?.keyword || defaultMeta.keyword },
      { property: 'og:title', content: data?.nama_website || defaultMeta.nama_website },
      { property: 'og:description', content: data?.deskripsi || defaultMeta.deskripsi },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: defaultMeta.url },
    ],
    link: [
      { rel: 'icon', href: data?.logo || defaultMeta.logo },
      { rel: 'canonical', href: defaultMeta.url },
    ],
  }
})

useHead(headMeta)
</script>

<template>
  <div v-if="blockedByDevice" class="blocked">
    <div class="blocked__card">
      <strong>Access is restricted</strong>
      <p>This website can only be accessed via mobile devices.</p>
      <p>Please open it on a mobile device or minimize the window to mobile width.</p>
    </div>
  </div>

  <div v-else>
    <ApiAlerts />
    <RouterView />
  </div>
</template>

<style scoped>
.blocked {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: #0b0c0f;
  color: #e5e7eb;
  z-index: 99999;
  padding: 24px;
}
.blocked__card {
  width: 100%;
  max-width: 460px;
  border: 1px solid #2a2f3a;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  background: #111318;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
}
.blocked__card strong {
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
}
.blocked__card p {
  margin: 6px 0;
  font-size: 14px;
  line-height: 1.45;
}
</style>
