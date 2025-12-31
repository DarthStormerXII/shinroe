import { BadgeType, BADGE_METADATA } from '@/lib/types/shinroe'
import { pinJSONToIPFS, pinFileFromBuffer, formatIPFSUrl } from '@/lib/web3/pinata'
import fs from 'fs'
import path from 'path'

// ERC721 Metadata Standard
export interface BadgeNFTMetadata {
  name: string
  description: string
  image: string // ipfs:// URI
  external_url?: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
}

// Badge type to filename mapping
export const BADGE_FILE_NAMES: Record<BadgeType, string> = {
  [BadgeType.VERIFIED_IDENTITY]: 'verified-identity.png',
  [BadgeType.TRUSTED_TRADER]: 'trusted-trader.png',
  [BadgeType.COMMUNITY_BUILDER]: 'community-builder.png',
  [BadgeType.EARLY_ADOPTER]: 'early-adopter.png',
  [BadgeType.ELITE_SCORE]: 'elite-score.png',
}

// Result of uploading all badge metadata
export interface BadgeMetadataUploadResult {
  success: boolean
  baseUri: string // IPFS folder URI for all metadata
  imageHashes: Record<BadgeType, string>
  metadataHashes: Record<BadgeType, string>
  errors: string[]
}

/**
 * Upload a single badge image to IPFS
 */
export async function uploadBadgeImage(
  badgeType: BadgeType,
  imageBuffer: Buffer
): Promise<string> {
  const fileName = BADGE_FILE_NAMES[badgeType]
  const result = await pinFileFromBuffer(imageBuffer, fileName, 'image/png', {
    pinataMetadata: {
      name: `shinroe-badge-${badgeType}-image`,
      keyvalues: {
        project: 'shinroe',
        type: 'badge-image',
        badgeType: badgeType.toString(),
      },
    },
  })
  return result.IpfsHash
}

/**
 * Create and upload badge metadata JSON
 */
export async function uploadBadgeMetadata(
  badgeType: BadgeType,
  imageHash: string
): Promise<string> {
  const badgeInfo = BADGE_METADATA[badgeType]

  const metadata: BadgeNFTMetadata = {
    name: badgeInfo.name,
    description: badgeInfo.description,
    image: formatIPFSUrl(imageHash),
    external_url: 'https://shinroe.verychain.io',
    attributes: [
      {
        trait_type: 'Badge Type',
        value: BadgeType[badgeType],
      },
      {
        trait_type: 'Tier',
        value: badgeType === BadgeType.ELITE_SCORE ? 'Elite' : 'Standard',
      },
      {
        trait_type: 'Requirement',
        value: badgeInfo.requirement,
      },
      {
        trait_type: 'Transferable',
        value: 'No (Soulbound)',
      },
    ],
  }

  const result = await pinJSONToIPFS(metadata, {
    pinataMetadata: {
      name: `shinroe-badge-${badgeType}-metadata`,
      keyvalues: {
        project: 'shinroe',
        type: 'badge-metadata',
        badgeType: badgeType.toString(),
      },
    },
  })

  return result.IpfsHash
}

/**
 * Upload all badge images and metadata, returning the base URI
 * The base URI should be set on the BadgeNFT contract
 *
 * Token URI format: {baseURI}/{tokenId}
 * Since badges are minted by type, we create metadata for each badge type (0-4)
 */
export async function uploadAllBadgeMetadata(
  badgesDir: string
): Promise<BadgeMetadataUploadResult> {
  const errors: string[] = []
  const imageHashes: Record<number, string> = {}
  const metadataHashes: Record<number, string> = {}

  // Upload all badge images first
  for (const [badgeTypeStr, fileName] of Object.entries(BADGE_FILE_NAMES)) {
    const badgeType = parseInt(badgeTypeStr) as BadgeType
    const imagePath = path.join(badgesDir, fileName)

    try {
      if (!fs.existsSync(imagePath)) {
        errors.push(`Image not found: ${imagePath}`)
        continue
      }

      const imageBuffer = fs.readFileSync(imagePath)
      const imageHash = await uploadBadgeImage(badgeType, imageBuffer)
      imageHashes[badgeType] = imageHash
      console.log(`Uploaded image for badge ${badgeType}: ${imageHash}`)
    } catch (error) {
      errors.push(`Failed to upload image for badge ${badgeType}: ${error}`)
    }
  }

  // Upload metadata for each badge type
  for (const [badgeTypeStr, imageHash] of Object.entries(imageHashes)) {
    const badgeType = parseInt(badgeTypeStr) as BadgeType

    try {
      const metadataHash = await uploadBadgeMetadata(badgeType, imageHash)
      metadataHashes[badgeType] = metadataHash
      console.log(`Uploaded metadata for badge ${badgeType}: ${metadataHash}`)
    } catch (error) {
      errors.push(`Failed to upload metadata for badge ${badgeType}: ${error}`)
    }
  }

  // Create a folder structure for token URIs
  // We'll create metadata files named 0, 1, 2, 3, 4 in a folder
  // But since Pinata doesn't support folders easily, we'll use a different approach:
  // Each token's metadata should be at: baseURI/tokenId
  // Since tokenId is sequential but badge types are fixed, we need a lookup

  // Actually, the better approach is to store by badge type, not token ID
  // But ERC721's tokenURI expects tokenId...

  // For now, return the metadata hashes and let the API handle the lookup
  const baseUri = `ipfs://${Object.values(metadataHashes)[0]}`.replace(
    Object.values(metadataHashes)[0],
    'DYNAMIC' // Placeholder - actual implementation needs token lookup
  )

  return {
    success: errors.length === 0,
    baseUri,
    imageHashes: imageHashes as Record<BadgeType, string>,
    metadataHashes: metadataHashes as Record<BadgeType, string>,
    errors,
  }
}

/**
 * Get the metadata URI for a specific badge type
 */
export function getBadgeMetadataUri(
  metadataHashes: Record<BadgeType, string>,
  badgeType: BadgeType
): string {
  const hash = metadataHashes[badgeType]
  if (!hash) throw new Error(`No metadata hash for badge type ${badgeType}`)
  return formatIPFSUrl(hash)
}
