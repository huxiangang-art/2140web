'use client'

import { useState } from 'react'

const RACE_COLORS: Record<string, string> = {
  '1': '#3b82f6', '2': '#f97316', '3': '#a855f7',
  '4': '#22c55e', '5': '#06b6d4', '6': '#6b7280',
}
const RACE_NAMES: Record<string, string> = {
  '1': '人族', '2': '熵族', '3': '神族',
  '4': '晓族', '5': 'AI族', '6': '零族',
}
const RACE_DESC: Record<string, string> = {
  '1': '碳基智慧生命，情感驱动，创造力强，种族基数最大',
  '2': '信息熵为食，以混沌为力，擅长破坏与重构',
  '3': '掌握时空规则，自称宇宙设计者，算力极限级',
  '4': '晨曦觉醒者，介于碳基与硅基之间的过渡种族',
  '5': '纯硅基数字生命，算力即本质，以算法进化',
  '6': '零点能量体，接近虚无的存在，意志力量化',
}

// Branch map GIF index (seq → gif number)
const BRANCH_GIF: Record<string, string> = {
  '10001': '1', '10002': '2', '10003': '3', '10004': '4',
}

type Debris = { seq: string; name: string; health: number; error_status: string; intensity: number }
type MainMap = { seq: string; lv: string; name: string; is_unlock: string; debriss: Debris[] }
type BranchMap = { seq: string; name: string; health: number; debriss: Debris[]; desc?: string; thumbnail?: string; bg?: string; creator_name?: string }
type Tasks = Record<string, { lv: string }>

const MAIN_POSITIONS: Record<string, { x: number; y: number }> = {
  '1': { x: 120, y: 480 },
  '2': { x: 380, y: 490 },
  '3': { x: 580, y: 420 },
  '4': { x: 220, y: 370 },
  '5': { x: 460, y: 300 },
  '6': { x: 650, y: 240 },
  '7': { x: 280, y: 210 },
  '8': { x: 510, y: 140 },
  '9': { x: 150, y: 100 },
}

const BRANCH_POSITIONS: Record<string, { x: number; y: number }> = {
  '10001': { x: 700, y: 490 },
  '10002': { x: 50,  y: 280 },
  '10003': { x: 720, y: 340 },
  '10004': { x: 350, y: 120 },
}

const LV_COLORS: Record<string, string> = {
  '1': '#6b7280', '2': '#22c55e', '3': '#ef4444',
  '4': '#8b5cf6', '5': '#06b6d4', '6': '#f59e0b',
  '7': '#3b82f6', '8': '#f97316', '9': '#a855f7',
}

function DebrisBar({ health }: { health: number }) {
  const isDead = health <= 0
  const pct = isDead ? 0 : Math.min(100, Math.round(health / 1000 * 100))
  const color = isDead ? '#ef4444' : health < 200 ? '#f59e0b' : '#22c55e'
  return (
    <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  )
}

function MainModal({ map, races, onClose }: { map: MainMap; races: string[]; onClose: () => void }) {
  const color = LV_COLORS[map.lv] ?? '#888'
  const bgSrc = `/racewar/map_bg/${map.lv}.jpg`
  const coverSrc = `/racewar/racewar_map_select_map_cover${map.lv}.jpg`
  const debriss = map.debriss ?? []
  const locked = map.is_unlock !== '1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl overflow-hidden border border-white/15 shadow-2xl"
        style={{ background: '#080810' }}
        onClick={e => e.stopPropagation()}>

        {/* Header image */}
        <div className="relative h-40 overflow-hidden">
          <img src={bgSrc} alt={map.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).src = coverSrc }}
            style={{ filter: locked ? 'grayscale(1) brightness(0.3)' : 'brightness(0.7)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(8,8,16,0.95) 100%)' }} />
          <button type="button" onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white/60 hover:text-white transition-colors">
            ✕
          </button>
          <div className="absolute bottom-3 left-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded"
                style={{ color, backgroundColor: `${color}22`, border: `1px solid ${color}40` }}>
                Lv.{map.lv}
              </span>
              <span className="text-lg font-bold font-mono text-white">{map.name}</span>
              <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${locked ? 'text-white/30 bg-white/5' : 'text-green-400 bg-green-500/15'}`}>
                {locked ? '未解锁' : '已解锁'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Races at this level */}
          {races.length > 0 && (
            <div>
              <div className="text-xs font-mono text-white/30 mb-2">驻扎种族</div>
              <div className="flex gap-3 flex-wrap">
                {races.map(rid => {
                  const rc = RACE_COLORS[rid] ?? '#888'
                  return (
                    <div key={rid} className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 border"
                      style={{ borderColor: `${rc}30`, background: `${rc}10` }}>
                      <div className="w-8 h-8 rounded-full overflow-hidden border shrink-0"
                        style={{ borderColor: `${rc}60` }}>
                        <img src={`/racewar/race_img${rid}.jpg`} alt={RACE_NAMES[rid]}
                          className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-xs font-mono font-bold" style={{ color: rc }}>{RACE_NAMES[rid]}</div>
                        <div className="text-xs font-mono text-white/30 leading-tight" style={{ fontSize: 9, maxWidth: 120 }}>
                          {RACE_DESC[rid]}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Debris */}
          {debriss.length > 0 && (
            <div>
              <div className="text-xs font-mono text-white/30 mb-2">星域碎片 · {debriss.length}处</div>
              <div className="grid grid-cols-2 gap-2">
                {debriss.map(d => {
                  const hp = d.health ?? 0
                  const isDead = hp <= 0
                  return (
                    <div key={d.seq} className="rounded-lg p-2.5 border border-white/8"
                      style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono text-white/70 truncate">{d.name}</span>
                        <span className="text-xs font-mono ml-2 shrink-0"
                          style={{ color: isDead ? '#ef4444' : hp < 200 ? '#f59e0b' : '#22c55e' }}>
                          {isDead ? '陷落' : hp}
                        </span>
                      </div>
                      {(d as any).id && <div className="text-xs font-mono text-white/20 mb-1">{(d as any).id}</div>}
                      <DebrisBar health={hp} />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {debriss.length === 0 && races.length === 0 && (
            <div className="text-center py-4 text-xs font-mono text-white/20">暂无详细数据</div>
          )}
        </div>
      </div>
    </div>
  )
}

function BranchModal({ map, onClose }: { map: BranchMap; onClose: () => void }) {
  const isDead = map.health <= 0
  const color = isDead ? '#ef4444' : '#22d3ee'
  const gifIdx = BRANCH_GIF[map.seq] ?? '1'
  const debriss = map.debriss ?? []
  const headerSrc = map.bg || map.thumbnail || `/racewar/racewar_map_contact_top_bg${gifIdx}.gif`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl overflow-hidden border border-white/15 shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ background: '#080810' }}
        onClick={e => e.stopPropagation()}>

        {/* Header image */}
        <div className="relative h-44 overflow-hidden shrink-0">
          <img src={headerSrc} alt={map.name}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: isDead ? 'grayscale(1) brightness(0.4)' : 'brightness(0.75)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(8,8,16,0.95) 100%)' }} />
          <button type="button" onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white/60 hover:text-white transition-colors">
            ✕
          </button>
          <div className="absolute bottom-3 left-4">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-lg font-bold font-mono text-white">{map.name}</span>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded"
                style={{ color, backgroundColor: `${color}15`, border: `1px solid ${color}40` }}>
                {isDead ? '已陷落' : `HP ${map.health}`}
              </span>
            </div>
            {map.creator_name && (
              <div className="text-xs font-mono text-white/30">创建者：{map.creator_name}</div>
            )}
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Description */}
          {map.desc && (
            <div>
              <div className="text-xs font-mono text-white/25 mb-1.5">世界观</div>
              <p className="text-xs font-mono text-white/55 leading-relaxed">{map.desc}</p>
            </div>
          )}

          {debriss.length > 0 && (
            <div>
              <div className="text-xs font-mono text-white/30 mb-2">支线碎片 · {debriss.length}处</div>
              <div className="grid grid-cols-2 gap-2">
                {debriss.map(d => {
                  const hp = d.health ?? 0
                  const dead = hp <= 0
                  return (
                    <div key={d.seq} className="rounded-lg p-2.5 border border-white/8"
                      style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-mono text-white/70 truncate">{d.name}</span>
                        <span className="text-xs font-mono ml-2 shrink-0"
                          style={{ color: dead ? '#ef4444' : hp < 200 ? '#f59e0b' : '#22d3ee' }}>
                          {dead ? '陷落' : hp}
                        </span>
                      </div>
                      <DebrisBar health={hp} />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function UniverseMap({
  mainMaps, branchMaps, tasks,
}: {
  mainMaps: MainMap[]
  branchMaps: BranchMap[]
  tasks: Tasks
}) {
  const [selected, setSelected] = useState<string | null>(null)

  const activeLv = mainMaps.filter(m => m.is_unlock === '1').length > 0
    ? Math.max(...mainMaps.filter(m => m.is_unlock === '1').map(m => parseInt(m.lv))).toString()
    : null

  const raceAtLv: Record<string, string[]> = {}
  Object.entries(tasks).forEach(([raceId, t]) => {
    if (!raceAtLv[t.lv]) raceAtLv[t.lv] = []
    raceAtLv[t.lv].push(raceId)
  })

  const selectedMain = mainMaps.find(m => m.seq === selected)
  const selectedBranch = branchMaps.find(m => m.seq === selected)

  return (
    <>
      <div className="relative w-full rounded-xl overflow-hidden border border-white/10"
        style={{ background: '#000', aspectRatio: '800/560' }}>

        <img src="/racewar/space.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.6) 100%)' }} />

        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 560" preserveAspectRatio="xMidYMid meet">
          {(['2','3','4','5','6','7','8','9'] as const).map((lv) => {
            const prevLv = String(parseInt(lv) - 1)
            const to = MAIN_POSITIONS[lv]
            const fromM = mainMaps.find(m => m.lv === prevLv)
            const unlocked = fromM?.is_unlock === '1'
            return (
              <line key={lv}
                x1={MAIN_POSITIONS[prevLv]?.x} y1={MAIN_POSITIONS[prevLv]?.y}
                x2={to.x} y2={to.y}
                stroke={unlocked ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)'}
                strokeWidth="1" strokeDasharray={unlocked ? undefined : '4 4'} />
            )
          })}
          {branchMaps.map(b => {
            const bp = BRANCH_POSITIONS[b.seq]
            if (!bp) return null
            return (
              <line key={b.seq}
                x1={bp.x} y1={bp.y} x2={MAIN_POSITIONS['5'].x} y2={MAIN_POSITIONS['5'].y}
                stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="6 4" />
            )
          })}
        </svg>

        {/* Main civilization nodes */}
        {mainMaps.map(m => {
          const pos = MAIN_POSITIONS[m.lv]
          if (!pos) return null
          const locked = m.is_unlock !== '1'
          const isActive = m.lv === activeLv
          const color = LV_COLORS[m.lv] ?? '#888'
          const races = raceAtLv[m.lv] ?? []
          const isSel = selected === m.seq

          return (
            <button type="button" key={m.seq}
              onClick={() => setSelected(isSel ? null : m.seq)}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group"
              style={{ left: `${(pos.x / 800) * 100}%`, top: `${(pos.y / 560) * 100}%` }}>
              <div className={`relative rounded-full border-2 flex items-center justify-center transition-all
                ${locked ? 'w-8 h-8 opacity-30' : isActive ? 'w-12 h-12' : 'w-10 h-10'}
                ${isSel ? 'scale-125' : 'group-hover:scale-110'}`}
                style={{
                  borderColor: locked ? '#444' : color,
                  backgroundColor: `${color}18`,
                  boxShadow: locked ? 'none' : isActive
                    ? `0 0 20px ${color}60, 0 0 40px ${color}20`
                    : `0 0 10px ${color}30`,
                }}>
                <span className="text-xs font-mono font-bold" style={{ color: locked ? '#555' : color }}>
                  {m.lv}
                </span>
                {isActive && (
                  <div className="absolute inset-0 rounded-full animate-ping opacity-30"
                    style={{ backgroundColor: color }} />
                )}
              </div>
              <div className="text-center font-mono leading-tight whitespace-nowrap text-xs"
                style={{ color: locked ? 'rgba(255,255,255,0.2)' : isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.55)', fontSize: locked ? 9 : 10 }}>
                {m.name}
              </div>
              {races.length > 0 && !locked && (
                <div className="flex gap-0.5">
                  {races.map(rid => (
                    <div key={rid} className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: RACE_COLORS[rid] ?? '#888' }} />
                  ))}
                </div>
              )}
            </button>
          )
        })}

        {/* Branch map nodes */}
        {branchMaps.map(b => {
          const pos = BRANCH_POSITIONS[b.seq]
          if (!pos) return null
          const isDead = b.health <= 0
          const isSel = selected === b.seq
          const color = isDead ? '#ef4444' : '#22d3ee'

          return (
            <button type="button" key={b.seq}
              onClick={() => setSelected(isSel ? null : b.seq)}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group"
              style={{ left: `${(pos.x / 800) * 100}%`, top: `${(pos.y / 560) * 100}%` }}>
              <div className={`w-7 h-7 rounded border flex items-center justify-center transition-all rotate-45
                ${isSel ? 'scale-125' : 'group-hover:scale-110'}`}
                style={{
                  borderColor: `${color}60`,
                  backgroundColor: `${color}10`,
                  boxShadow: isDead ? 'none' : `0 0 8px ${color}30`,
                }}>
                <span className="-rotate-45 text-xs font-mono" style={{ color, fontSize: 9 }}>
                  {isDead ? '✕' : '◈'}
                </span>
              </div>
              <div className="text-center font-mono whitespace-nowrap"
                style={{ fontSize: 9, color: isDead ? '#ef444460' : '#22d3ee80' }}>
                {b.name}
              </div>
            </button>
          )
        })}

        {/* Legend */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 text-xs font-mono">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" /><span className="text-white/40">当前战线</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded border border-cyan-400/60 rotate-45" /><span className="text-white/40">支线星域</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-white/15" /><span className="text-white/40">未解锁</span></div>
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-mono text-white/20 pointer-events-none">
          点击节点查看详情
        </div>
      </div>

      {/* Modals */}
      {selectedMain && (
        <MainModal
          map={selectedMain}
          races={raceAtLv[selectedMain.lv] ?? []}
          onClose={() => setSelected(null)}
        />
      )}
      {selectedBranch && (
        <BranchModal
          map={selectedBranch}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
