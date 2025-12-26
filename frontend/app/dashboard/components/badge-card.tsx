'use client'

import Image from 'next/image'
import { Lock, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BadgeType, BADGE_METADATA } from '@/lib/types/shinroe'
import { useTranslation } from '@/lib/i18n'

interface BadgeCardProps {
  badgeType: BadgeType
  isOwned: boolean
  isEligible?: boolean
  mintedAt?: number
  progress?: { current: number; required: number }
  reason?: string
  onClick?: () => void
}

const BADGE_KEYS = ['verifiedMember', 'powerUser', 'socialStar', 'foundingMember', 'vip'] as const

export function BadgeCard({ badgeType, isOwned, isEligible, mintedAt, progress, reason, onClick }: BadgeCardProps) {
  const config = BADGE_METADATA[badgeType]
  const progressPercent = progress ? Math.min(100, (progress.current / progress.required) * 100) : 0
  const { t, locale } = useTranslation()

  const badgeKey = BADGE_KEYS[badgeType]
  const badgeName = t(`badgeNames.${badgeKey}`)
  const badgeRequirement = t(`badgeRequirements.${badgeKey}`)

  function formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  function getProgressUnit(): string {
    switch (badgeType) {
      case BadgeType.TRUSTED_TRADER:
        return t('badgeProgress.activities')
      case BadgeType.COMMUNITY_BUILDER:
        return t('badgeProgress.endorsementsGiven')
      case BadgeType.ELITE_SCORE:
        return t('badgeProgress.points')
      default:
        return ''
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={isOwned && !onClick}
      className={cn(
        'relative w-full p-4 rounded-xl border transition-all duration-300',
        'flex flex-col items-center text-center gap-3',
        isOwned
          ? 'bg-card border-border hover:border-muted-foreground/30'
          : 'bg-background border-border opacity-60 hover:opacity-80',
        onClick && !isOwned && isEligible && 'cursor-pointer hover:border-violet',
        onClick && !isOwned && !isEligible && 'cursor-pointer hover:opacity-90'
      )}
    >
      {/* Status indicator */}
      {isOwned && (
        <div className="absolute top-2 right-2 bg-success rounded-full p-1">
          <Check className="h-3 w-3 text-success-foreground" />
        </div>
      )}
      {!isOwned && isEligible && (
        <div className="absolute top-2 right-2 bg-violet rounded-full p-1 animate-pulse">
          <div className="h-3 w-3" />
        </div>
      )}

      {/* Badge Image */}
      <div
        className={cn(
          'relative w-20 h-20 rounded-full overflow-hidden',
          !isOwned && 'grayscale opacity-50'
        )}
      >
        <Image
          src={config.image}
          alt={badgeName}
          fill
          className="object-cover"
        />
      </div>

      {/* Badge Name */}
      <h3 className={cn('font-semibold text-sm', isOwned ? 'text-foreground' : 'text-muted-foreground')}>
        {badgeName}
      </h3>

      {/* Description or Status */}
      {isOwned && mintedAt ? (
        <p className="text-xs text-muted-foreground">{t('badgeProgress.earned', { date: formatDate(mintedAt) })}</p>
      ) : progress ? (
        <div className="w-full space-y-1">
          <p className="text-xs text-muted-foreground text-center">
            {progress.current}/{progress.required} {getProgressUnit()}
          </p>
          <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                isEligible ? 'bg-violet' : 'bg-muted-foreground/50'
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" />
          <span>{reason || badgeRequirement}</span>
        </div>
      )}
    </button>
  )
}
