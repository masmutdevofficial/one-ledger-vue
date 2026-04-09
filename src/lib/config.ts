/**
 * Centralized application configuration.
 * All URLs and environment-specific values should come from here.
 */

function normalize(url: string): string {
  return url.replace(/\/+$/, '')
}

export const config = {
  /** REST API base URL (without trailing slash) */
  apiBase: normalize(
    import.meta.env.VITE_API_BASE_URL || 'https://tech.oneled.io',
  ),

  /** REST API URL with /api prefix */
  get apiUrl(): string {
    return `${this.apiBase}/api`
  },

  /** WebSocket aggregator URL */
  wsUrl: import.meta.env.VITE_WS_URL || 'wss://ws.hyper-led.com',

  /** Huobi public REST API */
  huobiApi: import.meta.env.VITE_HUOBI_API || 'https://api.huobi.pro',

  /** Public base path (for static assets) */
  basePath: import.meta.env.BASE_URL || '/',
} as const
