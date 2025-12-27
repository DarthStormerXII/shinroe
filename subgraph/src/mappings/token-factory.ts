import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import { TokenCreated } from '../../generated/TokenFactory/TokenFactory'
import { Token, AirdropStats } from '../../generated/schema'
import { getOrCreateUser, getOrCreateAirdropStats } from './utils'

export function handleTokenCreated(event: TokenCreated): void {
  let tokenAddress = event.params.token.toHexString().toLowerCase()
  let creatorAddress = event.params.creator

  // Create or get user
  let creator = getOrCreateUser(creatorAddress, event.block.timestamp)

  // Create token entity
  let token = new Token(tokenAddress)
  token.creator = creator.id
  token.name = event.params.name
  token.symbol = event.params.symbol
  token.decimals = 18 // Default for LaunchToken
  token.totalSupply = event.params.totalSupply
  token.createdAt = event.block.timestamp
  token.createdTx = event.transaction.hash.toHexString()
  token.save()

  // Update airdrop stats
  let stats = getOrCreateAirdropStats()
  stats.totalTokensCreated = stats.totalTokensCreated + 1
  stats.save()
}
