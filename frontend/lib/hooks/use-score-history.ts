'use client'

import { useState, useEffect, useCallback } from 'react'
import { ScoreHistoryPoint } from '@/lib/types/shinroe'
import { getSubgraphEndpoint, hasSubgraph } from '@/constants/subgraphs'

const CHAIN_ID = 80002 // Polygon Amoy

interface UseScoreHistoryReturn {
  history: ScoreHistoryPoint[]
  loading: boolean
  error: string | null
  needsSubgraph: boolean
}

/**
 * Hook to fetch score history from the subgraph
 *
 * NOTE: Score history requires a deployed subgraph to track ScoreUpdate events over time.
 * Without a subgraph, we cannot show historical score data.
 */
export function useScoreHistory(address: string | null): UseScoreHistoryReturn {
  const [history, setHistory] = useState<ScoreHistoryPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use the same subgraph endpoint as shinroe-service
  const subgraphUrl = hasSubgraph(CHAIN_ID, 'shinroe')
    ? getSubgraphEndpoint(CHAIN_ID, 'shinroe')
    : null

  const fetchHistory = useCallback(async () => {
    if (!address) {
      setHistory([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (!subgraphUrl) {
        // No subgraph configured - return empty with message
        setHistory([])
        setError('Subgraph not configured. Deploy the subgraph to see score history.')
        return
      }

      // Query the subgraph for score updates
      // Note: user_ is used because 'user' is a relation field
      const query = `
        query ScoreHistory($user: String!) {
          scoreUpdates(
            where: { user_: { id: $user } }
            orderBy: timestamp
            orderDirection: asc
            first: 100
          ) {
            id
            timestamp
            newHash
            blockNumber
          }
        }
      `

      const response = await fetch(subgraphUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          variables: { user: address.toLowerCase() },
        }),
      })

      const result = await response.json()

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Subgraph query failed')
      }

      // Map subgraph data to history points
      // Note: Scores are hashed on-chain for privacy - we track update events
      // To get actual score values, we need to fetch from the off-chain scoring API
      const updates = result.data?.scoreUpdates || []

      if (updates.length === 0) {
        setHistory([])
        return
      }

      // Fetch current score from the API to use as the latest data point
      const scoreResponse = await fetch(`/api/shinroe/score/${address}`)
      const scoreData = scoreResponse.ok ? await scoreResponse.json() : null
      const currentScore = scoreData?.overall || null

      if (!currentScore) {
        // No score available from API
        setHistory([])
        setError('Unable to fetch score data')
        return
      }

      // Create history points using actual score from API
      // Since on-chain scores are hashed, we can only show the current score
      // with timestamps of when updates occurred
      const historyPoints: ScoreHistoryPoint[] = updates.map((update: { timestamp: string; blockNumber: string }) => ({
        timestamp: parseInt(update.timestamp) * 1000,
        score: currentScore, // Use actual score from API
      }))

      setHistory(historyPoints)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history')
    } finally {
      setLoading(false)
    }
  }, [address, subgraphUrl])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return {
    history,
    loading,
    error,
    needsSubgraph: !subgraphUrl,
  }
}
