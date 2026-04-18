import { NextRequest, NextResponse } from 'next/server'
import { getUserCookie } from '@/lib/auth'
import { getGeneQuestions, submitGeneSequencing } from '@/lib/api2140'

export async function GET() {
  const cookie = await getUserCookie()
  if (!cookie) return NextResponse.json({ error: 'unauth' }, { status: 401 })
  const data = await getGeneQuestions(cookie)
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const cookie = await getUserCookie()
  if (!cookie) return NextResponse.json({ error: 'unauth' }, { status: 401 })
  const body = await req.text()
  const res = await submitGeneSequencing(cookie, body)
  return NextResponse.json(res)
}
