import { Nav } from '@/components/Nav'
import { getLoggedIn, getUserCookie } from '@/lib/auth'
import { getInvestmentUser, getInvestmentRank, getInvestmentIndex, getUserCoinRecords, login } from '@/lib/api2140'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

async function getData(cookie: string, sysC: string) {
  const [user, rank, index, coins] = await Promise.allSettled([
    getInvestmentUser(cookie),
    getInvestmentRank(sysC),
    getInvestmentIndex(sysC),
    getUserCoinRecords(cookie, 0),
  ]).then(r => r.map(s => s.status === 'fulfilled' ? s.value : null))
  return { user, rank: rank ?? [], index, coins: coins ?? [] }
}

export default async function WriteInvestPage() {
  const [loggedIn, userCookie, sysCookie] = await Promise.all([
    getLoggedIn(),
    getUserCookie(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])
  if (!loggedIn) redirect('/login')

  const { user, rank, index, coins } = await getData(userCookie!, sysCookie ?? '')

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <Nav active="/write" loggedIn={loggedIn} />
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white font-mono">写作投资</h2>
        <p className="text-xs text-white/30 mt-1">投资优质章节 · 分享创作收益</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 我的投资状态 */}
        {user && (
          <div className="border border-white/10 rounded-xl p-5 bg-white/3">
            <div className="text-xs font-mono text-white/40 mb-4">我的投资</div>
            <div className="space-y-3">
              {[
                { label: '投资章节', value: user.chapter_count ?? 0 },
                { label: '投入算力', value: `${Number(user.hashrate_sum ?? 0).toLocaleString()} H` },
                { label: '投入代币', value: `${Number(user.token_sum ?? 0).toFixed(2)} T` },
                { label: '累计收益', value: `${Number(user.reward_sum ?? 0).toFixed(2)} T` },
              ].map(item => (
                <div key={item.label} className="flex justify-between text-xs font-mono">
                  <span className="text-white/35">{item.label}</span>
                  <span className="text-white/70">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 投资排行 */}
        {Array.isArray(rank) && rank.length > 0 && (
          <div className="md:col-span-2 border border-white/10 rounded-xl p-5 bg-white/3">
            <div className="text-xs font-mono text-white/40 mb-4">投资者排行</div>
            <div className="space-y-1.5">
              {(rank as any[]).slice(0, 15).map((r: any, i: number) => (
                <div key={i} className="flex items-center gap-3 py-1">
                  <div className="w-5 text-xs font-mono text-white/25 text-right">{i + 1}</div>
                  {r.avatar && <img src={r.avatar} alt="" className="w-5 h-5 rounded-full" />}
                  <div className="flex-1 text-xs font-mono text-white/60 truncate">{r.nickname}</div>
                  <div className="text-xs font-mono text-yellow-400/70">{Number(r.reward_sum ?? r.amount ?? 0).toFixed(2)} T</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 章节投资排行 */}
      {index && Array.isArray(index) && index.length > 0 && (
        <div className="mt-6 border border-white/10 rounded-xl p-5 bg-white/3">
          <div className="text-xs font-mono text-white/40 mb-4">热门投资章节</div>
          <div className="space-y-3">
            {(index as any[]).slice(0, 10).map((c: any, i: number) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <div className="w-5 text-xs font-mono text-white/25">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono text-white/70 truncate">{c.title}</div>
                  <div className="text-xs font-mono text-white/30 mt-0.5">{c.author_nickname}</div>
                </div>
                <div className="text-right text-xs font-mono">
                  <div className="text-cyan-400/70">{Number(c.hashrate_pool ?? 0).toLocaleString()} H</div>
                  <div className="text-yellow-400/60">{Number(c.token_pool ?? 0).toFixed(2)} T</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 代币记录 */}
      {Array.isArray(coins) && coins.length > 0 && (
        <div className="mt-6 border border-white/10 rounded-xl p-5 bg-white/3">
          <div className="text-xs font-mono text-white/40 mb-4">投资代币记录</div>
          <div className="space-y-2">
            {(coins as any[]).slice(0, 20).map((c: any, i: number) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                <div>
                  <div className="text-xs font-mono text-white/60">{c.chapter_title ?? c.desc ?? '投资'}</div>
                  <div className="text-xs font-mono text-white/25 mt-0.5">{c.time?.slice(0, 16)}</div>
                </div>
                <div className={`text-sm font-mono font-bold ${Number(c.amount) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {Number(c.amount) >= 0 ? '+' : ''}{Number(c.amount ?? 0).toFixed(2)} T
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
