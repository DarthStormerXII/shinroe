'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPublicClient, http } from 'viem'
import { polygonAmoy } from 'viem/chains'
import { getContractByName } from '@/constants/contracts'
import { getChainById } from '@/lib/config/chains'
import {
  type EndorsementWithUser,
  getEndorsementTypeFromValue,
} from '@/lib/types/shinroe'
import { userMetadataService } from '@/lib/services/user-metadata-service'
import type { Address } from 'viem'

interface UseEndorsementsReturn {
  received: EndorsementWithUser[]
  given: EndorsementWithUser[]
  totalWeight: bigint
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

interface ContractEndorsement {
  id: bigint
  endorser: Address
  endorsee: Address
  endorsementType: number
  stakeAmount: bigint
  timestamp: bigint
  active: boolean
}

const CHAIN_ID = 80002

function mapContractEndorsement(e: ContractEndorsement, isReceived: boolean): EndorsementWithUser {
  return {
    id: e.id.toString(),
    endorser: e.endorser,
    endorsee: e.endorsee,
    endorsementType: getEndorsementTypeFromValue(e.endorsementType),
    stakeAmount: e.stakeAmount,
    createdAt: Number(e.timestamp),
    active: e.active,
    user: isReceived ? e.endorser : e.endorsee,
  }
}

// Create a public client using configured RPC URL
function getPublicClient() {
  const chainConfig = getChainById(CHAIN_ID)
  return createPublicClient({
    chain: polygonAmoy,
    transport: http(chainConfig?.rpcUrl),
  })
}

export function useEndorsements(address: Address | null): UseEndorsementsReturn {
  const [received, setReceived] = useState<EndorsementWithUser[]>([])
  const [given, setGiven] = useState<EndorsementWithUser[]>([])
  const [totalWeight, setTotalWeight] = useState<bigint>(BigInt(0))
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  useEffect(() => {
    if (!address) {
      setReceived([])
      setGiven([])
      setTotalWeight(BigInt(0))
      setIsLoading(false)
      return
    }

    const fetchEndorsements = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Get contract info
        const contract = await getContractByName(CHAIN_ID, 'EndorsementVault')
        if (!contract) {
          throw new Error('EndorsementVault contract not found')
        }

        // Import ABI dynamically
        const abiModule = await import('@/constants/contracts/80002/abis/EndorsementVault.json')
        const abi = abiModule.default.abi || abiModule.default

        const publicClient = getPublicClient()

        // Fetch endorsements received (where user is endorsee)
        const receivedEndorsements = await publicClient.readContract({
          address: contract.address as Address,
          abi,
          functionName: 'getEndorsements',
          args: [address],
        }) as ContractEndorsement[]

        // Fetch endorsements given (where user is endorser)
        const givenEndorsements = await publicClient.readContract({
          address: contract.address as Address,
          abi,
          functionName: 'getEndorsementsByEndorser',
          args: [address],
        }) as ContractEndorsement[]

        // Fetch total endorsement weight
        const weight = await publicClient.readContract({
          address: contract.address as Address,
          abi,
          functionName: 'getEndorsementWeight',
          args: [address],
        }) as bigint

        // Map contract data to our types
        const mappedReceived = receivedEndorsements.map((e) => mapContractEndorsement(e, true))
        const mappedGiven = givenEndorsements.map((e) => mapContractEndorsement(e, false))

        // Collect unique user addresses to fetch display names
        const allUsers = new Set<string>()
        mappedReceived.forEach((e) => allUsers.add(e.user.toLowerCase()))
        mappedGiven.forEach((e) => allUsers.add(e.user.toLowerCase()))

        // Fetch display names for all users
        const displayNameMap = new Map<string, string | null>()
        await Promise.all(
          Array.from(allUsers).map(async (userAddr) => {
            try {
              const metadata = await userMetadataService.getMetadata(userAddr)
              displayNameMap.set(userAddr, metadata?.displayName || null)
            } catch {
              displayNameMap.set(userAddr, null)
            }
          })
        )

        // Attach display names to endorsements
        const receivedWithNames = mappedReceived.map((e) => ({
          ...e,
          displayName: displayNameMap.get(e.user.toLowerCase()) || null,
        }))
        const givenWithNames = mappedGiven.map((e) => ({
          ...e,
          displayName: displayNameMap.get(e.user.toLowerCase()) || null,
        }))

        setReceived(receivedWithNames)
        setGiven(givenWithNames)
        setTotalWeight(weight)
      } catch (err) {
        console.error('Failed to fetch endorsements:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch endorsements'))
        // Set empty arrays on error
        setReceived([])
        setGiven([])
        setTotalWeight(BigInt(0))
      } finally {
        setIsLoading(false)
      }
    }

    fetchEndorsements()
  }, [address, refetchTrigger])

  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1)
  }, [])

  return { received, given, totalWeight, isLoading, error, refetch }
}
