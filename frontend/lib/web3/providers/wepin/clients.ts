/**
 * Client Hooks - WEPIN Implementation
 *
 * Provides viem PublicClient and WalletClient compatible interfaces using WEPIN.
 */

'use client'

import { useMemo } from 'react'
import { createPublicClient, createWalletClient, custom, http } from 'viem'
import type { PublicClient, WalletClient, Chain } from 'viem'
import { useWepinContext } from './wepin-client'
import { getChainById } from '@/lib/config/chains'
import type { UsePublicClientReturn, UseWalletClientReturn } from './types'

/**
 * Hook to get a viem PublicClient for the current chain or a specific chain
 */
export function usePublicClient(params?: { chainId?: number }): UsePublicClientReturn {
  const { chainId: currentChainId } = useWepinContext()
  const specificChainId = params?.chainId

  const publicClient = useMemo(() => {
    const targetChainId = specificChainId || currentChainId
    if (!targetChainId) return undefined

    const chainConfig = getChainById(targetChainId)
    if (!chainConfig?.rpcUrl) {
      console.warn(`No RPC URL configured for chain ${targetChainId}`)
      return undefined
    }

    const viemChain: Chain = {
      id: targetChainId,
      name: chainConfig.name || `Chain ${targetChainId}`,
      nativeCurrency: chainConfig.chain.nativeCurrency || {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: {
        default: { http: [chainConfig.rpcUrl] },
      },
    }

    return createPublicClient({
      chain: viemChain,
      transport: http(chainConfig.rpcUrl),
    }) as PublicClient
  }, [specificChainId, currentChainId])

  return { publicClient }
}

/**
 * Hook to get a viem WalletClient for the connected wallet
 *
 * IMPORTANT: The walletClient is created fresh on every render (no memoization)
 * to ensure it always has the correct chain configuration after chain switching.
 * This is necessary because viem's writeContract calls eth_chainId before sending
 * transactions and validates it against the walletClient's chain.
 */
export function useWalletClient(): UseWalletClientReturn {
  const { address, chainId, networkProvider, isConnected, getCurrentNetworkProvider, getCurrentChainId } = useWepinContext()

  // Get current chain ID from ref (most up-to-date) or fall back to state
  const currentChainId = getCurrentChainId() || chainId
  const currentNetworkProvider = getCurrentNetworkProvider() || networkProvider

  // Create walletClient WITHOUT useMemo to ensure fresh creation after chain switch
  // This prevents stale chain configuration when switching networks
  let walletClient: WalletClient | undefined = undefined

  if (address && currentChainId && currentNetworkProvider && isConnected) {
    try {
      const chainConfig = getChainById(currentChainId)
      if (chainConfig) {
        const viemChain: Chain = {
          id: currentChainId,
          name: chainConfig.name || `Chain ${currentChainId}`,
          nativeCurrency: chainConfig.chain.nativeCurrency || {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: {
            default: { http: [chainConfig.rpcUrl] },
          },
        }

        // Create a custom transport that uses WEPIN's EIP-1193 provider
        // The transport always fetches the latest provider from the ref
        const wepinTransport = custom({
          async request({ method, params }) {
            // Always get the latest provider from ref at request time
            const provider = getCurrentNetworkProvider() as { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> }
            if (!provider) {
              throw new Error('Network provider not available')
            }
            return provider.request({ method, params: params as unknown[] })
          },
        })

        walletClient = createWalletClient({
          account: address as `0x${string}`,
          chain: viemChain,
          transport: wepinTransport,
        }) as WalletClient
      }
    } catch (e) {
      console.warn('Failed to create wallet client:', e)
    }
  }

  return { walletClient, isLoading: false }
}
