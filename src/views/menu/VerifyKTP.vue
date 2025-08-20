<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import { useApiAlertStore } from '@/stores/apiAlert'

type ImgMime = 'image/png' | 'image/jpeg' | 'image/jpg'
const ALLOWED_IMG_TYPES: ImgMime[] = ['image/png', 'image/jpeg', 'image/jpg']
const MAX_BYTES = 7 * 1024 * 1024 // 7MB

// Refs
const fileInput = ref<HTMLInputElement | null>(null)
const uploadedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)

const hasImagePreview = computed<boolean>(() => Boolean(previewUrl.value))
const previewSrc = computed<string | undefined>(() => previewUrl.value ?? undefined)

const modal = useApiAlertStore()

function goBack(): void {
  window.history.back()
}

function onPickFile(): void {
  fileInput.value?.click()
}

function destroyPreview(): void {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
}

function resetUpload(): void {
  uploadedFile.value = null
  destroyPreview()
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function onFileChange(e: Event): void {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  if (!file) return

  if (file.size > MAX_BYTES) {
    modal.open('Upload failed', 'File size exceeds 7 MB.')
    if (fileInput.value) fileInput.value.value = ''
    return
  }

  if (!ALLOWED_IMG_TYPES.includes(file.type as ImgMime)) {
    // PDF atau tipe non-image: simpan file, tanpa preview
    uploadedFile.value = file
    destroyPreview()
    modal.open('Notice', 'Preview hanya untuk PNG/JPEG/JPG. File tetap tersimpan.')
    return
  }

  // Gambar: simpan & tampilkan preview
  uploadedFile.value = file
  destroyPreview()
  previewUrl.value = URL.createObjectURL(file)
}

function onContinue(): void {
  modal.open('Submitted', 'Logic submit belum diimplementasi.', () => {
    location.reload()
  })
}

// Modal Edit Address
const showEditAddress = ref(false)
const formName = ref<string>('')
const formAddress = ref<string>('')

function openEditAddress(): void {
  showEditAddress.value = true
}
function closeEditAddress(): void {
  showEditAddress.value = false
}
function submitEditAddress(): void {
  showEditAddress.value = false
  modal.open(
    'Address updated',
    `Name: ${formName.value || '-'}\nAddress: ${formAddress.value || '-'}`,
    () => location.reload(),
  )
}

onBeforeUnmount(() => destroyPreview())
</script>

<template>
  <div class="w-full px-4 max-w-md mt-4 mb-20">
    <!-- Header -->
    <header class="flex items-center justify-between mb-6">
      <button aria-label="Back" class="text-gray-400 hover:text-gray-600" @click="goBack">
        <Icon icon="tabler:arrow-left" class="text-lg" />
      </button>
      <button aria-label="Close" class="text-gray-400 hover:text-gray-600" @click="goBack">
        <Icon icon="tabler:x" class="text-lg" />
      </button>
    </header>

    <h1 class="text-2xl font-semibold mb-4">Upload your document</h1>

    <!-- Country -->
    <div class="mb-4 text-sm flex flex-wrap items-center gap-1">
      <span class="mr-1 font-normal">Country:</span>
      <img
        alt="Flag of Indonesia"
        src="https://storage.googleapis.com/a1aa/image/a493048a-e3ca-454c-621d-bfce581727db.jpg"
        class="inline-block"
        width="20"
        height="14"
      />
      <span class="font-normal ml-1 mr-2">Indonesia</span>
      <button type="button" class="text-yellow-600 hover:underline">
        No longer residing here?
      </button>
    </div>

    <!-- Notes -->
    <p class="text-gray-600 text-sm mb-6 leading-relaxed">
      The document must meet specific requirements in order to be accepted for verification:
      <br />
      - Please upload a full page document. Cropped images or screenshots will be rejected.
      <br />
      - Document must contain: Your Name, Your Address, Issue Date, Issuing Authority.
      <br />
      - Please ensure document submitted is real. Failure to provide us with real and accurate
      document may result in a temporary or permanent block on your account.
    </p>

    <!-- Doc spec -->
    <dl class="mb-6 text-sm text-gray-700 leading-relaxed">
      <div class="flex justify-between mb-1">
        <dt>Document</dt>
        <dd class="text-right font-semibold max-w-[50%]">
          Certificate of residence from local government
        </dd>
      </div>
      <div class="flex justify-between mb-1">
        <dt>Issue Date</dt>
        <dd class="text-right font-semibold max-w-[50%]">Within 3 months</dd>
      </div>
      <div class="mb-1">
        <dt>Name on the doc.</dt>
      </div>
      <div>
        <dt>Address on the doc.</dt>
      </div>
    </dl>

    <!-- Edit Address -->
    <div class="mb-6 text-right">
      <button type="button" class="text-yellow-600 hover:underline" @click="openEditAddress">
        Edit Address
      </button>
    </div>

    <!-- Upload -->
    <label class="block mb-2 text-gray-800">Document</label>
    <div
      class="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center py-10 mb-10 relative overflow-hidden"
      style="min-height: 140px"
    >
      <!-- hidden input -->
      <input
        ref="fileInput"
        id="upload"
        name="upload"
        type="file"
        class="hidden"
        accept=".jpg,.jpeg,.png,.pdf"
        @change="onFileChange"
      />

      <!-- area -->
      <template v-if="hasImagePreview">
        <img :src="previewSrc" alt="Preview" class="max-h-64 object-contain" />
        <button
          type="button"
          class="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          @click="resetUpload"
          aria-label="Remove uploaded file"
        >
          <Icon icon="tabler:trash" class="w-5 h-5" />
        </button>
      </template>

      <template v-else>
        <button
          type="button"
          class="cursor-pointer bg-teal-300 hover:bg-teal-400 text-white font-semibold rounded px-6 py-2 select-none"
          @click="onPickFile"
        >
          Upload
        </button>
        <p class="text-xs text-gray-500 mt-2">Max 7 MB in .jpg/.jpeg/.png/.pdf format</p>
      </template>
    </div>

    <!-- Continue -->
    <button
      type="button"
      class="w-full bg-teal-300 hover:bg-teal-400 text-white font-semibold py-3 rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
      @click="onContinue"
    >
      Continue
    </button>

    <!-- Modal: Edit Address -->
    <div
      v-if="showEditAddress"
      class="fixed inset-0 z-[100] bg-black/30 flex items-end sm:items-center justify-center"
    >
      <div
        class="bg-white w-full sm:w-[90vw] sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 shadow-lg"
      >
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-base">Edit Address</h3>
          <button
            class="text-gray-400 hover:text-gray-600"
            @click="closeEditAddress"
            aria-label="Close edit address"
          >
            <Icon icon="tabler:x" class="w-5 h-5" />
          </button>
        </div>

        <form class="space-y-4" @submit.prevent="submitEditAddress">
          <div>
            <label class="block text-sm text-gray-700 mb-1">Name</label>
            <input
              type="text"
              v-model="formName"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">Address</label>
            <textarea
              v-model="formAddress"
              rows="3"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="Your address"
            />
          </div>
          <div class="flex gap-3 pt-2">
            <button
              type="button"
              class="flex-1 py-2 rounded-md bg-gray-200 text-gray-700 font-semibold"
              @click="closeEditAddress"
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
