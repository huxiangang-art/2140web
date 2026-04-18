import { NextRequest, NextResponse } from 'next/server'
import { login } from '@/lib/api2140'
import { createHash } from 'crypto'

export async function POST(req: NextRequest) {
  const { mobile, password } = await req.json()
  if (!mobile || !password) {
    return NextResponse.json({ error: '请输入手机号和密码' }, { status: 400 })
  }

  const passwdMd5 = createHash('md5').update(password).digest('hex')
  const cookie = await login(mobile, passwdMd5)

  if (!cookie) {
    return NextResponse.json({ error: '手机号或密码错误' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('ci_session', cookie, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7天
    path: '/',
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('ci_session')
  return res
}
