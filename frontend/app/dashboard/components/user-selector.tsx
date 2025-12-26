'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useUserSearch, type UserSearchResult } from '@/lib/hooks/use-user-search'
import { UserSearchResult as UserSearchResultComponent } from '@/components/user/user-search-result'
import { AccountAvatar } from '@/components/web3/wallet/account-avatar'
import type { RegisteredUser, UserSelectorProps } from '@/lib/types/shinroe'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'

const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

export function UserSelector({
  selectedUser,
  onSelectUser,
  currentUserAddress,
  disabled = false,
}: UserSelectorProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { results, isLoading, error, search } = useUserSearch(currentUserAddress)
  const { t } = useTranslation()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (value: string) => {
    setQuery(value)
    search(value)
    setIsOpen(true)
  }

  const handleSelect = (result: UserSearchResult) => {
    const user: RegisteredUser = {
      address: result.address,
      displayName: result.displayName,
      badges: result.badges,
      totalEndorsementWeight: result.totalEndorsementWeight,
    }
    onSelectUser(user)
    setQuery('')
    setIsOpen(false)
  }

  const handleRemove = () => {
    onSelectUser(null)
    setQuery('')
  }

  if (selectedUser) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Selected User</label>
        <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-violet">
          <AccountAvatar address={selectedUser.address} size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground truncate">
              {selectedUser.displayName || truncateAddress(selectedUser.address)}
            </p>
            {selectedUser.displayName && (
              <p className="text-xs text-muted-foreground truncate">
                {truncateAddress(selectedUser.address)}
              </p>
            )}
          </div>
          <button
            onClick={handleRemove}
            disabled={disabled}
            className="p-1 rounded hover:bg-secondary transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <Search className="h-4 w-4 text-violet" />
        {t('userSelector.selectUser')}
      </label>
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          placeholder={t('userSelector.searchPlaceholder')}
          disabled={disabled}
          className="bg-background border-border text-foreground pr-10"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {isOpen && (query || results.length > 0) && (
        <div className={cn(
          'absolute z-50 w-full mt-1 bg-card border border-border rounded-lg',
          'shadow-lg max-h-64 overflow-y-auto'
        )}>
          {error ? (
            <p className="p-3 text-sm text-destructive">{error.message}</p>
          ) : results.length === 0 && !isLoading ? (
            <p className="p-3 text-sm text-muted-foreground">
              {query ? t('userSelector.noUsersFound') : t('userSelector.startTyping')}
            </p>
          ) : (
            results.map((result) => (
              <UserSearchResultComponent
                key={result.address}
                address={result.address}
                displayName={result.displayName}
                badges={result.badges}
                totalEndorsementWeight={result.totalEndorsementWeight}
                onSelect={() => handleSelect(result)}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
