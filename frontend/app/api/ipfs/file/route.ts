import { NextRequest, NextResponse } from 'next/server'
import { pinFileToIPFS } from '@/lib/web3/pinata'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const name = formData.get('name') as string | null
    const metadata = formData.get('metadata') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      )
    }

    const fileName = name || file.name
    
    const options = {
      pinataMetadata: {
        name: fileName,
        keyvalues: metadata ? JSON.parse(metadata) : {}
      },
      pinataOptions: {
        cidVersion: 1 as const
      }
    }

    const result = await pinFileToIPFS(file, fileName, options)

    return NextResponse.json({
      success: true,
      ipfsHash: result.IpfsHash,
      pinSize: result.PinSize,
      timestamp: result.Timestamp,
      fileName: fileName,
      url: `ipfs://${result.IpfsHash}`,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
    })
  } catch (error) {
    console.error('Error pinning file to IPFS:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to pin file to IPFS' },
      { status: 500 }
    )
  }
}