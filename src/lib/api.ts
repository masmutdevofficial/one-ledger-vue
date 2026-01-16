import axios from 'axios'

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, '')
}

const base = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000')

export const api = axios.create({
  baseURL: `${base}/api`,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
