import { Nav } from '@/components/Nav'
import { getLoggedIn } from '@/lib/auth'
import { getWriteBranch, getWriteChapters, login } from '@/lib/api2140'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function BranchPage({ params }: { params: Promise<{ seq: string }> }) {
  const { seq } = await params
  const [loggedIn, cookie] = await Promise.all([
    getLoggedIn(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])

  const [branch, chapters] = await Promise.allSettled([
    getWriteBranch(cookie ?? '', seq),
    getWriteChapters(cookie ?? '', seq, '1', '1'),
  ]).then(r => r.map(s => s.status === 'fulfilled' ? s.value : null))

  const chapterList: any[] = Array.isArray(chapters) ? chapters : []

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <Nav active="/write" loggedIn={loggedIn} />

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2 text-xs font-mono text-white/30">
          <Link href="/write" className="hover:text-white/60">文明史</Link>
          <span>›</span>
          <span className="text-white/50">支线</span>
        </div>
        {branch ? (
          <>
            <h2 className="text-xl font-bold text-white font-mono">{branch.name ?? branch.title}</h2>
            <div className="flex items-center gap-4 mt-1 text-xs font-mono text-white/30">
              {branch.lv && <span>Lv{branch.lv}</span>}
              {branch.author_nickname && <span>by {branch.author_nickname}</span>}
              {chapterList.length > 0 && <span>{chapterList.length} 章节</span>}
            </div>
            {branch.desc && (
              <p className="text-xs font-mono text-white/50 mt-3 leading-relaxed line-clamp-3">
                {branch.desc.replace(/<[^>]+>/g, '')}
              </p>
            )}
          </>
        ) : (
          <h2 className="text-xl font-bold text-white font-mono">支线 #{seq}</h2>
        )}
      </div>

      {chapterList.length === 0 ? (
        <div className="text-center py-20 text-white/30 font-mono text-sm">暂无章节</div>
      ) : (
        <div className="space-y-2">
          {chapterList.map((c: any, i: number) => (
            <Link
              key={c.seq}
              href={`/write/chapter/${seq}/${c.seq}`}
              className="flex items-start gap-4 border border-white/8 rounded-xl p-4 hover:border-white/20 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-mono text-white/30 shrink-0 group-hover:bg-white/8">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-mono text-white/80 font-medium truncate">{c.title}</div>
                <div className="flex items-center gap-3 mt-1 text-xs font-mono text-white/30">
                  <span>{c.author_nickname ?? c.user_nick}</span>
                  <span>{c.time?.slice(0, 10)}</span>
                  {c.grade_avg && <span>★ {parseFloat(c.grade_avg).toFixed(1)}</span>}
                  {c.comment_count > 0 && <span>💬 {c.comment_count}</span>}
                </div>
                {c.abstract && (
                  <p className="text-xs font-mono text-white/35 mt-1.5 line-clamp-2 leading-relaxed">
                    {c.abstract.replace(/<[^>]+>/g, '')}
                  </p>
                )}
              </div>
              <div className="shrink-0 text-xs font-mono text-white/20 group-hover:text-white/40">→</div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
