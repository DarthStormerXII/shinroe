import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import {
  ScoreRegistered,
  ScoreUpdated,
  VisibilityChanged,
  ProfileUpdated
} from '../../generated/ScoreRegistry/ScoreRegistry'
import { User, ScoreUpdate, ProfileUpdate as ProfileUpdateEntity, DIDMapping } from '../../generated/schema'
import {
  getOrCreateUser,
  getOrCreateGlobalStats,
  getOrCreateDailyStats,
  createEventId,
  getOrCreateDIDMapping,
  DID_PREFIX
} from './utils'

// ============ Event Handlers ============

export function handleScoreRegistered(event: ScoreRegistered): void {
  let userAddress = event.params.user
  let userId = userAddress.toHexString().toLowerCase()
  let user = getOrCreateUser(
    Bytes.fromHexString(userAddress.toHexString()),
    event.params.timestamp
  )

  // Mark as on-chain registered
  user.isOnchainRegistered = true
  user.scoreHash = event.params.scoreHash
  user.registeredAt = event.params.timestamp
  user.lastUpdated = event.params.timestamp

  // Set DID if not already set
  if (!user.did) {
    user.did = DID_PREFIX + userId
  }
  user.save()

  // Create or update DID mapping
  let didMapping = getOrCreateDIDMapping(userId, event.block.timestamp, true)
  didMapping.registeredOnchain = true
  didMapping.save()

  // Create score update event log
  let eventId = createEventId(event)
  let scoreUpdate = new ScoreUpdate(eventId)
  scoreUpdate.user = user.id
  scoreUpdate.oldHash = null
  scoreUpdate.newHash = event.params.scoreHash
  scoreUpdate.timestamp = event.params.timestamp
  scoreUpdate.blockNumber = event.block.number
  scoreUpdate.transactionHash = event.transaction.hash
  scoreUpdate.save()
}

export function handleScoreUpdated(event: ScoreUpdated): void {
  let userAddress = event.params.user
  let userId = userAddress.toHexString()
  let user = User.load(userId)

  if (!user) {
    user = getOrCreateUser(
      Bytes.fromHexString(userAddress.toHexString()),
      event.params.timestamp
    )
  }

  user.scoreHash = event.params.newHash
  user.lastUpdated = event.params.timestamp
  user.save()

  // Create score update event log
  let eventId = createEventId(event)
  let scoreUpdate = new ScoreUpdate(eventId)
  scoreUpdate.user = user.id
  scoreUpdate.oldHash = event.params.oldHash
  scoreUpdate.newHash = event.params.newHash
  scoreUpdate.timestamp = event.params.timestamp
  scoreUpdate.blockNumber = event.block.number
  scoreUpdate.transactionHash = event.transaction.hash
  scoreUpdate.save()
}

export function handleVisibilityChanged(event: VisibilityChanged): void {
  let userAddress = event.params.user
  let userId = userAddress.toHexString()
  let user = User.load(userId)

  if (!user) {
    user = getOrCreateUser(
      Bytes.fromHexString(userAddress.toHexString()),
      event.block.timestamp
    )
  }

  user.isPublic = event.params.isPublic
  user.lastUpdated = event.block.timestamp
  user.save()
}

export function handleProfileUpdated(event: ProfileUpdated): void {
  let userAddress = event.params.user
  let userId = userAddress.toHexString()
  let user = User.load(userId)

  if (!user) {
    user = getOrCreateUser(
      Bytes.fromHexString(userAddress.toHexString()),
      event.block.timestamp
    )
  }

  user.profileUri = event.params.profileUri
  user.lastUpdated = event.block.timestamp
  user.save()

  // Create profile update event log
  let eventId = createEventId(event)
  let profileUpdate = new ProfileUpdateEntity(eventId)
  profileUpdate.user = user.id
  profileUpdate.profileUri = event.params.profileUri
  profileUpdate.timestamp = event.block.timestamp
  profileUpdate.blockNumber = event.block.number
  profileUpdate.transactionHash = event.transaction.hash
  profileUpdate.save()
}
