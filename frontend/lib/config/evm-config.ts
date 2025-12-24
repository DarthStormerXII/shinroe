// EVM network configurations - uses unified chains.ts as source of truth
import {
  SUPPORTED_CHAINS,
  getSupportedChainList,
  getSupportedChainIds,
  getChainById,
  getChainByName,
  isChainSupported,
  APP_MODE,
  type ChainConfig,
} from './chains'

// Re-export chain utilities
export {
  SUPPORTED_CHAINS,
  getSupportedChainList,
  getSupportedChainIds,
  getChainById,
  getChainByName,
  isChainSupported,
  APP_MODE,
  type ChainConfig,
}

// Legacy interface for backwards compatibility
export interface EvmNetwork {
  name: string
  chainId: number
  rpcUrl: string
  explorerUrl: string
  isTestnet: boolean
  iconUrl?: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
}

// Convert ChainConfig to EvmNetwork for backwards compatibility
function chainConfigToEvmNetwork(config: ChainConfig): EvmNetwork {
  return {
    name: config.name,
    chainId: config.chain.id,
    rpcUrl: config.rpcUrl,
    explorerUrl: config.explorerUrl,
    isTestnet: config.isTestnet,
    iconUrl: config.iconUrl,
    nativeCurrency: {
      name: config.chain.nativeCurrency.name,
      symbol: config.chain.nativeCurrency.symbol,
      decimals: config.chain.nativeCurrency.decimals,
    },
  }
}

// Legacy EVM_NETWORKS export - derived from unified chains
export const EVM_NETWORKS: Record<string, EvmNetwork> = Object.fromEntries(
  Object.entries(SUPPORTED_CHAINS).map(([key, config]) => [
    key,
    chainConfigToEvmNetwork(config),
  ])
)

// =============================================================================
// Token Configuration
// =============================================================================

export interface BridgeToken {
  symbol: string
  name: string
  decimals: number
  addresses: Record<number, string> // chainId -> address mapping
  logoUrl?: string
  isNative?: boolean
}

// Common tokens supported across EVM bridges
export const BRIDGE_TOKENS: Record<string, BridgeToken> = {
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    addresses: {
      // Mainnets
      1: '0x0000000000000000000000000000000000000000',
      10: '0x0000000000000000000000000000000000000000',
      42161: '0x0000000000000000000000000000000000000000',
      8453: '0x0000000000000000000000000000000000000000',
      // Testnets
      11155111: '0x0000000000000000000000000000000000000000',
      11155420: '0x0000000000000000000000000000000000000000',
      421614: '0x0000000000000000000000000000000000000000',
      84532: '0x0000000000000000000000000000000000000000',
    },
    logoUrl: '/tokens/eth.png',
    isNative: true,
  },
  WETH: {
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    decimals: 18,
    addresses: {
      // Mainnets
      1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      137: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      10: '0x4200000000000000000000000000000000000006',
      42161: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      8453: '0x4200000000000000000000000000000000000006',
    },
    logoUrl: '/tokens/weth.png',
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    addresses: {
      // Mainnets
      1: '0xA0b86a33E6417C084B91604A1cDB5dEdaCBddfD7',
      137: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      10: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      // Testnets
      11155111: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      80002: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
      421614: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
    },
    logoUrl: '/tokens/usdc.png',
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    addresses: {
      // Mainnets
      1: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      137: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      10: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      42161: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    },
    logoUrl: '/tokens/usdt.png',
  },
  POL: {
    symbol: 'POL',
    name: 'Polygon',
    decimals: 18,
    addresses: {
      // Mainnets
      1: '0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6',
      137: '0x0000000000000000000000000000000000001010',
      // Testnets
      80002: '0x0000000000000000000000000000000000001010',
    },
    logoUrl: '/tokens/pol.png',
    isNative: true,
  },
}

// =============================================================================
// Bridge Configuration
// =============================================================================

export type BridgeProvider = 'wormhole' | 'layerzero' | 'across' | 'hop' | 'celer'

export interface BridgeConfig {
  name: string
  provider: BridgeProvider
  enabled: boolean
  testnetSupport: boolean
  mainnetSupport: boolean
  supportedTokens: string[]
  supportedChains: number[]
  bridgeAndExecute: boolean
  estimatedTime: string
  fees: {
    base: string
    percentage?: number
  }
}

export const BRIDGE_CONFIGS: Record<BridgeProvider, BridgeConfig> = {
  wormhole: {
    name: 'Wormhole Connect',
    provider: 'wormhole',
    enabled: true,
    testnetSupport: true,
    mainnetSupport: true,
    supportedTokens: ['ETH', 'WETH', 'USDC', 'USDT'],
    supportedChains: [1, 137, 10, 42161, 8453, 11155111],
    bridgeAndExecute: true,
    estimatedTime: '2-5 minutes',
    fees: { base: '~$0.01' },
  },
  layerzero: {
    name: 'LayerZero (Stargate)',
    provider: 'layerzero',
    enabled: true,
    testnetSupport: true,
    mainnetSupport: true,
    supportedTokens: ['ETH', 'USDC', 'USDT'],
    supportedChains: [1, 137, 10, 42161, 8453],
    bridgeAndExecute: false,
    estimatedTime: '1-3 minutes',
    fees: { base: '~$0.05' },
  },
  across: {
    name: 'Across Protocol',
    provider: 'across',
    enabled: true,
    testnetSupport: false,
    mainnetSupport: true,
    supportedTokens: ['ETH', 'WETH', 'USDC', 'USDT'],
    supportedChains: [1, 137, 10, 42161, 8453],
    bridgeAndExecute: false,
    estimatedTime: '30 seconds - 2 minutes',
    fees: { base: '~$0.03' },
  },
  hop: {
    name: 'Hop Protocol',
    provider: 'hop',
    enabled: true,
    testnetSupport: false,
    mainnetSupport: true,
    supportedTokens: ['ETH', 'USDC', 'USDT', 'POL'],
    supportedChains: [1, 137, 10, 42161],
    bridgeAndExecute: false,
    estimatedTime: '5-15 minutes',
    fees: { base: '~$0.02' },
  },
  celer: {
    name: 'Celer cBridge',
    provider: 'celer',
    enabled: false,
    testnetSupport: false,
    mainnetSupport: true,
    supportedTokens: ['USDC', 'USDT', 'WETH'],
    supportedChains: [1, 137, 10, 42161, 8453],
    bridgeAndExecute: false,
    estimatedTime: '5-15 minutes',
    fees: { base: '~$0.02' },
  },
}

// =============================================================================
// Bridge Utilities
// =============================================================================

export interface EvmBridgeConfig {
  defaultSourceChain: string
  defaultDestinationChain: string
  defaultBridge: BridgeProvider
  slippageTolerance: number
  maxBridgeAmount: string
  minBridgeAmount: string
}

export const DEFAULT_EVM_CONFIG: EvmBridgeConfig = {
  defaultSourceChain: APP_MODE === 'testnet' ? 'sepolia' : 'ethereum',
  defaultDestinationChain: APP_MODE === 'testnet' ? 'amoy' : 'polygon',
  defaultBridge: 'wormhole',
  slippageTolerance: 0.5,
  maxBridgeAmount: '1000000',
  minBridgeAmount: '1',
}

export function parseEvmBridgeConfig(): EvmBridgeConfig {
  return {
    defaultSourceChain:
      process.env.NEXT_PUBLIC_DEFAULT_SOURCE_CHAIN || DEFAULT_EVM_CONFIG.defaultSourceChain,
    defaultDestinationChain:
      process.env.NEXT_PUBLIC_DEFAULT_DESTINATION_CHAIN || DEFAULT_EVM_CONFIG.defaultDestinationChain,
    defaultBridge:
      (process.env.NEXT_PUBLIC_DEFAULT_BRIDGE as BridgeProvider) || DEFAULT_EVM_CONFIG.defaultBridge,
    slippageTolerance: parseFloat(process.env.NEXT_PUBLIC_SLIPPAGE_TOLERANCE || '0.5'),
    maxBridgeAmount: process.env.NEXT_PUBLIC_MAX_BRIDGE_AMOUNT || DEFAULT_EVM_CONFIG.maxBridgeAmount,
    minBridgeAmount: process.env.NEXT_PUBLIC_MIN_BRIDGE_AMOUNT || DEFAULT_EVM_CONFIG.minBridgeAmount,
  }
}

// Get active EVM networks (uses unified chain config)
export function getSourceNetworks(): EvmNetwork[] {
  return Object.values(EVM_NETWORKS)
}

export function getDestinationNetworks(sourceChainId?: number): EvmNetwork[] {
  return Object.values(EVM_NETWORKS).filter(
    (network) => !sourceChainId || network.chainId !== sourceChainId
  )
}

// Get enabled bridge providers
export function getEnabledBridges(): BridgeConfig[] {
  const isTestnet = APP_MODE === 'testnet'
  return Object.values(BRIDGE_CONFIGS).filter((bridge) => {
    if (!bridge.enabled) return false
    if (isTestnet && !bridge.testnetSupport) return false
    if (!isTestnet && APP_MODE === 'mainnet' && !bridge.mainnetSupport) return false
    return true
  })
}

// Get supported tokens for a chain pair
export function getSupportedTokens(sourceChainId: number, destinationChainId: number): BridgeToken[] {
  return Object.values(BRIDGE_TOKENS).filter(
    (token) => token.addresses[sourceChainId] && token.addresses[destinationChainId]
  )
}

// Get token address for a specific chain
export function getTokenAddress(token: BridgeToken, chainId: number): string | undefined {
  return token.addresses[chainId]
}

// Check if token is native on a chain
export function isNativeToken(token: BridgeToken, chainId: number): boolean {
  return token.isNative === true && token.addresses[chainId] === '0x0000000000000000000000000000000000000000'
}

// Get network by chain ID (legacy compatibility)
export function getNetworkByChainId(chainId: number): EvmNetwork | undefined {
  return Object.values(EVM_NETWORKS).find((network) => network.chainId === chainId)
}

// Get network by name (legacy compatibility)
export function getNetworkByName(name: string): EvmNetwork | undefined {
  return EVM_NETWORKS[name.toLowerCase()]
}
