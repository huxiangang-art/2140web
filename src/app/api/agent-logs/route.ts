import { NextResponse } from 'next/server'
import { hasSupabaseConfig, supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!hasSupabaseConfig()) {
    return NextResponse.json([])
  }

  const { searchParams } = new URL(req.url)
  const agent = searchParams.get('agent')
  const limit = parseInt(searchParams.get('limit') ?? '20')

  let query = supabase
    .from('agent_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (agent) query = query.eq('agent', agent)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
