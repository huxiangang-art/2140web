import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, hasSupabaseConfig } from '@/lib/supabase'

const records: any[] = []
const TABLE = 'metaverse_action_audits'

export async function GET() {
  if (hasSupabaseConfig()) {
    const { data, error } = await getSupabaseAdmin()
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    if (!error) return NextResponse.json({ configured: true, storage: 'supabase', records: data ?? [] })
  }
  return NextResponse.json({ configured: false, storage: 'memory', records: records.slice(0, 50) })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const record = {
    id: `${Date.now()}-${records.length + 1}`,
    type: String(body.type ?? 'safe_action'),
    target: body.target ?? null,
    endpoint: body.endpoint ?? null,
    payload: body.payload ?? null,
    source: body.source ?? null,
    status: 'draft',
    created_at: new Date().toISOString(),
  }
  if (hasSupabaseConfig()) {
    const { data, error } = await getSupabaseAdmin()
      .from(TABLE)
      .insert(record)
      .select()
      .single()
    if (!error) return NextResponse.json({ ok: true, storage: 'supabase', record: data })
  }
  records.unshift(record)
  return NextResponse.json({ ok: true, storage: 'memory', record })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const id = String(body.id ?? '')
  const status = String(body.status ?? '')
  if (!id || !['draft', 'reviewing', 'approved', 'rejected', 'previewed'].includes(status)) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }
  if (hasSupabaseConfig()) {
    const { data, error } = await getSupabaseAdmin()
      .from(TABLE)
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    if (!error) return NextResponse.json({ ok: true, storage: 'supabase', record: data })
  }
  const found = records.find(r => String(r.id) === id)
  if (!found) return NextResponse.json({ error: 'not found' }, { status: 404 })
  found.status = status
  return NextResponse.json({ ok: true, storage: 'memory', record: found })
}
