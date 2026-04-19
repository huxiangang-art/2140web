import { Nav } from '@/components/Nav'
import { getLoggedIn, getUserCookie } from '@/lib/auth'
import { getRacewarTasks, getBranchMissions, getCompletedMissions, login } from '@/lib/api2140'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getData(cookie: string) {
  const [tasks, missions, completed] = await Promise.allSettled([
    getRacewarTasks(cookie),
    getBranchMissions(cookie),
    getCompletedMissions(cookie),
  ]).then(r => r.map(s => s.status === 'fulfilled' ? s.value : null))
  return { tasks, missions, completed: completed ?? [] }
}

export default async function RacewarTasksPage() {
  const [loggedIn, userCookie, sysCookie] = await Promise.all([
    getLoggedIn(),
    getUserCookie(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])

  const cookie = userCookie ?? sysCookie ?? ''
  const { tasks, missions, completed } = await getData(cookie)

  const raceTasks: any[] = tasks?.race_tasks ?? tasks?.tasks ?? (Array.isArray(tasks) ? tasks : [])
  const missionList: any[] = missions?.data ?? (Array.isArray(missions) ? missions : [])
  const completedList: any[] = Array.isArray(completed) ? completed : (completed as any)?.data ?? []

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <Nav active="/racewar" loggedIn={loggedIn} />
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold text-white font-mono">种族战争任务</h2>
          <p className="text-xs text-white/30 mt-1">种族任务 · 支线任务 · 碎片探索</p>
        </div>
        <Link href="/racewar" className="text-xs font-mono text-white/40 hover:text-white/70 transition-colors">
          ← 战争总览
        </Link>
      </div>

      <div className="space-y-8">
        {/* 种族任务 */}
        {raceTasks.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-3">
              <div className="text-xs font-mono text-white/50 font-bold">种族任务</div>
              <div className="flex-1 h-px bg-white/8" />
            </div>
            <div className="space-y-2">
              {raceTasks.map((t: any, i: number) => {
                const pct = t.target_num > 0 ? Math.min(100, Math.round((t.current_num / t.target_num) * 100)) : 0
                const done = t.status === '1' || t.is_complete === 1
                return (
                  <div key={t.seq ?? i} className="border border-white/10 rounded-xl p-4 bg-white/3">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <div className="text-sm font-mono text-white/90">{t.title ?? t.name}</div>
                        {t.desc && <div className="text-xs font-mono text-white/40 mt-0.5">{t.desc}</div>}
                      </div>
                      <div className="shrink-0">
                        {done
                          ? <span className="text-xs font-mono text-green-400">已完成</span>
                          : <span className="text-xs font-mono text-white/30">进行中</span>
                        }
                      </div>
                    </div>
                    {t.target_num > 0 && (
                      <div>
                        <div className="flex justify-between text-xs font-mono text-white/30 mb-1">
                          <span>{t.current_num ?? 0} / {t.target_num}</span>
                          <span className="text-white/50">{t.reward_hashrate && `+${t.reward_hashrate} H`}</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: done ? '#22c55e' : '#3b82f6' }} />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* 支线任务 */}
        {missionList.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-3">
              <div className="text-xs font-mono text-white/50 font-bold">支线任务</div>
              <div className="flex-1 h-px bg-white/8" />
              <div className="text-xs font-mono text-white/20">{missionList.length} 个</div>
            </div>
            <div className="space-y-2">
              {missionList.map((m: any, i: number) => (
                <div key={m.seq ?? i} className="border border-white/10 rounded-xl p-4 bg-white/3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-sm font-mono text-white/90">{m.title ?? m.name}</div>
                      {m.introduce && <div className="text-xs font-mono text-white/40 mt-1 line-clamp-2">{m.introduce}</div>}
                    </div>
                    <div className="shrink-0 text-right text-xs font-mono text-white/40">
                      {m.reward_hashrate && <div className="text-cyan-400">+{m.reward_hashrate} H</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 已完成任务 */}
        {completedList.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-3">
              <div className="text-xs font-mono text-white/50 font-bold">已完成</div>
              <div className="flex-1 h-px bg-white/8" />
              <div className="text-xs font-mono text-white/20">{completedList.length} 个</div>
            </div>
            <div className="space-y-2">
              {completedList.map((m: any, i: number) => (
                <div key={m.seq ?? i} className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-xs font-mono text-white/50">{m.title ?? m.name}</span>
                  <span className="text-xs font-mono text-green-400/60">✓ {m.time?.slice(0, 10)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {raceTasks.length === 0 && missionList.length === 0 && (
          <div className="text-center py-20 text-white/30 font-mono text-sm">暂无任务数据</div>
        )}
      </div>
    </main>
  )
}
