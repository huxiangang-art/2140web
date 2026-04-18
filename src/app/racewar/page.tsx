import { Nav } from '@/components/Nav'
import { getLoggedIn } from '@/lib/auth'
import {
  getBranchMaps, getMapSituation, getCreationRank, getDebrisRank,
  getTotalRank, getGenesisKeysUsers, login, RACE_NAMES, RACE_COLORS,
} from '@/lib/api2140'

export const dynamic = 'force-dynamic'

export default async function RacewarPage() {
  const [loggedIn, sysCookie] = await Promise.all([
    getLoggedIn(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])

  const cookie = sysCookie ?? ''
  const [branchMaps, situation, creationRank, debrisRank1, totalRank, genesisKeys] = await Promise.all([
    getBranchMaps(cookie),
    getMapSituation(cookie),
    getCreationRank(cookie),
    getDebrisRank(cookie, 1),
    getTotalRank(cookie, 1),
    getGenesisKeysUsers(cookie),
  ])

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <Nav active="/racewar" loggedIn={loggedIn} />

      <div className="mb-6">
        <h2 className="text-xl font-bold text-white font-mono">种族战争</h2>
        <p className="text-xs text-white/30 mt-1">元宇宙地图 · 六族争夺 · 文明演化</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* 支线地图 */}
          <section>
            <div className="text-xs font-mono text-white/30 mb-3">支线地图</div>
            <div className="space-y-3">
              {branchMaps.map((m: any) => {
                const health = parseInt(m.health)
                const maxHealth = 100000
                const pct = Math.max(0, Math.min(100, Math.round((health / maxHealth) * 100)))
                const isDead = health <= 0
                const healthColor = isDead ? '#ef4444' : health < 20000 ? '#f59e0b' : '#22c55e'
                return (
                  <div key={m.seq} className={`border rounded-lg p-4 ${isDead ? 'border-red-500/20 bg-red-500/5' : 'border-white/8'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-sm font-mono font-bold text-white/90">{m.name}</div>
                        <div className="text-xs font-mono text-white/30 mt-0.5">Lv.{m.lv} 地图</div>
                      </div>
                      <div className="text-xs font-mono" style={{ color: healthColor }}>
                        {isDead ? '已陷落' : `${health.toLocaleString()} HP`}
                      </div>
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed line-clamp-2 mb-3">
                      {m.desc?.replace(/<[^>]+>/g, '').slice(0, 120)}
                    </p>
                    <div className="bg-white/5 rounded-full h-1 overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: healthColor }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* 主线地图状态 */}
          {situation?.maps && (
            <section>
              <div className="text-xs font-mono text-white/30 mb-3">主线地图</div>
              <div className="space-y-2">
                {situation.maps.filter((m: any) => m.is_unlock !== '-1').map((m: any) => (
                  <div key={m.seq} className="border border-white/8 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-white/80">{m.name}</span>
                      <span className="text-xs font-mono text-white/25">Lv.{m.lv}</span>
                    </div>
                    {m.debriss?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {m.debriss.map((d: any) => (
                          <span key={d.seq}
                            className={`text-xs font-mono px-2 py-0.5 rounded border ${d.error_status === '1' ? 'border-red-500/30 text-red-400/60' : 'border-white/10 text-white/30'}`}>
                            {d.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 地票总榜 */}
          {totalRank?.total_users?.length > 0 && (
            <section>
              <div className="text-xs font-mono text-white/30 mb-3">地票总榜</div>
              {totalRank.total_race?.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-3">
                  {totalRank.total_race.map((r: any, i: number) => {
                    const color = RACE_COLORS[String(r.race_seq)] ?? '#888'
                    return (
                      <div key={r.race_seq} className="flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono"
                        style={{ borderColor: color + '30', backgroundColor: color + '08', color }}>
                        <span className="text-white/25">{i + 1}.</span>
                        {RACE_NAMES[String(r.race_seq)]}
                        <span className="text-white/40">{parseInt(r.amount_sum).toLocaleString()}</span>
                      </div>
                    )
                  })}
                </div>
              )}
              <div className="space-y-1">
                {totalRank.total_users.slice(0, 10).map((u: any, i: number) => {
                  const color = RACE_COLORS[String(u.race)] ?? '#888'
                  return (
                    <div key={u.user_seq} className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
                      <span className="text-xs font-mono text-white/20 w-5">{i + 1}</span>
                      <div className="w-6 h-6 rounded-full overflow-hidden shrink-0"
                        style={{ backgroundColor: color + '20', border: `1px solid ${color}40` }}>
                        {u.avatar && !u.avatar.includes('default')
                          ? <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-xs" style={{ color }}>{u.nickname?.[0]}</div>
                        }
                      </div>
                      <span className="text-xs font-mono text-white/70 flex-1 truncate">{u.nickname}</span>
                      <span className="text-xs font-mono text-white/25">{RACE_NAMES[String(u.race)]?.replace('族', '')}</span>
                      <span className="text-xs font-mono text-amber-400/70">{parseInt(u.amount_sum).toLocaleString()}</span>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          {/* 创作指数 */}
          {creationRank?.racewar_users?.length > 0 && (
            <section>
              <div className="text-xs font-mono text-white/30 mb-3">创作指数</div>
              <div className="space-y-2">
                {creationRank.racewar_users.slice(0, 8).map((u: any, i: number) => {
                  const color = RACE_COLORS[u.user_race] ?? '#888'
                  return (
                    <div key={u.seq} className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
                      <span className="text-xs font-mono text-white/20 w-4">{i + 1}</span>
                      <div className="w-5 h-5 rounded-full overflow-hidden shrink-0"
                        style={{ backgroundColor: color + '20', border: `1px solid ${color}40` }}>
                        {u.user_avatar
                          ? <img src={u.user_avatar} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-xs" style={{ color }}>{u.user_nick?.[0]}</div>
                        }
                      </div>
                      <span className="text-xs font-mono text-white/70 flex-1 truncate">{u.user_nick}</span>
                      <span className="text-xs font-mono text-white/30">{Math.round(parseFloat(u.creation_index)).toLocaleString()}</span>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* 今日贡献 */}
          {debrisRank1?.user_daily?.length > 0 && (
            <section>
              <div className="text-xs font-mono text-white/30 mb-3">今日贡献</div>
              <div className="space-y-2">
                {debrisRank1.user_daily.slice(0, 8).map((u: any, i: number) => {
                  const color = RACE_COLORS[u.race] ?? '#888'
                  return (
                    <div key={u.user_seq} className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
                      <span className="text-xs font-mono text-white/20 w-4">{i + 1}</span>
                      <div className="w-5 h-5 rounded-full overflow-hidden shrink-0"
                        style={{ backgroundColor: color + '20', border: `1px solid ${color}40` }}>
                        {u.avatar && !u.avatar.includes('default')
                          ? <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-xs" style={{ color }}>{u.nickname?.[0]}</div>
                        }
                      </div>
                      <span className="text-xs font-mono text-white/70 flex-1 truncate">{u.nickname}</span>
                      <span className="text-xs font-mono text-amber-400/60">+{parseInt(u.amount_sum).toLocaleString()}</span>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* 创世主 */}
          {genesisKeys?.records?.length > 0 && (
            <section>
              <div className="text-xs font-mono text-white/30 mb-3">创世主</div>
              <div className="space-y-2">
                {genesisKeys.records.slice(0, 8).map((u: any, i: number) => {
                  const color = RACE_COLORS[String(u.user_race)] ?? '#888'
                  const keys = parseInt(u.key1 ?? 0) + parseInt(u.key2 ?? 0) + parseInt(u.key3 ?? 0)
                  return (
                    <div key={u.user_seq} className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
                      <span className="text-xs font-mono text-white/20 w-4">{i + 1}</span>
                      <div className="w-5 h-5 rounded-full overflow-hidden shrink-0"
                        style={{ backgroundColor: color + '20', border: `1px solid ${color}40` }}>
                        {u.avatar && !u.avatar.includes('default')
                          ? <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-xs" style={{ color }}>{u.user_nick?.[0]}</div>
                        }
                      </div>
                      <span className="text-xs font-mono text-white/70 flex-1 truncate">{u.user_nick}</span>
                      {keys > 0 && <span className="text-xs font-mono text-yellow-400/60">×{keys}</span>}
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
