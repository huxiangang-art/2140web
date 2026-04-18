import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getUserInfo } from '@/lib/api2140'

export async function POST(req: NextRequest) {
  const store = await cookies()
  const cookie = store.get('ci_session')?.value
  if (!cookie) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const { content, round_seq } = await req.json()
  if (!content?.trim() || content.trim().length < 20) {
    return NextResponse.json({ error: '内容太短，至少20字' }, { status: 400 })
  }

  const infoRes = await getUserInfo(cookie)
  if (infoRes?.ret !== 0) return NextResponse.json({ error: '用户信息获取失败' }, { status: 401 })
  const info = infoRes.data

  const { data, error } = await getSupabaseAdmin()
    .from('civilization_chapters')
    .insert({
      author_name: info.nickname,
      author_race: info.race,
      content: content.trim(),
      round_seq: round_seq ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: '保存失败' }, { status: 500 })
  return NextResponse.json({ ok: true, id: data.id })
}
