<template>
  <div class="bg-white p-6">
    <div class="max-w-md mx-auto">
      <!-- Title -->
      <h2 class="text-sm font-semibold text-black mb-3">Account Info</h2>

      <!-- Account Card -->
      <div
        class="flex items-center bg-white border border-gray-300 rounded-xl p-4 mb-6"
        style="box-shadow: 0 0 0 1px #d1eaea"
      >
        <div class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center mr-4">
          <img src="/img/menu/user.png" alt="User icon" class="w-12 h-12" width="40" height="40" />
        </div>
        <p class="text-gray-400 text-sm font-semibold select-none">{{ username }}</p>
        <button
          aria-label="Edit username"
          class="ml-auto text-[#6cc9c9] hover:text-[#4da6a6] focus:outline-none"
          @click="
            () => {
              showModal = true
              usernameInput = username
            }
          "
        >
          <Icon icon="tabler:edit" class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Edit Username -->
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black/30 z-[100] flex items-center justify-center"
      >
        <div
          class="bg-white p-6 rounded-xl w-[90vw] max-w-xs mx-auto shadow-lg text-center relative"
        >
          <button
            class="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            @click="showModal = false"
          >
            <Icon icon="tabler:x" class="w-5 h-5" />
          </button>
          <h2 class="font-semibold text-black text-base mb-3">Edit Username</h2>
          <form @submit.prevent="updateUsername">
            <input
              v-model="usernameInput"
              type="text"
              placeholder="Enter new username"
              class="w-full border border-gray-300 rounded-md py-2 px-3 mb-4 text-sm placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-teal-300"
              autocomplete="off"
              :disabled="loading"
            />
            <button
              type="submit"
              class="w-full bg-teal-400 text-white font-semibold py-2 rounded-md hover:bg-teal-500 disabled:opacity-50"
              :disabled="loading || !usernameInput"
            >
              <span v-if="loading">Saving...</span>
              <span v-else>Save</span>
            </button>
          </form>
        </div>
      </div>

      <!-- Grid Menu -->
      <div class="grid grid-cols-4 gap-y-6 gap-x-4">
        <div
          v-for="(item, index) in menus"
          :key="index"
          class="flex flex-col items-center text-center cursor-pointer"
          @click="handleMenuClick(item)"
        >
          <div
            class="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center mb-2"
          >
            <img :src="item.img" :alt="item.title" class="w-8 h-8" width="40" height="40" />
          </div>
          <p class="text-[10px] font-semibold text-black">{{ item.title }}</p>
        </div>
      </div>
    </div>
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

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useApiAlertStore } from '@/stores/apiAlert'
import { useRouter } from 'vue-router'

const router = useRouter()

interface MenuItem {
  title: string
  link: string
  img: string
  isLogout?: boolean
}

const handleMenuClick = (item: MenuItem) => {
  if (item.isLogout) {
    showLogoutModal.value = true
  } else {
    router.push(item.link)
  }
}

const showModal = ref(false)
const showLogoutModal = ref(false)
const usernameInput = ref('')
const loading = ref(false)

const username = ref('-')
const modal = useApiAlertStore()

const logout = () => {
  localStorage.removeItem('token')
  showLogoutModal.value = false
  router.replace('/login')
}

// Ambil username awal saat komponen mount
onMounted(async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      modal.open('Unauthorized', 'Token tidak ditemukan.')
      return
    }

    const res = await fetch('https://ledger.masmutdev.id/api/get-account-data', {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    const data = await res.json()
    if (!res.ok || data.status !== 'success') {
      modal.open('Failed', data.message || 'Gagal mengambil data user')
      return
    }
    username.value = data.username
  } catch {
    modal.open('Error', 'Server error')
  }
})

const updateUsername = async () => {
  if (!usernameInput.value.trim()) return

  loading.value = true
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      modal.open('Unauthorized', 'Token tidak ditemukan.')
      return
    }

    const res = await fetch('https://ledger.masmutdev.id/api/update-account-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username: usernameInput.value }),
    })
    const data = await res.json()
    if (!res.ok || data.status !== 'success') {
      modal.open('Failed', data.message || 'Failed to update username')
      return
    }

    username.value = usernameInput.value
    modal.open('Success', data.message || 'Username updated')
  } catch {
    modal.open('Error', 'Server error')
  } finally {
    loading.value = false
    showModal.value = false
  }
}

const menus: MenuItem[] = [
  {
    title: 'Language',
    link: '/language',
    img: '/img/menu/language.png',
  },
  {
    title: 'Smart Arbitrage',
    link: '/smart-arbitrage',
    img: '/img/menu/smart-arbitrage.png',
  },
  {
    title: 'P2P',
    link: '/p2p',
    img: '/img/menu/p2p.png',
  },
  {
    title: 'Security',
    link: '/security',
    img: '/img/menu/security.png',
  },
  {
    title: 'Hub Reward',
    link: '/reward',
    img: '/img/menu/hub-reward.png',
  },
  {
    title: 'LaunchPool',
    link: '/launchpool',
    img: '/img/menu/launchpool.png',
  },
  {
    title: 'Megadrop',
    link: '/megadrop',
    img: '/img/menu/megadrop.png',
  },
  {
    title: 'Weekly Event',
    link: '/event',
    img: '/img/menu/weekly-event.png',
  },
  {
    title: 'Legal Document',
    link: '/legal',
    img: '/img/menu/legal.png',
  },
  {
    title: 'Verify',
    link: '/verify',
    img: '/img/menu/verify.png',
  },
  {
    title: 'Logout',
    link: '',
    img: '/img/menu/logout.png',
    isLogout: true,
  },
]
</script>
