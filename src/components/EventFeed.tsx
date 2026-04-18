import { getSupabaseAdmin } from '@/lib/supabase'

const EVENT_ICONS: Record<string, string> = {
  race_zero: '⚠',
  hegemony:  '⚡',
  milestone: '◆',
}

const EVENT_COLORS: Record<string, string> = {
  race_zero: '#ef4444',
  hegemony:  '#f59e0b',
  milestone: '#06b6d4',
}

async function getEvents() {
  const { data } = await getSupabaseAdmin()
    .from('civilization_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(8)
  return data ?? []
}

export async function EventFeed() {
  const events = await getEvents()
  if (!events.length) return null

  return (
    <div className="space-y-2">
      <div className="text-xs font-mono text-white/30 mb-3">文明事件</div>
      {events.map((e: any) => {
        const color = EVENT_COLORS[e.event_type] ?? '#888'
        const icon = EVENT_ICONS[e.event_type] ?? '·'
        return (
          <div key={e.id} className="flex gap-2 items-start py-1.5 border-b border-white/5 last:border-0">
            <span className="text-xs mt-0.5 shrink-0" style={{ color }}>{icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-mono" style={{ color }}>{e.title}</div>
              <div className="text-xs text-white/40 mt-0.5 leading-relaxed">{e.description}</div>
            </div>
            <span className="text-xs text-white/20 font-mono shrink-0">
              R{e.round_seq}
            </span>
          </div>
        )
      })}
    </div>
  )
}
