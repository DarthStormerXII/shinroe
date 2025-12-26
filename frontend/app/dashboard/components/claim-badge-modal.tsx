'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { BadgeType, BADGE_METADATA } from '@/lib/types/shinroe'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useTranslation } from '@/lib/i18n'

const EXPLORER_URL = 'https://www.veryscan.io/tx/'
const BADGE_KEYS = ['verifiedMember', 'powerUser', 'socialStar', 'foundingMember', 'vip'] as const

interface ClaimBadgeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  badgeType: BadgeType | null
  isEligible: boolean
  progress?: { current: number; required: number }
  reason?: string
  onClaim: (badge: BadgeType) => Promise<string | null>
}

type ClaimStatus = 'idle' | 'claiming' | 'success' | 'error'

export function ClaimBadgeModal({ open, onOpenChange, badgeType, isEligible, progress, reason, onClaim }: ClaimBadgeModalProps) {
  const [status, setStatus] = useState<ClaimStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const { t } = useTranslation()

  if (badgeType === null) return null
  const config = BADGE_METADATA[badgeType]
  const progressPercent = progress ? Math.min(100, (progress.current / progress.required) * 100) : 0

  const badgeKey = BADGE_KEYS[badgeType]
  const badgeName = t(`badgeNames.${badgeKey}`)
  const badgeDescription = t(`badgeDescriptions.${badgeKey}`)
  const badgeRequirement = t(`badgeRequirements.${badgeKey}`)

  function getProgressUnit(): string {
    switch (badgeType) {
      case BadgeType.TRUSTED_TRADER:
        return t('badgeProgress.activities')
      case BadgeType.COMMUNITY_BUILDER:
        return t('badgeProgress.endorsementsGiven')
      case BadgeType.ELITE_SCORE:
        return t('badgeProgress.points')
      default:
        return ''
    }
  }

  const handleClaim = async () => {
    setStatus('claiming')
    setError(null)
    const toastId = toast.loading(t('claimBadge.claiming', { badge: badgeName }))
    try {
      const txHash = await onClaim(badgeType)
      setStatus('success')
      toast.success(t('claimBadge.claimed', { badge: badgeName }), {
        id: toastId,
        action: txHash ? {
          label: t('common.viewTx'),
          onClick: () => window.open(`${EXPLORER_URL}${txHash}`, '_blank'),
        } : undefined,
      })
      setTimeout(() => { onOpenChange(false); setStatus('idle') }, 2000)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('claimBadge.claimedSuccess')
      setError(errorMsg)
      setStatus('error')
      toast.error(errorMsg, { id: toastId })
    }
  }

  const handleClose = () => {
    if (status !== 'claiming') { onOpenChange(false); setStatus('idle'); setError(null) }
  }

  const renderBadgeVisual = () => {
    if (status === 'claiming') {
      return <Loader2 className="h-16 w-16 animate-spin" style={{ color: config.color }} />
    }
    if (status === 'success') {
      return <CheckCircle className="h-16 w-16 text-success" />
    }
    if (status === 'error') {
      return <XCircle className="h-16 w-16 text-destructive" />
    }
    return (
      <div className="relative w-24 h-24">
        <Image
          src={config.image}
          alt={badgeName}
          fill
          className="object-cover rounded-full"
        />
      </div>
    )
  }

  const renderStatus = () => {
    if (status === 'success') return <p className="text-success font-medium animate-fade-in">{t('claimBadge.claimedSuccess')}</p>
    if (status === 'error') return <p className="text-destructive text-sm text-center">{error}</p>
    if (!isEligible) return (
      <div className="text-center w-full space-y-3">
        <p className="text-coral font-medium">{t('claimBadge.notEligible')}</p>
        {progress ? (
          <div className="space-y-2 px-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{getProgressUnit()}</span>
              <span className="text-foreground font-medium">{progress.current} / {progress.required}</span>
            </div>
            <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t('badgeProgress.moreNeeded', { count: progress.required - progress.current, unit: getProgressUnit() })}
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">{reason || badgeRequirement}</p>
        )}
      </div>
    )
    return <p className="text-success font-medium">{t('claimBadge.eligible')}</p>
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">{badgeName}</DialogTitle>
          <DialogDescription className="text-muted-foreground">{badgeDescription}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center py-6 gap-4">
          <div className={cn('flex items-center justify-center transition-all duration-500', status === 'success' && 'animate-bounce-in')}>
            {renderBadgeVisual()}
          </div>
          {renderStatus()}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleClose} disabled={status === 'claiming'} className="flex-1 border-border">{t('common.cancel')}</Button>
          <Button onClick={handleClaim} disabled={!isEligible || status === 'claiming' || status === 'success'} className="flex-1 bg-violet hover:bg-violet/90">
            {status === 'claiming' ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('claimBadge.claimingButton')}</> : status === 'success' ? t('claimBadge.claimedSuccess') : t('claimBadge.claimButton')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
