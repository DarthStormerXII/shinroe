'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useUserLookup } from '@/lib/hooks/use-user-lookup'
import { useRegisteredUsers } from '@/lib/hooks/use-registered-users'
import { UserSearch } from './components/user-search'
import { PublicProfile } from './components/public-profile'
import { AccessRequestModal } from './components/access-request-modal'
import { SearchResultsList } from './components/search-results-list'
import { RegisteredUsersList } from './components/registered-users-list'
import { useTranslation } from '@/lib/i18n'

export default function VerifyPage() {
  const { t } = useTranslation()
  const {
    search,
    user,
    searchResults,
    isLoading,
    error,
    accessStatus,
    recentSearches,
    clearRecentSearches,
  } = useUserLookup()
  const {
    users: registeredUsers,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useRegisteredUsers()
  const [showAccessModal, setShowAccessModal] = useState(false)

  const handleRequestAccess = () => {
    setShowAccessModal(true)
  }

  const handleSelectResult = async (address: string) => {
    await search(address)
  }

  return (
    <main className="min-h-screen bg-background flex items-start justify-center pt-[18vh]">
      <div className="w-[85%] mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <Image
            src="/logo.png"
            alt="Shinroe"
            width={80}
            height={80}
            className="mx-auto mb-4"
          />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{t('verify.title')}</h1>
          <p className="text-muted-foreground">{t('verify.subtitle')}</p>
        </div>

        {/* Search Section */}
        <div className="mb-6">
          <UserSearch
            onSearch={search}
            recentSearches={recentSearches}
            onClearRecent={clearRecentSearches}
            isLoading={isLoading}
          />
        </div>

        {/* Search Results (display name search) - shown when searching */}
        {searchResults.length > 0 && (
          <SearchResultsList results={searchResults} onSelect={handleSelectResult} />
        )}

        {/* Registered Users List - only show when not viewing search results or a profile */}
        {searchResults.length === 0 && !user && !isLoading && (
          <div className="mb-6 max-w-3xl mx-auto">
            <RegisteredUsersList
              users={registeredUsers}
              isLoading={usersLoading}
              error={usersError}
              onRefetch={refetchUsers}
              onSelectUser={handleSelectResult}
            />
          </div>
        )}

        {/* Profile Section - Only show when there's data */}
        {(user || isLoading || error) && (
          <PublicProfile
            user={user}
            isLoading={isLoading}
            error={error}
            accessStatus={accessStatus}
            onRequestAccess={handleRequestAccess}
            isOnchainRegistered={user?.isOnchainRegistered ?? true}
          />
        )}

        {/* Access Request Modal */}
        {user && (
          <AccessRequestModal
            open={showAccessModal}
            onClose={() => setShowAccessModal(false)}
            targetAddress={user.address}
          />
        )}
      </div>
    </main>
  )
}
