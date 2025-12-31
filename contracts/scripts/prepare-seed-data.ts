/**
 * Prepare Seed Data Script
 *
 * This script:
 * 1. Downloads avatar images from the internet
 * 2. Uploads images to IPFS via Pinata API
 * 3. Creates and uploads JSON metadata for profiles and airdrops
 * 4. Outputs a seed-config.json for the Solidity seeding script
 *
 * Run: npx tsx scripts/prepare-seed-data.ts
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { Wallet } from 'ethers'

// ESM compatibility
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const IPFS_API_BASE = process.env.IPFS_API_URL || 'http://localhost:3008'
const CONFIG_DIR = path.join(__dirname, '..', 'config')
const OUTPUT_FILE = path.join(CONFIG_DIR, 'seed-ipfs-data.json')

// Avatar images from DiceBear (generates unique avatars)
const AVATAR_STYLE = 'avataaars' // or: 'bottts', 'identicon', 'personas', 'pixel-art'
const AVATAR_BASE_URL = `https://api.dicebear.com/7.x/${AVATAR_STYLE}/png`

// Airdrop banner images from Unsplash
const AIRDROP_IMAGES: Record<string, string> = {
  'COMM': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=400&fit=crop', // Community
  'ELITE': 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&h=400&fit=crop', // Trophy/Gold
  'EARLY': 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&h=400&fit=crop', // Sunrise
  'TRADE': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop', // Trading
  'WELC': 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=400&fit=crop', // Welcome/Handshake
}

// Badge images
const BADGE_IMAGES: Record<string, string> = {
  'VERIFIED_IDENTITY': 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=400&h=400&fit=crop', // Verification
  'TRUSTED_TRADER': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=400&fit=crop', // Trading
  'COMMUNITY_BUILDER': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=400&fit=crop', // Community
  'EARLY_ADOPTER': 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&h=400&fit=crop', // Early/Sunrise
  'ELITE_SCORE': 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400&h=400&fit=crop', // Elite/Trophy
}

interface WalletConfig {
  name: string
  privateKey: string
  address: string
  score: number
  badges: string[]
}

interface ProfileConfig {
  name: string
  bio: string
  twitter: string
  github: string
}

interface AirdropConfig {
  id: number
  name: string
  symbol: string
  description: string
  totalSupply: string
  claimAmount: string
  poolSize: string
  durationDays: number
  minScore: number
}

interface SeedIPFSData {
  generatedAt: string
  profiles: Record<string, {
    avatarIpfs: string
    metadataIpfs: string
  }>
  airdrops: Record<string, {
    imageIpfs: string
    metadataIpfs: string
  }>
  badges: Record<string, {
    imageIpfs: string
    metadataIpfs: string
  }>
}

// ============ IPFS Upload Functions ============

async function uploadImageToIPFS(imageUrl: string, name: string): Promise<string> {
  console.log(`  Downloading: ${imageUrl.substring(0, 60)}...`)

  // Download image
  const imageResponse = await fetch(imageUrl)
  if (!imageResponse.ok) {
    throw new Error(`Failed to download image: ${imageResponse.statusText}`)
  }

  const imageBuffer = await imageResponse.arrayBuffer()
  const blob = new Blob([imageBuffer], { type: 'image/png' })

  // Create form data
  const formData = new FormData()
  formData.append('file', blob, `${name}.png`)
  formData.append('name', name)

  // Upload to IPFS
  console.log(`  Uploading to IPFS: ${name}`)
  const response = await fetch(`${IPFS_API_BASE}/api/ipfs/file`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`IPFS upload failed: ${error}`)
  }

  const result = await response.json()
  console.log(`  ✓ Uploaded: ${result.url}`)
  return result.url
}

async function uploadJSONToIPFS(content: object, name: string): Promise<string> {
  console.log(`  Uploading JSON: ${name}`)

  const response = await fetch(`${IPFS_API_BASE}/api/ipfs/json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, name }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`IPFS JSON upload failed: ${error}`)
  }

  const result = await response.json()
  console.log(`  ✓ Uploaded: ${result.url}`)
  return result.url
}

// ============ Main Functions ============

async function prepareProfiles(
  wallets: Record<string, WalletConfig>,
  profiles: Record<string, ProfileConfig>
): Promise<Record<string, { avatarIpfs: string; metadataIpfs: string }>> {
  console.log('\n📷 Preparing Profile Data...\n')

  const result: Record<string, { avatarIpfs: string; metadataIpfs: string }> = {}

  for (const [key, wallet] of Object.entries(wallets)) {
    const profile = profiles[key]
    if (!profile) continue

    console.log(`Processing ${profile.name}...`)

    // Generate unique avatar URL using wallet address as seed
    const avatarUrl = `${AVATAR_BASE_URL}?seed=${wallet.address}&backgroundColor=b6e3f4,c0aede,d1d4f9`

    // Upload avatar
    const avatarIpfs = await uploadImageToIPFS(avatarUrl, `avatar-${key}`)

    // Create and upload profile metadata
    const metadata = {
      name: profile.name,
      bio: profile.bio,
      image: avatarIpfs,
      external_url: `https://shinroe.app/user/${wallet.address}`,
      attributes: [
        { trait_type: 'Score', value: wallet.score },
        { trait_type: 'Badges', value: wallet.badges.length },
        { trait_type: 'Twitter', value: profile.twitter },
        { trait_type: 'GitHub', value: profile.github },
      ],
      social: {
        twitter: profile.twitter,
        github: profile.github,
      },
    }

    const metadataIpfs = await uploadJSONToIPFS(metadata, `profile-${key}`)

    result[key] = { avatarIpfs, metadataIpfs }
    console.log('')
  }

  return result
}

async function prepareAirdrops(
  airdrops: AirdropConfig[]
): Promise<Record<string, { imageIpfs: string; metadataIpfs: string }>> {
  console.log('\n🎁 Preparing Airdrop Data...\n')

  const result: Record<string, { imageIpfs: string; metadataIpfs: string }> = {}

  for (const airdrop of airdrops) {
    console.log(`Processing ${airdrop.name}...`)

    // Get image URL
    const imageUrl = AIRDROP_IMAGES[airdrop.symbol] || AIRDROP_IMAGES['WELC']

    // Upload image
    const imageIpfs = await uploadImageToIPFS(imageUrl, `airdrop-${airdrop.symbol.toLowerCase()}`)

    // Create and upload airdrop metadata
    const metadata = {
      name: airdrop.name,
      symbol: airdrop.symbol,
      description: airdrop.description,
      image: imageIpfs,
      external_url: `https://shinroe.app/airdrop/${airdrop.id}`,
      attributes: [
        { trait_type: 'Total Supply', value: airdrop.totalSupply },
        { trait_type: 'Claim Amount', value: airdrop.claimAmount },
        { trait_type: 'Pool Size', value: airdrop.poolSize },
        { trait_type: 'Duration (Days)', value: airdrop.durationDays },
        { trait_type: 'Minimum Score', value: airdrop.minScore },
      ],
      eligibility: {
        minScore: airdrop.minScore,
        requiresVerifiedBadge: true,
      },
    }

    const metadataIpfs = await uploadJSONToIPFS(metadata, `airdrop-${airdrop.symbol.toLowerCase()}-metadata`)

    result[airdrop.symbol] = { imageIpfs, metadataIpfs }
    console.log('')
  }

  return result
}

async function prepareBadges(): Promise<Record<string, { imageIpfs: string; metadataIpfs: string }>> {
  console.log('\n🏅 Preparing Badge Data...\n')

  const badgeDescriptions: Record<string, { name: string; description: string }> = {
    'VERIFIED_IDENTITY': {
      name: 'Verified Identity',
      description: 'This user has verified their identity through the Shinroe verification process.',
    },
    'TRUSTED_TRADER': {
      name: 'Trusted Trader',
      description: 'Recognized for maintaining a strong trading reputation with consistent positive outcomes.',
    },
    'COMMUNITY_BUILDER': {
      name: 'Community Builder',
      description: 'Awarded to active community members who contribute to ecosystem growth.',
    },
    'EARLY_ADOPTER': {
      name: 'Early Adopter',
      description: 'One of the first users to join the Shinroe reputation network.',
    },
    'ELITE_SCORE': {
      name: 'Elite Score',
      description: 'Achieved an elite reputation score of 800 or higher.',
    },
  }

  const result: Record<string, { imageIpfs: string; metadataIpfs: string }> = {}

  for (const [badgeType, info] of Object.entries(badgeDescriptions)) {
    console.log(`Processing ${info.name}...`)

    // Get image URL
    const imageUrl = BADGE_IMAGES[badgeType]

    // Upload image
    const imageIpfs = await uploadImageToIPFS(imageUrl, `badge-${badgeType.toLowerCase()}`)

    // Create and upload badge metadata (ERC721 standard)
    const metadata = {
      name: info.name,
      description: info.description,
      image: imageIpfs,
      external_url: `https://shinroe.app/badge/${badgeType}`,
      attributes: [
        { trait_type: 'Badge Type', value: badgeType },
        { trait_type: 'Transferable', value: 'No (Soulbound)' },
        { trait_type: 'Revocable', value: 'Yes' },
      ],
      properties: {
        badge_type: badgeType,
        soulbound: true,
      },
    }

    const metadataIpfs = await uploadJSONToIPFS(metadata, `badge-${badgeType.toLowerCase()}-metadata`)

    result[badgeType] = { imageIpfs, metadataIpfs }
    console.log('')
  }

  return result
}

async function generateEnvFile(data: SeedIPFSData, wallets: Record<string, WalletConfig>) {
  const envContent = `# Generated Seed Configuration
# Run: source contracts/config/seed.env

# Wallet Addresses
export ALICE_ADDRESS="${wallets.alice.address}"
export BOB_ADDRESS="${wallets.bob.address}"
export CAROL_ADDRESS="${wallets.carol.address}"
export DAVID_ADDRESS="${wallets.david.address}"
export EVE_ADDRESS="${wallets.eve.address}"
export FRANK_ADDRESS="${wallets.frank.address}"

# Profile IPFS URIs
export ALICE_PROFILE_URI="${data.profiles.alice?.metadataIpfs || ''}"
export BOB_PROFILE_URI="${data.profiles.bob?.metadataIpfs || ''}"
export CAROL_PROFILE_URI="${data.profiles.carol?.metadataIpfs || ''}"
export DAVID_PROFILE_URI="${data.profiles.david?.metadataIpfs || ''}"
export EVE_PROFILE_URI="${data.profiles.eve?.metadataIpfs || ''}"
export FRANK_PROFILE_URI="${data.profiles.frank?.metadataIpfs || ''}"

# Airdrop Metadata URIs
export AIRDROP_COMM_URI="${data.airdrops.COMM?.metadataIpfs || ''}"
export AIRDROP_ELITE_URI="${data.airdrops.ELITE?.metadataIpfs || ''}"
export AIRDROP_EARLY_URI="${data.airdrops.EARLY?.metadataIpfs || ''}"
export AIRDROP_TRADE_URI="${data.airdrops.TRADE?.metadataIpfs || ''}"
export AIRDROP_WELC_URI="${data.airdrops.WELC?.metadataIpfs || ''}"

# Badge Base URI (folder containing 0.json, 1.json, etc.)
export BADGE_VERIFIED_URI="${data.badges.VERIFIED_IDENTITY?.metadataIpfs || ''}"
export BADGE_TRADER_URI="${data.badges.TRUSTED_TRADER?.metadataIpfs || ''}"
export BADGE_COMMUNITY_URI="${data.badges.COMMUNITY_BUILDER?.metadataIpfs || ''}"
export BADGE_EARLY_URI="${data.badges.EARLY_ADOPTER?.metadataIpfs || ''}"
export BADGE_ELITE_URI="${data.badges.ELITE_SCORE?.metadataIpfs || ''}"
`

  const envPath = path.join(CONFIG_DIR, 'seed.env')
  fs.writeFileSync(envPath, envContent)
  console.log(`\n✓ Generated: ${envPath}`)
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║          SHINROE SEED DATA PREPARATION                     ║')
  console.log('╚════════════════════════════════════════════════════════════╝')

  // Load wallet configuration
  const walletConfigPath = path.join(CONFIG_DIR, 'seed-wallets.json')
  if (!fs.existsSync(walletConfigPath)) {
    console.error('Error: seed-wallets.json not found')
    process.exit(1)
  }

  const config = JSON.parse(fs.readFileSync(walletConfigPath, 'utf-8'))

  // Verify wallet addresses match private keys
  console.log('\n🔐 Verifying Wallet Addresses...\n')
  for (const [key, wallet] of Object.entries(config.wallets) as [string, WalletConfig][]) {
    const derivedWallet = new Wallet(wallet.privateKey)
    if (derivedWallet.address.toLowerCase() !== wallet.address.toLowerCase()) {
      console.log(`  Updating ${key} address: ${wallet.address} -> ${derivedWallet.address}`)
      config.wallets[key].address = derivedWallet.address
    } else {
      console.log(`  ✓ ${key}: ${wallet.address}`)
    }
  }

  // Save updated config with correct addresses
  fs.writeFileSync(walletConfigPath, JSON.stringify(config, null, 2))

  try {
    // Test IPFS connection
    console.log('\n🔗 Testing IPFS API connection...')
    const testResponse = await fetch(`${IPFS_API_BASE}/api/ipfs/json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: { test: true }, name: 'connection-test' }),
    })

    if (!testResponse.ok) {
      throw new Error(`IPFS API not available at ${IPFS_API_BASE}`)
    }
    console.log('  ✓ IPFS API connected\n')

    // Prepare all data
    const profiles = await prepareProfiles(config.wallets, config.profiles)
    const airdrops = await prepareAirdrops(config.airdrops)
    const badges = await prepareBadges()

    // Create output
    const output: SeedIPFSData = {
      generatedAt: new Date().toISOString(),
      profiles,
      airdrops,
      badges,
    }

    // Save output
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2))
    console.log(`\n✓ Saved: ${OUTPUT_FILE}`)

    // Generate .env file for easy sourcing
    await generateEnvFile(output, config.wallets)

    console.log('\n╔════════════════════════════════════════════════════════════╗')
    console.log('║                    PREPARATION COMPLETE                     ║')
    console.log('╚════════════════════════════════════════════════════════════╝')
    console.log('\nNext steps:')
    console.log('  1. source contracts/config/seed.env')
    console.log('  2. make seed-verychain')

  } catch (error) {
    console.error('\n❌ Error:', error)
    console.error('\nMake sure the IPFS API is running at:', IPFS_API_BASE)
    console.error('You can set IPFS_API_URL environment variable to override.')
    process.exit(1)
  }
}

main()
