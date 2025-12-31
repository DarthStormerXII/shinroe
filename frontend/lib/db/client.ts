import Database from 'better-sqlite3'
import path from 'path'
import { createTables } from './migrations'

// Initialize SQLite database
const dbPath = path.join(process.cwd(), 'data', 'app.db')
let db: Database.Database

try {
  // Ensure data directory exists
  const fs = require('fs')
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  db = new Database(dbPath)

  // Enable foreign keys
  db.pragma('foreign_keys = ON')

  // Create tables if they don't exist
  createTables(db)

  console.log('✅ SQLite database initialized successfully')
} catch (error) {
  console.error('❌ Failed to initialize SQLite database:', error)
  throw error
}

export { db }

// Helper function to get table name (kept for compatibility)
export function getTableName(tableName: string): string {
  return tableName
}

// Table names
export const TABLES = {
  users: 'users',
  transactions: 'transactions',
  tokens: 'tokens',
  nfts: 'nfts',
} as const