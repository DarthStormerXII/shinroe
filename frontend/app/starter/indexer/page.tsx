'use client'

import { HoverEffect } from '@/components/ui/hover-effect'
import { Database, Zap } from 'lucide-react'

const providers = [
  {
    title: 'The Graph',
    icon: Database,
    link: '/indexer/thegraph',
  },
  {
    title: 'Goldsky',
    icon: Zap,
    link: '/indexer/goldsky',
  },
]

export default function IndexerPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Choose Indexer</h1>
          <p className="text-muted-foreground">
            Select your indexing provider
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <HoverEffect items={providers} />
        </div>
      </div>
    </main>
  )
}
