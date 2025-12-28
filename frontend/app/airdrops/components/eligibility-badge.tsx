'use client'

import { Check, Lock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type EligibilityStatus = 'eligible' | 'ineligible' | 'checking' | 'unknown'

interface EligibilityBadgeProps {
  status: EligibilityStatus
  reason?: string
  size?: 'sm' | 'md'
}

const STATUS_CONFIG: Record<EligibilityStatus, { icon: React.ReactNode; text: string; className: string }> = {
  eligible: {
    icon: <Check className="h-3 w-3" />,
    text: 'Eligible',
    className: 'bg-green/20 text-green border-green/30',
  },
  ineligible: {
    icon: <Lock className="h-3 w-3" />,
    text: 'Locked',
    className: 'bg-coral/20 text-coral border-coral/30',
  },
  checking: {
    icon: <AlertCircle className="h-3 w-3 animate-pulse" />,
    text: 'Checking...',
    className: 'bg-yellow/20 text-yellow border-yellow/30',
  },
  unknown: {
    icon: <AlertCircle className="h-3 w-3" />,
    text: 'Connect Wallet',
    className: 'bg-muted text-muted-foreground border-border',
  },
}

export function EligibilityBadge({ status, reason, size = 'sm' }: EligibilityBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5',
        config.className,
        size === 'md' && 'px-3 py-1'
      )}
      title={reason}
    >
      {config.icon}
      <span className={cn('font-medium', size === 'sm' ? 'text-xs' : 'text-sm')}>
        {config.text}
      </span>
    </div>
  )
}
