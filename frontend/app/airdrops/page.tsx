'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Gift, Plus, RefreshCw } from 'lucide-react'
import { AirdropFilters, type AirdropFilter } from './components/airdrop-filters'
import { AirdropCard } from './components/airdrop-card'
import { AirdropStatsBanner } from './components/airdrop-stats'
import { airdropService } from '@/lib/services/airdrop-service'
import { getAirdropStatus } from '@/lib/types/airdrop'
import type { Airdrop, AirdropStats, EligibilityResult, AirdropClaim } from '@/lib/types/airdrop'
import { useAccount } from '@/lib/web3'
import type { Address } from 'viem'

export default function AirdropsPage() {
  const { address, isConnected } = useAccount()

  const [airdrops, setAirdrops] = useState<Airdrop[]>([])
  const [myClaims, setMyClaims] = useState<AirdropClaim[]>([])
  const [myAirdrops, setMyAirdrops] = useState<Airdrop[]>([])
  const [stats, setStats] = useState<AirdropStats | null>(null)
  const [eligibility, setEligibility] = useState<Record<string, EligibilityResult>>({})

  const [filter, setFilter] = useState<AirdropFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false)

  // Load airdrops and stats
  const loadData = async () => {
    setIsLoading(true)
    try {
      const [allAirdrops, airdropStats] = await Promise.all([
        airdropService.getAllAirdrops(),
        airdropService.getAirdropStats(),
      ])

      // Fetch metadata for each airdrop to get name, description, image
      const airdropsWithMetadata = await Promise.all(
        allAirdrops.map(async (airdrop) => {
          if (airdrop.metadataUri) {
            try {
              const metadata = await airdropService.fetchMetadata(airdrop.metadataUri)
              if (metadata) {
                return {
                  ...airdrop,
                  name: metadata.name,
                  description: metadata.description,
                  image: metadata.image,
                }
              }
            } catch {
              // Ignore metadata fetch errors
            }
          }
          return airdrop
        })
      )

      setAirdrops(airdropsWithMetadata)
      setStats(airdropStats)
    } catch (err) {
      console.error('Failed to load airdrops:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Load user-specific data
  const loadUserData = async (userAddress: Address) => {
    try {
      const [claims, created] = await Promise.all([
        airdropService.getUserClaims(userAddress),
        airdropService.getAirdropsByCreator(userAddress),
      ])
      setMyClaims(claims)

      // Fetch metadata for user's created airdrops (same as all airdrops)
      const createdWithMetadata = await Promise.all(
        created.map(async (airdrop) => {
          if (airdrop.metadataUri) {
            try {
              const metadata = await airdropService.fetchMetadata(airdrop.metadataUri)
              if (metadata) {
                return {
                  ...airdrop,
                  name: metadata.name,
                  description: metadata.description,
                  image: metadata.image,
                }
              }
            } catch {
              // Ignore metadata fetch errors
            }
          }
          return airdrop
        })
      )
      setMyAirdrops(createdWithMetadata)
    } catch (err) {
      console.error('Failed to load user data:', err)
    }
  }

  // Check eligibility for all airdrops
  const checkAllEligibility = async (userAddress: Address) => {
    setIsCheckingEligibility(true)
    try {
      const results: Record<string, EligibilityResult> = {}
      await Promise.all(
        airdrops.map(async (airdrop) => {
          results[airdrop.id] = await airdropService.checkEligibility(airdrop.id, userAddress)
        })
      )
      setEligibility(results)
    } catch (err) {
      console.error('Failed to check eligibility:', err)
    } finally {
      setIsCheckingEligibility(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (isConnected && address) {
      loadUserData(address)
    }
  }, [isConnected, address])

  useEffect(() => {
    if (isConnected && address && airdrops.length > 0) {
      checkAllEligibility(address)
    }
  }, [isConnected, address, airdrops])

  // Count of currently active airdrops (within time window)
  const activeCount = useMemo(() => {
    return airdrops.filter((a) => getAirdropStatus(a) === 'active').length
  }, [airdrops])

  // Filter airdrops based on selected filter
  const filteredAirdrops = useMemo(() => {
    switch (filter) {
      case 'active':
        return airdrops.filter((a) => getAirdropStatus(a) === 'active')
      case 'upcoming':
        return airdrops.filter((a) => getAirdropStatus(a) === 'upcoming')
      case 'my-claims':
        return airdrops.filter((a) => myClaims.some((c) => c.airdropId === a.id))
      case 'my-airdrops':
        return myAirdrops
      default:
        return airdrops
    }
  }, [airdrops, filter, myClaims, myAirdrops])

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Gift className="h-8 w-8 text-coral" />
            <h1 className="text-2xl font-bold text-foreground">Reputation Airdrops</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading} className="border-border">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/airdrops/create">
              <Button size="sm" className="bg-violet hover:bg-violet/90">
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Banner */}
        <AirdropStatsBanner stats={stats} isLoading={isLoading} activeCount={activeCount} />

        {/* Filters */}
        <AirdropFilters activeFilter={filter} onFilterChange={setFilter} isConnected={isConnected} />

        {/* Airdrops Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 bg-card" />
            ))}
          </div>
        ) : filteredAirdrops.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-lg bg-card/50">
            <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {filter === 'my-claims'
                ? 'No Claims Yet'
                : filter === 'my-airdrops'
                ? 'No Airdrops Created'
                : filter === 'active'
                ? 'No Active Airdrops'
                : filter === 'upcoming'
                ? 'No Upcoming Airdrops'
                : 'No Airdrops'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {filter === 'my-claims'
                ? "You haven't claimed any airdrops yet. Browse active airdrops to find ones you're eligible for."
                : filter === 'my-airdrops'
                ? "You haven't created any airdrops yet. Create one to distribute tokens to your community."
                : filter === 'active'
                ? 'There are no currently active airdrops. Check upcoming airdrops or create one!'
                : 'There are no airdrops at the moment. Be the first to create one!'}
            </p>
            {filter !== 'my-claims' && (
              <Link href="/airdrops/create">
                <Button className="bg-violet hover:bg-violet/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Airdrop
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAirdrops.map((airdrop) => (
              <AirdropCard
                key={airdrop.id}
                airdrop={airdrop}
                eligibility={eligibility[airdrop.id]}
                isCheckingEligibility={isCheckingEligibility}
                isConnected={isConnected}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
