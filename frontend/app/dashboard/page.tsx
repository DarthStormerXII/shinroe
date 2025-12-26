'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAccount } from '@/lib/web3'
import { useShinroeScore } from '@/lib/hooks/use-shinroe-score'
import { useScoreHistory } from '@/lib/hooks/use-score-history'
import { useRegistration } from '@/lib/hooks/use-registration'
import { ScoreCard } from './components/score-card'
import { ScoreBreakdown } from './components/score-breakdown'
import { ImprovementTips } from './components/improvement-tips'
import { ScoreHistoryChart } from './components/score-history-chart'
import { EndorsementsTab } from './components/endorsements-tab'
import { BadgesTab } from './components/badges-tab'
import { ProfileSetupModal } from '@/components/onboarding/profile-setup-modal'
import { OnchainStatusBanner } from './components/onchain-status-banner'
import { Shield, Loader2 } from 'lucide-react'
import type { Address } from 'viem'
import { useTranslation } from '@/lib/i18n'

export default function ShinroeDashboard() {
  const { address, isConnected } = useAccount()
  const { score, loading: scoreLoading, error: scoreError } = useShinroeScore(address ?? null)
  const { history, loading: historyLoading, needsSubgraph } = useScoreHistory(address ?? null)
  const {
    did,
    isOnchainRegistered,
    isCheckingRegistration,
    profile,
    isLoadingProfile,
    refetchRegistration,
    setRegisteredOptimistic,
  } = useRegistration()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const { t } = useTranslation()

  // Show profile setup modal for new users (have DID but no profile)
  useEffect(() => {
    if (did && !isLoadingProfile && !profile?.displayName) {
      setShowProfileModal(true)
    }
  }, [did, isLoadingProfile, profile?.displayName])

  const handleProfileComplete = useCallback(() => {
    setShowProfileModal(false)
  }, [])

  const handleRegistrationComplete = useCallback(() => {
    // Immediately update UI to hide the banner
    setRegisteredOptimistic()
    // Also refetch to confirm with contract
    refetchRegistration()
  }, [setRegisteredOptimistic, refetchRegistration])

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('dashboard.subtitle')}</p>
        </div>

        {!isConnected ? (
          <div className="text-center py-16">
            <div className="p-4 rounded-full bg-secondary inline-block mb-4">
              <Shield className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-foreground">{t('common.connectWallet')}</h2>
            <p className="text-muted-foreground">{t('common.connectWalletDesc')}</p>
          </div>
        ) : isCheckingRegistration ? (
          <div className="text-center py-16">
            <div className="p-4 rounded-full bg-secondary inline-block mb-4">
              <Loader2 className="h-12 w-12 text-violet animate-spin" />
            </div>
            <p className="text-muted-foreground">{t('common.checkingRegistration')}</p>
          </div>
        ) : scoreError ? (
          <div className="text-center py-16">
            <p className="text-destructive">{t('common.errorLoading', { error: scoreError })}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* On-chain status banner for unregistered users */}
            {did && !isOnchainRegistered && (
              <OnchainStatusBanner did={did} onRegistrationComplete={handleRegistrationComplete} />
            )}

            {/* Top row - 3 equal height cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
              <ScoreCard score={score} loading={scoreLoading} />
              <ScoreBreakdown score={score} loading={scoreLoading} />
              <ImprovementTips score={score} loading={scoreLoading} />
            </div>

            {/* Full width sections - each fits its content */}
            <ScoreHistoryChart history={history} loading={historyLoading} needsSubgraph={needsSubgraph} />
            <BadgesTab address={address as Address | null} />
            <EndorsementsTab address={address as Address | null} />
          </div>
        )}

        {/* Profile Setup Modal for new users (no gas required) */}
        {showProfileModal && address && (
          <ProfileSetupModal
            open={true}
            onComplete={handleProfileComplete}
            address={address}
          />
        )}
      </div>
    </main>
  )
}
