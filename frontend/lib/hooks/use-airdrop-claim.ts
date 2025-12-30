'use client'

import { useState, useCallback, useEffect } from 'react'
import { useWriteContract, usePublicClient } from '@/lib/web3'
import { getContractByName } from '@/constants/contracts'
import { generateSalt } from '@/lib/utils/score-hash'
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

interface ClaimParams {
  airdropId: string
  score: number
  userAddress: Address
}

interface UseAirdropClaimReturn {
  claim: (params: ClaimParams) => Promise<TransactionResult>
  isLoading: boolean
  error: Error | null
  reset: () => void
}

export function useAirdropClaim(): UseAirdropClaimReturn {
  const { writeContract } = useWriteContract()
  const { publicClient } = usePublicClient()
  const [contract, setContract] = useState<ContractInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Load contract on mount
  useEffect(() => {
    async function loadContract() {
      try {
        const airdropVault = await getContractByName(CHAIN_ID, 'AirdropVault')
        if (airdropVault) {
          setContract({ address: airdropVault.address, abi: airdropVault.abi })
        }
      } catch (err) {
        console.error('Failed to load AirdropVault contract:', err)
      }
    }
    loadContract()
  }, [])

  const waitForTransaction = useCallback(
    async (hash: `0x${string}`): Promise<{ success: boolean; error?: string }> => {
      if (!publicClient) return { success: false, error: 'No public client' }
      try {
        const receipt = await publicClient.waitForTransactionReceipt({ hash })
        if (receipt.status === 'success') {
          return { success: true }
        }
        // Try to get revert reason
        return { success: false, error: 'Transaction reverted' }
      } catch (err) {
        console.error('[waitForTransaction] Error:', err)
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
      }
    },
    [publicClient]
  )

  const reset = useCallback(() => {
    setError(null)
    setIsLoading(false)
  }, [])

  const claim = useCallback(
    async ({ airdropId, score, userAddress }: ClaimParams): Promise<TransactionResult> => {
      if (!contract) {
        throw new Error('AirdropVault contract not loaded')
      }

      setIsLoading(true)
      setError(null)

      try {
        // Use the same deterministic salt as registration
        // This ensures the score hash verification passes
        const salt = generateSalt(userAddress)

        // First simulate to get better error messages
        if (publicClient) {
          try {
            await publicClient.simulateContract({
              address: contract.address,
              abi: contract.abi as readonly unknown[],
              functionName: 'claim',
              args: [BigInt(airdropId), BigInt(score), salt],
              account: userAddress,
            })
          } catch (simErr: unknown) {
            console.error('[useAirdropClaim.claim] Simulation failed:', simErr)
            // Parse the revert reason
            const errMsg = simErr instanceof Error ? simErr.message : String(simErr)
            if (errMsg.includes('Invalid score proof')) {
              throw new Error('Score verification failed. Please sync your score on-chain first using the "Sync Score" button.')
            }
            if (errMsg.includes('Not registered')) {
              throw new Error('You must register your identity on-chain first.')
            }
            if (errMsg.includes('AlreadyClaimed')) {
              throw new Error('You have already claimed this airdrop.')
            }
            if (errMsg.includes('AirdropNotActive')) {
              throw new Error('This airdrop is no longer active.')
            }
            if (errMsg.includes('AirdropEnded')) {
              throw new Error('This airdrop has ended.')
            }
            if (errMsg.includes('AirdropNotStarted')) {
              throw new Error('This airdrop has not started yet.')
            }
            if (errMsg.includes('Score too low')) {
              throw new Error('Your reputation score is too low for this airdrop.')
            }
            if (errMsg.includes('Missing required badge')) {
              throw new Error('You are missing a required badge for this airdrop.')
            }
            throw new Error(errMsg)
          }
        }

        const hash = await writeContract({
          address: contract.address,
          abi: contract.abi as readonly unknown[],
          functionName: 'claim',
          args: [BigInt(airdropId), BigInt(score), salt],
        })

        const result = await waitForTransaction(hash)

        if (!result.success) {
          throw new Error(result.error || 'Transaction failed')
        }

        return { hash, success: result.success }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to claim')
        setError(error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [contract, writeContract, waitForTransaction]
  )

  return {
    claim,
    isLoading,
    error,
    reset,
  }
}
