/**
 * Number formatting utilities used across the application.
 * Replaces duplicated formatNumberId, moneyId, signedPercent, signedMoneyId.
 */

/** Cache of Intl.NumberFormat instances for performance */
const nfCache = new Map<string, Intl.NumberFormat>()

function getNf(min: number, max: number): Intl.NumberFormat {
  const key = `${min}-${max}`
  if (!nfCache.has(key)) {
    nfCache.set(
      key,
      new Intl.NumberFormat('en-US', {
        minimumFractionDigits: min,
        maximumFractionDigits: max,
      }),
    )
  }
  return nfCache.get(key)!
}

/**
 * Format a number with fixed decimal digits using en-US locale.
 * @param nu - The number to format
 * @param digits - Number of decimal digits (default: 2)
 * @returns Formatted string, or '0' if not a finite number
 */
export function formatNumberId(nu: number, digits = 2): string {
  return Number.isFinite(nu) ? getNf(digits, digits).format(nu) : '0'
}

/**
 * Format a number as a dollar amount.
 * @param nu - The number to format
 * @param digits - Number of decimal digits (default: 2)
 * @returns String like "$1,234.56"
 */
export function moneyId(nu: number, digits = 2): string {
  return `$${formatNumberId(nu, digits)}`
}

/**
 * Format a percentage with sign prefix.
 * @param pct - The percentage value
 * @returns String like "+12.34%" or "-5.67%"
 */
export function signedPercent(pct: number): string {
  return (pct >= 0 ? '+' : '') + (Number.isFinite(pct) ? pct.toFixed(2) : '0.00') + '%'
}

/**
 * Format a dollar amount with sign prefix.
 * @param nu - The number to format
 * @param digits - Number of decimal digits (default: 2)
 * @returns String like "+$1,234.56" or "-$1,234.56"
 */
export function signedMoneyId(nu: number, digits = 2): string {
  return (nu >= 0 ? '+' : '-') + moneyId(Math.abs(nu), digits)
}

/**
 * Format a price, using more decimal places for small values.
 * @param nu - The price to format
 * @returns Formatted price string
 */
export function formatPrice(nu: number): string {
  if (!Number.isFinite(nu)) return '0.00'
  const digits = nu >= 1 ? 2 : 6
  return nu.toFixed(digits)
}
