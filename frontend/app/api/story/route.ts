import { NextRequest, NextResponse } from 'next/server'

// Story Protocol API v4
// Staging (testnet): https://staging-api.storyprotocol.net
// Production: https://api.storyapis.com
const STORY_API_BASE = 'https://staging-api.storyprotocol.net'
const STORY_API_KEY = 'KOTbaGUSWQ6cUJWhiJYiOjPgB0kTRu1eCFFvQL0IWls'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { endpoint, ...requestBody } = body

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint parameter' }, { status: 400 })
    }

    const url = `${STORY_API_BASE}/api/v4${endpoint}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Key': STORY_API_KEY,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Story API error:', response.status, errorText)
      return NextResponse.json(
        { error: `Story API error: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Story API proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch from Story API', details: error.message },
      { status: 500 }
    )
  }
}

// Keep GET for backward compatibility with simple queries
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get('endpoint')

  if (!endpoint) {
    return NextResponse.json({ error: 'Missing endpoint parameter' }, { status: 400 })
  }

  // Build query params excluding 'endpoint'
  const params = new URLSearchParams()
  searchParams.forEach((value, key) => {
    if (key !== 'endpoint') {
      params.append(key, value)
    }
  })

  const url = `${STORY_API_BASE}/api/v4${endpoint}${params.toString() ? `?${params.toString()}` : ''}`

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-API-Key': STORY_API_KEY,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Story API error: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Story API proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch from Story API', details: error.message },
      { status: 500 }
    )
  }
}
