# Subgraph Frontend Examples

## Basic Transfer List

```tsx
'use client'

import { gql, useQuery } from '@apollo/client'
import { formatEther } from 'viem'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

const GET_TRANSFERS = gql`
  query GetTransfers($first: Int!, $skip: Int!) {
    transfers(
      first: $first
      skip: $skip
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

interface Transfer {
  id: string
  from: string
  to: string
  amount: string
  timestamp: string
  blockNumber: string
}

export function TransferList() {
  const { data, loading, error, refetch } = useQuery<{ transfers: Transfer[] }>(
    GET_TRANSFERS,
    {
      variables: { first: 20, skip: 0 },
      pollInterval: 30000, // Refresh every 30 seconds
    }
  )

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="flex items-center gap-4 py-6">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <div className="flex-1">
            <p className="font-medium">Failed to load transfers</p>
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

  if (!data?.transfers.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No transfers found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {data.transfers.map((transfer) => (
        <Card key={transfer.id}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-sm">
                  {transfer.from.slice(0, 6)}...{transfer.from.slice(-4)}
                </p>
                <p className="text-xs text-muted-foreground">
                  → {transfer.to.slice(0, 6)}...{transfer.to.slice(-4)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {parseFloat(formatEther(BigInt(transfer.amount))).toFixed(4)} ETH
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(Number(transfer.timestamp) * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

## Account Activity with Filtering

```tsx
'use client'

import { gql, useQuery } from '@apollo/client'
import { useAccount } from '@/lib/web3'

const GET_ACCOUNT_ACTIVITY = gql`
  query GetAccountActivity($account: Bytes!, $first: Int!) {
    sent: transfers(
      first: $first
      where: { from: $account }
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      to
      amount
      timestamp
    }
    received: transfers(
      first: $first
      where: { to: $account }
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      from
      amount
      timestamp
    }
  }
`

export function AccountActivity() {
  const { address, isConnected } = useAccount()

  const { data, loading, error } = useQuery(GET_ACCOUNT_ACTIVITY, {
    variables: {
      account: address?.toLowerCase(),
      first: 10,
    },
    skip: !address, // Don't run query if no address
  })

  if (!isConnected) {
    return <p>Connect wallet to view activity</p>
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <h3 className="mb-4 font-semibold">Sent</h3>
        {data?.sent.map((tx) => (
          <div key={tx.id} className="border-b py-2">
            To: {tx.to.slice(0, 10)}...
          </div>
        ))}
      </div>
      <div>
        <h3 className="mb-4 font-semibold">Received</h3>
        {data?.received.map((tx) => (
          <div key={tx.id} className="border-b py-2">
            From: {tx.from.slice(0, 10)}...
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Infinite Scroll Pagination

```tsx
'use client'

import { gql, useQuery } from '@apollo/client'
import { useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

const GET_TRANSFERS = gql`
  query GetTransfers($first: Int!, $skip: Int!) {
    transfers(first: $first, skip: $skip, orderBy: timestamp, orderDirection: desc) {
      id
      from
      to
      amount
      timestamp
    }
  }
`

const PAGE_SIZE = 20

export function InfiniteTransferList() {
  const { data, loading, fetchMore, networkStatus } = useQuery(GET_TRANSFERS, {
    variables: { first: PAGE_SIZE, skip: 0 },
    notifyOnNetworkStatusChange: true,
  })

  const loadingMore = networkStatus === 3 // NetworkStatus.fetchMore
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(() => {
    if (loadingMore) return

    fetchMore({
      variables: {
        skip: data?.transfers?.length ?? 0,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.transfers?.length) return prev
        return {
          ...prev,
          transfers: [...prev.transfers, ...fetchMoreResult.transfers],
        }
      },
    })
  }, [data?.transfers?.length, fetchMore, loadingMore])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loadingMore) {
        loadMore()
      }
    })

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => observerRef.current?.disconnect()
  }, [loadMore, loadingMore])

  if (loading && !data) {
    return <p>Loading...</p>
  }

  return (
    <div className="space-y-4">
      {data?.transfers.map((transfer) => (
        <div key={transfer.id} className="rounded border p-4">
          {transfer.from} → {transfer.to}
        </div>
      ))}

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="py-4 text-center">
        {loadingMore && (
          <Loader2 className="mx-auto h-6 w-6 animate-spin" />
        )}
      </div>
    </div>
  )
}
```

## Search with Debounce

```tsx
'use client'

import { gql, useLazyQuery } from '@apollo/client'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

const SEARCH_TRANSFERS = gql`
  query SearchTransfers($address: Bytes!) {
    transfers(
      first: 50
      where: { or: [{ from: $address }, { to: $address }] }
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      from
      to
      amount
      timestamp
    }
  }
`

export function TransferSearch() {
  const [search, setSearch] = useState('')
  const [executeSearch, { data, loading }] = useLazyQuery(SEARCH_TRANSFERS)

  // Debounced search
  useEffect(() => {
    if (!search || !search.startsWith('0x') || search.length !== 42) {
      return
    }

    const timer = setTimeout(() => {
      executeSearch({
        variables: { address: search.toLowerCase() },
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [search, executeSearch])

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by address (0x...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading && <p>Searching...</p>}

      {data?.transfers && (
        <p className="text-sm text-muted-foreground">
          Found {data.transfers.length} transfers
        </p>
      )}

      <div className="space-y-2">
        {data?.transfers.map((transfer) => (
          <div key={transfer.id} className="rounded border p-3">
            {transfer.from} → {transfer.to}
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Real-Time Stats Dashboard

```tsx
'use client'

import { gql, useQuery } from '@apollo/client'
import { formatEther } from 'viem'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const GET_STATS = gql`
  query GetStats {
    stats(id: "singleton") {
      totalTransfers
      totalVolume
      uniqueUsers
    }
    recentTransfers: transfers(first: 5, orderBy: timestamp, orderDirection: desc) {
      id
      amount
      timestamp
    }
  }
`

export function StatsDashboard() {
  const { data, loading } = useQuery(GET_STATS, {
    pollInterval: 10000, // Update every 10 seconds
  })

  if (loading) return <p>Loading stats...</p>

  const stats = data?.stats

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Transfers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {Number(stats?.totalTransfers ?? 0).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {parseFloat(formatEther(BigInt(stats?.totalVolume ?? '0'))).toFixed(2)} ETH
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {Number(stats?.uniqueUsers ?? 0).toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
```

## Custom Hook with Cache

```tsx
// hooks/subgraph/useTransfers.ts
import { gql, useQuery, useApolloClient } from '@apollo/client'
import { useCallback } from 'react'

const GET_TRANSFERS = gql`
  query GetTransfers($first: Int!, $skip: Int!, $account: Bytes) {
    transfers(
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
    }
  }
`

interface UseTransfersOptions {
  first?: number
  skip?: number
  account?: string
  pollInterval?: number
}

export function useTransfers(options: UseTransfersOptions = {}) {
  const { first = 20, skip = 0, account, pollInterval } = options
  const client = useApolloClient()

  const { data, loading, error, refetch, fetchMore } = useQuery(GET_TRANSFERS, {
    variables: {
      first,
      skip,
      account: account?.toLowerCase(),
    },
    skip: account !== undefined && !account, // Skip if account is empty string
    pollInterval,
    notifyOnNetworkStatusChange: true,
  })

  const loadMore = useCallback(async () => {
    const currentLength = data?.transfers?.length ?? 0
    return fetchMore({
      variables: { skip: currentLength },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.transfers?.length) return prev
        return {
          ...prev,
          transfers: [...prev.transfers, ...fetchMoreResult.transfers],
        }
      },
    })
  }, [data?.transfers?.length, fetchMore])

  // Prefetch next page
  const prefetchNext = useCallback(() => {
    const currentLength = data?.transfers?.length ?? 0
    client.query({
      query: GET_TRANSFERS,
      variables: { first, skip: currentLength, account: account?.toLowerCase() },
    })
  }, [client, data?.transfers?.length, first, account])

  return {
    transfers: data?.transfers ?? [],
    loading,
    error,
    refetch,
    loadMore,
    prefetchNext,
    hasMore: (data?.transfers?.length ?? 0) >= first,
  }
}
```

## Multiple Subgraph Queries

```tsx
'use client'

import { gql, useQuery } from '@apollo/client'

// Queries for different entities
const GET_TOKENS = gql`
  query GetTokens($first: Int!) {
    tokens(first: $first, orderBy: totalSupply, orderDirection: desc) {
      id
      name
      symbol
      totalSupply
    }
  }
`

const GET_POOLS = gql`
  query GetPools($first: Int!) {
    pools(first: $first, orderBy: totalValueLocked, orderDirection: desc) {
      id
      token0 { symbol }
      token1 { symbol }
      totalValueLocked
    }
  }
`

export function Dashboard() {
  // Run queries in parallel
  const { data: tokensData, loading: tokensLoading } = useQuery(GET_TOKENS, {
    variables: { first: 10 },
  })

  const { data: poolsData, loading: poolsLoading } = useQuery(GET_POOLS, {
    variables: { first: 10 },
  })

  if (tokensLoading || poolsLoading) {
    return <p>Loading dashboard...</p>
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <h2 className="mb-4 text-lg font-semibold">Top Tokens</h2>
        {tokensData?.tokens.map((token) => (
          <div key={token.id} className="border-b py-2">
            {token.symbol}: {token.totalSupply}
          </div>
        ))}
      </div>
      <div>
        <h2 className="mb-4 text-lg font-semibold">Top Pools</h2>
        {poolsData?.pools.map((pool) => (
          <div key={pool.id} className="border-b py-2">
            {pool.token0.symbol}/{pool.token1.symbol}
          </div>
        ))}
      </div>
    </div>
  )
}
```
