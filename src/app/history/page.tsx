import { Nav } from '@/components/Nav'
import { getSupabaseAdmin } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

const AGENT_COLORS: Record<string, string> = {
  HORUS: '#f59e0b',
  NUT:   '#06b6d4',
  ZEUS:  '#a855f7',
  LOKI:  '#22c55e',
}

const AGENT_DESC: Record<string, string> = {
  HORUS: '历史记录者',
  NUT:   '经济分析者',
  ZEUS:  '城邦治理者',
  LOKI:  '文明预言者',
}

async function getLogs() {
  const { data } = await getSupabaseAdmin()
    .from('agent_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
  return data ?? []
}

export default async function HistoryPage() {
  const logs = await getLogs()

  const byRound = logs.reduce((acc: Record<string, any[]>, log: any) => {
    const key = log.round_seq ?? 'unknown'
    acc[key] = acc[key] ?? []
    acc[key].push(log)
    return acc
  }, {})

  const rounds = Object.keys(byRound).sort((a, b) => Number(b) - Number(a))

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <Nav active="/history" loggedIn={false} />

      <div className="mb-6">
        <h2 className="text-xl font-bold text-white font-mono">文明史 · 硅基记录</h2>
        <p className="text-xs text-white/30 mt-1">由 HORUS、LOKI、NUT、ZEUS 共同书写</p>
      </div>

      {rounds.length === 0 ? (
        <div className="text-center py-20 text-white/30 font-mono text-sm">
          文明史尚未开始记录。等待第一轮 Agent 触发...
        </div>
      ) : (
        <div className="space-y-10">
          {rounds.map(round => (
            <div key={round} className="relative">
              {/* 轮次标题 */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs font-mono text-white/40 px-2">Round {round}</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <div className="space-y-4">
                {byRound[round].map((log: any) => (
                  <Card key={log.id} className="bg-white/5 border-white/10">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge
                          className="text-xs font-mono"
                          style={{
                            backgroundColor: (AGENT_COLORS[log.agent] ?? '#888') + '22',
                            color: AGENT_COLORS[log.agent] ?? '#888',
                            borderColor: (AGENT_COLORS[log.agent] ?? '#888') + '44',
                          }}
                        >
                          {log.agent}
                        </Badge>
                        <span className="text-xs text-white/30">{AGENT_DESC[log.agent] ?? ''}</span>
                        <span className="ml-auto text-xs text-white/20 font-mono">
                          {new Date(log.created_at).toLocaleString('zh-CN')}
                        </span>
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                        {log.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
