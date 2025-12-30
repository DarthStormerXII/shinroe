import { NextRequest, NextResponse } from 'next/server'

/**
 * Proxy endpoint to fetch Hyperlane message status
 * This avoids CORS issues when calling the Hyperlane Explorer API from the browser
 * Using Karak-hosted explorer which indexes testnet chains
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const messageId = searchParams.get('id')

  if (!messageId) {
    return NextResponse.json({ error: 'Missing message ID' }, { status: 400 })
  }

  try {
    const url = `https://hyperlane-explorer.karak.network/api?module=message&action=get-messages&id=${messageId}`
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      // Cache for 3 seconds to avoid hammering the API
      next: { revalidate: 3 },
    })

    if (!response.ok) {
      return NextResponse.json({ status: 'pending' })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch Hyperlane message status:', error)
    return NextResponse.json({ status: 'pending' })
  }
}
