import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { getLoggedIn, getUserCookie } from '@/lib/auth'
import { getBranchMissions, getCompletedMissions, getRacewarTasks, getUserInfo, login, RACE_COLORS, RACE_NAMES } from '@/lib/api2140'
import { arr, flattenRaceTasks, pct, settled, stripHtml } from '@/lib/metaverse'
import { QuestActionClient } from './QuestActionClient'

export const dynamic = 'force-dynamic'

const RACES = ['1', '2', '3', '4', '5', '6']

export default async function MetaverseQuestsPage() {
  const [loggedIn, userCookie, sysCookie] = await Promise.all([
    getLoggedIn(),
    getUserCookie(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])
  const cookie = userCookie ?? sysCookie ?? ''
  const [infoRaw, tasksRaw, missionsRaw, completedRaw] = await Promise.all([
    userCookie ? settled(getUserInfo(userCookie), null) : null,
    settled(getRacewarTasks(cookie), null),
    settled(getBranchMissions(cookie), null),
    settled(getCompletedMissions(cookie), []),
  ])
  const userInfo = infoRaw?.ret === 0 ? infoRaw.data : null
  const myRace = String(userInfo?.race ?? '')
  const raceColor = RACE_COLORS[myRace] ?? '#94a3b8'
  const tasks = normalizeRaceTasks(tasksRaw)
  const flatTasks = flattenRaceTasks(tasksRaw)
  const branchMissions = normalizeBranchMissions(missionsRaw)
  const completed = arr(completedRaw)
  const myFlat = myRace ? flatTasks.filter(t => String(t.race_seq) === myRace) : flatTasks
  const active = myFlat.filter(t => String(t.status) !== '1' && pct(t.per ?? t.schedule) < 100)
  const done = myFlat.length - active.length
  const recommendations = buildRecommendations(active, branchMissions, myRace)
  const todayRows = [
    active[0] ? `主线：${stripHtml(active[0].title ?? active[0].name ?? active[0].task_desc ?? active[0].introduce).slice(0, 52)}` : '主线：检查当前文明等级任务',
    branchMissions[0] ? `支线：${stripHtml(branchMissions[0].title ?? branchMissions[0].name ?? branchMissions[0].task_desc ?? branchMissions[0].introduce ?? branchMissions[0].desc).slice(0, 52)}` : '支线：查看支线文明建设任务',
    '安全：所有消耗动作先生成确认单并进入审计',
  ]

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <Nav active="/metaverse" loggedIn={loggedIn} />
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono text-white">任务中心</h1>
          <p className="mt-1 text-xs font-mono text-white/30">{RACE_NAMES[myRace] ?? '公共视角'} · 文明进化任务 · 支线任务</p>
        </div>
        <div className="flex gap-2">
          <Link href="/metaverse/worlds" className="rounded border border-white/10 px-3 py-2 text-xs font-mono text-white/40 hover:border-white/25 hover:text-white/70">文明切换</Link>
          <Link href="/metaverse/agent" className="rounded border border-cyan-300/20 px-3 py-2 text-xs font-mono text-cyan-100/70 hover:border-cyan-300/45">生成任务提案</Link>
        </div>
      </div>

      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label="我的种族" value={RACE_NAMES[myRace] ?? '未登录'} color={raceColor} />
        <Metric label="可推进" value={String(active.length)} color="#38bdf8" />
        <Metric label="已完成战争" value={String(done)} color="#22c55e" />
        <Metric label="支线任务" value={String(branchMissions.length)} color="#facc15" />
      </section>

      <section className="mb-6 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.035] p-4">
        <div className="mb-3 text-xs font-mono text-cyan-100/60">下一步推荐</div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {recommendations.map((row, i) => (
            <Link key={i} href={`/metaverse/agent?lane=quest&prompt=${encodeURIComponent(row)}`} className="rounded border border-cyan-300/12 bg-black/24 p-3 text-xs leading-relaxed text-white/58 hover:border-cyan-300/30">
              {row}
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-6 rounded-lg border border-white/10 bg-white/[0.025] p-4">
        <div className="mb-3 text-xs font-mono text-white/35">每日行动面板</div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {todayRows.map((row, i) => (
            <Link key={i} href={`/metaverse/agent?lane=quest&prompt=${encodeURIComponent(row)}`} className="rounded border border-white/8 bg-black/22 p-3 text-xs leading-relaxed text-white/55 hover:border-cyan-300/25">{row}</Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section>
          <div className="mb-3 text-xs font-mono text-white/35">主线文明任务矩阵</div>
          <div className="space-y-4">
            {tasks.map(level => (
              <div key={level.lv} className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-sm font-mono text-white/85">Lv.{level.lv} 文明进化</div>
                  <span className="text-xs font-mono text-white/28">{level.total} 个任务步骤</span>
                </div>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {RACES.map(race => {
                    const rows = level.races[race] ?? []
                    const current = race === myRace
                    return (
                      <div key={race} className={`rounded border p-3 ${current ? 'border-cyan-300/25 bg-cyan-300/[0.045]' : 'border-white/8 bg-black/22'}`}>
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="text-xs font-mono" style={{ color: RACE_COLORS[race] ?? '#94a3b8' }}>{RACE_NAMES[race] ?? `种族 ${race}`}</span>
                          <span className="text-xs font-mono text-white/25">{rows.length}</span>
                        </div>
                        <div className="space-y-2">
                          {rows.slice(0, 3).map((task: any, index: number) => <QuestCard key={task.seq ?? `${race}-${index}`} task={task} compact />)}
                          {!rows.length && <div className="py-6 text-center text-xs font-mono text-white/20">暂无任务</div>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
            {!tasks.length && <div className="rounded-lg border border-white/8 bg-black/20 py-16 text-center text-xs font-mono text-white/25">暂无主线任务数据</div>}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
            <div className="mb-4 text-xs font-mono text-white/35">我的可推进任务</div>
            <div className="space-y-2">
              {active.slice(0, 8).map((task, i) => <QuestCard key={task.seq ?? i} task={task} />)}
              {!active.length && <div className="py-10 text-center text-xs font-mono text-white/25">暂无可推进任务</div>}
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
            <div className="mb-4 text-xs font-mono text-white/35">支线任务</div>
            <div className="space-y-2">
              {branchMissions.slice(0, 10).map((mission, i) => (
                <div key={mission.seq ?? i} className="rounded border border-white/8 bg-black/22 p-3">
                  <div className="mb-1 text-xs font-mono text-cyan-200/65">{mission.type_name ?? mission.txt_tag ?? '支线任务'}</div>
                  <div className="line-clamp-3 text-xs leading-relaxed text-white/62">{stripHtml(mission.title ?? mission.name ?? mission.task_desc ?? mission.introduce ?? mission.desc)}</div>
                  {mission.branch_name && <div className="mt-2 text-xs font-mono text-white/25">{mission.branch_name}</div>}
                </div>
              ))}
              {!branchMissions.length && <div className="py-10 text-center text-xs font-mono text-white/25">暂无支线任务</div>}
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
            <div className="mb-4 text-xs font-mono text-white/35">完成记录</div>
            <div className="space-y-2">
              {completed.slice(0, 8).map((task, i) => (
                <div key={task.seq ?? i} className="rounded border border-white/8 bg-black/22 p-3">
                  <div className="line-clamp-2 text-xs leading-relaxed text-white/62">{stripHtml(task.title ?? task.name ?? task.task_desc ?? task.introduce ?? task.desc)}</div>
                  <div className="mt-2 text-xs font-mono text-green-300/55">{task.time?.slice?.(0, 10) ?? '已完成'}</div>
                </div>
              ))}
              {!completed.length && <div className="py-10 text-center text-xs font-mono text-white/25">暂无完成记录</div>}
            </div>
          </section>
        </aside>
      </div>
    </main>
  )
}

function normalizeRaceTasks(raw: any) {
  const flat = flattenRaceTasks(raw)
  const grouped = new Map<string, { lv: string; total: number; races: Record<string, any[]> }>()
  for (const taskRaw of flat) {
    const task: any = taskRaw
    const lv = String(task.lv ?? task.level ?? '0')
    const race = String(task.race_seq ?? task.race ?? '')
    if (!grouped.has(lv)) grouped.set(lv, { lv, total: 0, races: {} })
    const item = grouped.get(lv)!
    item.total += 1
    if (!item.races[race]) item.races[race] = []
    item.races[race].push(task)
  }
  return [...grouped.values()].sort((a, b) => Number(a.lv) - Number(b.lv))
}

function normalizeBranchMissions(raw: any) {
  const direct = arr(raw?.data ?? raw?.missions ?? raw)
  if (direct.length) return direct
  if (!raw || typeof raw !== 'object') return []
  return Object.entries(raw).flatMap(([typeName, value]) => arr(value).map((mission: any) => ({ ...mission, type_name: typeName })))
}

function buildRecommendations(active: any[], branchMissions: any[], myRace: string) {
  const rows = []
  const first = active[0]
  if (first) rows.push(`优先推进 ${RACE_NAMES[myRace] ?? '当前种族'} Lv.${first.lv ?? '-'} Step ${first.step ?? '-'}：${stripHtml(first.title ?? first.name ?? first.task_desc ?? first.introduce).slice(0, 44)}`)
  const branch = branchMissions[0]
  if (branch) rows.push(`补一条支线任务：${stripHtml(branch.title ?? branch.name ?? branch.task_desc ?? branch.introduce ?? branch.desc).slice(0, 48)}`)
  rows.push('生成今日任务提案：把主线任务、支线任务、战况风险合并成待审行动队列。')
  return rows.slice(0, 3)
}

function QuestCard({ task, compact = false }: { task: any; compact?: boolean }) {
  const progress = pct(task.per ?? task.schedule)
  return (
    <div className="rounded border border-white/8 bg-black/22 p-3">
      <div className={`${compact ? 'line-clamp-2' : 'line-clamp-3'} text-xs leading-relaxed text-white/68`}>{stripHtml(task.title ?? task.name ?? task.task_desc ?? task.introduce ?? task.desc)}</div>
      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-cyan-300" style={{ width: `${progress}%` }} /></div>
        <span className="w-10 text-right text-xs font-mono text-cyan-300">{progress}%</span>
      </div>
      {!compact && <QuestActionClient />}
    </div>
  )
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return <div className="rounded-lg border border-white/10 bg-black/20 p-3"><div className="text-xs font-mono text-white/30">{label}</div><div className="mt-1 truncate text-xl font-bold font-mono" style={{ color }}>{value}</div></div>
}
