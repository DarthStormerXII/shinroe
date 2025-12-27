import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import {
  EndorsementCreated,
  EndorsementWithdrawn,
  EndorsementSlashed
} from '../../generated/EndorsementVault/EndorsementVault'
import { Endorsement, EndorsementEvent } from '../../generated/schema'
import {
  getOrCreateUser,
  getOrCreateGlobalStats,
  getOrCreateDailyStats,
  createEventId
} from './utils'

// ============ Event Handlers ============

export function handleEndorsementCreated(event: EndorsementCreated): void {
  let endorserId = event.params.endorser.toHexString().toLowerCase()
  let endorseeId = event.params.endorsee.toHexString().toLowerCase()

  // Get or create users
  let endorser = getOrCreateUser(
    Bytes.fromHexString(endorserId),
    event.params.timestamp
  )
  let endorsee = getOrCreateUser(
    Bytes.fromHexString(endorseeId),
    event.params.timestamp
  )

  // Create endorsement entity
  let endorsementId = event.params.id.toString()
  let endorsement = new Endorsement(endorsementId)
  endorsement.endorser = endorser.id
  endorsement.endorsee = endorsee.id
  endorsement.endorsementType = event.params.endorsementType
  endorsement.stakeAmount = event.params.stakeAmount
  endorsement.createdAt = event.params.timestamp
  endorsement.active = true
  endorsement.withdrawnAt = null
  endorsement.save()

  // Update endorsee's total weight
  endorsee.totalEndorsementWeight = endorsee.totalEndorsementWeight.plus(
    event.params.stakeAmount
  )
  endorsee.save()

  // Create event log
  let eventId = createEventId(event)
  let endorsementEvent = new EndorsementEvent(eventId)
  endorsementEvent.endorsementId = event.params.id
  endorsementEvent.eventType = 'CREATED'
  endorsementEvent.endorser = event.params.endorser
  endorsementEvent.endorsee = event.params.endorsee
  endorsementEvent.endorsementType = event.params.endorsementType
  endorsementEvent.stakeAmount = event.params.stakeAmount
  endorsementEvent.returnedAmount = null
  endorsementEvent.slashedAmount = null
  endorsementEvent.timestamp = event.params.timestamp
  endorsementEvent.blockNumber = event.block.number
  endorsementEvent.transactionHash = event.transaction.hash
  endorsementEvent.save()

  // Update global stats
  let stats = getOrCreateGlobalStats()
  stats.totalEndorsements = stats.totalEndorsements.plus(BigInt.fromI32(1))
  stats.activeEndorsements = stats.activeEndorsements.plus(BigInt.fromI32(1))
  stats.totalStaked = stats.totalStaked.plus(event.params.stakeAmount)
  stats.lastUpdated = event.params.timestamp
  stats.save()

  // Update daily stats
  let dailyStats = getOrCreateDailyStats(event.params.timestamp)
  dailyStats.endorsementsCreated = dailyStats.endorsementsCreated.plus(
    BigInt.fromI32(1)
  )
  dailyStats.totalStaked = dailyStats.totalStaked.plus(event.params.stakeAmount)
  dailyStats.save()
}

export function handleEndorsementWithdrawn(event: EndorsementWithdrawn): void {
  let endorsementId = event.params.id.toString()
  let endorsement = Endorsement.load(endorsementId)

  if (endorsement) {
    endorsement.active = false
    endorsement.withdrawnAt = event.block.timestamp
    endorsement.save()

    // Update endorsee's total weight
    let endorseeId = endorsement.endorsee
    let endorsee = getOrCreateUser(
      Bytes.fromHexString(endorseeId),
      event.block.timestamp
    )
    endorsee.totalEndorsementWeight = endorsee.totalEndorsementWeight.minus(
      endorsement.stakeAmount
    )
    endorsee.save()

    // Update global stats
    let stats = getOrCreateGlobalStats()
    stats.activeEndorsements = stats.activeEndorsements.minus(BigInt.fromI32(1))
    stats.lastUpdated = event.block.timestamp
    stats.save()

    // Update daily stats
    let dailyStats = getOrCreateDailyStats(event.block.timestamp)
    dailyStats.endorsementsWithdrawn = dailyStats.endorsementsWithdrawn.plus(
      BigInt.fromI32(1)
    )
    dailyStats.save()
  }

  // Create event log
  let eventId = createEventId(event)
  let endorsementEvent = new EndorsementEvent(eventId)
  endorsementEvent.endorsementId = event.params.id
  endorsementEvent.eventType = 'WITHDRAWN'
  endorsementEvent.endorser = event.params.endorser
  endorsementEvent.endorsee = null
  endorsementEvent.endorsementType = null
  endorsementEvent.stakeAmount = null
  endorsementEvent.returnedAmount = event.params.returnedAmount
  endorsementEvent.slashedAmount = null
  endorsementEvent.timestamp = event.block.timestamp
  endorsementEvent.blockNumber = event.block.number
  endorsementEvent.transactionHash = event.transaction.hash
  endorsementEvent.save()
}

export function handleEndorsementSlashed(event: EndorsementSlashed): void {
  let endorsementId = event.params.id.toString()
  let endorsement = Endorsement.load(endorsementId)

  if (endorsement) {
    endorsement.active = false
    endorsement.withdrawnAt = event.block.timestamp
    endorsement.save()

    // Update endorsee's total weight
    let endorseeId = endorsement.endorsee
    let endorsee = getOrCreateUser(
      Bytes.fromHexString(endorseeId),
      event.block.timestamp
    )
    endorsee.totalEndorsementWeight = endorsee.totalEndorsementWeight.minus(
      endorsement.stakeAmount
    )
    endorsee.save()

    // Update global stats
    let stats = getOrCreateGlobalStats()
    stats.activeEndorsements = stats.activeEndorsements.minus(BigInt.fromI32(1))
    stats.lastUpdated = event.block.timestamp
    stats.save()
  }

  // Create event log
  let eventId = createEventId(event)
  let endorsementEvent = new EndorsementEvent(eventId)
  endorsementEvent.endorsementId = event.params.id
  endorsementEvent.eventType = 'SLASHED'
  endorsementEvent.endorser = null
  endorsementEvent.endorsee = null
  endorsementEvent.endorsementType = null
  endorsementEvent.stakeAmount = null
  endorsementEvent.returnedAmount = null
  endorsementEvent.slashedAmount = event.params.slashedAmount
  endorsementEvent.timestamp = event.block.timestamp
  endorsementEvent.blockNumber = event.block.number
  endorsementEvent.transactionHash = event.transaction.hash
  endorsementEvent.save()
}
