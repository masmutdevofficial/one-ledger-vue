<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
    <div class="bg-black/70 p-8 rounded-xl text-center text-white max-w-xs mx-auto shadow-lg">
      <h2 class="text-lg font-bold mb-2">{{ title }}</h2>
      <p class="mb-4">{{ message }}</p>
      <button class="px-4 py-2 bg-white/20 hover:bg-white/40 rounded text-white" @click="close">
        OK
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApiAlertStore } from '@/stores/apiAlert'
import { computed } from 'vue'

const modal = useApiAlertStore()
const show = computed(() => modal.show)
const title = computed(() => modal.title)
const message = computed(() => modal.message)
const close = () => modal.close()
</script>
