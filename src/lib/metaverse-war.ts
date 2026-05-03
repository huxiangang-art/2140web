import {
  getBranchMaps,
  getDebrisRank,
  getDigitalPerson,
  getDigitalPersonRank,
  getHashratePool,
  getHashratePoolRank,
  getMapSituation,
  getBranchMissions,
  getCompletedMissions,
  getRacewarTasks,
  getSpeeches,
  getTotalRank,
  getUserInfo,
  login,
} from '@/lib/api2140'
import { arr, flattenRaceTasks, num, pct, settled, stripHtml } from '@/lib/metaverse'

export type WarDanger = 'fallen' | 'critical' | 'unstable' | 'stable'

export async function getWarSnapshot(userCookie?: string) {
  const sysCookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const publicCookie = sysCookie ?? userCookie ?? ''
  const activeCookie = userCookie ?? publicCookie

  const [pool, hashrateRank, digital, digitalRank, branchMaps, situation, debrisRank, totalRank, speeches, userInfo, raceTasksRaw, branchMissionsRaw, completedMissions] = await Promise.all([
    settled(getHashratePool(activeCookie), null),
    settled(getHashratePoolRank(publicCookie, 1, 0), []),
    userCookie ? settled(getDigitalPerson(userCookie), null) : null,
    settled(getDigitalPersonRank(publicCookie), []),
    settled(getBranchMaps(publicCookie), []),
    settled(getMapSituation(publicCookie), null),
    settled(getDebrisRank(publicCookie, 1), null),
    settled(getTotalRank(publicCookie, 1), null),
    settled(getSpeeches(publicCookie), []),
    userCookie ? settled(getUserInfo(userCookie).then(r => r.ret === 0 ? r.data : null), null) : null,
    settled(getRacewarTasks(activeCookie), null),
    settled(getBranchMissions(activeCookie), null),
    settled(getCompletedMissions(activeCookie), []),
  ])

  const branches = arr(branchMaps).map(map => ({
    ...map,
    health_num: Number(map.health ?? 0),
    danger: getDangerLevel(Number(map.health ?? 0)),
  })).sort((a, b) => a.health_num - b.health_num)

  const anomalies = arr(situation?.maps)
    .flatMap(map => arr(map.debriss).map(debris => ({ ...debris, map_name: map.name, map_seq: map.seq })))
    .filter(debris => String(debris.error_status) === '1')

  return {
    publicCookie,
    pool,
    hashrateRank: arr(hashrateRank),
    digital,
    digitalRank: arr((digitalRank as any)?.records ?? digitalRank),
    branches,
    situation,
    anomalies,
    todayContributors: arr((debrisRank as any)?.user_daily),
    totalUsers: arr((totalRank as any)?.total_users),
    totalRace: arr((totalRank as any)?.total_race),
    speeches: arr(speeches),
    userInfo,
    raceTasks: flattenRaceTasks(raceTasksRaw),
    branchMissions: arr((branchMissionsRaw as any)?.data ?? (branchMissionsRaw as any)?.missions ?? branchMissionsRaw),
    completedMissions: arr(completedMissions),
  }
}

export function getDangerLevel(health: number): WarDanger {
  if (health <= 0) return 'fallen'
  if (health < 20000) return 'critical'
  if (health < 60000) return 'unstable'
  return 'stable'
}

export function dangerLabel(danger: WarDanger) {
  return {
    fallen: '已陷落',
    critical: '高危',
    unstable: '不稳',
    stable: '稳定',
  }[danger]
}

export function dangerColor(danger: WarDanger) {
  return {
    fallen: '#ef4444',
    critical: '#f59e0b',
    unstable: '#38bdf8',
    stable: '#22c55e',
  }[danger]
}

export function buildWarReport(snapshot: Awaited<ReturnType<typeof getWarSnapshot>>) {
  const danger = snapshot.branches.filter(b => b.danger === 'fallen' || b.danger === 'critical')
  const topContributors = snapshot.todayContributors.slice(0, 3).map(u => `${u.nickname?.trim?.() ?? u.user_nick ?? '未知'} +${num(u.amount_sum)}`).join('，')
  const topHashrate = snapshot.hashrateRank.slice(0, 3).map(u => `${u.user_nickname ?? u.nickname} ${num(u.hashrate_sum)}H`).join('，')
  const latestSpeech = snapshot.speeches[0]
  return [
    `当前算力池 ${snapshot.pool?.name ?? '-'}，总算力 ${num(snapshot.pool?.total_count)}H。`,
    danger.length ? `高危世界：${danger.map(b => `${b.name} ${num(Math.max(0, b.health_num))}HP`).join('，')}。` : '支线世界整体稳定。',
    snapshot.anomalies.length ? `异常碎片 ${snapshot.anomalies.length} 个，优先关注 ${snapshot.anomalies.slice(0, 3).map(d => `${d.map_name}/${d.name}`).join('，')}。` : '暂无异常碎片。',
    topContributors ? `今日贡献：${topContributors}。` : '',
    topHashrate ? `算力前线：${topHashrate}。` : '',
    latestSpeech ? `广场最新：${stripHtml(latestSpeech.title).slice(0, 40)}。` : '',
  ].filter(Boolean)
}

export function getWarActionPlan(snapshot: Awaited<ReturnType<typeof getWarSnapshot>>) {
  const race = String(snapshot.userInfo?.race ?? '')
  const raceTasks = race ? snapshot.raceTasks.filter(t => String(t.race_seq) === race) : snapshot.raceTasks
  const openTask = raceTasks.find(t => String(t.status) !== '1' || pct(t.per) < 100) ?? raceTasks.at(-1)
  const dangerWorld = snapshot.branches.find(b => b.danger === 'fallen' || b.danger === 'critical') ?? snapshot.branches[0]
  return [
    openTask ? `推进种族任务：Lv.${openTask.lv ?? '-'} / Step ${openTask.step ?? '-'}，当前进度 ${pct(openTask.per ?? openTask.schedule)}%。` : '',
    dangerWorld ? `优先关注支线世界「${dangerWorld.name}」，当前 ${num(Math.max(0, dangerWorld.health_num))} HP，状态 ${dangerLabel(dangerWorld.danger)}。` : '',
    snapshot.anomalies.length ? `排查异常碎片：${snapshot.anomalies.slice(0, 3).map(d => `${d.map_name}/${d.name}`).join('、')}。` : '',
    snapshot.pool ? `检查算力池 ${snapshot.pool.name ?? ''}，当前总算力 ${num(snapshot.pool.total_count)}H。` : '',
  ].filter(Boolean)
}
