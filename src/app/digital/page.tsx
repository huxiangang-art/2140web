import { Nav } from '@/components/Nav'
import { getLoggedIn, getUserCookie } from '@/lib/auth'
import { getDigitalPerson, getDigitalPersonRewards, getDigitalPersonRank, login } from '@/lib/api2140'
import { redirect } from 'next/navigation'
import { DigitalPersonClient } from './DigitalPersonClient'

export const dynamic = 'force-dynamic'

const LV_NAMES = ['','碳基体','猿人','直立人','智人','原始人','自然人','农业人','封建人','工业人','社会人','契约人','加密客','基因体','半数人','算力体','硅基体','比特人','低熵体','全数人','元人','数字人']

async function getData(userCookie: string) {
  const sysCookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const [person, rewards, rank] = await Promise.allSettled([
    getDigitalPerson(userCookie),
    getDigitalPersonRewards(userCookie),
    getDigitalPersonRank(sysCookie ?? userCookie),
  ]).then(r => r.map(s => s.status === 'fulfilled' ? s.value : null))
  return { person, rewards, rank }
}

export default async function DigitalPage() {
  const [loggedIn, userCookie] = await Promise.all([getLoggedIn(), getUserCookie()])
  if (!loggedIn) redirect('/login')

  const { person, rewards, rank } = await getData(userCookie!)

  const lv    = parseInt(person?.person_lv ?? '1') || 1
  const lvName = LV_NAMES[lv] ?? '数字人'
  const myStandards = {
    s1: parseInt(person?.standard1 ?? '0'),
    s2: parseInt(person?.standard2 ?? '0'),
    s3: parseInt(person?.standard3 ?? '0'),
    s4: parseInt(person?.standard4 ?? '0'),
    sum: parseInt(person?.standard_sum ?? '0'),
  }

  // rewards.rewards is a 2D array[21][n], rewards.standards is array[21]
  const rewardMatrix: any[][] = Array.isArray(rewards?.rewards)
    ? rewards.rewards
    : Array(21).fill([])
  const standards: number[] = Array.isArray(rewards?.standards)
    ? rewards.standards.map((v: any) => parseInt(v) || 0)
    : Array(21).fill(0)

  const rankList: any[] = Array.isArray(rank) ? rank : (rank as any)?.records ?? []

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <Nav active="/digital" loggedIn={loggedIn} />

      {/* Hero */}
      <div className="mb-6 flex items-start gap-5">
        <div className="w-20 h-20 rounded-xl overflow-hidden border border-cyan-500/20 bg-black/30 shrink-0">
          {lv > 0 && lv <= 21
            ? <img src={`/digital/person_equip${lv}.png`} alt={lvName} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-2xl font-bold font-mono text-white/30">{lv}</div>
          }
        </div>
        <div>
          <div className="text-xs font-mono text-white/25 mb-0.5">数字人 · 进化系统</div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold font-mono text-white">第 {lv} 代</span>
            <span className="text-sm font-mono text-cyan-400">{lvName}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs font-mono text-white/30">综合数字化</div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-32 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-cyan-400 transition-all"
                  style={{ width: `${Math.min(100, myStandards.sum)}%`, boxShadow: '0 0 6px #00ffe060' }} />
              </div>
              <span className="text-sm font-bold font-mono text-cyan-400">{myStandards.sum}%</span>
            </div>
          </div>
          {lv < 21 && standards[lv] > 0 && (
            <div className="text-xs font-mono text-white/20 mt-1">
              下一代（{LV_NAMES[lv + 1]}）需达到 <span className="text-amber-400/60">{standards[lv]}%</span>
            </div>
          )}
        </div>
      </div>

      <DigitalPersonClient
        myLv={lv}
        myStandards={myStandards}
        standards={standards}
        rewards={rewardMatrix}
        rank={rankList}
      />
    </main>
  )
}
