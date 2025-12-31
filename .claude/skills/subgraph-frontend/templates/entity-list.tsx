'use client'

import { gql, useQuery } from '@apollo/client'
import { formatEther } from 'viem'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react'

// ============================================================================
// TEMPLATE: Entity List with Pagination
// Replace: ENTITY_NAME, EntityType, fields
// ============================================================================

const GET_ENTITIES = gql`
  query GetEntities($first: Int!, $skip: Int!) {
    entities: ENTITY_NAME(
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      # Add your fields here
      from
      to
      amount
      timestamp
      blockNumber
    }
  }
`

interface EntityType {
  id: string
  from: string
  to: string
  amount: string
  timestamp: string
  blockNumber: string
}

interface Props {
  pageSize?: number
  pollInterval?: number
}

export function EntityList({ pageSize = 20, pollInterval }: Props) {
  const { data, loading, error, refetch, fetchMore, networkStatus } = useQuery<{
    entities: EntityType[]
  }>(GET_ENTITIES, {
    variables: { first: pageSize, skip: 0 },
    pollInterval,
    notifyOnNetworkStatusChange: true,
  })

  const loadingMore = networkStatus === 3

  const loadMore = () => {
    fetchMore({
      variables: { skip: data?.entities?.length ?? 0 },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.entities?.length) return prev
        return {
          ...prev,
          entities: [...prev.entities, ...fetchMoreResult.entities],
        }
      },
    })
  }

  // Loading state
  if (loading && !data) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="flex items-center gap-4 py-6">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <div className="flex-1">
            <p className="font-medium">Failed to load data</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (!data?.entities?.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No data found</p>
        </CardContent>
      </Card>
    )
  }

  // Data state
  return (
    <div className="space-y-4">
      {data.entities.map((entity) => (
        <Card key={entity.id} className="transition-colors hover:bg-muted/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-mono text-sm">
                  {entity.from.slice(0, 6)}...{entity.from.slice(-4)}
                </p>
                <p className="text-xs text-muted-foreground">
                  → {entity.to.slice(0, 6)}...{entity.to.slice(-4)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {parseFloat(formatEther(BigInt(entity.amount))).toFixed(4)} ETH
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(Number(entity.timestamp) * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Load more button */}
      {data.entities.length >= pageSize && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
