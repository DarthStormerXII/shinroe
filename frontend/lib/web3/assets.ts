/**
 * Asset management utilities for blockchain and token logos
 * Uses multiple CDN sources for reliability and fallback support
 * Integrates with CoinGecko API for real-time data and images
 */

import { getLocalChainLogo, getLocalTokenLogo, getLocalTokenLogoByName } from '../../logo-mappings'

// Chain IDs for major blockchains
export const CHAIN_IDS = {
  ETHEREUM: 1,
  POLYGON: 137,
  ARBITRUM: 42161,
  OPTIMISM: 10,
  BASE: 8453,
  BSC: 56,
  AVALANCHE: 43114,
  FANTOM: 250,
  GNOSIS: 100,
  ZKSYNC: 324,
  LINEA: 59144,
  SCROLL: 534352,
  BLAST: 81457,
  MANTA: 169,
  MODE: 34443,
  FLOW: 747,
  // Testnets
  SEPOLIA: 11155111,
  ARBITRUM_SEPOLIA: 421614,
  BASE_SEPOLIA: 84532,
  AVALANCHE_FUJI: 43113,
  // Other chains
  CELO: 42220,
  MOONBEAM: 1284,
  STORY_AENID: 1315,
} as const

// Chain metadata with logo sources
export const CHAIN_METADATA: Record<number, {
  name: string
  symbol: string
  coingeckoId?: string
  color: string
  logo: string
}> = {
  [CHAIN_IDS.ETHEREUM]: {
    name: 'Ethereum',
    symbol: 'ETH',
    coingeckoId: 'ethereum',
    color: '#627EEA',
    logo: 'https://coin-logos.simplr.sh/images/ethereum/standard.png'
  },
  [CHAIN_IDS.POLYGON]: {
    name: 'Polygon',
    symbol: 'POL',
    coingeckoId: 'polygon-ecosystem-token',
    color: '#8247E5',
    logo: '/chain-logos/polygon.png'
  },
  [CHAIN_IDS.ARBITRUM]: {
    name: 'Arbitrum',
    symbol: 'ARB',
    coingeckoId: 'arbitrum',
    color: '#28A0F0',
    logo: 'https://coin-logos.simplr.sh/images/arbitrum/standard.png'
  },
  [CHAIN_IDS.OPTIMISM]: {
    name: 'Optimism',
    symbol: 'OP',
    coingeckoId: 'optimism',
    color: '#FF0420',
    logo: 'https://coin-logos.simplr.sh/images/optimism/standard.png'
  },
  [CHAIN_IDS.BASE]: {
    name: 'Base',
    symbol: 'ETH',
    coingeckoId: 'base',
    color: '#0052FF',
    logo: '/chain-logos/base.png'
  },
  [CHAIN_IDS.BSC]: {
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    coingeckoId: 'binancecoin',
    color: '#F3BA2F',
    logo: 'https://coin-logos.simplr.sh/images/binancecoin/standard.png'
  },
  [CHAIN_IDS.AVALANCHE]: {
    name: 'Avalanche',
    symbol: 'AVAX',
    coingeckoId: 'avalanche-2',
    color: '#E84142',
    logo: 'https://coin-logos.simplr.sh/images/avalanche-2/standard.png'
  },
  [CHAIN_IDS.FANTOM]: {
    name: 'Fantom',
    symbol: 'FTM',
    coingeckoId: 'fantom',
    color: '#1969FF',
    logo: 'https://coin-logos.simplr.sh/images/fantom/standard.png'
  },
  [CHAIN_IDS.GNOSIS]: {
    name: 'Gnosis',
    symbol: 'GNO',
    coingeckoId: 'gnosis',
    color: '#04795B',
    logo: 'https://coin-logos.simplr.sh/images/gnosis/standard.png'
  },
  [CHAIN_IDS.ZKSYNC]: {
    name: 'zkSync Era',
    symbol: 'ETH',
    coingeckoId: 'zksync',
    color: '#8C8DFC',
    logo: 'https://raw.githubusercontent.com/matter-labs/zksync-era-brand-assets/main/symbols/symbol.svg'
  },
  [CHAIN_IDS.LINEA]: {
    name: 'Linea',
    symbol: 'ETH',
    coingeckoId: 'linea',
    color: '#121212',
    logo: 'https://raw.githubusercontent.com/Consensys/linea-brand-assets/main/linea-logo-black.svg'
  },
  [CHAIN_IDS.SCROLL]: {
    name: 'Scroll',
    symbol: 'ETH',
    coingeckoId: 'scroll',
    color: '#FFEEDA',
    logo: '/chain-logos/scroll.jpg'
  },
  [CHAIN_IDS.BLAST]: {
    name: 'Blast',
    symbol: 'ETH',
    coingeckoId: 'blast',
    color: '#FCFC03',
    logo: 'https://coin-logos.simplr.sh/images/blast/standard.png'
  },
  [CHAIN_IDS.MANTA]: {
    name: 'Manta Pacific',
    symbol: 'ETH',
    coingeckoId: 'manta',
    color: '#000000',
    logo: 'https://coin-logos.simplr.sh/images/manta-network/standard.png'
  },
  [CHAIN_IDS.MODE]: {
    name: 'Mode',
    symbol: 'ETH',
    coingeckoId: 'mode',
    color: '#DFFE00',
    logo: 'https://raw.githubusercontent.com/mode-network/brand-assets/main/mode-logo-circle.svg'
  },
  [CHAIN_IDS.FLOW]: {
    name: 'Flow EVM',
    symbol: 'FLOW',
    coingeckoId: 'flow',
    color: '#00D368',
    logo: '/chain-logos/flow.png'
  },
  // Testnets
  [CHAIN_IDS.SEPOLIA]: {
    name: 'Sepolia',
    symbol: 'ETH',
    coingeckoId: 'ethereum',
    color: '#627EEA',
    logo: 'https://coin-logos.simplr.sh/images/ethereum/standard.png'
  },
  [CHAIN_IDS.ARBITRUM_SEPOLIA]: {
    name: 'Arbitrum Sepolia',
    symbol: 'ETH',
    coingeckoId: 'arbitrum',
    color: '#28A0F0',
    logo: 'https://coin-logos.simplr.sh/images/arbitrum/standard.png'
  },
  [CHAIN_IDS.BASE_SEPOLIA]: {
    name: 'Base Sepolia',
    symbol: 'ETH',
    coingeckoId: 'base',
    color: '#0052FF',
    logo: '/chain-logos/base.png'
  },
  [CHAIN_IDS.AVALANCHE_FUJI]: {
    name: 'Avalanche Fuji',
    symbol: 'AVAX',
    coingeckoId: 'avalanche-2',
    color: '#E84142',
    logo: 'https://coin-logos.simplr.sh/images/avalanche-2/standard.png'
  },
  // Other chains
  [CHAIN_IDS.CELO]: {
    name: 'Celo',
    symbol: 'CELO',
    coingeckoId: 'celo',
    color: '#35D07F',
    logo: 'https://coin-logos.simplr.sh/images/celo/standard.png'
  },
  [CHAIN_IDS.MOONBEAM]: {
    name: 'Moonbeam',
    symbol: 'GLMR',
    coingeckoId: 'moonbeam',
    color: '#53CBC9',
    logo: 'https://coin-logos.simplr.sh/images/moonbeam/standard.png'
  },
  [CHAIN_IDS.STORY_AENID]: {
    name: 'Story Aenid',
    symbol: 'IP',
    color: '#8B5CF6',
    logo: 'https://raw.githubusercontent.com/storyprotocol/brand-assets/main/logo/logo-circle.png'
  },
}

// Type for token data
interface TokenData {
  name: string
  symbol: string
  coingeckoId: string
  decimals: number
  addresses: Partial<Record<number, string>>
}

// Common token addresses across chains
export const COMMON_TOKENS: Record<string, TokenData> = {
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    coingeckoId: 'usd-coin',
    decimals: 6,
    addresses: {
      [CHAIN_IDS.POLYGON]: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      [CHAIN_IDS.BASE]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    }
  },
  USDT: {
    name: 'Tether',
    symbol: 'USDT',
    coingeckoId: 'tether',
    decimals: 6,
    addresses: {
      [CHAIN_IDS.POLYGON]: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    }
  },
  DAI: {
    name: 'Dai',
    symbol: 'DAI',
    coingeckoId: 'dai',
    decimals: 18,
    addresses: {
      [CHAIN_IDS.POLYGON]: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    }
  },
  WETH: {
    name: 'Wrapped Ether',
    symbol: 'WETH',
    coingeckoId: 'weth',
    decimals: 18,
    addresses: {
      [CHAIN_IDS.POLYGON]: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      [CHAIN_IDS.BASE]: '0x4200000000000000000000000000000000000006',
    }
  },
  WBTC: {
    name: 'Wrapped Bitcoin',
    symbol: 'WBTC',
    coingeckoId: 'wrapped-bitcoin',
    decimals: 8,
    addresses: {
      [CHAIN_IDS.POLYGON]: '0x1bfd67037b42cf73acF2047067bd4F2C47D9BfD6',
    }
  }
}

/**
 * Get token logo URL with multiple fallback options
 */
export function getTokenLogoUrl(
  tokenAddress?: string,
  chainId?: number,
  coingeckoId?: string,
  size: 'thumb' | 'small' | 'standard' | 'large' = 'standard'
): string {
  // First check for local token logos by coingeckoId
  if (coingeckoId) {
    const localLogo = getLocalTokenLogoByName(coingeckoId)
    if (localLogo) {
      return localLogo
    }
  }

  // Try to match common tokens and check for local logos
  if (tokenAddress && chainId) {
    const normalizedAddress = tokenAddress.toLowerCase()
    for (const tokenData of Object.values(COMMON_TOKENS)) {
      const tokenAddressForChain = tokenData.addresses[chainId]
      if (tokenAddressForChain?.toLowerCase() === normalizedAddress) {
        // Check for local logo first
        const localLogo = getLocalTokenLogo(tokenData.symbol)
        if (localLogo) {
          return localLogo
        }
        // Fallback to CDN
        return `https://coin-logos.simplr.sh/images/${tokenData.coingeckoId}/${size}.png`
      }
    }
  }

  // Try CoinGecko ID with CDN (if no local logo found)
  if (coingeckoId) {
    return `https://coin-logos.simplr.sh/images/${coingeckoId}/${size}.png`
  }

  // Fallback to generic token icon
  return '/images/tokens/generic-token.svg'
}


/**
 * Get chain logo URL
 */
export function getChainLogoUrl(chainId: number): string {
  // First check for local chain logo
  const localLogo = getLocalChainLogo(chainId)
  if (localLogo) {
    return localLogo
  }

  const chain = CHAIN_METADATA[chainId]
  if (chain?.logo) {
    return chain.logo
  }

  // Fallback to generic chain icon
  return '/images/chains/generic-chain.svg'
}


/**
 * Get chain metadata
 */
export function getChainMetadata(chainId: number) {
  return CHAIN_METADATA[chainId] || {
    name: 'Unknown Chain',
    symbol: 'ETH',
    color: '#000000',
    logo: '/images/chains/generic-chain.svg'
  }
}

/**
 * Get token metadata by searching common tokens
 */
export function getTokenMetadata(tokenAddress: string, chainId: number) {
  const normalizedAddress = tokenAddress.toLowerCase()
  
  for (const tokenData of Object.values(COMMON_TOKENS)) {
    const tokenAddressForChain = tokenData.addresses[chainId]
    if (tokenAddressForChain?.toLowerCase() === normalizedAddress) {
      return {
        ...tokenData,
        address: tokenAddressForChain,
        logo: getTokenLogoUrl(tokenAddress, chainId, tokenData.coingeckoId)
      }
    }
  }
  
  return null
}

/**
 * Preload token logos for better performance
 */
export function preloadTokenLogos(tokens: Array<{ address?: string; chainId?: number; coingeckoId?: string }>) {
  if (typeof window === 'undefined') return

  tokens.forEach(token => {
    const url = getTokenLogoUrl(token.address, token.chainId, token.coingeckoId)
    const img = new Image()
    img.src = url
  })
}

/**
 * Preload chain logos for better performance
 */
export function preloadChainLogos(chainIds: number[]) {
  if (typeof window === 'undefined') return

  chainIds.forEach(chainId => {
    const url = getChainLogoUrl(chainId)
    const img = new Image()
    img.src = url
  })
}