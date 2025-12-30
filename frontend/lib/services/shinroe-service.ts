// Shinroe Score Service - API for score calculation and lookup
import { getSubgraphUrl } from '@/lib/config/indexer'
import { UserScore, getTierFromScore, getEndorsementTypeFromValue } from '@/lib/types/shinroe'
import type { VeryChatIdentitySignals } from './verychat-types'

interface SubgraphUser {
  id: string
  did: string | null
  displayName: string | null
  scoreHash: string | null
  isPublic: boolean
  isOnchainRegistered: boolean
  registeredAt: string | null
  lastUpdated: string | null
  totalEndorsementWeight: string
  endorsementsReceived: { id: string; endorser: { id: string }; endorsee: { id: string }; endorsementType: number; stakeAmount: string; createdAt: string; active: boolean }[]
  endorsementsGiven: { id: string; endorser: { id: string }; endorsee: { id: string }; endorsementType: number; stakeAmount: string; createdAt: string; active: boolean }[]
  badges: { badgeType: number; mintedAt: string }[]
}

export interface UserData {
  isVerified: boolean
  badgeCount: number
  badgeTypes: number[]
  accountAge: number
  transactionCount: number
  endorsementWeight: number
  endorsementCount: number
  uniqueCounterparties: number
  onChainAge: number
  // VeryChat identity signals
  veryChatSignals?: VeryChatIdentitySignals
}

export interface EndorsementDetails { type: string; stake: string; from: string; createdAt: number }

class ShinroeService {
  private get endpoint(): string {
    return getSubgraphUrl()
  }

  async getScore(address: string, veryChatHandle?: string): Promise<UserScore | null> {
    const userData = await this.getUserData(address, veryChatHandle)
    if (!userData) return null
    const calculatedScore = this.calculateScore(userData)

    // Calculate identity score including badges and VeryChat signals
    let identityScore = userData.badgeCount * 15 // Each badge adds to identity
    if (userData.isVerified) identityScore += 25
    if (userData.veryChatSignals) {
      const vc = userData.veryChatSignals
      identityScore += vc.kycLevel * 13 // 0-39 from KYC
      if (vc.verifiedEmail) identityScore += 10
      if (vc.verifiedPhone) identityScore += 15
      if (vc.profileComplete) identityScore += 11
    }

    // Financial score based on endorsement stakes (real on-chain value)
    const financialScore = Math.min(100, (userData.endorsementWeight * 10) + (userData.transactionCount * 3))

    return {
      overall: calculatedScore,
      identity: Math.min(100, identityScore),
      financial: financialScore,
      social: Math.min(100, userData.endorsementCount * 10 + userData.endorsementWeight / 1e16),
      transactional: Math.min(100, userData.uniqueCounterparties * 4 + userData.transactionCount * 2),
      behavioral: Math.min(100, Math.floor(userData.onChainAge / 3)),
      tier: getTierFromScore(calculatedScore),
      trend: 0,
    }
  }

  async getEndorsements(address: string): Promise<{ received: number; given: number; totalWeight: string; endorsements: EndorsementDetails[] }> {
    const user = await this.fetchUserFromSubgraph(address)
    if (!user) return { received: 0, given: 0, totalWeight: '0', endorsements: [] }

    const endorsements = user.endorsementsReceived.filter(e => e.active).map(e => ({
      type: getEndorsementTypeFromValue(e.endorsementType),
      stake: e.stakeAmount,
      from: e.endorser.id,
      createdAt: parseInt(e.createdAt),
    }))

    return {
      received: user.endorsementsReceived.filter(e => e.active).length,
      given: user.endorsementsGiven.filter(e => e.active).length,
      totalWeight: user.totalEndorsementWeight,
      endorsements,
    }
  }

  async verifyScore(address: string, claimedScore: number, _salt: string): Promise<boolean> {
    const userData = await this.getUserData(address)
    if (!userData) return false
    const calculatedScore = this.calculateScore(userData)
    return Math.abs(calculatedScore - claimedScore) <= calculatedScore * 0.05
  }

  calculateScore(data: UserData): number {
    let score = 350

    // Badge contributions - each badge type adds points
    // Badge types: 0=Verified Identity, 1=Trusted Trader, 2=Community Builder, 3=Early Adopter, 4=Elite Score
    const badgePoints: Record<number, number> = { 0: 50, 1: 30, 2: 25, 3: 20, 4: 40 }
    for (const badgeType of data.badgeTypes) {
      score += badgePoints[badgeType] || 20
    }
    // Bonus for having any verification
    if (data.isVerified) score += 25

    // Account age bonuses
    if (data.accountAge > 180) score += 50
    if (data.accountAge > 365) score += 50

    // Activity-based scores (from real subgraph data)
    score += Math.min(data.transactionCount * 2, 150)
    score += Math.min(data.endorsementWeight / 1e18, 100)
    score += Math.min(data.endorsementCount * 10, 100)
    score += Math.min(data.uniqueCounterparties * 2, 75)
    score += Math.min(data.onChainAge / 30, 75)
    score += 50

    // VeryChat identity signals
    if (data.veryChatSignals) {
      const vc = data.veryChatSignals
      // KYC level (0-3) → 0-80 points
      score += vc.kycLevel * 27
      // Account age → 0-40 points (max at 365 days)
      score += Math.min(vc.accountAge / 9, 40)
      // Verified email → 20 points
      if (vc.verifiedEmail) score += 20
      // Verified phone → 30 points
      if (vc.verifiedPhone) score += 30
      // Profile completeness → 30 points
      if (vc.profileComplete) score += 30
    }

    return Math.min(1000, Math.max(0, Math.round(score)))
  }

  private async getUserData(address: string, veryChatHandle?: string): Promise<UserData | null> {
    const user = await this.fetchUserFromSubgraph(address)

    // Fetch VeryChat signals if handle provided
    let veryChatSignals: VeryChatIdentitySignals | undefined
    if (veryChatHandle) {
      veryChatSignals = await this.fetchVeryChatSignals(veryChatHandle)
    }

    if (!user) {
      return { isVerified: false, badgeCount: 0, badgeTypes: [], accountAge: 0, transactionCount: 0, endorsementWeight: 0, endorsementCount: 0, uniqueCounterparties: 0, onChainAge: 0, veryChatSignals }
    }
    const accountAge = user.registeredAt
      ? Math.floor((Date.now() / 1000 - parseInt(user.registeredAt)) / 86400)
      : 0
    const badgeTypes = user.badges.map(b => b.badgeType)
    return {
      isVerified: user.badges.length > 0,
      badgeCount: user.badges.length,
      badgeTypes,
      accountAge,
      transactionCount: user.endorsementsReceived.length + user.endorsementsGiven.length,
      endorsementWeight: parseFloat(user.totalEndorsementWeight) / 1e18,
      endorsementCount: user.endorsementsReceived.filter(e => e.active).length,
      uniqueCounterparties: new Set([...user.endorsementsReceived.map(e => e.endorser.id), ...user.endorsementsGiven.map(e => e.endorsee.id)]).size,
      onChainAge: accountAge,
      veryChatSignals,
    }
  }

  private async fetchVeryChatSignals(handleId: string): Promise<VeryChatIdentitySignals | undefined> {
    try {
      const { verychatService } = await import('./verychat-service')
      return await verychatService.getIdentitySignals(handleId) || undefined
    } catch {
      return undefined
    }
  }

  private async fetchUserFromSubgraph(address: string): Promise<SubgraphUser | null> {
    const query = `{ user(id: "${address.toLowerCase()}") { id did scoreHash isPublic isOnchainRegistered registeredAt lastUpdated totalEndorsementWeight endorsementsReceived { id endorser { id } endorsee { id } endorsementType stakeAmount createdAt active } endorsementsGiven { id endorser { id } endorsee { id } endorsementType stakeAmount createdAt active } badges { badgeType mintedAt } } }`
    try {
      const response = await fetch(this.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) })
      if (!response.ok) return null
      const { data } = await response.json()
      return data?.user || null
    } catch { return null }
  }

  async getAllRegisteredUsers(limit = 50, skip = 0): Promise<{ users: SubgraphUser[]; total: number }> {
    const query = `{
      users(first: ${limit}, skip: ${skip}, orderBy: registeredAt, orderDirection: desc, where: { isOnchainRegistered: true }) {
        id did displayName scoreHash isPublic isOnchainRegistered registeredAt lastUpdated totalEndorsementWeight
        endorsementsReceived { id active }
        badges { badgeType mintedAt }
      }
    }`
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      if (!response.ok) return { users: [], total: 0 }
      const { data } = await response.json()
      return { users: data?.users || [], total: data?.users?.length || 0 }
    } catch {
      return { users: [], total: 0 }
    }
  }
}

export const shinroeService = new ShinroeService()
