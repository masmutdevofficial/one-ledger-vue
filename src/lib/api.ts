import axios from 'axios'
import { config as appConfig } from '@/lib/config'

export const api = axios.create({
  baseURL: `${appConfig.apiBase}/api`,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
})

// Automatically attach auth token to every request
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token')
  if (token) {
    cfg.headers = cfg.headers ?? {}
    cfg.headers.Authorization = `Bearer ${token}`
  }
  return cfg
})

// Handle 401 responses globally — redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('token')
      // Only redirect if we're not already on a public page
      const publicPaths = ['/', '/login', '/register', '/verification', '/forgot-password', '/reset-password']
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login?reason=unauthorized'
      }
    }
    return Promise.reject(err)
  },
)
