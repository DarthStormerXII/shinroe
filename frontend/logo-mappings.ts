export const CHAIN_LOGOS = {
  747: '/chain-logos/flow.png',        // Flow EVM
  8453: '/chain-logos/base.png',       // Base
  137: '/chain-logos/polygon.png',     // Polygon
  534352: '/chain-logos/scroll.jpg',   // Scroll
  97476: '/chain-logos/doma.png',   // Doma Testnet
} as const

export const TOKEN_LOGOS = {
  USDT: '/token-logos/usdt.png',
  USDC: '/token-logos/usdc.png',
  DAI: '/token-logos/dai.png',
  WETH: '/token-logos/weth.png',
  WBTC: '/token-logos/wbtc.png',
} as const

export const CHAIN_LOGO_MAPPINGS = {
  flow: '/chain-logos/flow.png',
  'flow-evm': '/chain-logos/flow.png',
  base: '/chain-logos/base.png',
  polygon: '/chain-logos/polygon.png',
  scroll: '/chain-logos/scroll.jpg',
  doma: '/chain-logos/doma.png',
} as const

export const TOKEN_LOGO_MAPPINGS = {
  usdt: '/token-logos/usdt.png',
  tether: '/token-logos/usdt.png',
  usdc: '/token-logos/usdc.png',
  'usd-coin': '/token-logos/usdc.png',
  dai: '/token-logos/dai.png',
  'dai-stablecoin': '/token-logos/dai.png',
  weth: '/token-logos/weth.png',
  'wrapped-ether': '/token-logos/weth.png',
  'wrapped-ethereum': '/token-logos/weth.png',
  wbtc: '/token-logos/wbtc.png',
  'wrapped-bitcoin': '/token-logos/wbtc.png',
  'wrapped-btc': '/token-logos/wbtc.png',
} as const

/**
 * Get chain logo path by chain ID
 */
export function getLocalChainLogo(chainId: number): string | null {
  return CHAIN_LOGOS[chainId as keyof typeof CHAIN_LOGOS] || null
}

/**
 * Get chain logo path by chain name
 */
export function getLocalChainLogoByName(chainName: string): string | null {
  const normalizedName = chainName.toLowerCase().replace(/\s+/g, '-')
  return CHAIN_LOGO_MAPPINGS[normalizedName as keyof typeof CHAIN_LOGO_MAPPINGS] || null
}

/**
 * Get token logo path by token symbol
 */
export function getLocalTokenLogo(tokenSymbol: string): string | null {
  const normalizedSymbol = tokenSymbol.toUpperCase()
  return TOKEN_LOGOS[normalizedSymbol as keyof typeof TOKEN_LOGOS] || null
}

/**
 * Get token logo path by token name or coingecko ID
 */
export function getLocalTokenLogoByName(tokenName: string): string | null {
  const normalizedName = tokenName.toLowerCase().replace(/\s+/g, '-')
  return TOKEN_LOGO_MAPPINGS[normalizedName as keyof typeof TOKEN_LOGO_MAPPINGS] || null
}

/**
 * Check if a local logo exists for the given chain ID
 */
export function hasLocalChainLogo(chainId: number): boolean {
  return chainId in CHAIN_LOGOS
}

/**
 * Check if a local logo exists for the given token symbol
 */
export function hasLocalTokenLogo(tokenSymbol: string): boolean {
  const normalizedSymbol = tokenSymbol.toUpperCase()
  return normalizedSymbol in TOKEN_LOGOS
}