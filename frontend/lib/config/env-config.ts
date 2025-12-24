// Environment configuration for the application
// Chain configuration is handled by chains.ts - this file handles other env vars

import {
  SUPPORTED_CHAINS,
  getSupportedChainList,
  getSupportedViemChains,
  APP_MODE,
  MAINNET_CHAIN_NAMES,
  TESTNET_CHAIN_NAMES,
} from './chains'

// Re-export for backwards compatibility
export { SUPPORTED_CHAINS, getSupportedChainList, getSupportedViemChains, APP_MODE }

// =============================================================================
// Types
// =============================================================================

export type SocialProvider = 'google' | 'discord' | 'apple' | 'github' | 'x' | 'facebook' | 'twitch' | 'farcaster'

export interface EnvConfig {
  // Core requirements
  walletConnectProjectId: string
  alchemyApiKey?: string

  // App metadata
  appName: string
  appUrl: string
  appDescription?: string
  appIcon?: string

  // Network configuration (derived from chains.ts)
  supportedChainNames: string[]
  defaultChainName?: string

  // Reown feature toggles
  features: {
    analytics: boolean
    email: boolean
    onramp: boolean
    swap: boolean
    payWithExchange: boolean
    socials: SocialProvider[]
    emailShowWallets: boolean
  }

  // Smart account configuration
  smartAccount: {
    enabled: boolean
    sponsoredTransactions: boolean
    paymasterUrl?: string
    bundlerUrl?: string
  }

  // Theme and UI
  themeMode: 'light' | 'dark' | 'auto'
  allWallets: 'SHOW' | 'HIDE' | 'ONLY_MOBILE'
  enableTestnets?: boolean

  // Advanced configuration
  customRpcUrls?: Record<string, string>

  // Development shortcuts
  isDefaults: boolean
}

// =============================================================================
// Default Configuration
// =============================================================================

export const DEFAULT_CONFIG: EnvConfig = {
  walletConnectProjectId: '',
  appName: 'Web3 App',
  appUrl: 'https://localhost:3000',
  appDescription: 'A comprehensive Web3 application',
  supportedChainNames: Object.keys(SUPPORTED_CHAINS),
  defaultChainName: Object.keys(SUPPORTED_CHAINS)[0],
  features: {
    analytics: true,
    email: true,
    onramp: true,
    swap: true,
    payWithExchange: false,
    socials: ['google', 'discord', 'apple'],
    emailShowWallets: true,
  },
  smartAccount: {
    enabled: false,
    sponsoredTransactions: false,
  },
  themeMode: 'dark',
  allWallets: 'SHOW',
  isDefaults: false,
}

// =============================================================================
// Required & Optional Environment Variables
// =============================================================================

export const REQUIRED_CLIENT_ENV_VARS = [
  'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
  'NEXT_PUBLIC_APP_MODE', // testnet | mainnet | both
  'NEXT_PUBLIC_INDEXER_URL', // Subgraph/indexer endpoint URL
] as const

export const OPTIONAL_CLIENT_ENV_VARS = [
  'NEXT_PUBLIC_SUPPORTED_CHAINS', // Optional filter for chains
  'NEXT_PUBLIC_ALCHEMY_API_KEY',
  'NEXT_PUBLIC_APP_NAME',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_APP_DESCRIPTION',
  'NEXT_PUBLIC_APP_ICON',
  'NEXT_PUBLIC_DEFAULT_CHAIN',
  'NEXT_PUBLIC_ENABLE_ANALYTICS',
  'NEXT_PUBLIC_ENABLE_EMAIL',
  'NEXT_PUBLIC_ENABLE_ONRAMP',
  'NEXT_PUBLIC_ENABLE_SWAP',
  'NEXT_PUBLIC_ENABLE_PAY_WITH_EXCHANGE',
  'NEXT_PUBLIC_SOCIAL_PROVIDERS',
  'NEXT_PUBLIC_EMAIL_SHOW_WALLETS',
  'NEXT_PUBLIC_SMART_ACCOUNT_ENABLED',
  'NEXT_PUBLIC_SPONSORED_TRANSACTIONS',
  'NEXT_PUBLIC_PAYMASTER_URL',
  'NEXT_PUBLIC_BUNDLER_URL',
  'NEXT_PUBLIC_THEME_MODE',
  'NEXT_PUBLIC_ALL_WALLETS',
  'NEXT_PUBLIC_CUSTOM_RPC_URLS',
  'NEXT_PUBLIC_IS_DEFAULTS',
  'NEXT_PUBLIC_TENDERLY_USERNAME',
  'NEXT_PUBLIC_TENDERLY_PROJECT_SLUG',
  // Thirdweb auth layer (required for x402 protocol)
  'NEXT_PUBLIC_THIRDWEB_CLIENT_ID',
] as const

// No required server vars currently - all are optional
export const REQUIRED_SERVER_ENV_VARS = [] as const

export const OPTIONAL_SERVER_ENV_VARS = [
  'GEMINI_API_KEY',
  'GEMINI_MODEL',
  'DISABLE_AI_SUMMARIES',
  'TENDERLY_ACCESS_TOKEN',
  'PINATA_JWT',
  'DATABASE_URL',
  'MONGODB_URI',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  // Thirdweb server-side (required for x402 protocol API routes)
  'THIRDWEB_SECRET_KEY',
  'THIRDWEB_SERVER_WALLET_ADDRESS',
  'MERCHANT_WALLET_ADDRESS',
  // Badge NFT image IPFS hashes (set after running setup-badges)
  'BADGE_IMAGE_VERIFIED_IDENTITY',
  'BADGE_IMAGE_TRUSTED_TRADER',
  'BADGE_IMAGE_COMMUNITY_BUILDER',
  'BADGE_IMAGE_EARLY_ADOPTER',
  'BADGE_IMAGE_ELITE_SCORE',
  // Admin token for protected APIs
  'ADMIN_API_TOKEN',
] as const

// =============================================================================
// Parse Environment Configuration
// =============================================================================

export function parseEnvConfig(): EnvConfig {
  const isDefaults = process.env.NEXT_PUBLIC_IS_DEFAULTS === 'true'

  if (isDefaults) {
    return { ...DEFAULT_CONFIG, isDefaults: true }
  }

  const config: EnvConfig = {
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
    alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    appName: process.env.NEXT_PUBLIC_APP_NAME || DEFAULT_CONFIG.appName,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || DEFAULT_CONFIG.appUrl,
    appDescription: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
    appIcon: process.env.NEXT_PUBLIC_APP_ICON,

    // Chain names from unified config
    supportedChainNames: Object.keys(SUPPORTED_CHAINS),
    defaultChainName: process.env.NEXT_PUBLIC_DEFAULT_CHAIN || Object.keys(SUPPORTED_CHAINS)[0],

    features: {
      analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'false',
      email: process.env.NEXT_PUBLIC_ENABLE_EMAIL !== 'false',
      onramp: process.env.NEXT_PUBLIC_ENABLE_ONRAMP !== 'false',
      swap: process.env.NEXT_PUBLIC_ENABLE_SWAP !== 'false',
      payWithExchange: process.env.NEXT_PUBLIC_ENABLE_PAY_WITH_EXCHANGE === 'true',
      socials: process.env.NEXT_PUBLIC_SOCIAL_PROVIDERS
        ? (process.env.NEXT_PUBLIC_SOCIAL_PROVIDERS.split(',') as SocialProvider[])
        : DEFAULT_CONFIG.features.socials,
      emailShowWallets: process.env.NEXT_PUBLIC_EMAIL_SHOW_WALLETS !== 'false',
    },

    smartAccount: {
      enabled: process.env.NEXT_PUBLIC_SMART_ACCOUNT_ENABLED === 'true',
      sponsoredTransactions: process.env.NEXT_PUBLIC_SPONSORED_TRANSACTIONS === 'true',
      paymasterUrl: process.env.NEXT_PUBLIC_PAYMASTER_URL,
      bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_URL,
    },

    themeMode: (process.env.NEXT_PUBLIC_THEME_MODE as 'light' | 'dark' | 'auto') || DEFAULT_CONFIG.themeMode,
    allWallets: (process.env.NEXT_PUBLIC_ALL_WALLETS as 'SHOW' | 'HIDE' | 'ONLY_MOBILE') || DEFAULT_CONFIG.allWallets,
    customRpcUrls: process.env.NEXT_PUBLIC_CUSTOM_RPC_URLS
      ? JSON.parse(process.env.NEXT_PUBLIC_CUSTOM_RPC_URLS)
      : undefined,

    isDefaults: false,
  }

  return config
}

// =============================================================================
// Validation
// =============================================================================

export interface ValidationResult {
  valid: boolean
  missing: string[]
  recommended: string[]
}

export function validateConfig(config: EnvConfig): ValidationResult {
  if (config.isDefaults) {
    return { valid: true, missing: [], recommended: [] }
  }

  const missing: string[] = []
  const recommended: string[] = []

  // Check required environment variables
  if (!config.walletConnectProjectId) {
    missing.push('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID')
  }

  // NEXT_PUBLIC_APP_MODE is validated in chains.ts (throws if missing/invalid)

  // Check indexer URL is configured
  if (!process.env.NEXT_PUBLIC_INDEXER_URL) {
    missing.push('NEXT_PUBLIC_INDEXER_URL')
  }

  // Check recommended variables
  if (!config.alchemyApiKey) {
    recommended.push('NEXT_PUBLIC_ALCHEMY_API_KEY')
  }

  if (!config.appDescription) {
    recommended.push('NEXT_PUBLIC_APP_DESCRIPTION')
  }

  if (config.smartAccount.enabled && !config.smartAccount.paymasterUrl) {
    missing.push('NEXT_PUBLIC_PAYMASTER_URL')
  }

  if (config.smartAccount.enabled && !config.smartAccount.bundlerUrl) {
    recommended.push('NEXT_PUBLIC_BUNDLER_URL')
  }

  return {
    valid: missing.length === 0,
    missing,
    recommended,
  }
}

// =============================================================================
// Environment Status Helpers
// =============================================================================

export function getClientEnvStatus(): { present: string[]; missing: string[]; values: Record<string, string> } {
  const present: string[] = []
  const missing: string[] = []
  const values: Record<string, string> = {}

  const envVars: Record<string, string | undefined> = {
    'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID': process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    'NEXT_PUBLIC_APP_MODE': process.env.NEXT_PUBLIC_APP_MODE,
    'NEXT_PUBLIC_INDEXER_URL': process.env.NEXT_PUBLIC_INDEXER_URL,
    'NEXT_PUBLIC_SUPPORTED_CHAINS': process.env.NEXT_PUBLIC_SUPPORTED_CHAINS,
    'NEXT_PUBLIC_ALCHEMY_API_KEY': process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    'NEXT_PUBLIC_APP_NAME': process.env.NEXT_PUBLIC_APP_NAME,
    'NEXT_PUBLIC_APP_URL': process.env.NEXT_PUBLIC_APP_URL,
    'NEXT_PUBLIC_APP_DESCRIPTION': process.env.NEXT_PUBLIC_APP_DESCRIPTION,
    'NEXT_PUBLIC_APP_ICON': process.env.NEXT_PUBLIC_APP_ICON,
    'NEXT_PUBLIC_DEFAULT_CHAIN': process.env.NEXT_PUBLIC_DEFAULT_CHAIN,
    'NEXT_PUBLIC_ENABLE_ANALYTICS': process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    'NEXT_PUBLIC_ENABLE_EMAIL': process.env.NEXT_PUBLIC_ENABLE_EMAIL,
    'NEXT_PUBLIC_ENABLE_ONRAMP': process.env.NEXT_PUBLIC_ENABLE_ONRAMP,
    'NEXT_PUBLIC_ENABLE_SWAP': process.env.NEXT_PUBLIC_ENABLE_SWAP,
    'NEXT_PUBLIC_ENABLE_PAY_WITH_EXCHANGE': process.env.NEXT_PUBLIC_ENABLE_PAY_WITH_EXCHANGE,
    'NEXT_PUBLIC_SOCIAL_PROVIDERS': process.env.NEXT_PUBLIC_SOCIAL_PROVIDERS,
    'NEXT_PUBLIC_EMAIL_SHOW_WALLETS': process.env.NEXT_PUBLIC_EMAIL_SHOW_WALLETS,
    'NEXT_PUBLIC_SMART_ACCOUNT_ENABLED': process.env.NEXT_PUBLIC_SMART_ACCOUNT_ENABLED,
    'NEXT_PUBLIC_SPONSORED_TRANSACTIONS': process.env.NEXT_PUBLIC_SPONSORED_TRANSACTIONS,
    'NEXT_PUBLIC_PAYMASTER_URL': process.env.NEXT_PUBLIC_PAYMASTER_URL,
    'NEXT_PUBLIC_BUNDLER_URL': process.env.NEXT_PUBLIC_BUNDLER_URL,
    'NEXT_PUBLIC_THEME_MODE': process.env.NEXT_PUBLIC_THEME_MODE,
    'NEXT_PUBLIC_ALL_WALLETS': process.env.NEXT_PUBLIC_ALL_WALLETS,
    'NEXT_PUBLIC_CUSTOM_RPC_URLS': process.env.NEXT_PUBLIC_CUSTOM_RPC_URLS,
    'NEXT_PUBLIC_IS_DEFAULTS': process.env.NEXT_PUBLIC_IS_DEFAULTS,
    'NEXT_PUBLIC_TENDERLY_USERNAME': process.env.NEXT_PUBLIC_TENDERLY_USERNAME,
    'NEXT_PUBLIC_TENDERLY_PROJECT_SLUG': process.env.NEXT_PUBLIC_TENDERLY_PROJECT_SLUG,
    // Thirdweb (x402 protocol)
    'NEXT_PUBLIC_THIRDWEB_CLIENT_ID': process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
  }

  const allClientVars = [...REQUIRED_CLIENT_ENV_VARS, ...OPTIONAL_CLIENT_ENV_VARS]

  allClientVars.forEach((varName) => {
    const value = envVars[varName]

    if (value && value.trim() !== '') {
      present.push(varName)
      // Mask sensitive values
      if (varName.includes('KEY') || varName.includes('SECRET') || varName.includes('TOKEN')) {
        const maskedValue =
          value.length > 12 ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}` : `${value.substring(0, 4)}...`
        values[varName] = maskedValue
      } else {
        values[varName] = value
      }
    } else {
      missing.push(varName)
      values[varName] = ''
    }
  })

  return { present, missing, values }
}

// =============================================================================
// Chain Info Helpers (for display/documentation)
// =============================================================================

export function getAvailableChainInfo(): {
  mode: string
  mainnetChains: string[]
  testnetChains: string[]
  activeChains: string[]
} {
  return {
    mode: APP_MODE,
    mainnetChains: MAINNET_CHAIN_NAMES,
    testnetChains: TESTNET_CHAIN_NAMES,
    activeChains: Object.keys(SUPPORTED_CHAINS),
  }
}

// =============================================================================
// Server Validation (for backwards compatibility)
// =============================================================================

export interface ServerValidationResult {
  valid: boolean
  missing: string[]
  configured: string[]
  warnings: string[]
  categories: Record<
    string,
    {
      configured: number
      total: number
      vars: Array<{
        name: string
        configured: boolean
        description: string
      }>
    }
  >
}

export async function validateServerEnvironment(): Promise<ServerValidationResult | null> {
  try {
    const response = await fetch('/api/validate-server-env', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      console.warn('Server environment validation failed:', response.statusText)
      return null
    }

    const data = await response.json()
    return data.success ? data.serverEnv : null
  } catch (error) {
    console.warn('Failed to validate server environment:', error)
    return null
  }
}

export interface FullValidationResult {
  clientSide: ValidationResult
  serverSide?: ServerValidationResult
  overall: {
    valid: boolean
    hasServerIssues: boolean
    hasClientIssues: boolean
  }
}

export async function validateFullEnvironment(config: EnvConfig): Promise<FullValidationResult> {
  const clientValidation = validateConfig(config)
  const serverValidation = await validateServerEnvironment()

  const hasClientIssues = !clientValidation.valid
  const hasServerIssues = serverValidation ? !serverValidation.valid : false

  return {
    clientSide: clientValidation,
    serverSide: serverValidation ?? undefined,
    overall: {
      valid: clientValidation.valid && (serverValidation?.valid ?? true),
      hasServerIssues,
      hasClientIssues,
    },
  }
}

// =============================================================================
// Exports
// =============================================================================

export const envConfig = parseEnvConfig()
export const configValidation = validateConfig(envConfig)
