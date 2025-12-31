# Subgraph Frontend Reference

## When to Use What

| Need | Use This | Not This | Why |
|------|----------|----------|-----|
| Basic data fetch | `useQuery()` | `fetch()` | Built-in caching, loading states |
| On-demand fetch | `useLazyQuery()` | `useQuery` with skip | Cleaner control flow |
| Real-time data | `pollInterval` option | WebSocket | Simpler, subgraphs don't support WS |
| Fresh data | `fetchPolicy: 'network-only'` | Default cache | Bypass stale cache |
| Pagination | `first` + `skip` vars | Custom solution | Subgraph native |
| Infinite scroll | `fetchMore()` | Manual concat | Handles cache merging |
| Filter by address | `.toLowerCase()` | Raw address | Subgraphs use lowercase Bytes |
| Large numbers | `BigInt(string)` | `Number()` | Prevents overflow |
| Format amounts | `formatEther()` on frontend | Query formatted field | Field doesn't exist |

---

## Apollo Client API

### useQuery

```typescript
import { useQuery } from '@apollo/client'

const { data, loading, error, refetch, fetchMore, networkStatus } = useQuery(
  QUERY,
  {
    variables: { ... },
    // Fetch Policies
    fetchPolicy: 'cache-first',      // Default: check cache, then network
    fetchPolicy: 'cache-only',       // Only cache, no network
    fetchPolicy: 'network-only',     // Skip cache, always network
    fetchPolicy: 'cache-and-network', // Return cache, then update with network
    fetchPolicy: 'no-cache',         // No cache read or write

    // Options
    skip: boolean,                   // Skip query execution
    pollInterval: number,            // Poll every N ms (e.g., 30000)
    notifyOnNetworkStatusChange: true, // Update loading on refetch
    errorPolicy: 'all',              // Return partial data + errors
    onCompleted: (data) => {},       // Callback on success
    onError: (error) => {},          // Callback on error
  }
)
```

### useLazyQuery

```typescript
import { useLazyQuery } from '@apollo/client'

const [executeQuery, { data, loading, error, called }] = useLazyQuery(
  QUERY,
  {
    variables: { ... },
    fetchPolicy: 'network-only',
  }
)

// Call when needed
await executeQuery({ variables: { id: '123' } })
```

### fetchMore (Pagination)

```typescript
const { fetchMore } = useQuery(QUERY)

const loadMore = async () => {
  await fetchMore({
    variables: {
      skip: data.items.length,
    },
    updateQuery: (prev, { fetchMoreResult }) => {
      if (!fetchMoreResult) return prev
      return {
        ...prev,
        items: [...prev.items, ...fetchMoreResult.items],
      }
    },
  })
}
```

## GraphQL Query Syntax

### Variables

```graphql
# Define variable types
query GetTransfers($first: Int!, $skip: Int, $account: Bytes) {
  transfers(first: $first, skip: $skip, where: { from: $account }) {
    id
  }
}
```

### Ordering

```graphql
query {
  transfers(
    orderBy: timestamp
    orderDirection: desc  # or "asc"
  ) {
    id
  }
}
```

### Filtering (Where Clause)

```graphql
# Exact match
where: { from: $address }

# Comparison operators
where: { amount_gt: "1000000000000000000" }
where: { amount_gte: "1000000000000000000" }
where: { amount_lt: "1000000000000000000" }
where: { amount_lte: "1000000000000000000" }

# Not equal
where: { status_not: "completed" }

# In list
where: { status_in: ["pending", "processing"] }
where: { status_not_in: ["cancelled", "failed"] }

# Contains (for strings)
where: { name_contains: "token" }
where: { name_contains_nocase: "TOKEN" }
where: { name_starts_with: "My" }
where: { name_ends_with: "Token" }

# Null checks
where: { description_not: null }

# Boolean operators
where: {
  and: [
    { from: $account },
    { amount_gt: "0" }
  ]
}

where: {
  or: [
    { from: $account },
    { to: $account }
  ]
}
```

### Pagination

```graphql
# Offset pagination
query {
  transfers(first: 20, skip: 0) { id }   # Page 1
  transfers(first: 20, skip: 20) { id }  # Page 2
  transfers(first: 20, skip: 40) { id }  # Page 3
}

# Cursor pagination (more efficient for large datasets)
query {
  transfers(first: 20) { id }
  transfers(first: 20, where: { id_gt: "last-id" }) { id }
}
```

## Common Types

### Subgraph Scalar Types

| GraphQL Type | TypeScript Type | Description |
|--------------|-----------------|-------------|
| `ID` | `string` | Unique identifier |
| `Bytes` | `string` | Hex string (0x...) - **must be lowercase** |
| `BigInt` | `string` | Large integers as strings |
| `BigDecimal` | `string` | Decimals as strings |
| `Int` | `number` | 32-bit signed integer |
| `Boolean` | `boolean` | True/false |
| `String` | `string` | UTF-8 string |

### TypeScript Interfaces

```typescript
// Transfer entity
interface Transfer {
  id: string
  from: string      // Bytes - lowercase hex
  to: string        // Bytes - lowercase hex
  amount: string    // BigInt - parse with BigInt() or formatEther()
  timestamp: string // BigInt - parse with Number()
  blockNumber: string
}

// Query result wrapper
interface GetTransfersQuery {
  transfers: Transfer[]
}

interface GetTransfersVariables {
  first: number
  skip?: number
  account?: string
}
```

## Apollo Client Setup

### Client Factory

```typescript
// lib/apollo/client.ts
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'

export function createApolloClient(endpoint: string) {
  return new ApolloClient({
    link: new HttpLink({ uri: endpoint }),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            // Merge paginated results
            transfers: {
              keyArgs: ['where', 'orderBy', 'orderDirection'],
              merge(existing = [], incoming) {
                return [...existing, ...incoming]
              },
            },
          },
        },
      },
    }),
  })
}
```

### Provider Setup

```typescript
// lib/apollo/providers.tsx
'use client'

import { ApolloProvider } from '@apollo/client'
import { createApolloClient } from './client'
import { subgraphConfig } from '@/constants/subgraphs'

export function SubgraphProvider({ children }: { children: React.ReactNode }) {
  const client = createApolloClient(
    subgraphConfig[subgraphConfig.activeProvider].endpoint
  )

  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  )
}
```

## Formatting Utilities

```typescript
import { formatEther, formatUnits } from 'viem'

// BigInt to ether (18 decimals)
const ethAmount = formatEther(BigInt(transfer.amount))

// BigInt to custom decimals
const tokenAmount = formatUnits(BigInt(transfer.amount), 6) // USDC

// Timestamp to date
const date = new Date(Number(transfer.timestamp) * 1000)

// Format address
const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`

// Format large numbers
const formatted = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 4,
}).format(Number(ethAmount))
```

## Network Status

```typescript
import { NetworkStatus } from '@apollo/client'

const { networkStatus } = useQuery(QUERY, {
  notifyOnNetworkStatusChange: true,
})

// Status values
NetworkStatus.loading    // 1 - Initial loading
NetworkStatus.setVariables // 2 - Variables changed
NetworkStatus.fetchMore  // 3 - Fetching more data
NetworkStatus.refetch    // 4 - Refetching
NetworkStatus.poll       // 6 - Polling
NetworkStatus.ready      // 7 - Query complete
NetworkStatus.error      // 8 - Error occurred
```

## Error Handling

```typescript
interface ApolloError {
  message: string
  graphQLErrors: GraphQLError[]
  networkError: Error | null
}

// Error types
const isNetworkError = (error: ApolloError) => !!error.networkError
const isGraphQLError = (error: ApolloError) => error.graphQLErrors.length > 0

// Common error messages
const getErrorMessage = (error: ApolloError) => {
  if (error.networkError) {
    return 'Network error. Please check your connection.'
  }
  if (error.graphQLErrors.length > 0) {
    return error.graphQLErrors[0].message
  }
  return error.message
}
```

## Subgraph Endpoints

### TheGraph Studio

```
https://api.studio.thegraph.com/query/[SUBGRAPH_ID]/[NAME]/version/latest
```

### TheGraph Decentralized Network

```
https://gateway.thegraph.com/api/[API_KEY]/subgraphs/id/[DEPLOYMENT_ID]
```

### Goldsky

```
# Version-specific
https://api.goldsky.com/api/public/[PROJECT_ID]/subgraphs/[NAME]/[VERSION]/gn

# Tag-based (recommended)
https://api.goldsky.com/api/public/[PROJECT_ID]/subgraphs/[NAME]/prod/gn
```
