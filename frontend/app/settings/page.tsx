'use client'

import { useAccount } from '@/lib/web3'
import { LinkVeryChat } from './components/link-verychat'
import { PrivacySettings } from './components/privacy-settings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, Trash2, Wallet, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n'

export default function SettingsPage() {
  const { address, isConnected } = useAccount()
  const [isPublic, setIsPublic] = useState(true)
  const { t } = useTranslation()

  useEffect(() => {
    if (address) fetchUserSettings()
  }, [address])

  async function fetchUserSettings() {
    try {
      const res = await fetch(`/api/shinroe/score/${address}`)
      const data = await res.json()
      setIsPublic(data.isPublic ?? true)
    } catch {
      setIsPublic(true)
    }
  }

  async function handleVisibilityChange(newIsPublic: boolean) {
    setIsPublic(newIsPublic)
  }

  async function handleDeleteAccount() {
    if (!confirm(t('settings.deleteConfirm'))) return
    try {
      await fetch(`/api/shinroe/link-verychat?walletAddress=${address}`, { method: 'DELETE' })
      window.location.reload()
    } catch {
      alert(t('settings.deleteFailed'))
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-[85%] mx-auto py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Settings className="h-8 w-8 text-violet" />
            <h1 className="text-3xl font-bold text-foreground">{t('settings.title')}</h1>
          </div>
          <p className="text-muted-foreground">{t('settings.subtitle')}</p>
        </div>

        {!isConnected ? (
          <div className="text-center py-16">
            <div className="p-4 rounded-full bg-secondary inline-block mb-4">
              <Shield className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-foreground">{t('common.connectWallet')}</h2>
            <p className="text-muted-foreground">{t('common.connectWalletSettings')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 [&>*]:h-full">
            {/* Connected Wallet */}
            <Card className="bg-card border-border h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Wallet className="h-5 w-5 text-violet" />
                  {t('settings.connectedWallet')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-sm text-muted-foreground bg-background p-3 rounded-lg break-all">
                  {address}
                </p>
              </CardContent>
            </Card>

            {/* VeryChat Integration */}
            <LinkVeryChat />

            {/* Privacy Settings */}
            <PrivacySettings isPublic={isPublic} onVisibilityChange={handleVisibilityChange} />

            {/* Danger Zone */}
            <Card className="bg-card border-destructive/30 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Trash2 className="h-5 w-5" />
                  {t('settings.dangerZone')}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {t('settings.dangerZoneDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="border-destructive/50 text-destructive hover:bg-destructive/10"
                  onClick={handleDeleteAccount}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('settings.deleteAccount')}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  {t('settings.deleteAccountDesc')}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}
