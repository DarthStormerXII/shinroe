// Shinroe Score Types
import type { Address } from 'viem'

export type ScoreTier = 'elite' | 'excellent' | 'good' | 'building' | 'at_risk'

// Badge Types - matches contract enum (0-4)
export enum BadgeType {
  VERIFIED_IDENTITY = 0,
  TRUSTED_TRADER = 1,
  COMMUNITY_BUILDER = 2,
  EARLY_ADOPTER = 3,
  ELITE_SCORE = 4,
}

export interface Badge {
  badgeType: BadgeType
  tokenId?: bigint
  mintedAt?: number
}

export interface BadgeInfo {
  name: string
  description: string
  image: string
  color: string
  requirement: string
}

export const BADGE_METADATA: Record<BadgeType, BadgeInfo> = {
  [BadgeType.VERIFIED_IDENTITY]: {
    name: 'Verified Member',
    description: 'Your identity has been verified',
    image: '/badges/verified-identity.png',
    color: '#7c60fd',
    requirement: 'Verify your identity',
  },
  [BadgeType.TRUSTED_TRADER]: {
    name: 'Power User',
    description: 'You are an active member of the community',
    image: '/badges/trusted-trader.png',
    color: '#10b981',
    requirement: 'Complete 50 activities',
  },
  [BadgeType.COMMUNITY_BUILDER]: {
    name: 'Social Star',
    description: 'You help others in the community',
    image: '/badges/community-builder.png',
    color: '#ff6d75',
    requirement: 'Help 10+ friends',
  },
  [BadgeType.EARLY_ADOPTER]: {
    name: 'Founding Member',
    description: 'You joined during launch',
    image: '/badges/early-adopter.png',
    color: '#feea46',
    requirement: 'Join within first 30 days',
  },
  [BadgeType.ELITE_SCORE]: {
    name: 'VIP',
    description: 'You have achieved top-tier status',
    image: '/badges/elite-score.png',
    color: '#7c60fd',
    requirement: 'Reach VIP status',
  },
}

export const ALL_BADGE_TYPES = [
  BadgeType.VERIFIED_IDENTITY,
  BadgeType.TRUSTED_TRADER,
  BadgeType.COMMUNITY_BUILDER,
  BadgeType.EARLY_ADOPTER,
  BadgeType.ELITE_SCORE,
] as const

// Public user profile for verification lookup
export interface PublicUserProfile {
  address: Address
  score?: number
  tier?: ScoreTier
  isPublic: boolean
  badges: Badge[]
  endorsementCount: number
  registeredAt: number
}

// Endorsement Types
export type EndorsementType = 'general' | 'financial' | 'professional'

export interface Endorsement {
  id: string
  endorser: Address
  endorsee: Address
  endorsementType: EndorsementType
  stakeAmount: bigint
  createdAt: number
  active: boolean
}

export interface EndorsementWithUser extends Endorsement {
  user: Address // The other party (endorser for received, endorsee for given)
  displayName?: string | null // Display name of the other party (from metadata service)
}

export const ENDORSEMENT_TYPES: Record<EndorsementType, { label: string; color: string; value: number }> = {
  general: { label: 'General', color: '#7c60fd', value: 0 },
  financial: { label: 'Financial', color: '#4be15a', value: 1 },
  professional: { label: 'Professional', color: '#feea46', value: 2 },
}

export const MIN_ENDORSEMENT_STAKE = BigInt('10000000000000000') // 0.01 ETH

export function calculateDecayedWeight(stake: bigint, createdAt: number): bigint {
  const monthsOld = (Date.now() / 1000 - createdAt) / (30 * 24 * 60 * 60)
  if (monthsOld <= 6) return stake
  const decayMonths = Math.floor(monthsOld - 6)
  const decayFactor = Math.pow(0.9, decayMonths) // 10% decay per month
  return BigInt(Math.floor(Number(stake) * decayFactor))
}

export function getEndorsementTypeFromValue(value: number): EndorsementType {
  if (value === 1) return 'financial'
  if (value === 2) return 'professional'
  return 'general'
}

export interface UserScore {
  overall: number
  identity: number
  financial: number
  social: number
  transactional: number
  behavioral: number
  tier: ScoreTier
  trend: number // change from last month
}

export interface ScoreHistoryPoint {
  timestamp: number
  score: number
}

export interface ScoreCategory {
  name: string
  key: keyof Omit<UserScore, 'overall' | 'tier' | 'trend'>
  weight: number // percentage weight
  description: string
}

export const SCORE_CATEGORIES: ScoreCategory[] = [
  { name: 'Identity', key: 'identity', weight: 20, description: 'Verified accounts and credentials' },
  { name: 'Financial', key: 'financial', weight: 25, description: 'Asset holdings and DeFi activity' },
  { name: 'Social', key: 'social', weight: 20, description: 'Community engagement and endorsements' },
  { name: 'Transactional', key: 'transactional', weight: 25, description: 'On-chain transaction history' },
  { name: 'Behavioral', key: 'behavioral', weight: 10, description: 'Wallet age and consistency' },
]

export const TIER_CONFIG: Record<ScoreTier, { label: string; min: number; color: string }> = {
  elite: { label: 'Elite', min: 850, color: '#7c60fd' },
  excellent: { label: 'Excellent', min: 750, color: '#4be15a' },
  good: { label: 'Good', min: 650, color: '#feea46' },
  building: { label: 'Building', min: 500, color: '#ff6d75' },
  at_risk: { label: 'At Risk', min: 0, color: '#f72349' },
}

export function getTierFromScore(score: number): ScoreTier {
  if (score >= 850) return 'elite'
  if (score >= 750) return 'excellent'
  if (score >= 650) return 'good'
  if (score >= 500) return 'building'
  return 'at_risk'
}

// Registered user for search/selection
export interface RegisteredUser {
  address: Address
  displayName: string | null
  badges: number[]
  totalEndorsementWeight: bigint
}

// User selector component props
export interface UserSelectorProps {
  selectedUser: RegisteredUser | null
  onSelectUser: (user: RegisteredUser | null) => void
  currentUserAddress?: Address
  disabled?: boolean
}
