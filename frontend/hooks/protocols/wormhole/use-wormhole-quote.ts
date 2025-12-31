// =============================================================================
// Wormhole Quote Hook
// =============================================================================

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Address } from 'viem'
import {
  wormholeService,
  type WormholeQuote,
  type WormholeProtocol,
  type WormholeTransferParams,
} from '@/lib/services/wormhole-service'

interface UseWormholeQuoteParams {
  sourceChainId: number | undefined
  destinationChainId: number | undefined
  token: Address | 'native' | undefined
  amount: bigint | undefined
  recipient: Address | undefined
  protocol?: WormholeProtocol
  enabled?: boolean
  debounceMs?: number
}

interface UseWormholeQuoteReturn {
  quote: WormholeQuote | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useWormholeQuote({
  sourceChainId,
  destinationChainId,
  token,
  amount,
  recipient,
  protocol,
  enabled = true,
  debounceMs = 500,
}: UseWormholeQuoteParams): UseWormholeQuoteReturn {
  const [quote, setQuote] = useState<WormholeQuote | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const fetchQuote = useCallback(async () => {
    if (
      !enabled ||
      !sourceChainId ||
      !destinationChainId ||
      !token ||
      !amount ||
      amount === BigInt(0) ||
      !recipient
    ) {
      setQuote(null)
      setError(null)
      return
    }

    // Check chain compatibility
    if (!wormholeService.areChainsCompatible(sourceChainId, destinationChainId)) {
      setError('Source and destination chains must be on the same network (both mainnet or both testnet)')
      setQuote(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const params: WormholeTransferParams = {
        sourceChainId,
        destinationChainId,
        token,
        amount,
        recipient,
        protocol,
      }

      const quoteResult = await wormholeService.getQuote(params)
      setQuote(quoteResult)
      setError(null)
    } catch (e) {
      console.error('Failed to get Wormhole quote:', e)
      setError(e instanceof Error ? e.message : 'Failed to get quote')
      setQuote(null)
    } finally {
      setIsLoading(false)
    }
  }, [sourceChainId, destinationChainId, token, amount, recipient, protocol, enabled])

  // Debounced quote fetching
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (!enabled) {
      setQuote(null)
      setError(null)
      return
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchQuote()
    }, debounceMs)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [fetchQuote, debounceMs, enabled])

  return {
    quote,
    isLoading,
    error,
    refetch: fetchQuote,
  }
}
