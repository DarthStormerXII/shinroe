'use client'

import { ExternalLink } from 'lucide-react'
import Image from 'next/image'
import type { Airdrop } from '@/lib/types/airdrop'
import { getAirdropStatus, AIRDROP_STATUS_CONFIG } from '@/lib/types/airdrop'
import { formatEther } from 'viem'
import { getIpfsUrl } from '@/lib/utils/ipfs'

interface AirdropHeaderProps {
  airdrop: Airdrop
}

export function AirdropHeader({ airdrop }: AirdropHeaderProps) {
  const status = getAirdropStatus(airdrop)
  const statusConfig = AIRDROP_STATUS_CONFIG[status]
  const progress = airdrop.totalAmount > 0n
    ? Number((airdrop.claimedAmount * 100n) / airdrop.totalAmount)
    : 0

  const timeInfo = getTimeInfo(airdrop, status)
  const imageUrl = airdrop.image ? getIpfsUrl(airdrop.image) : null

  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {imageUrl ? (
            <div className="w-16 h-16 rounded-full overflow-hidden relative">
              <Image src={imageUrl} alt={airdrop.token.symbol} fill className="object-cover" unoptimized />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-violet flex items-center justify-center text-white text-xl font-bold">
              {airdrop.token.symbol.slice(0, 2)}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                {airdrop.name || `${airdrop.token.symbol} Airdrop`}
              </h1>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${statusConfig.color}20`, color: statusConfig.color }}
              >
                {statusConfig.label}
              </span>
            </div>
            {airdrop.description && (
              <p className="text-muted-foreground mt-1">{airdrop.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <span>by</span>
              <code className="text-xs bg-background px-2 py-0.5 rounded">
                {airdrop.creator.slice(0, 6)}...{airdrop.creator.slice(-4)}
              </code>
              <a
                href={`https://www.veryscan.io/address/${airdrop.creator}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet hover:text-violet/80"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox
          label="Amount Per Claim"
          value={`${formatEther(airdrop.amountPerClaim)} ${airdrop.token.symbol}`}
        />
        <StatBox
          label="Total Claims"
          value={airdrop.claimCount.toString()}
        />
        <StatBox
          label="Progress"
          value={`${progress}%`}
        />
        <StatBox
          label={timeInfo.label}
          value={timeInfo.value}
        />
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            {formatEther(airdrop.claimedAmount)} / {formatEther(airdrop.totalAmount)} {airdrop.token.symbol}
          </span>
          <span>{progress}% claimed</span>
        </div>
        <div className="h-3 bg-background rounded-full overflow-hidden">
          <div
            className="h-full bg-violet rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background rounded-lg p-4 border border-border">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}

function getTimeInfo(airdrop: Airdrop, status: string): { label: string; value: string } {
  const now = Math.floor(Date.now() / 1000)

  if (status === 'upcoming') {
    const diff = airdrop.startTime - now
    return { label: 'Starts In', value: formatDuration(diff) }
  }

  if (status === 'active') {
    const diff = airdrop.endTime - now
    return { label: 'Ends In', value: formatDuration(diff) }
  }

  return { label: 'Ended', value: formatDate(airdrop.endTime) }
}

function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const mins = Math.floor((seconds % 3600) / 60)

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
