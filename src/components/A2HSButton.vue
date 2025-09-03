<template>
  <!-- Android/Chromium: show install button when canInstall = true -->
  <button
    v-if="canInstall && !isInstalled && !isIos"
    class="fixed bottom-4 left-4 right-4 bg-teal-500 text-white rounded-lg py-3 font-semibold shadow-lg"
    type="button"
    @click="onInstall"
  >
    Install app
  </button>

  <!-- iOS Safari: no beforeinstallprompt, show instructions instead -->
  <div
    v-else-if="isIos && !isStandalone"
    class="fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg p-3 text-sm shadow-lg"
  >
    <p class="mb-1 font-semibold">Add to Home Screen</p>
    <p class="text-gray-600">
      Open the <span class="font-medium">Share</span> menu (the square with an arrow), then choose
      <span class="font-medium">Add to Home Screen</span>.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useA2HS } from '@/composables/useA2HS'

const { canInstall, isInstalled, showInstallPrompt } = useA2HS()

function onInstall() {
  showInstallPrompt()
}

// detect iOS & standalone
const ua = navigator.userAgent.toLowerCase()
const isIos = /iphone|ipad|ipod/.test(ua)
const isStandalone =
  window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true
</script>
