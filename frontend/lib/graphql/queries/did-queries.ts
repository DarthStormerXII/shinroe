// GraphQL queries for DID functionality

export const USER_BY_DID_QUERY = `
  query UserByDID($did: String!) {
    users(where: { did: $did }, first: 1) {
      id
      did
      displayName
      isOnchainRegistered
      scoreHash
      registeredAt
      lastUpdated
      totalEndorsementWeight
      badges {
        badgeType
        mintedAt
        active
      }
      endorsementsReceived(where: { active: true }) {
        id
        endorser { id displayName }
        endorsementType
        stakeAmount
        createdAt
      }
    }
  }
`

export const DID_MAPPINGS_QUERY = `
  query AllDIDMappings($onchainOnly: Boolean!, $first: Int = 100, $skip: Int = 0) {
    didMappings(
      where: { registeredOnchain: $onchainOnly }
      orderBy: createdAt
      orderDirection: desc
      first: $first
      skip: $skip
    ) {
      id
      address
      registeredOnchain
      createdAt
    }
  }
`

export const USER_BY_ADDRESS_WITH_DID_QUERY = `
  query UserByAddressWithDID($address: ID!) {
    user(id: $address) {
      id
      did
      displayName
      isOnchainRegistered
      scoreHash
      isPublic
      registeredAt
      lastUpdated
      totalEndorsementWeight
      badges {
        badgeType
        mintedAt
        active
      }
    }
  }
`

// Response types
export interface DIDUserBadge {
  badgeType: number
  mintedAt: string
  active: boolean
}

export interface DIDUserEndorsement {
  id: string
  endorser: { id: string; displayName: string | null }
  endorsementType: number
  stakeAmount: string
  createdAt: string
}

export interface DIDUserResult {
  id: string
  did: string | null
  displayName: string | null
  isOnchainRegistered: boolean
  scoreHash: string | null
  isPublic?: boolean
  registeredAt: string | null
  lastUpdated: string | null
  totalEndorsementWeight: string
  badges: DIDUserBadge[]
  endorsementsReceived?: DIDUserEndorsement[]
}

export interface UserByDIDResponse {
  users: DIDUserResult[]
}

export interface DIDMappingResult {
  id: string
  address: string
  registeredOnchain: boolean
  createdAt: string
}

export interface DIDMappingsResponse {
  didMappings: DIDMappingResult[]
}

export interface UserByAddressWithDIDResponse {
  user: DIDUserResult | null
}
