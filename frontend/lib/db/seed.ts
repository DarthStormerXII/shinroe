import Database from 'better-sqlite3'

export function seedDatabase(db: Database.Database) {
  console.log('🌱 Seeding database with dummy data...')

  // Clear existing data first
  db.exec(`DELETE FROM portfolio_snapshots`)
  db.exec(`DELETE FROM defi_positions`)
  db.exec(`DELETE FROM user_activities`)
  db.exec(`DELETE FROM saved_queries`)
  db.exec(`DELETE FROM bookmarks`)
  db.exec(`DELETE FROM nfts`)
  db.exec(`DELETE FROM tokens`)
  db.exec(`DELETE FROM transactions`)
  db.exec(`DELETE FROM smart_contracts`)
  db.exec(`DELETE FROM networks`)
  db.exec(`DELETE FROM users`)

  // Seed Networks first
  const networks = [
    { name: 'Ethereum', chain_id: 1, symbol: 'ETH', rpc_url: 'https://eth-mainnet.g.alchemy.com/v2/', explorer_url: 'https://etherscan.io', is_testnet: false },
    { name: 'Polygon', chain_id: 137, symbol: 'MATIC', rpc_url: 'https://polygon-rpc.com', explorer_url: 'https://polygonscan.com', is_testnet: false },
    { name: 'Arbitrum', chain_id: 42161, symbol: 'ETH', rpc_url: 'https://arb1.arbitrum.io/rpc', explorer_url: 'https://arbiscan.io', is_testnet: false },
    { name: 'Base', chain_id: 8453, symbol: 'ETH', rpc_url: 'https://mainnet.base.org', explorer_url: 'https://basescan.org', is_testnet: false },
    { name: 'Sepolia', chain_id: 11155111, symbol: 'ETH', rpc_url: 'https://eth-sepolia.g.alchemy.com/v2/', explorer_url: 'https://sepolia.etherscan.io', is_testnet: true }
  ]

  networks.forEach(network => {
    db.prepare(`
      INSERT INTO networks (name, chain_id, symbol, rpc_url, explorer_url, is_testnet)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(network.name, network.chain_id, network.symbol, network.rpc_url, network.explorer_url, network.is_testnet)
  })

  // Seed Users
  const users = [
    { wallet_address: '0x742d35Cc6634C0532925a3b8D98Ba213b9B15F2E', ens_name: 'alice.eth' },
    { wallet_address: '0x8ba1f109551bD432803012645Hac136c22C54B89', ens_name: 'bob.eth' },
    { wallet_address: '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db', ens_name: 'charlie.eth' },
    { wallet_address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', ens_name: null },
    { wallet_address: '0x7c9f4C87d911613Fe9ca58b579f737911AAD2D43', ens_name: 'defi_master.eth' }
  ]

  const userIds: string[] = []
  users.forEach(user => {
    const result = db.prepare(`
      INSERT INTO users (wallet_address, ens_name)
      VALUES (?, ?)
    `).run(user.wallet_address, user.ens_name)
    userIds.push(String(result.lastInsertRowid))
  })

  // Seed Smart Contracts
  const contracts = [
    {
      name: 'Uniswap V3 Router',
      address: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
      network: 'Ethereum',
      verified: true,
      compiler_version: '0.8.19',
      deployment_tx: '0x123abc...',
      deployer_address: '0x1F9840a85d5aF5bf1D1762F925BDADdC4201F984'
    },
    {
      name: 'AAVE Lending Pool',
      address: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
      network: 'Ethereum',
      verified: true,
      compiler_version: '0.8.10',
      deployment_tx: '0x456def...',
      deployer_address: '0x25F2226B597E8F9514B3F68F00f494cF4f273430'
    },
    {
      name: 'Custom Counter',
      address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
      network: 'Sepolia',
      verified: false,
      compiler_version: '0.8.26',
      deployment_tx: '0x789ghi...',
      deployer_address: userIds[0]
    }
  ]

  contracts.forEach(contract => {
    db.prepare(`
      INSERT INTO smart_contracts (name, address, network, verified, compiler_version, deployment_tx, deployer_address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(contract.name, contract.address, contract.network, contract.verified, contract.compiler_version, contract.deployment_tx, contract.deployer_address)
  })

  // Seed Transactions
  const transactions = [
    {
      user_id: userIds[0],
      transaction_hash: '0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
      from_address: users[0].wallet_address,
      to_address: '0xA0b86a33E6417c3C4C6b3F23C4A18BE9b3d90B82',
      value: '1500000000000000000',
      gas_used: '21000',
      status: 'confirmed'
    },
    {
      user_id: userIds[1],
      transaction_hash: '0xb2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567a',
      from_address: users[1].wallet_address,
      to_address: contracts[0].address,
      value: '500000000000000000',
      gas_used: '85000',
      status: 'confirmed'
    },
    {
      user_id: userIds[2],
      transaction_hash: '0xc3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567ab2',
      from_address: users[2].wallet_address,
      to_address: users[3].wallet_address,
      value: '2500000000000000000',
      gas_used: '21000',
      status: 'pending'
    }
  ]

  transactions.forEach(tx => {
    db.prepare(`
      INSERT INTO transactions (user_id, transaction_hash, from_address, to_address, value, gas_used, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(tx.user_id, tx.transaction_hash, tx.from_address, tx.to_address, tx.value, tx.gas_used, tx.status)
  })

  // Seed Tokens
  const tokens = [
    { user_id: userIds[0], token_address: '0xA0b86a33E6417c3C4C6b3F23C4A18BE9b3d90B82', symbol: 'USDC', name: 'USD Coin', decimals: 6, balance: '1500000000' },
    { user_id: userIds[0], token_address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18, balance: '850000000000000000000' },
    { user_id: userIds[1], token_address: '0xA0b86a33E6417c3C4C6b3F23C4A18BE9b3d90B82', symbol: 'USDC', name: 'USD Coin', decimals: 6, balance: '2500000000' },
    { user_id: userIds[1], token_address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', symbol: 'UNI', name: 'Uniswap', decimals: 18, balance: '45000000000000000000' },
    { user_id: userIds[2], token_address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', symbol: 'AAVE', name: 'Aave Token', decimals: 18, balance: '12000000000000000000' }
  ]

  tokens.forEach(token => {
    db.prepare(`
      INSERT INTO tokens (user_id, token_address, symbol, name, decimals, balance)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(token.user_id, token.token_address, token.symbol, token.name, token.decimals, token.balance)
  })

  // Seed NFTs
  const nfts = [
    {
      user_id: userIds[0],
      contract_address: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
      token_id: '1234',
      name: 'Bored Ape #1234',
      description: 'A cool ape with sunglasses and hat',
      image_url: 'https://ipfs.io/ipfs/QmRRPWG96cmgTn2qSzjwr2qvfNEuhunv6FNeMFGa9bx6mQ',
      metadata: JSON.stringify({ attributes: [{ trait_type: 'Background', value: 'Blue' }] })
    },
    {
      user_id: userIds[1],
      contract_address: '0x60E4d786628Fea6478F785A6d7e704777c86a7c6',
      token_id: '5678',
      name: 'Mutant Ape #5678',
      description: 'A mutant ape with laser eyes',
      image_url: 'https://ipfs.io/ipfs/QmPbxeGcXhYQQNgsC6a36dDyYUcHgMLnGKnF8pVFmGsvqi',
      metadata: JSON.stringify({ attributes: [{ trait_type: 'Eyes', value: 'Laser' }] })
    },
    {
      user_id: userIds[2],
      contract_address: '0x348FC118bcC65a92dC033A951aF153d14D945312',
      token_id: '91',
      name: 'Cryptopunk #91',
      description: 'A rare alien punk',
      image_url: 'https://ipfs.io/ipfs/QmbvQFJv5SFMfqPjMPRdLAZ9r6KUCkFjSmWZtA8PnCiGwf',
      metadata: JSON.stringify({ attributes: [{ trait_type: 'Type', value: 'Alien' }] })
    }
  ]

  nfts.forEach(nft => {
    db.prepare(`
      INSERT INTO nfts (user_id, contract_address, token_id, name, description, image_url, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(nft.user_id, nft.contract_address, nft.token_id, nft.name, nft.description, nft.image_url, nft.metadata)
  })

  // Seed User Activities
  const activities = [
    { user_id: userIds[0], activity_type: 'swap', description: 'Swapped 1.5 ETH for 2,800 USDC on Uniswap', value_usd: 2800, gas_used: '85000', block_number: 18500000 },
    { user_id: userIds[0], activity_type: 'transaction', description: 'Sent 0.5 ETH to alice.eth', value_usd: 950, gas_used: '21000', block_number: 18500123 },
    { user_id: userIds[1], activity_type: 'stake', description: 'Staked 45 UNI tokens in governance', value_usd: 270, gas_used: '65000', block_number: 18500456 },
    { user_id: userIds[1], activity_type: 'mint', description: 'Minted Mutant Ape #5678', value_usd: 1200, gas_used: '120000', block_number: 18500789 },
    { user_id: userIds[2], activity_type: 'lend', description: 'Supplied 12 AAVE to lending pool', value_usd: 1080, gas_used: '75000', block_number: 18501012 },
    { user_id: userIds[3], activity_type: 'vote', description: 'Voted on DAO proposal #42', value_usd: 0, gas_used: '45000', block_number: 18501234 }
  ]

  activities.forEach(activity => {
    db.prepare(`
      INSERT INTO user_activities (user_id, activity_type, description, value_usd, gas_used, block_number)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(activity.user_id, activity.activity_type, activity.description, activity.value_usd, activity.gas_used, activity.block_number)
  })

  // Seed DeFi Positions
  const defiPositions = [
    { user_id: userIds[0], protocol: 'Uniswap V3', position_type: 'liquidity', token_symbols: 'ETH-USDC', amount: '5.5', value_usd: 11200, apy: 24.5, health_factor: null },
    { user_id: userIds[1], protocol: 'AAVE', position_type: 'lending', token_symbols: 'USDC', amount: '2500', value_usd: 2500, apy: 3.2, health_factor: null },
    { user_id: userIds[1], protocol: 'Compound', position_type: 'borrowing', token_symbols: 'DAI', amount: '1200', value_usd: 1200, apy: 5.8, health_factor: 2.1 },
    { user_id: userIds[2], protocol: 'Lido', position_type: 'staking', token_symbols: 'stETH', amount: '8.2', value_usd: 15580, apy: 4.1, health_factor: null },
    { user_id: userIds[3], protocol: 'Curve', position_type: 'liquidity', token_symbols: '3CRV', amount: '5500', value_usd: 5500, apy: 7.8, health_factor: null }
  ]

  defiPositions.forEach(position => {
    db.prepare(`
      INSERT INTO defi_positions (user_id, protocol, position_type, token_symbols, amount, value_usd, apy, health_factor)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(position.user_id, position.protocol, position.position_type, position.token_symbols, position.amount, position.value_usd, position.apy, position.health_factor)
  })

  // Seed Saved Queries
  const savedQueries = [
    {
      user_id: userIds[0],
      name: 'Top Liquidity Pools',
      description: 'Get the highest TVL liquidity pools on Uniswap',
      query_type: 'graphql',
      query_content: `query TopPools {
  pools(orderBy: totalValueLockedUSD, orderDirection: desc, first: 10) {
    id
    token0 { symbol }
    token1 { symbol }
    totalValueLockedUSD
  }
}`,
      execution_count: 15,
      is_favorite: true
    },
    {
      user_id: userIds[1],
      name: 'User Token Balances',
      description: 'Check my current token balances',
      query_type: 'sql',
      query_content: 'SELECT symbol, name, balance FROM tokens WHERE user_id = ?',
      execution_count: 8,
      is_favorite: false
    },
    {
      user_id: userIds[0],
      name: 'Recent Swaps',
      description: 'Get recent swap transactions',
      query_type: 'graphql',
      query_content: `query RecentSwaps {
  swaps(orderBy: timestamp, orderDirection: desc, first: 20) {
    id
    amount0
    amount1
    amountUSD
    timestamp
  }
}`,
      execution_count: 23,
      is_favorite: true
    }
  ]

  savedQueries.forEach(query => {
    db.prepare(`
      INSERT INTO saved_queries (user_id, name, description, query_type, query_content, execution_count, is_favorite)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(query.user_id, query.name, query.description, query.query_type, query.query_content, query.execution_count, query.is_favorite)
  })

  // Seed Bookmarks
  const bookmarks = [
    {
      user_id: userIds[0],
      title: 'Uniswap App',
      url: 'https://app.uniswap.org',
      description: 'Decentralized trading protocol',
      category: 'dapp',
      tags: JSON.stringify(['defi', 'dex', 'trading']),
      is_favorite: true
    },
    {
      user_id: userIds[0],
      title: 'Etherscan',
      url: 'https://etherscan.io',
      description: 'Ethereum blockchain explorer',
      category: 'explorer',
      tags: JSON.stringify(['explorer', 'ethereum']),
      is_favorite: true
    },
    {
      user_id: userIds[1],
      title: 'AAVE Protocol',
      url: 'https://app.aave.com',
      description: 'Lending and borrowing protocol',
      category: 'dapp',
      tags: JSON.stringify(['defi', 'lending']),
      is_favorite: false
    },
    {
      user_id: userIds[1],
      title: 'The Graph Docs',
      url: 'https://thegraph.com/docs',
      description: 'Documentation for The Graph Protocol',
      category: 'documentation',
      tags: JSON.stringify(['docs', 'graphql', 'indexing']),
      is_favorite: false
    },
    {
      user_id: userIds[2],
      title: 'DeFi Pulse',
      url: 'https://defipulse.com',
      description: 'DeFi analytics and rankings',
      category: 'tool',
      tags: JSON.stringify(['analytics', 'defi', 'tracking']),
      is_favorite: true
    }
  ]

  bookmarks.forEach(bookmark => {
    db.prepare(`
      INSERT INTO bookmarks (user_id, title, url, description, category, tags, is_favorite)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(bookmark.user_id, bookmark.title, bookmark.url, bookmark.description, bookmark.category, bookmark.tags, bookmark.is_favorite)
  })

  // Seed Portfolio Snapshots
  const snapshots = [
    { user_id: userIds[0], total_value_usd: 15420.50, token_count: 5, nft_count: 2, defi_value_usd: 11200 },
    { user_id: userIds[1], total_value_usd: 8970.25, token_count: 3, nft_count: 1, defi_value_usd: 3700 },
    { user_id: userIds[2], total_value_usd: 22180.75, token_count: 2, nft_count: 1, defi_value_usd: 15580 },
    { user_id: userIds[3], total_value_usd: 5500.00, token_count: 0, nft_count: 0, defi_value_usd: 5500 }
  ]

  snapshots.forEach(snapshot => {
    db.prepare(`
      INSERT INTO portfolio_snapshots (user_id, total_value_usd, token_count, nft_count, defi_value_usd)
      VALUES (?, ?, ?, ?, ?)
    `).run(snapshot.user_id, snapshot.total_value_usd, snapshot.token_count, snapshot.nft_count, snapshot.defi_value_usd)
  })

  console.log('✅ Database seeded successfully!')
  console.log(`   - ${users.length} users`)
  console.log(`   - ${networks.length} networks`)
  console.log(`   - ${contracts.length} smart contracts`)
  console.log(`   - ${transactions.length} transactions`)
  console.log(`   - ${tokens.length} token balances`)
  console.log(`   - ${nfts.length} NFTs`)
  console.log(`   - ${activities.length} user activities`)
  console.log(`   - ${defiPositions.length} DeFi positions`)
  console.log(`   - ${savedQueries.length} saved queries`)
  console.log(`   - ${bookmarks.length} bookmarks`)
  console.log(`   - ${snapshots.length} portfolio snapshots`)
}