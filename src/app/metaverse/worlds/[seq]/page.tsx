import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Nav } from '@/components/Nav'
import { getLoggedIn } from '@/lib/auth'
import { getDebrisRank, getMapRank, getMapSituation, getRacewarTasks, getTimeNodes, login } from '@/lib/api2140'
import { arr, num, settled } from '@/lib/metaverse'
import { getDebrisStatus, getMapUnlockStatus } from '@/lib/racewar-status'

export const dynamic = 'force-dynamic'

export default async function MainWorldDetail({ params }: { params: Promise<{ seq: string }> }) {
  const { seq } = await params
  const [loggedIn, sysCookie] = await Promise.all([
    getLoggedIn(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])
  const cookie = sysCookie ?? ''
  const [situation, mapRank, debrisRank, nodes, tasksRaw] = await Promise.all([
    settled(getMapSituation(cookie), null),
    settled(getMapRank(cookie, seq), null),
    settled(getDebrisRank(cookie, Number(seq) || 1), null),
    settled(getTimeNodes(cookie), []),
    settled(getRacewarTasks(cookie), null),
  ])
  const map = arr(situation?.maps).find(m => String(m.seq) === String(seq))
  if (!map) notFound()
  const residents = arr(mapRank?.total_users ?? mapRank?.users ?? mapRank)
  const daily = arr(debrisRank?.user_daily)
  const linkedNodes = arr(nodes).filter(n => Number(n.branch_seq) > 0).slice(Math.max(0, Number(map.lv ?? 1) - 1), Number(map.lv ?? 1) + 3)
  const levelTasks = Object.values((tasksRaw as any)?.[map.lv] ?? (tasksRaw as any)?.[String(map.lv)] ?? {}).flatMap((v: any) => arr(v))
  const unlock = getMapUnlockStatus(map)

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <Nav active="/metaverse" loggedIn={loggedIn} />
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-mono text-purple-300/60">主线文明 Lv.{map.lv}</div>
          <h1 className="mt-1 text-2xl font-bold font-mono text-white">{map.name}</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/racewar/map/${seq}`} className="w-fit rounded border border-cyan-300/20 px-3 py-2 text-xs font-mono text-cyan-100/70 hover:border-cyan-300/45">进入地图</Link>
          <Link href="/metaverse/worlds" className="w-fit rounded border border-white/10 px-3 py-2 text-xs font-mono text-white/40 hover:border-white/25 hover:text-white/70">世界地图</Link>
        </div>
      </div>

      <div className="mb-6 h-56 overflow-hidden rounded-lg border border-white/10 bg-black/30">
        <img src={`/racewar/racewar_map_select_map_cover${map.lv}.jpg`} alt="" className="h-full w-full object-cover" />
      </div>

      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label="开放状态" value={unlock.label} />
        <Metric label="碎片数" value={String(arr(map.debriss).length)} />
        <Metric label="任务缺口" value={String(levelTasks.length)} />
        <Metric label="文明等级" value={`Lv.${map.lv}`} />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-lg border border-white/10 bg-white/[0.025] p-4">
          <div className="mb-4 text-xs font-mono text-white/35">碎片基地</div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {arr(map.debriss).map(debris => (
              <Link key={debris.seq} href={`/racewar/debris/${debris.seq}`} className="rounded border border-white/8 bg-black/20 p-3 transition-colors hover:border-white/20">
                <div className="text-sm font-mono text-white/75">{debris.name}</div>
                <div className={`mt-1 text-xs font-mono ${getDebrisStatus(debris.error_status).className}`}>{getDebrisStatus(debris.error_status).label}</div>
              </Link>
            ))}
          </div>
        </section>
        <Rank title="地票居民" rows={residents.slice(0, 12)} />
        <Rank title="今日贡献" rows={daily.slice(0, 12)} />
        <section className="lg:col-span-3 rounded-lg border border-white/10 bg-white/[0.025] p-4">
          <div className="mb-4 text-xs font-mono text-white/35">该等级任务缺口</div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            {levelTasks.slice(0, 9).map((task: any, i) => (
              <Link key={task.seq ?? i} href="/metaverse/quests" className="rounded border border-white/8 bg-black/20 p-3 transition-colors hover:border-cyan-300/25">
                <div className="line-clamp-2 text-xs leading-relaxed text-white/62">{task.title ?? task.name ?? task.task_desc ?? task.introduce ?? `任务 ${i + 1}`}</div>
              </Link>
            ))}
            {!levelTasks.length && <div className="py-8 text-center text-xs font-mono text-white/25 md:col-span-3">暂无任务缺口</div>}
          </div>
        </section>
        <section className="lg:col-span-3 rounded-lg border border-white/10 bg-white/[0.025] p-4">
          <div className="mb-4 text-xs font-mono text-white/35">关联章节节点</div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            {linkedNodes.map(node => (
              <Link key={node.seq} href={`/write/branch/${node.branch_seq}`} className="rounded border border-white/8 bg-black/20 p-3 transition-colors hover:border-white/20">
                <div className="text-xs font-mono text-cyan-300/60">{node.node_time}</div>
                <div className="mt-1 text-sm font-mono text-white/75">{node.node_title}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-white/10 bg-black/20 p-3"><div className="text-xs font-mono text-white/30">{label}</div><div className="mt-1 truncate text-lg font-bold font-mono text-cyan-300">{value}</div></div>
}

function Rank({ title, rows }: { title: string; rows: any[] }) {
  return <section className="rounded-lg border border-white/10 bg-white/[0.025] p-4"><div className="mb-4 text-xs font-mono text-white/35">{title}</div><div className="space-y-1">{rows.length ? rows.map((u, i) => <div key={u.user_seq ?? i} className="flex items-center gap-2 border-b border-white/5 py-1.5 last:border-0"><span className="w-5 text-xs font-mono text-white/20">{i + 1}</span><span className="min-w-0 flex-1 truncate text-xs font-mono text-white/65">{u.nickname ?? u.user_nickname ?? u.user_nick}</span><span className="text-xs font-mono text-cyan-300/60">{num(u.amount_sum ?? u.hashrate_sum ?? u.creation_index)}</span></div>) : <div className="py-10 text-center text-xs font-mono text-white/25">暂无数据</div>}</div></section>
}
