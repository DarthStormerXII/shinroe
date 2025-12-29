'use client'

import { useState, useEffect } from 'react'
import { useAccount, useSignMessage } from '@/lib/web3'
import { useRegistrationContract } from '@/lib/hooks/use-registration-contract'
import { verychatService } from '@/lib/services/verychat-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle, Link2, Loader2, CheckCircle2, AlertCircle, ShieldCheck, Send } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from '@/lib/i18n'

interface LinkStatus {
  linked: boolean
}

type Step = 'input' | 'verify' | 'linked'

const LINK_MESSAGE_PREFIX = 'Link VeryChat account to wallet:\n'

export function LinkVeryChat() {
  const { t } = useTranslation()
  const { address } = useAccount()
  const { signMessage } = useSignMessage()
  const { mintIdentityBadge } = useRegistrationContract()
  const [handleId, setHandleId] = useState(() => t('demoPrefill.veryChatHandle'))
  const [verificationCode, setVerificationCode] = useState('')
  const [step, setStep] = useState<Step>('input')
  const [status, setStatus] = useState<LinkStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [mintingBadge, setMintingBadge] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isConfigured = verychatService.isConfigured()

  useEffect(() => {
    if (address) fetchLinkStatus()
  }, [address])

  async function fetchLinkStatus() {
    if (!address) return
    try {
      const res = await fetch(`/api/shinroe/link-verychat?walletAddress=${address}`)
      const data = await res.json()
      setStatus(data)
      if (data.linked) setStep('linked')
    } catch {
      setStatus({ linked: false })
    }
  }

  async function handleRequestCode() {
    if (!handleId.trim()) return
    setLoading(true)
    setError(null)

    try {
      const result = await verychatService.requestVerificationCode(handleId)
      if (result.success) {
        setStep('verify')
        toast.success(t('verychat.codeSent'))
      } else {
        setError(result.message || t('verychat.codeRequestFailed'))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('verychat.codeRequestFailed'))
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyAndLink() {
    if (!address || !verificationCode.trim()) return
    setLoading(true)
    setError(null)

    try {
      // Verify the code with VeryChat API
      const code = parseInt(verificationCode, 10)
      if (isNaN(code)) throw new Error(t('verychat.invalidCode'))

      const isValid = await verychatService.verifyCode(handleId, code)
      if (!isValid) throw new Error(t('verychat.invalidCode'))

      // Code verified - now sign with wallet and link
      const normalizedHandle = handleId.replace(/^@/, '').toLowerCase()
      const timestamp = Math.floor(Date.now() / 60000)
      const message = `${LINK_MESSAGE_PREFIX}Handle: ${normalizedHandle}\nWallet: ${address.toLowerCase()}\nTimestamp: ${timestamp}`

      const signature = await signMessage(message)

      const res = await fetch('/api/shinroe/link-verychat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address, veryChatHandle: handleId, signature }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to link')
      }

      toast.success(t('verychat.linkSuccess'))
      setStep('linked')
      setHandleId('')
      setVerificationCode('')
      fetchLinkStatus()
      setLoading(false)

      // Mint Verified Identity badge after successful VeryChat link
      setMintingBadge(true)
      const badgeToastId = toast.loading(t('verychat.mintingBadge'))

      try {
        const badgeResult = await mintIdentityBadge()
        if (badgeResult.success) {
          toast.success(t('verychat.badgeMinted'), {
            id: badgeToastId,
            action: {
              label: t('common.viewTx'),
              onClick: () => window.open(`https://www.veryscan.io/tx/${badgeResult.hash}`, '_blank'),
            },
          })
        } else {
          toast.error(t('verychat.badgeFailed'), { id: badgeToastId })
        }
      } catch (badgeErr) {
        toast.error(t('verychat.badgeFailed'), { id: badgeToastId })
        console.error('Badge minting error:', badgeErr)
      } finally {
        setMintingBadge(false)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('verychat.verifyFailed')
      // Handle wallet authorization errors with a clearer message
      if (errorMessage.includes('not been authorized') || errorMessage.includes('user rejected')) {
        setError(t('verychat.signatureRejected'))
      } else {
        setError(errorMessage)
      }
      setLoading(false)
    }
  }

  function handleBack() {
    setStep('input')
    setVerificationCode('')
    setError(null)
  }

  if (!address) return null

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <MessageCircle className="h-5 w-5 text-violet" />
          {t('verychat.title')}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {t('verychat.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConfigured && (
          <div className="flex items-center gap-2 text-sm text-amber-500 p-2 bg-amber-500/10 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            VeryChat not configured
          </div>
        )}

        {step === 'linked' && status?.linked ? (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <div>
              <p className="text-sm font-medium text-foreground">{t('verychat.verified')}</p>
              <p className="text-xs text-muted-foreground">{t('verychat.badgeOnChain')}</p>
            </div>
          </div>
        ) : step === 'verify' ? (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-violet/10 border border-violet/20">
              <p className="text-sm text-foreground">
                {t('verychat.codeInstructions')} <span className="font-medium">@{handleId}</span>
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="code" className="text-muted-foreground">{t('verychat.enterCode')}</Label>
              <Input
                id="code"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="bg-background border-border text-foreground text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}
            {mintingBadge && (
              <div className="flex items-center gap-2 text-sm text-violet">
                <ShieldCheck className="h-4 w-4 animate-pulse" /> {t('verychat.mintingBadge')}
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleBack} disabled={loading || mintingBadge}>
                {t('common.back')}
              </Button>
              <Button
                className="flex-1 bg-violet hover:bg-violet/90"
                onClick={handleVerifyAndLink}
                disabled={loading || mintingBadge || verificationCode.length !== 6}
              >
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Link2 className="h-4 w-4 mr-2" />}
                {t('verychat.verifyAndLink')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="handleId" className="text-muted-foreground">{t('verychat.handle')}</Label>
              <Input
                id="handleId"
                placeholder={t('verychat.handlePlaceholder')}
                value={handleId}
                onChange={(e) => setHandleId(e.target.value)}
                className="bg-background border-border text-foreground"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}
            <Button
              className="w-full bg-violet hover:bg-violet/90"
              onClick={handleRequestCode}
              disabled={loading || !handleId.trim() || !isConfigured}
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              {t('verychat.sendCode')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
