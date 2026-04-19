import { Nav } from '@/components/Nav'
import { getLoggedIn, getUserCookie } from '@/lib/auth'
import { getDigitalPerson, getDigitalPersonRewards, getDigitalPersonRank, login, RACE_COLORS } from '@/lib/api2140'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const LV_NAMES = ['人','碳基体','猿人','直立人','智人','原始人','自然人','农业人','封建人','工业人','社会人','契约人','加密客','基因体','半数人','算力体','硅基体','比特人','低熵体','全数人','元人','数字人']

async function getData(cookie: string) {
  const sysCookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const [person, rewards, rank] = await Promise.allSettled([
    getDigitalPerson(cookie),
    getDigitalPersonRewards(cookie),
    getDigitalPersonRank(sysCookie ?? cookie),
  ]).then(r => r.map(s => s.status === 'fulfilled' ? s.value : null))
  return { person, rewards, rank: rank ?? [] }
}

export default async function DigitalPage() {
  const [loggedIn, userCookie] = await Promise.all([getLoggedIn(), getUserCookie()])
  if (!loggedIn) redirect('/login')

  const { person, rewards, rank } = await getData(userCookie!)

  const rewardList: any[] = rewards?.rewards ?? []
  const lv = parseInt(person?.person_lv ?? '0')
  const lvName = LV_NAMES[lv] ?? '数字人'
  const equipSrc = (n: number) => n > 0 && n <= 21 ? `/digital/person_equip${n}.png` : null

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <Nav active="/digital" loggedIn={loggedIn} />

      <div className="mb-6">
        <h2 className="text-xl font-bold text-white font-mono">数字人</h2>
        <p className="text-xs text-white/30 mt-1">虚拟文明形态 · 进化标准</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 当前状态 */}
        {person && (
          <div className="border border-white/10 rounded-xl p-5 bg-white/3">
            <div className="text-xs font-mono text-white/40 mb-4">当前状态</div>
            <div className="flex items-start gap-5 mb-5">
              {equipSrc(lv) ? (
                <div className="w-24 h-24 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-black/30">
                  <img src={equipSrc(lv)!} alt={lvName} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <span className="text-3xl font-bold font-mono text-white/40">{lv}</span>
                </div>
              )}
              <div>
                <div className="text-lg font-bold font-mono text-white mb-1">第 {lv} 代</div>
                <div className="text-sm font-mono text-cyan-400">{lvName}</div>
                <div className="text-xs font-mono text-white/30 mt-2">综合评分 {person.standard_sum ?? 0}%</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'standard1', label: '生物标准' },
                { key: 'standard2', label: '数字标准' },
                { key: 'standard3', label: '算力标准' },
                { key: 'standard4', label: '创作标准' },
              ].map(({ key, label }) => person[key] !== undefined && (
                <div key={key} className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs font-mono text-white/30 mb-1">{label}</div>
                  <div className="text-lg font-bold font-mono text-white">{person[key]}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 等级奖励 */}
        {rewardList.length > 0 && (
          <div className="border border-white/10 rounded-xl p-5 bg-white/3">
            <div className="text-xs font-mono text-white/40 mb-4">等级奖励</div>
            <div className="space-y-2">
              {rewardList.map((r: any) => (
                <div key={r.level} className="flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono shrink-0
                    ${r.is_received ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/10 text-white/40'}`}>
                    {r.level}
                  </div>
                  {equipSrc(r.level) && (
                    <img src={equipSrc(r.level)!} alt="" className="w-6 h-6 rounded object-cover shrink-0" />
                  )}
                  <div className="text-xs font-mono text-white/60 flex-1">{LV_NAMES[r.level] ?? `Lv${r.level}`}</div>
                  <div className="text-xs font-mono text-right">
                    {r.hashrate > 0 && <span className="text-cyan-400/70">+{r.hashrate}H </span>}
                    {r.token > 0 && <span className="text-amber-400/70">+{r.token}T</span>}
                    {r.is_received && <span className="text-green-400/60 ml-1">✓</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 排行榜 */}
      {Array.isArray(rank) && (rank as any[]).length > 0 && (
        <div className="mt-6 border border-white/10 rounded-xl p-5 bg-white/3">
          <div className="text-xs font-mono text-white/40 mb-4">数字人排行</div>
          <div className="space-y-1">
            {(rank as any[]).slice(0, 30).map((r: any, i: number) => {
              const color = RACE_COLORS[String(r.user_race)] ?? '#888'
              const rlv = parseInt(r.person_lv ?? 0)
              return (
                <div key={r.user_seq ?? i} className="flex items-center gap-2.5 py-1.5 border-b border-white/5 last:border-0">
                  <span className={`text-xs font-mono w-5 text-right shrink-0 ${i < 3 ? 'text-amber-400 font-bold' : 'text-white/20'}`}>{i + 1}</span>
                  <div className="w-7 h-7 rounded-full overflow-hidden shrink-0" style={{ border: `1px solid ${color}40` }}>
                    {r.user_avatar
                      ? <img src={r.user_avatar} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ color }}>{r.user_nick?.[0]}</div>
                    }
                  </div>
                  {equipSrc(rlv) && (
                    <img src={equipSrc(rlv)!} alt="" className="w-6 h-6 rounded object-cover shrink-0" />
                  )}
                  <span className="text-xs font-mono text-white/70 flex-1 truncate">{r.user_nick}</span>
                  <span className="text-xs font-mono text-white/30">第{r.person_lv}代</span>
                  <span className="text-xs font-mono text-cyan-400/70">{r.standard_sum}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </main>
  )
}
