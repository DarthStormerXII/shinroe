// Chain types
export interface Chain {
  id: number
  name: string
  network: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: {
    public: { http: string[] }
    default: { http: string[] }
  }
  blockExplorers?: {
    default: { name: string; url: string }
  }
  testnet?: boolean
  iconUrl?: string
}

// Token types
export interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  chainId: number
  logoURI?: string
  price?: number
}

// Transaction types
export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'cancelled'

export interface Transaction {
  hash: string
  from: string
  to?: string
  value?: string
  data?: string
  nonce?: number
  gasLimit?: string
  gasPrice?: string
  maxFeePerGas?: string
  maxPriorityFeePerGas?: string
  chainId: number
  status: TransactionStatus
  blockNumber?: number
  blockHash?: string
  timestamp: number
  confirmations?: number
  // Extended fields for UI
  type?: 'transfer' | 'swap' | 'mint' | 'burn' | 'approve' | 'contract'
  method?: string
  description?: string
  tokenSymbol?: string
  tokenAmount?: string
  contractName?: string
  error?: string
  gasUsed?: string
}

export interface TransactionRequest {
  to: string
  from?: string
  value?: string
  data?: string
  gasLimit?: string
  gasPrice?: string
  maxFeePerGas?: string
  maxPriorityFeePerGas?: string
  nonce?: number
  chainId?: number
}

// Gas types
export interface GasEstimate {
  gasLimit: string
  gasPrice?: string
  maxFeePerGas?: string
  maxPriorityFeePerGas?: string
  estimatedCost: string
  estimatedCostUSD?: number
}

// Swap types
export interface SwapQuote {
  fromToken: Token
  toToken: Token
  fromAmount: string
  toAmount: string
  priceImpact: number
  minimumReceived: string
  route: Token[]
  gas: GasEstimate
  slippage: number
}

// Pool types
export interface LiquidityPool {
  address: string
  token0: Token
  token1: Token
  reserve0: string
  reserve1: string
  totalSupply: string
  fee: number
  apy?: number
  tvl?: number
  userPosition?: {
    lpTokens: string
    token0Amount: string
    token1Amount: string
    share: number
  }
}

// Staking types
export interface StakingPool {
  address: string
  stakingToken: Token
  rewardToken: Token
  totalStaked: string
  apy: number
  lockPeriod?: number
  userStake?: {
    amount: string
    rewards: string
    unlockTime?: number
  }
}

// Portfolio types
export interface PortfolioData {
  totalValueUSD: number
  tokens: Array<{
    token: Token
    balance: string
    valueUSD: number
    allocation: number
  }>
  nfts: Array<{
    collection: string
    tokenId: string
    floorPrice?: number
  }>
  positions: {
    lending: Array<{
      protocol: string
      supplied: Token
      amount: string
      apy: number
    }>
    borrowing: Array<{
      protocol: string
      borrowed: Token
      amount: string
      apy: number
    }>
    liquidity: LiquidityPool[]
    staking: StakingPool[]
  }
}

// Activity types
export type ActivityType = 'swap' | 'send' | 'receive' | 'approve' | 'stake' | 'unstake' | 'provide_liquidity' | 'remove_liquidity'

export interface Activity {
  id: string
  type: ActivityType
  hash: string
  timestamp: number
  status: TransactionStatus
  from: string
  to?: string
  tokens?: Array<{
    token: Token
    amount: string
    direction: 'in' | 'out'
  }>
  gasUsed?: string
  chainId: number
}