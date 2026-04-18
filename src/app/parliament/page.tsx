import { Nav } from '@/components/Nav'
import { getLoggedIn, getUserCookie } from '@/lib/auth'
import { getBills, getParliamentUser, login, RACE_NAMES, RACE_COLORS } from '@/lib/api2140'

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

export default async function ParliamentPage() {
  const loggedIn = await getLoggedIn()
  const userCookie = await getUserCookie()
  const sysCookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const activeCookie = userCookie ?? sysCookie ?? ''

  const [bills, parliamentUser] = await Promise.all([
    getBills(activeCookie),
    userCookie ? getParliamentUser(userCookie) : Promise.resolve(null),
  ])

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <Nav active="/parliament" loggedIn={loggedIn} />

      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white font-mono">议事厅</h2>
          <p className="text-xs text-white/30 mt-1">城邦治理 · 居民共议</p>
        </div>
        {parliamentUser && (
          <div className="text-right">
            <div className="text-xs font-mono text-white/40">
              {parliamentUser.official_name !== '—' ? parliamentUser.official_name : '居民'}
            </div>
            <div className="text-xs font-mono text-white/20 mt-0.5">
              活跃值 {parliamentUser.active_val ?? 0}
            </div>
          </div>
        )}
      </div>

      {bills.length === 0 ? (
        <div className="text-center py-20 text-white/20 font-mono text-sm">暂无议案</div>
      ) : (
        <div className="space-y-3">
          {bills.map((bill: any) => {
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
                  {/* 头像 */}
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
                    {/* 标题行 */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-mono text-white/90 font-medium">{bill.title}</span>
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: status.color + '20', color: status.color, border: `1px solid ${status.color}40` }}>
                        {status.label}
                      </span>
                      {BILL_TYPE[bill.type] && (
                        <span className="text-xs font-mono text-white/25 border border-white/10 px-1.5 py-0.5 rounded">
                          {BILL_TYPE[bill.type]}
                        </span>
                      )}
                    </div>

                    {/* 发起人 */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono" style={{ color: raceColor }}>
                        {bill.user_nickname}
                      </span>
                      {raceName && (
                        <span className="text-xs font-mono text-white/20">{raceName}族</span>
                      )}
                      <span className="text-xs font-mono text-white/20">
                        {bill.time_start?.slice(0, 10)}
                      </span>
                      {daysLeft !== null && bill.status === '1' && (
                        <span className="text-xs font-mono text-amber-400/60 ml-auto">
                          剩 {daysLeft} 天
                        </span>
                      )}
                    </div>

                    {/* 内容摘要 */}
                    <p className="text-xs text-white/45 leading-relaxed line-clamp-2 mb-3">
                      {bill.content?.replace(/<[^>]+>/g, '').slice(0, 120)}
                    </p>

                    {/* 进度条 */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white/5 rounded-full h-1 overflow-hidden">
                        <div className="h-full rounded-full bg-cyan-500/60 transition-all"
                          style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs font-mono text-white/30 shrink-0">
                        {parseInt(bill.curr_num).toLocaleString()} / {parseInt(bill.target_num).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
