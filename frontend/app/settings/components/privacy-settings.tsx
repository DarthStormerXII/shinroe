'use client'

import { useState } from 'react'
import { useAccount } from '@/lib/web3'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Shield, Loader2, AlertCircle, Download } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from '@/lib/i18n'

interface PrivacySettingsProps {
  isPublic: boolean
  onVisibilityChange: (isPublic: boolean) => Promise<void>
}

export function PrivacySettings({ isPublic, onVisibilityChange }: PrivacySettingsProps) {
  const { address } = useAccount()
  const [loading, setLoading] = useState(false)
  const [publicProfile, setPublicProfile] = useState(isPublic)
  const { t } = useTranslation()

  async function handleVisibilityChange(checked: boolean) {
    if (!address) return
    setLoading(true)
    try {
      await onVisibilityChange(checked)
      setPublicProfile(checked)
      toast.success(checked ? t('privacy.profileNowPublic') : t('privacy.profileNowPrivate'))
    } catch (error) {
      toast.error(t('privacy.updateFailed'))
    } finally {
      setLoading(false)
    }
  }

  async function handleExportProof() {
    if (!address) return
    try {
      const res = await fetch(`/api/shinroe/score/${address}`)
      const data = await res.json()
      const proof = {
        address,
        score: data.score,
        timestamp: Date.now(),
        signature: 'TODO: Generate ZK proof',
      }
      const blob = new Blob([JSON.stringify(proof, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `shinroe-score-proof-${address.slice(0, 8)}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(t('privacy.exportSuccess'))
    } catch {
      toast.error(t('privacy.exportFailed'))
    }
  }

  if (!address) return null

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Shield className="h-5 w-5 text-violet" />
          {t('privacy.title')}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {t('privacy.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Public Profile Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-background">
          <div className="flex items-center gap-3">
            {publicProfile ? (
              <Eye className="h-5 w-5 text-success" />
            ) : (
              <EyeOff className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <Label className="text-foreground font-medium">{t('privacy.publicProfile')}</Label>
              <p className="text-xs text-muted-foreground">
                {publicProfile ? t('privacy.publicDesc') : t('privacy.privateDesc')}
              </p>
            </div>
          </div>
          <Switch
            checked={publicProfile}
            onCheckedChange={handleVisibilityChange}
            disabled={loading}
          />
        </div>

        {/* Privacy Notice */}
        <div className="flex items-start gap-2 p-3 rounded-lg border border-border bg-background">
          <AlertCircle className="h-4 w-4 text-coral mt-0.5" />
          <p className="text-xs text-muted-foreground">
            {t('privacy.notice')}
          </p>
        </div>

        {/* Export Score Proof */}
        <div className="pt-2">
          <Button
            variant="outline"
            className="w-full border-border text-muted-foreground hover:bg-background"
            onClick={handleExportProof}
          >
            <Download className="h-4 w-4 mr-2" />
            {t('privacy.exportProof')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
