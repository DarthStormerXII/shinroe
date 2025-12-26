'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, AlertTriangle, Coins, Loader2 } from 'lucide-react'
import {
  type EndorsementWithUser,
  ENDORSEMENT_TYPES,
  calculateDecayedWeight,
} from '@/lib/types/shinroe'
import { formatEther } from 'viem'

interface EndorsementCardProps {
  endorsement: EndorsementWithUser
  isGiven?: boolean
  onWithdraw?: (id: string) => void
  isWithdrawing?: boolean
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatAge(createdAt: number): string {
  const now = Date.now() / 1000
  const diff = now - createdAt
  const days = Math.floor(diff / (24 * 60 * 60))
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  const years = Math.floor(months / 12)
  return `${years}y ago`
}

function getMonthsOld(createdAt: number): number {
  return (Date.now() / 1000 - createdAt) / (30 * 24 * 60 * 60)
}

export function EndorsementCard({
  endorsement,
  isGiven = false,
  onWithdraw,
  isWithdrawing = false,
}: EndorsementCardProps) {
  const typeConfig = ENDORSEMENT_TYPES[endorsement.endorsementType]
  const monthsOld = getMonthsOld(endorsement.createdAt)
  const hasDecay = monthsOld > 6
  const decayedWeight = calculateDecayedWeight(endorsement.stakeAmount, endorsement.createdAt)
  const decayPercentage = hasDecay
    ? 100 - Math.round((Number(decayedWeight) / Number(endorsement.stakeAmount)) * 100)
    : 0

  return (
    <Card className="bg-card border-border hover:border-muted-foreground/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* User Name & Address */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {endorsement.displayName && (
                <span className="text-sm text-foreground font-medium">
                  {endorsement.displayName}
                </span>
              )}
              <span className="font-mono text-sm text-muted-foreground">
                {formatAddress(endorsement.user)}
              </span>
              {/* Type Badge */}
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `${typeConfig.color}20`,
                  color: typeConfig.color,
                }}
              >
                {typeConfig.label}
              </span>
            </div>

            {/* Stake Amount */}
            <div className="flex items-center gap-2 text-sm">
              <Coins className="h-4 w-4 text-violet" />
              <span className="text-foreground font-medium">
                {parseFloat(formatEther(endorsement.stakeAmount)).toFixed(4)} VERY
              </span>
              {hasDecay && (
                <span className="text-coral text-xs">
                  (-{decayPercentage}% decayed)
                </span>
              )}
            </div>

            {/* Age & Decay Warning */}
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatAge(endorsement.createdAt)}</span>
              {hasDecay && (
                <div className="flex items-center gap-1 text-coral">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Decaying</span>
                </div>
              )}
            </div>
          </div>

          {/* Withdraw Button (for given endorsements) */}
          {isGiven && endorsement.active && onWithdraw && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onWithdraw(endorsement.id)}
              disabled={isWithdrawing}
              className="border-border hover:border-coral hover:text-coral text-xs"
            >
              {isWithdrawing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                'Withdraw'
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
