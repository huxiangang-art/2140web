import {
  getBranchMaps,
  getBranchMissions,
  getMapSituation,
  getRacewarTasks,
  getPropUseRecords,
  getUserInfo,
} from '@/lib/api2140'
import { arr, flattenRaceTasks, settled, stripHtml } from '@/lib/metaverse'
import { getBranchRisk, getDebrisStatus } from '@/lib/racewar-status'

export type MetaverseContext = {
  user: { nickname?: string; race?: string | number } | null
  mainMaps: any[]
  branchMaps: any[]
  riskDebriss: any[]
  riskBranches: any[]
  tasks: any[]
  missions: any[]
  auditRecords: any[]
  snapshots: any[]
  propRecords: any[]
  summary: string[]
}

export async function buildMetaverseContext(cookie: string): Promise<MetaverseContext> {
  const [infoRaw, situation, branchesRaw, tasksRaw, missionsRaw, propRecordsRaw, audits, snapshots] = await Promise.all([
    settled(getUserInfo(cookie), null),
    settled(getMapSituation(cookie), null),
    settled(getBranchMaps(cookie), []),
    settled(getRacewarTasks(cookie), null),
    settled(getBranchMissions(cookie), null),
    settled(getPropUseRecords(cookie, 0), null),
    settled(fetchLocalJson('/api/metaverse/audit').then(d => d.records ?? []), []),
    settled(fetchLocalJson('/api/metaverse/archive').then(d => d.snapshots ?? []), []),
  ])
  const user = infoRaw?.ret === 0 ? infoRaw.data : null
  const mainMaps = arr(situation?.maps)
  const branchMaps = arr(branchesRaw)
  const riskDebriss = mainMaps
    .flatMap(map => arr(map.debriss).map(debris => ({ ...debris, map_seq: map.seq, map_name: map.name, map_lv: map.lv, status: getDebrisStatus(debris.error_status) })))
    .filter(debris => debris.status.risk >= 70)
    .sort((a, b) => b.status.risk - a.status.risk)
  const riskBranches = branchMaps
    .map(branch => ({ ...branch, status: getBranchRisk(branch.health) }))
    .filter(branch => branch.status.risk >= 80)
    .sort((a, b) => b.status.risk - a.status.risk)
  const tasks = flattenRaceTasks(tasksRaw)
  const missions = normalizeBranchMissions(missionsRaw)
  const propRecords = arr(propRecordsRaw?.records ?? propRecordsRaw?.data ?? propRecordsRaw)
  const currentMap = mainMaps.filter(m => String(m.is_unlock) !== '-1').at(-1)
  const summary = [
    `当前主线：${currentMap?.name ?? '未知'} Lv.${currentMap?.lv ?? '-'}`,
    `风险碎片：${riskDebriss.length} 个`,
    `低血量/陷落支线：${riskBranches.length} 个`,
    `主线任务：${tasks.length} 条，支线任务：${missions.length} 条`,
    `待确认审计：${arr(audits).length} 条，档案快照：${arr(snapshots).length} 个`,
  ]
  return { user, mainMaps, branchMaps, riskDebriss, riskBranches, tasks, missions, auditRecords: arr(audits), snapshots: arr(snapshots), propRecords, summary }
}

export function metaverseContextPrompt(context: MetaverseContext, intent: string) {
  const debris = context.riskDebriss.slice(0, 8).map(d => `${d.map_name}/${d.name}/${d.status.label}`).join('；') || '无'
  const branches = context.riskBranches.slice(0, 8).map(b => `${b.name}/${b.status.label}/${b.health ?? 0}HP`).join('；') || '无'
  const audits = context.auditRecords.slice(0, 5).map(a => `${a.target ?? a.type}/${a.status}`).join('；') || '无'
  return [
    `目标：${intent}`,
    `用户：${context.user?.nickname ?? '未知'} / 种族 ${context.user?.race ?? '-'}`,
    `摘要：${context.summary.join('；')}`,
    `风险碎片：${debris}`,
    `风险支线：${branches}`,
    `待确认审计：${audits}`,
    '要求：只生成待审提案，不直接提交任何主站写接口。',
  ].map(stripHtml).join('\n')
}

async function fetchLocalJson(path: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'
  const res = await fetch(`${base}${path}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

function normalizeBranchMissions(raw: any) {
  const direct = arr(raw?.data ?? raw?.missions ?? raw)
  if (direct.length) return direct
  if (!raw || typeof raw !== 'object') return []
  return Object.entries(raw).flatMap(([typeName, value]) => arr(value).map((mission: any) => ({ ...mission, type_name: typeName })))
}
