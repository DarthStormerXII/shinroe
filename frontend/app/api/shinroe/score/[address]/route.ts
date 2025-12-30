// GET /api/shinroe/score/[address]
// Returns Shinroe score for an address
import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, isValidAddress, apiError } from '@/lib/api/validate-api-key'
import { shinroeService } from '@/lib/services/shinroe-service'
import type { ScoreTier } from '@/lib/types/shinroe'

interface ScoreResponse {
  address: string
  overall?: number
  identity?: number
  financial?: number
  social?: number
  transactional?: number
  behavioral?: number
  tier?: ScoreTier
  trend?: number
  verified: boolean
  timestamp: number
  isPublic?: boolean
  veryChatLinked?: boolean
  error?: string
}

// In-memory store reference (matches link-verychat route)
// In production, use shared storage like Redis or database
async function getVeryChatHandle(address: string): Promise<string | undefined> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/shinroe/link-verychat?walletAddress=${address}`)
    if (!res.ok) return undefined
    const data = await res.json()
    return data.linked ? data.mapping?.veryChatHandle : undefined
  } catch {
    return undefined
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
): Promise<NextResponse<ScoreResponse>> {
  const { address } = await params

  // Validate API key for external requests
  const keyValidation = validateApiKey(request)
  if (!keyValidation.valid) {
    return NextResponse.json(
      {
        address,
        verified: false,
        timestamp: Date.now(),
        error: keyValidation.error,
      },
      { status: 401 }
    )
  }

  // Validate address format
  if (!isValidAddress(address)) {
    return NextResponse.json(
      {
        address,
        verified: false,
        timestamp: Date.now(),
        error: 'Invalid Ethereum address format',
      },
      { status: 400 }
    )
  }

  try {
    // Look up linked VeryChat handle
    const veryChatHandle = await getVeryChatHandle(address)
    const score = await shinroeService.getScore(address, veryChatHandle)

    if (!score) {
      return NextResponse.json(
        {
          address,
          verified: false,
          timestamp: Date.now(),
          error: 'No score found for this address',
        },
        { status: 404 }
      )
    }

    // Build response with all score components
    const response = NextResponse.json({
      address,
      overall: score.overall,
      identity: score.identity,
      financial: score.financial,
      social: score.social,
      transactional: score.transactional,
      behavioral: score.behavioral,
      tier: score.tier,
      trend: score.trend,
      verified: true,
      timestamp: Date.now(),
      isPublic: true,
      veryChatLinked: !!veryChatHandle,
    })

    // Add rate limit headers if available
    if (keyValidation.rateLimit) {
      response.headers.set('X-RateLimit-Remaining', String(keyValidation.rateLimit.remaining))
      response.headers.set('X-RateLimit-Reset', String(keyValidation.rateLimit.resetAt))
    }

    return response
  } catch (error) {
    console.error('Error fetching score:', error)
    return NextResponse.json(
      {
        address,
        verified: false,
        timestamp: Date.now(),
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
