import { Nav } from '@/components/Nav'
import { getLoggedIn, getUserCookie } from '@/lib/auth'
import { getTasks, login } from '@/lib/api2140'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const TASK_TYPE: Record<string, string> = {
  '1': '每日', '2': '成就', '3': '新手', '4': '种族',
}
const STATUS_COLOR: Record<string, string> = {
  '0': '#6b7280', '1': '#22c55e', '2': '#f59e0b',
}
const STATUS_LABEL: Record<string, string> = {
  '0': '未完成', '1': '已完成', '2': '可领取',
}

async function getData(cookie: string) {
  try {
    return getTasks(cookie)
  } catch { return [] }
}

export default async function TasksPage() {
  const [loggedIn, userCookie, sysCookie] = await Promise.all([
    getLoggedIn(),
    getUserCookie(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])
  if (!loggedIn) redirect('/login')

  const cookie = userCookie ?? sysCookie ?? ''
  const tasks: any[] = await getData(cookie)

  const byType: Record<string, any[]> = {}
  for (const t of tasks) {
    const k = t.type ?? '0'
    if (!byType[k]) byType[k] = []
    byType[k].push(t)
  }

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <Nav active="/tasks" loggedIn={loggedIn} />
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white font-mono">任务系统</h2>
        <p className="text-xs text-white/30 mt-1">完成任务 · 获取算力奖励</p>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-20 text-white/30 font-mono text-sm">暂无任务数据</div>
      ) : (
        <div className="space-y-8">
          {Object.entries(byType).map(([type, list]) => (
            <div key={type}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-xs font-mono text-white/50 font-bold">
                  {TASK_TYPE[type] ?? `类型${type}`}
                </div>
                <div className="flex-1 h-px bg-white/8" />
                <div className="text-xs font-mono text-white/20">{list.length} 个</div>
              </div>
              <div className="space-y-2">
                {list.map((t: any) => {
                  const color = STATUS_COLOR[t.status ?? '0'] ?? '#6b7280'
                  const pct = t.target > 0 ? Math.min(100, Math.round((t.current / t.target) * 100)) : 0
                  return (
                    <div key={t.seq} className="border border-white/10 rounded-xl p-4 bg-white/3">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="text-sm font-mono text-white/90 font-medium">{t.title}</div>
                          {t.desc && <div className="text-xs text-white/40 font-mono mt-0.5">{t.desc}</div>}
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-xs font-mono font-bold" style={{ color }}>
                            {STATUS_LABEL[t.status ?? '0']}
                          </div>
                          {t.reward && (
                            <div className="text-xs font-mono text-white/40 mt-0.5">+{t.reward} H</div>
                          )}
                        </div>
                      </div>
                      {t.target > 0 && (
                        <div>
                          <div className="flex justify-between text-xs font-mono text-white/30 mb-1">
                            <span>{t.current ?? 0} / {t.target}</span>
                            <span>{pct}%</span>
                          </div>
                          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
