import { Nav } from '@/components/Nav'
import { TipButton } from '@/components/TipButton'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getLoggedIn } from '@/lib/auth'
import { RACE_NAMES, RACE_COLORS } from '@/lib/api2140'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const AGENT_COLORS: Record<string, string> = {
  HORUS: '#f59e0b', NUT: '#06b6d4', ZEUS: '#a855f7', LOKI: '#22c55e',
}
const AGENT_DESC: Record<string, string> = {
  HORUS: '历史记录者', NUT: '经济分析者', ZEUS: '城邦治理者', LOKI: '文明预言者',
}

async function getData() {
  const db = getSupabaseAdmin()
  const [logsRes, chaptersRes] = await Promise.all([
    db.from('agent_logs').select('*').order('created_at', { ascending: false }).limit(50),
    db.from('civilization_chapters').select('*').order('created_at', { ascending: false }).limit(50),
  ])

  const logs = (logsRes.data ?? []).map((l: any) => ({ ...l, _type: 'agent' }))
  const chapters = (chaptersRes.data ?? []).map((c: any) => ({ ...c, _type: 'human' }))

  // merge and sort by round_seq desc, then created_at desc
  const all = [...logs, ...chapters].sort((a, b) => {
    const ra = parseInt(a.round_seq ?? '0')
    const rb = parseInt(b.round_seq ?? '0')
    if (rb !== ra) return rb - ra
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  // group by round
  const byRound: Record<string, any[]> = {}
  for (const item of all) {
    const key = item.round_seq ?? '?'
    byRound[key] = byRound[key] ?? []
    byRound[key].push(item)
  }
  return byRound
}

export default async function HistoryPage() {
  const [byRound, loggedIn] = await Promise.all([getData(), getLoggedIn()])
  const rounds = Object.keys(byRound).sort((a, b) => {
    if (a === '?') return 1
    if (b === '?') return -1
    return Number(b) - Number(a)
  })

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <Nav active="/history" loggedIn={loggedIn} />

      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white font-mono">文明史</h2>
          <p className="text-xs text-white/30 mt-1">硅基与碳基共同书写</p>
        </div>
        {loggedIn && (
          <Link
            href="/write"
            className="text-xs font-mono px-3 py-1.5 rounded border border-cyan-500/20 text-cyan-400/70 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
          >
            + 写章节
          </Link>
        )}
      </div>

      {rounds.length === 0 ? (
        <div className="text-center py-20 text-white/30 font-mono text-sm">
          文明史尚未开始记录...
        </div>
      ) : (
        <div className="space-y-10">
          {rounds.map(round => (
            <div key={round}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs font-mono text-white/40 px-2">
                  {round === '?' ? '未标注轮次' : `Round ${round}`}
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <div className="space-y-4">
                {byRound[round].map((item: any) =>
                  item._type === 'human'
                    ? <HumanChapter key={`h-${item.id}`} item={item} loggedIn={loggedIn} />
                    : <AgentLog key={`a-${item.id}`} item={item} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

function HumanChapter({ item, loggedIn }: { item: any; loggedIn: boolean }) {
  const color = RACE_COLORS[item.author_race] ?? '#888'
  const race = RACE_NAMES[item.author_race] ?? '未知'
  return (
    <div className="border border-white/8 rounded-lg p-4" style={{ borderLeftColor: color, borderLeftWidth: 2 }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-mono font-bold" style={{ color }}>{item.author_name}</span>
        <span className="text-xs font-mono text-white/25">·</span>
        <span className="text-xs font-mono" style={{ color }}>{race}族</span>
        <span className="text-xs font-mono text-white/25">·</span>
        <span className="text-xs font-mono text-white/25">碳基创作</span>
        <span className="ml-auto text-xs text-white/20 font-mono">
          {new Date(item.created_at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <p className="text-sm text-white/75 leading-relaxed whitespace-pre-wrap mb-3">{item.content}</p>
      {loggedIn && (
        <div className="flex justify-end">
          <TipButton chapterId={item.id} initialCount={item.tip_count ?? 0} />
        </div>
      )}
    </div>
  )
}

function AgentLog({ item }: { item: any }) {
  const color = AGENT_COLORS[item.agent] ?? '#888'
  return (
    <div className="border border-white/5 rounded-lg p-4 bg-white/2">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-mono px-2 py-0.5 rounded"
          style={{ backgroundColor: color + '22', color, border: `1px solid ${color}44` }}>
          {item.agent}
        </span>
        <span className="text-xs text-white/30">{AGENT_DESC[item.agent] ?? ''}</span>
        <span className="text-xs font-mono text-white/20 ml-auto">
          {new Date(item.created_at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{item.content}</p>
    </div>
  )
}
