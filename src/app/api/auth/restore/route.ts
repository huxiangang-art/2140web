import { NextRequest, NextResponse } from 'next/server'

// Restores session from localStorage backup (for Safari PWA isolated context)
export async function POST(req: NextRequest) {
  const { token } = await req.json()
  if (!token || typeof token !== 'string' || token.length < 10) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('ci_session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  return res
}
