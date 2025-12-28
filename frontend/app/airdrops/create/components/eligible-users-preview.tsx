'use client'

import { useEffect, useState } from 'react'
import { Users, Loader2, AlertCircle } from 'lucide-react'
import { useRegisteredUsers } from '@/lib/hooks/use-registered-users'
import type { EligibilityStepData } from './eligibility-step'

interface EligibleUsersPreviewProps {
  criteria: EligibilityStepData
}

export function EligibleUsersPreview({ criteria }: EligibleUsersPreviewProps) {
  const { users, isLoading, error } = useRegisteredUsers()
  const [eligibleCount, setEligibleCount] = useState(0)

  useEffect(() => {
    if (!users.length) {
      setEligibleCount(0)
      return
    }

    // Filter users based on criteria
    const eligible = users.filter((user) => {
      // Check minimum reputation score
      if (criteria.minScore > 0 && user.score < criteria.minScore) {
        return false
      }

      // Check required badges
      if (criteria.requiredBadges.length > 0) {
        if (criteria.badgeRequirement === 'all') {
          // User must have ALL selected badges
          const hasAllBadges = criteria.requiredBadges.every((badge) => user.badges.includes(badge))
          if (!hasAllBadges) return false
        } else {
          // User must have at least ONE of the selected badges
          const hasAnyBadge = criteria.requiredBadges.some((badge) => user.badges.includes(badge))
          if (!hasAnyBadge) return false
        }
      }

      // Check minimum endorsement weight
      if (criteria.minEndorsementWeight && parseFloat(criteria.minEndorsementWeight) > 0) {
        const minWeightWei = BigInt(Math.floor(parseFloat(criteria.minEndorsementWeight) * 1e18))
        if (user.totalEndorsementWeight < minWeightWei) return false
      }

      return true
    })

    setEligibleCount(eligible.length)
  }, [users, criteria])

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Calculating eligible users...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">Failed to fetch users from subgraph</span>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
          <Users className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-2xl font-bold text-muted-foreground">--</p>
          <p className="text-sm text-muted-foreground">
            No indexed users (deploy subgraph first)
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-violet/10">
        <Users className="h-6 w-6 text-violet" />
      </div>
      <div>
        <p className="text-2xl font-bold text-violet">~{eligibleCount}</p>
        <p className="text-sm text-muted-foreground">
          eligible users (of {users.length} registered)
        </p>
      </div>
    </div>
  )
}
