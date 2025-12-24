/**
 * Web3 Interface Types - WEPIN Implementation
 *
 * Defines types for the web3 abstraction layer.
 * These types are the same across all auth providers.
 */

// Re-export viem types that are commonly used
export type { PublicClient, WalletClient, Chain, Address, Hash, Hex } from 'viem'

// Import viem types for use in interface definitions
import type { PublicClient, WalletClient, Chain, Address } from 'viem'

// =============================================================================
// Account Types
// =============================================================================

export interface Web3Account {
  address: Address | undefined
  isConnected: boolean
  isConnecting: boolean
  isDisconnected: boolean
  chain: Chain | undefined
  chainId: number | undefined
  /** Whether the connected wallet is a smart account (not applicable for WEPIN) */
  isSmartAccount: boolean
  /** The wallet ID/type */
  walletId: string | undefined
}

// =============================================================================
// Client Types
// =============================================================================

export interface UsePublicClientReturn {
  publicClient: PublicClient | undefined
}

export interface UseWalletClientReturn {
  walletClient: WalletClient | undefined
  isLoading: boolean
}

// =============================================================================
// Chain Types
// =============================================================================

export interface UseSwitchChainReturn {
  switchChain: (chainId: number) => Promise<void>
  isPending: boolean
  error: Error | null
}

export interface UseChainsReturn {
  chains: readonly Chain[]
}

// =============================================================================
// Balance Types
// =============================================================================

export interface UseBalanceParams {
  address?: Address
  token?: Address
  chainId?: number
  watch?: boolean
}

export interface UseBalanceReturn {
  balance: bigint | undefined
  formatted: string | undefined
  symbol: string | undefined
  decimals: number | undefined
  isLoading: boolean
  isRefetching: boolean
  error: Error | null
  refetch: () => void
}

// =============================================================================
// Token Types
// =============================================================================

export interface Token {
  address: Address
  symbol: string
  name: string
  decimals: number
  logoURI?: string
  chainId: number
}

export interface UseTokenParams {
  address: Address
  chainId?: number
}

export interface UseTokenReturn {
  token: Token | undefined
  isLoading: boolean
  error: Error | null
}

// =============================================================================
// Transaction Types
// =============================================================================

export interface TransactionRequest {
  to: Address
  data?: `0x${string}`
  value?: bigint
  gas?: bigint
  gasPrice?: bigint
  maxFeePerGas?: bigint
  maxPriorityFeePerGas?: bigint
}

export interface UseSendTransactionReturn {
  sendTransaction: (tx: TransactionRequest) => Promise<`0x${string}`>
  isPending: boolean
  error: Error | null
}

export interface UseWaitForTransactionParams {
  hash: `0x${string}` | undefined
  confirmations?: number
}

export interface UseWaitForTransactionReturn {
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
  error: Error | null
}

// =============================================================================
// Contract Types
// =============================================================================

export interface UseReadContractParams {
  address: Address
  abi: readonly unknown[]
  functionName: string
  args?: readonly unknown[]
  chainId?: number
  watch?: boolean
}

export interface UseReadContractReturn<T = unknown> {
  data: T | undefined
  isLoading: boolean
  isRefetching: boolean
  error: Error | null
  refetch: () => void
}

export interface UseWriteContractReturn {
  writeContract: (params: {
    address: Address
    abi: readonly unknown[]
    functionName: string
    args?: readonly unknown[]
    value?: bigint
    gas?: bigint
  }) => Promise<`0x${string}`>
  isPending: boolean
  error: Error | null
}

// =============================================================================
// Connection Types
// =============================================================================

export interface UseConnectReturn {
  connect: () => void
  isPending: boolean
  error: Error | null
}

export interface UseDisconnectReturn {
  disconnect: () => void
  isPending: boolean
}

// =============================================================================
// ENS Types
// =============================================================================

export interface UseEnsNameParams {
  address: Address | undefined
  chainId?: number
}

export interface UseEnsNameReturn {
  ensName: string | null | undefined
  isLoading: boolean
  error: Error | null
}

export interface UseEnsAvatarParams {
  name: string | null | undefined
  chainId?: number
}

export interface UseEnsAvatarReturn {
  ensAvatar: string | null | undefined
  isLoading: boolean
  error: Error | null
}

// =============================================================================
// Signature Types
// =============================================================================

export interface UseSignMessageReturn {
  signMessage: (message: string) => Promise<`0x${string}`>
  isPending: boolean
  error: Error | null
}

export interface UseSignTypedDataReturn {
  signTypedData: (typedData: unknown) => Promise<`0x${string}`>
  isPending: boolean
  error: Error | null
}
