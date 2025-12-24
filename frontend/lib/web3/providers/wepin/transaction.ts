/**
 * Transaction Hooks - WEPIN Implementation
 *
 * Provides transaction functionality using WEPIN's EIP-1193 provider.
 */

'use client'

import { useCallback, useState, useEffect } from 'react'
import { createPublicClient, http, toHex } from 'viem'
import { useWepinContext } from './wepin-client'
import { getChainById } from '@/lib/config/chains'
import type {
  TransactionRequest,
  UseSendTransactionReturn,
  UseWaitForTransactionParams,
  UseWaitForTransactionReturn,
} from './types'

type EIP1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

/**
 * Hook to send a transaction
 */
export function useSendTransaction(): UseSendTransactionReturn {
  const { address, isConnected, getCurrentNetworkProvider } = useWepinContext()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const sendTransaction = useCallback(
    async (tx: TransactionRequest): Promise<`0x${string}`> => {
      // Get the current network provider from ref (avoids stale closures)
      const currentProvider = getCurrentNetworkProvider()
      if (!currentProvider || !address || !isConnected) {
        throw new Error('Wallet not connected')
      }

      setIsPending(true)
      setError(null)

      try {
        const provider = currentProvider as EIP1193Provider

        // Prepare transaction params
        const txParams = {
          from: address,
          to: tx.to,
          value: tx.value ? toHex(tx.value) : undefined,
          data: tx.data,
          gas: tx.gas ? toHex(tx.gas) : undefined,
          gasPrice: tx.gasPrice ? toHex(tx.gasPrice) : undefined,
          maxFeePerGas: tx.maxFeePerGas ? toHex(tx.maxFeePerGas) : undefined,
          maxPriorityFeePerGas: tx.maxPriorityFeePerGas ? toHex(tx.maxPriorityFeePerGas) : undefined,
        }

        const hash = await provider.request({
          method: 'eth_sendTransaction',
          params: [txParams],
        })

        return hash as `0x${string}`
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Transaction failed')
        setError(error)
        throw error
      } finally {
        setIsPending(false)
      }
    },
    [getCurrentNetworkProvider, address, isConnected]
  )

  return { sendTransaction, isPending, error }
}

/**
 * Hook to wait for a transaction to be confirmed
 */
export function useWaitForTransaction(params: UseWaitForTransactionParams): UseWaitForTransactionReturn {
  const { hash } = params
  const { chainId } = useWepinContext()

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!hash || !chainId) return

    const chainConfig = getChainById(chainId)
    if (!chainConfig?.rpcUrl) return

    setIsLoading(true)
    setIsSuccess(false)
    setIsError(false)
    setError(null)

    const client = createPublicClient({
      chain: {
        id: chainId,
        name: chainConfig.name,
        nativeCurrency: chainConfig.chain.nativeCurrency,
        rpcUrls: { default: { http: [chainConfig.rpcUrl] } },
      },
      transport: http(chainConfig.rpcUrl),
    })

    client
      .waitForTransactionReceipt({ hash })
      .then((receipt) => {
        if (receipt.status === 'success') {
          setIsSuccess(true)
        } else {
          setIsError(true)
          setError(new Error('Transaction reverted'))
        }
      })
      .catch((err) => {
        setIsError(true)
        setError(err instanceof Error ? err : new Error('Failed to get receipt'))
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [hash, chainId])

  return { isLoading, isSuccess, isError, error }
}

/**
 * Hook to get current gas price
 */
export function useGasPrice(): { gasPrice: bigint | undefined; isLoading: boolean; refetch: () => void; error: string | null } {
  const { chainId, getCurrentNetworkProvider, getCurrentChainId } = useWepinContext()
  const [gasPrice, setGasPrice] = useState<bigint | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetchTrigger, setFetchTrigger] = useState(0)

  const refetch = useCallback(() => {
    setFetchTrigger((prev) => prev + 1)
  }, [])

  useEffect(() => {
    // Use getter to get current chain ID from ref
    const currentChainId = getCurrentChainId() || chainId
    if (!currentChainId) {
      setGasPrice(undefined)
      setError('No chain connected')
      return
    }

    const fetchGasPrice = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Get current network provider from ref
        const currentProvider = getCurrentNetworkProvider()
        // First try using the WEPIN provider directly (avoids CORS)
        if (currentProvider) {
          const provider = currentProvider as { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> }
          const result = await provider.request({
            method: 'eth_gasPrice',
            params: [],
          })
          setGasPrice(BigInt(result as string))
          return
        }

        // Fallback to direct RPC call
        const chainConfig = getChainById(currentChainId)
        if (!chainConfig?.rpcUrl) {
          setError('No RPC configured for this chain')
          setGasPrice(undefined)
          return
        }

        const response = await fetch(chainConfig.rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'eth_gasPrice',
            params: [],
          }),
        })

        const data = await response.json()
        if (data.error) {
          throw new Error(data.error.message || 'RPC error')
        }

        setGasPrice(BigInt(data.result))
      } catch (err) {
        console.warn('Failed to fetch gas price:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch gas price')
        setGasPrice(undefined)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGasPrice()

    const interval = setInterval(fetchGasPrice, 15000)
    return () => clearInterval(interval)
  }, [chainId, getCurrentNetworkProvider, getCurrentChainId, fetchTrigger])

  return { gasPrice, isLoading, refetch, error }
}
