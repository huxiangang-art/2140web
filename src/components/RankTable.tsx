import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RACE_NAMES, RACE_COLORS } from '@/lib/api2140'

interface RankEntry {
  user_seq: string
  user_nickname: string
  user_race: string
  hashrate_sum: string
  reward_sum: string
  user_token: string
}

export function RankTable({ ranks }: { ranks: RankEntry[] }) {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-white font-mono text-sm">算力排行 · 本轮</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {ranks.map((r, i) => (
            <div key={r.user_seq} className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0">
              <span className={`text-xs font-mono w-5 ${i < 3 ? 'text-orange-400' : 'text-white/30'}`}>
                {i + 1}
              </span>
              <span
                className="text-xs font-mono w-8 text-center px-1 rounded"
                style={{ color: RACE_COLORS[r.user_race], backgroundColor: RACE_COLORS[r.user_race] + '22' }}
              >
                {RACE_NAMES[r.user_race]}
              </span>
              <span className="text-sm text-white/80 flex-1 truncate">{r.user_nickname}</span>
              <span className="text-xs font-mono text-white/50">{Number(r.hashrate_sum).toLocaleString()} H</span>
              <span className="text-xs font-mono text-orange-400/80">+{parseFloat(r.reward_sum).toFixed(1)} T</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
