import { NextRequest, NextResponse } from 'next/server'
import { inputHashrate } from '@/lib/api2140'

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get('ci_session')?.value
  if (!cookie) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  const { poolSeq, amount } = await req.json()
  if (!poolSeq || !amount || amount < 10) {
    return NextResponse.json({ error: '参数错误，最少投入10算力' }, { status: 400 })
  }

  const result = await inputHashrate(cookie, poolSeq, amount)
  if (result.ret !== 0) {
    return NextResponse.json({ error: result.msg || '投入失败' }, { status: 400 })
  }

  return NextResponse.json({ ok: true, data: result.data })
}
