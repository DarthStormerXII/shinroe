/**
 * Account Hook - WEPIN Implementation
 *
 * Provides account information using WEPIN context.
 */

'use client'

import { useMemo } from 'react'
import { useWepinContext } from './wepin-client'
import type { Web3Account } from './types'
import type { Chain } from 'viem'
import { getChainById } from '@/lib/config/chains'

/**
 * Hook to get the connected account information
 */
export function useAccount(): Web3Account {
  const { isConnected, address, chainId, isInitialized } = useWepinContext()

  const chain = useMemo((): Chain | undefined => {
    if (!chainId) return undefined

    const chainConfig = getChainById(chainId)
    if (!chainConfig) return undefined

    return {
      id: chainId,
      name: chainConfig.name,
      nativeCurrency: chainConfig.chain.nativeCurrency,
      rpcUrls: {
        default: { http: [chainConfig.rpcUrl] },
      },
      blockExplorers: chainConfig.chain.blockExplorers,
    } as Chain
  }, [chainId])

  return {
    address: address as `0x${string}` | undefined,
    isConnected,
    isConnecting: !isInitialized,
    isDisconnected: !address && isInitialized,
    chain,
    chainId: chainId || undefined,
    isSmartAccount: false, // WEPIN doesn't support smart accounts
    walletId: isConnected ? 'wepin' : undefined,
  }
}

/**
 * Hook to check if the connected wallet is a smart account
 * WEPIN does not support smart accounts
 */
export function useIsSmartAccount(): {
  isSmartAccount: boolean
  walletId: string | undefined
  isLoading: boolean
} {
  const { isConnected, isInitialized } = useWepinContext()

  return {
    isSmartAccount: false,
    walletId: isConnected ? 'wepin' : undefined,
    isLoading: !isInitialized,
  }
}
