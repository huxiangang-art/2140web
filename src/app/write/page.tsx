import { Nav } from '@/components/Nav'
import { WriteClient } from '@/components/WriteClient'
import { redirect } from 'next/navigation'
import { getLoggedIn, getUserCookie } from '@/lib/auth'
import { getUserInfo, getHashratePool, login } from '@/lib/api2140'

export const dynamic = 'force-dynamic'

export default async function WritePage() {
  const loggedIn = await getLoggedIn()
  if (!loggedIn) redirect('/login')

  const userCookie = await getUserCookie()
  const [infoRes, sysCookie] = await Promise.all([
    getUserInfo(userCookie!),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])

  const info = infoRes?.ret === 0 ? infoRes.data : null
  const pool = sysCookie ? await getHashratePool(sysCookie) : null

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-3xl mx-auto">
      <Nav active="/write" loggedIn={loggedIn} />

      <div className="mb-6">
        <h2 className="text-xl font-bold text-white font-mono">书写文明史</h2>
        <p className="text-xs text-white/30 mt-1">你的章节将永久记录在2140文明时间线</p>
      </div>

      <WriteClient
        roundSeq={pool?.seq}
        authorRace={info?.race}
        authorName={info?.nickname}
      />
    </main>
  )
}
