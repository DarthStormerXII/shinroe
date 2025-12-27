import { BigInt } from '@graphprotocol/graph-ts'
import {
  AirdropCreated,
  AirdropClaimed,
  AirdropCancelled,
  AirdropVault
} from '../../generated/AirdropVault/AirdropVault'
import { Airdrop, AirdropClaim, Token } from '../../generated/schema'
import { getOrCreateUser, getOrCreateAirdropStats } from './utils'

export function handleAirdropCreated(event: AirdropCreated): void {
  let airdropId = event.params.id.toString()
  let creatorAddress = event.params.creator
  let tokenAddress = event.params.token.toHexString().toLowerCase()

  // Bind contract to read airdrop data
  let contract = AirdropVault.bind(event.address)
  let airdropData = contract.getAirdrop(event.params.id)
  let criteriaData = contract.getAirdropCriteria(event.params.id)

  // Get or create user
  let creator = getOrCreateUser(creatorAddress, event.block.timestamp)

  // Load token (must exist from TokenFactory)
  let token = Token.load(tokenAddress)
  if (!token) {
    // Token created externally, create minimal entry
    token = new Token(tokenAddress)
    token.creator = creator.id
    token.name = 'Unknown'
    token.symbol = 'UNK'
    token.decimals = 18
    token.totalSupply = BigInt.zero()
    token.createdAt = event.block.timestamp
    token.createdTx = event.transaction.hash.toHexString()
    token.save()
  }

  // Create airdrop entity
  let airdrop = new Airdrop(airdropId)
  airdrop.creator = creator.id
  airdrop.token = tokenAddress
  airdrop.amountPerClaim = airdropData.getAmountPerClaim()
  airdrop.totalAmount = airdropData.getTotalAmount()
  airdrop.claimedAmount = BigInt.zero()
  airdrop.claimCount = 0
  airdrop.startTime = airdropData.getStartTime()
  airdrop.endTime = airdropData.getEndTime()
  airdrop.active = airdropData.getActive()
  airdrop.metadataUri = airdropData.getMetadataUri()
  airdrop.createdAt = event.block.timestamp

  // Eligibility criteria
  airdrop.minScore = criteriaData.getMinScore()
  airdrop.minEndorsementWeight = criteriaData.getMinEndorsementWeight()
  airdrop.requiresRegistration = criteriaData.getRequiresRegistration()

  // Convert BigInt[] to i32[]
  let requiredBadgesBigInt = criteriaData.getRequiredBadges()
  let requiredBadges: i32[] = []
  for (let i = 0; i < requiredBadgesBigInt.length; i++) {
    requiredBadges.push(requiredBadgesBigInt[i].toI32())
  }
  airdrop.requiredBadges = requiredBadges

  airdrop.save()

  // Update stats
  let stats = getOrCreateAirdropStats()
  stats.totalAirdrops = stats.totalAirdrops + 1
  stats.activeAirdrops = stats.activeAirdrops + 1
  stats.save()
}

export function handleAirdropClaimed(event: AirdropClaimed): void {
  let airdropId = event.params.id.toString()
  let claimerAddress = event.params.claimer
  let claimId = airdropId + '-' + claimerAddress.toHexString().toLowerCase()

  // Get or create user
  let claimer = getOrCreateUser(claimerAddress, event.block.timestamp)

  // Create claim entity
  let claim = new AirdropClaim(claimId)
  claim.airdrop = airdropId
  claim.claimer = claimer.id
  claim.amount = event.params.amount
  claim.claimedAt = event.block.timestamp
  claim.txHash = event.transaction.hash.toHexString()
  claim.save()

  // Update airdrop
  let airdrop = Airdrop.load(airdropId)
  if (airdrop) {
    airdrop.claimedAmount = airdrop.claimedAmount.plus(event.params.amount)
    airdrop.claimCount = airdrop.claimCount + 1
    airdrop.save()
  }

  // Update stats
  let stats = getOrCreateAirdropStats()
  stats.totalClaimsCount = stats.totalClaimsCount + 1
  stats.totalValueDistributed = stats.totalValueDistributed.plus(event.params.amount)
  stats.save()
}

export function handleAirdropCancelled(event: AirdropCancelled): void {
  let airdropId = event.params.id.toString()

  let airdrop = Airdrop.load(airdropId)
  if (airdrop) {
    airdrop.active = false
    airdrop.cancelledAt = event.block.timestamp
    airdrop.save()
  }

  // Update stats
  let stats = getOrCreateAirdropStats()
  stats.activeAirdrops = stats.activeAirdrops - 1
  stats.save()
}
