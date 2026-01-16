import { ref } from 'vue'
import { api } from '@/lib/api'
import type { AxiosError } from 'axios'

export type R2FileItem = {
  path: string
  size: number | null
  last_modified: string | null
  temporary_url?: string
}

export function useR2Files() {
  const items = ref<R2FileItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const uploadProgress = ref<number | null>(null)

  function toErrorMessage(err: unknown, fallback: string) {
    const axiosErr = err as AxiosError<{ message?: string }>
    if (axiosErr?.response?.data?.message) return axiosErr.response.data.message
    if (err instanceof Error && err.message) return err.message
    return fallback
  }

  async function fetchFiles(prefix = 'uploads/', limit = 50) {
    loading.value = true
    error.value = null
    try {
      const res = await api.get<{ items: R2FileItem[] }>('/files', {
        params: { prefix, limit },
      })
      items.value = res.data.items
    } catch (e: unknown) {
      error.value = toErrorMessage(e, 'Failed to fetch files')
    } finally {
      loading.value = false
    }
  }

  async function uploadFile(file: File, folder?: string) {
    loading.value = true
    error.value = null
    uploadProgress.value = 0

    try {
      const form = new FormData()
      form.append('file', file)
      if (folder) form.append('folder', folder)

      const res = await api.post<{
        path: string
        size: number
        mime: string
        temporary_url: string
      }>('/files', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (!evt.total) return
          uploadProgress.value = Math.round((evt.loaded / evt.total) * 100)
        },
      })

      // Refresh list to include last_modified/size from storage listing
      await fetchFiles('uploads/', 50)

      return res.data
    } catch (e: unknown) {
      error.value = toErrorMessage(e, 'Failed to upload')
      throw e
    } finally {
      loading.value = false
      uploadProgress.value = null
    }
  }

  async function deleteFile(path: string) {
    loading.value = true
    error.value = null
    try {
      await api.delete('/files', { data: { path } })
      items.value = items.value.filter((i) => i.path !== path)
    } catch (e: unknown) {
      error.value = toErrorMessage(e, 'Failed to delete')
      throw e
    } finally {
      loading.value = false
    }
  }

  async function refreshUrl(path: string, minutes = 10) {
    error.value = null
    const res = await api.get<{ temporary_url: string }>('/files/url', {
      params: { path, minutes },
    })

    const idx = items.value.findIndex((i) => i.path === path)
    if (idx >= 0) {
      items.value[idx] = { ...items.value[idx], temporary_url: res.data.temporary_url }
    }

    return res.data.temporary_url
  }

  return {
    items,
    loading,
    error,
    uploadProgress,
    fetchFiles,
    uploadFile,
    deleteFile,
    refreshUrl,
  }
}
