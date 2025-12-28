'use client'

import { useState, useEffect, use } from 'react'
import { notFound } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { AirdropHeader } from './components/airdrop-header'
import { EligibilityChecklist } from './components/eligibility-checklist'
import { ClaimButton } from './components/claim-button'
import { RecentClaims } from './components/recent-claims'
import { airdropService } from '@/lib/services/airdrop-service'
import { useAirdropClaim } from '@/lib/hooks/use-airdrop-claim'
import { useRegistrationContract } from '@/lib/hooks/use-registration-contract'
import { getAirdropStatus } from '@/lib/types/airdrop'
import type { Airdrop, AirdropClaim, EligibilityResult } from '@/lib/types/airdrop'
import { useAccount, getExplorerLink } from '@/lib/web3'
import { useToast } from '@/hooks/use-toast'

const CHAIN_ID = 80002 // Polygon Amoy

interface PageProps {
  params: Promise<{ id: string }>
}

export default function AirdropDetailsPage({ params }: PageProps) {
  const { id } = use(params)
  const { address, isConnected } = useAccount()
  const { toast } = useToast()

  const [airdrop, setAirdrop] = useState<Airdrop | null>(null)
  const [claims, setClaims] = useState<AirdropClaim[]>([])
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null)
  const [hasClaimed, setHasClaimed] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false)

  const { claim, isLoading: isClaiming } = useAirdropClaim()
  const { syncScore, isLoading: isSyncing } = useRegistrationContract()

  // Load airdrop data
  useEffect(() => {
    async function loadAirdrop() {
      setIsLoading(true)
      try {
        const [airdropData, recentClaims] = await Promise.all([
          airdropService.getAirdropById(id),
          airdropService.getRecentClaims(id),
        ])

        if (!airdropData) {
          notFound()
          return
        }

        // Fetch metadata
        if (airdropData.metadataUri) {
          const metadata = await airdropService.fetchMetadata(airdropData.metadataUri)
          if (metadata) {
            airdropData.name = metadata.name
            airdropData.description = metadata.description
            airdropData.image = metadata.image
          }
        }

        setAirdrop(airdropData)
        setClaims(recentClaims)
      } catch (err) {
        console.error('Failed to load airdrop:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadAirdrop()
  }, [id])

  // Check eligibility and claim status
  useEffect(() => {
    async function checkEligibility() {
      if (!isConnected || !address || !airdrop) return

      setIsCheckingEligibility(true)
      try {
        const [eligibilityResult, userClaims] = await Promise.all([
          airdropService.checkEligibility(id, address),
          airdropService.getUserClaims(address),
        ])

        setEligibility(eligibilityResult)
        setHasClaimed(userClaims.some((c) => c.airdropId === id))
      } catch (err) {
        console.error('Failed to check eligibility:', err)
      } finally {
        setIsCheckingEligibility(false)
      }
    }

    checkEligibility()
  }, [id, address, isConnected, airdrop])

  // Sync score on-chain before claiming score-gated airdrops
  const handleSyncScore = async () => {
    if (!address) return

    const userScore = eligibility?.userScore ?? 0

    try {
      const result = await syncScore(userScore)

      if (result.success) {
        const explorerUrl = getExplorerLink(CHAIN_ID, result.hash, 'tx')
        toast({
          title: 'Score Synced!',
          description: `Your score (${userScore}) has been synced on-chain. You can now claim.`,
          action: explorerUrl ? {
            label: 'View Transaction',
            onClick: () => window.open(explorerUrl, '_blank'),
          } : undefined,
        })
      }
    } catch (err) {
      toast({
        title: 'Sync Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const handleClaim = async () => {
    if (!airdrop || !address) return

    const userScore = eligibility?.userScore ?? 0

    try {
      const result = await claim({
        airdropId: airdrop.id,
        score: userScore,
        userAddress: address,
      })

      if (result.success) {
        const explorerUrl = getExplorerLink(CHAIN_ID, result.hash, 'tx')
        toast({
          title: 'Claim Successful!',
          description: `You claimed ${airdrop.token.symbol} tokens`,
          action: explorerUrl ? {
            label: 'View Transaction',
            onClick: () => window.open(explorerUrl, '_blank'),
          } : undefined,
        })
        setHasClaimed(true)
        // Refresh claims list
        const recentClaims = await airdropService.getRecentClaims(id)
        setClaims(recentClaims)
      }
    } catch (err) {
      toast({
        title: 'Claim Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-32 bg-card" />
          <Skeleton className="h-48 bg-card" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64 bg-card" />
            <Skeleton className="h-64 bg-card" />
          </div>
        </div>
      </div>
    )
  }

  if (!airdrop) {
    return notFound()
  }

  const status = getAirdropStatus(airdrop)

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <AirdropHeader airdrop={airdrop} />

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Eligibility */}
          <div className="space-y-4">
            <EligibilityChecklist
              criteria={airdrop.criteria}
              eligibility={eligibility}
              isLoading={isCheckingEligibility}
              isConnected={isConnected}
            />

            {/* Sync Score Button - Show for score-gated airdrops */}
            {isConnected && airdrop.criteria.minScore > 0 && !hasClaimed && (
              <Button
                onClick={handleSyncScore}
                disabled={isSyncing}
                variant="outline"
                className="w-full h-10 border-violet text-violet hover:bg-violet/10"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing Score...' : `Sync Score On-Chain (${eligibility?.userScore ?? 0})`}
              </Button>
            )}

            {/* Claim Button */}
            <ClaimButton
              airdrop={airdrop}
              status={status}
              eligibility={eligibility}
              hasClaimed={hasClaimed}
              isLoading={isCheckingEligibility}
              isClaiming={isClaiming}
              isConnected={isConnected}
              onClaim={handleClaim}
            />
          </div>

          {/* Right Column - Recent Claims */}
          <RecentClaims
            claims={claims}
            tokenSymbol={airdrop.token.symbol}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
