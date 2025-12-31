import { NextRequest, NextResponse } from 'next/server'
import { isAddress } from 'viem'

interface UserMetadata {
  address: string
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  createdAt: string
  updatedAt: string
}

// In-memory store for user metadata (in production, use Supabase or similar)
const userMetadataStore = new Map<string, UserMetadata>()

// GET /api/shinroe/user-metadata?address=0x... or ?search=displayName
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')
  const search = searchParams.get('search')

  try {
    if (address) {
      if (!isAddress(address)) {
        return NextResponse.json({ success: false, error: 'Invalid address' }, { status: 400 })
      }

      const metadata = userMetadataStore.get(address.toLowerCase())

      if (!metadata) {
        return NextResponse.json({ success: true, data: null })
      }

      return NextResponse.json({ success: true, data: metadata })
    }

    if (search) {
      const results: UserMetadata[] = []
      const searchLower = search.toLowerCase()

      userMetadataStore.forEach((metadata) => {
        if (metadata.displayName?.toLowerCase().includes(searchLower)) {
          results.push(metadata)
        }
      })

      return NextResponse.json({ success: true, data: results.slice(0, 20) })
    }

    return NextResponse.json({ success: false, error: 'Provide address or search' }, { status: 400 })
  } catch (error) {
    console.error('User metadata GET error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// POST /api/shinroe/user-metadata - Create or update metadata
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, displayName, avatarUrl, bio } = body

    if (!address || !isAddress(address)) {
      return NextResponse.json({ success: false, error: 'Valid address required' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const addressLower = address.toLowerCase()
    const existing = userMetadataStore.get(addressLower)

    const metadata: UserMetadata = {
      address: addressLower,
      displayName: displayName || null,
      avatarUrl: avatarUrl || null,
      bio: bio || null,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    }

    userMetadataStore.set(addressLower, metadata)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('User metadata POST error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
