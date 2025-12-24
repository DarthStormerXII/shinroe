'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Shield, Award, Users, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export default function LandingPage() {
  const { t } = useTranslation()

  const features = [
    {
      icon: Shield,
      title: t('landing.features.onChainReputation.title'),
      description: t('landing.features.onChainReputation.description'),
    },
    {
      icon: Award,
      title: t('landing.features.earnBadges.title'),
      description: t('landing.features.earnBadges.description'),
    },
    {
      icon: Users,
      title: t('landing.features.peerEndorsements.title'),
      description: t('landing.features.peerEndorsements.description'),
    },
    {
      icon: TrendingUp,
      title: t('landing.features.trackProgress.title'),
      description: t('landing.features.trackProgress.description'),
    },
  ]

  const benefits = [
    t('landing.benefits.decentralized'),
    t('landing.benefits.portable'),
    t('landing.benefits.privacy'),
    t('landing.benefits.sybil'),
  ]

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet/10 border border-violet/20 mb-6">
            <Shield className="h-4 w-4 text-violet" />
            <span className="text-sm text-violet">{t('landing.badge')}</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            {t('landing.heroTitle')}{' '}
            <span className="text-violet">{t('landing.heroHighlight')}</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('landing.heroDescription')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-violet hover:bg-violet/90 text-violet-foreground px-8"
              >
                {t('landing.getStarted')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/verify">
              <Button
                size="lg"
                variant="outline"
                className="border-border text-foreground hover:bg-secondary"
              >
                {t('landing.verifyUser')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('landing.buildTrust')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('landing.buildTrustDesc')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-card border-border p-6 hover:border-violet/50 transition-colors"
            >
              <div className="p-3 rounded-lg bg-violet/10 inline-block mb-4">
                <feature.icon className="h-6 w-6 text-violet" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-card rounded-2xl p-8 md:p-12 border border-border">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                {t('landing.whyShinroe')}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t('landing.whyShinroeDesc')}
              </p>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-violet flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-violet/20 blur-3xl rounded-full" />
                <div className="relative bg-background rounded-2xl p-8 border border-border">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-violet mb-2">847</div>
                    <div className="text-muted-foreground text-sm">{t('landing.sampleScore')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('landing.readyTitle')}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            {t('landing.readyDesc')}
          </p>
          <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-violet hover:bg-violet/90 text-violet-foreground px-8"
            >
              {t('landing.launchApp')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
