// ============================================================================
// TEMPLATE: Subgraph Mapping
// Replace: Event names, entity names, field names
// ============================================================================

import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { Transfer as TransferEvent } from "../generated/Contract/Contract"
import { Transfer, Account, Stats, DailySnapshot } from "../generated/schema"

// Constants
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
const STATS_ID = "singleton"
const DAY_SECONDS = 86400

/**
 * Handle Transfer event
 */
export function handleTransfer(event: TransferEvent): void {
  // Create unique ID for transfer
  let id = event.transaction.hash.concatI32(event.logIndex.toI32())

  // Create immutable transfer record
  let transfer = new Transfer(id)
  transfer.from = event.params.from
  transfer.to = event.params.to
  transfer.amount = event.params.value
  transfer.timestamp = event.block.timestamp
  transfer.blockNumber = event.block.number
  transfer.transactionHash = event.transaction.hash
  transfer.save()

  // Update sender account (skip if mint from zero address)
  if (event.params.from.toHexString() != ZERO_ADDRESS) {
    updateAccount(event.params.from, event.params.value.neg(), event.block.timestamp)
  }

  // Update receiver account (skip if burn to zero address)
  if (event.params.to.toHexString() != ZERO_ADDRESS) {
    updateAccount(event.params.to, event.params.value, event.block.timestamp)
  }

  // Update global stats
  updateStats(event.params.value, event.block.number)

  // Update daily snapshot
  updateDailySnapshot(event.block.timestamp, event.params.value)
}

/**
 * Update or create account entity
 */
function updateAccount(address: Bytes, balanceChange: BigInt, timestamp: BigInt): void {
  let account = Account.load(address)

  if (!account) {
    account = new Account(address)
    account.balance = BigInt.zero()
    account.transferCount = 0
    account.firstSeen = timestamp
  }

  account.balance = account.balance.plus(balanceChange)
  account.transferCount = account.transferCount + 1
  account.lastActive = timestamp
  account.save()
}

/**
 * Update global statistics
 */
function updateStats(amount: BigInt, blockNumber: BigInt): void {
  let stats = Stats.load(STATS_ID)

  if (!stats) {
    stats = new Stats(STATS_ID)
    stats.totalTransfers = BigInt.zero()
    stats.totalVolume = BigInt.zero()
    stats.uniqueAccounts = 0
    stats.lastUpdatedBlock = BigInt.zero()
  }

  stats.totalTransfers = stats.totalTransfers.plus(BigInt.fromI32(1))
  stats.totalVolume = stats.totalVolume.plus(amount)
  stats.lastUpdatedBlock = blockNumber
  stats.save()
}

/**
 * Update daily snapshot for time-series data
 */
function updateDailySnapshot(timestamp: BigInt, amount: BigInt): void {
  // Calculate day ID (start of day timestamp)
  let dayTimestamp = timestamp.toI32() / DAY_SECONDS * DAY_SECONDS
  let dayId = dayTimestamp.toString()

  let snapshot = DailySnapshot.load(dayId)

  if (!snapshot) {
    snapshot = new DailySnapshot(dayId)
    snapshot.date = dayTimestamp
    snapshot.transferCount = 0
    snapshot.volume = BigInt.zero()
    snapshot.activeAccounts = 0
  }

  snapshot.transferCount = snapshot.transferCount + 1
  snapshot.volume = snapshot.volume.plus(amount)
  snapshot.save()
}
