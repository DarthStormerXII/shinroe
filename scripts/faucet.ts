#!/usr/bin/env npx ts-node

/**
 * Faucet Script - Drips testnet tokens (native or ERC20) to specified address
 *
 * Usage:
 *   Native:  npx tsx faucet.ts <network> <address> [amount]
 *   ERC20:   npx tsx faucet.ts <network> <address> <amount> <token>
 *
 * Networks: sepolia, amoy, arb-sepolia, fuji, moca-devnet
 * Tokens: usdc (more can be added per network)
 *
 * Examples:
 *   npx tsx faucet.ts fuji 0x123... 0.1           # Send 0.1 AVAX
 *   npx tsx faucet.ts fuji 0x123... 0.01 usdc     # Send 0.01 USDC
 *
 * Requires FAUCET_PRIVATE_KEY in root .env file
 */

import { createWalletClient, createPublicClient, http, parseEther, formatEther, parseUnits, formatUnits, encodeFunctionData } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia, polygonAmoy, arbitrumSepolia, avalancheFuji } from 'viem/chains'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// ESM compatibility
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env from project root
config({ path: resolve(__dirname, '../.env') })

// ERC20 ABI (minimal for transfer and balanceOf)
const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'decimals',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    name: 'symbol',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
] as const

// Token configurations per network
const TOKENS: Record<string, Record<string, { address: string; decimals: number; symbol: string }>> = {
  'fuji': {
    'usdc': {
      address: '0x5425890298aed601595a70AB815c96711a31Bc65',
      decimals: 6,
      symbol: 'USDC',
    },
  },
  'sepolia': {
    'usdc': {
      address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Circle's testnet USDC
      decimals: 6,
      symbol: 'USDC',
    },
  },
  'amoy': {
    'usdc': {
      address: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582', // Polygon Amoy USDC
      decimals: 6,
      symbol: 'USDC',
    },
  },
  'arb-sepolia': {
    'usdc': {
      address: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', // Arbitrum Sepolia USDC
      decimals: 6,
      symbol: 'USDC',
    },
  },
}

// Network configurations
const NETWORKS = {
  'sepolia': {
    chain: sepolia,
    rpc: 'https://ethereum-sepolia-rpc.publicnode.com',
    explorer: 'https://sepolia.etherscan.io',
    nativeSymbol: 'ETH',
  },
  'amoy': {
    chain: polygonAmoy,
    rpc: 'https://rpc-amoy.polygon.technology',
    explorer: 'https://amoy.polygonscan.com',
    nativeSymbol: 'MATIC',
  },
  'arb-sepolia': {
    chain: arbitrumSepolia,
    rpc: 'https://sepolia-rollup.arbitrum.io/rpc',
    explorer: 'https://sepolia.arbiscan.io',
    nativeSymbol: 'ETH',
  },
  'fuji': {
    chain: avalancheFuji,
    rpc: 'https://api.avax-test.network/ext/bc/C/rpc',
    explorer: 'https://testnet.snowtrace.io',
    nativeSymbol: 'AVAX',
  },
  'moca-devnet': {
    chain: {
      id: 99999,
      name: 'Moca Devnet',
      nativeCurrency: { name: 'MOCA', symbol: 'MOCA', decimals: 18 },
      rpcUrls: { default: { http: ['https://rpc.devnet.moca.network'] } },
    },
    rpc: 'https://rpc.devnet.moca.network',
    explorer: 'https://explorer.devnet.moca.network',
    nativeSymbol: 'MOCA',
  },
} as const

type NetworkName = keyof typeof NETWORKS

async function main() {
  const args = process.argv.slice(2)

  if (args.length < 2) {
    console.log('Usage:')
    console.log('  Native: npx tsx faucet.ts <network> <address> [amount]')
    console.log('  ERC20:  npx tsx faucet.ts <network> <address> <amount> <token>')
    console.log('')
    console.log('Networks: sepolia, amoy, arb-sepolia, fuji, moca-devnet')
    console.log('Tokens: usdc')
    console.log('')
    console.log('Examples:')
    console.log('  npx tsx faucet.ts fuji 0x123... 0.1        # Send 0.1 AVAX')
    console.log('  npx tsx faucet.ts fuji 0x123... 0.01 usdc  # Send 0.01 USDC')
    process.exit(1)
  }

  const [networkName, toAddress, amountStr = '0.1', tokenName] = args
  const isERC20 = !!tokenName

  // Validate network
  if (!Object.keys(NETWORKS).includes(networkName)) {
    console.error(`Invalid network: ${networkName}`)
    console.error(`Valid networks: ${Object.keys(NETWORKS).join(', ')}`)
    process.exit(1)
  }

  // Validate address
  if (!toAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    console.error(`Invalid address: ${toAddress}`)
    process.exit(1)
  }

  // Validate token if specified
  if (isERC20) {
    const networkTokens = TOKENS[networkName]
    if (!networkTokens || !networkTokens[tokenName.toLowerCase()]) {
      console.error(`Token ${tokenName} not configured for network ${networkName}`)
      const availableTokens = networkTokens ? Object.keys(networkTokens).join(', ') : 'none'
      console.error(`Available tokens: ${availableTokens}`)
      process.exit(1)
    }
  }

  // Get private key
  const privateKey = process.env.FAUCET_PRIVATE_KEY
  if (!privateKey) {
    console.error('FAUCET_PRIVATE_KEY not found in .env file')
    console.error('Add FAUCET_PRIVATE_KEY=0x... to your root .env file')
    process.exit(1)
  }

  // Validate private key format
  const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`
  if (!formattedKey.match(/^0x[a-fA-F0-9]{64}$/)) {
    console.error('Invalid private key format')
    process.exit(1)
  }

  const network = NETWORKS[networkName as NetworkName]
  const token = isERC20 ? TOKENS[networkName][tokenName.toLowerCase()] : null

  console.log(`\n🚰 Faucet Drip`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`Network:  ${networkName}`)
  console.log(`To:       ${toAddress}`)
  console.log(`Amount:   ${amountStr} ${token ? token.symbol : network.nativeSymbol}`)
  if (token) {
    console.log(`Token:    ${token.address}`)
  }
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  try {
    // Create account and clients
    const account = privateKeyToAccount(formattedKey as `0x${string}`)

    const publicClient = createPublicClient({
      chain: network.chain as any,
      transport: http(network.rpc),
    })

    const walletClient = createWalletClient({
      account,
      chain: network.chain as any,
      transport: http(network.rpc),
    })

    console.log(`Faucet wallet: ${account.address}`)

    if (isERC20 && token) {
      // ERC20 Transfer
      const amount = parseUnits(amountStr, token.decimals)

      // Check token balance
      const tokenBalance = await publicClient.readContract({
        address: token.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [account.address],
      })

      console.log(`Token balance: ${formatUnits(tokenBalance, token.decimals)} ${token.symbol}`)

      if (tokenBalance < amount) {
        console.error(`\n❌ Insufficient token balance`)
        console.error(`Need: ${amountStr} ${token.symbol}, Have: ${formatUnits(tokenBalance, token.decimals)} ${token.symbol}`)
        process.exit(1)
      }

      // Send ERC20 transfer
      console.log(`\n📤 Sending ${token.symbol} transfer...`)

      const hash = await walletClient.writeContract({
        address: token.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [toAddress as `0x${string}`, amount],
      })

      console.log(`Transaction hash: ${hash}`)
      console.log(`Explorer: ${network.explorer}/tx/${hash}`)

      // Wait for confirmation
      console.log(`\n⏳ Waiting for confirmation...`)

      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      if (receipt.status === 'success') {
        console.log(`\n✅ Success! Sent ${amountStr} ${token.symbol} to ${toAddress}`)
        console.log(`Gas used: ${receipt.gasUsed.toString()}`)
      } else {
        console.error(`\n❌ Transaction reverted`)
        process.exit(1)
      }

    } else {
      // Native token transfer
      const amount = parseEther(amountStr)

      // Check native balance
      const faucetBalance = await publicClient.getBalance({ address: account.address })
      console.log(`Native balance: ${formatEther(faucetBalance)} ${network.nativeSymbol}`)

      if (faucetBalance < amount) {
        console.error(`\n❌ Insufficient faucet balance`)
        console.error(`Need: ${amountStr} ${network.nativeSymbol}, Have: ${formatEther(faucetBalance)} ${network.nativeSymbol}`)
        process.exit(1)
      }

      // Send native transfer
      console.log(`\n📤 Sending ${network.nativeSymbol}...`)

      const hash = await walletClient.sendTransaction({
        to: toAddress as `0x${string}`,
        value: amount,
      })

      console.log(`Transaction hash: ${hash}`)
      console.log(`Explorer: ${network.explorer}/tx/${hash}`)

      // Wait for confirmation
      console.log(`\n⏳ Waiting for confirmation...`)

      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      if (receipt.status === 'success') {
        console.log(`\n✅ Success! Sent ${amountStr} ${network.nativeSymbol} to ${toAddress}`)
        console.log(`Gas used: ${receipt.gasUsed.toString()}`)
      } else {
        console.error(`\n❌ Transaction reverted`)
        process.exit(1)
      }
    }

  } catch (error) {
    console.error(`\n❌ Error:`, error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
