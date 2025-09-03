<template>
  <!-- Normal path: tombol saat event tersedia -->
  <button
    v-if="canInstall && !isInstalled && !isIos"
    class="fixed bottom-4 left-4 right-4 bg-teal-500 text-white rounded-lg py-3 font-semibold shadow-lg"
    type="button"
    @click="onInstall"
  >
    Install app
  </button>

  <!-- iOS Safari: instruksi manual -->
  <div
    v-else-if="isIos && !isStandalone"
    class="fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg p-3 text-sm shadow-lg"
  >
    <p class="mb-1 font-semibold">Add to Home Screen</p>
    <p class="text-gray-600">
      Open the <span class="font-medium">Share</span> menu and choose
      <span class="font-medium">Add to Home Screen</span>.
    </p>
  </div>

  <!-- Desktop DEBUG fallback (muncul jika ?debugA2HS=1 & event belum ada) -->
  <div
    v-else-if="showHelp"
    class="fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg p-3 text-sm shadow-lg"
  >
    <p class="mb-1 font-semibold">Install from desktop</p>
    <ul class="list-disc ml-5 text-gray-700">
      <li>
        Chrome/Edge: klik ikon <b>Install</b> (plus) di address bar, atau menu → <b>Install App</b>.
      </li>
      <li>Pastikan HTTPS, manifest & service worker aktif, dan app belum terinstall.</li>
    </ul>
    <button class="mt-2 text-teal-600 font-semibold" @click="showHelp = false">Close</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useA2HS } from '@/composables/useA2HS'

const { canInstall, isInstalled, showInstallPrompt } = useA2HS()
const showHelp = ref(false)

function onInstall() {
  const ok = showInstallPrompt()
  if (!ok) showHelp.value = true // event belum ada → tampilkan instruksi desktop
}

const ua = navigator.userAgent.toLowerCase()
const isIos = /iphone|ipad|ipod/.test(ua)
const isStandalone =
  window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true
</script>
