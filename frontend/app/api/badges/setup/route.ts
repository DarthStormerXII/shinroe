import { NextRequest, NextResponse } from 'next/server'
import { pinFileFromBuffer } from '@/lib/web3/pinata'
import { BadgeType, BADGE_METADATA } from '@/lib/types/shinroe'
import fs from 'fs'
import path from 'path'

// Badge type to filename mapping
const BADGE_FILE_NAMES: Record<BadgeType, string> = {
  [BadgeType.VERIFIED_IDENTITY]: 'verified-identity.png',
  [BadgeType.TRUSTED_TRADER]: 'trusted-trader.png',
  [BadgeType.COMMUNITY_BUILDER]: 'community-builder.png',
  [BadgeType.EARLY_ADOPTER]: 'early-adopter.png',
  [BadgeType.ELITE_SCORE]: 'elite-score.png',
}

export interface BadgeSetupResult {
  success: boolean
  imageHashes: Record<string, string>
  baseUri: string
  envVariables: string
  errors: string[]
}

/**
 * POST /api/badges/setup
 * Uploads all badge images to IPFS and returns configuration
 * This should be called once after deployment to set up badge metadata
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authorization (simple token check)
    const authHeader = request.headers.get('authorization')
    const adminToken = process.env.ADMIN_API_TOKEN

    if (adminToken && authHeader !== `Bearer ${adminToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const errors: string[] = []
    const imageHashes: Record<string, string> = {}

    // Path to badge images
    const badgesDir = path.join(process.cwd(), 'public', 'badges')

    // Upload each badge image
    for (const [badgeTypeStr, fileName] of Object.entries(BADGE_FILE_NAMES)) {
      const badgeType = parseInt(badgeTypeStr) as BadgeType
      const imagePath = path.join(badgesDir, fileName)

      try {
        if (!fs.existsSync(imagePath)) {
          errors.push(`Image not found: ${fileName}`)
          continue
        }

        const imageBuffer = fs.readFileSync(imagePath)
        const badgeInfo = BADGE_METADATA[badgeType]

        const result = await pinFileFromBuffer(imageBuffer, fileName, 'image/png', {
          pinataMetadata: {
            name: `shinroe-badge-${BadgeType[badgeType].toLowerCase()}`,
            keyvalues: {
              project: 'shinroe',
              type: 'badge-image',
              badgeType: badgeType.toString(),
              badgeName: badgeInfo.name,
            },
          },
          pinataOptions: {
            cidVersion: 1,
          },
        })

        imageHashes[BadgeType[badgeType]] = result.IpfsHash
        console.log(`Uploaded ${fileName}: ipfs://${result.IpfsHash}`)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        errors.push(`Failed to upload ${fileName}: ${message}`)
      }
    }

    // Generate environment variables for the hashes
    const envVariables = Object.entries(imageHashes)
      .map(([name, hash]) => `BADGE_IMAGE_${name}=${hash}`)
      .join('\n')

    // The baseURI should point to our metadata API
    const baseUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/badges/metadata/`

    const result: BadgeSetupResult = {
      success: errors.length === 0,
      imageHashes,
      baseUri,
      envVariables,
      errors,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Badge setup error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Badge setup failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/badges/setup
 * Returns current badge configuration status
 */
export async function GET() {
  const imageHashes: Record<string, string> = {
    VERIFIED_IDENTITY: process.env.BADGE_IMAGE_VERIFIED_IDENTITY || '',
    TRUSTED_TRADER: process.env.BADGE_IMAGE_TRUSTED_TRADER || '',
    COMMUNITY_BUILDER: process.env.BADGE_IMAGE_COMMUNITY_BUILDER || '',
    EARLY_ADOPTER: process.env.BADGE_IMAGE_EARLY_ADOPTER || '',
    ELITE_SCORE: process.env.BADGE_IMAGE_ELITE_SCORE || '',
  }

  const isConfigured = Object.values(imageHashes).every((hash) => hash !== '')
  const baseUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/badges/metadata/`

  return NextResponse.json({
    isConfigured,
    imageHashes,
    baseUri,
    instructions: isConfigured
      ? 'Badge metadata is configured. Set baseURI on BadgeNFT contract.'
      : 'Run POST /api/badges/setup to upload images to IPFS.',
  })
}
