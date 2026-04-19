import { Nav } from '@/components/Nav'
import { getLoggedIn } from '@/lib/auth'
import { getUserSpace, getUserSpaceJournals, login, RACE_NAMES, RACE_COLORS } from '@/lib/api2140'

export const dynamic = 'force-dynamic'

async function getData(seq: string, cookie: string) {
  const [space, journals] = await Promise.allSettled([
    getUserSpace(cookie, seq),
    getUserSpaceJournals(cookie, seq, 0),
  ]).then(r => r.map(s => s.status === 'fulfilled' ? s.value : null))
  return { space, journals: Array.isArray(journals) ? journals : [] }
}

export default async function UserSpacePage({ params }: { params: Promise<{ seq: string }> }) {
  const { seq } = await params
  const [loggedIn, cookie] = await Promise.all([
    getLoggedIn(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])
  const { space, journals } = await getData(seq, cookie ?? '')

  const info = space?.user_info ?? space
  const raceColor = info?.race ? (RACE_COLORS[info.race] ?? '#888') : '#888'
  const raceName = info?.race ? (RACE_NAMES[info.race] ?? '') : ''

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <Nav active="/" loggedIn={loggedIn} />

      {!space ? (
        <div className="text-center py-20 text-white/30 font-mono text-sm">用户不存在</div>
      ) : (
        <>
          {/* 用户头部 */}
          <div className="mb-8 flex items-center gap-4">
            {info?.avatar ? (
              <img src={info.avatar} alt="" className="w-16 h-16 rounded-full border-2" style={{ borderColor: raceColor }} />
            ) : (
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold font-mono"
                style={{ backgroundColor: `${raceColor}20`, color: raceColor, border: `2px solid ${raceColor}40` }}>
                {info?.nickname?.[0] ?? '?'}
              </div>
            )}
            <div>
              <div className="text-xl font-bold font-mono text-white">{info?.nickname}</div>
              <div className="flex items-center gap-3 mt-1 text-xs font-mono">
                <span style={{ color: raceColor }}>{raceName}族</span>
                {info?.race_lv && <span className="text-white/40">Lv{info.race_lv}</span>}
              </div>
              {info?.signature && (
                <p className="text-xs font-mono text-white/40 mt-2 max-w-sm">{info.signature}</p>
              )}
            </div>
          </div>

          {/* 统计 */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
            {[
              { label: '算力', value: Number(space.hashrate ?? info?.hashrate ?? 0).toLocaleString() },
              { label: '代币', value: Number(space.token ?? info?.token ?? 0).toFixed(0) },
              { label: '章节', value: space.chapter_count ?? 0 },
              { label: '等级', value: `Lv${info?.race_lv ?? 0}` },
              { label: '邀请', value: space.invite_count ?? 0 },
              { label: '道具', value: space.prop_count ?? 0 },
            ].map(item => (
              <div key={item.label} className="border border-white/8 rounded-lg p-3 text-center">
                <div className="text-xs font-mono text-white/30 mb-1">{item.label}</div>
                <div className="text-sm font-mono font-bold text-white">{item.value}</div>
              </div>
            ))}
          </div>

          {/* 日志 */}
          {journals.length > 0 && (
            <div className="border border-white/10 rounded-xl p-5 bg-white/3">
              <div className="text-xs font-mono text-white/40 mb-4">留言板</div>
              <div className="space-y-4">
                {(journals as any[]).map((j: any, i: number) => (
                  <div key={i} className="flex gap-3">
                    {j.user_avatar && (
                      <img src={j.user_avatar} alt="" className="w-7 h-7 rounded-full shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-white/60">{j.user_nickname ?? j.nickname}</span>
                        <span className="text-xs font-mono text-white/20">{j.time?.slice(0, 10)}</span>
                      </div>
                      <p className="text-xs font-mono text-white/50 leading-relaxed">{j.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  )
}
