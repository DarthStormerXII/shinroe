'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronDown, Filter } from 'lucide-react'
import { EndorsementCard } from './endorsement-card'
import {
  type EndorsementWithUser,
  type EndorsementType,
  ENDORSEMENT_TYPES,
} from '@/lib/types/shinroe'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTranslation } from '@/lib/i18n'

interface EndorsementListProps {
  endorsements: EndorsementWithUser[]
  isLoading: boolean
  isGiven?: boolean
  onWithdraw?: (id: string) => void
  withdrawingId?: string | null
}

type SortOption = 'stake' | 'age_new' | 'age_old'
type FilterOption = 'all' | EndorsementType

const ITEMS_PER_PAGE = 10

export function EndorsementList({
  endorsements,
  isLoading,
  isGiven = false,
  onWithdraw,
  withdrawingId,
}: EndorsementListProps) {
  const [filter, setFilter] = useState<FilterOption>('all')
  const [sort, setSort] = useState<SortOption>('age_new')
  const [page, setPage] = useState(1)
  const { t } = useTranslation()

  const SORT_OPTIONS: Record<SortOption, string> = {
    stake: t('endorsements.highestStake'),
    age_new: t('endorsements.mostRecent'),
    age_old: t('endorsements.oldestFirst'),
  }

  const filteredAndSorted = useMemo(() => {
    let result = [...endorsements]

    // Filter
    if (filter !== 'all') {
      result = result.filter((e) => e.endorsementType === filter)
    }

    // Sort
    result.sort((a, b) => {
      switch (sort) {
        case 'stake':
          return Number(b.stakeAmount - a.stakeAmount)
        case 'age_new':
          return b.createdAt - a.createdAt
        case 'age_old':
          return a.createdAt - b.createdAt
        default:
          return 0
      }
    })

    return result
  }, [endorsements, filter, sort])

  const paginatedResults = useMemo(() => {
    const start = 0
    const end = page * ITEMS_PER_PAGE
    return filteredAndSorted.slice(start, end)
  }, [filteredAndSorted, page])

  const hasMore = paginatedResults.length < filteredAndSorted.length

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full bg-secondary" />
        ))}
      </div>
    )
  }

  if (endorsements.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {isGiven ? t('endorsements.noEndorsementsGiven') : t('endorsements.noEndorsementsReceived')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter & Sort Controls */}
      <div className="flex items-center justify-between gap-2">
        {/* Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="border-border text-sm">
              <Filter className="h-4 w-4 mr-2" />
              {filter === 'all' ? t('endorsements.allTypes') : t(`endorsementTypes.${filter}`)}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-card border-border">
            <DropdownMenuItem onClick={() => setFilter('all')}>{t('endorsements.allTypes')}</DropdownMenuItem>
            {Object.entries(ENDORSEMENT_TYPES).map(([key, config]) => (
              <DropdownMenuItem key={key} onClick={() => setFilter(key as EndorsementType)}>
                <span style={{ color: config.color }}>{t(`endorsementTypes.${key}`)}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="border-border text-sm">
              {SORT_OPTIONS[sort]}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-card border-border">
            {Object.entries(SORT_OPTIONS).map(([key, label]) => (
              <DropdownMenuItem key={key} onClick={() => setSort(key as SortOption)}>
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Results Count */}
      <p className="text-xs text-muted-foreground">
        {t('endorsements.showing', { current: paginatedResults.length, total: filteredAndSorted.length })}
      </p>

      {/* Endorsement Cards */}
      <div className="space-y-3">
        {paginatedResults.map((endorsement) => (
          <EndorsementCard
            key={endorsement.id}
            endorsement={endorsement}
            isGiven={isGiven}
            onWithdraw={onWithdraw}
            isWithdrawing={withdrawingId === endorsement.id}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <Button
          variant="outline"
          className="w-full border-border"
          onClick={() => setPage((p) => p + 1)}
        >
          {t('common.loadMore')}
        </Button>
      )}
    </div>
  )
}
