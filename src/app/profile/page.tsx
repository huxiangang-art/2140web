import { Nav } from '@/components/Nav'
import { redirect } from 'next/navigation'
import { getUserCookie, getLoggedIn } from '@/lib/auth'
import {
  getUserInfo, getUserHashrate, getUserTotalToken, getUserInvite,
  getDigitalPersonRank, RACE_NAMES, RACE_COLORS,
} from '@/lib/api2140'

export const dynamic = 'force-dynamic'

// 数字人21代进化名
const LV_NAMES = [
  '人', '碳基体', '猿人', '直立人', '智人', '原始人', '自然人',
  '农业人', '封建人', '工业人', '社会人', '契约人', '加密客',
  '基因体', '半数人', '算力体', '硅基体', '比特人', '低熵体',
  '全数人', '元人', '数字人',
]

const DIMENSIONS = [
  { key: 'standard1', label: '创世指数', color: '#a855f7' },
  { key: 'standard2', label: '荣誉指数', color: '#f59e0b' },
  { key: 'standard3', label: '权力指数', color: '#ef4444' },
  { key: 'standard4', label: '投资指数', color: '#22c55e' },
]

async function getProfileData(cookie: string) {
  const results = await Promise.allSettled([
    getUserInfo(cookie),
    getUserHashrate(cookie),
    getUserTotalToken(cookie),
    getUserInvite(cookie),
    getDigitalPersonRank(cookie),
  ])
  const [infoRes, hashrateRes, tokenRes, inviteRes, digitalRankRes] = results
  const infoRaw = infoRes.status === 'fulfilled' ? infoRes.value : null
  const info = infoRaw?.ret === 0 ? infoRaw.data : null
  const hashrateStat = hashrateRes.status === 'fulfilled' ? hashrateRes.value : null
  const token = tokenRes.status === 'fulfilled' ? tokenRes.value : null
  const invite = inviteRes.status === 'fulfilled' ? inviteRes.value : null
  const digitalRank = digitalRankRes.status === 'fulfilled' ? digitalRankRes.value : null
  return { info, hashrateStat, token, invite, digitalRank }
}

async function getMyDigitalPerson(cookie: string) {
  try {
    const res = await fetch(`${process.env.API_BASE ?? 'https://www.2140city.cn'}/digitalPerson/get_user_digital_person/`, {
      headers: {
        'Cookie': `ci_session=${cookie}`,
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G975U) AppleWebKit/537.36',
      },
      cache: 'no-store',
    })
    const d = await res.json()
    return d.ret === 0 ? d.data : null
  } catch { return null }
}

export default async function ProfilePage() {
  const loggedIn = await getLoggedIn()
  if (!loggedIn) redirect('/login')

  const cookie = await getUserCookie()
  const [{ info, hashrateStat, token, invite, digitalRank }, myDigital] = await Promise.all([
    getProfileData(cookie!),
    getMyDigitalPerson(cookie!),
  ])

  const raceColor = info ? (RACE_COLORS[info.race] ?? '#888') : '#888'
  const raceName = info ? (RACE_NAMES[info.race] ?? '未知') : '未知'
  const currentHashrate = parseInt(hashrateStat?.hashrate ?? '0')
  const totalHashrate = parseInt(hashrateStat?.total_hashrate ?? '0')
  const roundCount = parseInt(hashrateStat?.r_count ?? '0')

  // 数字人数据
  const personLv = myDigital?.person_lv ?? 0
  const lvName = LV_NAMES[personLv] ?? '碳基体'
  const digitalSum = myDigital?.standard_sum ?? 0

  // 我在排行榜中的数据
  const myRankEntry = digitalRank?.my_rank
  const topRecords: any[] = digitalRank?.records?.slice(0, 8) ?? []

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <Nav active="/profile" loggedIn={loggedIn} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 左列：身份 + 数字人 */}
        <div className="md:col-span-1 space-y-4">
          {/* 身份卡 */}
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
              <StatRow label="种族等级" value={`Lv.${info?.race_lv ?? '—'}`} />
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

          {/* 数字人卡 */}
          {myDigital && (
            <div className="border border-cyan-500/20 rounded-lg p-5 space-y-4"
              style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.05) 0%, rgba(0,0,0,0) 100%)' }}>
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono text-white/30">数字人</div>
                {myRankEntry && myRankEntry.rank !== '未入榜' && (
                  <div className="text-xs font-mono text-cyan-400/60">#{myRankEntry.rank}</div>
                )}
              </div>

              {/* 进化等级 */}
              <div className="text-center py-2">
                <div className="text-2xl font-mono font-bold text-cyan-300">第{personLv}代</div>
                <div className="text-sm font-mono text-cyan-400/70 mt-0.5">{lvName}</div>
                <div className="text-xs font-mono text-white/30 mt-1">数字化 {digitalSum}%</div>
              </div>

              {/* 总进度条 */}
              <div>
                <div className="bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full rounded-full bg-cyan-500/60 transition-all"
                    style={{ width: `${Math.min(100, digitalSum)}%` }} />
                </div>
              </div>

              {/* 四维指数 */}
              <div className="space-y-2.5">
                {DIMENSIONS.map(({ key, label, color }) => {
                  const val = myDigital[key] ?? 0
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-white/40">{label}</span>
                        <span style={{ color }}>{val}%</span>
                      </div>
                      <div className="bg-white/5 rounded-full h-1 overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, val)}%`, backgroundColor: color, opacity: 0.7 }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* 右列：算力 + 数字人排行 */}
        <div className="md:col-span-2 space-y-4">
          <div className="border border-white/10 rounded-lg p-5">
            <div className="text-xs font-mono text-white/30 mb-4">算力统计</div>
            <div className="grid grid-cols-3 gap-4">
              <BigStat label="当前算力" value={`${currentHashrate.toLocaleString()} H`} color={raceColor} />
              <BigStat label="历史总算力" value={`${totalHashrate.toLocaleString()} H`} color={raceColor} />
              <BigStat label="参与轮次" value={`${roundCount} 轮`} color={raceColor} />
            </div>
          </div>

          {totalHashrate > 0 && (
            <div className="border border-white/10 rounded-lg p-5">
              <div className="text-xs font-mono text-white/30 mb-4">算力分布</div>
              <div className="space-y-3">
                <BarStat label="当前算力" value={currentHashrate} max={totalHashrate} color={raceColor} />
                <BarStat label="沉淀算力" value={totalHashrate - currentHashrate} max={totalHashrate} color="#6b7280" />
              </div>
            </div>
          )}

          {/* 数字人进化榜 */}
          {topRecords.length > 0 && (
            <div className="border border-white/10 rounded-lg p-5">
              <div className="text-xs font-mono text-white/30 mb-4">数字人进化榜</div>
              <div className="space-y-2">
                {topRecords.map((u: any, i: number) => {
                  const color = RACE_COLORS[u.user_race] ?? '#888'
                  const uLvName = LV_NAMES[parseInt(u.person_lv)] ?? '碳基体'
                  const sum = parseInt(u.standard_sum)
                  return (
                    <div key={u.seq} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                      <span className="text-xs font-mono text-white/20 w-5 shrink-0">{i + 1}</span>
                      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0"
                        style={{ backgroundColor: color + '20', border: `1px solid ${color}40` }}>
                        {u.user_avatar && !u.user_avatar.includes('default')
                          ? <img src={u.user_avatar} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-xs" style={{ color }}>{u.user_nick?.[0]}</div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-mono text-white/75 truncate">{u.user_nick}</div>
                        <div className="text-xs font-mono text-white/25">第{u.person_lv}代 · {uLvName}</div>
                      </div>
                      {/* 四维迷你条 */}
                      <div className="flex gap-0.5 items-end h-5 shrink-0">
                        {['standard1','standard2','standard3','standard4'].map((k, ki) => {
                          const v = parseInt(u[k] ?? '0')
                          const barColor = DIMENSIONS[ki].color
                          return (
                            <div key={k} className="w-1.5 rounded-sm"
                              style={{ height: `${Math.max(8, Math.round(v / 100 * 20))}px`, backgroundColor: barColor, opacity: 0.6 }} />
                          )
                        })}
                      </div>
                      <span className="text-xs font-mono text-cyan-400/60 w-10 text-right shrink-0">{sum}%</span>
                    </div>
                  )
                })}
              </div>
              {myRankEntry && (
                <div className="mt-3 pt-3 border-t border-white/5 flex justify-between text-xs font-mono">
                  <span className="text-white/30">我的排名</span>
                  <span className="text-cyan-400/60">
                    {myRankEntry.rank === '未入榜' ? '未入榜' : `#${myRankEntry.rank}`}
                    {myRankEntry.num ? ` · ${myRankEntry.num}%` : ''}
                  </span>
                </div>
              )}
            </div>
          )}

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
