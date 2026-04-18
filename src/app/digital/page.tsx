import { redirect } from 'next/navigation'
import { getLoggedIn, getUserCookie } from '@/lib/auth'
import { RACE_COLORS } from '@/lib/api2140'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const LV_NAMES = [
  '人', '碳基体', '猿人', '直立人', '智人', '原始人', '自然人',
  '农业人', '封建人', '工业人', '社会人', '契约人', '加密客',
  '基因体', '半数人', '算力体', '硅基体', '比特人', '低熵体',
  '全数人', '元人', '数字人',
]

const DIMENSIONS = [
  { key: 'standard1', label: '创世', color: '#a855f7' },
  { key: 'standard2', label: '荣誉', color: '#f59e0b' },
  { key: 'standard3', label: '权力', color: '#ef4444' },
  { key: 'standard4', label: '投资', color: '#22c55e' },
]

async function getDigitalData(cookie: string) {
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

export default async function DigitalPage() {
  const loggedIn = await getLoggedIn()
  if (!loggedIn) redirect('/login')

  const cookie = await getUserCookie()
  const data = await getDigitalData(cookie!)

  const personLv = data?.person_lv ?? 0
  const lvName = LV_NAMES[personLv] ?? '碳基体'
  const digitalSum = data?.standard_sum ?? 0

  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden flex flex-col items-center">

      {/* 背景 */}
      <div className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/digital-person/digital_person_top_bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }} />

      {/* 返回按钮 */}
      <Link href="/profile"
        className="absolute top-4 left-4 z-50 text-xs font-mono text-cyan-400/60 border border-cyan-500/20 px-3 py-1.5 rounded hover:border-cyan-500/50 hover:text-cyan-400 transition-colors">
        ← 返回档案
      </Link>

      {/* 动态文字 GIF */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 w-48 opacity-80">
        <img src="/digital-person/digital_person_top_txt.gif" alt="" className="w-full" />
      </div>

      {/* 角色层叠图 */}
      <div className="relative z-10 mt-24 w-64 h-auto flex items-center justify-center">
        {/* 动态光效 GIF 背景 */}
        <img src="/digital-person/digital_person_top_gif.gif" alt=""
          className="absolute inset-0 w-full h-full object-contain opacity-60 pointer-events-none" />

        {/* 装备层：1到personLv */}
        <div className="relative w-64 h-96">
          {Array.from({ length: 21 }, (_, i) => i + 1).map(n => (
            <img
              key={n}
              src={`/digital-person/person_equip${n}.png`}
              alt=""
              className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700
                ${n <= personLv ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
        </div>
      </div>

      {/* 等级文字 */}
      <div className="relative z-20 text-center mt-4">
        <div className="text-xs font-mono text-cyan-400/50 tracking-widest mb-1">DIGITAL EVOLUTION</div>
        <div className="text-2xl font-mono font-bold text-white">第 {personLv} 代</div>
        <div className="text-lg font-mono text-cyan-300 mt-0.5">{lvName}</div>
      </div>

      {/* 数字化总进度 */}
      <div className="relative z-20 w-72 mt-5 px-4">
        <div className="flex justify-between text-xs font-mono mb-1.5">
          <span className="text-white/40">数字化进度</span>
          <span className="text-cyan-400">{digitalSum}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
            style={{ width: `${Math.min(100, digitalSum)}%`, transition: 'width 1s ease' }} />
        </div>
        {/* 进化节点 */}
        <div className="flex justify-between mt-1">
          {[0, 25, 50, 75, 100].map(pct => (
            <span key={pct} className={`text-xs font-mono ${digitalSum >= pct ? 'text-cyan-400/60' : 'text-white/15'}`}>
              {pct}%
            </span>
          ))}
        </div>
      </div>

      {/* 四维指数 */}
      {data && (
        <div className="relative z-20 grid grid-cols-2 gap-3 w-72 mt-6 px-2">
          {DIMENSIONS.map(({ key, label, color }) => {
            const val = data[key] ?? 0
            return (
              <div key={key} className="rounded-lg p-3 border"
                style={{ borderColor: color + '30', backgroundColor: color + '08' }}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-mono text-white/50">{label}</span>
                  <span className="text-xs font-mono font-bold" style={{ color }}>{val}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, val)}%`, backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 21代进化路径 */}
      <div className="relative z-20 w-full max-w-xs mt-8 px-4 pb-12">
        <div className="text-xs font-mono text-white/25 text-center mb-3 tracking-widest">EVOLUTION PATH</div>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {LV_NAMES.slice(1).map((name, i) => {
            const lv = i + 1
            const isReached = lv <= personLv
            const isCurrent = lv === personLv
            return (
              <div key={lv}
                className={`text-xs font-mono px-2 py-0.5 rounded border transition-all ${
                  isCurrent
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-400/10 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                    : isReached
                    ? 'border-white/20 text-white/50'
                    : 'border-white/5 text-white/15'
                }`}>
                {lv === 21 ? '✦ ' : ''}{name}
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
