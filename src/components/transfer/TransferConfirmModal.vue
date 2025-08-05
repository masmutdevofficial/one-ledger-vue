<template>
  <Teleport to="body">
    <!-- Backdrop (fade) -->
    <transition name="fade">
      <div v-if="show" class="fixed inset-0 z-[100] bg-black/30" @click.self="close"></div>
    </transition>
    <!-- Modal (slide-up) -->
    <transition name="slide-up">
      <div
        v-if="show"
        class="fixed inset-0 z-[101] flex items-end justify-end"
        style="pointer-events: none"
      >
        <div
          class="relative bg-white rounded-t-2xl w-full max-w-md mx-auto shadow-lg px-5 pt-5 pb-7"
          style="pointer-events: auto"
        >
          <!-- Header -->
          <div class="flex items-center mb-4">
            <h2 class="text-center flex-1 font-semibold text-lg text-black">Confirm Payment</h2>
            <button
              aria-label="Close"
              class="text-gray-400 text-2xl font-bold absolute right-3 top-2"
              @click="close"
            >
              ×
            </button>
          </div>
          <!-- User Info -->
          <div class="flex items-center bg-gray-50 rounded-lg p-3 mb-3">
            <img
              src="/img/menu/user.png"
              alt="User avatar"
              class="w-10 h-10 rounded-full bg-gray-200"
            />
            <span class="ml-3 text-gray-700 text-sm font-semibold">
              {{ email ? email : '-' }}
            </span>
          </div>
          <!-- Payment Info -->
          <div class="mb-2 flex justify-between items-center">
            <div>
              <div class="text-gray-400 text-xs">Payee Receives</div>
              <div class="text-black font-semibold text-base">{{ amount }} USDT</div>
              <div class="text-gray-400 text-xs">≈ ${{ amount }}</div>
            </div>
          </div>
          <div class="mb-2 flex justify-between items-center bg-gray-50 rounded-lg p-2">
            <span class="text-gray-500 text-xs">Account</span>
            <span class="text-black text-xs font-semibold">Funding Account</span>
          </div>
          <div class="mb-2 flex justify-between items-center bg-gray-50 rounded-lg p-2">
            <span class="text-gray-500 text-xs">Payment Currency</span>
            <span
              :class="['font-semibold text-xs', insufficient ? 'text-red-500' : 'text-black']"
              >{{ insufficient ? 'Insufficient USDT' : 'USDT' }}</span
            >
          </div>
          <div v-if="insufficient" class="bg-yellow-50 text-yellow-700 rounded-md p-2 mb-2 text-xs">
            Your Fund : {{ balance }} USD
          </div>
          <!-- Continue Button -->
          <button
            class="w-full mt-2 bg-[#3CBDBD] text-white text-base font-normal py-3 rounded-lg"
            :disabled="insufficient || loading"
            @click="confirm"
            :class="{
              'opacity-60': insufficient || loading,
              'cursor-not-allowed': insufficient || loading,
            }"
          >
            <span v-if="loading">Sending...</span>
            <span v-else>Continue</span>
          </button>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  show: boolean
  email: string
  amount: string | number
  balance: string | number
  loading?: boolean
}>()
const emit = defineEmits(['close', 'confirm'])

function close() {
  emit('close')
}
function confirm() {
  if (insufficient.value) return
  emit('confirm')
}

const insufficient = computed(() => Number(props.balance) < Number(props.amount))
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

/* Slide-up animasi untuk modal */
.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(40px);
}
.slide-up-enter-to,
.slide-up-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
