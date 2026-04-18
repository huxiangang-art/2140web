import { Nav } from '@/components/Nav'
import { redirect } from 'next/navigation'
import { getUserCookie, getLoggedIn } from '@/lib/auth'
import { getUserInfo, getUserHashrate, getUserTotalToken, getUserInvite, RACE_NAMES, RACE_COLORS } from '@/lib/api2140'

export const dynamic = 'force-dynamic'

async function getProfileData(cookie: string) {
  const results = await Promise.allSettled([
    getUserInfo(cookie),
    getUserHashrate(cookie),
    getUserTotalToken(cookie),
    getUserInvite(cookie),
  ])
  const [infoRes, hashratesRes, tokenRes, inviteRes] = results
  const infoRaw = infoRes.status === 'fulfilled' ? infoRes.value : null
  const info = infoRaw?.ret === 0 ? infoRaw.data : null
  const hashrates = hashratesRes.status === 'fulfilled' ? hashratesRes.value : []
  const token = tokenRes.status === 'fulfilled' ? tokenRes.value : null
  const invite = inviteRes.status === 'fulfilled' ? inviteRes.value : null
  return { info, hashrates, token, invite }
}

export default async function ProfilePage() {
  const loggedIn = await getLoggedIn()
  if (!loggedIn) redirect('/login')

  const cookie = await getUserCookie()
  const { info, hashrates, token, invite } = await getProfileData(cookie!)

  const raceColor = info ? (RACE_COLORS[info.race_id] ?? '#888') : '#888'
  const raceName = info ? (RACE_NAMES[info.race_id] ?? '未知') : '未知'

  // compute cumulative stats from history
  const totalEver = hashrates?.reduce((s: number, r: any) => s + parseInt(r.hashrate_sum ?? 0), 0) ?? 0
  const recentRounds = hashrates?.slice(0, 10) ?? []

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <Nav active="/profile" loggedIn={loggedIn} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 身份卡 */}
        <div className="md:col-span-1 space-y-4">
          <div className="border border-white/10 rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-mono font-bold"
                style={{ backgroundColor: `${raceColor}20`, color: raceColor, border: `1px solid ${raceColor}40` }}
              >
                {info?.nickname?.[0] ?? '?'}
              </div>
              <div>
                <div className="text-white font-mono text-sm">{info?.nickname ?? '—'}</div>
                <div className="text-xs font-mono mt-0.5" style={{ color: raceColor }}>{raceName}族</div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/5">
              <StatRow label="等级" value={`Lv.${info?.level ?? '—'}`} />
              <StatRow label="手机" value={info?.mobile ? `${info.mobile.slice(0, 3)}****${info.mobile.slice(-4)}` : '—'} />
              <StatRow label="邀请码" value={invite?.invite_code ?? '—'} highlight />
            </div>
          </div>

          {/* 代币 & 邀请 */}
          <div className="border border-white/10 rounded-lg p-5 space-y-3">
            <div className="text-xs font-mono text-white/30 mb-2">经济账户</div>
            <StatRow label="累计代币" value={token ? `${parseFloat(token).toFixed(2)} T` : '—'} highlight />
            <StatRow label="邀请人数" value={invite?.count !== undefined ? `${invite.count} 人` : '—'} />
            <StatRow label="邀请等级" value={invite?.level !== undefined ? `Lv.${invite.level}` : '—'} />
          </div>
        </div>

        {/* 算力历史 */}
        <div className="md:col-span-2 space-y-4">
          <div className="border border-white/10 rounded-lg p-5">
            <div className="text-xs font-mono text-white/30 mb-4">算力统计</div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <BigStat label="历史总算力" value={`${totalEver.toLocaleString()} H`} color={raceColor} />
              <BigStat label="参与轮次" value={`${hashrates?.length ?? 0} 轮`} color={raceColor} />
            </div>

            <div className="text-xs font-mono text-white/30 mb-3">最近10轮记录</div>
            <div className="space-y-1.5">
              {recentRounds.length === 0 && (
                <div className="text-xs text-white/20 font-mono py-4 text-center">暂无记录</div>
              )}
              {recentRounds.map((r: any) => {
                const h = parseInt(r.hashrate_sum ?? 0)
                const maxH = recentRounds.reduce((m: number, x: any) => Math.max(m, parseInt(x.hashrate_sum ?? 0)), 1)
                const pct = (h / maxH) * 100
                return (
                  <div key={r.pool_seq} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-white/30 w-16 shrink-0">R{r.pool_seq}</span>
                    <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: raceColor }}
                      />
                    </div>
                    <span className="text-xs font-mono text-white/60 w-20 text-right shrink-0">
                      {h.toLocaleString()} H
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

function StatRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs font-mono text-white/30">{label}</span>
      <span className={`text-xs font-mono ${highlight ? 'text-cyan-400' : 'text-white/60'}`}>{value}</span>
    </div>
  )
}

function BigStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white/3 rounded-lg p-4 border border-white/5">
      <div className="text-xs font-mono text-white/30 mb-1">{label}</div>
      <div className="text-lg font-mono font-bold" style={{ color }}>{value}</div>
    </div>
  )
}
