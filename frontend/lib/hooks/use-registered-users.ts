'use client'

import { useState, useEffect, useCallback } from 'react'
import { shinroeService } from '@/lib/services/shinroe-service'
import { userMetadataService, type UserMetadata } from '@/lib/services/user-metadata-service'
import type { Address } from 'viem'

export interface RegisteredUserWithMetadata {
  address: Address
  displayName: string | null
  avatarUrl: string | null
  badges: number[]
  endorsementCount: number
  totalEndorsementWeight: bigint
  registeredAt: number
  isPublic: boolean
  score: number
}

interface UseRegisteredUsersReturn {
  users: RegisteredUserWithMetadata[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useRegisteredUsers(): UseRegisteredUsersReturn {
  const [users, setUsers] = useState<RegisteredUserWithMetadata[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { users: subgraphUsers } = await shinroeService.getAllRegisteredUsers(50, 0)

      // Fetch off-chain metadata and scores for each user
      const usersWithMetadata = await Promise.all(
        subgraphUsers.map(async (user) => {
          let metadata: UserMetadata | null = null
          let score = 0
          try {
            metadata = await userMetadataService.getMetadata(user.id)
          } catch {
            // Ignore metadata fetch errors
          }
          try {
            const userScore = await shinroeService.getScore(user.id)
            score = userScore?.overall ?? 0
          } catch {
            // Ignore score fetch errors
          }

          return {
            address: user.id as Address,
            // Use subgraph displayName as fallback if off-chain metadata not available
            displayName: metadata?.displayName || user.displayName || null,
            avatarUrl: metadata?.avatarUrl || null,
            badges: user.badges.map((b) => b.badgeType),
            endorsementCount: user.endorsementsReceived.filter((e) => e.active).length,
            totalEndorsementWeight: BigInt(user.totalEndorsementWeight || '0'),
            registeredAt: parseInt(user.registeredAt || '0'),
            isPublic: user.isPublic,
            score,
          }
        })
      )

      setUsers(usersWithMetadata)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch users'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return { users, isLoading, error, refetch: fetchUsers }
}
