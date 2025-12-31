import { db } from './client'

export interface TableInfo {
  name: string
  count: number
  columns: ColumnInfo[]
}

export interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
  primaryKey: boolean
}

export interface TableRow {
  [key: string]: any
}

// Get all table information
export function getAllTables(): TableInfo[] {
  try {
    // Get all table names
    const tables = db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).all() as { name: string }[]

    return tables.map(table => {
      // Get column information
      const columns = db.pragma(`table_info(${table.name})`) as any[]
      const columnInfo: ColumnInfo[] = columns.map(col => ({
        name: col.name,
        type: col.type,
        nullable: col.notnull === 0,
        primaryKey: col.pk === 1
      }))

      // Get row count
      const countResult = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get() as { count: number }

      return {
        name: table.name,
        count: countResult.count,
        columns: columnInfo
      }
    })
  } catch (error) {
    console.error('Error getting tables:', error)
    return []
  }
}

// Get table data with pagination
export function getTableData(
  tableName: string,
  page: number = 0,
  limit: number = 50,
  orderBy?: string,
  orderDirection: 'ASC' | 'DESC' = 'ASC'
): { data: TableRow[], totalCount: number } {
  try {
    // Validate table name to prevent SQL injection
    const validTables = getAllTables().map(t => t.name)
    if (!validTables.includes(tableName)) {
      throw new Error(`Invalid table name: ${tableName}`)
    }

    // Get total count
    const countResult = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get() as { count: number }

    // Build query
    let query = `SELECT * FROM ${tableName}`

    if (orderBy) {
      // Validate column name
      const tableInfo = getAllTables().find(t => t.name === tableName)
      const validColumns = tableInfo?.columns.map(c => c.name) || []
      if (validColumns.includes(orderBy)) {
        query += ` ORDER BY ${orderBy} ${orderDirection}`
      }
    } else {
      // Default ordering by first column
      query += ` ORDER BY rowid ${orderDirection}`
    }

    query += ` LIMIT ${limit} OFFSET ${page * limit}`

    const data = db.prepare(query).all() as TableRow[]

    return {
      data,
      totalCount: countResult.count
    }
  } catch (error) {
    console.error(`Error getting data for table ${tableName}:`, error)
    return { data: [], totalCount: 0 }
  }
}

// Search table data
export function searchTableData(
  tableName: string,
  searchTerm: string,
  page: number = 0,
  limit: number = 50
): { data: TableRow[], totalCount: number } {
  try {
    const validTables = getAllTables().map(t => t.name)
    if (!validTables.includes(tableName)) {
      throw new Error(`Invalid table name: ${tableName}`)
    }

    const tableInfo = getAllTables().find(t => t.name === tableName)
    if (!tableInfo) {
      return { data: [], totalCount: 0 }
    }

    // Build search conditions for text columns
    const textColumns = tableInfo.columns
      .filter(col => col.type.toLowerCase().includes('text') || col.type.toLowerCase().includes('varchar'))
      .map(col => col.name)

    if (textColumns.length === 0) {
      return getTableData(tableName, page, limit)
    }

    const searchConditions = textColumns
      .map(col => `${col} LIKE ?`)
      .join(' OR ')

    const searchValue = `%${searchTerm}%`
    const searchParams = Array(textColumns.length).fill(searchValue)

    // Count total matching records
    const countQuery = `SELECT COUNT(*) as count FROM ${tableName} WHERE ${searchConditions}`
    const countResult = db.prepare(countQuery).get(...searchParams) as { count: number }

    // Get paginated data
    const dataQuery = `
      SELECT * FROM ${tableName}
      WHERE ${searchConditions}
      ORDER BY rowid ASC
      LIMIT ${limit} OFFSET ${page * limit}
    `
    const data = db.prepare(dataQuery).all(...searchParams) as TableRow[]

    return {
      data,
      totalCount: countResult.count
    }
  } catch (error) {
    console.error(`Error searching table ${tableName}:`, error)
    return { data: [], totalCount: 0 }
  }
}

// Insert a new row
export function insertRow(tableName: string, data: Record<string, any>): boolean {
  try {
    const validTables = getAllTables().map(t => t.name)
    if (!validTables.includes(tableName)) {
      throw new Error(`Invalid table name: ${tableName}`)
    }

    const columns = Object.keys(data).join(', ')
    const placeholders = Object.keys(data).map(() => '?').join(', ')
    const values = Object.values(data)

    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`
    db.prepare(query).run(...values)

    return true
  } catch (error) {
    console.error(`Error inserting row into ${tableName}:`, error)
    return false
  }
}

// Update a row
export function updateRow(
  tableName: string,
  id: string | number,
  data: Record<string, any>,
  idColumn: string = 'id'
): boolean {
  try {
    const validTables = getAllTables().map(t => t.name)
    if (!validTables.includes(tableName)) {
      throw new Error(`Invalid table name: ${tableName}`)
    }

    const updateColumns = Object.keys(data)
      .map(key => `${key} = ?`)
      .join(', ')
    const values = [...Object.values(data), id]

    const query = `UPDATE ${tableName} SET ${updateColumns} WHERE ${idColumn} = ?`
    const result = db.prepare(query).run(...values)

    return result.changes > 0
  } catch (error) {
    console.error(`Error updating row in ${tableName}:`, error)
    return false
  }
}

// Delete a row
export function deleteRow(
  tableName: string,
  id: string | number,
  idColumn: string = 'id'
): boolean {
  try {
    const validTables = getAllTables().map(t => t.name)
    if (!validTables.includes(tableName)) {
      throw new Error(`Invalid table name: ${tableName}`)
    }

    const query = `DELETE FROM ${tableName} WHERE ${idColumn} = ?`
    const result = db.prepare(query).run(id)

    return result.changes > 0
  } catch (error) {
    console.error(`Error deleting row from ${tableName}:`, error)
    return false
  }
}

// Get a single row by ID
export function getRowById(
  tableName: string,
  id: string | number,
  idColumn: string = 'id'
): TableRow | null {
  try {
    const validTables = getAllTables().map(t => t.name)
    if (!validTables.includes(tableName)) {
      throw new Error(`Invalid table name: ${tableName}`)
    }

    const query = `SELECT * FROM ${tableName} WHERE ${idColumn} = ?`
    const row = db.prepare(query).get(id) as TableRow | undefined

    return row || null
  } catch (error) {
    console.error(`Error getting row from ${tableName}:`, error)
    return null
  }
}

// Execute custom SQL query (read-only for safety)
export function executeReadOnlyQuery(query: string): TableRow[] {
  try {
    // Basic validation to prevent write operations
    const lowerQuery = query.toLowerCase().trim()
    const writeOperations = ['insert', 'update', 'delete', 'drop', 'create', 'alter', 'truncate']

    if (writeOperations.some(op => lowerQuery.startsWith(op))) {
      throw new Error('Write operations are not allowed')
    }

    const result = db.prepare(query).all() as TableRow[]
    return result
  } catch (error) {
    console.error('Error executing query:', error)
    throw error
  }
}

// Get database statistics
export function getDatabaseStats(): {
  totalTables: number
  totalRows: number
  tableStats: { name: string; rows: number }[]
  databaseSize: string
} {
  try {
    const tables = getAllTables()
    const totalTables = tables.length
    const totalRows = tables.reduce((sum, table) => sum + table.count, 0)

    const tableStats = tables.map(table => ({
      name: table.name,
      rows: table.count
    }))

    // Get database file size (approximate)
    const pageCount = db.pragma('page_count') as number
    const pageSize = db.pragma('page_size') as number
    const databaseSizeBytes = pageCount * pageSize
    const databaseSize = formatBytes(databaseSizeBytes)

    return {
      totalTables,
      totalRows,
      tableStats,
      databaseSize
    }
  } catch (error) {
    console.error('Error getting database stats:', error)
    return {
      totalTables: 0,
      totalRows: 0,
      tableStats: [],
      databaseSize: '0 B'
    }
  }
}

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Seed the database if it's empty
export function initializeDatabaseWithSeed(): boolean {
  try {
    const stats = getDatabaseStats()

    // Only seed if database is empty
    if (stats.totalRows === 0) {
      console.log('Database is empty, seeding with dummy data...')

      // Import and run seed function
      import('./seed').then(({ seedDatabase }) => {
        seedDatabase(db)
      })

      return true
    }

    return false
  } catch (error) {
    console.error('Error initializing database:', error)
    return false
  }
}