'use client'
import { useState } from 'react'

const LV_NAMES = ['','碳基体','猿人','直立人','智人','原始人','自然人','农业人','封建人','工业人','社会人','契约人','加密客','基因体','半数人','算力体','硅基体','比特人','低熵体','全数人','元人','数字人']

interface Props {
  myLv: number
  myStandards: { s1: number; s2: number; s3: number; s4: number; sum: number }
  standards: number[]       // required % per level (21 items)
  rewards: any[][]          // [lvIndex][rewardIndex]
  rank: any[]
}

const STANDARD_LABELS = ['生物标准', '数字标准', '算力标准', '创作标准']

function ProgressBar({ value, label }: { value: number; label: string }) {
  const pct = Math.min(100, Math.max(0, value))
  const color = pct >= 80 ? '#22c55e' : pct >= 50 ? '#00ffe0' : pct >= 20 ? '#f59e0b' : '#ef4444'
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-mono text-white/40">{label}</span>
        <span className="text-xs font-mono font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 6px ${color}60` }} />
      </div>
    </div>
  )
}

export function DigitalPersonClient({ myLv, myStandards, standards, rewards, rank }: Props) {
  const [viewLv, setViewLv] = useState(myLv || 1)
  const [tab, setTab] = useState<'levels' | 'rank'>('levels')

  const lvRewards: any[] = rewards[viewLv - 1] ?? []
  const visibleRewards = lvRewards.filter((r: any) => r.type !== 0 && r.type !== '0')
  const reqPct = standards[viewLv - 1] ?? 0
  const isUnlocked = myLv >= viewLv
  const isCurrent = myLv === viewLv

  return (
    <div className="space-y-6">
      {/* My progress */}
      <div className="border border-white/10 rounded-xl p-5 bg-white/3">
        <div className="text-xs font-mono text-white/30 mb-4 flex items-center gap-2">
          <span>进化进度</span>
          <span className="text-white/15">·</span>
          <span className="text-cyan-400/60">综合 {myStandards.sum}%</span>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <ProgressBar value={myStandards.s1} label={STANDARD_LABELS[0]} />
          <ProgressBar value={myStandards.s2} label={STANDARD_LABELS[1]} />
          <ProgressBar value={myStandards.s3} label={STANDARD_LABELS[2]} />
          <ProgressBar value={myStandards.s4} label={STANDARD_LABELS[3]} />
        </div>
      </div>

      {/* Tab */}
      <div className="flex gap-1 border-b border-white/8 pb-1">
        {(['levels', 'rank'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`text-xs font-mono px-3 py-1.5 rounded transition-colors
              ${tab === t ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`}>
            {t === 'levels' ? '21代进化图' : `排行榜 (${rank.length})`}
          </button>
        ))}
      </div>

      {tab === 'levels' && (
        <div>
          {/* Level strip */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-5 scrollbar-none">
            {Array.from({ length: 21 }, (_, i) => i + 1).map(lv => {
              const unlocked = myLv >= lv
              const active = viewLv === lv
              return (
                <button key={lv} onClick={() => setViewLv(lv)}
                  className={`shrink-0 flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-all
                    ${active ? 'bg-cyan-500/20 border border-cyan-500/40' : unlocked ? 'border border-white/10 bg-white/3 hover:bg-white/8' : 'border border-white/5 opacity-40'}`}>
                  <img src={`/digital/person_equip${lv}.png`} alt=""
                    className="w-8 h-8 rounded object-cover" />
                  <span className={`text-xs font-mono ${active ? 'text-cyan-400' : unlocked ? 'text-white/50' : 'text-white/20'}`}>
                    {lv}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Level detail */}
          <div className="border border-white/10 rounded-xl overflow-hidden">
            <div className="flex gap-5 p-5" style={{ background: 'linear-gradient(135deg, rgba(0,255,224,0.04) 0%, rgba(0,0,0,0) 60%)' }}>
              <div className="w-24 h-24 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-black/30">
                <img src={`/digital/person_equip${viewLv}.png`} alt={LV_NAMES[viewLv]}
                  className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-bold font-mono text-white">第 {viewLv} 代</span>
                  {isCurrent && <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">当前</span>}
                  {!isUnlocked && <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/30 border border-white/10">未解锁</span>}
                </div>
                <div className="text-sm font-mono text-cyan-400 mb-2">{LV_NAMES[viewLv]}</div>
                <div className="text-xs font-mono text-white/30">
                  解锁条件：数字化达到 <span className="text-amber-400/80">{reqPct}%</span>
                </div>
                {isUnlocked && myStandards.sum < reqPct + 5 && (
                  <div className="mt-1.5 text-xs font-mono text-green-400/60">✓ 已解锁</div>
                )}
              </div>
            </div>

            {visibleRewards.length > 0 && (
              <div className="border-t border-white/8 p-4">
                <div className="text-xs font-mono text-white/25 mb-3">进化特权</div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {visibleRewards.map((r: any, i: number) => {
                    const imgSrc = r.img?.length > 0 ? r.img : `/digital/digital_person_detail_reward_icon${Math.min(r.type, 8)}.jpg`
                    return (
                      <div key={i} className="flex flex-col items-center gap-1.5">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 bg-black/20">
                          <img src={imgSrc} alt={r.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-mono text-white/50 text-center leading-tight line-clamp-2">{r.name}</span>
                        {r.is_received && <span className="text-green-400/60 text-xs">✓</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'rank' && rank.length > 0 && (
        <div className="space-y-1">
          {rank.slice(0, 50).map((r: any, i: number) => {
            const rlv = parseInt(r.person_lv ?? 0)
            const raceColors: Record<string, string> = {
              '1': '#f97316', '2': '#06b6d4', '3': '#a855f7',
              '4': '#22c55e', '5': '#eab308', '6': '#ef4444',
            }
            const color = raceColors[String(r.user_race)] ?? '#888'
            return (
              <div key={r.user_seq ?? i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <span className={`text-xs font-mono w-6 text-right shrink-0 ${i < 3 ? 'text-amber-400 font-bold' : 'text-white/20'}`}>{i + 1}</span>
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0" style={{ border: `1px solid ${color}40` }}>
                  {r.user_avatar
                    ? <img src={r.user_avatar} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ color }}>{r.user_nick?.[0]}</div>
                  }
                </div>
                {rlv > 0 && rlv <= 21 && (
                  <img src={`/digital/person_equip${rlv}.png`} alt="" className="w-6 h-6 rounded object-cover shrink-0" />
                )}
                <span className="text-xs font-mono text-white/70 flex-1 truncate">{r.user_nick}</span>
                <span className="text-xs font-mono text-white/30 shrink-0">第{rlv}代</span>
                <span className="text-xs font-mono text-cyan-400/70 w-12 text-right">{r.standard_sum}%</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
