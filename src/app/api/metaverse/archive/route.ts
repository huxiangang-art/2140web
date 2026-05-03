import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, hasSupabaseConfig } from '@/lib/supabase'

const snapshots: any[] = []
const TABLE = 'metaverse_snapshots'

export async function GET() {
  if (hasSupabaseConfig()) {
    const { data, error } = await getSupabaseAdmin()
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    if (!error) return NextResponse.json({ configured: true, storage: 'supabase', snapshots: data ?? [] })
  }
  return NextResponse.json({ configured: false, storage: 'memory', snapshots: snapshots.slice(0, 20) })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const snapshot = {
    id: `${Date.now()}-${snapshots.length + 1}`,
    title: String(body.title ?? 'metaverse snapshot'),
    summary: body.summary ?? [],
    metrics: body.metrics ?? {},
    created_at: new Date().toISOString(),
  }
  if (hasSupabaseConfig()) {
    const { data, error } = await getSupabaseAdmin()
      .from(TABLE)
      .insert(snapshot)
      .select()
      .single()
    if (!error) return NextResponse.json({ ok: true, storage: 'supabase', snapshot: data })
  }
  snapshots.unshift(snapshot)
  return NextResponse.json({ ok: true, storage: 'memory', snapshot })
}
