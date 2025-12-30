import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { polygonAmoy } from 'viem/chains'
import { BadgeType, BADGE_METADATA } from '@/lib/types/shinroe'
import contracts from '@/constants/contracts/80002/contracts'

// Badge image IPFS hashes - populated after upload
// These are stored in environment or uploaded via the setup script
const BADGE_IMAGE_HASHES: Record<BadgeType, string> = {
  [BadgeType.VERIFIED_IDENTITY]: process.env.BADGE_IMAGE_VERIFIED_IDENTITY || '',
  [BadgeType.TRUSTED_TRADER]: process.env.BADGE_IMAGE_TRUSTED_TRADER || '',
  [BadgeType.COMMUNITY_BUILDER]: process.env.BADGE_IMAGE_COMMUNITY_BUILDER || '',
  [BadgeType.EARLY_ADOPTER]: process.env.BADGE_IMAGE_EARLY_ADOPTER || '',
  [BadgeType.ELITE_SCORE]: process.env.BADGE_IMAGE_ELITE_SCORE || '',
}

// ABI for getBadgeType function
const BADGE_NFT_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'getBadgeType',
    outputs: [{ internalType: 'enum IBadgeNFT.BadgeType', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

const client = createPublicClient({
  chain: polygonAmoy,
  transport: http(process.env.NEXT_PUBLIC_AMOY_RPC_URL),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId: tokenIdStr } = await params
    const tokenId = BigInt(tokenIdStr)

    // Get badge type from contract
    const badgeType = await client.readContract({
      address: contracts.BadgeNFT.address as `0x${string}`,
      abi: BADGE_NFT_ABI,
      functionName: 'getBadgeType',
      args: [tokenId],
    })

    const badgeInfo = BADGE_METADATA[badgeType as BadgeType]
    if (!badgeInfo) {
      return NextResponse.json({ error: 'Invalid badge type' }, { status: 404 })
    }

    // Get the image hash for this badge type
    const imageHash = BADGE_IMAGE_HASHES[badgeType as BadgeType]
    const imageUrl = imageHash
      ? `ipfs://${imageHash}`
      : `${process.env.NEXT_PUBLIC_APP_URL}/badges/${getImageFileName(badgeType as BadgeType)}`

    // Build ERC721 metadata
    const metadata = {
      name: `${badgeInfo.name} #${tokenIdStr}`,
      description: badgeInfo.description,
      image: imageUrl,
      external_url: `${process.env.NEXT_PUBLIC_APP_URL}/verify`,
      attributes: [
        {
          trait_type: 'Badge Type',
          value: BadgeType[badgeType as BadgeType],
        },
        {
          trait_type: 'Badge Name',
          value: badgeInfo.name,
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
          value: 'No',
        },
        {
          display_type: 'string',
          trait_type: 'Token Type',
          value: 'Soulbound',
        },
      ],
    }

    return NextResponse.json(metadata, {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error fetching badge metadata:', error)

    // Check if it's a contract error (token doesn't exist)
    if (error instanceof Error && error.message.includes('revert')) {
      return NextResponse.json({ error: 'Token does not exist' }, { status: 404 })
    }

    return NextResponse.json(
      { error: 'Failed to fetch badge metadata' },
      { status: 500 }
    )
  }
}

function getImageFileName(badgeType: BadgeType): string {
  const fileNames: Record<BadgeType, string> = {
    [BadgeType.VERIFIED_IDENTITY]: 'verified-identity.png',
    [BadgeType.TRUSTED_TRADER]: 'trusted-trader.png',
    [BadgeType.COMMUNITY_BUILDER]: 'community-builder.png',
    [BadgeType.EARLY_ADOPTER]: 'early-adopter.png',
    [BadgeType.ELITE_SCORE]: 'elite-score.png',
  }
  return fileNames[badgeType]
}
