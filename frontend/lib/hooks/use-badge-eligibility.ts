'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPublicClient, http } from 'viem'
import { polygonAmoy } from 'viem/chains'
import { useWaitForTransaction } from '@/lib/web3'
import { BadgeType, ALL_BADGE_TYPES, type Badge } from '@/lib/types/shinroe'
import { getContractByName } from '@/constants/contracts'
import { getSubgraphUrl } from '@/lib/config/indexer'
import type { Address } from 'viem'

const CHAIN_ID = 80002

export interface EligibilityCheck {
  badge: BadgeType
  eligible: boolean
  reason?: string
  progress?: { current: number; required: number }
}

interface UseBadgeEligibilityReturn {
  ownedBadges: Badge[]; eligibleBadges: BadgeType[]; eligibilityDetails: EligibilityCheck[]
  checkEligibility: (badge: BadgeType) => Promise<boolean>; claimBadge: (badge: BadgeType) => Promise<string | null>
  isLoading: boolean; isLoadingEligibility: boolean; isClaiming: boolean; error: Error | null; refetch: () => Promise<void>
}

// Check owned badges directly from contract (fallback when subgraph is behind)
async function fetchOwnedBadgesFromContract(address: string): Promise<BadgeType[]> {
  try {
    const contract = await getContractByName(CHAIN_ID, 'BadgeNFT')
    if (!contract) return []

    const client = createPublicClient({
      chain: polygonAmoy,
      transport: http(),
    })

    const owned: BadgeType[] = []
    for (const badgeType of ALL_BADGE_TYPES) {
      const hasBadge = await client.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: 'hasBadge',
        args: [address as `0x${string}`, badgeType],
      })
      if (hasBadge) owned.push(badgeType)
    }
    return owned
  } catch {
    return []
  }
}

export function useBadgeEligibility(address: Address | null): UseBadgeEligibilityReturn {
  const [ownedBadges, setOwnedBadges] = useState<Badge[]>([])
  const [optimisticOwned, setOptimisticOwned] = useState<BadgeType[]>([])
  const [eligibilityDetails, setEligibilityDetails] = useState<EligibilityCheck[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingEligibility, setIsLoadingEligibility] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)
  const { isLoading: isTxPending } = useWaitForTransaction({ hash: txHash ?? undefined })

  const fetchOwnedBadges = useCallback(async () => {
    if (!address) { setOwnedBadges([]); return }
    setIsLoading(true); setError(null)
    try {
      // Fetch badges from subgraph and contract in parallel
      const [subgraphBadges, contractBadges] = await Promise.all([
        (async () => {
          const query = `{
            user(id: "${address.toLowerCase()}") {
              badges { badgeType mintedAt }
            }
          }`
          const response = await fetch(getSubgraphUrl(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
          })
          if (!response.ok) return []
          const { data, errors } = await response.json()
          if (errors) return []
          return (data?.user?.badges || []).map((b: { badgeType: number; mintedAt: string }) => ({
            badgeType: b.badgeType as BadgeType,
            mintedAt: parseInt(b.mintedAt),
          }))
        })(),
        fetchOwnedBadgesFromContract(address),
      ])

      // Merge: use subgraph data when available, add contract-only badges
      const subgraphTypes = new Set(subgraphBadges.map((b: Badge) => b.badgeType))
      const badges: Badge[] = [...subgraphBadges]
      for (const badgeType of contractBadges) {
        if (!subgraphTypes.has(badgeType)) {
          badges.push({ badgeType, mintedAt: Math.floor(Date.now() / 1000) })
        }
      }
      setOwnedBadges(badges)
    } catch (err) { setError(err instanceof Error ? err : new Error('Failed to fetch badges')) }
    finally { setIsLoading(false) }
  }, [address])

  const fetchEligibility = useCallback(async () => {
    if (!address) { setEligibilityDetails([]); return }
    setIsLoadingEligibility(true)
    try {
      const res = await fetch(`/api/shinroe/badges/eligibility?address=${address}`)
      if (!res.ok) throw new Error('Failed to fetch eligibility')
      const data = await res.json()
      setEligibilityDetails(data.eligibility || [])
    } catch { setEligibilityDetails([]) }
    finally { setIsLoadingEligibility(false) }
  }, [address])

  useEffect(() => { fetchOwnedBadges(); fetchEligibility() }, [fetchOwnedBadges, fetchEligibility])

  const checkEligibility = useCallback(
    async (badge: BadgeType) => eligibilityDetails.find((d) => d.badge === badge)?.eligible ?? false,
    [eligibilityDetails]
  )

  const claimBadge = useCallback(async (badge: BadgeType): Promise<string | null> => {
    if (!address) throw new Error('Not connected')
    const res = await fetch('/api/shinroe/badges/claim', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, badgeType: badge }),
    })
    const data = await res.json()
    if (!res.ok) { throw new Error(data.error || 'Failed to claim badge') }
    // Optimistically add to owned badges immediately
    setOptimisticOwned(prev => [...prev, badge])
    // Then refetch to get actual data
    await fetchOwnedBadges(); await fetchEligibility()
    return data.txHash || null
  }, [address, fetchOwnedBadges, fetchEligibility])

  const refetch = useCallback(async () => { await Promise.all([fetchOwnedBadges(), fetchEligibility()]) }, [fetchOwnedBadges, fetchEligibility])

  // Reset optimistic state when address changes
  useEffect(() => { setOptimisticOwned([]) }, [address])

  // Combine owned badges with optimistic ones for UI
  const allOwnedBadgeTypes = new Set([
    ...ownedBadges.map(b => b.badgeType),
    ...optimisticOwned,
  ])

  const eligibleBadges = eligibilityDetails.filter((d) => d.eligible && !allOwnedBadgeTypes.has(d.badge)).map((d) => d.badge)

  // For display, include optimistic badges
  const displayOwnedBadges: Badge[] = [
    ...ownedBadges,
    ...optimisticOwned
      .filter(bt => !ownedBadges.some(b => b.badgeType === bt))
      .map(bt => ({ badgeType: bt, mintedAt: Math.floor(Date.now() / 1000) })),
  ]

  return { ownedBadges: displayOwnedBadges, eligibleBadges, eligibilityDetails, checkEligibility, claimBadge, isLoading, isLoadingEligibility, isClaiming: isTxPending, error, refetch }
}
