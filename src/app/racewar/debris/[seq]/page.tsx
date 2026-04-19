import { Nav } from '@/components/Nav'
import { getLoggedIn } from '@/lib/auth'
import { getDebrisDetail, getDebrisHealthInfo, getDebrisResidents, getDebrisRankDetail, login, RACE_NAMES, RACE_COLORS } from '@/lib/api2140'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getData(seq: string, cookie: string) {
  const [detail, health, residents, rank] = await Promise.allSettled([
    getDebrisDetail(cookie, seq),
    getDebrisHealthInfo(cookie, seq),
    getDebrisResidents(cookie, seq, 0),
    getDebrisRankDetail(cookie, seq),
  ]).then(r => r.map(s => s.status === 'fulfilled' ? s.value : null))
  return { detail, health, residents, rank }
}

export default async function DebrisDetailPage({ params }: { params: Promise<{ seq: string }> }) {
  const { seq } = await params
  const [loggedIn, cookie] = await Promise.all([
    getLoggedIn(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])

  const { detail, health, residents, rank } = await getData(seq, cookie ?? '')

  if (!detail) {
    return (
      <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
        <Nav active="/racewar" loggedIn={loggedIn} />
        <div className="text-center py-20 text-white/30 font-mono text-sm">碎片数据加载失败</div>
      </main>
    )
  }

  const raceColor = detail.race_seq ? (RACE_COLORS[detail.race_seq] ?? '#888') : '#888'
  const raceName = detail.race_seq ? (RACE_NAMES[detail.race_seq] ?? '') : ''
  const healthNum = parseInt(health?.health_num ?? detail.health ?? '0')
  const maxHealth = parseInt(detail.max_health ?? '100000')
  const healthPct = maxHealth > 0 ? Math.max(0, Math.min(100, Math.round((healthNum / maxHealth) * 100))) : 0
  const isDead = healthNum <= 0

  const residentList: any[] = residents?.data ?? residents ?? []
  const rankList: any[] = Array.isArray(rank) ? rank : (rank as any)?.data ?? []

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <Nav active="/racewar" loggedIn={loggedIn} />

      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/racewar" className="text-xs font-mono text-white/30 hover:text-white/60">战争</Link>
            <span className="text-white/20 text-xs">›</span>
            <span className="text-xs font-mono text-white/50">碎片 #{seq}</span>
          </div>
          <h2 className="text-xl font-bold text-white font-mono">{detail.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            {raceName && <span className="text-xs font-mono" style={{ color: raceColor }}>{raceName}族</span>}
            <span className="text-xs font-mono text-white/30">Lv.{detail.lv}</span>
            <span className={`text-xs font-mono ${isDead ? 'text-red-400' : 'text-green-400'}`}>
              {isDead ? '已陷落' : '存活'}
            </span>
          </div>
        </div>
      </div>

      {/* BG image */}
      {detail.bg && (
        <div className="relative rounded-xl overflow-hidden mb-6 h-48">
          <img
            src={detail.bg.startsWith('http') ? detail.bg : `https://www.2140city.cn${detail.bg}`}
            alt={detail.name}
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.6)' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.9) 100%)' }} />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-xs font-mono text-white/70 line-clamp-3">{detail.desc?.replace(/<[^>]+>/g, '')}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 生命值 */}
        <div className="border border-white/10 rounded-xl p-5 bg-white/3">
          <div className="text-xs font-mono text-white/40 mb-4">碎片状态</div>
          <div className="flex items-end gap-3 mb-3">
            <div className="text-3xl font-bold font-mono" style={{ color: isDead ? '#ef4444' : raceColor }}>
              {healthNum.toLocaleString()}
            </div>
            <div className="text-xs font-mono text-white/30 mb-1">/ {maxHealth.toLocaleString()} HP</div>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
            <div className="h-full rounded-full transition-all" style={{ width: `${healthPct}%`, backgroundColor: isDead ? '#ef4444' : raceColor }} />
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            {health?.invest_count !== undefined && (
              <><div className="text-white/30">投入次数</div><div className="text-white/60">{health.invest_count}</div></>
            )}
            {health?.daily_reward !== undefined && (
              <><div className="text-white/30">每日奖励</div><div className="text-cyan-400">{health.daily_reward} H</div></>
            )}
            {health?.total_reward !== undefined && (
              <><div className="text-white/30">累计奖励</div><div className="text-white/60">{health.total_reward}</div></>
            )}
          </div>
        </div>

        {/* 基本信息 */}
        <div className="border border-white/10 rounded-xl p-5 bg-white/3">
          <div className="text-xs font-mono text-white/40 mb-4">碎片信息</div>
          <div className="space-y-2 text-xs font-mono">
            {detail.seq && <div className="flex justify-between"><span className="text-white/30">编号</span><span className="text-white/60">#{detail.seq}</span></div>}
            {detail.map_name && <div className="flex justify-between"><span className="text-white/30">所属地图</span><span className="text-white/60">{detail.map_name}</span></div>}
            {detail.map_lv && <div className="flex justify-between"><span className="text-white/30">地图等级</span><span className="text-white/60">Lv.{detail.map_lv}</span></div>}
            {detail.population !== undefined && <div className="flex justify-between"><span className="text-white/30">居民数</span><span className="text-white/60">{detail.population}</span></div>}
          </div>
          {!detail.bg && detail.desc && (
            <p className="text-xs font-mono text-white/50 leading-relaxed mt-4">{detail.desc.replace(/<[^>]+>/g, '')}</p>
          )}
        </div>
      </div>

      {/* 居民列表 */}
      {residentList.length > 0 && (
        <div className="mt-6 border border-white/10 rounded-xl p-5 bg-white/3">
          <div className="text-xs font-mono text-white/40 mb-4">居民 ({residentList.length})</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {residentList.slice(0, 18).map((r: any, i: number) => (
              <div key={i} className="flex items-center gap-2 py-1.5">
                {r.avatar && <img src={r.avatar} alt="" className="w-6 h-6 rounded-full shrink-0" />}
                <div>
                  <div className="text-xs font-mono text-white/60 truncate">{r.nickname}</div>
                  {r.race_seq && <div className="text-xs font-mono mt-0.5" style={{ color: RACE_COLORS[r.race_seq] ?? '#888', fontSize: 10 }}>{RACE_NAMES[r.race_seq]}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 碎片排行 */}
      {rankList.length > 0 && (
        <div className="mt-6 border border-white/10 rounded-xl p-5 bg-white/3">
          <div className="text-xs font-mono text-white/40 mb-4">贡献排行</div>
          <div className="space-y-1">
            {rankList.slice(0, 20).map((r: any, i: number) => (
              <div key={i} className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0">
                <div className="w-5 text-xs font-mono text-white/25 text-right">{i + 1}</div>
                {r.avatar && <img src={r.avatar} alt="" className="w-5 h-5 rounded-full" />}
                <div className="flex-1 text-xs font-mono text-white/60 truncate">{r.nickname}</div>
                <div className="text-xs font-mono text-cyan-400/70">{Number(r.hashrate ?? r.amount ?? 0).toLocaleString()} H</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
