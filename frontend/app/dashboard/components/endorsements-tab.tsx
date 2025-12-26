'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, UserPlus, Coins, RefreshCw } from 'lucide-react'
import { EndorsementList } from './endorsement-list'
import { EndorseModal } from './endorse-modal'
import { useEndorsements } from '@/lib/hooks/use-endorsements'
import { useEndorsementContract } from '@/lib/hooks/use-endorsement-contract'
import { formatEther } from 'viem'
import type { Address } from 'viem'
import { useTranslation } from '@/lib/i18n'

interface EndorsementsTabProps {
  address: Address | null
}

export function EndorsementsTab({ address }: EndorsementsTabProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null)
  const { t } = useTranslation()

  const { received, given, totalWeight, isLoading, error, refetch } = useEndorsements(address)
  const { withdrawEndorsement } = useEndorsementContract()

  const handleWithdraw = async (id: string) => {
    try {
      setWithdrawingId(id)
      await withdrawEndorsement(BigInt(id))
      refetch()
    } catch (err) {
      console.error('Failed to withdraw:', err)
    } finally {
      setWithdrawingId(null)
    }
  }

  const handleEndorseSuccess = () => {
    refetch()
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-8 text-center">
          <p className="text-destructive">{t('endorsements.failedToLoad')}</p>
          <Button variant="outline" onClick={refetch} className="mt-4 border-border">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('common.retry')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-violet" />
              {t('endorsements.title')}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={isLoading}
              className="border-border"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              size="sm"
              onClick={() => setModalOpen(true)}
              className="bg-violet hover:bg-violet/90"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {t('endorsements.endorse')}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              label={t('endorsements.received')}
              value={received.length}
              icon={<Users className="h-4 w-4" />}
              loading={isLoading}
            />
            <StatCard
              label={t('endorsements.given')}
              value={given.length}
              icon={<UserPlus className="h-4 w-4" />}
              loading={isLoading}
            />
            <StatCard
              label={t('endorsements.weight')}
              value={`${parseFloat(formatEther(totalWeight)).toFixed(4)} VERY`}
              icon={<Coins className="h-4 w-4" />}
              loading={isLoading}
              isText
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="received" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-background">
              <TabsTrigger
                value="received"
                className="data-[state=active]:bg-secondary data-[state=active]:text-foreground"
              >
                {t('endorsements.received')} ({received.length})
              </TabsTrigger>
              <TabsTrigger
                value="given"
                className="data-[state=active]:bg-secondary data-[state=active]:text-foreground"
              >
                {t('endorsements.given')} ({given.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="received" className="mt-4">
              <EndorsementList
                endorsements={received}
                isLoading={isLoading}
                isGiven={false}
              />
            </TabsContent>

            <TabsContent value="given" className="mt-4">
              <EndorsementList
                endorsements={given}
                isLoading={isLoading}
                isGiven={true}
                onWithdraw={handleWithdraw}
                withdrawingId={withdrawingId}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <EndorseModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={handleEndorseSuccess}
      />
    </>
  )
}

interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  loading?: boolean
  isText?: boolean
}

function StatCard({ label, value, icon, loading, isText }: StatCardProps) {
  return (
    <div className="bg-background rounded-lg p-3">
      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
        {icon}
        <span>{label}</span>
      </div>
      {loading ? (
        <Skeleton className="h-6 w-16 bg-secondary" />
      ) : (
        <p className={`font-semibold text-foreground ${isText ? 'text-sm' : 'text-lg'}`}>
          {value}
        </p>
      )}
    </div>
  )
}
