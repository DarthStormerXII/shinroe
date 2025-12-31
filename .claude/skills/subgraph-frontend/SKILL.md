---
name: subgraph-frontend
description: Query blockchain data from TheGraph or Goldsky subgraphs using Apollo Client. Use when fetching indexed blockchain data, building data displays, or implementing real-time updates.
---

# Subgraph Frontend Skill

## BEFORE WRITING ANY CODE

**MANDATORY: Use Context7 MCP for all documentation lookups.**

```
1. Resolve library ID:
   mcp__context7__resolve-library-id({ libraryName: "apollo-client" })
   mcp__context7__resolve-library-id({ libraryName: "graphql" })

2. Fetch docs for your specific task:
   mcp__context7__get-library-docs({
     context7CompatibleLibraryID: "/apollographql/apollo-client",
     topic: "useQuery",
     mode: "code"
   })

3. NEVER guess Apollo Client APIs - verify with Context7 first
4. If Context7 doesn't have the library, state this and ask user for docs
```

---

## When to Use This Skill

Load this skill when:
- Fetching historical blockchain data (transfers, events, etc.)
- Building data tables or lists from indexed data
- Implementing search/filter on blockchain data
- Setting up real-time data updates with polling
- Working with Apollo Client queries

## Core Rules

1. **Type all queries** - Define TypeScript interfaces for query results
2. **Handle all states** - Loading, error, and empty states
3. **Use variables** - Never hardcode values in queries
4. **Lowercase addresses** - GraphQL uses lowercase for Bytes fields
5. **Format on frontend** - Store raw values, format for display

## Decision Tree

```
Need to fetch data?
├─ One-time fetch → useQuery with network-only
├─ Real-time updates → useQuery with pollInterval
├─ On-demand fetch → useLazyQuery
└─ Multiple queries → Combine in single useQuery or parallel

Need to filter data?
├─ By address → Use 'where' clause with Bytes type
├─ By time range → Use timestamp_gte/timestamp_lte
├─ By multiple conditions → Use 'and'/'or' in where
└─ Complex filtering → Build dynamic query variables

Need pagination?
├─ Simple → Use 'first' and 'skip'
├─ Infinite scroll → Use fetchMore with skip
└─ Cursor-based → Use 'after' with entity ID
```

## Common Tasks

### Adding a New Query

1. Look up Apollo Client useQuery via Context7
2. Define GraphQL query with proper types (Bytes!, BigInt!, etc.)
3. Create TypeScript interface for result
4. Use lowercase for address variables
5. Handle loading, error, and empty states in UI

### Adding Pagination

1. Look up Apollo fetchMore via Context7
2. Use `first` and `skip` variables
3. Implement fetchMore with skip = current data length
4. Optionally configure cache merge policy

### Adding Real-time Updates

1. Use `pollInterval` option on useQuery
2. Set interval based on data freshness needs (e.g., 30000ms)
3. Consider using `notifyOnNetworkStatusChange: true`

## Anti-Patterns (NEVER DO)

```tsx
// NEVER hardcode addresses in queries
const QUERY = gql`
  query {
    transfers(where: { from: "0xABC..." }) { ... }
  }
`

// Use variables
const QUERY = gql`
  query GetTransfers($from: Bytes!) {
    transfers(where: { from: $from }) { ... }
  }
`
useQuery(QUERY, { variables: { from: address.toLowerCase() } })

// NEVER skip error handling
const { data } = useQuery(QUERY)
return <List items={data.transfers} />

// Handle all states
const { data, loading, error } = useQuery(QUERY)
if (loading) return <Skeleton />
if (error) return <ErrorAlert error={error} onRetry={refetch} />
if (!data?.transfers.length) return <EmptyState />
return <List items={data.transfers} />

// NEVER format in the query
const QUERY = gql`
  transfers { amountFormatted }  // Doesn't exist!
`

// Format on frontend
const amount = formatEther(transfer.amount)
```

## Project Structure

```
frontend/
├── constants/subgraphs/
│   ├── index.ts              # Export all configs
│   └── [chainId]/
│       └── [name].ts         # Subgraph endpoint config
├── lib/apollo/
│   ├── client.ts             # Apollo Client factory
│   └── providers.tsx         # ApolloProvider wrapper
├── hooks/subgraph/
│   └── use[Entity].ts        # Query hooks per entity
└── components/subgraph/
    └── [Entity]List.tsx      # UI components
```

## Subgraph Configuration

```typescript
// frontend/constants/subgraphs/11155111/freemint.ts
export const freemintSubgraph = {
  name: 'freemint',
  thegraph: {
    endpoint: 'https://api.studio.thegraph.com/query/[id]/freemint/version/latest',
  },
  goldsky: {
    endpoint: 'https://api.goldsky.com/api/public/[project-id]/subgraphs/freemint/prod/gn',
  },
  activeProvider: 'goldsky' as const,
}
```

## Query Patterns

### Basic Query

```typescript
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
```

### Filtered Query

```typescript
const GET_ACCOUNT_TRANSFERS = gql`
  query GetAccountTransfers($account: Bytes!, $first: Int!) {
    transfers(
      first: $first
      where: { or: [{ from: $account }, { to: $account }] }
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
```

## Related Skills

- **ui-dev** - For building data display components
- **thegraph-dev** / **goldsky-dev** - For building the subgraphs being queried

## Quick Reference

| Task | Code |
|------|------|
| Basic query | `useQuery(QUERY, { variables })` |
| Skip query | `useQuery(QUERY, { skip: !condition })` |
| Polling | `useQuery(QUERY, { pollInterval: 30000 })` |
| No cache | `useQuery(QUERY, { fetchPolicy: 'network-only' })` |
| Refetch | `const { refetch } = useQuery(...); await refetch()` |
| Pagination | `fetchMore({ variables: { skip: data.length } })` |
| Lazy query | `const [fetch, { data }] = useLazyQuery(QUERY)` |

See `reference.md` for Apollo Client API and `examples.md` for common patterns.
