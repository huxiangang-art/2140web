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
  const [infoRes, hashrateRes, tokenRes, inviteRes] = results
  const infoRaw = infoRes.status === 'fulfilled' ? infoRes.value : null
  const info = infoRaw?.ret === 0 ? infoRaw.data : null
  const hashrateStat = hashrateRes.status === 'fulfilled' ? hashrateRes.value : null
  const token = tokenRes.status === 'fulfilled' ? tokenRes.value : null
  const invite = inviteRes.status === 'fulfilled' ? inviteRes.value : null
  return { info, hashrateStat, token, invite }
}

export default async function ProfilePage() {
  const loggedIn = await getLoggedIn()
  if (!loggedIn) redirect('/login')

  const cookie = await getUserCookie()
  const { info, hashrateStat, token, invite } = await getProfileData(cookie!)

  const raceColor = info ? (RACE_COLORS[info.race_id] ?? '#888') : '#888'
  const raceName = info ? (RACE_NAMES[info.race_id] ?? '未知') : '未知'

  const currentHashrate = parseInt(hashrateStat?.hashrate ?? '0')
  const totalHashrate = parseInt(hashrateStat?.total_hashrate ?? '0')
  const roundCount = parseInt(hashrateStat?.r_count ?? '0')

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
            <StatRow label="邀请人数" value={invite?.invite_count !== undefined ? `${invite.invite_count} 人` : '—'} />
            <StatRow label="邀请等级" value={invite?.lv !== undefined ? `Lv.${invite.lv}` : '—'} />
          </div>
        </div>

        {/* 算力统计 */}
        <div className="md:col-span-2 space-y-4">
          <div className="border border-white/10 rounded-lg p-5">
            <div className="text-xs font-mono text-white/30 mb-4">算力统计</div>
            <div className="grid grid-cols-3 gap-4">
              <BigStat label="当前算力" value={`${currentHashrate.toLocaleString()} H`} color={raceColor} />
              <BigStat label="历史总算力" value={`${totalHashrate.toLocaleString()} H`} color={raceColor} />
              <BigStat label="参与轮次" value={`${roundCount} 轮`} color={raceColor} />
            </div>
          </div>

          {/* 算力条 */}
          {totalHashrate > 0 && (
            <div className="border border-white/10 rounded-lg p-5">
              <div className="text-xs font-mono text-white/30 mb-4">算力分布</div>
              <div className="space-y-3">
                <BarStat label="当前算力" value={currentHashrate} max={totalHashrate} color={raceColor} />
                <BarStat label="沉淀算力" value={totalHashrate - currentHashrate} max={totalHashrate} color="#6b7280" />
              </div>
            </div>
          )}

          {/* 文明地位 */}
          <div className="border border-white/10 rounded-lg p-5">
            <div className="text-xs font-mono text-white/30 mb-4">文明身份</div>
            <div className="space-y-2">
              <StatRow label="种族" value={`${raceName}族`} />
              <StatRow label="累计贡献" value={totalHashrate > 0 ? `${totalHashrate.toLocaleString()} H` : '—'} highlight />
              <StatRow label="邀请贡献" value={invite?.invite_count ? `引入 ${invite.invite_count} 位文明成员` : '尚未邀请'} />
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
    <div className="rounded-lg p-4 border border-white/5" style={{ backgroundColor: `${color}10` }}>
      <div className="text-xs font-mono text-white/30 mb-1">{label}</div>
      <div className="text-base font-mono font-bold" style={{ color }}>{value}</div>
    </div>
  )
}

function BarStat({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div>
      <div className="flex justify-between text-xs font-mono mb-1">
        <span className="text-white/30">{label}</span>
        <span className="text-white/50">{value.toLocaleString()} H ({pct}%)</span>
      </div>
      <div className="bg-white/5 rounded-full h-1.5 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}
