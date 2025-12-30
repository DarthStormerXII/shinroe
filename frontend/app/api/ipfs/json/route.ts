import { NextRequest, NextResponse } from 'next/server'
import { pinJSONToIPFS } from '@/lib/web3/pinata'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Allow caller to specify cidVersion (0 for Qm... hashes, 1 for baf... hashes)
    // Default to 1 for general use, but Story Protocol requires 0
    const cidVersion = body.cidVersion === 0 ? 0 : 1

    const options = {
      pinataMetadata: {
        name: body.name || `json-${Date.now()}`,
        keyvalues: body.metadata || {}
      },
      pinataOptions: {
        cidVersion: cidVersion as 0 | 1
      }
    }

    const result = await pinJSONToIPFS(body.content, options)

    return NextResponse.json({
      success: true,
      ipfsHash: result.IpfsHash,
      pinSize: result.PinSize,
      timestamp: result.Timestamp,
      url: `ipfs://${result.IpfsHash}`,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
    })
  } catch (error) {
    console.error('Error pinning JSON to IPFS:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to pin JSON to IPFS' },
      { status: 500 }
    )
  }
}