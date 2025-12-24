<template>
  <div class="w-full px-4 max-w-md mb-20">
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

    <!-- Edit Account (email/username) -->
    <div class="mb-6 text-right">
      <button type="button" class="text-yellow-600 hover:underline" @click="openEditAccount">
        Edit Account
      </button>
    </div>

    <!-- === Status / Upload Area === -->
    <!-- Initial loading -->
    <div v-if="initialLoading" class="py-8 text-sm text-gray-500 text-center">
      Checking verification status…
    </div>

    <!-- Show upload ONLY when Unverified (2) or Unknown (-1) -->
    <template v-else>
      <template v-if="showUpload">
        <!-- Upload -->
        <label class="block mb-2 text-gray-800">Document</label>
        <div
          class="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center py-10 mb-10 relative overflow-hidden"
          style="min-height: 140px">
          <!-- hidden input -->
          <input ref="fileInput" id="upload" name="upload" type="file" class="hidden" accept=".jpg,.jpeg,.png,.pdf"
            @change="onFileChange" />

          <!-- area -->
          <template v-if="hasImagePreview">
            <img :src="previewSrc" alt="Preview" class="max-h-64 object-contain" />
            <button type="button" class="absolute top-3 right-3 text-gray-500 hover:text-gray-700" @click="resetUpload"
              aria-label="Remove uploaded file">
              <Icon icon="tabler:trash" class="w-5 h-5" />
            </button>
          </template>

          <template v-else>
            <button type="button"
              class="cursor-pointer bg-teal-300 hover:bg-teal-400 text-white font-semibold rounded px-6 py-2 select-none disabled:opacity-60"
              @click="onPickFile" :disabled="uploadLoading">
              {{ uploadLoading ? 'Uploading…' : 'Upload' }}
            </button>
            <p class="text-xs text-gray-500 mt-2">Max 7 MB in .jpg/.jpeg/.png/.pdf format</p>
          </template>
        </div>

        <!-- Continue -->
        <button type="button"
          class="w-full bg-teal-300 hover:bg-teal-400 text-white font-semibold py-3 rounded focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:opacity-60"
          @click="onContinue" :disabled="uploadLoading || !uploadedFile">
          {{ uploadLoading ? 'Uploading…' : 'Continue' }}
        </button>
      </template>

      <!-- If Pending(0) or Verified(1) => show current status instead of upload -->
      <template v-else>
        <div class="rounded-lg border border-gray-200 bg-gray-50 p-4 mb-6">
          <div class="text-sm text-gray-700">
            Current verification status:
            <span class="font-semibold" :class="statusClass">{{ verifyStatusLabel }}</span>
          </div>
          <p class="text-xs text-gray-500 mt-2" v-if="verifyStatusNum === 0">
            Your document is under review.
          </p>
          <p class="text-xs text-gray-500 mt-2" v-else-if="verifyStatusNum === 1">
            Your identity has been verified. No further action is needed.
          </p>
        </div>
      </template>
    </template>

    <!-- Modal: Edit Account -->
    <div v-if="showEditAccount" class="fixed inset-0 z-[100] bg-black/30 flex items-end sm:items-center justify-center">
      <div class="bg-white w-full sm:w-[90vw] sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 shadow-lg">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-base">Edit Account</h3>
          <button class="text-gray-400 hover:text-gray-600" @click="closeEditAccount" aria-label="Close edit account">
            <Icon icon="tabler:x" class="w-5 h-5" />
          </button>
        </div>

        <form class="space-y-4" @submit.prevent="submitEditAccount">
          <div>
            <label class="block text-sm text-gray-700 mb-1">Email</label>
            <input type="email" v-model.trim="formEmail"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="you@example.com" required />
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">Username (optional)</label>
            <input type="text" v-model.trim="formUsername"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="your username" />
          </div>

          <p v-if="editError" class="text-xs text-red-600 -mt-2">{{ editError }}</p>

          <div class="flex gap-3 pt-2">
            <button type="button" class="flex-1 py-2 rounded-md bg-gray-200 text-gray-700 font-semibold"
              @click="closeEditAccount" :disabled="editLoading">
              Cancel
            </button>
            <button type="submit"
              class="flex-1 py-2 rounded-md bg-teal-500 text-white font-semibold hover:bg-teal-600 disabled:opacity-60"
              :disabled="editLoading">
              {{ editLoading ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    <!-- /Modal -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useApiAlertStore } from '@/stores/apiAlert'

/* ===== API helpers ===== */
const API_BASE = 'https://abc.oneled.io/api'
const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '')
async function authFetch(path: string, init: RequestInit = {}) {
  const token = getToken()
  if (!token) throw new Error('Token not found')
  const headers: HeadersInit = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
    ...(init.headers || {}),
  }
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers, credentials: 'include' })
  const text = await res.text().catch(() => '')
  if (!res.ok) {
    try {
      const j = text ? JSON.parse(text) : {}
      const msg = j?.message || `HTTP ${res.status}`
      throw Object.assign(new Error(msg), { details: j })
    } catch {
      throw new Error(text || `HTTP ${res.status}`)
    }
  }
  return { text, json: () => (text ? JSON.parse(text) : {}) }
}

/* ===== Upload states ===== */
type ImgMime = 'image/png' | 'image/jpeg' | 'image/jpg'
const ALLOWED_IMG_TYPES: ImgMime[] = ['image/png', 'image/jpeg', 'image/jpg']
const MAX_BYTES = 7 * 1024 * 1024 // 7MB

const fileInput = ref<HTMLInputElement | null>(null)
const uploadedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const uploadLoading = ref(false)

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
  if (fileInput.value) fileInput.value.value = ''
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

  const isImage = ALLOWED_IMG_TYPES.includes(file.type as ImgMime)
  const isPdf = file.type === 'application/pdf'
  if (!isImage && !isPdf) {
    modal.open('Upload failed', 'Only JPG, PNG, or PDF files are allowed.')
    if (fileInput.value) fileInput.value.value = ''
    return
  }

  uploadedFile.value = file
  destroyPreview()
  if (isImage) {
    previewUrl.value = URL.createObjectURL(file)
  } else {
    modal.open('Notice', 'Preview is only available for images. File stored.')
  }
}

async function onContinue(): Promise<void> {
  try {
    if (!uploadedFile.value) {
      modal.open('Upload failed', 'Please select a file first.')
      return
    }
    uploadLoading.value = true
    const fd = new FormData()
    fd.append('ktp_file', uploadedFile.value)

    await authFetch('/upload-verify', { method: 'POST', body: fd })
    modal.open('Submitted', 'Document uploaded. Status set to Pending.')

    // refresh status → UI otomatis sembunyikan upload jika status menjadi Pending
    await fetchVerifyStatus()
  } catch (e: any) {
    modal.open('Error', e?.message || 'Upload failed.')
  } finally {
    uploadLoading.value = false
  }
}

/* ===== Verify status ===== */
const verifyStatusNum = ref<number | null>(null) // -1=Unknown, 0=Pending,1=Verified,2=Unverified
const verifyStatusLabel = ref<string>('Unknown')
const statusLoading = ref(false)
const initialLoading = ref(true) // untuk cegah flicker saat first load

const statusClass = computed(() => {
  switch (verifyStatusNum.value) {
    case 1:
      return 'text-teal-600'
    case 2:
      return 'text-red-500'
    case 0:
      return 'text-yellow-600'
    default:
      return 'text-gray-500'
  }
})

/** Tampilkan upload hanya jika Unverified (2) atau Unknown (-1) */
const showUpload = computed<boolean>(() => {
  return verifyStatusNum.value === 2 || verifyStatusNum.value === -1
})

async function fetchVerifyStatus(): Promise<void> {
  try {
    statusLoading.value = true
    const { json } = await authFetch('/cek-status-verify', { method: 'GET' })
    const data = json() as { status_ktp: number; label: string }
    const s = Number.isFinite(Number(data?.status_ktp)) ? Number(data.status_ktp) : -1
    verifyStatusNum.value = s
    verifyStatusLabel.value =
      typeof data?.label === 'string' && data.label ? data.label : s === -1 ? 'Unknown' : String(s)
  } catch (e: any) {
    verifyStatusNum.value = -1
    verifyStatusLabel.value = 'Unknown'
    // tidak perlu popup saat load awal; user bisa klik Refresh
  } finally {
    statusLoading.value = false
  }
}

/* ===== Edit Account (email/username) ===== */
const showEditAccount = ref(false)
const formEmail = ref<string>('')
const formUsername = ref<string>('')
const editLoading = ref(false)
const editError = ref<string>('')

function openEditAccount(): void {
  showEditAccount.value = true
  editError.value = ''
}
function closeEditAccount(): void {
  showEditAccount.value = false
}
async function submitEditAccount(): Promise<void> {
  try {
    editLoading.value = true
    editError.value = ''
    const payload: Record<string, unknown> = { email: formEmail.value.trim() }
    if (formUsername.value.trim().length) payload.username = formUsername.value.trim()

    const { json } = await authFetch('/edit-address-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = json() as { message?: string }
    modal.open('Updated', data?.message || 'Account updated.')
    closeEditAccount()
  } catch (e: any) {
    const details = e?.details
    const msg =
      details?.errors?.email?.[0] || details?.message || e?.message || 'Failed to update account.'
    editError.value = String(msg)
  } finally {
    editLoading.value = false
  }
}

/* lifecycle */
onMounted(async () => {
  await fetchVerifyStatus()
  initialLoading.value = false
})

onBeforeUnmount(() => destroyPreview())
</script>
