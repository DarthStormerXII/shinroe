/**
 * Auth Provider Switcher
 *
 * This file exports the active auth provider.
 * All protocol pages import from '@/lib/web3' which re-exports from here.
 *
 * Current provider: WEPIN
 * - Only auth layer that supports VeryChain mainnet (chain ID 4613)
 * - Social login and embedded wallets
 * - EIP-1193 compatible provider
 */

// Active provider indicator
export const AUTH_PROVIDER = 'wepin' as const

// =============================================================================
// ACTIVE PROVIDER: WEPIN
// =============================================================================

// Core Hooks
export { useAccount, useIsSmartAccount } from './wepin/account'
export { usePublicClient, useWalletClient } from './wepin/clients'
export { useChainId, useSwitchChain, useChains } from './wepin/chain'
export { useBalance } from './wepin/balance'
export { useSendTransaction, useWaitForTransaction, useGasPrice } from './wepin/transaction'
export { useReadContract, useWriteContract } from './wepin/contract'
export { useConnect, useDisconnect } from './wepin/connection'
export { useEnsName, useEnsAvatar } from './wepin/ens'
export { useSignMessage, useSignTypedData } from './wepin/signature'

// Components
export { ConnectButton } from './wepin/connect-button'

// Provider
export { Web3Provider } from './wepin/web3-provider'

// Provider-specific exports (WEPIN)
export {
  useWepinContext,
  useWepinProvider,
  useWepinNetworkProvider,
  isWepinConfigured,
  getWepinConfig,
} from './wepin/wepin-client'
export { supportedChains, getSupportedChainIds, getWepinNetworkName } from './wepin/config'

// Widget SDK exports
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
} from './wepin/widget'

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
} from './wepin/widget'

// Types
export type {
  Web3Account,
  UsePublicClientReturn,
  UseWalletClientReturn,
  UseSwitchChainReturn,
  UseChainsReturn,
  UseBalanceParams,
  UseBalanceReturn,
  Token,
  UseTokenParams,
  UseTokenReturn,
  TransactionRequest,
  UseSendTransactionReturn,
  UseWaitForTransactionParams,
  UseWaitForTransactionReturn,
  UseReadContractParams,
  UseReadContractReturn,
  UseWriteContractReturn,
  UseConnectReturn,
  UseDisconnectReturn,
  UseEnsNameParams,
  UseEnsNameReturn,
  UseEnsAvatarParams,
  UseEnsAvatarReturn,
  UseSignMessageReturn,
  UseSignTypedDataReturn,
} from './wepin/types'
