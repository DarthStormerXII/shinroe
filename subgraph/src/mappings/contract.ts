import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  Transfer as TransferEvent,
  Approval as ApprovalEvent
} from "../../generated/Contract/Contract"
import { Transfer, Approval, TokenHolder, DailyStats } from "../../generated/schema"

// Helper function to get day ID from timestamp
function getDayId(timestamp: BigInt): string {
  let dayTimestamp = timestamp.toI32() / 86400
  return dayTimestamp.toString()
}

// Helper function to get or create TokenHolder
function getOrCreateTokenHolder(address: Bytes, blockNumber: BigInt): TokenHolder {
  let holder = TokenHolder.load(address)
  if (holder == null) {
    holder = new TokenHolder(address)
    holder.balance = BigInt.fromI32(0)
    holder.transferCount = BigInt.fromI32(0)
    holder.firstTransferBlock = blockNumber
    holder.lastTransferBlock = blockNumber
  }
  return holder
}

// Helper function to get or create DailyStats
function getOrCreateDailyStats(timestamp: BigInt): DailyStats {
  let dayId = getDayId(timestamp)
  let stats = DailyStats.load(dayId)
  if (stats == null) {
    stats = new DailyStats(dayId)
    stats.date = timestamp
    stats.transferCount = BigInt.fromI32(0)
    stats.totalVolume = BigInt.fromI32(0)
    stats.uniqueUsers = BigInt.fromI32(0)
  }
  return stats
}

export function handleTransfer(event: TransferEvent): void {
  // Create Transfer entity
  let transfer = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  transfer.from = event.params.from
  transfer.to = event.params.to
  transfer.value = event.params.value
  transfer.blockNumber = event.block.number
  transfer.blockTimestamp = event.block.timestamp
  transfer.transactionHash = event.transaction.hash
  transfer.save()

  // Update sender TokenHolder
  let sender = getOrCreateTokenHolder(event.params.from, event.block.number)
  sender.balance = sender.balance.minus(event.params.value)
  sender.transferCount = sender.transferCount.plus(BigInt.fromI32(1))
  sender.lastTransferBlock = event.block.number
  sender.save()

  // Update receiver TokenHolder
  let receiver = getOrCreateTokenHolder(event.params.to, event.block.number)
  receiver.balance = receiver.balance.plus(event.params.value)
  receiver.transferCount = receiver.transferCount.plus(BigInt.fromI32(1))
  receiver.lastTransferBlock = event.block.number
  receiver.save()

  // Update DailyStats
  let stats = getOrCreateDailyStats(event.block.timestamp)
  stats.transferCount = stats.transferCount.plus(BigInt.fromI32(1))
  stats.totalVolume = stats.totalVolume.plus(event.params.value)
  stats.save()
}

export function handleApproval(event: ApprovalEvent): void {
  let approval = new Approval(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  approval.owner = event.params.owner
  approval.spender = event.params.spender
  approval.value = event.params.value
  approval.blockNumber = event.block.number
  approval.blockTimestamp = event.block.timestamp
  approval.transactionHash = event.transaction.hash
  approval.save()
}
