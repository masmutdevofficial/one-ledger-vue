<!-- components/LanguageSelector.vue -->
<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="show" class="fixed inset-0 bg-black/30 z-[100]" @click.self="close" />
    </transition>

    <transition name="slide-up">
      <div
        v-if="show"
        class="fixed inset-0 z-[101] flex items-end justify-center"
        style="pointer-events: none"
      >
        <div
          class="bg-white w-full max-w-md mx-auto rounded-t-2xl px-5 pt-5 pb-7 shadow-lg"
          style="pointer-events: auto"
        >
          <!-- Header -->
          <div class="flex items-center mb-4">
            <h2 class="text-center flex-1 font-semibold text-lg text-black">Language</h2>
            <button
              aria-label="Close"
              class="text-gray-400 text-2xl font-bold relative right-3 top-0"
              @click="close"
            >
              <Icon icon="tabler:x" class="w-5 h-5" />
            </button>
          </div>

          <!-- Search (UI Only) -->
          <div class="mb-4">
            <div class="flex items-center bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-500">
              <Icon icon="tabler:search" class="w-5 h-5" /> <span class="ml-2">Search</span>
            </div>
          </div>

          <!-- Language Options -->
          <div class="flex flex-col space-y-3 text-sm font-semibold text-black">
            <div class="flex justify-between items-center" @click="selectLanguage('en')">
              <span>English</span>
              <span v-if="selectedLang === 'en'"><Icon icon="tabler:check" class="w-5 h-5" /></span>
            </div>
            <div class="flex justify-between items-center" @click="selectLanguage('id')">
              <span>Bahasa Indonesia</span>
              <span v-if="selectedLang === 'id'"><Icon icon="tabler:check" class="w-5 h-5" /></span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

const { selectedLang } = defineProps<{
  show: boolean
  selectedLang: string
}>()

const emit = defineEmits(['close', 'update'])

function close() {
  emit('close')
}

function selectLanguage(lang: string) {
  localStorage.setItem('language', lang)
  emit('update', lang)
  close()
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(40px);
  opacity: 0;
}
.slide-up-enter-to,
.slide-up-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>
