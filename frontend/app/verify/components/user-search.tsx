'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, X, Clock, Loader2 } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

interface UserSearchProps {
  onSearch: (query: string) => Promise<void>
  recentSearches: string[]
  onClearRecent: () => void
  isLoading: boolean
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function UserSearch({
  onSearch,
  recentSearches,
  onClearRecent,
  isLoading,
}: UserSearchProps) {
  const [query, setQuery] = useState('')
  const { t } = useTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() && !isLoading) {
      await onSearch(query.trim())
    }
  }

  const handleRecentClick = async (address: string) => {
    setQuery(address)
    await onSearch(address)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="relative">
        <Input
          placeholder={t('verify.searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-card border-border text-foreground placeholder:text-muted-foreground h-14 pl-5 pr-14 rounded-full text-base"
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-violet hover:bg-violet/90 text-white h-10 w-10 rounded-md p-0"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </Button>
      </form>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{t('verify.recent')}</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {recentSearches.map((address) => (
                <Button
                  key={address}
                  variant="outline"
                  size="sm"
                  onClick={() => handleRecentClick(address)}
                  disabled={isLoading}
                  className="border-border hover:border-violet text-muted-foreground hover:text-foreground font-mono text-xs"
                >
                  {formatAddress(address)}
                </Button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearRecent}
              className="text-xs text-muted-foreground hover:text-foreground h-6 px-2"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
