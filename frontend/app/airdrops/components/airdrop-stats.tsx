'use client'

import { Gift, Users, Coins, Trophy } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { AirdropStats } from '@/lib/types/airdrop'
import { formatEther } from 'viem'

interface AirdropStatsBannerProps {
  stats: AirdropStats | null
  isLoading: boolean
  activeCount?: number // Actual active airdrops count from filtered list
}

export function AirdropStatsBanner({ stats, isLoading, activeCount }: AirdropStatsBannerProps) {
  const items = [
    {
      icon: <Gift className="h-4 w-4 text-coral" />,
      label: 'Active',
      value: activeCount ?? stats?.activeAirdrops ?? 0,
    },
    {
      icon: <Users className="h-4 w-4 text-violet" />,
      label: 'Claims',
      value: stats?.totalClaimsCount ?? 0,
    },
    {
      icon: <Coins className="h-4 w-4 text-yellow" />,
      label: 'Distributed',
      value: stats ? `${formatValue(stats.totalValueDistributed)}` : '0',
      isText: true,
    },
    {
      icon: <Trophy className="h-4 w-4 text-green" />,
      label: 'Tokens',
      value: stats?.totalTokensCreated ?? 0,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item, i) => (
        <div key={i} className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            {item.icon}
            <span>{item.label}</span>
          </div>
          {isLoading ? (
            <Skeleton className="h-6 w-16 bg-muted" />
          ) : (
            <p className={`font-semibold text-foreground ${item.isText ? 'text-sm' : 'text-lg'}`}>
              {item.value}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

function formatValue(value: bigint): string {
  const num = parseFloat(formatEther(value))
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toFixed(0)
}
