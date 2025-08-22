<template>
  <div class="px-4 pb-20 flex-grow">
    <button aria-label="Go back" class="text-black text-xl" @click="goBack">
      <Icon icon="tabler:arrow-left" width="24" height="24" />
    </button>
    <h1 class="text-[18px] font-semibold text-black mb-3">Change Password</h1>
    <div
      class="bg-[#FEF3C7] border border-[#FDE68A] rounded-md p-3 mb-5 text-[12px] text-[#92400E]"
      role="alert"
    >
      <Icon icon="tabler:info-circle" class="mr-1 inline-block w-4 h-4 align-text-bottom" />
      In order to protect your account, withdrawals,
      <span class="font-semibold">P2P</span>
      selling and payment services might be disabled for 24 hours after you change your password.
    </div>
    <form class="space-y-5" @submit.prevent="handleSubmit">
      <!-- New Password -->
      <div>
        <label class="block mb-1 text-[13px] font-normal text-gray-700" for="new-password">
          New Password
        </label>
        <div class="relative">
          <input
            :type="showNewPassword ? 'text' : 'password'"
            autocomplete="new-password"
            class="w-full h-9 rounded-md bg-[#F3F4F6] border border-transparent px-3 pr-10 text-[13px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
            id="new-password"
            v-model="newPassword"
            placeholder=" "
          />
          <button
            aria-label="Toggle new password visibility"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            type="button"
            @click="showNewPassword = !showNewPassword"
            tabindex="-1"
          >
            <Icon :icon="showNewPassword ? 'tabler:eye' : 'tabler:eye-off'" class="w-5 h-5" />
          </button>
        </div>
        <ul class="mt-2 text-[11px] space-y-0.5">
          <li :class="validationClass(isLengthValid)">
            <Icon
              :icon="isLengthValid ? 'tabler:check' : 'tabler:x'"
              class="inline-block w-4 h-4 mr-1"
            />
            8 to 128 characters
          </li>
          <li :class="validationClass(hasNumber)">
            <Icon
              :icon="hasNumber ? 'tabler:check' : 'tabler:x'"
              class="inline-block w-4 h-4 mr-1"
            />
            At least 1 number
          </li>
          <li :class="validationClass(hasUpper)">
            <Icon
              :icon="hasUpper ? 'tabler:check' : 'tabler:x'"
              class="inline-block w-4 h-4 mr-1"
            />
            At least 1 upper case letter
          </li>
        </ul>
      </div>
      <!-- Confirm Password -->
      <div>
        <label class="block mb-1 text-[13px] font-normal text-gray-700" for="confirm-password">
          Confirm Password
        </label>
        <div class="relative">
          <input
            :type="showConfirmPassword ? 'text' : 'password'"
            autocomplete="new-password"
            class="w-full h-9 rounded-md bg-[#F3F4F6] border border-transparent px-3 pr-10 text-[13px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
            id="confirm-password"
            v-model="confirmPassword"
            placeholder=" "
          />
          <button
            aria-label="Toggle confirm password visibility"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            type="button"
            @click="showConfirmPassword = !showConfirmPassword"
            tabindex="-1"
          >
            <Icon :icon="showConfirmPassword ? 'tabler:eye' : 'tabler:eye-off'" class="w-5 h-5" />
          </button>
        </div>
        <div class="mt-2 text-[11px]">
          <span :class="validationClass(passwordsMatch)">
            <Icon
              :icon="passwordsMatch ? 'tabler:check' : 'tabler:x'"
              class="inline-block w-4 h-4 mr-1"
            />
            Passwords match
          </span>
        </div>
      </div>
      <button
        class="w-full h-10 bg-[#5BC6C1] rounded-md text-white text-[13px] font-normal"
        type="submit"
        :disabled="!isFormValid"
        :class="isFormValid ? '' : 'opacity-50 cursor-not-allowed'"
      >
        Confirm
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useApiAlertStore } from '@/stores/apiAlert'

const modal = useApiAlertStore()
const router = useRouter()

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/buy-p2p')
}

// STATE
const newPassword = ref('')
const confirmPassword = ref('')

const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// VALIDATION
const isLengthValid = computed(
  () => newPassword.value.length >= 8 && newPassword.value.length <= 128,
)
const hasNumber = computed(() => /\d/.test(newPassword.value))
const hasUpper = computed(() => /[A-Z]/.test(newPassword.value))
const passwordsMatch = computed(
  () => newPassword.value !== '' && newPassword.value === confirmPassword.value,
)

// ALL VALID?
const isFormValid = computed(
  () => isLengthValid.value && hasNumber.value && hasUpper.value && passwordsMatch.value,
)

function validationClass(valid: boolean) {
  return valid ? 'text-green-600' : 'text-red-500'
}

async function handleSubmit() {
  const token = localStorage.getItem('token')
  if (!token) {
    modal.open('Unauthorized', 'Token tidak ditemukan.')
    return
  }

  try {
    const res = await fetch('https://one-ledger.masmutpanel.my.id/api/change-password', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        new_password: newPassword.value,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      modal.open('Error', data.message || 'Gagal mengganti password.')
      return
    }

    modal.open('Success', data.message || 'Password berhasil diganti.')
    newPassword.value = ''
    confirmPassword.value = ''
  } catch {
    modal.open('Network Error', 'Terjadi kesalahan jaringan.')
  }
}
</script>
