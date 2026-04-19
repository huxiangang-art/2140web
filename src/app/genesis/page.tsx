import { Nav } from '@/components/Nav'
import { getLoggedIn } from '@/lib/auth'
import { getGenesisKeys, getGenesisKeysUsers, login, RACE_NAMES, RACE_COLORS } from '@/lib/api2140'

export const dynamic = 'force-dynamic'

async function getData(cookie: string) {
  const [keys, users] = await Promise.allSettled([
    getGenesisKeys(cookie),
    getGenesisKeysUsers(cookie),
  ]).then(r => r.map(s => s.status === 'fulfilled' ? s.value : null))
  return { keys, users }
}

export default async function GenesisPage() {
  const [loggedIn, cookie] = await Promise.all([
    getLoggedIn(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])
  const { keys, users } = await getData(cookie ?? '')

  const keyList: any[] = Array.isArray(keys) ? keys : (keys as any)?.keys ?? []
  const userList: any[] = Array.isArray(users) ? users : (users as any)?.data ?? []

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <Nav active="/genesis" loggedIn={loggedIn} />
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white font-mono">创世密钥</h2>
        <p className="text-xs text-white/30 mt-1">稀有资产 · 文明奠基者标识</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 密钥列表 */}
        {keyList.length > 0 && (
          <div className="border border-white/10 rounded-xl p-5 bg-white/3">
            <div className="text-xs font-mono text-white/40 mb-4">密钥详情</div>
            <div className="space-y-3">
              {keyList.map((k: any, i: number) => (
                <div key={i} className="border border-white/8 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-mono text-white/80 font-medium">{k.name ?? `密钥 #${k.seq}`}</div>
                    <div className="text-xs font-mono text-white/30">#{k.seq}</div>
                  </div>
                  {k.desc && <p className="text-xs font-mono text-white/45 leading-relaxed">{k.desc}</p>}
                  {k.reward && (
                    <div className="text-xs font-mono text-cyan-400/70 mt-2">奖励 {k.reward} H</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 持有者排行 */}
        {userList.length > 0 && (
          <div className="border border-white/10 rounded-xl p-5 bg-white/3">
            <div className="text-xs font-mono text-white/40 mb-4">持有者 ({userList.length})</div>
            <div className="space-y-2">
              {userList.slice(0, 30).map((u: any, i: number) => {
                const color = u.race_seq ? (RACE_COLORS[u.race_seq] ?? '#888') : '#888'
                return (
                  <div key={i} className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0">
                    <div className="w-5 text-xs font-mono text-white/20">{i + 1}</div>
                    {u.avatar && <img src={u.avatar} alt="" className="w-6 h-6 rounded-full" />}
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-mono text-white/60 truncate">{u.nickname}</span>
                      {u.race_seq && (
                        <span className="text-xs font-mono ml-2" style={{ color, fontSize: 10 }}>{RACE_NAMES[u.race_seq]}</span>
                      )}
                    </div>
                    {u.key_count && <span className="text-xs font-mono text-yellow-400/70">×{u.key_count}</span>}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {keyList.length === 0 && userList.length === 0 && (
        <div className="text-center py-20 text-white/30 font-mono text-sm">暂无创世密钥数据</div>
      )}
    </main>
  )
}
