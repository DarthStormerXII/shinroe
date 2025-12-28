'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, Users, Coins, Shield } from 'lucide-react'
import { EligibilityBadge } from './eligibility-badge'
import type { Airdrop } from '@/lib/types/airdrop'
import { getAirdropStatus, AIRDROP_STATUS_CONFIG } from '@/lib/types/airdrop'
import { formatEther } from 'viem'
import { BADGE_METADATA, type BadgeType } from '@/lib/types/shinroe'
import { getIpfsUrl } from '@/lib/utils/ipfs'

interface AirdropCardProps {
  airdrop: Airdrop
  eligibility?: { eligible: boolean; reasons: string[] }
  isCheckingEligibility?: boolean
  isConnected: boolean
}

export function AirdropCard({ airdrop, eligibility, isCheckingEligibility, isConnected }: AirdropCardProps) {
  const status = getAirdropStatus(airdrop)
  const statusConfig = AIRDROP_STATUS_CONFIG[status]
  const progress = airdrop.totalAmount > 0n
    ? Number((airdrop.claimedAmount * 100n) / airdrop.totalAmount)
    : 0

  const timeRemaining = getTimeRemaining(airdrop.endTime)
  const eligibilityStatus = !isConnected
    ? 'unknown'
    : isCheckingEligibility
    ? 'checking'
    : eligibility?.eligible
    ? 'eligible'
    : 'ineligible'

  const imageUrl = airdrop.image ? getIpfsUrl(airdrop.image) : null

  return (
    <Link href={`/airdrops/${airdrop.id}`}>
      <Card className="bg-card border-border hover:border-violet/50 transition-all group cursor-pointer">
        <CardContent className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {imageUrl ? (
                <div className="w-10 h-10 rounded-full overflow-hidden relative">
                  <Image src={imageUrl} alt={airdrop.token.symbol} fill className="object-cover" unoptimized />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-violet flex items-center justify-center text-white font-bold">
                  {airdrop.token.symbol.slice(0, 2)}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-violet transition-colors">
                  {airdrop.name || `${airdrop.token.symbol} Airdrop`}
                </h3>
                <p className="text-xs text-muted-foreground">{airdrop.token.symbol}</p>
              </div>
            </div>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${statusConfig.color}20`, color: statusConfig.color }}
            >
              {statusConfig.label}
            </span>
          </div>

          {/* Amount per claim */}
          <div className="flex items-center gap-2 text-sm">
            <Coins className="h-4 w-4 text-yellow" />
            <span className="text-foreground font-medium">
              {formatEther(airdrop.amountPerClaim)} {airdrop.token.symbol}
            </span>
            <span className="text-muted-foreground">per claim</span>
          </div>

          {/* Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{airdrop.claimCount} claimed</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-background rounded-full overflow-hidden">
              <div
                className="h-full bg-violet rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Requirements */}
          <div className="flex flex-wrap gap-2">
            {airdrop.criteria.minScore > 0 && (
              <RequirementChip icon={<Shield className="h-3 w-3" />} text={`Score: ${airdrop.criteria.minScore}+`} />
            )}
            {airdrop.criteria.requiredBadges.map((badge) => (
              <RequirementChip
                key={badge}
                icon={<Users className="h-3 w-3" />}
                text={BADGE_METADATA[badge as BadgeType]?.name || `Badge ${badge}`}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 pt-2 border-t border-border text-xs text-muted-foreground">
            {status === 'active' && timeRemaining && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeRemaining}
              </span>
            )}
            <EligibilityBadge
              status={eligibilityStatus}
              reason={eligibility?.reasons?.[0]}
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function RequirementChip({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-background text-muted-foreground px-2 py-1 rounded">
      {icon}
      {text}
    </span>
  )
}

function getTimeRemaining(endTime: number): string | null {
  const now = Math.floor(Date.now() / 1000)
  const diff = endTime - now
  if (diff <= 0) return null

  const days = Math.floor(diff / 86400)
  const hours = Math.floor((diff % 86400) / 3600)

  if (days > 0) return `${days}d left`
  if (hours > 0) return `${hours}h left`
  return 'Ending soon'
}
