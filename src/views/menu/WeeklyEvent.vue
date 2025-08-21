<template>
  <div>
    <div class="px-4 py-4 space-y-4 flex-1 overflow-auto mb-20">
      <button aria-label="Go back" class="text-black text-xl" @click="goBack">
        <Icon icon="tabler:arrow-left" width="24" height="24" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
const router = useRouter()

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/buy-p2p')
}
</script>
