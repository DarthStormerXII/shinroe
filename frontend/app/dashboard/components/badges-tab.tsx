'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Award, RefreshCw } from 'lucide-react'
import { BadgeCard } from './badge-card'
import { ClaimBadgeModal } from './claim-badge-modal'
import { useBadgeEligibility, type EligibilityCheck } from '@/lib/hooks/use-badge-eligibility'
import { useRegistration } from '@/lib/hooks/use-registration'
import { BadgeType, ALL_BADGE_TYPES } from '@/lib/types/shinroe'
import type { Address } from 'viem'
import { useTranslation } from '@/lib/i18n'
import { toast } from 'sonner'

interface BadgesTabProps {
  address: Address | null
}

export function BadgesTab({ address }: BadgesTabProps) {
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const { t } = useTranslation()

  const {
    ownedBadges,
    eligibleBadges,
    eligibilityDetails,
    claimBadge,
    isLoading,
    isLoadingEligibility,
    isClaiming,
    error,
    refetch,
  } = useBadgeEligibility(address)

  const { isOnchainRegistered, ensureRegistered } = useRegistration()

  // Track previous registration status to detect changes
  const prevRegisteredRef = useRef(isOnchainRegistered)

  // Refetch eligibility when registration status changes (e.g., user registers via banner)
  useEffect(() => {
    if (isOnchainRegistered && !prevRegisteredRef.current) {
      refetch()
    }
    prevRegisteredRef.current = isOnchainRegistered
  }, [isOnchainRegistered, refetch])

  const handleBadgeClick = (badgeType: BadgeType) => {
    setSelectedBadge(badgeType)
    setModalOpen(true)
  }

  const handleClaim = async (badgeType: BadgeType) => {
    // Ensure on-chain registration first (DID-first flow)
    if (!isOnchainRegistered) {
      const regToastId = toast.loading('Registering on VeryChain first...')
      try {
        await ensureRegistered()
        toast.success('Registered! Now claiming badge...', { id: regToastId })
        // Refetch eligibility after registration to update UI
        await refetch()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Registration failed', { id: regToastId })
        throw new Error('On-chain registration required to claim badges')
      }
    }
    return await claimBadge(badgeType)
  }

  const isBadgeOwned = (badgeType: BadgeType) =>
    ownedBadges.some((b) => b.badgeType === badgeType)

  const isBadgeEligible = (badgeType: BadgeType) =>
    eligibleBadges.includes(badgeType)

  const getBadgeMintedAt = (badgeType: BadgeType) =>
    ownedBadges.find((b) => b.badgeType === badgeType)?.mintedAt

  const getBadgeEligibility = (badgeType: BadgeType): EligibilityCheck | undefined =>
    eligibilityDetails.find((d) => d.badge === badgeType)

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-8 text-center">
          <p className="text-destructive">{t('badges.failedToLoad')}</p>
          <Button variant="outline" onClick={refetch} className="mt-4 border-border">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('common.retry')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Award className="h-5 w-5 text-violet" />
              {t('badges.title')}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {t('badges.subtitle')}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={isLoading || isLoadingEligibility}
            className="border-border"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading || isLoadingEligibility ? 'animate-spin' : ''}`}
            />
          </Button>
        </CardHeader>

        <CardContent>
          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatCard
              label={t('badges.earned')}
              value={ownedBadges.length}
              loading={isLoading}
            />
            <StatCard
              label={t('badges.available')}
              value={eligibleBadges.length}
              loading={isLoadingEligibility}
              highlight={eligibleBadges.length > 0}
            />
            <StatCard
              label={t('badges.total')}
              value={ALL_BADGE_TYPES.length}
              loading={false}
            />
          </div>

          {/* Badge Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-40 bg-secondary" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {ALL_BADGE_TYPES.map((badgeType) => {
                const eligibility = getBadgeEligibility(badgeType)
                return (
                  <BadgeCard
                    key={badgeType}
                    badgeType={badgeType}
                    isOwned={isBadgeOwned(badgeType)}
                    isEligible={isBadgeEligible(badgeType)}
                    mintedAt={getBadgeMintedAt(badgeType)}
                    progress={eligibility?.progress}
                    reason={eligibility?.reason}
                    onClick={() => handleBadgeClick(badgeType)}
                  />
                )
              })}
            </div>
          )}

          {/* Claimable hint */}
          {eligibleBadges.length > 0 && (
            <p className="text-center text-sm text-violet mt-4 animate-pulse">
              {eligibleBadges.length === 1
                ? t('badges.claimHintSingular')
                : t('badges.claimHintPlural', { count: eligibleBadges.length })}
            </p>
          )}
        </CardContent>
      </Card>

      <ClaimBadgeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        badgeType={selectedBadge}
        isEligible={selectedBadge !== null && isBadgeEligible(selectedBadge)}
        progress={selectedBadge !== null ? getBadgeEligibility(selectedBadge)?.progress : undefined}
        reason={selectedBadge !== null ? getBadgeEligibility(selectedBadge)?.reason : undefined}
        onClaim={handleClaim}
      />
    </>
  )
}

interface StatCardProps {
  label: string
  value: number
  loading?: boolean
  highlight?: boolean
}

function StatCard({ label, value, loading, highlight }: StatCardProps) {
  return (
    <div className="bg-background rounded-lg p-3">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {loading ? (
        <Skeleton className="h-6 w-12 bg-secondary" />
      ) : (
        <p className={`text-lg font-semibold ${highlight ? 'text-violet' : 'text-foreground'}`}>
          {value}
        </p>
      )}
    </div>
  )
}
