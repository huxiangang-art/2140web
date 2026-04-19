import { Nav } from '@/components/Nav'
import { WriteClient } from '@/components/WriteClient'
import { redirect } from 'next/navigation'
import { getLoggedIn, getUserCookie } from '@/lib/auth'
import { getUserInfo, getHashratePool, login, getWriteBranchs, getRecentUpdates } from '@/lib/api2140'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function WritePage() {
  const loggedIn = await getLoggedIn()
  if (!loggedIn) redirect('/login')

  const userCookie = await getUserCookie()
  const [infoRes, sysCookie] = await Promise.all([
    getUserInfo(userCookie!),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])

  const info = infoRes?.ret === 0 ? infoRes.data : null
  const cookie = sysCookie ?? ''
  const [pool, branches, recent] = await Promise.allSettled([
    getHashratePool(cookie),
    getWriteBranchs(cookie, '1', '1'),
    getRecentUpdates(cookie, 0),
  ]).then(r => r.map(s => s.status === 'fulfilled' ? s.value : null))

  const branchList: any[] = Array.isArray(branches) ? branches : []
  const recentList: any[] = Array.isArray(recent) ? recent : []

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <Nav active="/write" loggedIn={loggedIn} />

      <div className="mb-6">
        <h2 className="text-xl font-bold text-white font-mono">文明史书写</h2>
        <p className="text-xs text-white/30 mt-1">你的章节将永久记录在2140文明时间线</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左：投稿 */}
        <div className="lg:col-span-1">
          <div className="text-xs font-mono text-white/40 mb-3">投稿章节</div>
          <WriteClient
            roundSeq={(pool as any)?.seq}
            authorRace={info?.race}
            authorName={info?.nickname}
          />
          <div className="mt-4">
            <Link href="/write/invest" className="text-xs font-mono text-cyan-400/70 hover:text-cyan-400 transition-colors">
              写作投资 →
            </Link>
          </div>
        </div>

        {/* 右：支线列表 + 最新更新 */}
        <div className="lg:col-span-2 space-y-6">
          {recentList.length > 0 && (
            <section>
              <div className="text-xs font-mono text-white/40 mb-3">最新更新</div>
              <div className="space-y-2">
                {recentList.slice(0, 8).map((c: any) => (
                  <Link
                    key={c.seq ?? c.chapter_seq}
                    href={`/write/chapter/${c.branch_seq}/${c.seq ?? c.chapter_seq}`}
                    className="block border border-white/8 rounded-lg p-3 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-mono text-white/70 truncate font-medium">{c.title ?? c.branch_name}</div>
                        <div className="text-xs font-mono text-white/30 mt-0.5 truncate">{c.author_nickname ?? c.user_nick}</div>
                      </div>
                      <div className="text-xs font-mono text-white/20 shrink-0">{c.time?.slice(0, 10)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {branchList.length > 0 && (
            <section>
              <div className="text-xs font-mono text-white/40 mb-3">支线列表 ({branchList.length})</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {branchList.slice(0, 20).map((b: any) => (
                  <Link
                    key={b.seq}
                    href={`/write/branch/${b.seq}`}
                    className="border border-white/8 rounded-lg p-3 hover:border-white/20 transition-colors"
                  >
                    <div className="text-xs font-mono text-white/70 font-medium truncate mb-1">{b.name ?? b.title}</div>
                    <div className="flex items-center gap-3 text-xs font-mono text-white/25">
                      <span>Lv{b.lv ?? b.level ?? '?'}</span>
                      {b.chapter_count !== undefined && <span>{b.chapter_count} 章</span>}
                      {b.author_nickname && <span>{b.author_nickname}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
