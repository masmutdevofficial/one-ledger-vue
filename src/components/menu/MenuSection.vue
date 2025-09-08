<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

interface MenuItem {
  title: string
  link?: string
  icon: string
  isLogout?: boolean
}

const router = useRouter()
const API_BASE = 'https://one-ledger.masmutpanel.my.id/api'

const showLanguageSelector = ref(false)
const showLogoutModal = ref(false)

const menuItems: MenuItem[] = [{ title: 'Logout', icon: '/img/newmenu/logout.png', isLogout: true }]

function handleMenuClick(item: MenuItem) {
  if (item.isLogout) {
    showLogoutModal.value = true
  } else if (item.title === 'Language') {
    showLanguageSelector.value = true
  } else if (item.link) {
    router.push(item.link)
  }
}

const logout = async () => {
  const token = localStorage.getItem('token')
  try {
    if (token) {
      await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      })
    }
  } catch (_) {
    // ignore
  } finally {
    localStorage.removeItem('token')
    showLogoutModal.value = false
    router.replace('/login')
  }
}
</script>

<template>
  <div class="space-y-6">
    <RouterLink to="/verify" class="w-full flex items-center justify-between text-gray-600 text-sm">
      <div class="flex items-center space-x-3">
        <img
          src="/img/newmenu/verification.png"
          alt="Verification"
          class="w-6 h-6 object-contain"
        />
        <span>Verification</span>
      </div>
      <Icon icon="tabler:chevron-right" class="text-gray-400" />
    </RouterLink>

    <RouterLink
      to="/security"
      class="w-full flex items-center justify-between text-gray-600 text-sm"
    >
      <div class="flex items-center space-x-3">
        <img src="/img/newmenu/security.png" alt="Security" class="w-6 h-6 object-contain" />
        <span>Security</span>
      </div>
      <Icon icon="tabler:chevron-right" class="text-gray-400" />
    </RouterLink>

    <!-- Render menu + tombol Install tepat setelah Language -->
    <template v-for="item in menuItems" :key="item.title">
      <button
        class="w-full flex items-center justify-between text-gray-600 text-sm"
        @click="handleMenuClick(item)"
      >
        <div class="flex items-center space-x-3">
          <img :src="item.icon" :alt="item.title" class="w-6 h-6 object-contain" />
          <span>{{ item.title }}</span>
        </div>
        <Icon v-if="item.title === 'Language'" icon="tabler:chevron-right" class="text-gray-400" />
      </button>
    </template>

    <!-- Language Selector (Slide Up) -->
    <!-- <transition
      enter-active-class="transform transition duration-300 ease-out"
      enter-from-class="translate-y-full"
      enter-to-class="translate-y-0"
      leave-active-class="transform transition duration-300 ease-in"
      leave-from-class="translate-y-0"
      leave-to-class="translate-y-full"
    >
      <LanguageSelector
        v-if="showLanguageSelector"
        :show="showLanguageSelector"
        :selectedLang="selectedLang"
        @close="showLanguageSelector = false"
        @update="updateLanguage"
        class="fixed bottom-0 left-0 right-0 z-[100]"
      />
    </transition> -->

    <!-- Modal Confirm Logout -->
    <div
      v-if="showLogoutModal"
      class="fixed inset-0 bg-black/30 z-[100] flex items-center justify-center"
    >
      <div class="bg-white p-6 rounded-xl w-[90vw] max-w-xs mx-auto shadow-lg text-center relative">
        <button
          class="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          @click="showLogoutModal = false"
        >
          <Icon icon="tabler:x" class="w-5 h-5" />
        </button>
        <h2 class="font-semibold text-black text-base mb-4">Confirm Logout</h2>
        <p class="text-sm text-gray-600 mb-5">Are you sure you want to logout?</p>
        <div class="flex space-x-3">
          <button
            class="flex-1 py-2 rounded-md bg-gray-200 text-gray-700 font-semibold"
            @click="showLogoutModal = false"
          >
            Cancel
          </button>
          <button
            class="flex-1 py-2 rounded-md bg-red-500 text-white font-semibold hover:bg-red-600"
            @click="logout"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
