import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RACE_NAMES, RACE_COLORS } from '@/lib/api2140'

interface Props {
  pool: {
    total_count: string
    hashrate_pool_detail: Record<string, { hashrate_count: string }>
  }
}

export function RaceBar({ pool }: Props) {
  const total = parseInt(pool.total_count)
  const races = Object.entries(pool.hashrate_pool_detail)
    .map(([id, d]) => ({
      id,
      name: RACE_NAMES[id] ?? `族${id}`,
      color: RACE_COLORS[id] ?? '#888',
      hashrate: parseInt(d.hashrate_count),
      pct: (parseInt(d.hashrate_count) / total) * 100,
    }))
    .sort((a, b) => b.hashrate - a.hashrate)

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-white font-mono text-sm">种族博弈 · 算力分布</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {races.map((r) => (
          <div key={r.id}>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span style={{ color: r.color }}>{r.name}</span>
              <span className="text-white/50">
                {r.hashrate.toLocaleString()} H · {r.pct.toFixed(1)}%
              </span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${r.pct}%`, backgroundColor: r.color, opacity: 0.8 }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
