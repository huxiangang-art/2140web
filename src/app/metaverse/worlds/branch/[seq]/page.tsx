import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Nav } from '@/components/Nav'
import { getLoggedIn } from '@/lib/auth'
import { getAllCityCodeBills, getBranchMaps, getBranchMissions, getTimeNodes, login } from '@/lib/api2140'
import { arr, num, settled, stripHtml } from '@/lib/metaverse'

export const dynamic = 'force-dynamic'

export default async function BranchWorldDetail({ params }: { params: Promise<{ seq: string }> }) {
  const { seq } = await params
  const [loggedIn, sysCookie] = await Promise.all([
    getLoggedIn(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])
  const cookie = sysCookie ?? ''
  const [maps, missionsRaw, nodes, bills] = await Promise.all([
    settled(getBranchMaps(cookie), []),
    settled(getBranchMissions(cookie), null),
    settled(getTimeNodes(cookie), []),
    settled(getAllCityCodeBills(cookie), []),
  ])
  const map = arr(maps).find(m => String(m.seq) === String(seq))
  if (!map) notFound()
  const missions = arr(missionsRaw?.data ?? missionsRaw?.missions ?? missionsRaw)
  const health = Math.max(0, Number(map.health ?? 0))
  const branchRank = [...arr(maps)].sort((a, b) => Number(b.health ?? 0) - Number(a.health ?? 0)).slice(0, 8)
  const linkedNodes = arr(nodes).filter(n => Number(n.branch_seq) > 0).slice(0, 6)
  const linkedBills = arr(bills).slice(0, 6)

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <Nav active="/metaverse" loggedIn={loggedIn} />
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-mono text-cyan-300/60">支线世界 Lv.{map.lv}</div>
          <h1 className="mt-1 text-2xl font-bold font-mono text-white">{map.name}</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/metaverse/agent/branch" className="w-fit rounded border border-cyan-300/20 px-3 py-2 text-xs font-mono text-cyan-100/70 hover:border-cyan-300/45">生成支线提案</Link>
          <Link href="/metaverse/worlds" className="w-fit rounded border border-white/10 px-3 py-2 text-xs font-mono text-white/40 hover:border-white/25 hover:text-white/70">世界地图</Link>
        </div>
      </div>

      <section className="mb-6 rounded-lg border border-white/10 bg-white/[0.025] p-5">
        <p className="text-sm leading-relaxed text-white/48">{stripHtml(map.desc)}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Metric label="创建者" value={map.user_nick ?? map.nickname ?? '-'} />
          <Metric label="任务数" value={String(map.mission_num ?? missions.length ?? 0)} />
          <Metric label="完成数" value={String(map.completed_mission_num ?? 0)} />
          <Metric label="等级" value={`Lv.${map.lv ?? '-'}`} />
        </div>
        <div className="mt-5 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-cyan-300" style={{ width: `${Math.min(100, Math.round((health / 100000) * 100))}%` }} /></div>
          <span className="w-24 text-right text-xs font-mono text-cyan-300">{num(health)} HP</span>
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
        <div className="mb-4 text-xs font-mono text-white/35">关联支线任务</div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {missions.length ? missions.slice(0, 10).map((mission, i) => (
            <div key={mission.seq ?? i} className="rounded border border-white/8 bg-black/20 p-3">
              <div className="line-clamp-2 text-xs leading-relaxed text-white/68">{stripHtml(mission.title ?? mission.name ?? mission.introduce)}</div>
              {mission.reward_hashrate && <div className="mt-2 text-xs font-mono text-cyan-300/60">+{mission.reward_hashrate} H</div>}
            </div>
          )) : <div className="py-10 text-center text-xs font-mono text-white/25 md:col-span-2">暂无任务数据</div>}
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title="支线活跃排行" rows={branchRank.map((b, i) => `${i + 1}. ${b.name} / ${num(Number(b.health ?? 0))} HP`)} />
        <Panel title="关联章节节点" rows={linkedNodes.map(n => `${n.node_time ?? ''} ${n.node_title ?? ''}`)} />
        <Panel title="CityCode 对照" rows={linkedBills.map(b => b.title ?? b.name ?? `法案 ${b.seq ?? ''}`)} />
      </section>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded border border-white/8 bg-black/22 p-3"><div className="text-xs font-mono text-white/28">{label}</div><div className="mt-1 truncate text-sm font-mono text-white/72">{value}</div></div>
}

function Panel({ title, rows }: { title: string; rows: string[] }) {
  return <section className="rounded-lg border border-white/10 bg-white/[0.025] p-4"><div className="mb-3 text-xs font-mono text-white/35">{title}</div><div className="space-y-2">{rows.length ? rows.map((row, i) => <div key={i} className="rounded border border-white/8 bg-black/22 p-3 text-xs text-white/55">{row}</div>) : <div className="py-8 text-center text-xs font-mono text-white/25">暂无数据</div>}</div></section>
}
