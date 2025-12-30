'use client'

import { useReadContract } from '@/lib/web3'
import { getContractByName } from '@/constants/contracts'
import { useState, useEffect, useCallback } from 'react'
import type { Address } from 'viem'

const CHAIN_ID = 80002 // Polygon Amoy

interface UseRegistrationStatusReturn {
  isRegistered: boolean
  isLoading: boolean
  error: string | null
  refetch: () => void
  setRegisteredOptimistic: () => void
}

export function useRegistrationStatus(address: Address | null): UseRegistrationStatusReturn {
  const [contractAddress, setContractAddress] = useState<Address | null>(null)
  const [contractAbi, setContractAbi] = useState<readonly unknown[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [optimisticRegistered, setOptimisticRegistered] = useState(false)

  // Load contract config
  useEffect(() => {
    async function loadContract() {
      try {
        const contract = await getContractByName(CHAIN_ID, 'ScoreRegistry')
        if (contract) {
          setContractAddress(contract.address)
          setContractAbi(contract.abi)
        } else {
          setLoadError('ScoreRegistry contract not found')
        }
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load contract')
      }
    }
    loadContract()
  }, [])

  // Reset optimistic state when address changes
  useEffect(() => {
    setOptimisticRegistered(false)
  }, [address])

  const { data, isLoading, error, refetch } = useReadContract<boolean>({
    address: contractAddress ?? '0x0000000000000000000000000000000000000000',
    abi: contractAbi ?? [],
    functionName: 'isRegistered',
    args: [address ?? '0x0000000000000000000000000000000000000000'],
    chainId: CHAIN_ID,
  })

  const shouldSkip = !address || !contractAddress || !contractAbi

  // Optimistic update - immediately mark as registered after successful tx
  const setRegisteredOptimistic = useCallback(() => {
    setOptimisticRegistered(true)
  }, [])

  return {
    isRegistered: optimisticRegistered || (shouldSkip ? false : (data ?? false)),
    isLoading: shouldSkip ? false : isLoading,
    error: loadError || (error?.message ?? null),
    refetch,
    setRegisteredOptimistic,
  }
}
