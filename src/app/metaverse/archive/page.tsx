import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { getLoggedIn, getUserCookie } from '@/lib/auth'
import { login } from '@/lib/api2140'
import { buildMetaverseContext } from '@/lib/metaverse-context'
import { num } from '@/lib/metaverse'
import { SnapshotButton } from './SnapshotButton'

export const dynamic = 'force-dynamic'

export default async function MetaverseArchivePage() {
  const [loggedIn, userCookie, sysCookie] = await Promise.all([
    getLoggedIn(),
    getUserCookie(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])
  const cookie = userCookie ?? sysCookie ?? ''
  const context = await buildMetaverseContext(cookie)
  const snapshots = await getSnapshots()
  const updatedAt = new Date().toISOString()
  const metrics = {
    main_maps: context.mainMaps.length,
    branch_maps: context.branchMaps.length,
    risk_debriss: context.riskDebriss.length,
    risk_branches: context.riskBranches.length,
    tasks: context.tasks.length + context.missions.length,
  }

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <Nav active="/metaverse" loggedIn={loggedIn} />
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono text-white">元宇宙数据档案</h1>
          <p className="mt-1 text-xs font-mono text-white/30">地图 · 碎片 · 任务 · 支线 · Agent 上下文</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SnapshotButton metrics={metrics} summary={context.summary} />
          <Link href={`/metaverse/agent?lane=governance&prompt=${encodeURIComponent(context.summary.join('\n'))}`} className="h-fit w-fit rounded border border-cyan-300/20 px-3 py-2 text-xs font-mono text-cyan-100/70">送入 Agent</Link>
        </div>
      </div>

      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Metric label="主线地图" value={num(context.mainMaps.length)} />
        <Metric label="支线文明" value={num(context.branchMaps.length)} />
        <Metric label="风险碎片" value={num(context.riskDebriss.length)} />
        <Metric label="风险支线" value={num(context.riskBranches.length)} />
        <Metric label="任务" value={num(context.tasks.length + context.missions.length)} />
      </section>

      <section className="mb-6 rounded-lg border border-white/10 bg-white/[0.025] p-4">
        <div className="mb-3 text-xs font-mono text-white/35">数据来源</div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {['/racewar/get_map_situation/', '/racewar/get_branch_maps/', '/racewar/get_tasks/', '/branchMission/get_missions/', '/user/get_user_info/'].map(endpoint => (
            <div key={endpoint} className="rounded border border-white/8 bg-black/22 p-3 text-xs font-mono text-white/45">{endpoint}</div>
          ))}
        </div>
        <div className="mt-3 text-xs font-mono text-white/25">更新时间 {updatedAt}</div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="风险碎片" rows={context.riskDebriss.slice(0, 12).map(d => `${d.map_name} / ${d.name} / ${d.status.label}`)} />
        <Panel title="风险支线" rows={context.riskBranches.slice(0, 12).map(b => `${b.name} / ${b.status.label} / ${b.health ?? 0}HP`)} />
      </section>

      <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.025] p-4">
        <div className="mb-3 text-xs font-mono text-white/35">快照版本</div>
        <div className="space-y-2">
          {snapshots.slice(0, 8).map((snapshot: any) => (
            <div key={snapshot.id} className="rounded border border-white/8 bg-black/22 p-3">
              <div className="text-xs font-mono text-white/65">{snapshot.title}</div>
              <div className="mt-1 text-xs font-mono text-white/25">{snapshot.created_at}</div>
            </div>
          ))}
          {!snapshots.length && <div className="py-8 text-center text-xs font-mono text-white/25">暂无历史快照</div>}
        </div>
      </section>
    </main>
  )
}

async function getSnapshots() {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'
    const res = await fetch(`${base}/api/metaverse/archive`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    return data.snapshots ?? []
  } catch {
    return []
  }
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-white/10 bg-black/20 p-3"><div className="text-xs font-mono text-white/30">{label}</div><div className="mt-1 text-xl font-bold font-mono text-cyan-300">{value}</div></div>
}

function Panel({ title, rows }: { title: string; rows: string[] }) {
  return <section className="rounded-lg border border-white/10 bg-white/[0.025] p-4"><div className="mb-3 text-xs font-mono text-white/35">{title}</div><div className="space-y-2">{rows.length ? rows.map((row, i) => <div key={i} className="rounded border border-white/8 bg-black/22 p-3 text-xs text-white/55">{row}</div>) : <div className="py-8 text-center text-xs font-mono text-white/25">暂无数据</div>}</div></section>
}
