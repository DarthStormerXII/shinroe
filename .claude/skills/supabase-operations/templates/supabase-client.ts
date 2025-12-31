// ============================================================================
// TEMPLATE: Supabase Client Functions
// Replace: TABLE_NAME, TableRow, InsertTable, UpdateTable
// ============================================================================

import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Type aliases for convenience
type TableRow = Database['public']['Tables']['TABLE_NAME']['Row']
type InsertTable = Database['public']['Tables']['TABLE_NAME']['Insert']
type UpdateTable = Database['public']['Tables']['TABLE_NAME']['Update']

/**
 * Get all records for current user
 */
export async function getAll(options?: {
  limit?: number
  offset?: number
  status?: string
  orderBy?: keyof TableRow
  ascending?: boolean
}) {
  let query = supabase
    .from('TABLE_NAME')
    .select('*', { count: 'exact' })
    .order(options?.orderBy ?? 'created_at', {
      ascending: options?.ascending ?? false,
    })

  if (options?.status) {
    query = query.eq('status', options.status)
  }
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  if (options?.offset) {
    const limit = options.limit ?? 10
    query = query.range(options.offset, options.offset + limit - 1)
  }

  const { data, error, count } = await query

  if (error) throw error
  return { data: data as TableRow[], count }
}

/**
 * Get single record by ID
 */
export async function getById(id: string): Promise<TableRow | null> {
  const { data, error } = await supabase
    .from('TABLE_NAME')
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

/**
 * Create new record
 */
export async function create(data: InsertTable): Promise<TableRow> {
  const { data: record, error } = await supabase
    .from('TABLE_NAME')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return record
}

/**
 * Update record by ID
 */
export async function update(
  id: string,
  data: UpdateTable
): Promise<TableRow> {
  const { data: record, error } = await supabase
    .from('TABLE_NAME')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return record
}

/**
 * Delete record by ID
 */
export async function remove(id: string): Promise<void> {
  const { error } = await supabase
    .from('TABLE_NAME')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Upsert record (insert or update)
 */
export async function upsert(
  data: InsertTable,
  onConflict: keyof TableRow = 'id'
): Promise<TableRow> {
  const { data: record, error } = await supabase
    .from('TABLE_NAME')
    .upsert(data, { onConflict: onConflict as string })
    .select()
    .single()

  if (error) throw error
  return record
}

/**
 * Search records
 */
export async function search(
  column: keyof TableRow,
  query: string,
  options?: { limit?: number }
): Promise<TableRow[]> {
  const { data, error } = await supabase
    .from('TABLE_NAME')
    .select('*')
    .ilike(column as string, `%${query}%`)
    .limit(options?.limit ?? 20)

  if (error) throw error
  return data
}
