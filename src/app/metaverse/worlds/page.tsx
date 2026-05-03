import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { getLoggedIn } from '@/lib/auth'
import { getBranchMaps, getMapSituation, getRacewarMaps, login } from '@/lib/api2140'
import { arr, num, settled, stripHtml } from '@/lib/metaverse'
import { getBranchRisk, getMapUnlockStatus } from '@/lib/racewar-status'

export const dynamic = 'force-dynamic'

export default async function MetaverseWorldsPage() {
  const [loggedIn, sysCookie] = await Promise.all([
    getLoggedIn(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])
  const cookie = sysCookie ?? ''
  const [mapsRaw, situation, branchMaps] = await Promise.all([
    settled(getRacewarMaps(cookie), null),
    settled(getMapSituation(cookie), null),
    settled(getBranchMaps(cookie), []),
  ])
  const maps = arr(mapsRaw?.maps ?? mapsRaw ?? situation?.maps)
  const tasksByLevel = mapsRaw?.tasks ?? situation?.tasks ?? {}
  const branches = arr(branchMaps)
  const unlocked = maps.filter(m => String(m.is_unlock) !== '-1')
  const currentSeq = unlocked.at(-1)?.seq
  const mainGroups = {
    current: maps.filter(m => String(m.seq) === String(currentSeq)),
    open: maps.filter(m => getMapUnlockStatus(m).enterable && String(m.seq) !== String(currentSeq)),
    pending: maps.filter(m => String(m.is_unlock) === '0'),
    closed: maps.filter(m => String(m.is_unlock) === '-1'),
  }
  const sortedBranches = [...branches].sort((a, b) => getBranchRisk(b.health).risk - getBranchRisk(a.health).risk || Number(b.health ?? 0) - Number(a.health ?? 0))

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <Nav active="/metaverse" loggedIn={loggedIn} />
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono text-white">文明切换</h1>
          <p className="mt-1 text-xs font-mono text-white/30">主线文明 · 支线文明 · 任务解锁对照</p>
        </div>
        <Link href="/metaverse" className="w-fit rounded border border-cyan-300/20 px-3 py-2 text-xs font-mono text-cyan-100/70 hover:border-cyan-300/45">返回地图</Link>
      </div>

      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label="主线文明" value={`${unlocked.length}/${maps.length}`} />
        <Metric label="当前文明" value={unlocked.at(-1)?.name ?? '-'} />
        <Metric label="支线文明" value={String(branches.length)} />
        <Metric label="存活支线" value={String(branches.filter(m => Number(m.health) > 0).length)} />
      </section>

      <div className="mb-4 grid grid-cols-2 gap-2 md:w-fit">
        <Anchor href="#main-worlds" label="主线文明" active />
        <Anchor href="#branch-worlds" label="支线文明" />
      </div>

      <section id="main-worlds" className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-white/35">主线文明</span>
          <GroupPill label="当前" value={mainGroups.current.length} />
          <GroupPill label="可进入" value={mainGroups.open.length} />
          <GroupPill label="待解锁" value={mainGroups.pending.length} />
          <GroupPill label="未开放" value={mainGroups.closed.length} />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {maps.map(map => {
            const status = unlockStatus(map)
            const unifiedStatus = getMapUnlockStatus(map)
            const current = String(map.seq) === String(currentSeq)
            const taskFlags = arr(tasksByLevel?.[map.lv] ?? tasksByLevel?.[String(map.lv)])
            return (
              <Link
                key={map.seq}
                href={status.open ? `/racewar/map/${map.seq}` : '/metaverse/quests'}
                className={`block overflow-hidden rounded-lg border bg-black/24 transition-colors ${status.open ? 'border-white/10 hover:border-cyan-300/35' : 'border-white/5 opacity-55 hover:border-white/14'}`}
              >
                <div className="relative h-32 border-b border-white/8 bg-black/30">
                  <img src={`/racewar/racewar_map_select_map_cover${map.lv}.jpg`} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold font-mono text-white">{map.name}</div>
                      <div className="mt-0.5 text-xs font-mono text-white/35">NO.{map.lv} · Lv.{map.lv}</div>
                    </div>
                    {current && <span className="shrink-0 rounded border border-cyan-300/35 bg-cyan-300/10 px-2 py-1 text-xs font-mono text-cyan-200">当前</span>}
                  </div>
                </div>
                <div className="p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className={`text-xs font-mono ${status.open ? 'text-green-300/65' : 'text-amber-300/65'}`}>{status.text}</div>
                    <span className={`rounded border px-2 py-0.5 text-xs font-mono ${unifiedStatus.className}`}>{unifiedStatus.label}</span>
                  </div>
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {taskFlags.slice(0, 6).map((task: any, index: number) => (
                      <span key={task.seq ?? `${map.seq}-${index}`} className="rounded border border-cyan-300/15 bg-cyan-300/5 px-2 py-0.5 text-xs font-mono text-cyan-100/55">
                        {task.race_name ?? task.name ?? `任务${index + 1}`}
                      </span>
                    ))}
                    {!taskFlags.length && <span className="text-xs font-mono text-white/25">暂无任务标记</span>}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {arr(map.debriss).slice(0, 6).map(debris => (
                      <span key={debris.seq} className={`rounded border px-2 py-0.5 text-xs font-mono ${String(debris.error_status) === '1' ? 'border-red-500/30 text-red-300/65' : 'border-white/10 text-white/35'}`}>
                        {debris.name}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section id="branch-worlds">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-xs font-mono text-white/35">支线文明</div>
          <span className="text-xs font-mono text-white/25">创建入口已接安全态</span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-lg border border-dashed border-cyan-300/20 bg-cyan-300/[0.035] p-4">
            <div className="text-sm font-mono text-cyan-100/80">创建支线文明</div>
            <p className="mt-2 text-xs leading-relaxed text-white/42">原 App 会进入创建流程。插件首版先保留入口和规则说明，暂不提交创建写接口。</p>
            <Link href="/metaverse/agent" className="mt-4 inline-flex rounded border border-cyan-300/20 px-3 py-2 text-xs font-mono text-cyan-100/70">生成支线提案</Link>
          </div>
          {sortedBranches.map(map => (
            <Link key={map.seq} href={`/metaverse/worlds/branch/${map.seq}`} className="block overflow-hidden rounded-lg border border-white/8 bg-black/22 transition-colors hover:border-cyan-300/30">
              <div className="grid grid-cols-[104px_1fr] gap-3 p-3">
                <div className="h-28 overflow-hidden rounded border border-white/8 bg-black/35">
                  {map.thumbnail || map.cover
                    ? <img src={asset(map.thumbnail ?? map.cover)} alt="" className="h-full w-full object-cover" />
                    : <div className="flex h-full w-full items-center justify-center text-xs font-mono text-white/18">支线</div>
                  }
                </div>
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="truncate text-sm font-mono text-white/85">{map.name}</div>
                    <span className="shrink-0 text-xs font-mono text-white/30">Lv.{map.lv}</span>
                  </div>
                  <div className="mt-1 text-xs font-mono text-white/25">创建者 {map.user_nick ?? map.nickname ?? '-'}</div>
                  <div className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/35">{stripHtml(map.desc)}</div>
                  <div className="mt-3"><Hp value={Number(map.health ?? 0)} /></div>
                  <div className="mt-2"><span className={`rounded border px-2 py-0.5 text-xs font-mono ${getBranchRisk(map.health).className}`}>{getBranchRisk(map.health).label}</span></div>
                  {Number(map.mission_num ?? map.mission_count ?? 0) > 0 && <div className="mt-2 text-xs font-mono text-cyan-300/60">任务 ×{map.mission_num ?? map.mission_count}</div>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}

function unlockStatus(map: any) {
  const value = String(map.is_unlock ?? '')
  if (value === '-1') return { open: false, text: '神秘区域，暂不开放' }
  if (value === '0') return { open: false, text: `完成 ${Math.max(1, Number(map.lv ?? 1) - 1)} 级文明进化任务后解锁` }
  return { open: true, text: '可进入主线文明地图' }
}

function asset(path?: string) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  if (path.startsWith('/')) return `https://www.2140city.cn${path}`
  return path
}

function Anchor({ href, label, active = false }: { href: string; label: string; active?: boolean }) {
  return <Link href={href} className={`rounded border px-3 py-2 text-center text-xs font-mono ${active ? 'border-cyan-300/35 bg-cyan-300/10 text-cyan-100' : 'border-white/10 text-white/45'}`}>{label}</Link>
}

function GroupPill({ label, value }: { label: string; value: number }) {
  return <span className="rounded border border-white/8 bg-black/20 px-2 py-0.5 text-xs font-mono text-white/35">{label} {value}</span>
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
