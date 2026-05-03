import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { getLoggedIn, getUserCookie } from '@/lib/auth'
import { RACE_COLORS, RACE_NAMES } from '@/lib/api2140'
import { pct, stripHtml } from '@/lib/metaverse'
import { getWarActionPlan, getWarSnapshot } from '@/lib/metaverse-war'
import { QuestActionClient } from '../../quests/QuestActionClient'

export const dynamic = 'force-dynamic'

export default async function WarQuestsPage() {
  const [loggedIn, userCookie] = await Promise.all([getLoggedIn(), getUserCookie()])
  const snapshot = await getWarSnapshot(userCookie)
  const race = String(snapshot.userInfo?.race ?? '')
  const raceTasks = race ? snapshot.raceTasks.filter(t => String(t.race_seq) === race) : snapshot.raceTasks
  const active = raceTasks.filter(t => String(t.status) !== '1' || pct(t.per) < 100)
  const plan = getWarActionPlan(snapshot)
  const raceColor = RACE_COLORS[race] ?? '#94a3b8'

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <Nav active="/metaverse" loggedIn={loggedIn} />
      <Header title="战争任务" sub={`${RACE_NAMES[race] ?? '公共'} · 种族任务 · 支线任务 · Agent 今日三件事`} />
      <section className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        {plan.slice(0, 3).map((line, i) => <div key={i} className="rounded border border-cyan-300/15 bg-cyan-300/5 p-3 text-xs leading-relaxed text-cyan-100/70">{line}</div>)}
      </section>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="我的种族任务">
          <div className="space-y-2">{(active.length ? active : raceTasks.slice(-8).reverse()).slice(0, 12).map((task, i) => <TaskCard key={task.seq ?? i} task={task} color={raceColor} />)}</div>
        </Panel>
        <Panel title="支线任务">
          <div className="space-y-2">{snapshot.branchMissions.slice(0, 12).map((task, i) => <TaskCard key={task.seq ?? i} task={task} color="#38bdf8" />)}</div>
        </Panel>
      </div>
    </main>
  )
}

function TaskCard({ task, color }: { task: any; color: string }) {
  const progress = pct(task.per ?? task.schedule)
  return <div className="rounded border border-white/8 bg-black/20 p-3"><div className="line-clamp-3 text-xs leading-relaxed text-white/70">{stripHtml(task.title ?? task.name ?? task.task_desc ?? task.introduce)}</div><div className="mt-3 flex items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: color }} /></div><span className="w-10 text-right text-xs font-mono" style={{ color }}>{progress}%</span></div><QuestActionClient href="/racewar/tasks" /></div>
}

function Header({ title, sub }: { title: string; sub: string }) {
  return <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><h1 className="text-2xl font-bold font-mono text-white">{title}</h1><p className="mt-1 text-xs font-mono text-white/30">{sub}</p></div><Link href="/metaverse/war" className="w-fit rounded border border-white/10 px-3 py-2 text-xs font-mono text-white/40 hover:border-white/25 hover:text-white/70">战争中心</Link></div>
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-lg border border-white/10 bg-white/[0.025] p-4"><div className="mb-4 text-xs font-mono text-white/35">{title}</div>{children}</section>
}
