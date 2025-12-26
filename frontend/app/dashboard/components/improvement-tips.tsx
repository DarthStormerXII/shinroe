'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Lightbulb, Users, Award, HandshakeIcon } from 'lucide-react'
import { UserScore } from '@/lib/types/shinroe'
import { useTranslation } from '@/lib/i18n'

interface ImprovementTipsProps {
  score: UserScore | null
  loading: boolean
}

interface Tip {
  icon: React.ReactNode
  titleKey: string
  descriptionKey: string
  impactKey: string
}

const ACTIONABLE_TIPS: Tip[] = [
  {
    icon: <Users className="h-4 w-4" />,
    titleKey: 'improvementTips.getEndorsed.title',
    descriptionKey: 'improvementTips.getEndorsed.description',
    impactKey: 'improvementTips.getEndorsed.impact',
  },
  {
    icon: <HandshakeIcon className="h-4 w-4" />,
    titleKey: 'improvementTips.endorseOthers.title',
    descriptionKey: 'improvementTips.endorseOthers.description',
    impactKey: 'improvementTips.endorseOthers.impact',
  },
  {
    icon: <Award className="h-4 w-4" />,
    titleKey: 'improvementTips.earnBadges.title',
    descriptionKey: 'improvementTips.earnBadges.description',
    impactKey: 'improvementTips.earnBadges.impact',
  },
]

function TipCard({ tip }: { tip: Tip }) {
  const { t } = useTranslation()

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/10">
      <div className="p-2 rounded-lg bg-violet/20 text-violet">
        {tip.icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium">{t(tip.titleKey)}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">{t(tip.descriptionKey)}</p>
        <span className="text-xs text-success mt-2 inline-block">{t(tip.impactKey)}</span>
      </div>
    </div>
  )
}

export function ImprovementTips({ score, loading }: ImprovementTipsProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <Card className="bg-card border-border h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warning" />
            {t('improvementTips.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!score) {
    return (
      <Card className="bg-card border-border h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warning" />
            {t('improvementTips.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{t('improvementTips.connectWallet')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-warning" />
          {t('improvementTips.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {ACTIONABLE_TIPS.map((tip, index) => (
          <TipCard key={index} tip={tip} />
        ))}
      </CardContent>
    </Card>
  )
}
