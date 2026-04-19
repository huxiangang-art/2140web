import { Nav } from '@/components/Nav'
import { getLoggedIn } from '@/lib/auth'
import { getWriteChapter, getChapterComments, getInvestmentInfo, login } from '@/lib/api2140'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ChapterPage({ params }: { params: Promise<{ bseq: string; cseq: string }> }) {
  const { bseq, cseq } = await params
  const [loggedIn, cookie] = await Promise.all([
    getLoggedIn(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])

  const [chapter, comments, invest] = await Promise.allSettled([
    getWriteChapter(cookie ?? '', bseq, cseq),
    getChapterComments(cookie ?? '', cseq, '2', '1', 0),
    getInvestmentInfo(cookie ?? '', cseq),
  ]).then(r => r.map(s => s.status === 'fulfilled' ? s.value : null))

  const commentList: any[] = Array.isArray(comments) ? comments : []

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-3xl mx-auto">
      <Nav active="/write" loggedIn={loggedIn} />

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2 text-xs font-mono text-white/30">
          <Link href="/write" className="hover:text-white/60">文明史</Link>
          <span>›</span>
          <Link href={`/write/branch/${bseq}`} className="hover:text-white/60">支线</Link>
          <span>›</span>
          <span className="text-white/50">章节</span>
        </div>
      </div>

      {!chapter ? (
        <div className="text-center py-20 text-white/30 font-mono text-sm">章节加载失败</div>
      ) : (
        <>
          {/* 章节头部 */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white font-mono mb-3">{chapter.title}</h1>
            <div className="flex items-center gap-4 text-xs font-mono text-white/30">
              <div className="flex items-center gap-2">
                {chapter.author_avatar && (
                  <img src={chapter.author_avatar} alt="" className="w-5 h-5 rounded-full" />
                )}
                <span>{chapter.author_nickname}</span>
              </div>
              <span>{chapter.time?.slice(0, 10)}</span>
              {chapter.grade_avg && <span>★ {parseFloat(chapter.grade_avg).toFixed(1)}</span>}
              {chapter.read_count && <span>◎ {chapter.read_count}</span>}
            </div>
          </div>

          {/* 投资信息 */}
          {invest && (
            <div className="border border-cyan-500/20 rounded-xl p-4 mb-6 bg-cyan-500/5">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-4 text-white/50">
                  <span>算力池 <span className="text-cyan-400">{Number(invest.hashrate_pool ?? 0).toLocaleString()} H</span></span>
                  <span>代币池 <span className="text-yellow-400">{Number(invest.token_pool ?? 0).toFixed(2)} T</span></span>
                  <span>投资人 <span className="text-white/70">{invest.investor_count ?? 0}</span></span>
                </div>
                {loggedIn && (
                  <Link href={`/write/invest?chapter=${cseq}&branch=${bseq}`}
                    className="text-xs font-mono text-cyan-400/70 hover:text-cyan-400 transition-colors">
                    投资 →
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* 正文 */}
          <article className="prose prose-invert max-w-none mb-10">
            <div
              className="text-sm font-mono text-white/70 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: chapter.content ?? '' }}
            />
          </article>

          {/* 评论 */}
          {commentList.length > 0 && (
            <section className="border-t border-white/8 pt-8">
              <div className="text-xs font-mono text-white/40 mb-4">评论 ({commentList.length})</div>
              <div className="space-y-4">
                {commentList.map((c: any, i: number) => (
                  <div key={i} className="flex gap-3">
                    {c.user_avatar && (
                      <img src={c.user_avatar} alt="" className="w-7 h-7 rounded-full shrink-0 mt-0.5" />
                    )}
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
            </section>
          )}
        </>
      )}
    </main>
  )
}
