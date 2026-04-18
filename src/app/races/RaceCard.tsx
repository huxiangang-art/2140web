'use client'

import { useState } from 'react'

type RaceStat = {
  id: string
  hashrate: number
  pct: number
  topMembers: any[]
}

type RaceData = {
  id: string
  name: string
  lore: string
  color: string
  txt: string
  explain: string
  hereName: string
  heroQuote: string
  heroDesc: string
  base: string
  baseDesc: string
}

function DebrisBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color, opacity: 0.8 }} />
    </div>
  )
}

export function RaceCard({ race, stat }: { race: RaceData; stat: RaceStat }) {
  const [expanded, setExpanded] = useState(false)
  const { color } = race

  return (
    <div className="rounded-xl overflow-hidden border border-white/10 bg-white/3"
      style={{ borderColor: expanded ? `${color}30` : undefined }}>
      <div className="h-0.5 w-full" style={{ backgroundColor: color }} />

      {/* Race image header */}
      <div className="relative h-32 overflow-hidden">
        <img src={`/racewar/race_img${race.id}.jpg`} alt={race.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 20%', filter: 'brightness(0.65)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.85) 100%)' }} />
        <div className="absolute bottom-3 left-4 right-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-lg font-bold font-mono" style={{ color }}>{race.name}</div>
              <div className="text-xs text-white/40 font-mono">{race.lore}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold font-mono text-white">
                {stat.hashrate.toLocaleString()}<span className="text-xs text-white/40 ml-1">H</span>
              </div>
              <div className="text-xs font-mono" style={{ color }}>{stat.pct.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Type tag + hashrate bar */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-mono px-2 py-0.5 rounded"
            style={{ color, backgroundColor: `${color}18`, border: `1px solid ${color}30` }}>
            {race.txt}
          </span>
        </div>
        <DebrisBar pct={stat.pct} color={color} />

        {/* Short desc */}
        <p className="text-xs text-white/50 leading-relaxed mt-3 mb-3 font-mono">{race.explain.slice(0, 80)}…</p>

        {/* Top members */}
        {stat.topMembers.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-white/25 font-mono mb-1.5">本轮顶端</div>
            <div className="space-y-1">
              {stat.topMembers.map((r: any) => (
                <div key={r.user_seq} className="flex justify-between text-xs font-mono">
                  <span className="text-white/55 truncate max-w-[130px]">{r.user_nickname}</span>
                  <span className="text-white/35">{Number(r.hashrate_sum).toLocaleString()} H</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expand toggle */}
        <button type="button" onClick={() => setExpanded(v => !v)}
          className="w-full text-xs font-mono py-1.5 rounded border transition-colors"
          style={{
            color: expanded ? color : 'rgba(255,255,255,0.3)',
            borderColor: expanded ? `${color}40` : 'rgba(255,255,255,0.08)',
            backgroundColor: expanded ? `${color}08` : 'transparent',
          }}>
          {expanded ? '收起详情 ↑' : '展开详情 ↓'}
        </button>

        {/* Expanded detail */}
        {expanded && (
          <div className="mt-4 space-y-5 border-t border-white/8 pt-4">
            {/* Full lore */}
            <div>
              <div className="text-xs font-mono text-white/25 mb-1.5">种族起源</div>
              <p className="text-xs font-mono text-white/60 leading-relaxed">{race.explain}</p>
            </div>

            {/* Hero */}
            <div className="flex gap-3">
              <div className="shrink-0 w-20 h-28 rounded-lg overflow-hidden border"
                style={{ borderColor: `${color}30` }}>
                <img src={`/racewar/race_role_img${race.id}.jpg`} alt={race.hereName}
                  className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono text-white/25 mb-1">传奇人物</div>
                <div className="text-xs font-mono font-bold mb-1.5 leading-snug" style={{ color }}>
                  {race.hereName}
                </div>
                <p className="text-xs font-mono text-white/50 leading-relaxed">{race.heroDesc.slice(0, 120)}…</p>
              </div>
            </div>

            {/* Base */}
            <div>
              <div className="text-xs font-mono text-white/25 mb-1.5">种族基地 · {race.base}</div>
              <p className="text-xs font-mono text-white/50 leading-relaxed">{race.baseDesc}</p>
            </div>

            {/* Groups image */}
            <div>
              <div className="text-xs font-mono text-white/25 mb-1.5">种族图鉴</div>
              <div className="rounded-lg overflow-hidden border border-white/8">
                <img src={`/racewar/race_groups_img${race.id}.jpg`} alt={`${race.name}图鉴`}
                  className="w-full object-cover" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
