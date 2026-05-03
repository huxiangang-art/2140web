import { NextRequest, NextResponse } from 'next/server'
import { clickHashrateBall } from '@/lib/api2140'

const errorMessages: Record<number, string> = {
  [-11]: '请先登录',
  [-21]: '您已获取了该算力',
  [-33]: '领取时间未到',
}

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get('ci_session')?.value
  if (!cookie) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  const { seq } = await req.json().catch(() => ({ seq: '' }))
  if (!seq || typeof seq !== 'string') {
    return NextResponse.json({ error: '参数错误' }, { status: 400 })
  }

  const result = await clickHashrateBall(cookie, seq)
  if (result.ret !== 0) {
    return NextResponse.json(
      { error: errorMessages[result.ret] ?? result.msg ?? '领取失败' },
      { status: 400 }
    )
  }

  return NextResponse.json({ ok: true, amount: Number(result.data) || 0 })
}
