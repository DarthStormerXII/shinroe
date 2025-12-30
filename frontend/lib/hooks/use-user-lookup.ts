'use client'

import { useState, useCallback, useEffect } from 'react'
import { isAddress } from 'viem'
import type { Address } from 'viem'
import {
  type PublicUserProfile,
  type BadgeType,
  getTierFromScore,
} from '@/lib/types/shinroe'
import { userMetadataService, type UserMetadata } from '@/lib/services/user-metadata-service'

type AccessStatus = 'public' | 'private' | 'pending' | 'denied' | null

export interface UserProfileWithMetadata extends PublicUserProfile {
  displayName?: string
  avatarUrl?: string
  bio?: string
  isOnchainRegistered?: boolean
}

interface UseLookupReturn {
  search: (query: string) => Promise<void>
  user: UserProfileWithMetadata | null
  searchResults: UserMetadata[]
  isLoading: boolean
  error: Error | null
  accessStatus: AccessStatus
  recentSearches: string[]
  clearRecentSearches: () => void
}

const RECENT_SEARCHES_KEY = 'shinroe_recent_searches'
const MAX_RECENT_SEARCHES = 5

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveRecentSearch(address: string) {
  if (typeof window === 'undefined') return
  try {
    const searches = getRecentSearches()
    const filtered = searches.filter((s) => s.toLowerCase() !== address.toLowerCase())
    const updated = [address, ...filtered].slice(0, MAX_RECENT_SEARCHES)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
  } catch {
    // Ignore localStorage errors
  }
}

function clearStoredSearches() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY)
  } catch {
    // Ignore localStorage errors
  }
}

import { getSubgraphUrl } from '@/lib/config/indexer'

// Fetch real user profile from subgraph
async function fetchUserProfile(address: string): Promise<PublicUserProfile | null> {
  try {
    const query = `{
      user(id: "${address.toLowerCase()}") {
        id
        isPublic
        registeredAt
        totalEndorsementWeight
        endorsementsReceived(where: { active: true }) { id }
        badges { badgeType mintedAt }
      }
    }`

    const response = await fetch(getSubgraphUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) return null

    const { data, errors } = await response.json()
    if (errors || !data?.user) return null

    const user = data.user

    // Fetch score from API if user is public
    let score: number | undefined
    let tier: ReturnType<typeof getTierFromScore> | undefined

    if (user.isPublic) {
      try {
        const scoreResponse = await fetch(`/api/shinroe/score/${address}`)
        if (scoreResponse.ok) {
          const scoreData = await scoreResponse.json()
          score = scoreData.overall
          tier = getTierFromScore(score!)
        }
      } catch {
        // Score fetch failed, continue without it
      }
    }

    return {
      address: address as Address,
      score,
      tier,
      isPublic: user.isPublic,
      badges: user.badges.map((b: { badgeType: number; mintedAt: string }) => ({
        badgeType: b.badgeType as BadgeType,
        mintedAt: parseInt(b.mintedAt),
      })),
      endorsementCount: user.endorsementsReceived.length,
      registeredAt: parseInt(user.registeredAt),
    }
  } catch {
    return null
  }
}

export function useUserLookup(): UseLookupReturn {
  const [user, setUser] = useState<UserProfileWithMetadata | null>(null)
  const [searchResults, setSearchResults] = useState<UserMetadata[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [accessStatus, setAccessStatus] = useState<AccessStatus>(null)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches())
  }, [])

  const search = useCallback(async (query: string) => {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) {
      setError(new Error('Please enter an address or display name'))
      return
    }

    setIsLoading(true)
    setError(null)
    setUser(null)
    setSearchResults([])
    setAccessStatus(null)

    try {
      // Check if query is an address
      if (isAddress(trimmedQuery)) {
        // Fetch profile + metadata in parallel
        const [profile, metadata] = await Promise.all([
          fetchUserProfile(trimmedQuery),
          userMetadataService.getMetadata(trimmedQuery),
        ])

        // If no on-chain profile but has metadata, show DID-only profile
        if (!profile && metadata) {
          const didOnlyProfile: UserProfileWithMetadata = {
            address: trimmedQuery as Address,
            isPublic: true,
            badges: [],
            endorsementCount: 0,
            registeredAt: Math.floor(Date.now() / 1000),
            displayName: metadata.displayName || undefined,
            avatarUrl: metadata.avatarUrl || undefined,
            bio: metadata.bio || undefined,
            isOnchainRegistered: false,
          }
          setUser(didOnlyProfile)
          setAccessStatus('public')
          saveRecentSearch(trimmedQuery)
          setRecentSearches(getRecentSearches())
          return
        }

        if (!profile) {
          setError(new Error('User not found'))
          return
        }

        const userWithMetadata: UserProfileWithMetadata = {
          ...profile,
          displayName: metadata?.displayName || undefined,
          avatarUrl: metadata?.avatarUrl || undefined,
          bio: metadata?.bio || undefined,
          isOnchainRegistered: true,
        }

        setUser(userWithMetadata)
        setAccessStatus(profile.isPublic ? 'public' : 'private')
        saveRecentSearch(trimmedQuery)
        setRecentSearches(getRecentSearches())
      } else {
        // Search by display name
        const results = await userMetadataService.searchByDisplayName(trimmedQuery)
        if (results.length === 0) {
          setError(new Error('No users found with that display name'))
          return
        }
        setSearchResults(results)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to lookup user'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearRecentSearches = useCallback(() => {
    clearStoredSearches()
    setRecentSearches([])
  }, [])

  return {
    search,
    user,
    searchResults,
    isLoading,
    error,
    accessStatus,
    recentSearches,
    clearRecentSearches,
  }
}
