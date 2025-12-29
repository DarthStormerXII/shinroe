'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Users } from 'lucide-react'
import type { UserMetadata } from '@/lib/services/user-metadata-service'

interface SearchResultsListProps {
  results: UserMetadata[]
  onSelect: (address: string) => void
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function SearchResultsList({ results, onSelect }: SearchResultsListProps) {
  return (
    <Card className="bg-card border-border mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-foreground flex items-center gap-2">
          <Users className="h-5 w-5 text-violet" />
          Search Results ({results.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {results.map((result) => (
            <Button
              key={result.address}
              variant="ghost"
              onClick={() => onSelect(result.address)}
              className="w-full justify-start h-auto py-3 px-4 bg-background hover:bg-secondary border border-border"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="p-2 rounded-full bg-violet/10">
                  <User className="h-5 w-5 text-violet" />
                </div>
                <div className="text-left">
                  <p className="text-foreground font-medium">
                    {result.displayName || 'Anonymous'}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {formatAddress(result.address)}
                  </p>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
