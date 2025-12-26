'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { UserScore, TIER_CONFIG } from '@/lib/types/shinroe'
import { useTranslation } from '@/lib/i18n'

interface ScoreCardProps {
  score: UserScore | null
  loading: boolean
}

function ProgressRing({ value, tier }: { value: number; tier: UserScore['tier'] }) {
  const radius = 80
  const stroke = 8
  const normalizedRadius = radius - stroke / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const progress = Math.min(value / 1000, 1)
  const strokeDashoffset = circumference * (1 - progress)
  const tierColor = TIER_CONFIG[tier].color
  const { t } = useTranslation()

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="-rotate-90">
        {/* Background circle */}
        <circle
          stroke="currentColor"
          className="text-muted/30"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress circle */}
        <circle
          stroke={tierColor}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-5xl font-bold">{value}</span>
        <span className="text-sm text-muted-foreground">{t('dashboard.scoreMax')}</span>
      </div>
    </div>
  )
}

function TierBadge({ tier }: { tier: UserScore['tier'] }) {
  const { t } = useTranslation()
  const config = TIER_CONFIG[tier]
  const tierLabel = t(`tiers.${tier}`)

  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
      style={{ backgroundColor: `${config.color}20`, color: config.color }}
    >
      {tierLabel}
    </span>
  )
}

function TrendIndicator({ trend }: { trend: number }) {
  const { t } = useTranslation()

  if (trend > 0) {
    return (
      <div className="flex items-center gap-1 text-success">
        <TrendingUp className="h-4 w-4" />
        <span className="text-sm font-medium">{t('scoreCard.positiveChange', { trend })}</span>
      </div>
    )
  }
  if (trend < 0) {
    return (
      <div className="flex items-center gap-1 text-destructive">
        <TrendingDown className="h-4 w-4" />
        <span className="text-sm font-medium">{t('scoreCard.negativeChange', { trend })}</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1 text-muted-foreground">
      <Minus className="h-4 w-4" />
      <span className="text-sm font-medium">{t('common.noChange')}</span>
    </div>
  )
}

export function ScoreCard({ score, loading }: ScoreCardProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <Card className="bg-card border-border h-full">
        <CardContent className="p-8 flex flex-col items-center justify-center gap-6 h-full">
          <Skeleton className="h-40 w-40 rounded-full" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    )
  }

  if (!score) {
    return (
      <Card className="bg-card border-border h-full">
        <CardContent className="p-8 flex flex-col items-center justify-center gap-4 h-full">
          <p className="text-muted-foreground">{t('dashboard.connectWalletScore')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border h-full">
      <CardContent className="p-8 flex flex-col items-center justify-center gap-6 h-full">
        <ProgressRing value={score.overall} tier={score.tier} />
        <TierBadge tier={score.tier} />
        <TrendIndicator trend={score.trend} />
      </CardContent>
    </Card>
  )
}
