// stores/apiAlert.ts
import { defineStore } from 'pinia'

export const useApiAlertStore = defineStore('apiAlert', {
  state: () => ({
    show: false,
    title: '',
    message: '',
    onClose: null as (() => void) | null, // ⬅️ callback saat modal ditutup
  }),
  actions: {
    open(title: string, message: string, onClose?: () => void) {
      this.title = title
      this.message = message
      this.show = true
      this.onClose = onClose || null
    },
    close() {
      this.show = false
      this.title = ''
      this.message = ''
      if (this.onClose) {
        this.onClose()
        this.onClose = null
      }
    },
  },
})
