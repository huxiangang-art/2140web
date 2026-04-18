import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabaseAdmin } from '@/lib/supabase'

const AGENT_COLORS: Record<string, string> = {
  HORUS: '#f59e0b',
  NUT:   '#06b6d4',
  ZEUS:  '#a855f7',
  LOKI:  '#22c55e',
  'GPT-X': '#f97316',
}

async function getLogs() {
  try {
    const { data } = await supabaseAdmin
      .from('agent_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    return data ?? []
  } catch {
    return []
  }
}

export async function AgentFeed() {
  const logs = await getLogs()

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-white font-mono text-sm">硅基意识流</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {logs.length === 0 ? (
          <p className="text-xs text-white/30 font-mono text-center py-4">
            Agent 尚未触发。<br />等待第一轮结束...
          </p>
        ) : (
          logs.map((log: any) => (
            <div key={log.id} className="border-l-2 pl-3 py-1" style={{ borderColor: AGENT_COLORS[log.agent] ?? '#888' }}>
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  className="text-xs font-mono px-1.5 py-0"
                  style={{ backgroundColor: (AGENT_COLORS[log.agent] ?? '#888') + '33', color: AGENT_COLORS[log.agent] ?? '#888' }}
                >
                  {log.agent}
                </Badge>
                <span className="text-xs text-white/20 font-mono">
                  {new Date(log.created_at).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed line-clamp-4">{log.content}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
