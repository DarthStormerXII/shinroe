import Database from 'better-sqlite3'

export function createTables(db: Database.Database) {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      wallet_address TEXT NOT NULL UNIQUE,
      ens_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Transactions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT NOT NULL,
      transaction_hash TEXT NOT NULL UNIQUE,
      from_address TEXT NOT NULL,
      to_address TEXT NOT NULL,
      value TEXT NOT NULL,
      gas_used TEXT,
      status TEXT CHECK(status IN ('pending', 'confirmed', 'failed')) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `)

  // Tokens table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tokens (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT NOT NULL,
      token_address TEXT NOT NULL,
      symbol TEXT NOT NULL,
      name TEXT NOT NULL,
      decimals INTEGER NOT NULL,
      balance TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, token_address),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `)

  // NFTs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS nfts (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT NOT NULL,
      contract_address TEXT NOT NULL,
      token_id TEXT NOT NULL,
      name TEXT,
      description TEXT,
      image_url TEXT,
      metadata TEXT, -- JSON stored as TEXT
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, contract_address, token_id),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `)

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
    CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(transaction_hash);
    CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
    CREATE INDEX IF NOT EXISTS idx_tokens_user_id ON tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_tokens_address ON tokens(token_address);
    CREATE INDEX IF NOT EXISTS idx_nfts_user_id ON nfts(user_id);
    CREATE INDEX IF NOT EXISTS idx_nfts_contract ON nfts(contract_address);
  `)

  // Smart Contracts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS smart_contracts (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      name TEXT NOT NULL,
      address TEXT NOT NULL UNIQUE,
      network TEXT NOT NULL,
      abi TEXT, -- JSON ABI stored as TEXT
      verified BOOLEAN DEFAULT FALSE,
      compiler_version TEXT,
      deployment_tx TEXT,
      deployer_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // User Activity/Events table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_activities (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT NOT NULL,
      activity_type TEXT NOT NULL, -- 'transaction', 'swap', 'stake', 'vote', etc.
      description TEXT NOT NULL,
      metadata TEXT, -- JSON stored as TEXT for extra data
      value_usd REAL,
      gas_used TEXT,
      block_number INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `)

  // DeFi Positions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS defi_positions (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT NOT NULL,
      protocol TEXT NOT NULL, -- 'uniswap', 'aave', 'compound', etc.
      position_type TEXT NOT NULL, -- 'liquidity', 'lending', 'borrowing', 'staking'
      token_symbols TEXT NOT NULL, -- 'ETH-USDC', 'AAVE', etc.
      amount TEXT NOT NULL,
      value_usd REAL,
      apy REAL,
      health_factor REAL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `)

  // Saved Queries table (for subgraph queries)
  db.exec(`
    CREATE TABLE IF NOT EXISTS saved_queries (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      query_type TEXT NOT NULL, -- 'graphql', 'sql', 'rest'
      query_content TEXT NOT NULL,
      subgraph_id TEXT,
      is_favorite BOOLEAN DEFAULT FALSE,
      execution_count INTEGER DEFAULT 0,
      last_executed DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
    )
  `)

  // Bookmarks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      category TEXT, -- 'dapp', 'tool', 'documentation', 'explorer'
      tags TEXT, -- JSON array stored as TEXT
      favicon_url TEXT,
      is_favorite BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
    )
  `)

  // Portfolio Snapshots table
  db.exec(`
    CREATE TABLE IF NOT EXISTS portfolio_snapshots (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT NOT NULL,
      total_value_usd REAL NOT NULL,
      token_count INTEGER DEFAULT 0,
      nft_count INTEGER DEFAULT 0,
      defi_value_usd REAL DEFAULT 0,
      snapshot_data TEXT, -- JSON stored as TEXT
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `)

  // Networks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS networks (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      name TEXT NOT NULL UNIQUE,
      chain_id INTEGER NOT NULL UNIQUE,
      symbol TEXT NOT NULL,
      rpc_url TEXT NOT NULL,
      explorer_url TEXT,
      is_testnet BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      block_time_seconds INTEGER DEFAULT 12,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create additional indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_smart_contracts_address ON smart_contracts(address);
    CREATE INDEX IF NOT EXISTS idx_smart_contracts_network ON smart_contracts(network);
    CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);
    CREATE INDEX IF NOT EXISTS idx_user_activities_timestamp ON user_activities(timestamp);
    CREATE INDEX IF NOT EXISTS idx_defi_positions_user_id ON defi_positions(user_id);
    CREATE INDEX IF NOT EXISTS idx_defi_positions_protocol ON defi_positions(protocol);
    CREATE INDEX IF NOT EXISTS idx_defi_positions_active ON defi_positions(is_active);
    CREATE INDEX IF NOT EXISTS idx_saved_queries_user_id ON saved_queries(user_id);
    CREATE INDEX IF NOT EXISTS idx_saved_queries_type ON saved_queries(query_type);
    CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
    CREATE INDEX IF NOT EXISTS idx_bookmarks_category ON bookmarks(category);
    CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_user_id ON portfolio_snapshots(user_id);
    CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_date ON portfolio_snapshots(created_at);
    CREATE INDEX IF NOT EXISTS idx_networks_chain_id ON networks(chain_id);
  `)

  // Create triggers for updated_at
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_users_updated_at
    AFTER UPDATE ON users
    BEGIN
      UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `)

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_tokens_updated_at
    AFTER UPDATE ON tokens
    BEGIN
      UPDATE tokens SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `)

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_nfts_updated_at
    AFTER UPDATE ON nfts
    BEGIN
      UPDATE nfts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `)

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_smart_contracts_updated_at
    AFTER UPDATE ON smart_contracts
    BEGIN
      UPDATE smart_contracts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `)

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_defi_positions_updated_at
    AFTER UPDATE ON defi_positions
    BEGIN
      UPDATE defi_positions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `)

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_saved_queries_updated_at
    AFTER UPDATE ON saved_queries
    BEGIN
      UPDATE saved_queries SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `)

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_bookmarks_updated_at
    AFTER UPDATE ON bookmarks
    BEGIN
      UPDATE bookmarks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `)

  // User metadata table for Shinroe (off-chain profile data)
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_metadata (
      address TEXT PRIMARY KEY,
      display_name TEXT,
      avatar_url TEXT,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_user_metadata_display_name ON user_metadata(display_name);
  `)

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_user_metadata_updated_at
    AFTER UPDATE ON user_metadata
    BEGIN
      UPDATE user_metadata SET updated_at = CURRENT_TIMESTAMP WHERE address = NEW.address;
    END;
  `)
}