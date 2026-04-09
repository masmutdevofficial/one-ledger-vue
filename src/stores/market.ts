/**
 * Pinia store for market data.
 * Provides shared price data across Dashboard, Assets, Market, and Trade views.
 */

import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useMarketStore = defineStore('market', () => {
  /** Map of symbol (UPPER) → last price */
  const prices = reactive<Record<string, number>>({})

  /** Map of symbol (UPPER) → day open price */
  const dayOpen = reactive<Record<string, number>>({})

  /** Update a price for a symbol */
  function setPrice(symbolUpper: string, price: number): void {
    prices[symbolUpper] = price
  }

  /** Update day open for a symbol */
  function setDayOpen(symbolUpper: string, open: number): void {
    dayOpen[symbolUpper] = open
  }

  /** Get percentage change */
  function getChange(symbolUpper: string): number | null {
    const last = prices[symbolUpper]
    const open = dayOpen[symbolUpper]
    if (!last || !open || open === 0) return null
    return ((last - open) / open) * 100
  }

  return { prices, dayOpen, setPrice, setDayOpen, getChange }
})
