import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import {
  BadgeMinted,
  BadgeRevoked
} from '../../generated/BadgeNFT/BadgeNFT'
import { UserBadge, BadgeEvent } from '../../generated/schema'
import {
  getOrCreateUser,
  getOrCreateGlobalStats,
  getOrCreateDailyStats,
  createEventId
} from './utils'

// ============ Event Handlers ============

export function handleBadgeMinted(event: BadgeMinted): void {
  let userAddress = event.params.user
  let userId = userAddress.toHexString().toLowerCase()

  // Get or create user
  let user = getOrCreateUser(
    Bytes.fromHexString(userId),
    event.block.timestamp
  )

  // Create user badge entity
  let badgeId = userId + '-' + event.params.badgeType.toString()
  let userBadge = new UserBadge(badgeId)
  userBadge.user = user.id
  userBadge.badgeType = event.params.badgeType
  userBadge.tokenId = event.params.tokenId
  userBadge.mintedAt = event.block.timestamp
  userBadge.active = true
  userBadge.revokedAt = null
  userBadge.save()

  // Create event log
  let eventId = createEventId(event)
  let badgeEvent = new BadgeEvent(eventId)
  badgeEvent.user = event.params.user
  badgeEvent.badgeType = event.params.badgeType
  badgeEvent.tokenId = event.params.tokenId
  badgeEvent.eventType = 'MINTED'
  badgeEvent.timestamp = event.block.timestamp
  badgeEvent.blockNumber = event.block.number
  badgeEvent.transactionHash = event.transaction.hash
  badgeEvent.save()

  // Update global stats
  let stats = getOrCreateGlobalStats()
  stats.totalBadgesMinted = stats.totalBadgesMinted.plus(BigInt.fromI32(1))
  stats.lastUpdated = event.block.timestamp
  stats.save()

  // Update daily stats
  let dailyStats = getOrCreateDailyStats(event.block.timestamp)
  dailyStats.badgesMinted = dailyStats.badgesMinted.plus(BigInt.fromI32(1))
  dailyStats.save()
}

export function handleBadgeRevoked(event: BadgeRevoked): void {
  let userAddress = event.params.user
  let userId = userAddress.toHexString().toLowerCase()

  // Load and update user badge
  let badgeId = userId + '-' + event.params.badgeType.toString()
  let userBadge = UserBadge.load(badgeId)

  if (userBadge) {
    userBadge.active = false
    userBadge.revokedAt = event.block.timestamp
    userBadge.save()
  }

  // Create event log
  let eventId = createEventId(event)
  let badgeEvent = new BadgeEvent(eventId)
  badgeEvent.user = event.params.user
  badgeEvent.badgeType = event.params.badgeType
  badgeEvent.tokenId = event.params.tokenId
  badgeEvent.eventType = 'REVOKED'
  badgeEvent.timestamp = event.block.timestamp
  badgeEvent.blockNumber = event.block.number
  badgeEvent.transactionHash = event.transaction.hash
  badgeEvent.save()
}
