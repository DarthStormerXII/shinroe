// Airdrop Service - Query subgraph for airdrop data
import { getSubgraphUrl } from '@/lib/config/indexer'
import type {
  Airdrop,
  AirdropClaim,
  AirdropStats,
  EligibilityCriteria,
  EligibilityResult,
  TokenInfo,
  AirdropMetadata,
} from '@/lib/types/airdrop'
import {
  ALL_AIRDROPS_QUERY,
  ACTIVE_AIRDROPS_QUERY,
  AIRDROP_BY_ID_QUERY,
  AIRDROPS_BY_CREATOR_QUERY,
  USER_CLAIMS_QUERY,
  AIRDROP_STATS_QUERY,
  USER_ELIGIBILITY_QUERY,
  type SubgraphAirdrop,
  type SubgraphClaim,
  type SubgraphUser,
} from '@/lib/graphql/queries/airdrop-queries'
import type { Address } from 'viem'

// Transform subgraph response to Airdrop type
function transformAirdrop(data: SubgraphAirdrop): Airdrop {
  const criteria: EligibilityCriteria = {
    minScore: Number(data.minScore),
    requiredBadges: data.requiredBadges || [],
    minEndorsementWeight: BigInt(data.minEndorsementWeight || '0'),
    requiresRegistration: data.requiresRegistration,
  }

  const token: TokenInfo = {
    address: data.token.id as Address,
    name: data.token.name,
    symbol: data.token.symbol,
    decimals: data.token.decimals,
    totalSupply: BigInt(data.token.totalSupply),
  }

  return {
    id: data.id,
    creator: data.creator.id as Address,
    token,
    amountPerClaim: BigInt(data.amountPerClaim),
    totalAmount: BigInt(data.totalAmount),
    claimedAmount: BigInt(data.claimedAmount),
    claimCount: data.claimCount,
    startTime: Number(data.startTime),
    endTime: Number(data.endTime),
    active: data.active,
    metadataUri: data.metadataUri,
    criteria,
    createdAt: Number(data.createdAt),
    cancelledAt: data.cancelledAt ? Number(data.cancelledAt) : undefined,
  }
}

function transformClaim(c: SubgraphClaim, airdropId?: string): AirdropClaim {
  return {
    id: c.id,
    airdropId: c.airdrop?.id || airdropId || c.id.split('-')[0],
    claimer: c.claimer.id as Address,
    amount: BigInt(c.amount),
    claimedAt: Number(c.claimedAt),
    txHash: c.txHash,
  }
}

class AirdropService {
  private get endpoint(): string {
    return getSubgraphUrl()
  }

  private async query<T>(query: string, variables?: Record<string, unknown>): Promise<T | null> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
      })
      if (!response.ok) return null
      const { data } = await response.json()
      return data as T
    } catch {
      return null
    }
  }

  async getAllAirdrops(): Promise<Airdrop[]> {
    const data = await this.query<{ airdrops: SubgraphAirdrop[] }>(ALL_AIRDROPS_QUERY)
    return data?.airdrops?.map(transformAirdrop) || []
  }

  async getActiveAirdrops(): Promise<Airdrop[]> {
    const now = Math.floor(Date.now() / 1000).toString()
    const data = await this.query<{ airdrops: SubgraphAirdrop[] }>(ACTIVE_AIRDROPS_QUERY, { now })
    return data?.airdrops?.map(transformAirdrop) || []
  }

  async getAirdropById(id: string): Promise<Airdrop | null> {
    const data = await this.query<{ airdrop: SubgraphAirdrop | null }>(AIRDROP_BY_ID_QUERY, { id })
    return data?.airdrop ? transformAirdrop(data.airdrop) : null
  }

  async getAirdropsByCreator(address: Address): Promise<Airdrop[]> {
    const creator = address.toLowerCase()
    const data = await this.query<{ airdrops: SubgraphAirdrop[] }>(AIRDROPS_BY_CREATOR_QUERY, { creator })
    return data?.airdrops?.map(transformAirdrop) || []
  }

  async getUserClaims(address: Address): Promise<AirdropClaim[]> {
    const claimer = address.toLowerCase()
    const data = await this.query<{ airdropClaims: SubgraphClaim[] }>(USER_CLAIMS_QUERY, { claimer })
    return data?.airdropClaims?.map((c) => transformClaim(c)) || []
  }

  async getAirdropStats(): Promise<AirdropStats | null> {
    const data = await this.query<{ airdropStats: AirdropStats | null }>(AIRDROP_STATS_QUERY)
    if (!data?.airdropStats) return null
    return {
      ...data.airdropStats,
      totalValueDistributed: BigInt(data.airdropStats.totalValueDistributed || '0'),
    }
  }

  async checkEligibility(airdropId: string, address: Address): Promise<EligibilityResult> {
    const [airdrop, userData, scoreResponse] = await Promise.all([
      this.getAirdropById(airdropId),
      this.query<{ user: SubgraphUser | null }>(USER_ELIGIBILITY_QUERY, { address: address.toLowerCase() }),
      fetch(`/api/shinroe/score/${address}`).then(r => r.json()).catch(() => null),
    ])

    if (!airdrop) return { eligible: false, reasons: ['Airdrop not found'] }

    const reasons: string[] = []
    const user = userData?.user
    const userBadges = user?.badges?.map((b) => b.badgeType) || []
    const userWeight = BigInt(user?.totalEndorsementWeight || '0')
    const userScore = scoreResponse?.overall ?? 0

    if (airdrop.criteria.requiresRegistration && !user?.isOnchainRegistered) {
      reasons.push('Registration required')
    }

    // Check if user meets minimum score requirement
    if (airdrop.criteria.minScore > 0 && userScore < airdrop.criteria.minScore) {
      reasons.push(`Minimum score required: ${airdrop.criteria.minScore} (yours: ${userScore})`)
    }

    for (const badge of airdrop.criteria.requiredBadges) {
      if (!userBadges.includes(badge)) {
        reasons.push(`Missing badge: ${badge}`)
      }
    }

    if (userWeight < airdrop.criteria.minEndorsementWeight) {
      reasons.push('Insufficient endorsement weight')
    }

    return {
      eligible: reasons.length === 0,
      reasons,
      userScore,
      userBadges,
      userEndorsementWeight: userWeight,
      isRegistered: user?.isOnchainRegistered,
    }
  }

  async fetchMetadata(uri: string): Promise<AirdropMetadata | null> {
    try {
      const url = uri.startsWith('ipfs://') ? `https://ipfs.io/ipfs/${uri.slice(7)}` : uri
      const response = await fetch(url)
      if (!response.ok) return null
      return await response.json()
    } catch {
      return null
    }
  }

  async getRecentClaims(airdropId: string): Promise<AirdropClaim[]> {
    const airdrop = await this.query<{ airdrop: SubgraphAirdrop | null }>(AIRDROP_BY_ID_QUERY, { id: airdropId })
    return airdrop?.airdrop?.claims?.map((c) => transformClaim(c, airdropId)) || []
  }
}

export const airdropService = new AirdropService()
