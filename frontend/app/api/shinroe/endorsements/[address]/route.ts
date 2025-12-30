// GET /api/shinroe/endorsements/[address]
// Returns endorsement data for an address
import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, isValidAddress } from '@/lib/api/validate-api-key'
import { shinroeService } from '@/lib/services/shinroe-service'

interface EndorsementsResponse {
  received: number
  given: number
  totalWeight: string
  endorsements: {
    type: string
    stake: string
    from: string
    createdAt: number
  }[]
  error?: string
  timestamp: number
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
): Promise<NextResponse<EndorsementsResponse>> {
  const { address } = await params

  // Validate API key for external requests
  const keyValidation = validateApiKey(request)
  if (!keyValidation.valid) {
    return NextResponse.json(
      {
        received: 0,
        given: 0,
        totalWeight: '0',
        endorsements: [],
        error: keyValidation.error,
        timestamp: Date.now(),
      },
      { status: 401 }
    )
  }

  // Validate address format
  if (!isValidAddress(address)) {
    return NextResponse.json(
      {
        received: 0,
        given: 0,
        totalWeight: '0',
        endorsements: [],
        error: 'Invalid Ethereum address format',
        timestamp: Date.now(),
      },
      { status: 400 }
    )
  }

  try {
    const data = await shinroeService.getEndorsements(address)

    const response = NextResponse.json({
      ...data,
      timestamp: Date.now(),
    })

    // Add rate limit headers if available
    if (keyValidation.rateLimit) {
      response.headers.set('X-RateLimit-Remaining', String(keyValidation.rateLimit.remaining))
      response.headers.set('X-RateLimit-Reset', String(keyValidation.rateLimit.resetAt))
    }

    return response
  } catch (error) {
    console.error('Error fetching endorsements:', error)
    return NextResponse.json(
      {
        received: 0,
        given: 0,
        totalWeight: '0',
        endorsements: [],
        error: 'Internal server error',
        timestamp: Date.now(),
      },
      { status: 500 }
    )
  }
}
