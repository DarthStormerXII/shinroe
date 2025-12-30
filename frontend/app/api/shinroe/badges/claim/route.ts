// POST /api/shinroe/badges/claim
// Claims a badge for an eligible user
import { NextRequest, NextResponse } from 'next/server'
import { createWalletClient, createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { polygonAmoy } from 'viem/chains'
import { isValidAddress } from '@/lib/api/validate-api-key'
import { BadgeType, ALL_BADGE_TYPES } from '@/lib/types/shinroe'
import { getContractByName } from '@/constants/contracts'
import { checkBadgeEligibility } from '@/lib/services/badge-eligibility-service'

interface ClaimRequest {
  address: string
  badgeType: BadgeType
}

interface ClaimResponse {
  success: boolean
  txHash?: string
  error?: string
}

const CHAIN_ID = 80002 // Polygon Amoy

export async function POST(request: NextRequest): Promise<NextResponse<ClaimResponse>> {
  try {
    const body: ClaimRequest = await request.json()
    const { address, badgeType } = body

    // Validate address
    if (!address || !isValidAddress(address)) {
      return NextResponse.json(
        { success: false, error: 'Invalid address' },
        { status: 400 }
      )
    }

    // Validate badge type
    if (!ALL_BADGE_TYPES.includes(badgeType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid badge type' },
        { status: 400 }
      )
    }

    // Check eligibility using shared service (no HTTP fetch)
    const badgeEligibility = await checkBadgeEligibility(address, badgeType)

    if (!badgeEligibility?.eligible) {
      return NextResponse.json(
        { success: false, error: badgeEligibility?.reason || 'Not eligible' },
        { status: 403 }
      )
    }

    // Get contract
    const contract = await getContractByName(CHAIN_ID, 'BadgeNFT')
    if (!contract) {
      return NextResponse.json(
        { success: false, error: 'Contract not found' },
        { status: 500 }
      )
    }

    // Check if already has badge
    const publicClient = createPublicClient({
      chain: polygonAmoy,
      transport: http(),
    })

    const hasBadge = await publicClient.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: 'hasBadge',
      args: [address as `0x${string}`, badgeType],
    })

    if (hasBadge) {
      return NextResponse.json(
        { success: false, error: 'Badge already owned' },
        { status: 400 }
      )
    }

    // Create wallet client with minter private key
    const minterKey = process.env.BADGE_MINTER_PRIVATE_KEY
    if (!minterKey) {
      return NextResponse.json(
        { success: false, error: 'Minter not configured' },
        { status: 500 }
      )
    }

    const account = privateKeyToAccount(minterKey as `0x${string}`)
    const walletClient = createWalletClient({
      account,
      chain: polygonAmoy,
      transport: http(),
    })

    // Check if account is a minter
    const isMinter = await publicClient.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: 'isMinter',
      args: [account.address],
    })

    if (!isMinter) {
      return NextResponse.json(
        { success: false, error: 'Backend not authorized as minter' },
        { status: 500 }
      )
    }

    // Mint the badge
    const txHash = await walletClient.writeContract({
      address: contract.address,
      abi: contract.abi,
      functionName: 'mintBadge',
      args: [address as `0x${string}`, badgeType],
    })

    return NextResponse.json({
      success: true,
      txHash,
    })
  } catch (error) {
    console.error('Error claiming badge:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to claim badge' },
      { status: 500 }
    )
  }
}
