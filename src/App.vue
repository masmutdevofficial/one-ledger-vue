<script setup lang="ts">
import { RouterView } from 'vue-router'
import ApiAlerts from '@/components/ApiAlerts.vue'
import { ref, onMounted, computed } from 'vue'
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

// Ambil meta dari API di onMounted, update meta.value
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

// Gunakan computed supaya useHead reactive
const headMeta = computed(() => {
  const data = meta.value
  return {
    title: data?.nama_website || defaultMeta.nama_website,
    meta: [
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

// Panggil useHead DI LUAR onMounted!
useHead(headMeta)
</script>

<template>
  <ApiAlerts />
  <RouterView />
</template>
