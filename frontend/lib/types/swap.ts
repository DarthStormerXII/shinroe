// Swap Types
// Common types used across swap integrations

export interface SwapToken {
  symbol: string
  name: string
  address: string
  decimals: number
  logoURI?: string
  chainId: number
  balance?: string
  balanceFormatted?: string
}

export interface SwapQuote {
  provider: string
  srcToken: SwapToken
  dstToken: SwapToken
  srcAmount: string
  dstAmount: string
  dstAmountFormatted: string
  rate: string // How many dst tokens per 1 src token
  priceImpact?: number
  estimatedGas?: number
  protocols?: string[]
}

export interface SwapTransaction {
  hash: string
  status: 'pending' | 'success' | 'failed'
  srcToken: SwapToken
  dstToken: SwapToken
  srcAmount: string
  dstAmount: string
  timestamp: number
  chainId: number
  explorerUrl?: string
}

export interface SwapFormState {
  srcToken: SwapToken | null
  dstToken: SwapToken | null
  srcAmount: string
  slippage: number
  receiver?: string
}

export interface SwapSettings {
  slippage: number
  deadline: number // minutes
  customRecipient?: string
}

export const DEFAULT_SWAP_SETTINGS: SwapSettings = {
  slippage: 0.5,
  deadline: 20,
}

// Native token address used by many DEX aggregators
export const NATIVE_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
