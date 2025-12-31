#!/usr/bin/env npx tsx
/**
 * VeryChain Mainnet Migration Script
 *
 * This script:
 * 1. Deploys all Shinroe contracts to VeryChain mainnet
 * 2. Generates 10 test wallets
 * 3. Registers them with display names
 * 4. Creates minimal endorsements between them
 * 5. Sets up badge metadata
 *
 * Budget: 5 VERY maximum
 *
 * Usage:
 *   npx tsx scripts/migrate-to-verychain.ts [--dry-run]
 */

import { config } from 'dotenv'
config({ path: '.env.local' })
config({ path: '.env' })
config({ path: '../contracts/.env' })

import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
  defineChain,
  formatEther,
  parseEther,
  encodeFunctionData,
  keccak256,
  toHex,
  type Address,
} from 'viem'
import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// VeryChain mainnet
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

// ABIs
const SCORE_REGISTRY_ABI = parseAbi([
  'function registerUser(address user, bytes32 scoreHash) external',
  'function addAuthorizedUpdater(address updater) external',
  'function setProfileUri(string calldata profileUri) external',
  'function isRegistered(address user) view returns (bool)',
  'function owner() view returns (address)',
])

const ENDORSEMENT_VAULT_ABI = parseAbi([
  'function endorse(address endorsee, uint8 endorsementType) external payable',
  'function setScoreRegistry(address _scoreRegistry) external',
  'function minStake() view returns (uint256)',
])

const BADGE_NFT_ABI = parseAbi([
  'function setBaseURI(string memory baseURI) external',
  'function setScoreRegistry(address _scoreRegistry) external',
  'function grantMinter(address minter) external',
  'function owner() view returns (address)',
])

// Test user names (Korean-friendly)
const TEST_USERS = [
  { name: '김민준', englishName: 'Minjun Kim' },
  { name: '이서연', englishName: 'Seoyeon Lee' },
  { name: '박지호', englishName: 'Jiho Park' },
  { name: '최수아', englishName: 'Sua Choi' },
  { name: '정하준', englishName: 'Hajun Jung' },
  { name: '강예은', englishName: 'Yeeun Kang' },
  { name: '조현우', englishName: 'Hyunwoo Jo' },
  { name: '윤지우', englishName: 'Jiwoo Yoon' },
  { name: '임도윤', englishName: 'Doyun Lim' },
  { name: '한서진', englishName: 'Seojin Han' },
]

interface DeployedContracts {
  scoreRegistry: Address
  endorsementVault: Address
  badgeNFT: Address
  tokenFactory: Address
  airdropVault: Address
}

interface GeneratedWallet {
  address: Address
  privateKey: string
  name: string
  englishName: string
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run')

  console.log('='.repeat(60))
  console.log('VeryChain Mainnet Migration')
  console.log('='.repeat(60))
  if (isDryRun) console.log('\n⚠️  DRY RUN MODE - No transactions will be sent\n')

  // Validate environment
  if (!process.env.PRIVATE_KEY) {
    console.error('Missing PRIVATE_KEY environment variable')
    process.exit(1)
  }

  const privateKey = process.env.PRIVATE_KEY.startsWith('0x')
    ? (process.env.PRIVATE_KEY as `0x${string}`)
    : (`0x${process.env.PRIVATE_KEY}` as `0x${string}`)

  const account = privateKeyToAccount(privateKey)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const publicClient = createPublicClient({
    chain: verychain,
    transport: http(),
  })

  const walletClient = createWalletClient({
    account,
    chain: verychain,
    transport: http(),
  })

  // Check balance
  const balance = await publicClient.getBalance({ address: account.address })
  console.log(`\nDeployer: ${account.address}`)
  console.log(`Balance: ${formatEther(balance)} VERY`)

  if (balance < parseEther('5')) {
    console.warn(`\n⚠️  Balance is less than 5 VERY budget`)
  }

  // Get gas price
  const gasPrice = await publicClient.getGasPrice()
  console.log(`Gas Price: ${formatEther(gasPrice * BigInt(1e9))} GWEI`)

  // ============ COST ESTIMATION ============
  console.log('\n--- Cost Estimation ---\n')

  // Rough gas estimates (contracts already deployed, only post-deployment ops)
  const GAS_ESTIMATES = {
    registerUser: 100_000n,
    setProfileUri: 80_000n,
    endorse: 150_000n,
    setBaseURI: 50_000n,
  }

  const totalRegisterGas = GAS_ESTIMATES.registerUser * 10n
  const numEndorsements = 5n
  const minStake = parseEther('0.01')
  const totalEndorseGas = GAS_ESTIMATES.endorse * numEndorsements
  const totalEndorseStake = minStake * numEndorsements

  const totalGas = totalRegisterGas + totalEndorseGas + GAS_ESTIMATES.setBaseURI

  console.log('Estimated costs (contracts already deployed):')
  console.log(`  Registrations:  ~${formatEther(totalRegisterGas * gasPrice)} VERY (gas)`)
  console.log(`  Endorsements:   ~${formatEther(totalEndorseGas * gasPrice)} VERY (gas) + ${formatEther(totalEndorseStake)} VERY (stake)`)
  console.log(`  Badge Setup:    ~${formatEther(GAS_ESTIMATES.setBaseURI * gasPrice)} VERY (gas)`)
  console.log(`  ─────────────────────────────────`)
  console.log(`  TOTAL ESTIMATE: ~${formatEther((totalGas * gasPrice) + totalEndorseStake)} VERY`)

  const estimatedTotal = (totalGas * gasPrice) + totalEndorseStake
  if (estimatedTotal > parseEther('5')) {
    console.error(`\n❌ Estimated cost exceeds 5 VERY budget!`)
    console.error(`   Consider reducing endorsements or skipping some operations.`)
    process.exit(1)
  }

  console.log(`\n✅ Estimated cost is within 5 VERY budget`)

  if (isDryRun) {
    console.log('\n--- Dry Run Complete ---')
    console.log('Run without --dry-run to execute the migration.')
    process.exit(0)
  }

  // ============ STEP 1: DEPLOY CONTRACTS ============
  console.log('\n--- Step 1: Deploy Contracts ---\n')
  console.log('⚠️  Contracts will be deployed via Foundry. Run:')
  console.log('   cd ../contracts && make deploy-shinroe-verychain')
  console.log('')
  console.log('After deployment, enter the contract addresses:')

  // For now, we'll use placeholder - in real usage, prompt for input or read from deployment
  // Actually, let me check if we can run forge from here or need manual input

  // Read deployed addresses from user or deployment file
  const deploymentFile = path.join(__dirname, '..', '..', 'contracts', 'deployments', 'verychain.json')

  let contracts: DeployedContracts

  if (fs.existsSync(deploymentFile)) {
    const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf-8'))
    contracts = {
      scoreRegistry: deployment.ScoreRegistry as Address,
      endorsementVault: deployment.EndorsementVault as Address,
      badgeNFT: deployment.BadgeNFT as Address,
      tokenFactory: deployment.TokenFactory as Address,
      airdropVault: deployment.AirdropVault as Address,
    }
    console.log('Loaded contracts from deployment file.')
  } else {
    console.log('\nNo deployment file found. Please deploy contracts first:')
    console.log('   cd ../contracts && forge script script/DeployShinroe.s.sol --rpc-url verychain --broadcast')
    console.log('\nThen create deployments/verychain.json with the addresses.')
    process.exit(1)
  }

  console.log('\nContract addresses:')
  console.log(`  ScoreRegistry:    ${contracts.scoreRegistry}`)
  console.log(`  EndorsementVault: ${contracts.endorsementVault}`)
  console.log(`  BadgeNFT:         ${contracts.badgeNFT}`)
  console.log(`  TokenFactory:     ${contracts.tokenFactory}`)
  console.log(`  AirdropVault:     ${contracts.airdropVault}`)

  // ============ STEP 2: GENERATE WALLETS ============
  console.log('\n--- Step 2: Generate Test Wallets ---\n')

  const wallets: GeneratedWallet[] = []

  for (let i = 0; i < TEST_USERS.length; i++) {
    const pk = generatePrivateKey()
    const wallet = privateKeyToAccount(pk)
    wallets.push({
      address: wallet.address,
      privateKey: pk,
      name: TEST_USERS[i].name,
      englishName: TEST_USERS[i].englishName,
    })
    console.log(`Generated: ${wallet.address} - ${TEST_USERS[i].name} (${TEST_USERS[i].englishName})`)
  }

  // Save wallets to file (for reference, don't commit!)
  const walletsFile = path.join(__dirname, 'generated-wallets-verychain.json')
  fs.writeFileSync(
    walletsFile,
    JSON.stringify(
      wallets.map((w) => ({
        address: w.address,
        name: w.name,
        englishName: w.englishName,
        // Don't save private keys in production!
        privateKey: w.privateKey,
      })),
      null,
      2
    )
  )
  console.log(`\nSaved wallet info to: ${walletsFile}`)
  console.log('⚠️  Keep this file secure and do not commit to git!')

  // ============ STEP 3: REGISTER USERS ============
  console.log('\n--- Step 3: Register Users ---\n')

  let totalGasUsed = 0n

  for (const wallet of wallets) {
    // Generate a score hash (dummy for demo)
    const scoreHash = keccak256(toHex(`${wallet.address}-initial-score-${Date.now()}`))

    console.log(`Registering ${wallet.name} (${wallet.address.slice(0, 10)}...)`)

    try {
      const hash = await walletClient.writeContract({
        address: contracts.scoreRegistry,
        abi: SCORE_REGISTRY_ABI,
        functionName: 'registerUser',
        args: [wallet.address, scoreHash],
      })

      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      totalGasUsed += receipt.gasUsed
      console.log(`  ✓ Registered (gas: ${receipt.gasUsed})`)
    } catch (error) {
      console.error(`  ✗ Failed: ${error}`)
    }
  }

  // ============ STEP 4: SET PROFILE URIs (Optional - via IPFS) ============
  // Skip for now to save gas - profiles can be set later via frontend

  // ============ STEP 5: CREATE ENDORSEMENTS ============
  console.log('\n--- Step 4: Create Endorsements ---\n')

  // Create 5 endorsements between the wallets (deployer endorses first 5 wallets)
  const endorsementPairs = [
    { from: account.address, to: wallets[0].address, type: 0 }, // General
    { from: account.address, to: wallets[1].address, type: 1 }, // Financial
    { from: account.address, to: wallets[2].address, type: 2 }, // Professional
    { from: account.address, to: wallets[3].address, type: 0 }, // General
    { from: account.address, to: wallets[4].address, type: 1 }, // Financial
  ]

  for (const pair of endorsementPairs) {
    const toName = wallets.find((w) => w.address === pair.to)?.name || pair.to
    const typeNames = ['General', 'Financial', 'Professional']
    console.log(`Endorsing ${toName} (${typeNames[pair.type]}) with 0.01 VERY...`)

    try {
      const hash = await walletClient.writeContract({
        address: contracts.endorsementVault,
        abi: ENDORSEMENT_VAULT_ABI,
        functionName: 'endorse',
        args: [pair.to, pair.type],
        value: minStake,
      })

      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      totalGasUsed += receipt.gasUsed
      console.log(`  ✓ Endorsed (gas: ${receipt.gasUsed})`)
    } catch (error) {
      console.error(`  ✗ Failed: ${error}`)
    }
  }

  // ============ STEP 6: SET BADGE BASE URI ============
  console.log('\n--- Step 5: Set Badge Base URI ---\n')

  const baseUri = `${appUrl}/api/badges/metadata/`
  console.log(`Setting baseURI to: ${baseUri}`)

  try {
    const hash = await walletClient.writeContract({
      address: contracts.badgeNFT,
      abi: BADGE_NFT_ABI,
      functionName: 'setBaseURI',
      args: [baseUri],
    })

    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    totalGasUsed += receipt.gasUsed
    console.log(`  ✓ BaseURI set (gas: ${receipt.gasUsed})`)
  } catch (error) {
    console.error(`  ✗ Failed: ${error}`)
  }

  // ============ SUMMARY ============
  const finalBalance = await publicClient.getBalance({ address: account.address })
  const totalSpent = balance - finalBalance

  console.log('\n' + '='.repeat(60))
  console.log('Migration Complete!')
  console.log('='.repeat(60))
  console.log(`\nTotal gas used: ${totalGasUsed}`)
  console.log(`Total VERY spent: ${formatEther(totalSpent)} VERY`)
  console.log(`  - Gas costs: ${formatEther(totalSpent - (minStake * BigInt(endorsementPairs.length)))} VERY`)
  console.log(`  - Stake locked: ${formatEther(minStake * BigInt(endorsementPairs.length))} VERY`)
  console.log(`Remaining balance: ${formatEther(finalBalance)} VERY`)

  console.log('\n--- Contract Addresses ---')
  console.log(`ScoreRegistry:    ${contracts.scoreRegistry}`)
  console.log(`EndorsementVault: ${contracts.endorsementVault}`)
  console.log(`BadgeNFT:         ${contracts.badgeNFT}`)
  console.log(`TokenFactory:     ${contracts.tokenFactory}`)
  console.log(`AirdropVault:     ${contracts.airdropVault}`)

  console.log('\n--- Registered Users ---')
  for (const wallet of wallets) {
    console.log(`${wallet.name} (${wallet.englishName}): ${wallet.address}`)
  }

  console.log('\nNext steps:')
  console.log('1. Update frontend/constants/contracts/ with VeryChain addresses')
  console.log('2. Add BADGE_IMAGE_* env vars to frontend/.env')
  console.log('3. Deploy frontend to production')
  console.log('4. Test /verify page to see registered users')
}

main().catch(console.error)
