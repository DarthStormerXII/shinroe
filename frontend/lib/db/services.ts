import { db } from './client'
import type { Database } from '../types/db/database.types'

type UsersInsert = Database['public']['Tables']['users']['Insert']
type UsersRow = Database['public']['Tables']['users']['Row']
type TransactionsInsert = Database['public']['Tables']['transactions']['Insert']
type TransactionsRow = Database['public']['Tables']['transactions']['Row']
type TokensInsert = Database['public']['Tables']['tokens']['Insert']
type TokensRow = Database['public']['Tables']['tokens']['Row']
type NftsInsert = Database['public']['Tables']['nfts']['Insert']
type NftsRow = Database['public']['Tables']['nfts']['Row']

// Type for NFT metadata
type NFTMetadata = {
  name?: string
  description?: string
  image?: string
  attributes?: Array<{ trait_type: string; value: string | number }>
  [key: string]: unknown
}

// User service functions
export const userService = {
  createUser(walletAddress: string, ensName?: string): UsersRow {
    const stmt = db.prepare(`
      INSERT INTO users (wallet_address, ens_name)
      VALUES (?, ?)
      RETURNING *
    `)

    try {
      return stmt.get(walletAddress.toLowerCase(), ensName || null) as UsersRow
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error(`User with wallet address ${walletAddress} already exists`)
      }
      throw error
    }
  },

  getUserByWallet(walletAddress: string): UsersRow | null {
    const stmt = db.prepare(`
      SELECT * FROM users WHERE wallet_address = ?
    `)

    const result = stmt.get(walletAddress.toLowerCase()) as UsersRow | undefined
    return result || null
  },

  updateUser(userId: string, updates: { ens_name?: string }): UsersRow {
    const stmt = db.prepare(`
      UPDATE users
      SET ens_name = COALESCE(?, ens_name)
      WHERE id = ?
      RETURNING *
    `)

    const result = stmt.get(updates.ens_name || null, userId) as UsersRow | undefined
    if (!result) {
      throw new Error(`User with id ${userId} not found`)
    }
    return result
  },
}

// Transaction service functions
export const transactionService = {
  createTransaction(transaction: {
    user_id: string
    transaction_hash: string
    from_address: string
    to_address: string
    value: string
  }): TransactionsRow {
    const stmt = db.prepare(`
      INSERT INTO transactions (user_id, transaction_hash, from_address, to_address, value)
      VALUES (?, ?, ?, ?, ?)
      RETURNING *
    `)

    try {
      return stmt.get(
        transaction.user_id,
        transaction.transaction_hash,
        transaction.from_address,
        transaction.to_address,
        transaction.value
      ) as TransactionsRow
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error(`Transaction with hash ${transaction.transaction_hash} already exists`)
      }
      if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
        throw new Error(`User with id ${transaction.user_id} not found`)
      }
      throw error
    }
  },

  getUserTransactions(userId: string, limit = 10): TransactionsRow[] {
    const stmt = db.prepare(`
      SELECT * FROM transactions
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `)

    return stmt.all(userId, limit) as TransactionsRow[]
  },

  updateTransactionStatus(
    transactionHash: string,
    status: 'pending' | 'confirmed' | 'failed',
    gasUsed?: string
  ): TransactionsRow {
    const stmt = db.prepare(`
      UPDATE transactions
      SET status = ?, gas_used = ?
      WHERE transaction_hash = ?
      RETURNING *
    `)

    const result = stmt.get(status, gasUsed || null, transactionHash) as TransactionsRow | undefined
    if (!result) {
      throw new Error(`Transaction with hash ${transactionHash} not found`)
    }
    return result
  },
}

// Token service functions
export const tokenService = {
  upsertToken(token: {
    user_id: string
    token_address: string
    symbol: string
    name: string
    decimals: number
    balance: string
  }): TokensRow {
    // First try to update existing token
    const updateStmt = db.prepare(`
      UPDATE tokens
      SET symbol = ?, name = ?, decimals = ?, balance = ?
      WHERE user_id = ? AND token_address = ?
      RETURNING *
    `)

    const updated = updateStmt.get(
      token.symbol,
      token.name,
      token.decimals,
      token.balance,
      token.user_id,
      token.token_address.toLowerCase()
    ) as TokensRow | undefined

    if (updated) {
      return updated
    }

    // If no update happened, insert new token
    const insertStmt = db.prepare(`
      INSERT INTO tokens (user_id, token_address, symbol, name, decimals, balance)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING *
    `)

    try {
      return insertStmt.get(
        token.user_id,
        token.token_address.toLowerCase(),
        token.symbol,
        token.name,
        token.decimals,
        token.balance
      ) as TokensRow
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
        throw new Error(`User with id ${token.user_id} not found`)
      }
      throw error
    }
  },

  getUserTokens(userId: string): TokensRow[] {
    const stmt = db.prepare(`
      SELECT * FROM tokens
      WHERE user_id = ?
      ORDER BY CAST(balance AS REAL) DESC
    `)

    return stmt.all(userId) as TokensRow[]
  },
}

// NFT service functions
export const nftService = {
  upsertNFT(nft: {
    user_id: string
    contract_address: string
    token_id: string
    name?: string
    description?: string
    image_url?: string
    metadata?: NFTMetadata
  }): NftsRow {
    // First try to update existing NFT
    const updateStmt = db.prepare(`
      UPDATE nfts
      SET name = ?, description = ?, image_url = ?, metadata = ?
      WHERE user_id = ? AND contract_address = ? AND token_id = ?
      RETURNING *
    `)

    const updated = updateStmt.get(
      nft.name || null,
      nft.description || null,
      nft.image_url || null,
      nft.metadata ? JSON.stringify(nft.metadata) : null,
      nft.user_id,
      nft.contract_address.toLowerCase(),
      nft.token_id
    ) as NftsRow | undefined

    if (updated) {
      // Parse metadata back to object for return
      if (updated.metadata) {
        updated.metadata = JSON.parse(updated.metadata as string)
      }
      return updated
    }

    // If no update happened, insert new NFT
    const insertStmt = db.prepare(`
      INSERT INTO nfts (user_id, contract_address, token_id, name, description, image_url, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `)

    try {
      const result = insertStmt.get(
        nft.user_id,
        nft.contract_address.toLowerCase(),
        nft.token_id,
        nft.name || null,
        nft.description || null,
        nft.image_url || null,
        nft.metadata ? JSON.stringify(nft.metadata) : null
      ) as NftsRow

      // Parse metadata back to object for return
      if (result.metadata) {
        result.metadata = JSON.parse(result.metadata as string)
      }
      return result
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
        throw new Error(`User with id ${nft.user_id} not found`)
      }
      throw error
    }
  },

  getUserNFTs(userId: string, limit = 20): NftsRow[] {
    const stmt = db.prepare(`
      SELECT * FROM nfts
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `)

    const results = stmt.all(userId, limit) as NftsRow[]

    // Parse metadata for each NFT
    return results.map(nft => ({
      ...nft,
      metadata: nft.metadata ? JSON.parse(nft.metadata as string) : null
    }))
  },
}