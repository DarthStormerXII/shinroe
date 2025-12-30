'use client'

import { useState, useCallback, useEffect } from 'react'
import { useWriteContract, usePublicClient } from '@/lib/web3'
import { getContractByName } from '@/constants/contracts'
import type { Address, Abi } from 'viem'
import { parseUnits, erc20Abi } from 'viem'

const CHAIN_ID = 80002

interface ContractInfo {
  address: Address
  abi: Abi
}

export interface AirdropCriteria {
  minScore: number
  requiredBadges: number[]
  badgeRequirement?: 'any' | 'all' // Whether all badges are required or just any one
  minEndorsementWeight: string // In ETH units
  requiresRegistration: boolean
}

export interface AirdropMetadata {
  name: string
  description: string
  image?: string // IPFS URI
}

export interface CreateAirdropParams {
  tokenAddress: Address
  amountPerClaim: string // In token units
  totalAmount: string // In token units
  startTime: Date
  endTime: Date
  criteria: AirdropCriteria
  metadataUri: string
  tokenDecimals: number
}

export interface TransactionResult {
  hash: `0x${string}`
  success: boolean
  airdropId?: bigint
}

type AirdropStep = 'idle' | 'uploading' | 'approving' | 'creating'

interface UseCreateAirdropReturn {
  createAirdrop: (params: CreateAirdropParams) => Promise<TransactionResult>
  approveToken: (tokenAddress: Address, amount: bigint) => Promise<TransactionResult>
  isLoading: boolean
  step: AirdropStep
  error: string | null
}

export function useCreateAirdrop(): UseCreateAirdropReturn {
  const { writeContract } = useWriteContract()
  const { publicClient } = usePublicClient()
  const [contract, setContract] = useState<ContractInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<AirdropStep>('idle')
  const [error, setError] = useState<string | null>(null)

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

  const waitForTx = useCallback(async (hash: `0x${string}`): Promise<boolean> => {
    if (!publicClient) return false
    try {
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      return receipt.status === 'success'
    } catch {
      return false
    }
  }, [publicClient])

  const approveToken = useCallback(
    async (tokenAddress: Address, amount: bigint): Promise<TransactionResult> => {
      if (!contract) throw new Error('Contract not loaded')
      setStep('approving')
      setError(null)

      try {
        const hash = await writeContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'approve',
          args: [contract.address, amount],
        })
        const success = await waitForTx(hash)
        return { hash, success }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Approval failed')
        throw err
      }
    },
    [contract, writeContract, waitForTx]
  )

  const createAirdrop = useCallback(
    async (params: CreateAirdropParams): Promise<TransactionResult> => {
      if (!contract || !publicClient) throw new Error('Contract not loaded')
      setIsLoading(true)
      setStep('creating')
      setError(null)

      try {
        const amountPerClaimWei = parseUnits(params.amountPerClaim, params.tokenDecimals)
        const totalAmountWei = parseUnits(params.totalAmount, params.tokenDecimals)
        const minEndorsementWei = parseUnits(params.criteria.minEndorsementWeight, 18)
        const startTimestamp = BigInt(Math.floor(params.startTime.getTime() / 1000))
        const endTimestamp = BigInt(Math.floor(params.endTime.getTime() / 1000))

        // Criteria must be passed as a struct tuple
        const criteriaStruct = {
          minScore: BigInt(params.criteria.minScore),
          requiredBadges: params.criteria.requiredBadges.map((b) => BigInt(b)),
          minEndorsementWeight: minEndorsementWei,
          requiresRegistration: params.criteria.requiresRegistration,
        }

        const hash = await writeContract({
          address: contract.address,
          abi: contract.abi as readonly unknown[],
          functionName: 'createAirdrop',
          args: [
            params.tokenAddress,
            amountPerClaimWei,
            totalAmountWei,
            startTimestamp,
            endTimestamp,
            criteriaStruct,
            params.metadataUri,
          ],
        })

        const success = await waitForTx(hash)
        setStep('idle')
        return { hash, success }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create airdrop')
        throw err
      } finally {
        setIsLoading(false)
        setStep('idle')
      }
    },
    [contract, publicClient, writeContract, waitForTx]
  )

  return { createAirdrop, approveToken, isLoading, step, error }
}
