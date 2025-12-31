import { NextRequest, NextResponse } from 'next/server'
import {
  getAllTables,
  getTableData,
  searchTableData,
  getDatabaseStats,
  insertRow,
  updateRow,
  deleteRow,
  executeReadOnlyQuery,
  initializeDatabaseWithSeed,
} from '@/lib/db/operations'

// GET /api/db - Get tables list, table data, or stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'tables': {
        const tables = getAllTables()
        return NextResponse.json({ success: true, data: tables })
      }

      case 'table-data': {
        const tableName = searchParams.get('tableName')
        const page = parseInt(searchParams.get('page') || '0')
        const limit = parseInt(searchParams.get('limit') || '50')
        const searchTerm = searchParams.get('search')

        if (!tableName) {
          return NextResponse.json(
            { success: false, error: 'Table name is required' },
            { status: 400 }
          )
        }

        const result = searchTerm
          ? searchTableData(tableName, searchTerm, page, limit)
          : getTableData(tableName, page, limit)

        return NextResponse.json({ success: true, data: result })
      }

      case 'stats': {
        const stats = getDatabaseStats()
        return NextResponse.json({ success: true, data: stats })
      }

      case 'init-seed': {
        const seeded = initializeDatabaseWithSeed()
        return NextResponse.json({ success: true, seeded })
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Database API error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/db - Insert row, update row, delete row, or execute query
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'insert': {
        const { tableName, data } = body
        if (!tableName || !data) {
          return NextResponse.json(
            { success: false, error: 'Table name and data are required' },
            { status: 400 }
          )
        }

        const success = insertRow(tableName, data)
        return NextResponse.json({ success })
      }

      case 'update': {
        const { tableName, id, data, idColumn } = body
        if (!tableName || !id || !data) {
          return NextResponse.json(
            { success: false, error: 'Table name, id, and data are required' },
            { status: 400 }
          )
        }

        const success = updateRow(tableName, id, data, idColumn)
        return NextResponse.json({ success })
      }

      case 'delete': {
        const { tableName, id, idColumn } = body
        if (!tableName || !id) {
          return NextResponse.json(
            { success: false, error: 'Table name and id are required' },
            { status: 400 }
          )
        }

        const success = deleteRow(tableName, id, idColumn)
        return NextResponse.json({ success })
      }

      case 'query': {
        const { query } = body
        if (!query) {
          return NextResponse.json(
            { success: false, error: 'Query is required' },
            { status: 400 }
          )
        }

        const result = executeReadOnlyQuery(query)
        return NextResponse.json({ success: true, data: result })
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Database API error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
