'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { Address } from 'viem'
import { SEARCH_USERS_QUERY, type SearchUserResult, type SearchUsersResponse } from '@/lib/graphql/queries/user-search'
import { userMetadataService } from '@/lib/services/user-metadata-service'
import { getSubgraphUrl } from '@/lib/config/indexer'

const DEBOUNCE_MS = 300

export interface UserSearchResult {
  address: Address
  displayName: string | null
  registeredAt: number
  badges: number[]
  totalEndorsementWeight: bigint
}

interface UseUserSearchReturn {
  results: UserSearchResult[]
  isLoading: boolean
  error: Error | null
  search: (query: string) => void
}

async function executeSearch(query: string): Promise<SearchUsersResponse> {
  const res = await fetch(getSubgraphUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: SEARCH_USERS_QUERY, variables: { search: query.toLowerCase(), first: 10 } }),
  })
  if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
  const result = await res.json()
  if (result.errors) throw new Error(result.errors[0]?.message || 'Query failed')
  return result.data
}

export function useUserSearch(currentUserAddress?: Address): UseUserSearchReturn {
  const [results, setResults] = useState<UserSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

  const search = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const trimmed = query.trim()
    if (!trimmed) { setResults([]); setError(null); return }

    setIsLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        // Search both subgraph (by address) and metadata service (by displayName)
        const [subgraphData, metadataResults] = await Promise.all([
          executeSearch(trimmed),
          userMetadataService.searchByDisplayName(trimmed),
        ])

        // Combine subgraph results
        const combined = new Map<string, SearchUserResult>()
        subgraphData.byAddress.forEach((u) => combined.set(u.id.toLowerCase(), u))
        subgraphData.byName.forEach((u) => combined.set(u.id.toLowerCase(), u))

        // Add metadata search results (users found by displayName in off-chain db)
        for (const metadata of metadataResults) {
          const addr = metadata.address.toLowerCase()
          if (!combined.has(addr)) {
            // Create a minimal entry - we'll enrich with metadata below
            combined.set(addr, {
              id: addr,
              did: null,
              displayName: metadata.displayName,
              isOnchainRegistered: false,
              registeredAt: '0',
              badges: [],
              totalEndorsementWeight: '0',
            })
          }
        }

        // Fetch metadata for all results and merge
        const resultsWithMetadata = await Promise.all(
          Array.from(combined.values())
            .filter((u) => !currentUserAddress || u.id.toLowerCase() !== currentUserAddress.toLowerCase())
            .map(async (u) => {
              let displayName = u.displayName
              // Fetch from metadata service if not already set
              if (!displayName) {
                try {
                  const metadata = await userMetadataService.getMetadata(u.id)
                  displayName = metadata?.displayName || null
                } catch {
                  // Ignore errors
                }
              }
              return {
                address: u.id as Address,
                displayName,
                registeredAt: u.registeredAt ? parseInt(u.registeredAt) : 0,
                badges: u.badges.map((b) => b.badgeType),
                totalEndorsementWeight: BigInt(u.totalEndorsementWeight),
              }
            })
        )

        setResults(resultsWithMetadata)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Search failed'))
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, DEBOUNCE_MS)
  }, [currentUserAddress])

  return { results, isLoading, error, search }
}
