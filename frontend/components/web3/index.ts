// Wallet components
export { AccountAvatar } from './wallet/account-avatar'
export { AddressDisplay } from './wallet/address-display'
export { BalanceDisplay } from './wallet/balance-display'
// ChainSwitcher removed - not yet implemented
export { ConnectWallet } from './wallet/connect-wallet'

// Token components  
export { TokenIcon } from './tokens/token-display/token-icon'
export { TokenBalance } from './tokens/token-display/token-balance'
export { TokenList } from './tokens/token-list'
export { NFTCard } from './tokens/nft-card'

// Transaction components
export { TransactionButton } from './transactions/transaction-button'
export { TransactionHistory } from './transactions/transaction-history'
export { GasEstimator } from './transactions/gas-display/gas-estimator'
export { GasPriceDisplay } from './transactions/gas-display/gas-price-display'
export { TransactionDialog } from './transactions/transaction-dialog'

// Signature components
export { SignatureDialog } from './signature/signature-dialog'

// Sheet component export (for convenience)
export { TransactionHistory as TransactionHistorySheet } from './transactions/transaction-history'

// Legacy exports for backward compatibility
export { TokenBalance as TokenBalanceEnhanced } from './tokens/token-display/token-balance'
export { NFTCard as NFTCardEnhanced } from './tokens/nft-card'
export { GasEstimator as GasEstimatorWithData } from './transactions/gas-display/gas-estimator'