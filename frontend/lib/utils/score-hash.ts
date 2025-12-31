/**
 * Score Hash Utilities
 *
 * These utilities handle the creation and verification of score hashes
 * for the privacy-preserving reputation system.
 *
 * Hash format: keccak256(abi.encodePacked(user, score, salt))
 */

import { keccak256, encodePacked, type Address, type Hex } from 'viem'

// Salt version - increment if you need to invalidate all existing hashes
const SALT_VERSION = 'shinroe-salt-v1'

/**
 * Generate a deterministic salt for a user
 * This allows the salt to be regenerated without storing it
 */
export function generateSalt(userAddress: Address): Hex {
  return keccak256(
    encodePacked(['address', 'string'], [userAddress, SALT_VERSION])
  )
}

/**
 * Compute the score hash for on-chain storage
 * This is what gets stored in the ScoreRegistry contract
 */
export function computeScoreHash(
  userAddress: Address,
  score: number
): Hex {
  const salt = generateSalt(userAddress)
  return keccak256(
    encodePacked(['address', 'uint256', 'bytes32'], [userAddress, BigInt(score), salt])
  )
}

/**
 * Get the salt and score for claiming
 * Returns the values needed for the claim transaction
 */
export function getClaimParams(
  userAddress: Address,
  score: number
): { score: bigint; salt: Hex } {
  return {
    score: BigInt(score),
    salt: generateSalt(userAddress),
  }
}
