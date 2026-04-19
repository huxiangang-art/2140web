import { Nav } from '@/components/Nav'
import { getLoggedIn, getUserCookie } from '@/lib/auth'
import { getTreasureUserInfo, getTreasureFutureDebris, getTreasureRewardRank, getTreasureMaze, login } from '@/lib/api2140'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

async function getData(cookie: string) {
  const [info, futuredebris, rank, maze] = await Promise.allSettled([
    getTreasureUserInfo(cookie),
    getTreasureFutureDebris(cookie),
    getTreasureRewardRank(cookie, 1),
    getTreasureMaze(cookie),
  ]).then(r => r.map(s => s.status === 'fulfilled' ? s.value : null))
  return { info, futuredebris, rank: rank ?? [], maze }
}

export default async function TreasurePage() {
  const [loggedIn, userCookie] = await Promise.all([getLoggedIn(), getUserCookie()])
  if (!loggedIn) redirect('/login')

  const { info, futuredebris, rank, maze } = await getData(userCookie!)

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <Nav active="/treasure" loggedIn={loggedIn} />
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white font-mono">寻宝</h2>
        <p className="text-xs text-white/30 mt-1">迷宫探索 · 未来碎片 · 算力奖励</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 个人状态 */}
        {info && (
          <div className="border border-white/10 rounded-xl p-5 bg-white/3">
            <div className="text-xs font-mono text-white/40 mb-4">寻宝状态</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '算力', value: Number(info.hashrate ?? 0).toLocaleString() },
                { label: '卡片', value: info.card_count ?? 0 },
                { label: '探索次数', value: info.play_count ?? 0 },
                { label: '碎片数', value: info.debris_count ?? 0 },
                { label: '获胜', value: info.win_count ?? 0 },
                { label: '胜率', value: `${info.win_rate ?? 0}%` },
              ].map(item => (
                <div key={item.label} className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs font-mono text-white/30 mb-1">{item.label}</div>
                  <div className="text-sm font-bold font-mono text-white">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 未来碎片 */}
        {futuredebris && (
          <div className="border border-white/10 rounded-xl p-5 bg-white/3">
            <div className="text-xs font-mono text-white/40 mb-4">未来碎片预言</div>
            <div className="text-sm font-mono text-white/70 mb-3">{futuredebris.title}</div>
            {futuredebris.img && (
              <div className="rounded-lg overflow-hidden mb-3">
                <img
                  src={futuredebris.img.startsWith('http') ? futuredebris.img : `https://www.2140city.cn${futuredebris.img}`}
                  alt=""
                  className="w-full object-cover"
                />
              </div>
            )}
            <div className="text-xs font-mono text-white/40 leading-relaxed">
              {futuredebris.desc?.slice(0, 120)}
            </div>
          </div>
        )}

        {/* 当前迷宫 */}
        {maze && (
          <div className="border border-white/10 rounded-xl p-5 bg-white/3">
            <div className="text-xs font-mono text-white/40 mb-4">当前迷宫</div>
            <div className="text-sm font-mono text-white/70 mb-2">{maze.title ?? `迷宫 #${maze.seq}`}</div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="text-white/30">进度</div>
              <div className="text-white/60">{maze.current_step ?? 0} / {maze.total_step ?? 0}</div>
              <div className="text-white/30">奖励</div>
              <div className="text-cyan-400/70">{maze.reward ?? 0} H</div>
              <div className="text-white/30">截止</div>
              <div className="text-white/60">{maze.deadline?.slice(0, 10)}</div>
            </div>
          </div>
        )}
      </div>

      {/* 奖励排行 */}
      {Array.isArray(rank) && rank.length > 0 && (
        <div className="mt-6 border border-white/10 rounded-xl p-5 bg-white/3">
          <div className="text-xs font-mono text-white/40 mb-4">奖励排行</div>
          <div className="space-y-2">
            {(rank as any[]).slice(0, 20).map((r: any, i: number) => (
              <div key={r.user_seq ?? i} className="flex items-center gap-3 py-1 border-b border-white/5 last:border-0">
                <div className="w-6 text-xs font-mono text-white/25 text-right">{i + 1}</div>
                {r.user_avatar && <img src={r.user_avatar} alt="" className="w-6 h-6 rounded-full" />}
                <div className="flex-1 text-xs font-mono text-white/70 truncate">{r.user_nickname ?? r.nick}</div>
                <div className="text-xs font-mono text-yellow-400/80">{r.reward ?? r.amount} H</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
