import { gql, useQuery } from '@apollo/client'
import { useCallback } from 'react'

// ============================================================================
// TEMPLATE: Custom Hook for Subgraph Entity
// Replace: ENTITY_NAME, EntityType, fields, hook name
// ============================================================================

const GET_ENTITIES = gql`
  query GetEntities($first: Int!, $skip: Int!, $account: Bytes) {
    entities: ENTITY_NAME(
      first: $first
      skip: $skip
      where: { from: $account }
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
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

interface UseEntitiesOptions {
  /** Number of items per page */
  first?: number
  /** Number of items to skip */
  skip?: number
  /** Filter by account address */
  account?: string
  /** Poll interval in milliseconds */
  pollInterval?: number
  /** Skip the query */
  skip?: boolean
}

interface UseEntitiesResult {
  /** Array of entities */
  entities: EntityType[]
  /** Loading state */
  loading: boolean
  /** Error object */
  error: Error | undefined
  /** Refetch function */
  refetch: () => Promise<void>
  /** Load more function for pagination */
  loadMore: () => Promise<void>
  /** Whether more items exist */
  hasMore: boolean
}

export function useEntities(options: UseEntitiesOptions = {}): UseEntitiesResult {
  const {
    first = 20,
    skip = 0,
    account,
    pollInterval,
    skip: skipQuery = false,
  } = options

  const { data, loading, error, refetch, fetchMore, networkStatus } = useQuery<{
    entities: EntityType[]
  }>(GET_ENTITIES, {
    variables: {
      first,
      skip,
      account: account?.toLowerCase(),
    },
    skip: skipQuery || (account !== undefined && !account),
    pollInterval,
    notifyOnNetworkStatusChange: true,
  })

  const loadMore = useCallback(async () => {
    const currentLength = data?.entities?.length ?? 0
    await fetchMore({
      variables: { skip: currentLength },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.entities?.length) return prev
        return {
          ...prev,
          entities: [...prev.entities, ...fetchMoreResult.entities],
        }
      },
    })
  }, [data?.entities?.length, fetchMore])

  const handleRefetch = useCallback(async () => {
    await refetch()
  }, [refetch])

  return {
    entities: data?.entities ?? [],
    loading: loading || networkStatus === 3,
    error: error as Error | undefined,
    refetch: handleRefetch,
    loadMore,
    hasMore: (data?.entities?.length ?? 0) >= first,
  }
}
