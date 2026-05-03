export type RacewarStatus = {
  code: string
  label: string
  tone: 'stable' | 'active' | 'warning' | 'locked' | 'dead'
  risk: number
  enterable: boolean
  className: string
}

export function getDebrisStatus(code: unknown): RacewarStatus {
  const value = String(code ?? '')
  if (value === '1') return status(value, '战斗中', 'active', 80, true, 'border-red-500/35 bg-red-500/8 text-red-200/75')
  if (value === '11') return status(value, '灾变', 'warning', 95, true, 'border-amber-400/35 bg-amber-400/8 text-amber-200/75')
  if (value === '101') return status(value, '未解锁', 'locked', 30, false, 'border-white/8 bg-white/[0.02] text-white/30')
  if (value === '102') return status(value, '冻结', 'locked', 45, false, 'border-sky-300/15 bg-sky-300/[0.025] text-sky-100/35')
  if (value === '103') return status(value, '条件不足', 'locked', 40, false, 'border-white/8 bg-white/[0.02] text-white/30')
  return status(value || '0', '稳定', 'stable', 10, true, 'border-cyan-300/15 bg-cyan-300/[0.035] text-cyan-100/60')
}

export function getBranchRisk(health: unknown): RacewarStatus {
  const value = Number(health ?? 0)
  if (value <= 0) return status('fallen', '已陷落', 'dead', 100, false, 'border-red-500/30 bg-red-500/8 text-red-200/70')
  if (value < 20000) return status('critical', '低血量', 'warning', 90, true, 'border-amber-400/30 bg-amber-400/8 text-amber-200/70')
  return status('alive', '存活', 'stable', 20, true, 'border-green-400/20 bg-green-400/6 text-green-200/65')
}

export function getMapUnlockStatus(map: any): RacewarStatus {
  const value = String(map?.is_unlock ?? '')
  if (value === '-1') return status(value, '未开放', 'locked', 20, false, 'border-white/5 bg-black/16 text-white/25')
  if (value === '0') return status(value, '待解锁', 'warning', 45, false, 'border-amber-300/18 bg-amber-300/[0.035] text-amber-100/55')
  return status(value || '1', '可进入', 'active', 10, true, 'border-cyan-300/18 bg-cyan-300/[0.035] text-cyan-100/65')
}

export function filterDebrisByStatus(debriss: any[], filter: string) {
  if (filter === 'all') return debriss
  if (filter === 'boss') return debriss.filter(d => Number(d.is_boss) === 1 || Boolean(d.is_boss_dst))
  return debriss.filter(d => getDebrisStatus(d.error_status).tone === filter || getDebrisStatus(d.error_status).code === filter)
}

export function scoreBattleRisk(input: { status?: RacewarStatus; health?: unknown; boss?: unknown; missionCount?: unknown }) {
  const statusRisk = input.status?.risk ?? 10
  const health = Number(input.health ?? 100000)
  const healthRisk = health <= 0 ? 100 : health < 10000 ? 92 : health < 30000 ? 72 : health < 60000 ? 45 : 12
  const bossRisk = Number(input.boss) === 1 || input.boss === true ? 12 : 0
  const missionRisk = Number(input.missionCount ?? 0) > 0 ? 6 : 0
  return Math.max(0, Math.min(100, Math.round(statusRisk * 0.55 + healthRisk * 0.35 + bossRisk + missionRisk)))
}

export function riskLabel(score: number) {
  if (score >= 85) return '极高'
  if (score >= 65) return '高'
  if (score >= 40) return '中'
  return '低'
}

function status(code: string, label: string, tone: RacewarStatus['tone'], risk: number, enterable: boolean, className: string): RacewarStatus {
  return { code, label, tone, risk, enterable, className }
}
