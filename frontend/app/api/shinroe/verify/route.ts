// POST /api/shinroe/verify - Verify a claimed score against on-chain data
import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, isValidAddress } from '@/lib/api/validate-api-key'
import { shinroeService } from '@/lib/services/shinroe-service'

interface VerifyRequest { address: string; claimedScore: number; salt?: string }
interface VerifyResponse { verified: boolean; address: string; timestamp: number; error?: string }

const errorResponse = (address: string, error: string, status: number) =>
  NextResponse.json({ verified: false, address, timestamp: Date.now(), error }, { status })

export async function POST(request: NextRequest): Promise<NextResponse<VerifyResponse>> {
  const keyValidation = validateApiKey(request)
  if (!keyValidation.valid) {
    return errorResponse('', keyValidation.error!, 401)
  }

  let body: VerifyRequest
  try {
    body = await request.json()
  } catch {
    return errorResponse('', 'Invalid JSON body', 400)
  }

  const { address, claimedScore, salt = '' } = body

  if (!address || typeof claimedScore !== 'number') {
    return errorResponse(address || '', 'Missing required fields: address, claimedScore', 400)
  }
  if (!isValidAddress(address)) {
    return errorResponse(address, 'Invalid Ethereum address format', 400)
  }
  if (claimedScore < 0 || claimedScore > 1000) {
    return errorResponse(address, 'Score must be between 0 and 1000', 400)
  }

  try {
    const isVerified = await shinroeService.verifyScore(address, claimedScore, salt)
    return NextResponse.json({ verified: isVerified, address, timestamp: Date.now() })
  } catch (error) {
    console.error('Error verifying score:', error)
    return errorResponse(address, 'Internal server error', 500)
  }
}
