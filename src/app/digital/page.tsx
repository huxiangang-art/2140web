import { Nav } from '@/components/Nav'
import { getLoggedIn, getUserCookie } from '@/lib/auth'
import { getDigitalPerson, getDigitalPersonRewards, getDigitalPersonRank, login } from '@/lib/api2140'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

async function getData(cookie: string) {
  const sysCookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const [person, rewards, rank] = await Promise.allSettled([
    getDigitalPerson(cookie),
    getDigitalPersonRewards(cookie),
    getDigitalPersonRank(sysCookie ?? cookie),
  ]).then(r => r.map(s => s.status === 'fulfilled' ? s.value : null))
  return { person, rewards, rank: rank ?? [] }
}

export default async function DigitalPage() {
  const [loggedIn, userCookie] = await Promise.all([getLoggedIn(), getUserCookie()])
  if (!loggedIn) redirect('/login')

  const { person, rewards, rank } = await getData(userCookie!)

  const standards: any[] = rewards?.standards ?? []
  const rewardList: any[] = rewards?.rewards ?? []

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <Nav active="/digital" loggedIn={loggedIn} />
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white font-mono">数字人</h2>
        <p className="text-xs text-white/30 mt-1">虚拟文明形态 · 进化标准</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 当前状态 */}
        {person && (
          <div className="border border-white/10 rounded-xl p-5 bg-white/3">
            <div className="text-xs font-mono text-white/40 mb-4">当前状态</div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                <span className="text-2xl font-bold font-mono text-white">Lv{person.person_lv}</span>
              </div>
              <div>
                <div className="text-sm font-mono text-white/70">数字人等级</div>
                <div className="text-xs font-mono text-white/30 mt-1">综合评分 {person.standard_sum ?? 0}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[1,2,3,4].map(i => (
                person[`standard${i}`] !== undefined && (
                  <div key={i} className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs font-mono text-white/30 mb-1">标准 {i}</div>
                    <div className="text-lg font-bold font-mono text-white">{person[`standard${i}`]}</div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* 奖励进度 */}
        {rewardList.length > 0 && (
          <div className="border border-white/10 rounded-xl p-5 bg-white/3">
            <div className="text-xs font-mono text-white/40 mb-4">等级奖励</div>
            <div className="space-y-3">
              {rewardList.map((r: any) => (
                <div key={r.level} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono
                      ${r.is_received ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}>
                      {r.level}
                    </div>
                    <div className="text-xs font-mono text-white/60">Lv{r.level} 奖励</div>
                  </div>
                  <div className="text-xs font-mono text-white/40">
                    {r.hashrate && `+${r.hashrate} H`}
                    {r.token && ` +${r.token} T`}
                    {r.is_received && <span className="text-green-400/60 ml-2">✓</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 排行榜 */}
      {Array.isArray(rank) && rank.length > 0 && (
        <div className="mt-6 border border-white/10 rounded-xl p-5 bg-white/3">
          <div className="text-xs font-mono text-white/40 mb-4">数字人排行</div>
          <div className="space-y-2">
            {(rank as any[]).slice(0, 20).map((r: any, i: number) => (
              <div key={r.user_seq} className="flex items-center gap-3 py-1.5">
                <div className="w-6 text-xs font-mono text-white/25 text-right">{i + 1}</div>
                {r.avatar && <img src={r.avatar} alt="" className="w-6 h-6 rounded-full" />}
                <div className="flex-1 text-xs font-mono text-white/70 truncate">{r.nickname}</div>
                <div className="text-xs font-mono text-white/40">Lv{r.person_lv}</div>
                <div className="text-xs font-mono text-cyan-400/70">{r.standard_sum}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
