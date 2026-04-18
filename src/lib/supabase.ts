import { createClient, SupabaseClient } from '@supabase/supabase-js'

export type AgentLog = {
  id: number
  agent: string
  round_seq: string
  content: string
  created_at: string
}

let _client: SupabaseClient | null = null
let _admin: SupabaseClient | null = null

export function getSupabase() {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return _client
}

export function getSupabaseAdmin() {
  if (!_admin) {
    _admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
  }
  return _admin
}

// 兼容旧引用
export const supabase = { from: (table: string) => getSupabase().from(table) }
export const supabaseAdmin = { from: (table: string) => getSupabaseAdmin().from(table) }
