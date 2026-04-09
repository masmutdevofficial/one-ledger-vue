/**
 * Single source of truth for cryptocurrency symbol metadata.
 * Previously duplicated in MainLayout.vue, AssetsData.vue, and NewMarketCoin.vue.
 */

import { config } from '@/lib/config'
import type { Quote } from '@/lib/helpers'

export interface SymbolMeta {
  name: string
  logoUrl: string
  quote: Quote
}

/** Generate local logo URL from base symbol name */
export function localLogo(symbol: string): string {
  return `${config.basePath}img/crypto/${symbol.toLowerCase()}.svg`
}

/** Default fallback icon for unknown coins */
export const ICON_FALLBACK = '/img/crypto/_default.svg'

/** Generate icon path from symbol name */
export function iconPath(symbol: string): string {
  return `/img/crypto/${symbol.toLowerCase()}.svg`
}

/**
 * All supported cryptocurrency metadata.
 * Add new coins here — all views will pick them up automatically.
 */
export const SYMBOL_META: Record<string, SymbolMeta> = {
  BTC: { name: 'Bitcoin', logoUrl: localLogo('btc'), quote: 'USDT' },
  ETH: { name: 'Ethereum', logoUrl: localLogo('eth'), quote: 'USDT' },
  BNB: { name: 'BNB (Binance Coin)', logoUrl: localLogo('bnb'), quote: 'USDT' },
  SOL: { name: 'Solana', logoUrl: localLogo('sol'), quote: 'USDT' },
  LTC: { name: 'Litecoin', logoUrl: localLogo('ltc'), quote: 'USDT' },
  LINK: { name: 'Chainlink', logoUrl: localLogo('link'), quote: 'USDT' },
  TON: { name: 'Toncoin', logoUrl: localLogo('ton'), quote: 'USDT' },
  SUI: { name: 'Sui', logoUrl: localLogo('sui'), quote: 'USDT' },
  XRP: { name: 'XRP', logoUrl: localLogo('xrp'), quote: 'USDT' },
  QTUM: { name: 'Qtum', logoUrl: localLogo('qtum'), quote: 'USDT' },
  THETA: { name: 'Theta Network', logoUrl: localLogo('theta'), quote: 'USDT' },
  ADA: { name: 'Cardano', logoUrl: localLogo('ada'), quote: 'USDT' },
  RAD: { name: 'Radworks (RAD)', logoUrl: localLogo('rad'), quote: 'USDT' },
  BAND: { name: 'Band Protocol', logoUrl: localLogo('band'), quote: 'USDT' },
  ALGO: { name: 'Algorand', logoUrl: localLogo('algo'), quote: 'USDT' },
  POL: { name: 'Polygon Matic (POL)', logoUrl: localLogo('pol'), quote: 'USDT' },
  DOGE: { name: 'Dogecoin', logoUrl: localLogo('doge'), quote: 'USDT' },
  LUNA: { name: 'Terra (LUNA)', logoUrl: localLogo('luna'), quote: 'USDT' },
  GALA: { name: 'Gala', logoUrl: localLogo('gala'), quote: 'USDT' },
  PEPE: { name: 'Pepe', logoUrl: localLogo('pepe'), quote: 'USDT' },
  CFX: { name: 'Conflux', logoUrl: localLogo('cfx'), quote: 'USDT' },
  TRX: { name: 'TRON', logoUrl: localLogo('trx'), quote: 'USDT' },
  TRUMP: { name: 'TRUMP', logoUrl: localLogo('trump'), quote: 'USDT' },
  SHIB: { name: 'Shiba Inu', logoUrl: localLogo('shib'), quote: 'USDT' },
  ARB: { name: 'Arbitrum', logoUrl: localLogo('arb'), quote: 'USDT' },
  FIL: { name: 'Filecoin', logoUrl: localLogo('fil'), quote: 'USDT' },
  API3: { name: 'API3', logoUrl: localLogo('api3'), quote: 'USDT' },
  ENA: { name: 'Ethena', logoUrl: localLogo('ena'), quote: 'USDT' },
  BIO: { name: 'BIO', logoUrl: localLogo('bio'), quote: 'USDT' },
  UNI: { name: 'Uniswap', logoUrl: localLogo('uni'), quote: 'USDT' },
  BTT: { name: 'BitTorrent', logoUrl: localLogo('btt'), quote: 'USDT' },
  SATS: { name: 'SATS', logoUrl: localLogo('sats'), quote: 'USDT' },
  MEME: { name: 'MEME', logoUrl: localLogo('meme'), quote: 'USDT' },
  GT: { name: 'GateToken', logoUrl: localLogo('gt'), quote: 'USDT' },
  OP: { name: 'Optimism', logoUrl: localLogo('op'), quote: 'USDT' },
  AAVE: { name: 'Aave', logoUrl: localLogo('aave'), quote: 'USDT' },
  SNAKES: { name: 'SNAKES', logoUrl: localLogo('snakes'), quote: 'USDT' },
  TIA: { name: 'Celestia', logoUrl: localLogo('tia'), quote: 'USDT' },
  SOON: { name: 'SOON', logoUrl: localLogo('soon'), quote: 'USDT' },
  ONDO: { name: 'Ondo', logoUrl: localLogo('ondo'), quote: 'USDT' },
  NEO: { name: 'NEO', logoUrl: localLogo('neo'), quote: 'USDT' },
  SKL: { name: 'SKALE', logoUrl: localLogo('skl'), quote: 'USDT' },
  MX: { name: 'MEXC (MX)', logoUrl: localLogo('mx'), quote: 'USDT' },
  FARTCOIN: { name: 'Fartcoin', logoUrl: localLogo('fartcoin'), quote: 'USDT' },
  RATS: { name: 'RATS', logoUrl: localLogo('rats'), quote: 'USDT' },
  ETC: { name: 'Ethereum Classic', logoUrl: localLogo('etc'), quote: 'USDT' },
  TRB: { name: 'Tellor', logoUrl: localLogo('trb'), quote: 'USDT' },
  AVAX: { name: 'Avalanche', logoUrl: localLogo('avax'), quote: 'USDT' },
  BCH: { name: 'Bitcoin Cash', logoUrl: localLogo('bch'), quote: 'USDT' },
  BSV: { name: 'Bitcoin SV', logoUrl: localLogo('bsv'), quote: 'USDT' },
  IOTA: { name: 'IOTA', logoUrl: localLogo('iota'), quote: 'USDT' },
  CYBER: { name: 'Cyber', logoUrl: localLogo('cyber'), quote: 'USDT' },
  WIF: { name: 'dogwifhat', logoUrl: localLogo('wif'), quote: 'USDT' },
  CORE: { name: 'Core', logoUrl: localLogo('core'), quote: 'USDT' },
  WLD: { name: 'Worldcoin', logoUrl: localLogo('wld'), quote: 'USDT' },
  SEI: { name: 'Sei', logoUrl: localLogo('sei'), quote: 'USDT' },
  VIRTUAL: { name: 'VIRTUAL', logoUrl: localLogo('virtual'), quote: 'USDT' },
  RENDER: { name: 'Render', logoUrl: localLogo('render'), quote: 'USDT' },
  MOODENG: { name: 'MOODENG', logoUrl: localLogo('moodeng'), quote: 'USDT' },
  JUP: { name: 'Jupiter', logoUrl: localLogo('jup'), quote: 'USDT' },
  PONKE: { name: 'PONKE', logoUrl: localLogo('ponke'), quote: 'USDT' },
  MNT: { name: 'Mantle', logoUrl: localLogo('mnt'), quote: 'USDT' },
  PNUT: { name: 'PNUT', logoUrl: localLogo('pnut'), quote: 'USDT' },
  EIGEN: { name: 'EIGEN', logoUrl: localLogo('eigen'), quote: 'USDT' },
  GRASS: { name: 'GRASS', logoUrl: localLogo('grass'), quote: 'USDT' },
  RAY: { name: 'Raydium', logoUrl: localLogo('ray'), quote: 'USDT' },
  EPIC: { name: 'EPIC', logoUrl: localLogo('epic'), quote: 'USDT' },
  ZRO: { name: 'LayerZero (ZRO)', logoUrl: localLogo('zro'), quote: 'USDT' },
  BERA: { name: 'Berachain', logoUrl: localLogo('bera'), quote: 'USDT' },
  CA: { name: 'CA', logoUrl: localLogo('ca'), quote: 'USDT' },
  IP: { name: 'IP', logoUrl: localLogo('ip'), quote: 'USDT' },
  KAITO: { name: 'Kaito', logoUrl: localLogo('kaito'), quote: 'USDT' },
  OMNI: { name: 'Omni Network', logoUrl: localLogo('omni'), quote: 'USDT' },
  A8: { name: 'A8', logoUrl: localLogo('a8'), quote: 'USDT' },
  OBOL: { name: 'Obol', logoUrl: localLogo('obol'), quote: 'USDT' },
  SAGA: { name: 'Saga', logoUrl: localLogo('saga'), quote: 'USDT' },
  ORCA: { name: 'Orca', logoUrl: localLogo('orca'), quote: 'USDT' },
  SHELL: { name: 'Shell', logoUrl: localLogo('shell'), quote: 'USDT' },
  NAKA: { name: 'Nakamoto Games', logoUrl: localLogo('naka'), quote: 'USDT' },
}

/** Sorted list of all supported symbol keys */
export const SYMBOL_LIST = Object.keys(SYMBOL_META)
