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

export function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  )
}

function requireSupabaseEnv(key: string) {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
  return value
}

export function getSupabase() {
  if (!_client) {
    _client = createClient(
      requireSupabaseEnv('NEXT_PUBLIC_SUPABASE_URL'),
      requireSupabaseEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    )
  }
  return _client
}

export function getSupabaseAdmin() {
  if (!_admin) {
    _admin = createClient(
      requireSupabaseEnv('NEXT_PUBLIC_SUPABASE_URL'),
      requireSupabaseEnv('SUPABASE_SERVICE_ROLE_KEY'),
    )
  }
  return _admin
}

// 兼容旧引用
export const supabase = { from: (table: string) => getSupabase().from(table) }
export const supabaseAdmin = { from: (table: string) => getSupabaseAdmin().from(table) }
