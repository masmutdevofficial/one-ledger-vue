/**
 * Centralized authentication composable.
 * Replaces scattered localStorage.getItem('token') patterns across 30+ locations.
 */

import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { isBrowser } from '@/lib/helpers'

export function useAuth() {
  const router = useRouter()

  /** Current auth token (read from localStorage) */
  const token = computed(() => (isBrowser() ? localStorage.getItem('token') : null))

  /** Whether the user has a valid-looking token */
  const isAuthenticated = computed(() => !!token.value?.trim())

  /** Get the raw token string, or empty string if not present */
  function getToken(): string {
    return (isBrowser() ? localStorage.getItem('token') : '') || ''
  }

  /** Build auth headers for fetch() calls */
  function getAuthHeaders(): Record<string, string> {
    const t = getToken()
    return t
      ? { Accept: 'application/json', Authorization: `Bearer ${t}` }
      : { Accept: 'application/json' }
  }

  /** Remove token and redirect to login */
  async function logout(reason?: string): Promise<void> {
    if (isBrowser()) localStorage.removeItem('token')
    await router.replace({
      path: '/login',
      query: reason ? { reason } : {},
    })
  }

  /** Handle 401 response — clear token and redirect */
  async function handleUnauthorized(): Promise<void> {
    await logout('unauthorized')
  }

  return {
    token,
    isAuthenticated,
    getToken,
    getAuthHeaders,
    logout,
    handleUnauthorized,
  }
}
