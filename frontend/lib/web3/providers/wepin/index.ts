/**
 * Web3 Interface - WEPIN Implementation
 *
 * This is the STABLE API that all protocols use.
 * WEPIN-specific features are also exported for protocols
 * that require direct WEPIN access.
 *
 * Usage in protocols:
 * ```typescript
 * import { useAccount, useWalletClient, usePublicClient } from '@/lib/web3'
 *
 * function MyComponent() {
 *   const { address, isConnected } = useAccount()
 *   const walletClient = useWalletClient()
 *   const publicClient = usePublicClient()
 *   // ... works with WEPIN auth provider
 * }
 * ```
 *
 * For WEPIN-specific features:
 * ```typescript
 * import { useWepinProvider, useWepinContext } from '@/lib/web3'
 *
 * function WepinComponent() {
 *   const provider = useWepinProvider()
 *   const { connect, disconnect } = useWepinContext()
 * }
 * ```
 */

// =============================================================================
// Core Hooks (abstraction layer)
// =============================================================================

// Account
export { useAccount, useIsSmartAccount } from './account'

// Clients
export { usePublicClient, useWalletClient } from './clients'

// Chain
export { useChainId, useSwitchChain, useChains } from './chain'

// Balance
export { useBalance } from './balance'

// =============================================================================
// Transaction Hooks
// =============================================================================

export { useSendTransaction, useWaitForTransaction, useGasPrice } from './transaction'

// =============================================================================
// Contract Hooks
// =============================================================================

export { useReadContract, useWriteContract } from './contract'

// =============================================================================
// Connection Hooks
// =============================================================================

export { useConnect, useDisconnect } from './connection'

// =============================================================================
// ENS Hooks
// =============================================================================

export { useEnsName, useEnsAvatar } from './ens'

// =============================================================================
// Signature Hooks
// =============================================================================

export { useSignMessage, useSignTypedData } from './signature'

// =============================================================================
// Components
// =============================================================================

export { ConnectButton } from './connect-button'

// Provider Component
export { Web3Provider } from './web3-provider'

// =============================================================================
// WEPIN-Specific Exports
// =============================================================================

export {
  useWepinContext,
  useWepinProvider,
  useWepinNetworkProvider,
  isWepinConfigured,
  getWepinConfig,
} from './wepin-client'

// =============================================================================
// WEPIN Widget SDK Exports
// =============================================================================

export {
  useWepinWidget,
  useWepinStatus,
  useWepinWidgetControl,
  useWepinAccounts,
  useWepinNFTs,
  useWepinSend,
  useWepinReceive,
  useWepinUser,
  WepinWidgetContext,
} from './widget'

export type {
  WepinAccount,
  WepinBalance,
  WepinNFT,
  WepinUserInfo,
  WepinUserStatus,
  WepinUser,
  WepinLifecycle,
  WepinTxData,
  WepinSendResult,
  WepinWidgetContextValue,
} from './widget'

// =============================================================================
// Types
// =============================================================================

export type {
  // Account
  Web3Account,

  // Clients
  UsePublicClientReturn,
  UseWalletClientReturn,

  // Chain
  UseSwitchChainReturn,
  UseChainsReturn,

  // Balance
  UseBalanceParams,
  UseBalanceReturn,

  // Token
  Token,
  UseTokenParams,
  UseTokenReturn,

  // Transaction
  TransactionRequest,
  UseSendTransactionReturn,
  UseWaitForTransactionParams,
  UseWaitForTransactionReturn,

  // Contract
  UseReadContractParams,
  UseReadContractReturn,
  UseWriteContractReturn,

  // Connection
  UseConnectReturn,
  UseDisconnectReturn,

  // ENS
  UseEnsNameParams,
  UseEnsNameReturn,
  UseEnsAvatarParams,
  UseEnsAvatarReturn,

  // Signature
  UseSignMessageReturn,
  UseSignTypedDataReturn,
} from './types'

// Re-export viem types
export type {
  PublicClient,
  WalletClient,
  Chain,
  Address,
  Hash,
  Hex,
} from 'viem'

// =============================================================================
// Utilities (from WEPIN config)
// =============================================================================

export { supportedChains, getSupportedChainIds, getWepinNetworkName } from './config'

// NOTE: Shared utilities (format, chains, assets, etc.) are exported from
// the main lib/web3/index.ts, not from individual providers
