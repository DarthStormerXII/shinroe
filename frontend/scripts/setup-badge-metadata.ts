#!/usr/bin/env npx tsx
/**
 * Badge Metadata Setup Script
 *
 * Uploads badge images to IPFS via Pinata and sets the baseURI on the BadgeNFT contract.
 * Run this after deploying the BadgeNFT contract.
 *
 * Usage:
 *   npx tsx scripts/setup-badge-metadata.ts [network]
 *
 * Networks: amoy (default), verychain
 *
 * Required environment variables:
 *   - PINATA_JWT: Pinata API JWT token
 *   - PRIVATE_KEY: Deployer private key (owner of BadgeNFT)
 *   - NEXT_PUBLIC_APP_URL: Frontend URL for metadata API (production URL!)
 *
 * Optional:
 *   - BADGE_NFT_ADDRESS: Override contract address
 */

import { config } from 'dotenv'
// Load env from multiple locations
config({ path: '.env.local' })
config({ path: '.env' })
config({ path: '../contracts/.env' }) // PRIVATE_KEY is in contracts/.env

import { createPublicClient, createWalletClient, http, parseAbi, defineChain, type Chain } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { polygonAmoy } from 'viem/chains'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

// Get directory of current file
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Badge configuration
const BADGES = [
  { type: 0, name: 'VERIFIED_IDENTITY', file: 'verified-identity.png' },
  { type: 1, name: 'TRUSTED_TRADER', file: 'trusted-trader.png' },
  { type: 2, name: 'COMMUNITY_BUILDER', file: 'community-builder.png' },
  { type: 3, name: 'EARLY_ADOPTER', file: 'early-adopter.png' },
  { type: 4, name: 'ELITE_SCORE', file: 'elite-score.png' },
]

// VeryChain mainnet definition
const verychain = defineChain({
  id: 4613,
  name: 'VeryChain',
  network: 'verychain',
  nativeCurrency: { name: 'VERY', symbol: 'VERY', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_VERYCHAIN_RPC_URL || 'https://rpc.verylabs.io'] },
  },
  blockExplorers: {
    default: { name: 'VeryScan', url: 'https://www.veryscan.io' },
  },
})

// Network configurations
interface NetworkConfig {
  chain: Chain
  badgeNftAddress: string
  rpcUrl: string
}

const NETWORKS: Record<string, NetworkConfig> = {
  amoy: {
    chain: polygonAmoy,
    badgeNftAddress: '0x9b42b592b2d0e8b845d9975671c48dae90123876',
    rpcUrl: process.env.NEXT_PUBLIC_AMOY_RPC_URL ||
      (process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
        ? `https://polygon-amoy.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
        : 'https://rpc-amoy.polygon.technology'),
  },
  verychain: {
    chain: verychain,
    // This will be set after VeryChain deployment - use env override for now
    badgeNftAddress: process.env.BADGE_NFT_ADDRESS || '0x0000000000000000000000000000000000000000',
    rpcUrl: process.env.NEXT_PUBLIC_VERYCHAIN_RPC_URL || 'https://rpc.verylabs.io',
  },
}

const BADGE_NFT_ABI = parseAbi([
  'function setBaseURI(string memory baseURI) external',
  'function owner() view returns (address)',
])

interface PinataResponse {
  IpfsHash: string
  PinSize: number
  Timestamp: string
}

async function uploadToPinata(
  fileBuffer: Buffer,
  fileName: string,
  metadata: Record<string, string>
): Promise<PinataResponse> {
  const jwt = process.env.PINATA_JWT
  if (!jwt) throw new Error('PINATA_JWT not set')

  const formData = new FormData()
  formData.append('file', new Blob([new Uint8Array(fileBuffer)]), fileName)
  formData.append('pinataMetadata', JSON.stringify({ name: fileName, keyvalues: metadata }))
  formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }))

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}` },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Pinata upload failed: ${error}`)
  }

  return response.json()
}

async function main() {
  // Get network from command line or default to amoy
  const networkArg = process.argv[2] || 'amoy'
  const networkConfig = NETWORKS[networkArg]

  if (!networkConfig) {
    console.error(`Unknown network: ${networkArg}`)
    console.error(`Available networks: ${Object.keys(NETWORKS).join(', ')}`)
    process.exit(1)
  }

  console.log('='.repeat(60))
  console.log('Badge Metadata Setup Script')
  console.log('='.repeat(60))
  console.log(`\nNetwork: ${networkArg}`)

  // Allow address override from env
  const badgeNftAddress = (process.env.BADGE_NFT_ADDRESS || networkConfig.badgeNftAddress) as `0x${string}`

  if (badgeNftAddress === '0x0000000000000000000000000000000000000000') {
    console.error('\nError: BadgeNFT address not configured for this network.')
    console.error('Set BADGE_NFT_ADDRESS environment variable after deployment.')
    process.exit(1)
  }

  // Validate environment
  const requiredEnvVars = ['PINATA_JWT', 'PRIVATE_KEY']
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`Missing required environment variable: ${envVar}`)
      process.exit(1)
    }
  }

  const privateKey = process.env.PRIVATE_KEY!.startsWith('0x')
    ? (process.env.PRIVATE_KEY as `0x${string}`)
    : (`0x${process.env.PRIVATE_KEY}` as `0x${string}`)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Create clients
  const account = privateKeyToAccount(privateKey)
  const publicClient = createPublicClient({
    chain: networkConfig.chain,
    transport: http(networkConfig.rpcUrl),
  })
  const walletClient = createWalletClient({
    account,
    chain: networkConfig.chain,
    transport: http(networkConfig.rpcUrl),
  })

  console.log(`\nAccount: ${account.address}`)
  console.log(`Chain ID: ${networkConfig.chain.id}`)
  console.log(`BadgeNFT: ${badgeNftAddress}`)
  console.log(`App URL: ${appUrl}`)

  // Verify ownership
  try {
    const owner = await publicClient.readContract({
      address: badgeNftAddress,
      abi: BADGE_NFT_ABI,
      functionName: 'owner',
    })

    if (owner.toLowerCase() !== account.address.toLowerCase()) {
      console.error(`\nError: Account ${account.address} is not the owner of BadgeNFT`)
      console.error(`Owner is: ${owner}`)
      process.exit(1)
    }
    console.log('\nOwnership verified!')
  } catch (error) {
    console.error(`\nError: Could not verify contract ownership. Is the contract deployed?`)
    console.error(error)
    process.exit(1)
  }

  // Upload badge images to IPFS
  console.log('\n--- Uploading Badge Images to IPFS ---\n')

  const badgesDir = path.join(__dirname, '..', 'public', 'badges')
  const imageHashes: Record<string, string> = {}

  for (const badge of BADGES) {
    const imagePath = path.join(badgesDir, badge.file)

    if (!fs.existsSync(imagePath)) {
      console.error(`Image not found: ${imagePath}`)
      continue
    }

    console.log(`Uploading ${badge.file}...`)
    const imageBuffer = fs.readFileSync(imagePath)

    try {
      const result = await uploadToPinata(imageBuffer, badge.file, {
        project: 'shinroe',
        type: 'badge-image',
        network: networkArg,
        badgeType: badge.type.toString(),
        badgeName: badge.name,
      })

      imageHashes[badge.name] = result.IpfsHash
      console.log(`  Uploaded: ipfs://${result.IpfsHash}`)
    } catch (error) {
      console.error(`  Failed: ${error}`)
    }
  }

  // Generate environment variables
  console.log('\n--- Environment Variables ---\n')
  console.log('Add these to frontend/.env:\n')

  for (const [name, hash] of Object.entries(imageHashes)) {
    console.log(`BADGE_IMAGE_${name}=${hash}`)
  }

  // Set baseURI on contract
  const baseUri = `${appUrl}/api/badges/metadata/`
  console.log(`\n--- Setting BaseURI on BadgeNFT ---\n`)
  console.log(`BaseURI: ${baseUri}`)

  if (appUrl.includes('localhost')) {
    console.log('\n⚠️  WARNING: BaseURI contains localhost!')
    console.log('For production, set NEXT_PUBLIC_APP_URL to your production domain.')
  }

  try {
    const hash = await walletClient.writeContract({
      address: badgeNftAddress,
      abi: BADGE_NFT_ABI,
      functionName: 'setBaseURI',
      args: [baseUri],
    })

    console.log(`Transaction submitted: ${hash}`)

    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`)
    console.log(`Status: ${receipt.status === 'success' ? 'Success' : 'Failed'}`)
  } catch (error) {
    console.error(`Failed to set baseURI: ${error}`)
    process.exit(1)
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('Setup Complete!')
  console.log('='.repeat(60))
  console.log(`\nNetwork: ${networkArg}`)
  console.log(`Badge images uploaded: ${Object.keys(imageHashes).length}`)
  console.log(`BaseURI set to: ${baseUri}`)
  console.log('\nNext steps:')
  console.log('1. Add the environment variables above to frontend/.env')
  console.log('2. Restart your Next.js application')
  console.log(`3. Test: ${appUrl}/api/badges/metadata/0`)
}

main().catch(console.error)
