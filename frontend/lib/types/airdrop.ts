// Airdrop System Types
import type { Address } from 'viem'

export interface EligibilityCriteria {
  minScore: number
  requiredBadges: number[]
  minEndorsementWeight: bigint
  requiresRegistration: boolean
}

export interface TokenInfo {
  address: Address
  name: string
  symbol: string
  decimals: number
  totalSupply: bigint
}

export interface Airdrop {
  id: string
  creator: Address
  token: TokenInfo
  amountPerClaim: bigint
  totalAmount: bigint
  claimedAmount: bigint
  claimCount: number
  startTime: number
  endTime: number
  active: boolean
  metadataUri: string
  criteria: EligibilityCriteria
  createdAt: number
  cancelledAt?: number

  // Parsed metadata (fetched from IPFS)
  name?: string
  description?: string
  image?: string
}

export interface AirdropClaim {
  id: string
  airdropId: string
  claimer: Address
  amount: bigint
  claimedAt: number
  txHash: string
}

export type AirdropStatus = 'upcoming' | 'active' | 'ended' | 'exhausted' | 'cancelled'

export interface AirdropStats {
  totalAirdrops: number
  activeAirdrops: number
  totalTokensCreated: number
  totalClaimsCount: number
  totalValueDistributed: bigint
}

export interface AirdropMetadata {
  name: string
  description: string
  image?: string
}

export interface EligibilityResult {
  eligible: boolean
  reasons: string[]
  userScore?: number
  userBadges?: number[]
  userEndorsementWeight?: bigint
  isRegistered?: boolean
}

export function getAirdropStatus(airdrop: Airdrop): AirdropStatus {
  const now = Math.floor(Date.now() / 1000)

  if (airdrop.cancelledAt) return 'cancelled'
  if (!airdrop.active) return 'cancelled'
  if (now < airdrop.startTime) return 'upcoming'
  if (now > airdrop.endTime) return 'ended'
  if (airdrop.claimedAmount >= airdrop.totalAmount) return 'exhausted'
  return 'active'
}

export const AIRDROP_STATUS_CONFIG: Record<AirdropStatus, { label: string; color: string }> = {
  upcoming: { label: 'Upcoming', color: '#d4a800' },
  active: { label: 'Active', color: '#4be15a' },
  ended: { label: 'Ended', color: '#a0a4a9' },
  exhausted: { label: 'Exhausted', color: '#ff6d75' },
  cancelled: { label: 'Cancelled', color: '#f72349' },
}
