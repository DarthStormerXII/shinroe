'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { UserScore, SCORE_CATEGORIES, ScoreCategory } from '@/lib/types/shinroe'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'

interface ScoreBreakdownProps {
  score: UserScore | null
  loading: boolean
}

interface CategoryBarProps {
  category: ScoreCategory
  value: number
  isExpanded: boolean
  onToggle: () => void
}

function getScoreColor(value: number): string {
  if (value >= 80) return 'hsl(var(--success))'
  if (value >= 60) return 'hsl(var(--warning))'
  if (value >= 40) return 'hsl(var(--coral))'
  return 'hsl(var(--destructive))'
}

function CategoryBar({ category, value, isExpanded, onToggle }: CategoryBarProps) {
  const { t } = useTranslation()
  const color = getScoreColor(value)
  const categoryName = t(`categories.${category.key}.name`)
  const categoryDescription = t(`categories.${category.key}.description`)

  return (
    <div className="space-y-2">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between hover:bg-muted/10 rounded-lg p-2 -m-2 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{categoryName}</span>
          <span className="text-xs text-muted-foreground">({category.weight}%)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold" style={{ color }}>
            {value}%
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Progress bar */}
      <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="pt-2 pb-4 px-2 text-sm text-muted-foreground border-l-2 border-muted/30 ml-2">
          <p>{categoryDescription}</p>
          <div className="mt-2 text-xs">
            <span className="text-foreground font-medium">{t('scoreBreakdown.categoryStrength')} </span>
            <span>{value}/100</span>
          </div>
        </div>
      )}
    </div>
  )
}

export function ScoreBreakdown({ score, loading }: ScoreBreakdownProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const { t } = useTranslation()

  if (loading) {
    return (
      <Card className="bg-card border-border h-full">
        <CardHeader>
          <CardTitle className="text-lg">{t('scoreBreakdown.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!score) {
    return (
      <Card className="bg-card border-border h-full">
        <CardHeader>
          <CardTitle className="text-lg">{t('scoreBreakdown.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{t('scoreBreakdown.noData')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader>
        <CardTitle className="text-lg">{t('scoreBreakdown.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {SCORE_CATEGORIES.map((category) => (
          <CategoryBar
            key={category.key}
            category={category}
            value={score[category.key]}
            isExpanded={expandedCategory === category.key}
            onToggle={() =>
              setExpandedCategory(
                expandedCategory === category.key ? null : category.key
              )
            }
          />
        ))}
      </CardContent>
    </Card>
  )
}
