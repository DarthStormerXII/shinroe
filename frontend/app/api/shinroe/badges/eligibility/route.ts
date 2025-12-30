// GET /api/shinroe/badges/eligibility?address=0x...
// Returns eligibility status for all badges
import { NextRequest, NextResponse } from 'next/server'
import { isValidAddress } from '@/lib/api/validate-api-key'
import { checkAllBadgeEligibility, type EligibilityCheck } from '@/lib/services/badge-eligibility-service'

interface EligibilityResponse {
  address: string
  eligibility: EligibilityCheck[]
  error?: string
}

export async function GET(request: NextRequest): Promise<NextResponse<EligibilityResponse>> {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address || !isValidAddress(address)) {
    return NextResponse.json(
      { address: address || '', eligibility: [], error: 'Invalid address' },
      { status: 400 }
    )
  }

  try {
    const eligibility = await checkAllBadgeEligibility(address)

    return NextResponse.json({
      address,
      eligibility,
    })
  } catch (error) {
    console.error('Error checking badge eligibility:', error)
    return NextResponse.json(
      { address, eligibility: [], error: 'Failed to check eligibility' },
      { status: 500 }
    )
  }
}
