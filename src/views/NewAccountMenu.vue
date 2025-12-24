<template>
  <div class="max-w-md mx-auto p-4">
    <!-- Header -->
    <header class="flex items-center mb-6">
      <h1 class="flex-grow text-center font-semibold text-lg leading-6">Account Info</h1>
      <div class="w-6"></div>
    </header>

    <!-- Card -->
    <section
      aria-label="User account information"
      class="bg-white border border-gray-200 rounded-xl p-5 mb-6 relative shadow-sm"
    >
      <!-- Badge Edit -->
      <div
        class="absolute top-3 right-3 bg-gray-100 text-gray-600 text-xs font-normal px-2 py-0.5 rounded cursor-pointer hover:bg-gray-200"
        @click="openEdit"
      >
        Edit
      </div>

      <!-- Avatar + Name -->
      <div class="flex items-center mb-4">
        <img
          :src="displayAvatar"
          :alt="user.name || 'Default Profile'"
          class="w-12 h-12 rounded-full object-cover mr-4"
        />
        <h2 class="font-semibold text-gray-900 text-base leading-5 mr-2">
          {{ user.name || 'No Name' }}
        </h2>

        <!-- Centang biru hanya jika status_ktp === 1 (Verified) -->
        <Icon
          v-if="isKtpVerified"
          icon="tabler:circle-check-filled"
          class="w-4 h-4 text-blue-500"
          aria-label="Verified"
          title="Verified"
        />
      </div>

      <!-- Info -->
      <div class="text-sm text-gray-500 mb-5 space-y-3">
        <!-- UID -->
        <div class="flex justify-between items-center">
          <dt class="font-medium">Ledgerone ID (UID)</dt>
          <dd
            class="flex items-center space-x-1 text-gray-700 font-semibold tracking-widest select-text"
          >
            <span>{{ user.uid || '-' }}</span>
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
            <span>{{ emailDisplay }}</span>
            <button
              aria-label="Toggle email visibility"
              class="text-gray-400 hover:text-gray-600"
              @click="toggleEmailVisibility"
              type="button"
            >
              <Icon :icon="showEmail ? 'tabler:eye-off' : 'tabler:eye'" />
            </button>
          </dd>
        </div>
      </div>

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

    <!-- Modal Edit Profile -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-black/30 z-[51] flex items-center justify-center"
    >
      <div class="bg-white p-6 rounded-xl w-[90vw] max-w-sm mx-auto shadow-lg relative">
        <button class="absolute right-3 top-3 text-gray-400 hover:text-gray-600" @click="closeEdit">
          <Icon icon="tabler:x" class="w-5 h-5" />
        </button>

        <h2 class="font-semibold text-black text-base mb-4">Edit Profile</h2>

        <form @submit.prevent="submitEdit" class="text-left no-ios-zoom">
          <!-- Inisial -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Inisial</label>
            <input
              v-model="formInisial"
              type="text"
              class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="Your initials"
            />
          </div>

          <!-- Bank Account -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
            <input
              v-model.trim="formBank"
              type="text"
              maxlength="255"
              autocomplete="organization"
              class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="e.g., Bank Central Asia"
            />
          </div>

          <!-- Account Number -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
            <input
              v-model.trim="formNorek"
              type="text"
              maxlength="255"
              inputmode="numeric"
              autocomplete="cc-number"
              class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="e.g., 1234567890"
            />
          </div>

          <!-- Avatar -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Avatar</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              @change="handleAvatarChange"
              class="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-500 file:text-white hover:file:bg-teal-600 border border-gray-300 rounded-md px-3 py-2"
            />
            <div class="mt-2 flex items-center space-x-3">
              <img
                v-if="previewUrl"
                :src="previewUrl"
                alt="Preview"
                class="w-16 h-16 rounded-full object-cover"
              />
              <img
                v-else
                :src="displayAvatar"
                alt="Current avatar"
                class="w-16 h-16 rounded-full object-cover"
              />
            </div>
            <p class="text-xs text-gray-500 mt-1">Max 1 MB. jpg/jpeg/png</p>
          </div>

          <div class="flex space-x-3 pt-2">
            <button
              type="button"
              class="flex-1 py-2 rounded-md bg-gray-200 text-gray-700 font-semibold"
              @click="closeEdit"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="flex-1 py-2 rounded-md bg-teal-500 text-white font-semibold hover:bg-teal-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import MenuSection from '@/components/menu/MenuSection.vue'
import { useApiAlertStore } from '@/stores/apiAlert'

// ====== Config API ======
const API_BASE = 'https://abc.oneled.io/api'
function getToken(): string | null {
  return localStorage.getItem('token')
}

// ====== Tipe ======
interface UserApi {
  uid: string
  email: string
  inisial: string | null
  avatar: string | null
  // NEW
  bank?: string | null
  norek?: string | null
}
interface User {
  uid: string
  name: string
  email: string
  avatar: string
  progress: number
}

// ====== State ======
const user = ref<User>({
  uid: '',
  name: '',
  email: '',
  avatar: '',
  progress: 0,
})

const isKtpVerified = ref<boolean>(false) // ← status centang biru

const showEditModal = ref(false)
const formInisial = ref<string>('')
const formBank = ref<string>('')
const formNorek = ref<string>('')

// upload state
const avatarFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)

const modal = useApiAlertStore()

// ====== Email helpers ======
const showEmail = ref(false)

function maskEmail(email: string | null | undefined): string {
  if (!email) return '-'
  const [local, domainRaw = ''] = email.split('@')

  let maskedLocal = ''
  if (local.length === 0) maskedLocal = '•••'
  else if (local.length === 1) maskedLocal = local[0] + '•••'
  else maskedLocal = local[0] + '•••' + local[local.length - 1]

  const lastDotIndex = domainRaw.lastIndexOf('.')
  let maskedDomain = '•••'
  if (lastDotIndex !== -1) {
    const tld = domainRaw.slice(lastDotIndex)
    maskedDomain = '•••' + tld
  }
  return `${maskedLocal}@${maskedDomain}`
}

function truncateEmail(email: string, maxLength = 5): string {
  if (email.length <= maxLength) return email
  const [local, domain] = email.split('@')
  if (domain) {
    const truncatedLocal = local.length > maxLength ? local.slice(0, maxLength) + '...' : local
    return `${truncatedLocal}@${domain}`
  }
  return email.slice(0, maxLength) + '...'
}

const emailDisplay = computed(() => {
  if (!user.value?.email) return '-'
  return showEmail.value ? truncateEmail(user.value.email, 5) : maskEmail(user.value.email)
})

async function copyUid(): Promise<void> {
  if (!user.value.uid) return
  try {
    await navigator.clipboard.writeText(user.value.uid)
    modal.open('Copied', 'UID has been copied to clipboard.')
  } catch {
    modal.open('Copy failed', 'Unable to copy UID. Please try again.')
  }
}

function toggleEmailVisibility(): void {
  showEmail.value = !showEmail.value
}

const displayAvatar = computed(() =>
  user.value.avatar && user.value.avatar.trim() !== ''
    ? user.value.avatar
    : '/img/newmenu/profile.png',
)

// ====== Fetch Account ======
async function fetchAccount(): Promise<void> {
  const token = getToken()
  if (!token) return
  try {
    const res = await fetch(`${API_BASE}/data-account`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    })
    const data = (await res.json()) as UserApi

    user.value = {
      uid: data.uid ?? '',
      name: data.inisial ?? '',
      email: data.email ?? '',
      avatar: data.avatar ?? '',
      progress: 1,
    }

    formInisial.value = user.value.name ?? ''
    // NEW: isi form bank & norek dari API
    formBank.value = (data.bank ?? '').toString()
    formNorek.value = (data.norek ?? '').toString()
  } catch (e) {
    console.error(e)
  }
}

// ====== Fetch Verify Status (untuk centang biru) ======
async function fetchVerifyStatus(): Promise<void> {
  const token = getToken()
  if (!token) {
    isKtpVerified.value = false
    return
  }
  try {
    const res = await fetch(`${API_BASE}/cek-status-verify`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(await res.text())
    const data = (await res.json()) as { status_ktp: number; label: string }
    isKtpVerified.value = Number(data?.status_ktp) === 1
  } catch {
    isKtpVerified.value = false
  }
}

// ====== Modal Edit ======
function openEdit(): void {
  formInisial.value = user.value.name ?? ''
  previewUrl.value = null
  avatarFile.value = null
  // pastikan formBank & formNorek tetap isi terakhir (sudah di-set saat fetch)
  showEditModal.value = true
}
function closeEdit(): void {
  showEditModal.value = false
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
  avatarFile.value = null
}
const MAX_BYTES = 1 * 1024 * 1024

function handleAvatarChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  if (!file) return
  if (file.size > MAX_BYTES) {
    modal.open('Upload failed', 'File size exceeds 1 MB.')
    input.value = ''
    return
  }
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  avatarFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}
async function submitEdit(): Promise<void> {
  const token = getToken()
  if (!token) return

  const initial = (formInisial.value ?? '').trim()
  if (initial && !/^[A-Za-z]+$/.test(initial)) {
    modal.open('Invalid Initial', 'Initial must contain only letters (A–Z).')
    return
  }

  const bank = (formBank.value ?? '').trim()
  const norek = (formNorek.value ?? '').trim()

  const fd = new FormData()
  if (initial) fd.append('inisial', initial)
  if (avatarFile.value) fd.append('avatar_file', avatarFile.value)
  // NEW: ikut kirim jika ada isinya
  if (bank) fd.append('bank', bank)
  if (norek) fd.append('norek', norek)

  if ([...fd.keys()].length === 0) {
    modal.open(
      'Nothing to update',
      'Please change initials, bank account, account number, or choose a new avatar.',
    )
    return
  }

  try {
    const res = await fetch(`${API_BASE}/update-data-account`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.message || 'Update failed')

    modal.open('Success', 'Profile updated!', () => {
      if (initial) user.value.name = initial
      if (data?.data?.avatar) user.value.avatar = data.data.avatar
      // optional: refresh nilai form dari server, atau biarkan seperti sekarang
      closeEdit()
    })
  } catch (err: any) {
    modal.open('Error', err?.message || 'Failed to update profile.')
  }
}

onMounted(async () => {
  await Promise.all([fetchAccount(), fetchVerifyStatus()])
})
</script>
