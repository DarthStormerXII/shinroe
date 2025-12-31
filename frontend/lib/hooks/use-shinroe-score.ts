'use client'

import { useState, useEffect, useCallback } from 'react'
import { UserScore } from '@/lib/types/shinroe'

interface UseShinroeScoreReturn {
  score: UserScore | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

interface ScoreApiResponse {
  address: string
  overall?: number
  identity?: number
  financial?: number
  social?: number
  transactional?: number
  behavioral?: number
  tier?: 'elite' | 'excellent' | 'good' | 'building' | 'at_risk'
  trend?: number
  verified: boolean
  timestamp: number
  error?: string
}

export function useShinroeScore(address: string | null): UseShinroeScoreReturn {
  const [score, setScore] = useState<UserScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchScore = useCallback(async () => {
    if (!address) {
      setScore(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/shinroe/score/${address}`)
      const data: ScoreApiResponse = await response.json()

      if (!response.ok || data.error) {
        setError(data.error || 'Failed to fetch score')
        setScore(null)
        return
      }

      if (data.overall !== undefined && data.tier) {
        // Use real component scores from API
        setScore({
          overall: data.overall,
          identity: data.identity ?? 0,
          financial: data.financial ?? 0,
          social: data.social ?? 0,
          transactional: data.transactional ?? 0,
          behavioral: data.behavioral ?? 0,
          tier: data.tier,
          trend: data.trend ?? 0,
        })
      } else {
        setScore(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch score')
    } finally {
      setLoading(false)
    }
  }, [address])

  useEffect(() => {
    fetchScore()
  }, [fetchScore])

  return { score, loading, error, refetch: fetchScore }
}
