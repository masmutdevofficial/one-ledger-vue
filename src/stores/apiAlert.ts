import { defineStore } from 'pinia'

export const useApiAlertStore = defineStore('apiAlert', {
  state: () => ({
    show: false,
    title: '',
    message: '',
  }),
  actions: {
    open(title: string, message: string) {
      this.title = title
      this.message = message
      this.show = true
    },
    close() {
      this.show = false
      this.title = ''
      this.message = ''
    },
  },
})
