'use client'

import { HoverEffect } from '@/components/ui/hover-effect'
import { Wallet, FileCode, Database, MessageCircle, Shield } from 'lucide-react'

const isVeryChatConfigured = !!process.env.NEXT_PUBLIC_VERYCHAT_PROJECT_ID

const features = [
  {
    title: 'Basic Web3',
    icon: Wallet,
    link: '/starter/basic-web3',
  },
  {
    title: 'Contracts',
    icon: FileCode,
    link: '/starter/contracts',
  },
  {
    title: 'Indexer',
    icon: Database,
    link: '/starter/indexer',
  },
  {
    title: 'Shinroe Dashboard',
    icon: Shield,
    link: '/dashboard',
  },
  ...(isVeryChatConfigured
    ? [
        {
          title: 'VeryChat',
          icon: MessageCircle,
          link: '/starter/verychat',
        },
      ]
    : []),
]

export default function TestingPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">EVM Starter Kit</h1>
          <p className="text-muted-foreground">
            VeryChain - WEPIN Auth
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <HoverEffect items={features} />
        </div>
      </div>
    </main>
  )
}
