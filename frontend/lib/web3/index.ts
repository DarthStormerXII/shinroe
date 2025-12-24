/**
 * Web3 Interface - WEPIN Auth Provider
 *
 * This is the STABLE API that all protocols use.
 * WEPIN is the auth layer for VeryChain mainnet integration.
 *
 * Usage in protocols:
 * ```typescript
 * import { useAccount, useWalletClient, usePublicClient, ConnectButton } from '@/lib/web3'
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
 * import { useWepinContext, useWepinProvider } from '@/lib/web3'
 * ```
 */

// =============================================================================
// Re-export everything from the active provider (WEPIN)
// =============================================================================

export {
  // Active provider indicator
  AUTH_PROVIDER,

  // Core Hooks
  useAccount,
  useIsSmartAccount,
  usePublicClient,
  useWalletClient,
  useChainId,
  useSwitchChain,
  useChains,
  useBalance,

  // Transaction Hooks
  useSendTransaction,
  useWaitForTransaction,
  useGasPrice,

  // Contract Hooks
  useReadContract,
  useWriteContract,

  // Connection Hooks
  useConnect,
  useDisconnect,

  // ENS Hooks
  useEnsName,
  useEnsAvatar,

  // Signature Hooks
  useSignMessage,
  useSignTypedData,

  // Components
  ConnectButton,

  // Provider Component
  Web3Provider,

  // Provider-specific exports (WEPIN)
  useWepinContext,
  useWepinProvider,
  useWepinNetworkProvider,
  isWepinConfigured,
  getWepinConfig,
  getWepinNetworkName,

  // Config exports
  supportedChains,
  getSupportedChainIds,

  // Widget SDK exports
  useWepinWidget,
  useWepinStatus,
  useWepinWidgetControl,
  useWepinAccounts,
  useWepinNFTs,
  useWepinSend,
  useWepinReceive,
  useWepinUser,
  WepinWidgetContext,
} from './providers'

// =============================================================================
// Re-export types from the active provider
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

  // Widget SDK Types
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
} from './providers'

// =============================================================================
// Re-export viem types (used by all providers)
// =============================================================================

export type {
  PublicClient,
  WalletClient,
  Chain,
  Address,
  Hash,
  Hex,
} from 'viem'

// =============================================================================
// Shared Utilities (not provider-specific)
// =============================================================================

// Common formatting utilities
export { formatAddress, formatBalance, formatUSD, formatTokenAmount, isValidAddress } from './format'

// Chain utilities
export { getChainById, getChainName, getExplorerLink, isTestnet, getExplorerUrl, getChainIcon } from '@/lib/config/chains'

// Asset utilities
export { getChainLogoUrl, getTokenLogoUrl, getChainMetadata, CHAIN_IDS, CHAIN_METADATA } from './assets'

// =============================================================================
// For less common utilities, import directly from their modules:
// - import { ... } from '@/lib/web3/format'
// - import { ... } from '@/lib/config/chains'
// - import { ... } from '@/lib/web3/contracts'
// - import { ... } from '@/lib/web3/eth-transfer'
// - import { ... } from '@/lib/web3/assets'
// - import { ... } from '@/lib/web3/price'
// - import { ... } from '@/lib/web3/ipfs'
// - import { ... } from '@/lib/web3/pinata'
// - import { ... } from '@/lib/web3/tenderly'
// - import { ... } from '@/lib/web3/tenderly-cache'
// - import { ... } from '@/lib/web3/abis'
// - import { ... } from '@/lib/web3/addresses'
// =============================================================================
