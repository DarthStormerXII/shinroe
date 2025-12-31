// GraphQL queries for user lookup/verification

export const LOOKUP_USER = `
  query LookupUser($address: ID!) {
    user(id: $address) {
      id
      displayName
      scoreHash
      isPublic
      registeredAt
      lastUpdated
      badges {
        badgeType
        mintedAt
      }
      endorsementsReceived {
        id
      }
      totalEndorsementWeight
    }
  }
`

export const SEARCH_USERS = `
  query SearchUsers($query: String!, $first: Int = 10) {
    users(where: { id_contains_nocase: $query }, first: $first) {
      id
      isPublic
      registeredAt
    }
  }
`

// Subgraph response types
export interface SubgraphBadge {
  badgeType: number
  mintedAt: string
}

export interface SubgraphLookupUser {
  id: string
  displayName: string | null
  scoreHash: string | null
  isPublic: boolean
  registeredAt: string
  lastUpdated: string | null
  badges: SubgraphBadge[]
  endorsementsReceived: { id: string }[]
  totalEndorsementWeight: string
}

export interface LookupUserResponse {
  user: SubgraphLookupUser | null
}

export interface SearchUsersResponse {
  users: Array<{
    id: string
    isPublic: boolean
    registeredAt: string
  }>
}
