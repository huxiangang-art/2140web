import { Nav } from '@/components/Nav'
import { getLoggedIn } from '@/lib/auth'
import { getSpeeches, RACE_NAMES, RACE_COLORS } from '@/lib/api2140'

export const dynamic = 'force-dynamic'

const SPEECH_LABEL: Record<string, string> = {
  '1': '公告', '2': '讨论', '3': '教程', '4': '创作', '5': '提案',
}

export default async function PlazaPage() {
  const [speeches, loggedIn] = await Promise.all([getSpeeches(), getLoggedIn()])

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <Nav active="/plaza" loggedIn={loggedIn} />

      <div className="mb-6">
        <h2 className="text-xl font-bold text-white font-mono">广场</h2>
        <p className="text-xs text-white/30 mt-1">种族广场 · 居民发言</p>
      </div>

      {speeches.length === 0 ? (
        <div className="text-center py-20 text-white/20 font-mono text-sm">广场空无一人</div>
      ) : (
        <div className="space-y-3">
          {speeches.map((s: any) => {
            const raceColor = s.race_seq && s.race_seq !== '0' ? (RACE_COLORS[s.race_seq] ?? '#888') : '#f97316'
            const raceName = s.race_seq && s.race_seq !== '0' ? RACE_NAMES[s.race_seq] : null

            return (
              <div key={s.seq} className="border border-white/8 rounded-lg p-4 hover:border-white/15 transition-colors">
                <div className="flex items-start gap-3">
                  {/* 头像 */}
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-0.5 bg-white/5">
                    {s.user_avatar
                      ? <img src={s.user_avatar} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xs font-mono text-white/30">
                          {s.user_nick?.[0] ?? '?'}
                        </div>
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* 标题 */}
                    <div className="flex items-start gap-2 flex-wrap mb-1">
                      <span className="text-sm font-mono text-white/90 font-medium leading-snug">{s.title}</span>
                      {s.label && SPEECH_LABEL[s.label] && (
                        <span className="text-xs font-mono px-1.5 py-0.5 rounded border border-orange-500/20 text-orange-400/60 shrink-0">
                          {SPEECH_LABEL[s.label]}
                        </span>
                      )}
                    </div>

                    {/* 作者 */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono" style={{ color: raceColor }}>
                        {s.user_nick}
                      </span>
                      {raceName && (
                        <span className="text-xs font-mono text-white/20">{raceName}族</span>
                      )}
                      <span className="text-xs font-mono text-white/20">
                        {s.active_time?.slice(0, 10) ?? s.time?.slice(0, 10)}
                      </span>
                    </div>

                    {/* 内容摘要 */}
                    <p className="text-xs text-white/45 leading-relaxed line-clamp-3 mb-3">
                      {s.content?.replace(/<[^>]+>/g, '').replace(/\\n/g, ' ').trim().slice(0, 160)}
                    </p>

                    {/* 统计 */}
                    <div className="flex items-center gap-4 text-xs font-mono text-white/20">
                      <span>◎ {s.read_count ?? 0} 阅读</span>
                      <span>◆ {s.top_num ?? 0} 点赞</span>
                      <span>○ {s.comment_count ?? 0} 评论</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
