import { NextRequest, NextResponse } from 'next/server'
import { verifyMessage, createPublicClient, http } from 'viem'
import { polygonAmoy } from 'viem/chains'
import { getContractByName } from '@/constants/contracts'

const LINK_MESSAGE_PREFIX = 'Link VeryChat account to wallet:\n'
const CHAIN_ID = 80002

// Check if user has VERIFIED_IDENTITY badge from contract
async function hasVerifiedIdentityBadge(address: string): Promise<boolean> {
  try {
    const contract = await getContractByName(CHAIN_ID, 'BadgeNFT')
    if (!contract) return false

    const client = createPublicClient({
      chain: polygonAmoy,
      transport: http(),
    })

    const hasBadge = await client.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: 'hasBadge',
      args: [address as `0x${string}`, 0], // BadgeType.VERIFIED_IDENTITY = 0
    })

    return hasBadge as boolean
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, veryChatHandle, signature } = await request.json()

    if (!walletAddress || !veryChatHandle || !signature) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const normalizedAddress = walletAddress.toLowerCase()
    const normalizedHandle = veryChatHandle.replace(/^@/, '').toLowerCase()

    // Verify the signature - check current and previous 2 minutes for timing tolerance
    const currentMinute = Math.floor(Date.now() / 60000)
    const timestampsToTry = [currentMinute, currentMinute - 1, currentMinute - 2]

    let isValid = false
    for (const ts of timestampsToTry) {
      const message = `${LINK_MESSAGE_PREFIX}Handle: ${normalizedHandle}\nWallet: ${normalizedAddress}\nTimestamp: ${ts}`
      try {
        isValid = await verifyMessage({
          address: walletAddress as `0x${string}`,
          message,
          signature: signature as `0x${string}`,
        })
        if (isValid) break
      } catch {
        // Continue to next timestamp
      }
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Signature verified - the badge will be minted by the frontend
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Link VeryChat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const walletAddress = searchParams.get('walletAddress')

  if (!walletAddress) {
    return NextResponse.json({ error: 'Missing walletAddress' }, { status: 400 })
  }

  // Check if user has VERIFIED_IDENTITY badge - that's the source of truth
  const hasBadge = await hasVerifiedIdentityBadge(walletAddress)

  return NextResponse.json({ linked: hasBadge })
}

export async function DELETE(request: NextRequest) {
  // Can't "unlink" - the badge is soulbound on-chain
  return NextResponse.json({
    error: 'Cannot unlink - Verified Identity badge is soulbound'
  }, { status: 400 })
}
