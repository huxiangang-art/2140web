import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import OpenAI from 'openai'
import { getSupabaseAdmin, hasSupabaseConfig } from '@/lib/supabase'
import { getUserInfo } from '@/lib/api2140'
import { agentPrompt } from '@/lib/metaverse'

const TABLE = 'metaverse_agent_generations'

export async function GET() {
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ configured: false, records: [] })
  }
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ configured: true, records: data ?? [] })
}

export async function POST(req: NextRequest) {
  const store = await cookies()
  const cookie = store.get('ci_session')?.value
  if (!cookie) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const body = await req.json()
  const lane = String(body.lane ?? '').trim()
  const prompt = String(body.prompt ?? '').trim()
  let draft = String(body.draft ?? '').trim()
  const mode = String(body.mode ?? 'save')
  if (!lane || !prompt) {
    return NextResponse.json({ error: 'lane、prompt 和至少 20 字草案不能为空' }, { status: 400 })
  }
  if (mode === 'generate') {
    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: 'DEEPSEEK_API_KEY is not configured' }, { status: 503 })
    }
    const client = new OpenAI({ apiKey: process.env.DEEPSEEK_API_KEY, baseURL: 'https://api.deepseek.com' })
    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      max_tokens: 1200,
      messages: [
        { role: 'system', content: '你是 2140 元宇宙的提案起草 Agent。所有输出都是待审草案，不自动提交。' },
        { role: 'user', content: agentPrompt(lane as any, prompt) },
      ],
    })
    draft = completion.choices[0]?.message?.content?.trim() ?? ''
    if (!draft) return NextResponse.json({ error: '生成失败' }, { status: 500 })
  }
  if (draft.length < 20) {
    return NextResponse.json({ error: '草案太短，至少 20 字' }, { status: 400 })
  }

  if (!hasSupabaseConfig()) {
    return NextResponse.json({ generated: mode === 'generate', draft, warning: 'Supabase is not configured; draft was not persisted' })
  }

  const infoRes = await getUserInfo(cookie)
  const info = infoRes.ret === 0 ? infoRes.data : null
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .insert({
      lane,
      prompt,
      draft,
      author_name: info?.nickname ?? null,
      author_race: info?.race ?? null,
      status: 'draft',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, record: data })
}

export async function PATCH(req: NextRequest) {
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 })
  }
  const { id, status } = await req.json()
  if (!id || !['draft', 'reviewing', 'approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, record: data })
}
