/**
 * Generic localStorage cache composable with TTL support.
 * Replaces duplicated cache patterns across Dashboard, Assets, Market, Trade.
 */

import { isBrowser } from '@/lib/helpers'

export interface LocalCacheOptions {
  /** localStorage key */
  key: string
  /** Time-to-live in milliseconds (default: 5 min) */
  ttlMs?: number
  /** Debounce delay for saves in ms (default: 250) */
  debounceMs?: number
}

export function useLocalCache<T extends Record<string, unknown>>(options: LocalCacheOptions) {
  const { key, debounceMs = 250 } = options

  let cache: T = {} as T
  let saveTimer: ReturnType<typeof setTimeout> | null = null

  /** Load cache from localStorage */
  function load(): T {
    if (!isBrowser()) return cache
    try {
      const raw = localStorage.getItem(key)
      cache = raw ? (JSON.parse(raw) as T) : ({} as T)
    } catch {
      cache = {} as T
    }
    return cache
  }

  /** Get current in-memory cache */
  function get(): T {
    return cache
  }

  /** Update cache in memory (does not save to localStorage yet) */
  function set(data: Partial<T>): void {
    cache = { ...cache, ...data }
  }

  /** Debounced save to localStorage */
  function saveDebounced(): void {
    if (!isBrowser()) return
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(cache))
      } catch {
        // localStorage might be full
      }
      saveTimer = null
    }, debounceMs)
  }

  /** Immediately save to localStorage (bypass debounce) */
  function saveNow(): void {
    if (!isBrowser()) return
    if (saveTimer) {
      clearTimeout(saveTimer)
      saveTimer = null
    }
    try {
      localStorage.setItem(key, JSON.stringify(cache))
    } catch {
      // localStorage might be full
    }
  }

  /** Update a cache field with timestamp and debounce save */
  function upsert<K extends keyof T>(field: K, value: T[K]): void {
    cache[field] = value
    saveDebounced()
  }

  /** Clear the cache from memory and localStorage */
  function clear(): void {
    cache = {} as T
    if (isBrowser()) {
      localStorage.removeItem(key)
    }
  }

  /** Check if a timestamped entry is still within TTL */
  function isValid(ts: number, ttlMs: number): boolean {
    return Date.now() - ts <= ttlMs
  }

  return { load, get, set, upsert, saveDebounced, saveNow, clear, isValid }
}
