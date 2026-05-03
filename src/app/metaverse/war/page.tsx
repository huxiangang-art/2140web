import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { getLoggedIn, getUserCookie } from '@/lib/auth'
import { RACE_COLORS, RACE_NAMES } from '@/lib/api2140'
import { arr, DIGITAL_LV_NAMES, num, stripHtml } from '@/lib/metaverse'
import { buildWarReport, dangerColor, dangerLabel, getWarSnapshot } from '@/lib/metaverse-war'

export const dynamic = 'force-dynamic'

export default async function MetaverseWarPage() {
  const [loggedIn, userCookie] = await Promise.all([getLoggedIn(), getUserCookie()])
  const snapshot = await getWarSnapshot(userCookie)
  const report = buildWarReport(snapshot)
  const race = String(snapshot.userInfo?.race ?? '')
  const raceColor = RACE_COLORS[race] ?? '#94a3b8'
  const personLv = Number(snapshot.digital?.person_lv ?? 0)
  const currentMap = arr(snapshot.situation?.maps).filter(m => String(m.is_unlock) !== '-1').at(-1)
  const criticalCount = snapshot.branches.filter(b => b.danger === 'fallen' || b.danger === 'critical').length

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <Nav active="/metaverse" loggedIn={loggedIn} />

      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-mono text-red-300/70">Metaverse War Center</div>
          <h1 className="mt-1 text-2xl md:text-3xl font-bold font-mono text-white">元宇宙战争中心</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Quick href="/metaverse/war/quests">任务</Quick>
          <Quick href="/metaverse/war/contribute">贡献预案</Quick>
          <Quick href="/metaverse/war/ranks">排行</Quick>
          <Quick href="/metaverse/war/reports">战报</Quick>
        </div>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
        <Metric label="算力池" value={num(snapshot.pool?.total_count)} sub={snapshot.pool?.name} color="#facc15" />
        <Metric label="我的种族" value={RACE_NAMES[race] ?? '未登录'} color={raceColor} />
        <Metric label="数字人" value={personLv ? `Lv.${personLv}` : '未激活'} sub={DIGITAL_LV_NAMES[personLv]} color="#22d3ee" />
        <Metric label="主线文明" value={currentMap?.name ?? '-'} sub={currentMap ? `Lv.${currentMap.lv}` : undefined} color="#a78bfa" />
        <Metric label="高危世界" value={String(criticalCount)} color={criticalCount ? '#f59e0b' : '#22c55e'} />
        <Metric label="异常碎片" value={String(snapshot.anomalies.length)} color={snapshot.anomalies.length ? '#ef4444' : '#22c55e'} />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-5">
          <Panel title="支线世界战况" action={<LinkButton href="/metaverse/worlds">世界地图</LinkButton>}>
            <div className="space-y-3">
              {snapshot.branches.map(branch => (
                <Link key={branch.seq} href={`/metaverse/worlds/branch/${branch.seq}`} className="block rounded border border-white/8 bg-black/20 p-3 transition-colors hover:border-white/20">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-mono text-white/85">{branch.name}</div>
                      <div className="mt-1 line-clamp-1 text-xs text-white/30">{stripHtml(branch.desc)}</div>
                    </div>
                    <span className="shrink-0 text-xs font-mono" style={{ color: dangerColor(branch.danger) }}>{dangerLabel(branch.danger)}</span>
                  </div>
                  <Hp value={branch.health_num} danger={branch.danger} />
                </Link>
              ))}
            </div>
          </Panel>

          <Panel title="异常碎片" action={<LinkButton href="/metaverse/worlds">排查</LinkButton>}>
            {snapshot.anomalies.length ? (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {snapshot.anomalies.slice(0, 10).map(debris => (
                  <Link key={`${debris.map_seq}-${debris.seq}`} href={`/racewar/debris/${debris.seq}`} className="rounded border border-red-500/20 bg-red-500/5 p-3 transition-colors hover:border-red-400/35">
                    <div className="text-xs font-mono text-red-300/70">{debris.map_name}</div>
                    <div className="mt-1 text-sm font-mono text-white/75">{debris.name}</div>
                  </Link>
                ))}
              </div>
            ) : <Empty>暂无异常碎片</Empty>}
          </Panel>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <Panel title="今日贡献" action={<LinkButton href="/metaverse/contribution">贡献中心</LinkButton>}>
            <Rank rows={snapshot.todayContributors.slice(0, 10).map((u, i) => ({ key: u.user_seq ?? i, rank: i + 1, name: u.nickname, avatar: u.avatar, race: u.race, value: `+${num(u.amount_sum)}` }))} />
          </Panel>

          <Panel title="算力前线" action={<LinkButton href="/hashrate">竞技场</LinkButton>}>
            <Rank rows={snapshot.hashrateRank.slice(0, 10).map((u, i) => ({ key: u.user_seq ?? i, rank: i + 1, name: u.user_nickname, avatar: u.user_avatar, race: u.user_race, value: `${num(u.hashrate_sum)}H` }))} />
          </Panel>
        </div>

        <div className="space-y-6 xl:col-span-3">
          <Panel title="数字人前线" action={<LinkButton href="/digital">数字人</LinkButton>}>
            <Rank rows={snapshot.digitalRank.slice(0, 8).map((u, i) => ({ key: u.user_seq ?? u.seq ?? i, rank: i + 1, name: u.user_nick ?? u.nickname, avatar: u.user_avatar ?? u.avatar, race: u.user_race ?? u.race, value: `Lv.${u.person_lv ?? u.lv ?? '-'}` }))} />
          </Panel>

          <Panel title="广场动态" action={<LinkButton href="/plaza">广场</LinkButton>}>
            <div className="space-y-2">
              {snapshot.speeches.slice(0, 5).map(s => (
                <Link key={s.seq} href={`/plaza/${s.seq}`} className="block rounded border border-white/8 bg-black/20 p-3 transition-colors hover:border-white/20">
                  <div className="line-clamp-2 text-xs font-mono text-white/70">{s.title}</div>
                  <div className="mt-1 text-xs font-mono text-white/25">{s.active_time?.slice(0, 10) ?? s.time?.slice(0, 10)}</div>
                </Link>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.025] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-mono text-white/35">Agent 战报草案</h2>
          <LinkButton href="/metaverse/agent">进入工作台</LinkButton>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {report.map((line, i) => (
            <div key={i} className="rounded border border-white/8 bg-black/20 p-3 text-xs leading-relaxed text-white/55">{line}</div>
          ))}
        </div>
      </section>
    </main>
  )
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <section className="rounded-lg border border-white/10 bg-white/[0.025] p-4"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-xs font-mono text-white/35">{title}</h2>{action}</div>{children}</section>
}

function Metric({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return <div className="rounded-lg border border-white/10 bg-black/20 p-3"><div className="text-xs font-mono text-white/30">{label}</div><div className="mt-1 truncate text-lg font-bold font-mono" style={{ color }}>{value}</div>{sub && <div className="mt-0.5 truncate text-xs font-mono text-white/25">{sub}</div>}</div>
}

function Hp({ value, danger }: { value: number; danger: any }) {
  const safe = Math.max(0, value)
  const width = Math.max(0, Math.min(100, Math.round((safe / 100000) * 100)))
  const color = dangerColor(danger)
  return <div className="flex items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full" style={{ width: `${width}%`, backgroundColor: color }} /></div><span className="w-20 text-right text-xs font-mono" style={{ color }}>{num(safe)} HP</span></div>
}

function Rank({ rows }: { rows: Array<{ key: string | number; rank: number; name?: string; avatar?: string; race?: string | number; value?: string }> }) {
  if (!rows.length) return <Empty>暂无排行</Empty>
  return <div className="space-y-1">{rows.map(row => { const race = String(row.race ?? ''); const color = RACE_COLORS[race] ?? '#94a3b8'; return <div key={row.key} className="flex items-center gap-2 border-b border-white/5 py-1.5 last:border-0"><span className="w-5 text-xs font-mono text-white/20">{row.rank}</span><div className="h-6 w-6 overflow-hidden rounded-full border" style={{ borderColor: `${color}55`, backgroundColor: `${color}18` }}>{row.avatar && <img src={row.avatar} alt="" className="h-full w-full object-cover" />}</div><span className="min-w-0 flex-1 truncate text-xs font-mono text-white/70">{row.name ?? '未知'}</span><span className="shrink-0 text-xs font-mono text-cyan-300/70">{row.value ?? '-'}</span></div> })}</div>
}

function Quick({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="rounded border border-white/10 px-3 py-2 text-xs font-mono text-white/40 hover:border-white/25 hover:text-white/70">{children}</Link>
}

function LinkButton({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="rounded border border-white/10 px-2 py-1 text-xs font-mono text-white/35 hover:border-white/25 hover:text-white/65">{children}</Link>
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="py-8 text-center text-xs font-mono text-white/25">{children}</div>
}
