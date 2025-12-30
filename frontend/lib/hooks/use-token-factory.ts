'use client'

import { useState, useCallback, useEffect } from 'react'
import { useWriteContract, usePublicClient, useAccount } from '@/lib/web3'
import { getContractByName } from '@/constants/contracts'
import type { Address, Abi } from 'viem'
import { parseUnits, decodeEventLog, parseAbi } from 'viem'

const CHAIN_ID = 80002 // Polygon Amoy

// TokenCreated event ABI for decoding
const TOKEN_CREATED_EVENT = parseAbi([
  'event TokenCreated(address indexed token, address indexed creator, string name, string symbol, uint256 totalSupply)'
])

interface ContractInfo {
  address: Address
  abi: Abi
}

export interface CreateTokenParams {
  name: string
  symbol: string
  decimals: number
  totalSupply: string // In token units, will be converted
}

export interface TokenInfo {
  address: Address
  name: string
  symbol: string
  decimals: number
  totalSupply: bigint
}

interface TransactionResult {
  hash: `0x${string}`
  tokenAddress?: Address
}

interface UseTokenFactoryReturn {
  createToken: (params: CreateTokenParams) => Promise<TransactionResult>
  isLoading: boolean
  myTokens: Address[]
  loadMyTokens: () => Promise<void>
}

export function useTokenFactory(): UseTokenFactoryReturn {
  const { writeContract } = useWriteContract()
  const { publicClient } = usePublicClient()
  const { address } = useAccount()
  const [contract, setContract] = useState<ContractInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [myTokens, setMyTokens] = useState<Address[]>([])

  // Load contract on mount
  useEffect(() => {
    async function loadContract() {
      try {
        const tokenFactory = await getContractByName(CHAIN_ID, 'TokenFactory')
        if (tokenFactory) {
          setContract({ address: tokenFactory.address, abi: tokenFactory.abi })
        }
      } catch (err) {
        console.error('Failed to load TokenFactory contract:', err)
      }
    }
    loadContract()
  }, [])

  const loadMyTokens = useCallback(async () => {
    if (!contract || !publicClient || !address) return
    try {
      const tokens = await publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: 'getTokensByCreator',
        args: [address],
      }) as Address[]
      setMyTokens(tokens)
    } catch (err) {
      console.error('Failed to load tokens:', err)
    }
  }, [contract, publicClient, address])

  // Load tokens when contract and address are available
  useEffect(() => {
    if (contract && address) {
      loadMyTokens()
    }
  }, [contract, address, loadMyTokens])

  const createToken = useCallback(
    async (params: CreateTokenParams): Promise<TransactionResult> => {
      if (!contract || !publicClient) throw new Error('Contract not loaded')
      setIsLoading(true)

      try {
        const totalSupplyWei = parseUnits(params.totalSupply, params.decimals)
        const hash = await writeContract({
          address: contract.address,
          abi: contract.abi as readonly unknown[],
          functionName: 'createToken',
          args: [params.name, params.symbol, params.decimals, totalSupplyWei],
        })

        const receipt = await publicClient.waitForTransactionReceipt({ hash })

        // Extract token address from TokenCreated event
        let tokenAddress: Address | undefined
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: TOKEN_CREATED_EVENT,
              data: log.data,
              topics: log.topics,
            })
            if (decoded.eventName === 'TokenCreated') {
              tokenAddress = decoded.args.token as Address
              break
            }
          } catch {
            // Not the event we're looking for, continue
          }
        }

        await loadMyTokens()
        return { hash, tokenAddress }
      } finally {
        setIsLoading(false)
      }
    },
    [contract, publicClient, writeContract, loadMyTokens]
  )

  return { createToken, isLoading, myTokens, loadMyTokens }
}
