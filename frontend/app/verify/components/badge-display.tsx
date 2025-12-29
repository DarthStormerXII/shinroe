'use client'

import Image from 'next/image'
import { Shield } from 'lucide-react'
import { type Badge, BadgeType, BADGE_METADATA } from '@/lib/types/shinroe'

interface BadgeItemProps {
  badgeType: BadgeType
  mintedAt?: number
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function BadgeItem({ badgeType, mintedAt }: BadgeItemProps) {
  const config = BADGE_METADATA[badgeType]
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg"
      style={{ backgroundColor: `${config.color}30` }}
    >
      <div className="relative w-6 h-6">
        <Image
          src={config.image}
          alt={config.name}
          fill
          className="object-cover rounded-full"
        />
      </div>
      <div>
        <span className="text-sm font-medium text-foreground">{config.name}</span>
        {mintedAt && <p className="text-xs text-muted-foreground">{formatDate(mintedAt)}</p>}
      </div>
    </div>
  )
}

interface BadgeListProps {
  badges: Badge[]
}

export function BadgeList({ badges }: BadgeListProps) {
  if (badges.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <Shield className="h-4 w-4" />
        Badges Earned
      </div>
      <div className="grid gap-2">
        {badges.map((badge) => (
          <BadgeItem key={badge.badgeType} badgeType={badge.badgeType} mintedAt={badge.mintedAt} />
        ))}
      </div>
    </div>
  )
}
