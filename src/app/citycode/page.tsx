import { Nav } from '@/components/Nav'
import { getProposals, login, RACE_NAMES, RACE_COLORS } from '@/lib/api2140'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  '1': { label: '审议中', color: '#f59e0b' },
  '2': { label: '已通过', color: '#22c55e' },
  '3': { label: '已结束', color: '#6b7280' },
  '4': { label: '已否决', color: '#ef4444' },
}

async function getData() {
  try {
    const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
    if (!cookie) return []
    return getProposals(cookie)
  } catch {
    return []
  }
}

export default async function CitycodeePage() {
  const proposals = await getData()

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <Nav active="/citycode" />

      <div className="mb-6">
        <h2 className="text-xl font-bold text-white font-mono">城邦法典</h2>
        <p className="text-xs text-white/30 mt-1">居民立法 · AI 治理 · 六族博弈</p>
      </div>

      {proposals.length === 0 ? (
        <div className="text-center py-20 text-white/30 font-mono text-sm">
          当前无活跃提案
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((p: any) => {
            const status = STATUS_LABEL[p.status] ?? { label: '未知', color: '#888' }
            const supportPct = p.target > 0
              ? Math.min(100, Math.round((p.support_num / p.target) * 100))
              : 0

            return (
              <Card key={p.seq} className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-white/30">{p.id}</span>
                        <Badge
                          className="text-xs font-mono"
                          style={{
                            backgroundColor: status.color + '22',
                            color: status.color,
                            borderColor: status.color + '44',
                          }}
                        >
                          {status.label}
                        </Badge>
                      </div>
                      <CardTitle className="text-white text-base">{p.title}</CardTitle>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-white/30 font-mono">提案人</div>
                      <div className="text-sm text-white/70">{p.author_nickname}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/60 leading-relaxed mb-4 whitespace-pre-wrap">
                    {p.content}
                  </p>

                  {/* 投票进度 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono text-white/40">
                      <span>赞成 {p.support_num} · 反对 {p.against_num} · 目标 {p.target}</span>
                      <span>{supportPct}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${supportPct}%`, backgroundColor: '#22c55e', opacity: 0.7 }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-white/20 font-mono">
                      <span>截止 {p.deadline}</span>
                      <span>手续费 {p.poundage} T</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </main>
  )
}
