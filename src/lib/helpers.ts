/**
 * Reusable helper utilities used across the application.
 */

/** Check if running in a browser environment with localStorage available */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

/** Quote currency type */
export type Quote = 'USDT' | 'USDC' | 'USD'

/**
 * Split a trading pair symbol into base and quote parts.
 * E.g. "BTCUSDT" → { base: "BTC", quote: "USDT" }
 */
export function splitSymbol(sym: string): { base: string; quote: Quote } {
  const s = sym.toUpperCase()
  if (s.endsWith('USDT')) return { base: s.slice(0, -4), quote: 'USDT' }
  if (s.endsWith('USDC')) return { base: s.slice(0, -4), quote: 'USDC' }
  if (s.endsWith('USD')) return { base: s.slice(0, -3), quote: 'USD' }
  return { base: s, quote: 'USDT' }
}

/**
 * Convert a symbol to lowercase key (strip slashes).
 * E.g. "BTC/USDT" → "btcusdt", "BTCUSDT" → "btcusdt"
 */
export function symbolToLowerKey(sym: unknown): string {
  return String(sym || '').toLowerCase().replace('/', '')
}

/**
 * Convert a pair string to lowercase key (normalize to base+quote).
 * E.g. "BTC/USDT" → "btcusdt", "BTCUSDT" → "btcusdt"
 */
export function pairToLowerKey(pair: unknown): string {
  const s = String(pair || '').trim().toUpperCase()
  if (!s) return ''
  const normalized = s.includes('/') ? s : s.endsWith('USDT') ? `${s.slice(0, -4)}/USDT` : s
  if (!normalized.endsWith('/USDT')) return ''
  return normalized.replace('/', '').toLowerCase()
}

/**
 * Safely coerce a value to a finite number, with a fallback default.
 */
export function toNum(v: unknown, d = 0): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : d
}

/** Truncate a string to a maximum length, adding '...' if truncated. */
export function truncate(text: string, limit: number): string {
  return text.length > limit ? text.substring(0, limit) + '...' : text
}
