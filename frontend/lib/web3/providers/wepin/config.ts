/**
 * WEPIN Configuration
 *
 * This file sets up the WEPIN provider configuration.
 * WEPIN is required because it's the only auth layer that supports VeryChain mainnet.
 */

import { getSupportedViemChains, getSupportedChainList } from '@/lib/config/chains'
import type { Chain } from 'viem'

// =============================================================================
// Configuration
// =============================================================================

/**
 * WEPIN App ID
 * Get yours at https://wepin.io/dashboard
 */
const appId = process.env.NEXT_PUBLIC_WEPIN_APP_ID

/**
 * WEPIN App Key
 * Get yours at https://wepin.io/dashboard
 */
const appKey = process.env.NEXT_PUBLIC_WEPIN_APP_KEY

if (!appId || !appKey) {
  console.warn(
    'NEXT_PUBLIC_WEPIN_APP_ID or NEXT_PUBLIC_WEPIN_APP_KEY is not set. Wallet connection will not work.'
  )
}

/**
 * Supported chains from app configuration
 */
export const supportedChains: readonly Chain[] = getSupportedViemChains()

/**
 * Get chain IDs
 */
export function getSupportedChainIds(): number[] {
  return getSupportedChainList().map((c) => c.chain.id)
}

/**
 * WEPIN to network name mapping
 * Maps chain IDs to WEPIN network names
 */
export const chainIdToWepinNetwork: Record<number, string> = {
  1: 'ethereum',
  11155111: 'evmethsepolia',
  137: 'evmpolygon',
  80002: 'evmpolygon-amoy',
  42161: 'evmarbitrum',
  421614: 'evmarbsepolia',
  10: 'evmoptimism',
  11155420: 'evmopsepolia',
  8453: 'evmbase',
  84532: 'evmbasesepolia',
  43114: 'evmavalanche',
  43113: 'evmavalanch-fuji',
  56: 'evmbsc',
  97: 'evmbsc-testnet',
  4613: 'evmvery', // VeryChain mainnet
}

/**
 * Get WEPIN network name from chain ID
 */
export function getWepinNetworkName(chainId: number): string | undefined {
  return chainIdToWepinNetwork[chainId]
}

/**
 * WEPIN app metadata
 */
export const wepinMetadata = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'EVM Kit App',
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Built with @cipherkuma/evm-kit',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000',
  icon: process.env.NEXT_PUBLIC_APP_ICON || 'https://avatars.githubusercontent.com/u/179229932',
}

/**
 * Export credentials for provider initialization
 */
export { appId, appKey }
