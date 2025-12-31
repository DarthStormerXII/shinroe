// GraphQL queries for user search functionality

export const SEARCH_USERS_QUERY = `
  query SearchUsers($search: String!, $first: Int = 10) {
    byAddress: users(where: { id: $search }, first: 1) {
      id
      did
      displayName
      isOnchainRegistered
      registeredAt
      badges { badgeType }
      totalEndorsementWeight
    }
    byName: users(
      where: { displayName_contains_nocase: $search }
      first: $first
      orderBy: registeredAt
      orderDirection: desc
    ) {
      id
      did
      displayName
      isOnchainRegistered
      registeredAt
      badges { badgeType }
      totalEndorsementWeight
    }
    byDID: users(where: { did: $search }, first: 1) {
      id
      did
      displayName
      isOnchainRegistered
      registeredAt
      badges { badgeType }
      totalEndorsementWeight
    }
  }
`

// Response types
export interface SearchUserBadge {
  badgeType: number
}

export interface SearchUserResult {
  id: string
  did: string | null
  displayName: string | null
  isOnchainRegistered: boolean
  registeredAt: string | null
  badges: SearchUserBadge[]
  totalEndorsementWeight: string
}

export interface SearchUsersResponse {
  byAddress: SearchUserResult[]
  byName: SearchUserResult[]
  byDID: SearchUserResult[]
}
