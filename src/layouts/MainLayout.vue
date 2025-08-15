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
      <header
        v-if="!hideHeader"
        class="bg-white fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-md z-50 shadow-sm flex items-center px-6 py-4 space-x-8"
      >
        <!-- Logo -->
        <RouterLink to="/account" aria-label="Account">
          <img alt="Logo with four hexagons" class="w-8 h-9" src="/img/logo.png" />
        </RouterLink>
        <!-- ... search & nav ... -->
        <form class="flex-1">
          <div class="relative w-[100%]">
            <input
              class="w-full border-[1px] border-black rounded-full py-1 pl-6 pr-10 text-black text-base focus:outline-none"
              placeholder="Search"
              type="search"
            />
            <button
              aria-label="Search"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-black text-lg"
              type="submit"
            >
              <Icon icon="tabler:search" class="text-xl" />
            </button>
          </div>
        </form>
        <nav class="flex space-x-5 text-black text-xl">
          <RouterLink to="/notification" aria-label="Notifications" class="focus:outline-none">
            <Icon icon="tabler:bell" class="text-2xl" />
          </RouterLink>
          <RouterLink to="/support" aria-label="Support" class="focus:outline-none">
            <Icon icon="tabler:headset" class="text-2xl" />
          </RouterLink>
        </nav>
      </header>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto relative mt-20">
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
            class="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 shadow-md z-50"
          >
            <div class="flex justify-around items-center py-2">
              <RouterLink
                to="/dashboard"
                class="flex flex-col items-center"
                :class="isActive('/dashboard') ? 'text-teal-600' : 'text-gray-400'"
              >
                <img alt="Logo with four hexagons" class="w-5 h-6" src="/img/logo.png" />
                <span class="text-xs mt-1 font-semibold">Home</span>
              </RouterLink>
              <RouterLink
                to="/market"
                class="flex flex-col items-center"
                :class="isActive('/market') ? 'text-teal-600' : 'text-gray-400'"
              >
                <img
                  alt="Market"
                  src="/img/markets-icon.png"
                  class="w-6 h-6 filter"
                  :style="isActive('/market') ? teal600Filter : null"
                />
                <span class="text-xs mt-1">Market</span>
              </RouterLink>
              <RouterLink
                to="/trade"
                class="flex flex-col items-center"
                :class="isActive('/trade') ? 'text-teal-600' : 'text-gray-400'"
              >
                <img
                  alt="Market"
                  src="/img/trade-icon.png"
                  class="w-7 h-6 filter"
                  :style="isActive('/trade') ? teal600Filter : null"
                />
                <span class="text-xs mt-1">Trade</span>
              </RouterLink>
              <RouterLink
                to="/history"
                class="flex flex-col items-center"
                :class="isActive('/history') ? 'text-teal-600' : 'text-gray-400'"
              >
                <Icon icon="tabler:history" class="text-2xl" />
                <span class="text-xs mt-1 text-center">Order History</span>
              </RouterLink>
              <RouterLink
                to="/assets"
                class="flex flex-col items-center"
                :class="isActive('/assets') ? 'text-teal-600' : 'text-gray-400'"
              >
                <Icon icon="tabler:wallet" class="text-2xl" />
                <span class="text-xs mt-1">Assets</span>
              </RouterLink>
            </div>
          </div>
        </template>
      </main>
    </div>
  </div>
</template>
