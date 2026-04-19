import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { addSpeech } from '@/lib/api2140'

export async function POST(req: NextRequest) {
  const store = await cookies()
  const cookie = store.get('ci_session')?.value
  if (!cookie) return NextResponse.json({ ret: -1, msg: '未登录' }, { status: 401 })

  const { title, content } = await req.json()
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ ret: -1, msg: '标题和内容不能为空' }, { status: 400 })
  }

  const res = await addSpeech(cookie, title.trim(), content.trim())
  return NextResponse.json(res)
}
