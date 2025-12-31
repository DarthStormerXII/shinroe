// Airdrop GraphQL Queries

// All non-cancelled airdrops (including upcoming and ended)
export const ALL_AIRDROPS_QUERY = `
  query GetAllAirdrops {
    airdrops(
      where: { active: true }
      orderBy: createdAt
      orderDirection: desc
      first: 50
    ) {
      id
      creator { id }
      token { id name symbol decimals totalSupply }
      amountPerClaim
      totalAmount
      claimedAmount
      claimCount
      startTime
      endTime
      active
      metadataUri
      minScore
      requiredBadges
      minEndorsementWeight
      requiresRegistration
      createdAt
      cancelledAt
    }
  }
`

export const ACTIVE_AIRDROPS_QUERY = `
  query GetActiveAirdrops($now: BigInt!) {
    airdrops(
      where: { active: true, startTime_lte: $now, endTime_gte: $now }
      orderBy: createdAt
      orderDirection: desc
      first: 50
    ) {
      id
      creator { id }
      token { id name symbol decimals totalSupply }
      amountPerClaim
      totalAmount
      claimedAmount
      claimCount
      startTime
      endTime
      active
      metadataUri
      minScore
      requiredBadges
      minEndorsementWeight
      requiresRegistration
      createdAt
      cancelledAt
    }
  }
`

export const AIRDROP_BY_ID_QUERY = `
  query GetAirdrop($id: ID!) {
    airdrop(id: $id) {
      id
      creator { id }
      token { id name symbol decimals totalSupply }
      amountPerClaim
      totalAmount
      claimedAmount
      claimCount
      startTime
      endTime
      active
      metadataUri
      minScore
      requiredBadges
      minEndorsementWeight
      requiresRegistration
      createdAt
      cancelledAt
      claims(first: 20, orderBy: claimedAt, orderDirection: desc) {
        id
        claimer { id }
        amount
        claimedAt
        txHash
      }
    }
  }
`

export const AIRDROPS_BY_CREATOR_QUERY = `
  query GetAirdropsByCreator($creator: String!) {
    airdrops(where: { creator: $creator }, orderBy: createdAt, orderDirection: desc) {
      id
      creator { id }
      token { id name symbol decimals totalSupply }
      amountPerClaim
      totalAmount
      claimedAmount
      claimCount
      startTime
      endTime
      active
      metadataUri
      minScore
      requiredBadges
      minEndorsementWeight
      requiresRegistration
      createdAt
      cancelledAt
    }
  }
`

export const USER_CLAIMS_QUERY = `
  query GetUserClaims($claimer: String!) {
    airdropClaims(where: { claimer: $claimer }, orderBy: claimedAt, orderDirection: desc) {
      id
      airdrop { id }
      claimer { id }
      amount
      claimedAt
      txHash
    }
  }
`

export const AIRDROP_STATS_QUERY = `
  query GetAirdropStats {
    airdropStats(id: "global") {
      totalAirdrops
      activeAirdrops
      totalTokensCreated
      totalClaimsCount
      totalValueDistributed
    }
  }
`

export const USER_ELIGIBILITY_QUERY = `
  query GetUserEligibility($address: ID!) {
    user(id: $address) {
      id
      isOnchainRegistered
      totalEndorsementWeight
      badges { badgeType }
    }
  }
`

// Subgraph response types
export interface SubgraphAirdrop {
  id: string
  creator: { id: string }
  token: { id: string; name: string; symbol: string; decimals: number; totalSupply: string }
  amountPerClaim: string
  totalAmount: string
  claimedAmount: string
  claimCount: number
  startTime: string
  endTime: string
  active: boolean
  metadataUri: string
  minScore: string
  requiredBadges: number[]
  minEndorsementWeight: string
  requiresRegistration: boolean
  createdAt: string
  cancelledAt?: string
  claims?: SubgraphClaim[]
}

export interface SubgraphClaim {
  id: string
  airdrop?: { id: string }
  claimer: { id: string }
  amount: string
  claimedAt: string
  txHash: string
}

export interface SubgraphUser {
  id: string
  isOnchainRegistered: boolean
  totalEndorsementWeight: string
  badges: { badgeType: number }[]
}
