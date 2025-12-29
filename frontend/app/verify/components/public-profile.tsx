'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  User,
  BadgeCheck,
  Calendar,
  Users,
  Lock,
  ExternalLink,
  AlertCircle,
  Fingerprint,
} from 'lucide-react'
import { TIER_CONFIG } from '@/lib/types/shinroe'
import { type UserProfileWithMetadata } from '@/lib/hooks/use-user-lookup'
import { BadgeList } from './badge-display'
import { addressToDID } from '@/lib/types/did'

interface PublicProfileProps {
  user: UserProfileWithMetadata | null
  isLoading: boolean
  error: Error | null
  accessStatus: 'public' | 'private' | 'pending' | 'denied' | null
  onRequestAccess: () => void
  isOnchainRegistered?: boolean // New prop for DID-first flow
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function TierBadge({ tier, score }: { tier: string; score: number }) {
  const config = TIER_CONFIG[tier as keyof typeof TIER_CONFIG]
  if (!config) return null
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex items-center justify-center w-16 h-16 rounded-full"
        style={{ backgroundColor: `${config.color}20` }}
      >
        <span className="text-2xl font-bold" style={{ color: config.color }}>
          {score}
        </span>
      </div>
      <div>
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
          style={{ backgroundColor: `${config.color}20`, color: config.color }}
        >
          {config.label}
        </span>
        <p className="text-xs text-muted-foreground mt-1">Reputation Score</p>
      </div>
    </div>
  )
}

export function PublicProfile({
  user,
  isLoading,
  error,
  accessStatus,
  onRequestAccess,
  isOnchainRegistered = true,
}: PublicProfileProps) {
  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-8 flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-destructive text-center">{error.message}</p>
        </CardContent>
      </Card>
    )
  }

  if (!user) return null

  if (accessStatus === 'private') {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <Lock className="h-5 w-5 text-coral" />
            Private Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-background">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              {user.displayName && (
                <p className="text-foreground font-medium mb-0.5">{user.displayName}</p>
              )}
              <p className="font-mono text-foreground text-sm">{formatAddress(user.address)}</p>
              <p className="text-xs text-muted-foreground">Member since {formatDate(user.registeredAt)}</p>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-background border border-border">
            <p className="text-sm text-muted-foreground text-center">
              This user has set their profile to private. Request access to view their score.
            </p>
          </div>
          <Button
            onClick={onRequestAccess}
            className="w-full bg-violet hover:bg-violet/90 text-white"
          >
            Request Access
          </Button>
        </CardContent>
      </Card>
    )
  }

  const did = addressToDID(user.address as `0x${string}`)

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-foreground flex items-center gap-2">
          {isOnchainRegistered ? (
            <>
              <BadgeCheck className="h-5 w-5 text-success" />
              Verified Profile
            </>
          ) : (
            <>
              <Fingerprint className="h-5 w-5 text-violet" />
              DID Profile
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* DID Display */}
        <div className="p-3 rounded-lg bg-violet/5 border border-violet/20">
          <p className="text-xs text-muted-foreground mb-1">Decentralized Identifier</p>
          <p className="text-sm font-mono text-violet truncate">{did}</p>
        </div>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-violet/10">
              <User className="h-6 w-6 text-violet" />
            </div>
            <div>
              {user.displayName && (
                <p className="text-foreground font-medium mb-0.5">{user.displayName}</p>
              )}
              <p className="font-mono text-foreground text-sm">{formatAddress(user.address)}</p>
              <a
                href={`https://veryscan.io/address/${user.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-violet hover:underline flex items-center gap-1"
              >
                View on Explorer <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
          {user.score && user.tier && <TierBadge tier={user.tier} score={user.score} />}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-background border border-border">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Users className="h-3.5 w-3.5" />
              Endorsements
            </div>
            <p className="text-xl font-bold text-foreground">{user.endorsementCount}</p>
          </div>
          <div className="p-3 rounded-lg bg-background border border-border">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Calendar className="h-3.5 w-3.5" />
              Member Since
            </div>
            <p className="text-sm font-medium text-foreground">{formatDate(user.registeredAt)}</p>
          </div>
        </div>
        <BadgeList badges={user.badges} />
      </CardContent>
    </Card>
  )
}
