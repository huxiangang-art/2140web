import { Nav } from '@/components/Nav'
import { getLoggedIn } from '@/lib/auth'
import { getMapRank, getMapSituation, login, RACE_NAMES, RACE_COLORS } from '@/lib/api2140'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function MapRankPage({ params }: { params: Promise<{ seq: string }> }) {
  const { seq } = await params
  const [loggedIn, sysCookie] = await Promise.all([
    getLoggedIn(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])

  const cookie = sysCookie ?? ''
  const [rank, situation] = await Promise.all([
    getMapRank(cookie, seq),
    getMapSituation(cookie),
  ])

  const mapInfo = situation?.maps?.find((m: any) => String(m.seq) === seq)
  const mapUsers: any[] = rank?.map_users ?? []
  const mapRace: any[] = rank?.map_race ?? []
  const mapDebriss: any[] = rank?.map_debriss ?? []
  const myMap = rank?.my_map

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-3xl mx-auto">
      <Nav active="/racewar" loggedIn={loggedIn} />

      <div className="mb-4">
        <Link href="/racewar" className="text-xs font-mono text-white/30 hover:text-white/60">← 种族战争</Link>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-white font-mono">
          {mapInfo?.name ?? `地图 #${seq}`} · 地票榜
        </h2>
        <p className="text-xs text-white/30 mt-1">个人 / 种族 / 基地 三维排行</p>
      </div>

      {myMap && (
        <div className="flex gap-4 mb-6 p-3 rounded-lg border border-white/8 bg-white/3">
          <div className="text-center">
            <div className="text-xs font-mono text-white/30 mb-1">我的排名</div>
            <div className="text-lg font-mono font-bold text-cyan-400">{myMap.rank ?? '—'}</div>
          </div>
          <div className="w-px bg-white/10" />
          <div className="text-center">
            <div className="text-xs font-mono text-white/30 mb-1">我的地票</div>
            <div className="text-lg font-mono font-bold text-amber-400">{parseInt(myMap.num || '0').toLocaleString()}</div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* 个人总榜 */}
        {mapUsers.length > 0 && (
          <section>
            <div className="text-xs font-mono text-white/40 mb-3 border-b border-white/8 pb-2">个人总榜</div>
            <div className="space-y-1">
              {mapUsers.map((u: any, i: number) => {
                const color = RACE_COLORS[String(u.race)] ?? '#888'
                return (
                  <div key={u.user_seq ?? i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                    <span className={`text-xs font-mono w-6 text-center ${i < 3 ? 'text-amber-400 font-bold' : 'text-white/20'}`}>
                      {i + 1}
                    </span>
                    <div className="w-7 h-7 rounded-full overflow-hidden shrink-0"
                      style={{ border: `1px solid ${color}40`, backgroundColor: color + '15' }}>
                      {u.avatar
                        ? <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-xs" style={{ color }}>{u.nickname?.[0]}</div>
                      }
                    </div>
                    <span className="text-xs font-mono text-white/80 flex-1 truncate">{u.nickname}</span>
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded text-xs" style={{ color, backgroundColor: color + '15' }}>
                      {RACE_NAMES[String(u.race)]?.replace('族', '')}
                    </span>
                    <span className="text-xs font-mono text-amber-400/80">{parseInt(u.amount_sum).toLocaleString()}</span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* 种族总榜 */}
        {mapRace.length > 0 && (
          <section>
            <div className="text-xs font-mono text-white/40 mb-3 border-b border-white/8 pb-2">种族总榜</div>
            <div className="space-y-1">
              {mapRace.map((r: any, i: number) => {
                const color = RACE_COLORS[String(r.race_seq)] ?? '#888'
                return (
                  <div key={r.race_seq ?? i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                    <span className={`text-xs font-mono w-6 text-center ${i < 3 ? 'text-amber-400 font-bold' : 'text-white/20'}`}>
                      {i + 1}
                    </span>
                    <div className="w-7 h-7 rounded-full overflow-hidden shrink-0"
                      style={{ border: `1px solid ${color}40`, backgroundColor: color + '15' }}>
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold" style={{ color }}>
                        {RACE_NAMES[String(r.race_seq)]?.[0]}
                      </div>
                    </div>
                    <span className="text-sm font-mono flex-1" style={{ color }}>{RACE_NAMES[String(r.race_seq)]}</span>
                    <span className="text-xs font-mono text-amber-400/80">{parseInt(r.amount_sum).toLocaleString()}</span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* 基地总榜 */}
        {mapDebriss.length > 0 && (
          <section>
            <div className="text-xs font-mono text-white/40 mb-3 border-b border-white/8 pb-2">基地总榜</div>
            <div className="space-y-1">
              {mapDebriss.map((d: any, i: number) => (
                <div key={d.seq ?? i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <span className={`text-xs font-mono w-6 text-center ${i < 3 ? 'text-amber-400 font-bold' : 'text-white/20'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="text-xs font-mono text-white/80">{d.name}</div>
                    <div className="text-xs font-mono text-white/25 mt-0.5">编号 {d.id}</div>
                  </div>
                  {d.seq && (
                    <Link href={`/racewar/debris/${d.seq}`}
                      className="text-xs font-mono text-white/20 hover:text-white/50 px-2 py-0.5 border border-white/10 rounded">
                      详情
                    </Link>
                  )}
                  <span className="text-xs font-mono text-amber-400/80">{parseInt(d.amount_sum).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {mapUsers.length === 0 && mapRace.length === 0 && mapDebriss.length === 0 && (
          <div className="text-center py-20 text-white/20 font-mono text-sm">暂无排行数据</div>
        )}
      </div>
    </main>
  )
}
