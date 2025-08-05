<template>
  <div class="max-w-md mt-5 mx-4">
    <h1 class="text-black text-lg font-normal mb-3">Send to OneLedger User</h1>
    <label for="emailPhone" class="block text-gray-400 text-xs font-normal mb-1">
      Email / Phone
    </label>
    <input
      id="emailPhone"
      type="text"
      v-model="emailPhone"
      placeholder="Email/Phone"
      class="w-full bg-gray-100 text-gray-400 placeholder-gray-400 rounded-lg py-3 px-4 mb-4 text-sm font-normal focus:outline-none"
    />
    <button
      type="button"
      class="w-full bg-teal-400 text-white text-sm font-normal py-3 rounded-lg"
      @click="handleContinue"
    >
      Continue
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emailPhone = ref('')

function handleContinue() {
  if (!emailPhone.value.trim()) {
    alert('Please enter email or phone!')
    return
  }
  // TODO: proses ke API atau halaman selanjutnya
  // contoh, redirect/emit event
  console.log('Continue with:', emailPhone.value)
}
</script>
