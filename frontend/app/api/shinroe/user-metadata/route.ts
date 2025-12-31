import { NextRequest, NextResponse } from 'next/server'
import { isAddress } from 'viem'
import { supabase } from '@/lib/supabase/client'

interface UserMetadata {
  address: string
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  veryChatHandle: string | null
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

      const { data, error } = await supabase
        .from('shinroe_users')
        .select('*')
        .eq('address', address.toLowerCase())
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Supabase error:', error)
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
      }

      if (!data) {
        return NextResponse.json({ success: true, data: null })
      }

      const metadata: UserMetadata = {
        address: data.address,
        displayName: data.display_name,
        avatarUrl: data.avatar_url,
        bio: data.bio,
        veryChatHandle: data.verychat_handle,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }

      return NextResponse.json({ success: true, data: metadata })
    }

    if (search) {
      const { data, error } = await supabase
        .from('shinroe_users')
        .select('*')
        .ilike('display_name', `%${search}%`)
        .limit(20)

      if (error) {
        console.error('Supabase search error:', error)
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
      }

      const results: UserMetadata[] = (data || []).map((row) => ({
        address: row.address,
        displayName: row.display_name,
        avatarUrl: row.avatar_url,
        bio: row.bio,
        veryChatHandle: row.verychat_handle,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
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
    const { address, displayName, avatarUrl, bio, veryChatHandle } = body

    if (!address || !isAddress(address)) {
      return NextResponse.json({ success: false, error: 'Valid address required' }, { status: 400 })
    }

    const addressLower = address.toLowerCase()

    const { error } = await supabase
      .from('shinroe_users')
      .upsert(
        {
          address: addressLower,
          display_name: displayName || null,
          avatar_url: avatarUrl || null,
          bio: bio || null,
          verychat_handle: veryChatHandle || null,
        },
        { onConflict: 'address' }
      )

    if (error) {
      console.error('Supabase upsert error:', error)
      return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('User metadata POST error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
