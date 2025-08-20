<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'

// Halaman publik
const publicPages = [
  '/',
  '/login',
  '/register',
  '/verification',
  '/forgot-password',
  '/reset-password',
]
const router = useRouter()
const route = useRoute()
const isPublicPage = computed(() => publicPages.includes(route.path))

const isLoading = ref(true)
const isClient = ref(false)

onMounted(async () => {
  isClient.value = true // Pastikan loader muncul dulu di client

  // Cek hanya di client
  if (!publicPages.includes(route.path)) {
    const token = localStorage.getItem('token')
    const hasToken = !!token && token.trim() !== ''
    if (!hasToken) {
      await router.replace({
        path: '/login',
        query: { reason: 'unauthorized' },
      })
      // Jangan tampilkan slot, loader tetap sampai pindah halaman
      return
    }
  }
  isLoading.value = false
})

function isActive(path: string): boolean {
  return route.path.startsWith(path)
}

const noHeaderPaths = ['/account'] // bisa ditambah: '/account/settings', dll
const hideHeader = computed(() => noHeaderPaths.some((p) => route.path.startsWith(p)))

const teal600Filter = {
  filter:
    'brightness(0) saturate(100%) invert(33%) sepia(86%) saturate(373%) hue-rotate(130deg) brightness(92%) contrast(90%)',
}
</script>

<template>
  <div class="min-h-screen flex justify-center bg-black text-gray-900">
    <div class="w-full max-w-md bg-white min-h-screen flex flex-col relative">
      <!-- Header -->
      <!-- Top Navbar -->
      <nav
        v-if="!hideHeader"
        class="flex items-center justify-between px-4 py-3 w-full sticky top-0 z-50 bg-white shadow-sm"
      >
        <!-- Left Buttons -->
        <div class="flex space-x-6 items-center">
          <RouterLink to="/account" aria-label="Menu" class="focus:outline-none">
            <img src="/img/newmenu/menu.png" alt="Menu" class="w-7 h-7 object-contain" />
          </RouterLink>
          <RouterLink to="/notification" aria-label="Chat" class="focus:outline-none">
            <img src="/img/newmenu/notification.png" alt="Menu" class="w-7 h-7 object-contain" />
          </RouterLink>
        </div>

        <!-- Spot/Futures Toggle -->
        <div
          class="relative flex items-center bg-gray-100 rounded-lg px-1.5 py-1 mr-4 text-sm font-medium"
        >
          <RouterLink
            to="/dashboard"
            class="px-3 py-1 rounded-lg transition"
            :class="isActive('/dashboard') ? 'bg-white text-black' : 'text-gray-600'"
          >
            Spot
          </RouterLink>
          <RouterLink
            to="/futures"
            class="px-3 py-1 rounded-lg transition"
            :class="isActive('/futures') ? 'bg-white text-black' : 'text-gray-600'"
          >
            Copy Trade
          </RouterLink>
        </div>

        <!-- Support -->
        <RouterLink to="#" aria-label="Support" class="focus:outline-none">
          <img src="/img/newmenu/support.png" alt="Menu" class="w-7 h-7 object-contain" />
        </RouterLink>
      </nav>

      <!-- Search Bar -->
      <div class="w-full px-4 pb-4 mt-3" v-if="!hideHeader">
        <div class="relative w-full">
          <input
            type="search"
            placeholder="#HotJulyPPI"
            class="w-full rounded-xl bg-gray-100 text-gray-500 placeholder-gray-500 px-4 py-2 text-sm focus:outline-none pr-10"
          />
          <Icon
            icon="tabler:search"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"
          />
        </div>
      </div>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto relative -mt-3">
        <!-- Loader -->
        <div
          v-if="isLoading && !isPublicPage"
          class="absolute inset-0 flex flex-col items-center justify-center bg-white z-50"
        >
          <svg
            class="animate-spin h-8 w-8 text-teal-600 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <span class="text-gray-600">Loading...</span>
        </div>
        <!-- Konten utama -->
        <template v-else>
          <router-view />

          <!-- Bottom Navigation -->
          <div
            class="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white shadow-md z-50"
          >
            <div class="flex justify-around items-center py-2">
              <RouterLink
                to="/dashboard"
                class="flex flex-col items-center"
                :class="isActive('/dashboard') ? 'text-teal-600' : 'text-gray-400'"
              >
                <img alt="Home" src="/img/logo.png" class="w-5 h-5 object-contain rotate-33" />
                <span class="text-xs mt-1 font-semibold">Home</span>
              </RouterLink>

              <RouterLink
                to="/market"
                class="flex flex-col items-center ml-2"
                :class="isActive('/market') ? 'text-teal-600' : 'text-gray-400'"
              >
                <img
                  alt="Market"
                  src="/img/markets-icon.png"
                  class="w-5 h-5 object-contain filter"
                  :style="isActive('/market') ? teal600Filter : null"
                />
                <span class="text-xs mt-1">Market</span>
              </RouterLink>

              <RouterLink
                to="/trade"
                class="flex flex-col items-center ml-4"
                :class="isActive('/trade') ? 'text-teal-600' : 'text-gray-400'"
              >
                <img
                  alt="Trade"
                  src="/img/trade-icon.png"
                  class="w-5 h-5 object-contain filter"
                  :style="isActive('/trade') ? teal600Filter : null"
                />
                <span class="text-xs mt-1">Trade</span>
              </RouterLink>

              <RouterLink
                to="/history"
                class="flex flex-col items-center"
                :class="isActive('/history') ? 'text-teal-600' : 'text-gray-400'"
              >
                <Icon icon="tabler:history" class="w-5 h-5" />
                <span class="text-xs mt-1 text-center">Order History</span>
              </RouterLink>

              <RouterLink
                to="/assets"
                class="flex flex-col items-center"
                :class="isActive('/assets') ? 'text-teal-600' : 'text-gray-400'"
              >
                <Icon icon="tabler:wallet" class="w-5 h-5" />
                <span class="text-xs mt-1">Assets</span>
              </RouterLink>
            </div>
          </div>
        </template>
      </main>
    </div>
  </div>
</template>
