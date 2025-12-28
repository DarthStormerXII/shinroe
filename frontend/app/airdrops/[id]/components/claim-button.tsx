'use client'

import { Button } from '@/components/ui/button'
import { Loader2, Check, Lock, Gift, AlertCircle } from 'lucide-react'
import type { Airdrop, EligibilityResult, AirdropStatus } from '@/lib/types/airdrop'
import { formatEther } from 'viem'

interface ClaimButtonProps {
  airdrop: Airdrop
  status: AirdropStatus
  eligibility: EligibilityResult | null
  hasClaimed: boolean
  isLoading: boolean
  isClaiming: boolean
  isConnected: boolean
  onClaim: () => void
}

export function ClaimButton({
  airdrop,
  status,
  eligibility,
  hasClaimed,
  isLoading,
  isClaiming,
  isConnected,
  onClaim,
}: ClaimButtonProps) {
  // Already claimed
  if (hasClaimed) {
    return (
      <Button disabled className="w-full bg-green/20 text-green border-green/30 h-12">
        <Check className="h-5 w-5 mr-2" />
        Already Claimed
      </Button>
    )
  }

  // Not connected
  if (!isConnected) {
    return (
      <Button disabled variant="outline" className="w-full h-12 border-border">
        <AlertCircle className="h-5 w-5 mr-2" />
        Connect Wallet to Claim
      </Button>
    )
  }

  // Loading eligibility
  if (isLoading) {
    return (
      <Button disabled className="w-full h-12 bg-violet/50">
        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        Checking Eligibility...
      </Button>
    )
  }

  // Airdrop not active
  if (status === 'upcoming') {
    return (
      <Button disabled variant="outline" className="w-full h-12 border-yellow text-yellow">
        <AlertCircle className="h-5 w-5 mr-2" />
        Airdrop Not Started
      </Button>
    )
  }

  if (status === 'ended' || status === 'cancelled' || status === 'exhausted') {
    return (
      <Button disabled variant="outline" className="w-full h-12 border-muted text-muted-foreground">
        <Lock className="h-5 w-5 mr-2" />
        {status === 'exhausted' ? 'Airdrop Exhausted' : 'Airdrop Ended'}
      </Button>
    )
  }

  // Not eligible
  if (!eligibility?.eligible) {
    const reason = eligibility?.reasons?.[0] || 'Not eligible'
    return (
      <Button disabled variant="outline" className="w-full h-12 border-coral text-coral">
        <Lock className="h-5 w-5 mr-2" />
        {reason}
      </Button>
    )
  }

  // Claiming in progress
  if (isClaiming) {
    return (
      <Button disabled className="w-full h-12 bg-violet">
        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        Claiming...
      </Button>
    )
  }

  // Ready to claim
  return (
    <Button
      onClick={onClaim}
      className="w-full h-12 bg-violet hover:bg-violet/90"
    >
      <Gift className="h-5 w-5 mr-2" />
      Claim {formatEther(airdrop.amountPerClaim)} {airdrop.token.symbol}
    </Button>
  )
}
