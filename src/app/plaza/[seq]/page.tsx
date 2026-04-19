import { Nav } from '@/components/Nav'
import { getLoggedIn } from '@/lib/auth'
import { getSpeech, getSpeechComments, login, RACE_NAMES, RACE_COLORS } from '@/lib/api2140'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function SpeechPage({ params }: { params: Promise<{ seq: string }> }) {
  const { seq } = await params
  const [loggedIn, cookie] = await Promise.all([
    getLoggedIn(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])

  const [speech, comments] = await Promise.allSettled([
    getSpeech(cookie ?? '', seq),
    getSpeechComments(cookie ?? '', seq, 0),
  ]).then(r => r.map(s => s.status === 'fulfilled' ? s.value : null))

  const commentList: any[] = Array.isArray(comments) ? comments : []
  const raceColor = speech?.race_seq ? (RACE_COLORS[speech.race_seq] ?? '#888') : '#f97316'

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-3xl mx-auto">
      <Nav active="/plaza" loggedIn={loggedIn} />

      <div className="mb-4">
        <Link href="/plaza" className="text-xs font-mono text-white/30 hover:text-white/60">← 广场</Link>
      </div>

      {!speech ? (
        <div className="text-center py-20 text-white/30 font-mono text-sm">帖子加载失败</div>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white font-mono mb-3">{speech.title}</h1>
            <div className="flex items-center gap-3 mb-4">
              {speech.user_avatar && <img src={speech.user_avatar} alt="" className="w-8 h-8 rounded-full" />}
              <div>
                <span className="text-xs font-mono font-bold" style={{ color: raceColor }}>{speech.user_nick}</span>
                {speech.race_seq && (
                  <span className="text-xs font-mono text-white/30 ml-2">{RACE_NAMES[speech.race_seq]}族</span>
                )}
                <div className="text-xs font-mono text-white/25 mt-0.5">{speech.time?.slice(0, 16)}</div>
              </div>
            </div>

            <div
              className="text-sm font-mono text-white/70 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: speech.content ?? '' }}
            />

            <div className="flex items-center gap-6 mt-4 text-xs font-mono text-white/30">
              <span>◎ {speech.read_count ?? 0} 阅读</span>
              <span>◆ {speech.top_num ?? 0} 点赞</span>
              <span>○ {speech.comment_count ?? 0} 评论</span>
            </div>
          </div>

          {commentList.length > 0 && (
            <div className="border-t border-white/8 pt-6">
              <div className="text-xs font-mono text-white/40 mb-4">评论 ({commentList.length})</div>
              <div className="space-y-4">
                {commentList.map((c: any, i: number) => (
                  <div key={i} className="flex gap-3">
                    {c.user_avatar && <img src={c.user_avatar} alt="" className="w-7 h-7 rounded-full shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-white/60">{c.user_nick}</span>
                        <span className="text-xs font-mono text-white/20">{c.time?.slice(0, 10)}</span>
                      </div>
                      <p className="text-xs font-mono text-white/50 leading-relaxed">{c.content}</p>
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
