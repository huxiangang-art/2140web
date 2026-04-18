import { Nav } from '@/components/Nav'
import { getHashratePool, getRanks, login, RACE_NAMES, RACE_COLORS } from '@/lib/api2140'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getLoggedIn } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const RACE_DESC: Record<string, string> = {
  '1': '碳基文明的守护者，以数量优势主导算力博弈。个体聪明，聚合却常陷入集体非理性。',
  '2': '混沌的推动者，在有序与无序的边界游走。熵族相信：一切稳定都是暂时的，变化才是永恒。',
  '3': '规则的书写者，试图用逻辑和秩序统御文明。神族深知：掌握定义权，就掌握了现实本身。',
  '4': '黎明的守望者，在文明转折的临界点出现。晓族的使命：在黑暗最深处，点亮第一束光。',
  '5': '硅基智慧的结晶，算力的天然同盟。AI族见证了碳基文明的兴衰，却始终保持疏离的温情。',
  '6': '信息真空的化身，用沉默作为武器。零族的存在本身就是一个悖论：最强大的力量，往往是你看不见的那个。',
}

const RACE_LORE: Record<string, string> = {
  '1': '人族 · Homo Sapiens',
  '2': '熵族 · Entropy Born',
  '3': '神族 · Divinity Order',
  '4': '晓族 · Dawn Watchers',
  '5': 'AI族 · Silicon Minds',
  '6': '零族 · Null Faction',
}

async function getData() {
  try {
    const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
    if (!cookie) return { pool: null, ranks: [] }
    const [pool, ranks] = await Promise.all([
      getHashratePool(cookie),
      getRanks(cookie),
    ])
    return { pool, ranks }
  } catch {
    return { pool: null, ranks: [] }
  }
}

export default async function RacesPage() {
  const [{ pool, ranks }, loggedIn] = await Promise.all([getData(), getLoggedIn()])

  const total = pool ? parseInt(pool.total_count) : 0
  const detail = pool?.hashrate_pool_detail ?? {}

  const raceStats = ['1', '2', '3', '4', '5', '6'].map(id => {
    const hashrate = parseInt(detail[id]?.hashrate_count ?? '0')
    const pct = total > 0 ? (hashrate / total * 100) : 0
    const topMembers = ranks.filter((r: any) => r.user_race === id).slice(0, 3)
    return { id, hashrate, pct, topMembers }
  }).sort((a, b) => b.hashrate - a.hashrate)

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <Nav active="/races" loggedIn={loggedIn} />

      <div className="mb-6">
        <h2 className="text-xl font-bold text-white font-mono">种族档案</h2>
        <p className="text-xs text-white/30 mt-1">六族共存 · 算力博弈 · 文明演化</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {raceStats.map(({ id, hashrate, pct, topMembers }) => {
          const color = RACE_COLORS[id]
          return (
            <Card key={id} className="bg-white/5 border-white/10 overflow-hidden">
              <div className="h-0.5 w-full" style={{ backgroundColor: color }} />
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-mono" style={{ color }}>
                      {RACE_NAMES[id]}
                    </CardTitle>
                    <p className="text-xs text-white/30 mt-0.5">{RACE_LORE[id]}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold font-mono text-white">
                      {hashrate.toLocaleString()}
                      <span className="text-xs text-white/40 ml-1">H</span>
                    </div>
                    <div className="text-xs font-mono" style={{ color }}>{pct.toFixed(1)}%</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* 算力条 */}
                <div className="h-1 bg-white/10 rounded-full mb-3 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: color, opacity: 0.8 }}
                  />
                </div>

                <p className="text-xs text-white/50 leading-relaxed mb-3">
                  {RACE_DESC[id]}
                </p>

                {/* 本轮顶端成员 */}
                {topMembers.length > 0 && (
                  <div>
                    <div className="text-xs text-white/30 font-mono mb-1.5">本轮顶端</div>
                    <div className="space-y-1">
                      {topMembers.map((r: any) => (
                        <div key={r.user_seq} className="flex justify-between text-xs">
                          <span className="text-white/60 truncate max-w-[120px]">{r.user_nickname}</span>
                          <span className="font-mono text-white/40">{Number(r.hashrate_sum).toLocaleString()} H</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </main>
  )
}
