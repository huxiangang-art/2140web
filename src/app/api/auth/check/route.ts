import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const store = await cookies()
  const session = store.get('ci_session')?.value
  if (!session) return NextResponse.json({ loggedIn: false }, { status: 401 })
  return NextResponse.json({ loggedIn: true })
}
