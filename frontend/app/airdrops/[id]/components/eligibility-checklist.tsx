'use client'

import { Check, X, Shield, Award, Users, UserCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { EligibilityCriteria, EligibilityResult } from '@/lib/types/airdrop'
import { BADGE_METADATA, type BadgeType } from '@/lib/types/shinroe'
import { formatEther } from 'viem'

interface EligibilityChecklistProps {
  criteria: EligibilityCriteria
  eligibility: EligibilityResult | null
  isLoading: boolean
  isConnected: boolean
}

export function EligibilityChecklist({
  criteria,
  eligibility,
  isLoading,
  isConnected,
}: EligibilityChecklistProps) {
  const items = buildChecklistItems(criteria, eligibility)

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Shield className="h-5 w-5 text-violet" />
          Eligibility Requirements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <p className="text-muted-foreground text-sm">Connect wallet to check eligibility</p>
        ) : isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 bg-muted" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, i) => (
              <ChecklistItem key={i} {...item} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface ChecklistItemData {
  icon: React.ReactNode
  label: string
  requirement: string
  current?: string
  passed: boolean | null
}

function ChecklistItem({ icon, label, requirement, current, passed }: ChecklistItemData) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${
      passed === null ? 'border-border bg-background' :
      passed ? 'border-green/30 bg-green/5' : 'border-coral/30 bg-coral/5'
    }`}>
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">
          {requirement}
          {current && <span className="text-foreground ml-1">({current})</span>}
        </p>
      </div>
      <StatusIcon passed={passed} />
    </div>
  )
}

function StatusIcon({ passed }: { passed: boolean | null }) {
  if (passed === null) return null
  return passed ? (
    <div className="w-6 h-6 rounded-full bg-green/20 flex items-center justify-center">
      <Check className="h-4 w-4 text-green" />
    </div>
  ) : (
    <div className="w-6 h-6 rounded-full bg-coral/20 flex items-center justify-center">
      <X className="h-4 w-4 text-coral" />
    </div>
  )
}

function buildChecklistItems(
  criteria: EligibilityCriteria,
  eligibility: EligibilityResult | null
): ChecklistItemData[] {
  const items: ChecklistItemData[] = []

  // Registration requirement
  if (criteria.requiresRegistration) {
    items.push({
      icon: <UserCheck className="h-5 w-5" />,
      label: 'Registered User',
      requirement: 'Must be registered on-chain',
      current: eligibility?.isRegistered !== undefined
        ? (eligibility.isRegistered ? 'Registered' : 'Not registered')
        : undefined,
      passed: eligibility?.isRegistered ?? null,
    })
  }

  // Score requirement
  if (criteria.minScore > 0) {
    const userScore = eligibility?.userScore
    items.push({
      icon: <Shield className="h-5 w-5" />,
      label: 'Minimum Score',
      requirement: `Score ${criteria.minScore}+`,
      current: userScore !== undefined ? `Your score: ${userScore}` : undefined,
      passed: userScore !== undefined ? userScore >= criteria.minScore : null,
    })
  }

  // Badge requirements
  for (const badgeType of criteria.requiredBadges) {
    const badgeInfo = BADGE_METADATA[badgeType as BadgeType]
    const hasBadge = eligibility?.userBadges?.includes(badgeType)

    items.push({
      icon: <Award className="h-5 w-5" />,
      label: badgeInfo?.name || `Badge #${badgeType}`,
      requirement: badgeInfo?.requirement || 'Required badge',
      passed: hasBadge ?? null,
    })
  }

  // Endorsement weight requirement
  if (criteria.minEndorsementWeight > 0n) {
    const userWeight = eligibility?.userEndorsementWeight ?? 0n
    const passed = userWeight >= criteria.minEndorsementWeight

    items.push({
      icon: <Users className="h-5 w-5" />,
      label: 'Endorsement Weight',
      requirement: `Min ${formatEther(criteria.minEndorsementWeight)} VERY`,
      current: eligibility ? `Your weight: ${formatEther(userWeight)} VERY` : undefined,
      passed: eligibility ? passed : null,
    })
  }

  // If no requirements
  if (items.length === 0) {
    items.push({
      icon: <Check className="h-5 w-5" />,
      label: 'Open to Everyone',
      requirement: 'No special requirements',
      passed: true,
    })
  }

  return items
}
