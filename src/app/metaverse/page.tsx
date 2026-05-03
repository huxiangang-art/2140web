import { getLoggedIn, getUserCookie } from '@/lib/auth'
import {
  getBranchMaps,
  getMapSituation,
  getRacewarDebriss,
  getRacewarMap,
  getUserInfo,
  login,
} from '@/lib/api2140'
import { arr, settled } from '@/lib/metaverse'
import { RacewarMapShell } from './RacewarMapShell'

export const dynamic = 'force-dynamic'

export default async function MetaversePage({ searchParams }: { searchParams?: Promise<{ mode?: string; map?: string }> }) {
  const query = await searchParams
  const [loggedIn, userCookie, sysCookie] = await Promise.all([
    getLoggedIn(),
    getUserCookie(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])
  const publicCookie = userCookie ?? sysCookie ?? ''

  const [infoRaw, situation, branchMaps] = await Promise.all([
    publicCookie ? settled(getUserInfo(publicCookie), null) : null,
    settled(getMapSituation(publicCookie), null),
    settled(getBranchMaps(publicCookie), []),
  ])

  const userInfo = infoRaw?.ret === 0 ? infoRaw.data : null
  const race = String(userInfo?.race ?? '')
  const maps = arr(situation?.maps)
  const visibleMaps = maps.filter(m => String(m.is_unlock) !== '-1')
  const playableMaps = maps.filter(m => Number(m.is_unlock) > 0)
  const looseInfo: any = userInfo
  const raceLv = Number(looseInfo?.race_lv ?? looseInfo?.raceLv ?? situation?.race_lv ?? situation?.raceLv ?? 0)
  const currentMap = maps.find(m => Number(m.lv) === raceLv) ?? playableMaps.at(-1) ?? visibleMaps[0] ?? maps[0]
  const previousMap = playableMaps.filter(m => Number(m.lv ?? 0) < Number(currentMap?.lv ?? 0)).at(-1) ?? playableMaps[0] ?? currentMap
  const branches = arr(branchMaps)
  const activeBranches = branches.filter(m => Number(m.health ?? 0) > 0)
  const anomalyCount = maps.flatMap(m => arr(m.debriss)).filter(d => String(d.error_status) === '1').length
  const [racewarMap, racewarDebriss] = await Promise.all([
    currentMap?.seq ? settled(getRacewarMap(publicCookie, currentMap.seq, race || 1), null) : null,
    currentMap?.seq ? settled(getRacewarDebriss(publicCookie, currentMap.seq), []) : [],
  ])

  return (
    <main className="min-h-screen bg-black p-0 md:p-4">
      <RacewarMapShell
        initialMode={query?.mode === 'branch' ? 'branch' : 'main'}
        currentMap={currentMap}
        previousMap={previousMap}
        unlockedCount={playableMaps.length}
        totalCount={maps.length}
        activeBranchCount={activeBranches.length}
        branchCount={branches.length}
        anomalyCount={anomalyCount}
        race={race}
        mapDetail={racewarMap}
        debriss={racewarDebriss}
        branchMaps={branches}
      />
    </main>
  )
}
