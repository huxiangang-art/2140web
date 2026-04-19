import { Nav } from '@/components/Nav'
import { getLoggedIn } from '@/lib/auth'
import { getBulletinList, login } from '@/lib/api2140'
import { BulletinsClient } from './BulletinsClient'

export const dynamic = 'force-dynamic'

async function getData() {
  try {
    const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
    if (!cookie) return []
    return getBulletinList(cookie, 0)
  } catch { return [] }
}

export default async function BulletinsPage() {
  const [bulletins, loggedIn] = await Promise.all([getData(), getLoggedIn()])
  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <Nav active="/bulletins" loggedIn={loggedIn} />
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white font-mono">公告</h2>
        <p className="text-xs text-white/30 mt-1">文明动态 · 系统通知</p>
      </div>
      <BulletinsClient bulletins={bulletins ?? []} />
    </main>
  )
}
