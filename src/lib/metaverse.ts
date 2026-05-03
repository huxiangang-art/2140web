export const DIGITAL_LV_NAMES = ['', '碳基体', '猿人', '直立人', '智人', '原始人', '自然人', '农业人', '封建人', '工业人', '社会人', '契约人', '加密客', '基因体', '半数人', '算力体', '硅基体', '比特人', '低熵体', '全数人', '元人', '数字人']

export type MetaverseQuest = {
  seq?: string
  title?: string
  name?: string
  task_desc?: string
  introduce?: string
  race_seq?: string | number
  lv?: string | number
  step?: string | number
  status?: string | number
  per?: string | number
  schedule?: string | number
  time?: string
}

export type MetaverseWorldMap = {
  seq: string
  name: string
  lv?: string | number
  is_unlock?: string | number
  debriss?: Array<{ seq: string; name: string; error_status?: string | number }>
}

export type MetaverseBranchWorld = {
  seq: string
  name: string
  lv?: string | number
  health?: string | number
  desc?: string
}

export type MetaverseRankRow = {
  key: string | number
  rank: number
  name?: string
  avatar?: string
  race?: string | number
  value?: string
}

export type MetaverseLibraryNode = {
  seq: string
  node_title: string
  node_time: string
  node_txt?: string
  branch_seq?: string | number
  status?: string | number
  serial_num?: string | number
}

export type MetaverseTheme = {
  seq: string
  title: string
  desc?: string
  cover?: string
  time_node?: string
  end_chapter?: string
  chapters?: unknown
}

export type AgentLane = 'chapter' | 'citycode' | 'governance' | 'quest'

export function agentPrompt(lane: AgentLane, prompt: string) {
  const titles: Record<AgentLane, string> = {
    chapter: '生成 2140 宇宙章节草案',
    citycode: '生成 CityCode 修正案草案',
    governance: '生成治理简报',
    quest: '生成今日任务建议',
  }
  return `${titles[lane]}\n\n要求：只输出待审草案，不声称已经提交主站；保留可审查结构；避免消耗性操作。\n\n上下文：${prompt}`
}

export async function settled<T>(task: Promise<T>, fallback: T): Promise<T> {
  try {
    return await task
  } catch {
    return fallback
  }
}

export function arr(value: unknown): any[] {
  return Array.isArray(value) ? value : []
}

export function flattenRaceTasks(value: any): MetaverseQuest[] {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []
  const direct = value.race_tasks ?? value.tasks
  if (Array.isArray(direct)) return direct
  const source = direct && typeof direct === 'object' ? direct : value
  return Object.values(source).flatMap(level =>
    level && typeof level === 'object'
      ? Object.values(level as Record<string, unknown>).flatMap(group => Array.isArray(group) ? group : [])
      : []
  )
}

export function stripHtml(value?: string) {
  return String(value ?? '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

export function num(value: unknown) {
  const n = Number(value ?? 0)
  if (!Number.isFinite(n)) return String(value ?? '-')
  return Math.round(n).toLocaleString()
}

export function pct(value: unknown) {
  return Math.max(0, Math.min(100, Math.round(Number(value) || 0)))
}
