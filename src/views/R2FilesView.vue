<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useR2Files } from '@/composables/useR2Files'

const { items, loading, error, uploadProgress, fetchFiles, uploadFile, deleteFile, refreshUrl } =
  useR2Files()

const selectedFile = ref<File | null>(null)
const folder = ref('')

const isImage = (path: string) => /\.(png|jpe?g|webp)$/i.test(path)

const formatBytes = (bytes: number | null) => {
  if (bytes == null) return '-'
  const units = ['B', 'KB', 'MB', 'GB']
  let n = bytes
  let i = 0
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024
    i++
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

const fileNameFromPath = (path: string) => path.split('/').pop() || path

async function onSubmit() {
  if (!selectedFile.value) return
  await uploadFile(selectedFile.value, folder.value || undefined)
  selectedFile.value = null
}

async function copyUrl(url?: string) {
  if (!url) return
  await navigator.clipboard.writeText(url)
}

function openInNewTab(url?: string) {
  if (!url) return
  window.open(url, '_blank')
}

const sortedItems = computed(() => {
  return [...items.value].sort((a, b) => (a.path < b.path ? 1 : -1))
})

onMounted(() => {
  fetchFiles('uploads/', 50)
})
</script>

<template>
  <div class="p-4 space-y-4">
    <div class="rounded border p-4 space-y-3">
      <h1 class="text-lg font-semibold">R2 Files</h1>

      <form class="flex flex-col gap-3" @submit.prevent="onSubmit">
        <div class="flex flex-col gap-1">
          <label class="text-sm">File</label>
          <input
            class="border rounded p-2"
            type="file"
            @change="(e: any) => (selectedFile = e.target.files?.[0] ?? null)"
          />
          <p class="text-xs text-slate-500">Max 10MB. jpg/png/webp/pdf/docx/txt.</p>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm">Folder (optional)</label>
          <input
            class="border rounded p-2"
            v-model="folder"
            placeholder="mis: kyc atau invoices/2026"
          />
        </div>

        <div class="flex items-center gap-3">
          <button
            class="border rounded px-3 py-2 disabled:opacity-60"
            :disabled="loading || !selectedFile"
            type="submit"
          >
            Upload
          </button>
          <button
            class="border rounded px-3 py-2 disabled:opacity-60"
            :disabled="loading"
            type="button"
            @click="fetchFiles('uploads/', 50)"
          >
            Refresh List
          </button>
          <div v-if="uploadProgress !== null" class="text-sm">Uploading: {{ uploadProgress }}%</div>
        </div>

        <div v-if="error" class="text-sm text-red-600">{{ error }}</div>
      </form>
    </div>

    <div class="rounded border p-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-semibold">Files</h2>
        <div class="text-sm" v-if="loading">Loading…</div>
      </div>

      <div class="overflow-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="text-left border-b">
              <th class="py-2 pr-3">Filename</th>
              <th class="py-2 pr-3">Size</th>
              <th class="py-2 pr-3">Last modified</th>
              <th class="py-2 pr-3">Preview</th>
              <th class="py-2 pr-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="it in sortedItems" :key="it.path" class="border-b align-top">
              <td class="py-2 pr-3">
                <div class="font-medium">{{ fileNameFromPath(it.path) }}</div>
                <div class="text-xs text-slate-500 break-all">{{ it.path }}</div>
              </td>
              <td class="py-2 pr-3">{{ formatBytes(it.size) }}</td>
              <td class="py-2 pr-3">{{ it.last_modified ?? '-' }}</td>
              <td class="py-2 pr-3">
                <img
                  v-if="isImage(it.path) && it.temporary_url"
                  :src="it.temporary_url"
                  alt="preview"
                  class="h-16 w-16 object-cover border rounded"
                />
                <span v-else>-</span>
              </td>
              <td class="py-2 pr-3">
                <div class="flex flex-wrap gap-2">
                  <button
                    class="border rounded px-2 py-1"
                    type="button"
                    @click="refreshUrl(it.path, 10)"
                  >
                    Refresh URL
                  </button>
                  <button
                    class="border rounded px-2 py-1 disabled:opacity-60"
                    type="button"
                    :disabled="!it.temporary_url"
                    @click="copyUrl(it.temporary_url)"
                  >
                    Copy URL
                  </button>
                  <button
                    class="border rounded px-2 py-1 disabled:opacity-60"
                    type="button"
                    :disabled="!it.temporary_url"
                    @click="openInNewTab(it.temporary_url)"
                  >
                    Download
                  </button>
                  <button
                    class="border rounded px-2 py-1"
                    type="button"
                    @click="deleteFile(it.path)"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="sortedItems.length === 0">
              <td class="py-3" colspan="5">No files.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
