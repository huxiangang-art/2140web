import { Nav } from '@/components/Nav'
import { getLoggedIn, getUserCookie } from '@/lib/auth'
import { getHashrateEngine, getHashrateEngineRecords, getHashratePoolRank, getHashrateGoods, login } from '@/lib/api2140'

export const dynamic = 'force-dynamic'

async function getData(cookie: string, sysC: string) {
  const [engine, records, rank, goods] = await Promise.allSettled([
    getHashrateEngine(cookie),
    getHashrateEngineRecords(cookie, 0),
    getHashratePoolRank(sysC, 1, 0),
    getHashrateGoods(sysC),
  ]).then(r => r.map(s => s.status === 'fulfilled' ? s.value : null))
  return { engine, records: records ?? [], rank: rank ?? [], goods: goods ?? [] }
}

export default async function HashratePage() {
  const [loggedIn, userCookie, sysCookie] = await Promise.all([
    getLoggedIn(),
    getUserCookie(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])

  const cookie = userCookie ?? sysCookie ?? ''
  const sysC = sysCookie ?? ''
  const { engine, records, rank, goods } = await getData(cookie, sysC)

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <Nav active="/hashrate" loggedIn={loggedIn} />
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white font-mono">算力竞技场</h2>
        <p className="text-xs text-white/30 mt-1">算力引擎 · 排行竞争 · 算力商品</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 算力引擎 */}
        <div className="lg:col-span-1 space-y-4">
          {engine && (
            <div className="border border-white/10 rounded-xl p-5 bg-white/3">
              <div className="text-xs font-mono text-white/40 mb-4">算力引擎</div>
              <div className="text-3xl font-bold font-mono text-white mb-1">
                {Number(engine.hashrate ?? 0).toLocaleString()}
                <span className="text-sm text-white/40 ml-1">H</span>
              </div>
              <div className="text-xs font-mono text-white/30">当前算力</div>
              {engine.engine_lv !== undefined && (
                <div className="mt-4 flex items-center gap-2">
                  <div className="text-xs font-mono text-white/50">引擎等级</div>
                  <div className="text-sm font-mono font-bold text-cyan-400">Lv{engine.engine_lv}</div>
                </div>
              )}
            </div>
          )}

          {/* 算力商品 */}
          {Array.isArray(goods) && goods.length > 0 && (
            <div className="border border-white/10 rounded-xl p-5 bg-white/3">
              <div className="text-xs font-mono text-white/40 mb-4">算力商品</div>
              <div className="space-y-3">
                {(goods as any[]).map((g: any) => (
                  <div key={g.seq} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <div>
                      <div className="text-xs font-mono text-white/80">{g.name}</div>
                      <div className="text-xs font-mono text-white/30 mt-0.5">+{g.hashrate} H/轮</div>
                    </div>
                    <div className="text-sm font-mono font-bold text-yellow-400">{g.price} T</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 排行榜 */}
        <div className="lg:col-span-2 space-y-4">
          {Array.isArray(rank) && rank.length > 0 && (
            <div className="border border-white/10 rounded-xl p-5 bg-white/3">
              <div className="text-xs font-mono text-white/40 mb-4">算力排行</div>
              <div className="space-y-1">
                {(rank as any[]).slice(0, 30).map((r: any, i: number) => (
                  <div key={r.user_seq} className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0">
                    <div className="w-6 text-xs font-mono text-white/25 text-right">{i + 1}</div>
                    {r.user_avatar && <img src={r.user_avatar} alt="" className="w-6 h-6 rounded-full" />}
                    <div className="flex-1 text-xs font-mono text-white/70 truncate">{r.user_nickname}</div>
                    <div className="text-xs font-mono text-cyan-400">{Number(r.hashrate_sum).toLocaleString()} H</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 引擎记录 */}
          {Array.isArray(records) && records.length > 0 && (
            <div className="border border-white/10 rounded-xl p-5 bg-white/3">
              <div className="text-xs font-mono text-white/40 mb-4">操作记录</div>
              <div className="space-y-2">
                {(records as any[]).slice(0, 20).map((r: any, i: number) => (
                  <div key={i} className="flex justify-between text-xs font-mono py-1 border-b border-white/5 last:border-0">
                    <span className="text-white/50">{r.desc ?? r.type}</span>
                    <span className="text-white/35">{r.time?.slice(0, 16)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
