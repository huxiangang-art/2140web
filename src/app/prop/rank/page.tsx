import { Nav } from '@/components/Nav'
import { getLoggedIn } from '@/lib/auth'
import { getPropUserRank, getUserPropRewards, login, RACE_NAMES, RACE_COLORS } from '@/lib/api2140'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getData(cookie: string) {
  const [rank, rewards] = await Promise.allSettled([
    getPropUserRank(cookie),
    getUserPropRewards(cookie),
  ]).then(r => r.map(s => s.status === 'fulfilled' ? s.value : null))
  return { rank: rank ?? [], rewards }
}

export default async function PropRankPage() {
  const [loggedIn, cookie] = await Promise.all([
    getLoggedIn(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])
  const { rank, rewards } = await getData(cookie ?? '')

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <Nav active="/prop" loggedIn={loggedIn} />
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold text-white font-mono">道具排行</h2>
          <p className="text-xs text-white/30 mt-1">道具持有者排行榜</p>
        </div>
        <div className="flex gap-4 text-xs font-mono">
          <Link href="/prop" className="text-white/40 hover:text-white/70">合成路径</Link>
          <Link href="/prop/backpack" className="text-white/40 hover:text-white/70">背包</Link>
        </div>
      </div>

      {rewards && Array.isArray((rewards as any)?.rewards) && (rewards as any).rewards.length > 0 && (
        <div className="mb-6 border border-white/10 rounded-xl p-4 bg-white/3">
          <div className="text-xs font-mono text-white/40 mb-3">待领取奖励</div>
          <div className="space-y-2">
            {((rewards as any).rewards as any[]).map((r: any, i: number) => (
              <div key={i} className="flex justify-between text-xs font-mono">
                <span className="text-white/60">{r.desc ?? r.title}</span>
                <span className="text-yellow-400">{r.amount} T</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border border-white/10 rounded-xl p-5 bg-white/3">
        <div className="text-xs font-mono text-white/40 mb-4">持有者排行</div>
        {!(Array.isArray(rank) && rank.length > 0) ? (
          <div className="text-center py-10 text-white/30 font-mono text-sm">暂无排行数据</div>
        ) : (
          <div className="space-y-1">
            {(rank as any[]).map((r: any, i: number) => {
              const color = r.race_seq ? (RACE_COLORS[r.race_seq] ?? '#888') : '#888'
              return (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className="w-6 text-xs font-mono text-white/25 text-right">{i + 1}</div>
                  {r.avatar && <img src={r.avatar} alt="" className="w-6 h-6 rounded-full" />}
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-mono text-white/70 truncate">{r.nickname}</span>
                    {r.race_seq && (
                      <span className="text-xs font-mono ml-2" style={{ color }}>{RACE_NAMES[r.race_seq]}</span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-cyan-400/70">{r.prop_count ?? r.count} 件</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
