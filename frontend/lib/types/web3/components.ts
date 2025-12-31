import type { ReactNode } from 'react'
import type { 
  Chain, 
  Token, 
  Transaction, 
  TransactionStatus,
  GasEstimate,
  SwapQuote,
  LiquidityPool,
  StakingPool,
  PortfolioData,
  Activity 
} from './web3'
import type { NFTMetadata } from './nft'

// Common props for all web3 components
export interface Web3ComponentProps {
  chainId?: number
  address?: string
  isConnected?: boolean
  className?: string
}

// Wallet components
export interface ConnectWalletProps extends Web3ComponentProps {
  onConnect: () => void | Promise<void>
  onDisconnect: () => void | Promise<void>
  balance?: string
  ensName?: string
  ensAvatar?: string
  mintTestTokens?: () => void | Promise<void>
  mintLabel?: string
  showBalance?: boolean
}

export interface BalanceDisplayProps extends Web3ComponentProps {
  balance: string
  symbol?: string
  decimals?: number
  showUSD?: boolean
  usdPrice?: number
  coingeckoId?: string
  loading?: boolean
  compact?: boolean
}

export interface AccountAvatarProps extends Web3ComponentProps {
  ensAvatar?: string
  size?: 'sm' | 'md' | 'lg'
}

export interface AddressDisplayProps extends Web3ComponentProps {
  ensName?: string
  showCopy?: boolean
  showExplorer?: boolean
  explorerUrl?: string
  truncate?: boolean
  truncateLength?: number
}

// Token/NFT components
export interface NFTCardProps {
  tokenId: string
  contractAddress: string
  metadata?: NFTMetadata
  chainId: number
  owner?: string
  onTransfer?: (tokenId: string, contractAddress: string) => void | Promise<void>
  onSell?: (tokenId: string, contractAddress: string) => void | Promise<void>
  onView?: (tokenId: string, contractAddress: string) => void
  showActions?: boolean
  expandable?: boolean
  className?: string
}

export interface TokenBalanceProps {
  token: Token
  balance?: string
  userAddress?: string
  showUSD?: boolean
  onChange?: () => void
  loading?: boolean
  className?: string
}

export interface TokenListProps {
  tokens: Array<Token & { balance: string; value?: number }>
  onTokenSelect?: (token: Token) => void
  showBalance?: boolean
  showValue?: boolean
  loading?: boolean
  emptyMessage?: string
  className?: string
}

export interface TokenSelectorProps {
  tokens: Token[]
  selectedToken?: Token
  onSelect: (token: Token) => void
  showBalance?: boolean
  balances?: Record<string, string>
  placeholder?: string
  disabled?: boolean
  className?: string
}

export interface TokenIconProps {
  token: Token | { logoURI?: string; symbol: string }
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fallback?: boolean
  className?: string
}

// Transaction components
export interface TransactionButtonProps {
  onClick: () => void | Promise<void>
  loading?: boolean
  loadingText?: string
  disabled?: boolean
  children: ReactNode
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export interface TransactionHistoryProps {
  transactions: Transaction[]
  onTransactionClick?: (tx: Transaction) => void
  loading?: boolean
  emptyMessage?: string
  showStatus?: boolean
  className?: string
}

export interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transaction?: Transaction
  status: TransactionStatus
  error?: string
  confirmations?: number
  requiredConfirmations?: number
  explorerUrl?: string
}

export interface TransactionToastProps {
  transaction: Transaction
  status: TransactionStatus
  message?: string
  explorerUrl?: string
}

export interface GasEstimatorProps {
  estimate?: GasEstimate
  onRefresh?: () => void | Promise<void>
  loading?: boolean
  showDetails?: boolean
  className?: string
}

// DeFi components
export interface SwapInterfaceProps {
  tokens: Token[]
  onSwap: (quote: SwapQuote) => void | Promise<void>
  onQuote?: (fromToken: Token, toToken: Token, amount: string) => Promise<SwapQuote>
  slippage?: number
  onSlippageChange?: (slippage: number) => void
  deadline?: number
  onDeadlineChange?: (deadline: number) => void
  loading?: boolean
  balances?: Record<string, string>
  className?: string
}

export interface LiquidityPoolProps {
  pool: LiquidityPool
  onAddLiquidity?: (token0Amount: string, token1Amount: string) => void | Promise<void>
  onRemoveLiquidity?: (lpAmount: string) => void | Promise<void>
  loading?: boolean
  className?: string
}

export interface StakingCardProps {
  pool: StakingPool
  onStake?: (amount: string) => void | Promise<void>
  onUnstake?: (amount: string) => void | Promise<void>
  onClaimRewards?: () => void | Promise<void>
  loading?: boolean
  className?: string
}

export interface SlippageSettingsProps {
  slippage: number
  onChange: (slippage: number) => void
  presets?: number[]
  min?: number
  max?: number
  className?: string
}

export interface DeFiNavigationProps {
  items: Array<{
    label: string
    icon?: ReactNode
    href?: string
    onClick?: () => void
    active?: boolean
  }>
  className?: string
}

// Profile components
export interface UserProfileProps extends Web3ComponentProps {
  ensName?: string
  ensAvatar?: string
  portfolio?: PortfolioData
  activities?: Activity[]
  onActivityClick?: (activity: Activity) => void
  loading?: boolean
  className?: string
}

export interface PortfolioChartProps {
  data: PortfolioData
  timeframe?: '24h' | '7d' | '30d' | '1y' | 'all'
  onTimeframeChange?: (timeframe: string) => void
  chartType?: 'line' | 'area' | 'donut'
  height?: number
  className?: string
}

export interface ActivityFeedProps {
  activities: Activity[]
  onActivityClick?: (activity: Activity) => void
  groupByDate?: boolean
  loading?: boolean
  loadMore?: () => void | Promise<void>
  hasMore?: boolean
  emptyMessage?: string
  className?: string
}

// Utility components
export interface BlockExplorerLinkProps {
  hash?: string
  address?: string
  chainId: number
  type?: 'tx' | 'address' | 'token' | 'block'
  children?: ReactNode
  className?: string
}

export interface ChainIconProps {
  chainId: number
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export interface NetworkBadgeProps {
  chainId: number
  showName?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'dots' | 'pulse'
  className?: string
}

export interface TokenAmountInputProps {
  value: string
  onChange: (value: string) => void
  token?: Token
  balance?: string
  showMax?: boolean
  onMax?: () => void
  showUSD?: boolean
  usdPrice?: number
  disabled?: boolean
  placeholder?: string
  label?: string
  error?: string
  className?: string
}

export interface AddressInputProps {
  value: string
  onChange: (value: string) => void
  onValidAddress?: (address: string) => void
  placeholder?: string
  label?: string
  error?: string
  showENS?: boolean
  resolveENS?: (name: string) => Promise<string | null>
  disabled?: boolean
  className?: string
}

export interface SearchableTokenSelectProps {
  tokens: Token[]
  selectedToken?: Token
  onSelect: (token: Token) => void
  placeholder?: string
  showBalance?: boolean
  balances?: Record<string, string>
  popularTokens?: string[]
  recentTokens?: string[]
  onSearch?: (query: string) => void
  loading?: boolean
  disabled?: boolean
  className?: string
}

// Signature components
export enum SignatureType {
  MESSAGE = 'message',
  TYPED_DATA = 'typedData'
}

export interface SignatureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: SignatureType
  message?: string
  typedData?: {
    domain: any
    types: any
    primaryType: string
    message: any
  }
  purpose?: string
  context?: string
  chainId?: number
  onSuccess?: (signature: string) => void
  onError?: (error: Error) => void
}