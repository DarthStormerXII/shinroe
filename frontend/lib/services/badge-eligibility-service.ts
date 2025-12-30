// Shared badge eligibility checking logic
// Used by both the eligibility API route and claim route
import { createPublicClient, http } from 'viem'
import { polygonAmoy } from 'viem/chains'
import { shinroeService } from './shinroe-service'
import { BadgeType } from '@/lib/types/shinroe'
import { getContractByName } from '@/constants/contracts'
import { getSubgraphUrl } from '@/lib/config/indexer'

const CHAIN_ID = 80002

export interface EligibilityCheck {
  badge: BadgeType
  eligible: boolean
  reason?: string
  progress?: { current: number; required: number }
}

// Check registration status directly from contract
export async function checkContractRegistration(address: string): Promise<boolean> {
  try {
    const contract = await getContractByName(CHAIN_ID, 'ScoreRegistry')
    if (!contract) return false

    const client = createPublicClient({
      chain: polygonAmoy,
      transport: http(),
    })

    const isRegistered = await client.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: 'isRegistered',
      args: [address as `0x${string}`],
    })

    return isRegistered as boolean
  } catch {
    return false
  }
}

// Fetch user data from subgraph
async function fetchUserDataForEligibility(address: string) {
  const query = `{
    user(id: "${address.toLowerCase()}") {
      id
      registeredAt
      badges { badgeType }
      endorsementsReceived(where: { active: true }) { id }
      endorsementsGiven(where: { active: true }) { id }
    }
  }`

  try {
    const response = await fetch(getSubgraphUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    if (!response.ok) return null
    const { data } = await response.json()
    return data?.user || null
  } catch {
    return null
  }
}

// Check if user has linked VeryChat
async function checkVeryChatLinked(address: string): Promise<boolean> {
  try {
    // Use internal logic instead of HTTP fetch to avoid ECONNREFUSED
    const { userMetadataService } = await import('./user-metadata-service')
    const metadata = await userMetadataService.getMetadata(address)
    return !!metadata?.veryChatHandle
  } catch {
    return false
  }
}

// Main eligibility check function
export async function checkAllBadgeEligibility(address: string): Promise<EligibilityCheck[]> {
  const [userData, score, endorsements, hasVeryChat, contractRegistered] = await Promise.all([
    fetchUserDataForEligibility(address),
    shinroeService.getScore(address),
    shinroeService.getEndorsements(address),
    checkVeryChatLinked(address),
    checkContractRegistration(address),
  ])

  const eligibility: EligibilityCheck[] = []

  // VERIFIED_IDENTITY (0) - Requires linked VeryChat account
  eligibility.push({
    badge: BadgeType.VERIFIED_IDENTITY,
    eligible: hasVeryChat,
    reason: hasVeryChat ? 'VeryChat account linked' : 'Link your VeryChat account to earn',
  })

  // TRUSTED_TRADER (1) - 50+ activities
  const activityCount = (userData?.endorsementsReceived?.length || 0) + (userData?.endorsementsGiven?.length || 0)
  const activityRequired = 50
  const traderEligible = activityCount >= activityRequired
  eligibility.push({
    badge: BadgeType.TRUSTED_TRADER,
    eligible: traderEligible,
    reason: traderEligible
      ? 'Activity threshold met'
      : `${activityRequired - activityCount} more activities needed`,
    progress: { current: activityCount, required: activityRequired },
  })

  // COMMUNITY_BUILDER (2) - 10+ endorsements given
  const endorsementsGiven = endorsements.given
  const endorsementsRequired = 10
  const builderEligible = endorsementsGiven >= endorsementsRequired
  eligibility.push({
    badge: BadgeType.COMMUNITY_BUILDER,
    eligible: builderEligible,
    reason: builderEligible
      ? 'Endorsement threshold met'
      : `${endorsementsRequired - endorsementsGiven} more endorsements needed`,
    progress: { current: endorsementsGiven, required: endorsementsRequired },
  })

  // EARLY_ADOPTER (3) - Registered within first 30 days
  const isRegisteredInSubgraph = !!userData?.registeredAt
  const isRegistered = isRegisteredInSubgraph || contractRegistered
  const registeredAt = userData?.registeredAt ? parseInt(userData.registeredAt) : Math.floor(Date.now() / 1000)
  const earlyAdopterCutoff = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
  const earlyAdopterEligible = isRegistered && registeredAt < earlyAdopterCutoff
  eligibility.push({
    badge: BadgeType.EARLY_ADOPTER,
    eligible: earlyAdopterEligible,
    reason: earlyAdopterEligible
      ? 'Early adopter status confirmed'
      : isRegistered ? 'Registration was after early adopter window' : 'Must be registered to qualify',
  })

  // ELITE_SCORE (4) - Score >= 850
  const userScore = score?.overall ?? 0
  const eliteThreshold = 850
  const eliteEligible = userScore >= eliteThreshold
  eligibility.push({
    badge: BadgeType.ELITE_SCORE,
    eligible: eliteEligible,
    reason: eliteEligible
      ? 'Elite score achieved'
      : `Need ${eliteThreshold - userScore} more points`,
    progress: { current: userScore, required: eliteThreshold },
  })

  return eligibility
}

// Check eligibility for a specific badge
export async function checkBadgeEligibility(address: string, badgeType: BadgeType): Promise<EligibilityCheck | null> {
  const allEligibility = await checkAllBadgeEligibility(address)
  return allEligibility.find((e) => e.badge === badgeType) || null
}
