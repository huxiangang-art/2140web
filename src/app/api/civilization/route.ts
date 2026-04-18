import { NextResponse } from 'next/server'
import { getHashratePool, getRanks, getRaces, getProposals, login } from '@/lib/api2140'

export const dynamic = 'force-dynamic'

async function getSystemCookie() {
  return login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
}

export async function GET() {
  try {
    const cookie = await getSystemCookie()
    if (!cookie) throw new Error('Auth failed')

    const [pool, ranks, races, proposals] = await Promise.all([
      getHashratePool(cookie),
      getRanks(cookie),
      getRaces(),
      getProposals(cookie),
    ])

    return NextResponse.json({ pool, ranks, races, proposals })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
