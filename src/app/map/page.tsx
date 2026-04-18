import { Nav } from '@/components/Nav'
import { getLoggedIn } from '@/lib/auth'
import { login, getMapSituation, getBranchMaps, getRaces } from '@/lib/api2140'
import { UniverseMap } from './UniverseMap'

export const dynamic = 'force-dynamic'

export default async function MapPage() {
  const [loggedIn, sysCookie] = await Promise.all([
    getLoggedIn(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])

  const cookie = sysCookie ?? ''
  const [situation, branchMaps, races] = await Promise.allSettled([
    getMapSituation(cookie),
    getBranchMaps(cookie),
    getRaces(),
  ]).then(r => r.map(s => s.status === 'fulfilled' ? s.value : null))

  // Build tasks: raceId → { lv } from race current map level
  const tasks: Record<string, { lv: string }> = {}
  if (Array.isArray(races)) {
    for (const race of races) {
      if (race.seq && race.map_lv) {
        tasks[String(race.seq)] = { lv: String(race.map_lv) }
      }
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <Nav active="/map" loggedIn={loggedIn} />

      <div className="mb-6">
        <h2 className="text-xl font-bold text-white font-mono">宇宙地图</h2>
        <p className="text-xs text-white/30 mt-1">文明战线 · 星域分布 · 碎片状态</p>
      </div>

      {situation ? (
        <UniverseMap
          mainMaps={situation.main_maps ?? []}
          branchMaps={branchMaps ?? []}
          tasks={tasks}
        />
      ) : (
        <div className="text-xs font-mono text-white/30">暂无地图数据</div>
      )}
    </main>
  )
}
