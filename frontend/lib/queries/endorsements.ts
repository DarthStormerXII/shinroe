// GraphQL queries for endorsements

export const GET_USER_ENDORSEMENTS = `
  query GetUserEndorsements($address: ID!) {
    user(id: $address) {
      endorsementsReceived(first: 50, orderBy: createdAt, orderDirection: desc) {
        id
        endorser { id }
        endorsementType
        stakeAmount
        createdAt
        active
      }
      endorsementsGiven(first: 50, orderBy: createdAt, orderDirection: desc) {
        id
        endorsee { id }
        endorsementType
        stakeAmount
        createdAt
        active
      }
      totalEndorsementWeight
    }
  }
`

export const GET_ENDORSEMENT_BY_ID = `
  query GetEndorsement($id: ID!) {
    endorsement(id: $id) {
      id
      endorser { id }
      endorsee { id }
      endorsementType
      stakeAmount
      createdAt
      active
    }
  }
`

// Subgraph response types
export interface SubgraphEndorsement {
  id: string
  endorser?: { id: string }
  endorsee?: { id: string }
  endorsementType: number
  stakeAmount: string
  createdAt: string
  active: boolean
}

export interface SubgraphUser {
  endorsementsReceived: SubgraphEndorsement[]
  endorsementsGiven: SubgraphEndorsement[]
  totalEndorsementWeight: string
}

export interface GetUserEndorsementsResponse {
  user: SubgraphUser | null
}
