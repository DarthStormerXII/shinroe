'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type AirdropFilter = 'all' | 'active' | 'upcoming' | 'my-claims' | 'my-airdrops'

interface AirdropFiltersProps {
  activeFilter: AirdropFilter
  onFilterChange: (filter: AirdropFilter) => void
  isConnected: boolean
}

const FILTERS: { value: AirdropFilter; label: string; requiresAuth?: boolean }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'my-claims', label: 'My Claims', requiresAuth: true },
  { value: 'my-airdrops', label: 'My Airdrops', requiresAuth: true },
]

export function AirdropFilters({ activeFilter, onFilterChange, isConnected }: AirdropFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => {
        const disabled = filter.requiresAuth && !isConnected

        return (
          <Button
            key={filter.value}
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => onFilterChange(filter.value)}
            className={cn(
              'border-border transition-all',
              activeFilter === filter.value
                ? 'bg-violet text-white border-violet hover:bg-violet/90'
                : 'bg-background hover:bg-accent'
            )}
          >
            {filter.label}
          </Button>
        )
      })}
    </div>
  )
}
