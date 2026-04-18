import { Nav } from '@/components/Nav'
import { getLoggedIn, getUserCookie } from '@/lib/auth'
import {
  getBills, getParliamentUser, getOfficials, getOfficialInfo, getActiveValRank,
  login, RACE_NAMES, RACE_COLORS
} from '@/lib/api2140'

export const dynamic = 'force-dynamic'

const BILL_TYPE: Record<string, string> = {
  '1': '立法', '2': '修法', '3': '职位申请', '4': '种族提案',
  '5': '城邦提案', '6': '战争提案', '7': '创作提案', '8': '其他',
}
const BILL_STATUS: Record<string, { label: string; color: string }> = {
  '1': { label: '投票中', color: '#22c55e' },
  '2': { label: '待审核', color: '#f59e0b' },
  '3': { label: '已结束', color: '#6b7280' },
  '4': { label: '已通过', color: '#06b6d4' },
  '5': { label: '已否决', color: '#ef4444' },
}

const OFFICIAL_LEVEL_COLOR: Record<string, string> = {
  '1': '#6b7280', '2': '#3b82f6', '3': '#a855f7',
  '4': '#06b6d4', '5': '#f59e0b', '6': '#ef4444',
}

export default async function ParliamentPage() {
  const [loggedIn, userCookie, sysCookie] = await Promise.all([
    getLoggedIn(),
    getUserCookie(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])
  const activeCookie = userCookie ?? sysCookie ?? ''

  const [bills, parliamentUser, officials, officialInfo, activeValRank] = await Promise.all([
    getBills(activeCookie),
    userCookie ? getParliamentUser(userCookie) : Promise.resolve(null),
    getOfficials(activeCookie),
    getOfficialInfo(activeCookie),
    getActiveValRank(activeCookie),
  ])

  const officialFlat = (officials as any[][]).flat()
  const dailyRank: any[] = activeValRank?.daily_rank?.slice(0, 10) ?? []
  const totalRank: any[] = activeValRank?.total_rank?.slice(0, 10) ?? []

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <Nav active="/parliament" loggedIn={loggedIn} />

      {/* 顶部标题 + 城邦概况 */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white font-mono">议事厅</h2>
          <p className="text-xs text-white/30 mt-1">城邦治理 · 居民共议</p>
        </div>
        {officialInfo && (
          <div className="flex gap-6 text-right">
            <div>
              <div className="text-xs font-mono text-white/20">城邦居民</div>
              <div className="text-sm font-mono text-white/70">{Number(officialInfo.count).toLocaleString()}</div>
            </div>
            {officialInfo.my_total_token && (
              <div>
                <div className="text-xs font-mono text-white/20">我的代币</div>
                <div className="text-sm font-mono text-cyan-400/70">{parseFloat(officialInfo.my_total_token).toFixed(2)}</div>
              </div>
            )}
            {parliamentUser && parliamentUser.official_name !== '—' && (
              <div>
                <div className="text-xs font-mono text-white/20">职位</div>
                <div className="text-sm font-mono text-amber-400/70">{parliamentUser.official_name}</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左：议案列表 */}
        <div className="lg:col-span-2 space-y-3">
          <div className="text-xs font-mono text-white/30 mb-3">议案记录</div>
          {bills.length === 0 ? (
            <div className="text-center py-16 text-white/20 font-mono text-sm">暂无议案</div>
          ) : (
            bills.map((bill: any) => {
              const status = BILL_STATUS[bill.status] ?? { label: '未知', color: '#888' }
              const raceColor = RACE_COLORS[bill.user_race] ?? '#888'
              const raceName = RACE_NAMES[bill.user_race] ?? ''
              const progress = bill.target_num > 0
                ? Math.min(100, Math.round((parseInt(bill.curr_num) / parseInt(bill.target_num)) * 100))
                : 0
              const daysLeft = bill.time_end
                ? Math.max(0, Math.ceil((new Date(bill.time_end).getTime() - Date.now()) / 86400000))
                : null

              return (
                <div key={bill.seq} className="border border-white/8 rounded-lg p-4 hover:border-white/15 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-0.5"
                      style={{ backgroundColor: raceColor + '20', border: `1px solid ${raceColor}40` }}>
                      {bill.user_avatar
                        ? <img src={bill.user_avatar} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-xs font-mono" style={{ color: raceColor }}>
                            {bill.user_nickname?.[0] ?? '?'}
                          </div>
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-mono text-white/90 font-medium">{bill.title}</span>
                        <span className="text-xs font-mono px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: status.color + '15', color: status.color, border: `1px solid ${status.color}30` }}>
                          {status.label}
                        </span>
                        {BILL_TYPE[bill.type] && (
                          <span className="text-xs font-mono text-white/25 border border-white/10 px-1.5 py-0.5 rounded">
                            {BILL_TYPE[bill.type]}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono" style={{ color: raceColor }}>{bill.user_nickname}</span>
                        {raceName && <span className="text-xs font-mono text-white/20">{raceName}族</span>}
                        <span className="text-xs font-mono text-white/20">{bill.time_start?.slice(0, 10)}</span>
                        {daysLeft !== null && bill.status === '1' && (
                          <span className="text-xs font-mono text-amber-400/60 ml-auto">剩 {daysLeft} 天</span>
                        )}
                      </div>

                      {bill.content && (
                        <p className="text-xs text-white/40 leading-relaxed line-clamp-2 mb-3">
                          {bill.content.replace(/<[^>]+>/g, '').slice(0, 120)}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/5 rounded-full h-1 overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${progress}%`, backgroundColor: progress >= 100 ? '#22c55e' : '#06b6d4', opacity: 0.7 }} />
                        </div>
                        <span className="text-xs font-mono text-white/30 shrink-0">
                          {parseInt(bill.curr_num).toLocaleString()} / {parseInt(bill.target_num).toLocaleString()}
                        </span>
                        <span className="text-xs font-mono text-white/20 shrink-0">{progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* 右侧边栏 */}
        <div className="space-y-6">

          {/* 官员体系 */}
          {officialFlat.length > 0 && (
            <section>
              <div className="text-xs font-mono text-white/30 mb-3">官员体系</div>
              <div className="space-y-1.5">
                {officialFlat.filter((o: any) => o.is_unlock === '1').map((o: any) => {
                  const color = OFFICIAL_LEVEL_COLOR[o.level] ?? '#888'
                  const curr = parseInt(o.curr_count) || 0
                  const limit = parseInt(o.count_limit)
                  const isUnlimited = limit > 9000000
                  const pct = isUnlimited ? 0 : Math.min(100, Math.round((curr / limit) * 100))
                  return (
                    <div key={o.seq} className="rounded p-2.5 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: color + '15', color, border: `1px solid ${color}30` }}>
                            Lv.{o.level}
                          </span>
                          <span className="text-xs font-mono text-white/75">{o.name}</span>
                        </div>
                        <span className="text-xs font-mono text-white/30">
                          {curr.toLocaleString()}{!isUnlimited && `/${limit}`}
                        </span>
                      </div>
                      {!isUnlimited && (
                        <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color, opacity: 0.6 }} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* 今日活跃排行 */}
          {dailyRank.length > 0 && (
            <section>
              <div className="text-xs font-mono text-white/30 mb-3">今日活跃</div>
              <div className="space-y-1.5">
                {dailyRank.map((u: any, i: number) => {
                  const color = RACE_COLORS[u.user_race] ?? '#888'
                  return (
                    <div key={u.user_seq} className="flex items-center gap-2 py-1 border-b border-white/5 last:border-0">
                      <span className="text-xs font-mono text-white/20 w-4">{i + 1}</span>
                      <div className="w-5 h-5 rounded-full overflow-hidden shrink-0"
                        style={{ backgroundColor: color + '20', border: `1px solid ${color}40` }}>
                        {u.user_avatar && !u.user_avatar.includes('default')
                          ? <img src={u.user_avatar} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-xs" style={{ color }}>{u.user_nick?.[0]}</div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-mono text-white/70 truncate block">{u.user_nick}</span>
                        {u.user_official_name && u.user_official_name !== '—' && (
                          <span className="text-xs font-mono text-white/20">{u.user_official_name}</span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-green-400/60 shrink-0">+{u.active_val}</span>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* 总活跃排行 */}
          {totalRank.length > 0 && (
            <section>
              <div className="text-xs font-mono text-white/30 mb-3">总活跃榜</div>
              <div className="space-y-1.5">
                {totalRank.map((u: any, i: number) => {
                  const color = RACE_COLORS[u.user_race] ?? '#888'
                  return (
                    <div key={u.user_seq} className="flex items-center gap-2 py-1 border-b border-white/5 last:border-0">
                      <span className="text-xs font-mono text-white/20 w-4">{i + 1}</span>
                      <div className="w-5 h-5 rounded-full overflow-hidden shrink-0"
                        style={{ backgroundColor: color + '20', border: `1px solid ${color}40` }}>
                        {u.user_avatar && !u.user_avatar.includes('default')
                          ? <img src={u.user_avatar} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-xs" style={{ color }}>{u.user_nick?.[0]}</div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-mono text-white/70 truncate block">{u.user_nick}</span>
                        {u.user_official_name && u.user_official_name !== '—' && (
                          <span className="text-xs font-mono text-white/20">{u.user_official_name}</span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-cyan-400/50 shrink-0">{parseInt(u.active_val).toLocaleString()}</span>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
