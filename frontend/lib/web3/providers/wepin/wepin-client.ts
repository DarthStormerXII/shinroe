/**
 * WEPIN Client Configuration
 *
 * Creates and exports the WEPIN provider instance used across the app.
 * Also provides React context for managing WEPIN state.
 */

'use client'

import { createContext, useContext } from 'react'
import type { WepinProvider as WepinProviderType } from '@wepin/provider-js'

// =============================================================================
// Types
// =============================================================================

export interface WepinState {
  provider: WepinProviderType | null
  isInitialized: boolean
  isConnected: boolean
  address: string | null
  chainId: number | null
  networkProvider: unknown | null
}

export interface WepinContextValue extends WepinState {
  initialize: () => Promise<void>
  connect: () => Promise<string[]>
  disconnect: () => Promise<void>
  getProvider: (network: string) => Promise<unknown>
  switchNetwork: (chainId: number) => Promise<void>
  // Getter functions that return current values from refs (avoid stale closures)
  getCurrentNetworkProvider: () => unknown | null
  getCurrentChainId: () => number | null
}

// =============================================================================
// Context
// =============================================================================

export const WepinContext = createContext<WepinContextValue | null>(null)

/**
 * Hook to access WEPIN context
 */
export function useWepinContext(): WepinContextValue {
  const context = useContext(WepinContext)
  if (!context) {
    throw new Error('useWepinContext must be used within a WepinProvider')
  }
  return context
}

/**
 * Hook to get the raw WEPIN provider instance
 */
export function useWepinProvider(): WepinProviderType | null {
  const context = useContext(WepinContext)
  return context?.provider || null
}

/**
 * Hook to get the network-specific EIP-1193 provider
 */
export function useWepinNetworkProvider(): unknown | null {
  const context = useContext(WepinContext)
  return context?.networkProvider || null
}

// =============================================================================
// Configuration Check
// =============================================================================

const appId = process.env.NEXT_PUBLIC_WEPIN_APP_ID
const appKey = process.env.NEXT_PUBLIC_WEPIN_APP_KEY

/**
 * Check if WEPIN is properly configured
 */
export function isWepinConfigured(): boolean {
  return !!(appId && appKey)
}

/**
 * Get WEPIN configuration
 */
export function getWepinConfig(): { appId: string; appKey: string } {
  if (!appId || !appKey) {
    throw new Error(
      'WEPIN not configured. Set NEXT_PUBLIC_WEPIN_APP_ID and NEXT_PUBLIC_WEPIN_APP_KEY in your environment.'
    )
  }
  return { appId, appKey }
}
