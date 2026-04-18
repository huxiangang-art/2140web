'use client'

import { useState } from 'react'

const RACE_COLORS: Record<string, string> = {
  '1': '#3b82f6', '2': '#f97316', '3': '#a855f7',
  '4': '#22c55e', '5': '#06b6d4', '6': '#6b7280',
}

type Debris = { seq: string; name: string; health: number; error_status: string; intensity: number }
type MainMap = { seq: string; lv: string; name: string; is_unlock: string; debriss: Debris[] }
type BranchMap = { seq: string; name: string; health: number; debriss: Debris[] }
type Tasks = Record<string, { lv: string }>

// Fixed positions for 9 main civilizations on a 800x560 canvas
const MAIN_POSITIONS: Record<string, { x: number; y: number }> = {
  '1': { x: 120, y: 480 },  // 春蚕文明 Lv1 - bottom left, mysterious
  '2': { x: 380, y: 490 },  // 地球文明 Lv2
  '3': { x: 580, y: 420 },  // 火星文明 Lv3
  '4': { x: 220, y: 370 },  // 六域文明 Lv4
  '5': { x: 460, y: 300 },  // 虫洞文明 Lv5 - current active
  '6': { x: 650, y: 240 },  // 节点文明 Lv6
  '7': { x: 280, y: 210 },  // 三秒文明 Lv7
  '8': { x: 510, y: 140 },  // 泰坦文明 Lv8
  '9': { x: 150, y: 100 },  // 量子文明 Lv9 - top
}

// Branch map positions (outside main cluster)
const BRANCH_POSITIONS: Record<string, { x: number; y: number }> = {
  '10001': { x: 700, y: 490 },
  '10002': { x: 50,  y: 280 },
  '10003': { x: 720, y: 340 },
  '10004': { x: 350, y: 120 },
}

// Civilization color theme by level
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
    <div className="w-full bg-white/10 rounded-full h-0.5 overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
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

  // Determine currently active lv (highest unlocked)
  const activeLv = Math.max(...mainMaps.filter(m => m.is_unlock === '1').map(m => parseInt(m.lv))).toString()

  // Which race is at which lv (from tasks)
  const raceAtLv: Record<string, string[]> = {}
  Object.entries(tasks).forEach(([raceId, t]) => {
    if (!raceAtLv[t.lv]) raceAtLv[t.lv] = []
    raceAtLv[t.lv].push(raceId)
  })

  const selectedMain = mainMaps.find(m => m.seq === selected)
  const selectedBranch = branchMaps.find(m => m.seq === selected)

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-white/10"
      style={{ background: '#000', aspectRatio: '800/560' }}>

      {/* Background */}
      <img src="/racewar/space.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.6) 100%)' }} />

      {/* SVG: connection lines between adjacent main maps */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 560" preserveAspectRatio="xMidYMid meet">
        {/* Main path: Lv2→3→4→5→6→7→8→9 */}
        {(['2','3','4','5','6','7','8','9'] as const).map((lv, i) => {
          const from = MAIN_POSITIONS[String(parseInt(lv) - 1 < 2 ? lv : parseInt(lv) - 1)]
          const to = MAIN_POSITIONS[lv]
          const fromM = mainMaps.find(m => m.lv === String(parseInt(lv) - 1))
          const unlocked = fromM?.is_unlock === '1'
          return (
            <line key={lv}
              x1={MAIN_POSITIONS[String(parseInt(lv) - 1)]?.x} y1={MAIN_POSITIONS[String(parseInt(lv) - 1)]?.y}
              x2={to.x} y2={to.y}
              stroke={unlocked ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)'}
              strokeWidth="1" strokeDasharray={unlocked ? 'none' : '4 4'} />
          )
        })}
        {/* Branch map dashed lines to nearest main map */}
        {branchMaps.map(b => {
          const bp = BRANCH_POSITIONS[b.seq]
          const nearest = MAIN_POSITIONS['5']
          if (!bp) return null
          return (
            <line key={b.seq}
              x1={bp.x} y1={bp.y} x2={nearest.x} y2={nearest.y}
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
          <button key={m.seq}
            onClick={() => setSelected(isSel ? null : m.seq)}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group"
            style={{ left: `${(pos.x / 800) * 100}%`, top: `${(pos.y / 560) * 100}%` }}>

            {/* Node circle */}
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

            {/* Name */}
            <div className={`text-center font-mono leading-tight whitespace-nowrap
              ${locked ? 'text-white/20' : isActive ? 'text-white/90' : 'text-white/55'}
              ${locked ? 'text-xs' : 'text-xs'}`}
              style={{ fontSize: locked ? 9 : 10 }}>
              {m.name}
            </div>

            {/* Race dots */}
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
          <button key={b.seq}
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

      {/* Detail panel */}
      {(selectedMain || selectedBranch) && (
        <div className="absolute bottom-3 left-3 right-3 rounded-lg border border-white/15 overflow-hidden"
          style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)' }}>
          {selectedMain && (() => {
            const color = LV_COLORS[selectedMain.lv] ?? '#888'
            const coverSrc = `/racewar/racewar_map_select_map_cover${selectedMain.lv}.jpg`
            return (
              <div className="flex gap-0">
                {/* Cover image */}
                <div className="relative shrink-0 w-24 overflow-hidden" style={{ minHeight: 80 }}>
                  <img src={coverSrc} alt={selectedMain.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ filter: selectedMain.is_unlock !== '1' ? 'grayscale(1) brightness(0.4)' : 'brightness(0.85)' }} />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to right, transparent 60%, rgba(0,0,0,0.88) 100%)` }} />
                  <div className="absolute bottom-1.5 left-1.5">
                    <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded"
                      style={{ color, backgroundColor: `${color}22`, border: `1px solid ${color}40` }}>
                      Lv.{selectedMain.lv}
                    </span>
                  </div>
                </div>
                {/* Info */}
                <div className="flex-1 p-3 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-mono font-bold text-white">{selectedMain.name}</span>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                      selectedMain.is_unlock === '1' ? 'text-green-400 bg-green-500/10' : 'text-white/20 bg-white/5'
                    }`}>
                      {selectedMain.is_unlock === '1' ? '已解锁' : '未解锁'}
                    </span>
                  </div>
                  {selectedMain.debriss.length > 0 ? (
                    <div className="grid grid-cols-3 gap-x-3 gap-y-1.5">
                      {selectedMain.debriss.map(d => (
                        <div key={d.seq} className="text-xs font-mono">
                          <div className="text-white/45 mb-0.5 truncate">{d.name}</div>
                          <DebrisBar health={d.health} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs font-mono text-white/20">暂无碎片数据</div>
                  )}
                </div>
              </div>
            )
          })()}
          {selectedBranch && (() => {
            const isDead = selectedBranch.health <= 0
            const color = isDead ? '#ef4444' : '#22d3ee'
            return (
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono font-bold text-white">{selectedBranch.name}</span>
                  <span className="text-xs font-mono" style={{ color }}>
                    {isDead ? '已陷落' : `HP ${selectedBranch.health}`}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {selectedBranch.debriss.map(d => (
                    <div key={d.seq} className="text-xs font-mono">
                      <div className="text-white/50 mb-1 truncate">{d.name}</div>
                      <DebrisBar health={d.health} />
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5 text-xs font-mono">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" /><span className="text-white/40">当前战线</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded border border-cyan-400/60 rotate-45" /><span className="text-white/40">支线星域</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-white/15" /><span className="text-white/40">未解锁</span></div>
      </div>
    </div>
  )
}
