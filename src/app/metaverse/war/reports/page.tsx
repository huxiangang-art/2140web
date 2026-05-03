import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { getLoggedIn } from '@/lib/auth'
import { getBranchMapSituation, getBranchMaps, getMapSituation, login } from '@/lib/api2140'
import { arr, num, settled, stripHtml } from '@/lib/metaverse'
import { getBranchRisk, getDebrisStatus, riskLabel, scoreBattleRisk } from '@/lib/racewar-status'

export const dynamic = 'force-dynamic'

export default async function WarReportsPage() {
  const [loggedIn, sysCookie] = await Promise.all([
    getLoggedIn(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])
  const cookie = sysCookie ?? ''
  const [mainSituation, branchSituation, branchMaps] = await Promise.all([
    settled(getMapSituation(cookie), null),
    settled(getBranchMapSituation(cookie), null),
    settled(getBranchMaps(cookie), []),
  ])
  const maps = arr(mainSituation?.maps)
  const branchRows = arr(branchSituation?.maps ?? branchSituation?.branch_maps ?? branchSituation ?? branchMaps)
  const unlocked = maps.filter(m => String(m.is_unlock) !== '-1')
  const activeDebris = maps.flatMap(m => arr(m.debriss).map(d => ({ ...d, map_name: m.name, map_seq: m.seq, map_lv: m.lv })))
  const dangerDebris = activeDebris.filter(d => ['1', '11'].includes(String(d.error_status)))
  const aliveBranches = branchRows.filter(m => Number(m.health ?? m.health_num ?? 0) > 0)

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <Nav active="/metaverse" loggedIn={loggedIn} />
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono text-white">文明战况</h1>
          <p className="mt-1 text-xs font-mono text-white/30">主线碎片 · 支线血量 · 战斗入口对照</p>
        </div>
        <div className="flex gap-2">
          <Link href="/metaverse" className="rounded border border-white/10 px-3 py-2 text-xs font-mono text-white/40 hover:border-white/25 hover:text-white/70">地图入口</Link>
        <Link href="/metaverse/agent/war" className="rounded border border-cyan-300/20 px-3 py-2 text-xs font-mono text-cyan-100/70 hover:border-cyan-300/45">生成战报草案</Link>
        </div>
      </div>

      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label="已开放主线" value={`${unlocked.length}/${maps.length}`} />
        <Metric label="碎片节点" value={String(activeDebris.length)} />
        <Metric label="异常/战斗" value={String(dangerDebris.length)} />
        <Metric label="存活支线" value={`${aliveBranches.length}/${branchRows.length}`} />
      </section>

      <section className="mb-6 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.035] p-4">
        <div className="mb-3 text-xs font-mono text-cyan-100/55">今日摘要</div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <SummaryLine text={`当前主线推进到 ${unlocked.at(-1)?.name ?? '未知文明'}，最高等级 Lv.${unlocked.at(-1)?.lv ?? '-' }。`} />
          <SummaryLine text={dangerDebris.length ? `${dangerDebris.length} 个碎片处于可战斗或灾变状态，优先检查生命值和地票。` : '主线碎片暂无显著异常。'} />
          <SummaryLine text={aliveBranches.length ? `${aliveBranches.length} 个支线文明仍有血量，适合接任务或生成支线作战提案。` : '支线文明暂无存活血量数据。'} />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section>
          <div className="mb-3 text-xs font-mono text-white/35">主线战况</div>
          <div className="space-y-3">
            {maps.map(map => (
              <div key={map.seq} className={`rounded-lg border p-4 ${String(map.is_unlock) === '-1' ? 'border-white/5 bg-black/16 opacity-45' : 'border-white/10 bg-black/22'}`}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/racewar/map/${map.seq}`} className="truncate text-sm font-mono text-white/85 hover:text-white">{map.name}</Link>
                    <div className="mt-1 text-xs font-mono text-white/25">Lv.{map.lv} · {unlockText(map)}</div>
                  </div>
                  <Link href={`/racewar/map/${map.seq}`} className="shrink-0 rounded border border-white/10 px-2 py-1 text-xs font-mono text-white/35 hover:border-white/25">地图</Link>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {arr(map.debriss).length ? arr(map.debriss).map(debris => {
                    const status = getDebrisStatus(debris.error_status)
                    const score = scoreBattleRisk({ status, boss: debris.is_boss })
                    return (
                    <Link key={debris.seq} href={`/racewar/debris/${debris.seq}`} className={`rounded border px-2 py-1 text-xs font-mono transition-colors ${status.className}`}>
                      {debris.name} · {status.label} · {riskLabel(score)} {score}
                    </Link>
                  )}) : <span className="text-xs font-mono text-white/25">暂无碎片节点</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 text-xs font-mono text-white/35">支线战况</div>
          <div className="space-y-3">
            {branchRows.map(map => (
              <Link key={map.seq} href={`/metaverse/worlds/branch/${map.seq}`} className="block rounded-lg border border-white/8 bg-black/22 p-4 transition-colors hover:border-cyan-300/30">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-mono text-white/85">{map.name}</div>
                    <div className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/35">{stripHtml(map.desc)}</div>
                  </div>
                  <span className="shrink-0 text-xs font-mono text-white/30">Lv.{map.lv ?? '-'}</span>
                </div>
                <Hp value={Number(map.health ?? map.health_num ?? 0)} />
                <div className="mt-2 flex items-center gap-2">
                  <span className={`rounded border px-2 py-0.5 text-xs font-mono ${getBranchRisk(map.health ?? map.health_num).className}`}>{getBranchRisk(map.health ?? map.health_num).label}</span>
                  <span className="text-xs font-mono text-white/25">风险 {scoreBattleRisk({ status: getBranchRisk(map.health ?? map.health_num), health: map.health ?? map.health_num, missionCount: map.mission_num })}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs font-mono text-white/28">
                  {map.user_nick && <span>创建者 {map.user_nick}</span>}
                  {map.mission_num && <span>任务 {map.mission_num}</span>}
                  {map.completed_mission_num && <span>完成 {map.completed_mission_num}</span>}
                </div>
              </Link>
            ))}
            {!branchRows.length && <div className="rounded-lg border border-white/8 bg-black/20 py-16 text-center text-xs font-mono text-white/25">暂无支线战况</div>}
          </div>
        </section>
      </div>
    </main>
  )
}

function unlockText(map: any) {
  if (String(map.is_unlock) === '-1') return '暂未开放'
  if (String(map.is_unlock) === '0') return '待解锁'
  return '已开放'
}

function SummaryLine({ text }: { text: string }) {
  return <div className="rounded border border-cyan-300/12 bg-black/24 p-3 text-xs leading-relaxed text-white/58">{text}</div>
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-white/10 bg-black/20 p-3"><div className="text-xs font-mono text-white/30">{label}</div><div className="mt-1 truncate text-xl font-bold font-mono text-cyan-300">{value}</div></div>
}

function Hp({ value }: { value: number }) {
  const safe = Math.max(0, value)
  const width = Math.max(0, Math.min(100, Math.round((safe / 100000) * 100)))
  const color = safe <= 0 ? '#ef4444' : safe < 20000 ? '#f59e0b' : '#22c55e'
  return <div className="flex items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full" style={{ width: `${width}%`, backgroundColor: color }} /></div><span className="w-20 text-right text-xs font-mono" style={{ color }}>{num(safe)} HP</span></div>
}
