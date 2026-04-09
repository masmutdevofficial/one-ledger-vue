/**
 * Pinia store for authentication state.
 * Provides centralized token management and auth-related actions.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { config } from '@/lib/config'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const isAuthenticated = computed(() => !!token.value?.trim())

  /** Last time the token was validated against the server */
  let lastValidation = 0
  const VALIDATION_TTL = 5 * 60 * 1000 // 5 minutes

  function setToken(newToken: string): void {
    token.value = newToken
    localStorage.setItem('token', newToken)
    lastValidation = Date.now()
  }

  function clearToken(): void {
    token.value = null
    localStorage.removeItem('token')
    lastValidation = 0
  }

  function getToken(): string {
    return token.value || ''
  }

  function getAuthHeaders(): Record<string, string> {
    const t = getToken()
    return t
      ? { Accept: 'application/json', Authorization: `Bearer ${t}` }
      : { Accept: 'application/json' }
  }

  /**
   * Validate the token against the server.
   * Uses a TTL cache to avoid hitting the server on every navigation.
   * Returns true if valid, false if invalid/expired.
   */
  async function validateToken(): Promise<boolean> {
    if (!token.value) return false

    // Skip if recently validated
    if (Date.now() - lastValidation < VALIDATION_TTL) return true

    try {
      const res = await fetch(`${config.apiUrl}/auth-token`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      const data = await res.json()

      if (data.message === 'Unauthenticated.') {
        clearToken()
        return false
      }

      lastValidation = Date.now()
      return true
    } catch {
      // On network error, don't invalidate — allow navigation
      return true
    }
  }

  return {
    token,
    isAuthenticated,
    setToken,
    clearToken,
    getToken,
    getAuthHeaders,
    validateToken,
  }
})
