<script setup lang="ts">
import { RouterView } from 'vue-router'
import ApiAlerts from '@/components/ApiAlerts.vue'
import { ref, onMounted, computed } from 'vue'
import { useHead } from '@vueuse/head'
import { bootstrapA2HS } from '@/composables/useA2HS'
import { useDeviceGate } from '@/plugins/deviceGate'
import { useAntiInspect } from '@/plugins/antiInspect'
import { config } from '@/lib/config'

bootstrapA2HS()

// Device gate & anti-inspect extracted to plugins
const { blockedByDevice } = useDeviceGate()
useAntiInspect()

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

onMounted(async () => {
  try {
    const res = await fetch(`${config.apiUrl}/meta-web`)
    if (!res.ok) throw new Error('Failed to fetch meta')
    const data = await res.json()
    meta.value = data
  } catch {
    meta.value = null
  }
})

// Head (reactive)
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
