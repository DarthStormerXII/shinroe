'use client'

import { useState, useCallback, useEffect } from 'react'
import { useWriteContract, useAccount, usePublicClient } from '@/lib/web3'
import { getContractByName } from '@/constants/contracts'
import { computeScoreHash } from '@/lib/utils/score-hash'
import type { Address, Abi } from 'viem'

const CHAIN_ID = 80002 // Polygon Amoy
const INITIAL_SCORE = 100 // Default score for new users

interface ContractInfo {
  address: Address
  abi: Abi
}

interface TransactionResult {
  hash: `0x${string}`
  success: boolean
}

interface UseRegistrationContractReturn {
  registerUser: () => Promise<TransactionResult>
  syncScore: (score: number) => Promise<TransactionResult>
  mintIdentityBadge: () => Promise<TransactionResult>
  setProfileUri: (profileUri: string) => Promise<TransactionResult>
  isLoading: boolean
  reset: () => void
}

export function useRegistrationContract(): UseRegistrationContractReturn {
  const { address: connectedAddress } = useAccount()
  const { writeContract } = useWriteContract()
  const { publicClient } = usePublicClient()
  const [isLoading, setIsLoading] = useState(false)
  const [contracts, setContracts] = useState<{
    scoreRegistry: ContractInfo | null
    badgeNFT: ContractInfo | null
  }>({ scoreRegistry: null, badgeNFT: null })

  // Load contracts on mount
  useEffect(() => {
    async function loadContracts() {
      try {
        const [scoreRegistry, badgeNFT] = await Promise.all([
          getContractByName(CHAIN_ID, 'ScoreRegistry'),
          getContractByName(CHAIN_ID, 'BadgeNFT'),
        ])
        setContracts({
          scoreRegistry: scoreRegistry ? { address: scoreRegistry.address, abi: scoreRegistry.abi } : null,
          badgeNFT: badgeNFT ? { address: badgeNFT.address, abi: badgeNFT.abi } : null,
        })
      } catch (err) {
        console.error('Failed to load contracts:', err)
      }
    }
    loadContracts()
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
    setIsLoading(false)
  }, [])

  // Register user with proper score hash format
  const registerUser = useCallback(async (): Promise<TransactionResult> => {
    if (!connectedAddress || !contracts.scoreRegistry) {
      throw new Error('Wallet not connected or contract not loaded')
    }

    setIsLoading(true)
    try {
      // Use proper score hash format: keccak256(user, score, salt)
      const scoreHash = computeScoreHash(connectedAddress, INITIAL_SCORE)

      const hash = await writeContract({
        address: contracts.scoreRegistry.address,
        abi: contracts.scoreRegistry.abi as readonly unknown[],
        functionName: 'selfRegister',
        args: [scoreHash],
        gas: BigInt(150000),
      })

      const success = await waitForTransaction(hash)
      return { hash, success }
    } finally {
      setIsLoading(false)
    }
  }, [connectedAddress, contracts.scoreRegistry, writeContract, waitForTransaction])

  // Sync score on-chain - call this before claiming score-gated airdrops
  const syncScore = useCallback(async (score: number): Promise<TransactionResult> => {
    if (!connectedAddress || !contracts.scoreRegistry) {
      throw new Error('Wallet not connected or contract not loaded')
    }

    setIsLoading(true)
    try {
      // Compute new score hash with current score
      const scoreHash = computeScoreHash(connectedAddress, score)

      // Use registerAndUpdateScore - it handles both registration and updates
      const hash = await writeContract({
        address: contracts.scoreRegistry.address,
        abi: contracts.scoreRegistry.abi as readonly unknown[],
        functionName: 'registerAndUpdateScore',
        args: [scoreHash],
        gas: BigInt(150000),
      })

      const success = await waitForTransaction(hash)
      return { hash, success }
    } finally {
      setIsLoading(false)
    }
  }, [connectedAddress, contracts.scoreRegistry, writeContract, waitForTransaction])

  const mintIdentityBadge = useCallback(async (): Promise<TransactionResult> => {
    if (!connectedAddress || !contracts.badgeNFT) {
      throw new Error('Wallet not connected or contract not loaded')
    }

    setIsLoading(true)
    try {
      const hash = await writeContract({
        address: contracts.badgeNFT.address,
        abi: contracts.badgeNFT.abi as readonly unknown[],
        functionName: 'claimVerifiedIdentityBadge',
        args: [],
        gas: BigInt(250000),
      })

      const success = await waitForTransaction(hash)
      return { hash, success }
    } finally {
      setIsLoading(false)
    }
  }, [connectedAddress, contracts.badgeNFT, writeContract, waitForTransaction])

  const setProfileUri = useCallback(async (profileUri: string): Promise<TransactionResult> => {
    if (!connectedAddress || !contracts.scoreRegistry) {
      throw new Error('Wallet not connected or contract not loaded')
    }

    setIsLoading(true)
    try {
      const hash = await writeContract({
        address: contracts.scoreRegistry.address,
        abi: contracts.scoreRegistry.abi as readonly unknown[],
        functionName: 'setProfileUri',
        args: [profileUri],
        gas: BigInt(100000),
      })

      const success = await waitForTransaction(hash)
      return { hash, success }
    } finally {
      setIsLoading(false)
    }
  }, [connectedAddress, contracts.scoreRegistry, writeContract, waitForTransaction])

  return {
    registerUser,
    syncScore,
    mintIdentityBadge,
    setProfileUri,
    isLoading,
    reset,
  }
}
