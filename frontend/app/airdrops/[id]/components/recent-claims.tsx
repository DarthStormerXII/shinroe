'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { History, ExternalLink } from 'lucide-react'
import type { AirdropClaim } from '@/lib/types/airdrop'
import { formatEther } from 'viem'

interface RecentClaimsProps {
  claims: AirdropClaim[]
  tokenSymbol: string
  isLoading: boolean
}

export function RecentClaims({ claims, tokenSymbol, isLoading }: RecentClaimsProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <History className="h-5 w-5 text-coral" />
          Recent Claims
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 bg-muted" />
            ))}
          </div>
        ) : claims.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-6">No claims yet</p>
        ) : (
          <div className="space-y-3">
            {claims.slice(0, 10).map((claim) => (
              <ClaimRow key={claim.id} claim={claim} tokenSymbol={tokenSymbol} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ClaimRow({ claim, tokenSymbol }: { claim: AirdropClaim; tokenSymbol: string }) {
  const timeAgo = getTimeAgo(claim.claimedAt)

  return (
    <div className="flex items-center justify-between p-3 bg-background rounded-lg">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-full bg-violet/20 flex items-center justify-center">
          <span className="text-xs text-muted-foreground">
            {claim.claimer.slice(2, 4).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0">
          <code className="text-sm text-foreground">
            {claim.claimer.slice(0, 6)}...{claim.claimer.slice(-4)}
          </code>
          <p className="text-xs text-muted-foreground">
            claimed {formatEther(claim.amount)} {tokenSymbol}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{timeAgo}</span>
        <a
          href={`https://www.veryscan.io/tx/${claim.txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet hover:text-violet/80"
        >
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  )
}

function getTimeAgo(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000)
  const diff = now - timestamp

  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}
