/**
 * Chain Hooks - WEPIN Implementation
 *
 * Provides chain-related functionality using WEPIN context.
 */

'use client'

import { useCallback, useState } from 'react'
import { useWepinContext } from './wepin-client'
import type { UseSwitchChainReturn, UseChainsReturn } from './types'
import type { Chain } from 'viem'
import { getSupportedViemChains } from '@/lib/config/chains'

/**
 * Hook to get the current chain ID
 */
export function useChainId(): number | undefined {
  const { chainId } = useWepinContext()
  return chainId || undefined
}

/**
 * Hook to switch chains
 */
export function useSwitchChain(): UseSwitchChainReturn {
  const { switchNetwork, isInitialized } = useWepinContext()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const switchChain = useCallback(
    async (chainId: number) => {
      if (!isInitialized) {
        throw new Error('WEPIN not initialized')
      }

      setIsPending(true)
      setError(null)

      try {
        await switchNetwork(chainId)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to switch chain')
        setError(error)
        throw error
      } finally {
        setIsPending(false)
      }
    },
    [switchNetwork, isInitialized]
  )

  return { switchChain, isPending, error }
}

/**
 * Hook to get all configured chains
 */
export function useChains(): UseChainsReturn {
  const chains = getSupportedViemChains() as readonly Chain[]
  return { chains }
}
