import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

let supabaseInstance: SupabaseClient<Database> | null = null

// Lazy initialization to avoid build-time errors
function getSupabaseClient(): SupabaseClient<Database> {
  if (supabaseInstance) return supabaseInstance

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  supabaseInstance = createClient<Database>(supabaseUrl, supabaseServiceKey)
  return supabaseInstance
}

// Server-side only - accessed via API routes
export const supabase = {
  from: <T extends keyof Database['public']['Tables']>(table: T) =>
    getSupabaseClient().from(table),
}
