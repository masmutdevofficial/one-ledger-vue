<template>
  <div class="min-h-screen flex items-center justify-center bg-white px-4">
    <div class="text-center">
      <Icon icon="tabler:error-404" class="text-gray-400 w-20 h-20 mx-auto mb-4" />
      <h1 class="text-xl font-bold text-gray-800 mb-2">Page Not Found</h1>
      <p class="text-gray-500 text-sm mb-4">The page you are looking for doesn’t exist.</p>
      <RouterLink
        to="/dashboard"
        class="inline-block bg-teal-500 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-teal-600"
      >
        Back to Home
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { RouterLink } from 'vue-router'
</script>
