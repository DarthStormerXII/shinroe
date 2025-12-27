import { BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { User, GlobalStats, DailyStats, DIDMapping, AirdropStats } from '../../generated/schema'

// ============ DID Constants ============

export const DID_PREFIX = 'did:ethr:verychain:'

// ============ Constants ============

const GLOBAL_STATS_ID = 'global'
const SECONDS_PER_DAY = 86400

// ============ User Helpers ============

export function getOrCreateUser(address: Bytes, timestamp: BigInt): User {
  let id = address.toHexString().toLowerCase()
  let user = User.load(id)

  if (!user) {
    user = new User(id)
    user.did = DID_PREFIX + id
    user.scoreHash = null
    user.isPublic = false
    user.registeredAt = null // Not on-chain registered yet
    user.lastUpdated = timestamp
    user.totalEndorsementWeight = BigInt.zero()
    user.isOnchainRegistered = false
    user.save()

    // Update global stats
    let stats = getOrCreateGlobalStats()
    stats.totalUsers = stats.totalUsers.plus(BigInt.fromI32(1))
    stats.lastUpdated = timestamp
    stats.save()

    // Update daily stats
    let dailyStats = getOrCreateDailyStats(timestamp)
    dailyStats.newUsers = dailyStats.newUsers.plus(BigInt.fromI32(1))
    dailyStats.save()
  }

  return user
}

// ============ DID Helpers ============

export function getOrCreateDIDMapping(
  address: string,
  timestamp: BigInt,
  registeredOnchain: boolean
): DIDMapping {
  let did = DID_PREFIX + address
  let mapping = DIDMapping.load(did)

  if (!mapping) {
    mapping = new DIDMapping(did)
    mapping.address = address
    mapping.registeredOnchain = registeredOnchain
    mapping.createdAt = timestamp
    mapping.save()
  }

  return mapping
}

// ============ Global Stats Helpers ============

export function getOrCreateGlobalStats(): GlobalStats {
  let stats = GlobalStats.load(GLOBAL_STATS_ID)

  if (!stats) {
    stats = new GlobalStats(GLOBAL_STATS_ID)
    stats.totalUsers = BigInt.zero()
    stats.totalEndorsements = BigInt.zero()
    stats.activeEndorsements = BigInt.zero()
    stats.totalBadgesMinted = BigInt.zero()
    stats.totalStaked = BigInt.zero()
    stats.lastUpdated = BigInt.zero()
    stats.save()
  }

  return stats
}

// ============ Daily Stats Helpers ============

export function getOrCreateDailyStats(timestamp: BigInt): DailyStats {
  let dayTimestamp = timestamp.div(BigInt.fromI32(SECONDS_PER_DAY))
    .times(BigInt.fromI32(SECONDS_PER_DAY))
  let id = dayTimestamp.toString()

  let stats = DailyStats.load(id)

  if (!stats) {
    stats = new DailyStats(id)
    stats.date = dayTimestamp
    stats.newUsers = BigInt.zero()
    stats.endorsementsCreated = BigInt.zero()
    stats.endorsementsWithdrawn = BigInt.zero()
    stats.totalStaked = BigInt.zero()
    stats.badgesMinted = BigInt.zero()
    stats.save()
  }

  return stats
}

// ============ ID Helpers ============

export function createEventId(event: ethereum.Event): Bytes {
  return event.transaction.hash.concatI32(event.logIndex.toI32())
}

// ============ Airdrop Stats Helpers ============

const AIRDROP_STATS_ID = 'global'

export function getOrCreateAirdropStats(): AirdropStats {
  let stats = AirdropStats.load(AIRDROP_STATS_ID)

  if (!stats) {
    stats = new AirdropStats(AIRDROP_STATS_ID)
    stats.totalAirdrops = 0
    stats.activeAirdrops = 0
    stats.totalTokensCreated = 0
    stats.totalClaimsCount = 0
    stats.totalValueDistributed = BigInt.zero()
    stats.save()
  }

  return stats
}
