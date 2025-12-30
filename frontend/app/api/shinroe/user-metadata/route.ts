import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { isAddress } from 'viem'

interface UserMetadata {
  address: string
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  createdAt: string
  updatedAt: string
}

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

      const row = db.prepare(
        'SELECT * FROM user_metadata WHERE LOWER(address) = LOWER(?)'
      ).get(address) as Record<string, unknown> | undefined

      if (!row) {
        return NextResponse.json({ success: true, data: null })
      }

      const metadata: UserMetadata = {
        address: row.address as string,
        displayName: row.display_name as string | null,
        avatarUrl: row.avatar_url as string | null,
        bio: row.bio as string | null,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
      }

      return NextResponse.json({ success: true, data: metadata })
    }

    if (search) {
      const rows = db.prepare(
        'SELECT * FROM user_metadata WHERE display_name LIKE ? LIMIT 20'
      ).all(`%${search}%`) as Record<string, unknown>[]

      const results = rows.map(row => ({
        address: row.address as string,
        displayName: row.display_name as string | null,
        avatarUrl: row.avatar_url as string | null,
        bio: row.bio as string | null,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
      }))

      return NextResponse.json({ success: true, data: results })
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

    const existing = db.prepare(
      'SELECT address FROM user_metadata WHERE LOWER(address) = LOWER(?)'
    ).get(address)

    if (existing) {
      db.prepare(`
        UPDATE user_metadata
        SET display_name = ?, avatar_url = ?, bio = ?
        WHERE LOWER(address) = LOWER(?)
      `).run(displayName || null, avatarUrl || null, bio || null, address)
    } else {
      db.prepare(`
        INSERT INTO user_metadata (address, display_name, avatar_url, bio)
        VALUES (?, ?, ?, ?)
      `).run(address.toLowerCase(), displayName || null, avatarUrl || null, bio || null)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('User metadata POST error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
