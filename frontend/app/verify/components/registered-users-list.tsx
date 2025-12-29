'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users,
  User,
  ChevronDown,
  ChevronUp,
  Calendar,
  BadgeCheck,
  Lock,
  RefreshCw,
} from 'lucide-react'
import { BADGE_METADATA, BadgeType } from '@/lib/types/shinroe'
import type { RegisteredUserWithMetadata } from '@/lib/hooks/use-registered-users'
import { useTranslation } from '@/lib/i18n'

interface RegisteredUsersListProps {
  users: RegisteredUserWithMetadata[]
  isLoading: boolean
  error: Error | null
  onRefetch: () => Promise<void>
  onSelectUser: (address: string) => void
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function UserListItem({
  user,
  isExpanded,
  onToggle,
  onSelect,
}: {
  user: RegisteredUserWithMetadata
  isExpanded: boolean
  onToggle: () => void
  onSelect: () => void
}) {
  const { t } = useTranslation()

  const getBadgeName = (badgeType: number) => {
    const badgeKeys = ['verifiedMember', 'powerUser', 'socialStar', 'foundingMember', 'vip']
    return t(`badgeNames.${badgeKeys[badgeType]}`) || t('badgeNames.badge')
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-violet/10">
            <User className="h-5 w-5 text-violet" />
          </div>
          <div className="text-left">
            <p className="text-foreground font-medium">
              {user.displayName || t('common.anonymous')}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              {formatAddress(user.address)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user.badges.length > 0 && (
            <div className="flex -space-x-1">
              {user.badges.slice(0, 3).map((badgeType) => (
                <div
                  key={badgeType}
                  className="w-6 h-6 rounded-full border-2 border-background flex items-center justify-center"
                  style={{ backgroundColor: BADGE_METADATA[badgeType as BadgeType]?.color || '#666' }}
                  title={getBadgeName(badgeType)}
                >
                  <BadgeCheck className="h-3 w-3 text-white" />
                </div>
              ))}
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-border">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Users className="h-3.5 w-3.5" />
                {t('endorsements.title')}
              </div>
              <p className="text-lg font-bold text-foreground">{user.endorsementCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Calendar className="h-3.5 w-3.5" />
                {t('endorsements.registered')}
              </div>
              <p className="text-sm font-medium text-foreground">{formatDate(user.registeredAt)}</p>
            </div>
          </div>

          {user.badges.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">{t('badges.title')}</p>
              <div className="flex flex-wrap gap-2">
                {user.badges.map((badgeType) => {
                  const meta = BADGE_METADATA[badgeType as BadgeType]
                  return (
                    <span
                      key={badgeType}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: `${meta?.color}20`, color: meta?.color }}
                    >
                      <BadgeCheck className="h-3 w-3" />
                      {getBadgeName(badgeType)}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            {user.isPublic ? (
              <Button
                onClick={onSelect}
                className="flex-1 bg-violet hover:bg-violet/90 text-white"
                size="sm"
              >
                {t('verify.viewFullProfile')}
              </Button>
            ) : (
              <div className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-card border border-border text-muted-foreground text-sm">
                <Lock className="h-4 w-4" />
                {t('verify.privateProfile')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function RegisteredUsersList({
  users,
  isLoading,
  error,
  onRefetch,
  onSelectUser,
}: RegisteredUsersListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-violet" />
            {t('verify.registeredUsers')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-4 border border-border rounded-lg">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={onRefetch} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('common.retry')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (users.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{t('verify.noRegisteredUsers')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-violet" />
            {t('verify.registeredUsersCount', { count: users.length })}
          </CardTitle>
          <Button
            onClick={onRefetch}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {users.map((user) => (
            <UserListItem
              key={user.address}
              user={user}
              isExpanded={expandedId === user.address}
              onToggle={() => setExpandedId(expandedId === user.address ? null : user.address)}
              onSelect={() => onSelectUser(user.address)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
