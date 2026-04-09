/**
 * Composable for managing synthetic (sim-market) coins.
 * Replaces duplicated synthetic coin logic across DashboardUser, AssetsData,
 * MarketAll, and NewMarketCoin.
 */

import { ref } from 'vue'
import { config } from '@/lib/config'
import { isBrowser, symbolToLowerKey, pairToLowerKey } from '@/lib/helpers'

const DEFAULT_SYNTH_EVER_LS_KEY = 'syntheticSymbolsEver:v1'

export interface SyntheticMarketOptions {
  /** localStorage key for ever-seen synthetic symbols (default: 'syntheticSymbolsEver:v1') */
  everLsKey?: string
}

export function useSyntheticMarket(options: SyntheticMarketOptions = {}) {
  const { everLsKey = DEFAULT_SYNTH_EVER_LS_KEY } = options

  const API_BASE = config.apiUrl

  // State
  const syntheticSymbolsLower = ref<Set<string>>(new Set())
  const syntheticSymbolsEverLower = ref<Set<string>>(new Set())
  const syntheticPairsLower = ref<Set<string>>(new Set())
  const syntheticPairsLoaded = ref(false)
  const syntheticLogoUrlByBase = ref<Record<string, string>>({})

  // Timers
  let synthCheckTimer: ReturnType<typeof setInterval> | null = null

  /** Hydrate ever-seen list from localStorage */
  function hydrateSyntheticEverFromStorage(): void {
    if (!isBrowser()) return
    try {
      const raw = JSON.parse(localStorage.getItem(everLsKey) || '[]')
      if (Array.isArray(raw)) {
        syntheticSymbolsEverLower.value = new Set(
          raw.map((x: unknown) => symbolToLowerKey(String(x || ''))).filter(Boolean),
        )
      }
    } catch {
      // ignore
    }
  }

  /** Persist ever-seen list to localStorage */
  function persistSyntheticEverToStorage(): void {
    if (!isBrowser()) return
    try {
      localStorage.setItem(
        everLsKey,
        JSON.stringify(Array.from(syntheticSymbolsEverLower.value)),
      )
    } catch {
      // ignore
    }
  }

  /** Load synthetic market pairs from API */
  async function loadSyntheticPairs(): Promise<void> {
    try {
      const res = await fetch(`${API_BASE}/sim/market/pairs`, { method: 'GET' })
      if (!res.ok) return
      const json = await res.json().catch(() => null)
      const pairs = Array.isArray((json as Record<string, unknown>)?.pairs)
        ? ((json as Record<string, unknown>).pairs as unknown[])
        : []

      const keys = pairs.map(pairToLowerKey).filter(Boolean)
      syntheticPairsLower.value = new Set(keys)
      syntheticPairsLoaded.value = true

      if (keys.length) {
        syntheticSymbolsEverLower.value = new Set([
          ...syntheticSymbolsEverLower.value,
          ...keys,
        ])
        persistSyntheticEverToStorage()
      }
    } catch {
      // ignore
    }
  }

  /** Load synthetic symbols and logo map from API */
  async function loadSyntheticLogoMap(): Promise<void> {
    hydrateSyntheticEverFromStorage()
    try {
      const res = await fetch(`${API_BASE}/sim/market/symbols`, { method: 'GET' })
      if (!res.ok) return
      const json = await res.json().catch(() => null)
      const rows = Array.isArray((json as Record<string, unknown>)?.symbols)
        ? ((json as Record<string, unknown>).symbols as Record<string, unknown>[])
        : []

      const map: Record<string, string> = {}
      const synth = new Set<string>()
      for (const r of rows) {
        const pair = String(r?.symbol_pair || '').toUpperCase()
        const base = pair.split('/')[0] || ''
        const url = String(r?.logo_url || '')
        if (base && url) map[base] = url
        if (pair) synth.add(pair.replace('/', '').toLowerCase())
      }
      syntheticLogoUrlByBase.value = map
      syntheticSymbolsLower.value = synth

      syntheticSymbolsEverLower.value = new Set([
        ...syntheticSymbolsEverLower.value,
        ...synth,
      ])
      persistSyntheticEverToStorage()
    } catch {
      // ignore
    }
  }

  /** Check if a symbol is a currently active synthetic symbol */
  function isSyntheticSymbol(sym: unknown): boolean {
    const key = symbolToLowerKey(sym)
    return !!key && syntheticSymbolsLower.value.has(key)
  }

  /** Check if a symbol was once synthetic but has been deleted */
  function isDeletedSyntheticSymbol(sym: unknown): boolean {
    const key = symbolToLowerKey(sym)
    if (!key) return false
    if (!syntheticPairsLoaded.value) return false
    return syntheticSymbolsEverLower.value.has(key) && !syntheticPairsLower.value.has(key)
  }

  /** Start periodic checking of synthetic pairs (for detecting deletions) */
  function startSyntheticWatcher(intervalMs = 10_000, onCheck?: () => void): void {
    stopSyntheticWatcher()
    synthCheckTimer = setInterval(async () => {
      await loadSyntheticPairs()
      onCheck?.()
    }, intervalMs)
  }

  /** Stop the periodic synthetic pairs checker */
  function stopSyntheticWatcher(): void {
    if (synthCheckTimer) {
      clearInterval(synthCheckTimer)
      synthCheckTimer = null
    }
  }

  /** Initialize: load from storage and fetch from API */
  async function init(): Promise<void> {
    hydrateSyntheticEverFromStorage()
    await Promise.all([loadSyntheticLogoMap(), loadSyntheticPairs()])
  }

  return {
    // State (reactive)
    syntheticSymbolsLower,
    syntheticSymbolsEverLower,
    syntheticPairsLower,
    syntheticPairsLoaded,
    syntheticLogoUrlByBase,

    // Methods
    init,
    hydrateSyntheticEverFromStorage,
    persistSyntheticEverToStorage,
    loadSyntheticPairs,
    loadSyntheticLogoMap,
    isSyntheticSymbol,
    isDeletedSyntheticSymbol,
    startSyntheticWatcher,
    stopSyntheticWatcher,
  }
}
