'use client'

import { type Address, formatUnits } from 'viem'
import { cn } from '@/lib/utils'
import { AccountAvatar } from '@/components/web3/wallet/account-avatar'
import { BADGE_METADATA, BadgeType } from '@/lib/types/shinroe'
import { ShieldCheck, Handshake, Users, Rocket, Crown } from 'lucide-react'

const BADGE_ICONS: Record<BadgeType, React.ElementType> = {
  [BadgeType.VERIFIED_IDENTITY]: ShieldCheck,
  [BadgeType.TRUSTED_TRADER]: Handshake,
  [BadgeType.COMMUNITY_BUILDER]: Users,
  [BadgeType.EARLY_ADOPTER]: Rocket,
  [BadgeType.ELITE_SCORE]: Crown,
}

interface UserSearchResultProps {
  address: Address
  displayName: string | null
  badges: number[]
  totalEndorsementWeight: bigint
  onSelect: (address: Address) => void
  isSelected?: boolean
}

const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

const formatWeight = (weight: bigint): string => {
  const val = parseFloat(formatUnits(weight, 18))
  if (val >= 1) return `${val.toFixed(2)} VERY`
  if (val >= 0.001) return `${(val * 1000).toFixed(1)} mVERY`
  return '< 0.001 VERY'
}

export function UserSearchResult({
  address, displayName, badges, totalEndorsementWeight, onSelect, isSelected = false,
}: UserSearchResultProps) {
  return (
    <button
      onClick={() => onSelect(address)}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-lg transition-colors',
        'hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-violet/50',
        isSelected && 'bg-secondary ring-1 ring-violet'
      )}
    >
      <AccountAvatar address={address} size="md" />
      <div className="flex-1 min-w-0 text-left">
        <p className="font-medium text-sm text-foreground truncate">
          {displayName || truncateAddress(address)}
        </p>
        {displayName && <p className="text-xs text-muted-foreground truncate">{truncateAddress(address)}</p>}
      </div>
      <div className="flex items-center gap-2">
        {badges.slice(0, 3).map((badgeType) => {
          const Icon = BADGE_ICONS[badgeType as BadgeType]
          const meta = BADGE_METADATA[badgeType as BadgeType]
          if (!Icon || !meta) return null
          return <Icon key={badgeType} size={14} style={{ color: meta.color }} title={meta.name} />
        })}
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">{formatWeight(totalEndorsementWeight)}</span>
    </button>
  )
}
