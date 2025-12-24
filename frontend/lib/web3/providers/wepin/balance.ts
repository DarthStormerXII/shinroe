/**
 * Balance Hook - WEPIN Implementation
 *
 * Provides balance fetching using viem and WEPIN context.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPublicClient, http, formatUnits } from 'viem'
import { useWepinContext } from './wepin-client'
import { getChainById } from '@/lib/config/chains'
import type { UseBalanceParams, UseBalanceReturn } from './types'

/**
 * Hook to get token or native balance
 */
export function useBalance(params: UseBalanceParams = {}): UseBalanceReturn {
  const { address: paramAddress, token, chainId: paramChainId, watch = false } = params

  const { address: connectedAddress, chainId: currentChainId } = useWepinContext()
  const [balance, setBalance] = useState<bigint | undefined>(undefined)
  const [formatted, setFormatted] = useState<string | undefined>(undefined)
  const [symbol, setSymbol] = useState<string | undefined>(undefined)
  const [decimals, setDecimals] = useState<number | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefetching, setIsRefetching] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const targetAddress = paramAddress || connectedAddress
  const targetChainId = paramChainId || currentChainId

  const fetchBalance = useCallback(async () => {
    if (!targetAddress || !targetChainId) {
      setBalance(undefined)
      return
    }

    const chainConfig = getChainById(targetChainId)
    if (!chainConfig?.rpcUrl) {
      setError(new Error(`No RPC URL configured for chain ${targetChainId}`))
      return
    }

    const client = createPublicClient({
      chain: {
        id: targetChainId,
        name: chainConfig.name,
        nativeCurrency: chainConfig.chain.nativeCurrency,
        rpcUrls: { default: { http: [chainConfig.rpcUrl] } },
      },
      transport: http(chainConfig.rpcUrl),
    })

    try {
      if (token) {
        // ERC20 balance
        const [balanceResult, decimalsResult, symbolResult] = await Promise.all([
          client.readContract({
            address: token,
            abi: [
              {
                inputs: [{ name: 'account', type: 'address' }],
                name: 'balanceOf',
                outputs: [{ name: '', type: 'uint256' }],
                stateMutability: 'view',
                type: 'function',
              },
            ],
            functionName: 'balanceOf',
            args: [targetAddress as `0x${string}`],
          }),
          client.readContract({
            address: token,
            abi: [
              {
                inputs: [],
                name: 'decimals',
                outputs: [{ name: '', type: 'uint8' }],
                stateMutability: 'view',
                type: 'function',
              },
            ],
            functionName: 'decimals',
          }),
          client.readContract({
            address: token,
            abi: [
              {
                inputs: [],
                name: 'symbol',
                outputs: [{ name: '', type: 'string' }],
                stateMutability: 'view',
                type: 'function',
              },
            ],
            functionName: 'symbol',
          }),
        ])

        setBalance(balanceResult as bigint)
        setDecimals(decimalsResult as number)
        setSymbol(symbolResult as string)
        setFormatted(formatUnits(balanceResult as bigint, decimalsResult as number))
      } else {
        // Native balance
        const balanceResult = await client.getBalance({
          address: targetAddress as `0x${string}`,
        })

        const nativeCurrency = chainConfig.chain.nativeCurrency
        setBalance(balanceResult)
        setDecimals(nativeCurrency.decimals)
        setSymbol(nativeCurrency.symbol)
        setFormatted(formatUnits(balanceResult, nativeCurrency.decimals))
      }
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch balance'))
    }
  }, [targetAddress, targetChainId, token])

  // Initial fetch
  useEffect(() => {
    setIsLoading(true)
    fetchBalance().finally(() => setIsLoading(false))
  }, [fetchBalance])

  // Watch interval
  useEffect(() => {
    if (!watch) return

    const interval = setInterval(() => {
      setIsRefetching(true)
      fetchBalance().finally(() => setIsRefetching(false))
    }, 10000)

    return () => clearInterval(interval)
  }, [watch, fetchBalance])

  // Refetch trigger
  useEffect(() => {
    if (refetchTrigger > 0) {
      setIsRefetching(true)
      fetchBalance().finally(() => setIsRefetching(false))
    }
  }, [refetchTrigger, fetchBalance])

  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1)
  }, [])

  return {
    balance,
    formatted,
    symbol,
    decimals,
    isLoading,
    isRefetching,
    error,
    refetch,
  }
}
