import { HashratePool } from '@/components/HashratePool'
import { RaceBar } from '@/components/RaceBar'
import { RankTable } from '@/components/RankTable'
import { AgentFeed } from '@/components/AgentFeed'
import { AutoRefresh } from '@/components/AutoRefresh'
import { Nav } from '@/components/Nav'
import { getHashratePool, getRanks, login } from '@/lib/api2140'

export const dynamic = 'force-dynamic'

async function getCivilizationData() {
  try {
    const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
    if (!cookie) return null
    const [pool, ranks] = await Promise.all([
      getHashratePool(cookie),
      getRanks(cookie),
    ])
    return { pool, ranks }
  } catch {
    return null
  }
}

export default async function Home() {
  const data = await getCivilizationData()

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <Nav active="/" />
      <AutoRefresh intervalMs={30000} />

      {data?.pool ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <HashratePool pool={data.pool} />
            <RaceBar pool={data.pool} />
            <RankTable ranks={data.ranks ?? []} />
          </div>
          <div className="space-y-4">
            <AgentFeed />
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-white/30 font-mono text-sm">
          正在连接2140文明节点...
        </div>
      )}
    </main>
  )
}
