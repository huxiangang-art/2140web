'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Countdown } from './Countdown'
import { HashrateInput } from './HashrateInput'

interface Props {
  pool: {
    seq: string
    name: string
    total_count: string
    reward_amount: string
    start_time: string
    end_time: string
    countdonw: number
    user_hashrate: string
    user_hashrate_inputed: number
  }
  loggedIn?: boolean
}

export function HashratePool({ pool, loggedIn }: Props) {
  const invested = pool.user_hashrate_inputed > 0

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white font-mono text-sm">算力池 · {pool.name}</CardTitle>
          <div className="flex items-center gap-2">
            {loggedIn && !invested && (
              <HashrateInput
                poolSeq={pool.seq}
                userHashrate={parseInt(pool.user_hashrate)}
                onSuccess={() => {}}
              />
            )}
            <Badge variant={invested ? 'default' : 'outline'} className="text-xs font-mono">
              {invested ? '已投入' : '未投入'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="总算力" value={Number(pool.total_count).toLocaleString() + ' H'} />
          <Stat label="奖池" value={pool.reward_amount + ' T'} accent />
          <Stat label="我的算力" value={Number(pool.user_hashrate).toLocaleString() + ' H'} />
          <div>
            <div className="text-xs text-white/40 font-mono mb-1">剩余时间</div>
            <Countdown initialSeconds={pool.countdonw} />
          </div>
        </div>
        <div className="mt-3 text-xs text-white/30 font-mono">
          {pool.start_time} → {pool.end_time}
        </div>
      </CardContent>
    </Card>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-xs text-white/40 font-mono mb-1">{label}</div>
      <div className={`text-lg font-bold font-mono ${accent ? 'text-orange-400' : 'text-white'}`}>
        {value}
      </div>
    </div>
  )
}
