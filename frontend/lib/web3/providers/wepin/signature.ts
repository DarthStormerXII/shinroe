/**
 * Signature Hooks - WEPIN Implementation
 *
 * Provides message signing functionality using WEPIN's EIP-1193 provider.
 */

'use client'

import { useCallback, useState } from 'react'
import { useWepinContext } from './wepin-client'
import type { UseSignMessageReturn, UseSignTypedDataReturn } from './types'

type EIP1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

/**
 * Hook to sign a message
 */
export function useSignMessage(): UseSignMessageReturn {
  const { networkProvider, address, isConnected } = useWepinContext()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const signMessage = useCallback(
    async (message: string): Promise<`0x${string}`> => {
      if (!networkProvider || !address || !isConnected) {
        throw new Error('Wallet not connected')
      }

      setIsPending(true)
      setError(null)

      try {
        const provider = networkProvider as EIP1193Provider

        const signature = await provider.request({
          method: 'personal_sign',
          params: [message, address],
        })

        return signature as `0x${string}`
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to sign message')
        setError(error)
        throw error
      } finally {
        setIsPending(false)
      }
    },
    [networkProvider, address, isConnected]
  )

  return { signMessage, isPending, error }
}

/**
 * Hook to sign typed data (EIP-712)
 */
export function useSignTypedData(): UseSignTypedDataReturn {
  const { networkProvider, address, isConnected } = useWepinContext()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const signTypedData = useCallback(
    async (typedData: unknown): Promise<`0x${string}`> => {
      if (!networkProvider || !address || !isConnected) {
        throw new Error('Wallet not connected')
      }

      setIsPending(true)
      setError(null)

      try {
        const provider = networkProvider as EIP1193Provider

        const signature = await provider.request({
          method: 'eth_signTypedData_v4',
          params: [address, typedData],
        })

        return signature as `0x${string}`
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to sign typed data')
        setError(error)
        throw error
      } finally {
        setIsPending(false)
      }
    },
    [networkProvider, address, isConnected]
  )

  return { signTypedData, isPending, error }
}
