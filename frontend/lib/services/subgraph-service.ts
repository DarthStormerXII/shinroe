// Subgraph Service - Query subgraph for DID and user data
import {
  USER_BY_DID_QUERY,
  DID_MAPPINGS_QUERY,
  USER_BY_ADDRESS_WITH_DID_QUERY,
  type DIDUserResult,
  type DIDMappingResult,
  type UserByDIDResponse,
  type DIDMappingsResponse,
  type UserByAddressWithDIDResponse,
} from '@/lib/graphql/queries/did-queries'
import { getSubgraphUrl } from '@/lib/config/indexer'

class SubgraphService {
  private get endpoint(): string {
    return getSubgraphUrl()
  }

  /**
   * Get user by DID (did:ethr:verychain:0x...)
   */
  async getUserByDID(did: string): Promise<DIDUserResult | null> {
    const query = USER_BY_DID_QUERY

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          variables: { did },
        }),
      })

      if (!response.ok) return null

      const { data } = (await response.json()) as { data: UserByDIDResponse }
      return data?.users?.[0] || null
    } catch {
      return null
    }
  }

  /**
   * Get user by address with DID info
   */
  async getUserWithDID(address: string): Promise<DIDUserResult | null> {
    const query = USER_BY_ADDRESS_WITH_DID_QUERY

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          variables: { address: address.toLowerCase() },
        }),
      })

      if (!response.ok) return null

      const { data } = (await response.json()) as { data: UserByAddressWithDIDResponse }
      return data?.user || null
    } catch {
      return null
    }
  }

  /**
   * Get all DID mappings
   */
  async getDIDMappings(params?: {
    onchainOnly?: boolean
    first?: number
    skip?: number
  }): Promise<DIDMappingResult[]> {
    const { onchainOnly = false, first = 100, skip = 0 } = params || {}
    const query = DID_MAPPINGS_QUERY

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          variables: { onchainOnly, first, skip },
        }),
      })

      if (!response.ok) return []

      const { data } = (await response.json()) as { data: DIDMappingsResponse }
      return data?.didMappings || []
    } catch {
      return []
    }
  }

  /**
   * Resolve DID to address
   */
  async resolveDIDToAddress(did: string): Promise<string | null> {
    const user = await this.getUserByDID(did)
    return user?.id || null
  }

  /**
   * Check if user is on-chain registered
   */
  async isOnchainRegistered(addressOrDID: string): Promise<boolean> {
    let user: DIDUserResult | null

    if (addressOrDID.startsWith('did:ethr:verychain:')) {
      user = await this.getUserByDID(addressOrDID)
    } else {
      user = await this.getUserWithDID(addressOrDID)
    }

    return user?.isOnchainRegistered || false
  }

  /**
   * Get DID for address
   */
  async getDIDForAddress(address: string): Promise<string | null> {
    const user = await this.getUserWithDID(address)
    return user?.did || null
  }
}

export const subgraphService = new SubgraphService()
