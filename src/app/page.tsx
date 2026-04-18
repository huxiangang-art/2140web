import { HashratePool } from '@/components/HashratePool'
import { RaceBar } from '@/components/RaceBar'
import { RankTable } from '@/components/RankTable'
import { AgentFeed } from '@/components/AgentFeed'

export const dynamic = 'force-dynamic'

async function getCivilization() {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const res = await fetch(`${base}/api/civilization`, { cache: 'no-store' })
    return res.json()
  } catch {
    return null
  }
}

export default async function Home() {
  const data = await getCivilization()

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <header className="mb-8 border-b border-white/10 pb-6">
        <div className="flex items-baseline gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-white">2140</h1>
          <span className="text-sm text-white/40">未来之城 · SG城邦</span>
        </div>
        <p className="mt-1 text-xs text-white/30 font-mono">
          算力即权力 · 春蚕计划 · 六族博弈 · GPT-X 观察中
        </p>
      </header>

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
