'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props {
  pool: {
    name: string
    total_count: string
    reward_amount: string
    start_time: string
    end_time: string
    countdonw: number
    user_hashrate: string
    user_hashrate_inputed: number
  }
}

function formatCountdown(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function HashratePool({ pool }: Props) {
  const invested = pool.user_hashrate_inputed > 0

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white font-mono text-sm">算力池 · {pool.name}</CardTitle>
          <Badge variant={invested ? 'default' : 'outline'} className="text-xs font-mono">
            {invested ? '已投入' : '未投入'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="总算力" value={Number(pool.total_count).toLocaleString() + ' H'} />
          <Stat label="奖池" value={pool.reward_amount + ' T'} accent />
          <Stat label="我的算力" value={Number(pool.user_hashrate).toLocaleString() + ' H'} />
          <Stat label="剩余时间" value={formatCountdown(pool.countdonw)} glow />
        </div>
        <div className="mt-3 text-xs text-white/30 font-mono">
          {pool.start_time} → {pool.end_time}
        </div>
      </CardContent>
    </Card>
  )
}

function Stat({ label, value, accent, glow }: { label: string; value: string; accent?: boolean; glow?: boolean }) {
  return (
    <div>
      <div className="text-xs text-white/40 font-mono mb-1">{label}</div>
      <div className={`text-lg font-bold font-mono ${accent ? 'text-orange-400' : glow ? 'text-cyan-400' : 'text-white'}`}>
        {value}
      </div>
    </div>
  )
}
