<script setup lang="ts">
import { Icon } from '@iconify/vue'
import MenuSection from '@/components/menu/MenuSection.vue'

// Definisi tipe user
interface User {
  uid: string
  name: string
  email: string
  avatar: string
  level: string
  progress: number
}

// Dummy data (nantinya bisa dari API / Pinia / props)
const user: User = {
  uid: 'ZMYDSWPK',
  name: 'Inisial-z',
  email: 'Testing@gmail.com',
  avatar: '',
  level: 'Regular',
  progress: 1,
}

function goBack(): void {
  window.history.back()
}

function copyUid(): void {
  navigator.clipboard.writeText(user.uid)
}

function toggleEmailVisibility(): void {
  alert('Email visibility toggle clicked')
}
</script>

<template>
  <div class="max-w-md mx-auto p-4 mt-5">
    <!-- Header -->
    <header class="flex items-center mb-6">
      <button aria-label="Go back" class="text-gray-900 text-xl" @click="goBack">
        <Icon icon="tabler:arrow-left" />
      </button>
      <h1 class="flex-grow text-center font-semibold text-lg leading-6">Account Info</h1>
      <div class="w-6"></div>
    </header>

    <!-- Card -->
    <section
      aria-label="User account information"
      class="bg-white border border-gray-200 rounded-xl p-5 mb-6 relative shadow-sm"
    >
      <!-- Badge -->
      <div
        class="absolute top-3 right-3 bg-gray-100 text-gray-600 text-xs font-normal px-2 py-0.5 rounded"
      >
        {{ user.level }}
      </div>

      <!-- Avatar + Name -->
      <div class="flex items-center space-x-4 mb-4">
        <img
          :src="user.avatar && user.avatar.trim() !== '' ? user.avatar : '/img/newmenu/profile.png'"
          :alt="user.name || 'Default Profile'"
          class="w-12 h-12 rounded-full"
        />
        <h2 class="font-semibold text-gray-900 text-base leading-5">
          {{ user.name }}
        </h2>
      </div>

      <!-- Info -->
      <dl class="text-sm text-gray-500 mb-5 space-y-3">
        <!-- UID -->
        <div class="flex justify-between items-center">
          <dt class="font-medium">Ledgerone ID (UID)</dt>
          <dd
            class="flex items-center space-x-1 text-gray-700 font-semibold tracking-widest select-text"
          >
            <span>{{ user.uid }}</span>
            <button
              aria-label="Copy Ledgerone ID"
              class="ml-1 text-gray-400 hover:text-gray-600"
              @click="copyUid"
              type="button"
            >
              <Icon icon="tabler:copy" />
            </button>
          </dd>
        </div>

        <!-- Email -->
        <div class="flex justify-between items-center border-t border-gray-200 pt-2">
          <dt class="font-medium">Registration Info</dt>
          <dd class="flex items-center space-x-2 text-gray-700 font-semibold select-text">
            <span>{{ user.email }}</span>
            <button
              aria-label="Toggle email visibility"
              class="text-gray-400 hover:text-gray-600"
              @click="toggleEmailVisibility"
              type="button"
            >
              <Icon icon="tabler:eye" />
            </button>
          </dd>
        </div>
      </dl>

      <!-- Progress -->
      <div>
        <p class="font-semibold text-gray-900 text-sm leading-5 mb-0.5">Upgrade to VIP1</p>
        <p class="text-xs text-gray-400 mb-2">Trade more to reach the next level</p>
        <div class="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
          <div class="h-2 bg-orange-900 rounded-full" :style="{ width: user.progress + '%' }" />
        </div>
      </div>
    </section>

    <MenuSection />
  </div>
</template>
