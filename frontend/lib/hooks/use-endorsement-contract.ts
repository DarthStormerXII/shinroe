'use client'

import { useState, useCallback, useEffect } from 'react'
import { useWriteContract, usePublicClient } from '@/lib/web3'
import { getContractByName } from '@/constants/contracts'
import { ENDORSEMENT_TYPES, type EndorsementType } from '@/lib/types/shinroe'
import type { Address, Abi } from 'viem'

const CHAIN_ID = 80002 // Polygon Amoy

interface ContractInfo {
  address: Address
  abi: Abi
}

interface TransactionResult {
  hash: `0x${string}`
  success: boolean
}

interface UseEndorsementContractReturn {
  createEndorsement: (endorsee: Address, type: EndorsementType, stake: bigint) => Promise<TransactionResult>
  withdrawEndorsement: (id: bigint) => Promise<TransactionResult>
  reset: () => void
}

export function useEndorsementContract(): UseEndorsementContractReturn {
  const { writeContract } = useWriteContract()
  const { publicClient } = usePublicClient()
  const [contract, setContract] = useState<ContractInfo | null>(null)

  // Load contract on mount
  useEffect(() => {
    async function loadContract() {
      try {
        const endorsementVault = await getContractByName(CHAIN_ID, 'EndorsementVault')
        if (endorsementVault) {
          setContract({ address: endorsementVault.address, abi: endorsementVault.abi })
        }
      } catch (err) {
        console.error('Failed to load contract:', err)
      }
    }
    loadContract()
  }, [])

  const waitForTransaction = useCallback(async (hash: `0x${string}`): Promise<boolean> => {
    if (!publicClient) return false
    try {
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      return receipt.status === 'success'
    } catch {
      return false
    }
  }, [publicClient])

  const reset = useCallback(() => {
    // Reset any state if needed
  }, [])

  const createEndorsement = useCallback(
    async (endorsee: Address, type: EndorsementType, stake: bigint): Promise<TransactionResult> => {
      if (!contract) throw new Error('Contract not loaded')

      const hash = await writeContract({
        address: contract.address,
        abi: contract.abi as readonly unknown[],
        functionName: 'endorse',
        args: [endorsee, BigInt(ENDORSEMENT_TYPES[type].value)],
        value: stake,
      })

      const success = await waitForTransaction(hash)
      return { hash, success }
    },
    [contract, writeContract, waitForTransaction]
  )

  const withdrawEndorsement = useCallback(
    async (id: bigint): Promise<TransactionResult> => {
      if (!contract) throw new Error('Contract not loaded')

      const hash = await writeContract({
        address: contract.address,
        abi: contract.abi as readonly unknown[],
        functionName: 'withdrawEndorsement',
        args: [id],
      })

      const success = await waitForTransaction(hash)
      return { hash, success }
    },
    [contract, writeContract, waitForTransaction]
  )

  return {
    createEndorsement,
    withdrawEndorsement,
    reset,
  }
}
