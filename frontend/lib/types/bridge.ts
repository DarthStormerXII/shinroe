import type { BridgeProvider, BridgeToken } from '@/lib/config/evm-config'

// Re-export types from config for convenience
export type { BridgeToken, BridgeProvider } from '@/lib/config/evm-config'

// Chain types
export type ChainType = 'evm'

export interface Chain {
  id: string | number
  name: string
  type: ChainType
  rpcUrl: string
  explorerUrl: string
  isTestnet: boolean
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
}

// Bridge transaction types
export type BridgeStatus =
  | 'idle'
  | 'preparing'
  | 'approving'
  | 'bridging'
  | 'confirming'
  | 'completed'
  | 'failed'
  | 'cancelled'

export interface BridgeTransaction {
  id: string
  status: BridgeStatus
  provider: BridgeProvider
  sourceChain: Chain
  destinationChain: Chain
  token: BridgeToken
  amount: string
  sourceAddress: string
  destinationAddress: string
  sourceTxHash?: string
  destinationTxHash?: string
  estimatedTime?: number // in seconds
  fees?: {
    bridge: string
    gas: string
    total: string
  }
  executeAction?: ExecuteAction
  createdAt: Date
  updatedAt: Date
  error?: string
}

// Base execute action interface
interface BaseExecuteAction {
  protocol?: string
  gasLimit?: string
  enabled: boolean
}

// Swap action parameters
export interface SwapAction extends BaseExecuteAction {
  type: 'swap'
  parameters: {
    outputToken: string
    minOutputAmount: string
    slippage: number
    dex: string
  }
}

// Stake action parameters
export interface StakeAction extends BaseExecuteAction {
  type: 'stake'
  parameters: {
    validator?: string
    lockPeriod?: number
    autoCompound: boolean
  }
}

// Custom contract interaction
export interface CustomAction extends BaseExecuteAction {
  type: 'custom'
  parameters: {
    contractAddress: string
    functionName: string
    functionArgs: any[]
    typeArgs?: string[]
  }
}

// Lend action parameters
export interface LendAction extends BaseExecuteAction {
  type: 'lend'
  parameters: {
    protocol: string
    asset: string
    amount: string
    collateral?: boolean
  }
}

// Farm action parameters
export interface FarmAction extends BaseExecuteAction {
  type: 'farm'
  parameters: {
    protocol: string
    pool: string
    amount: string
    duration?: number
  }
}

// Execute action union type
export type ExecuteAction = SwapAction | StakeAction | CustomAction | LendAction | FarmAction

// Bridge quote and estimation
export interface BridgeQuote {
  provider: BridgeProvider
  sourceChain: Chain
  destinationChain: Chain
  token: BridgeToken
  amount: string
  estimatedOutput: string
  fees: {
    bridge: string
    gas: string
    total: string
  }
  estimatedTime: number // in seconds
  slippage: number
  minReceived: string
  route?: RouteStep[]
  executeAction?: ExecuteAction
}

export interface RouteStep {
  protocol: string
  action: string
  inputToken: string
  outputToken: string
  amount: string
  estimatedGas: string
}

// Wallet connection states
export interface WalletState {
  evm: {
    connected: boolean
    address?: string
    chainId?: number
    connector?: string
  }
}

// Bridge form state
export interface BridgeFormState {
  sourceChain: Chain | null
  destinationChain: Chain | null
  token: BridgeToken | null
  amount: string
  sourceAddress: string
  destinationAddress: string
  slippage: number
  executeAction?: ExecuteAction
  customRecipient: boolean
}

// Bridge validation
export interface BridgeValidation {
  isValid: boolean
  errors: {
    sourceChain?: string
    destinationChain?: string
    token?: string
    amount?: string
    sourceAddress?: string
    destinationAddress?: string
    balance?: string
    allowance?: string
  }
  warnings: string[]
}

// Token balance
export interface TokenBalance {
  token: BridgeToken
  balance: string
  balanceFormatted: string
  allowance?: string
  allowanceFormatted?: string
  price?: number
  value?: number
}

// Bridge events
export type BridgeEvent =
  | { type: 'TRANSACTION_CREATED'; transaction: BridgeTransaction }
  | { type: 'TRANSACTION_UPDATED'; transaction: BridgeTransaction }
  | { type: 'APPROVAL_REQUIRED'; token: BridgeToken; spender: string }
  | { type: 'APPROVAL_CONFIRMED'; token: BridgeToken; txHash: string }
  | { type: 'BRIDGE_INITIATED'; txHash: string }
  | { type: 'BRIDGE_CONFIRMED'; sourceHash: string; destinationHash?: string }
  | { type: 'EXECUTE_INITIATED'; action: ExecuteAction }
  | { type: 'EXECUTE_COMPLETED'; action: ExecuteAction; txHash: string }
  | { type: 'ERROR'; error: string; context?: any }

// Faucet functionality
export interface FaucetRequest {
  network: string
  address: string
  amount?: string
  token?: string
}

export interface FaucetResponse {
  success: boolean
  txHash?: string
  amount?: string
  error?: string
  cooldown?: number
}

// Bridge configuration
export interface BridgeSettings {
  defaultSlippage: number
  autoApprove: boolean
  showAdvanced: boolean
  enableExecuteActions: boolean
  enableCustomRecipient: boolean
  enableFaucet: boolean
  theme: 'light' | 'dark' | 'auto'
}

// Error types
export class BridgeError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: any
  ) {
    super(message)
    this.name = 'BridgeError'
  }
}

// Common error codes
export const BRIDGE_ERROR_CODES = {
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INSUFFICIENT_ALLOWANCE: 'INSUFFICIENT_ALLOWANCE',
  UNSUPPORTED_CHAIN: 'UNSUPPORTED_CHAIN',
  UNSUPPORTED_TOKEN: 'UNSUPPORTED_TOKEN',
  AMOUNT_TOO_LOW: 'AMOUNT_TOO_LOW',
  AMOUNT_TOO_HIGH: 'AMOUNT_TOO_HIGH',
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  WRONG_NETWORK: 'WRONG_NETWORK',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  PROVIDER_ERROR: 'PROVIDER_ERROR',
  SLIPPAGE_TOO_HIGH: 'SLIPPAGE_TOO_HIGH',
  EXECUTE_ACTION_FAILED: 'EXECUTE_ACTION_FAILED',
} as const

// Across Protocol specific types
export interface AcrossBridgeTransaction extends Omit<BridgeTransaction, 'fees'> {
  provider: 'across'
  depositId?: string
  fillTxHash?: string
  estimatedFillTimeSec?: number
  fees?: {
    lpFee: string
    relayerFee: string
    gasFee: string
    totalFee: string
    totalFeePercent: string
  }
}

export type AcrossBridgeStep = 'approve' | 'deposit' | 'fill'
export type AcrossBridgeStepStatus = 'pending' | 'in_progress' | 'completed' | 'failed'

export interface AcrossBridgeProgress {
  step: AcrossBridgeStep
  status: AcrossBridgeStepStatus
  txHash?: string
  error?: string
}