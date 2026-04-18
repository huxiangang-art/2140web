import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const store = await cookies()
  const cookie = store.get('ci_session')?.value
  if (!cookie) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const { chapter_id } = await req.json()
  if (!chapter_id) return NextResponse.json({ error: '参数错误' }, { status: 400 })

  const db = getSupabaseAdmin()
  const { data: row } = await db
    .from('civilization_chapters')
    .select('tip_count')
    .eq('id', chapter_id)
    .single()

  await db
    .from('civilization_chapters')
    .update({ tip_count: (row?.tip_count ?? 0) + 1 })
    .eq('id', chapter_id)

  return NextResponse.json({ ok: true, tip_count: (row?.tip_count ?? 0) + 1 })
}
