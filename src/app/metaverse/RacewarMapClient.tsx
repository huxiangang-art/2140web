'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { RACE_NAMES } from '@/lib/api2140'
import { filterDebrisByStatus, getBranchRisk, getDebrisStatus } from '@/lib/racewar-status'
import { CenteredRacewarScroll } from './CenteredRacewarScroll'

const filters = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '战斗' },
  { key: 'warning', label: '灾变' },
  { key: 'locked', label: '锁定' },
  { key: 'boss', label: 'Boss' },
]

export function RacewarMapClient({
  initialMode = 'main',
  mapName,
  mapBg,
  markers,
  branchMaps = [],
}: {
  initialMode?: 'main' | 'branch'
  mapName: string
  mapBg: string
  markers: any[]
  branchMaps?: any[]
}) {
  const [mode, setMode] = useState<'main' | 'branch'>(initialMode)
  const [filter, setFilter] = useState('all')
  const [toolsOpen, setToolsOpen] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const visible = useMemo(() => {
    const source = filterDebrisByStatus(markers, filter)
    return source
  }, [markers, filter])
  const branchNodes = useMemo(() => branchMaps.map((branch, index) => ({
    ...branch,
    position: branch.position ?? [`${28 + (index % 3) * 22}%`, `${32 + Math.floor(index / 3) * 17}%`],
  })), [branchMaps])

  return (
    <div className="relative h-full overflow-hidden bg-black">
      <CenteredRacewarScroll>
        <div className="relative h-full min-w-[420%] bg-black" style={{ width: 'max(240vh, 420%)', maxWidth: 'none' }}>
          <img src={mapBg} alt="" className="absolute inset-0 h-full w-full object-fill" draggable={false} />
          <div className="absolute inset-0 bg-black/10" />
          {mode === 'main' && visible.map((debris, index) => (
            <button
              key={debris.seq ?? `${debris.name}-${index}`}
              type="button"
              onClick={() => setSelected(debris)}
              style={{ left: debris.position?.[0] ?? '50%', top: debris.position?.[1] ?? '50%' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
            >
              <WorldMarker debris={debris} />
            </button>
          ))}
          {mode === 'branch' && branchNodes.map((branch, index) => (
            <Link
              key={branch.seq ?? index}
              href={`/metaverse/worlds/branch/${branch.seq}`}
              style={{ left: branch.position?.[0] ?? '50%', top: branch.position?.[1] ?? '50%' }}
              className="absolute w-40 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-cyan-300/25 bg-black/72 p-3 text-center shadow-[0_0_16px_rgba(34,211,238,0.16)] rw-node-pulse"
            >
              <div className="truncate text-sm font-mono text-cyan-100">{branch.name}</div>
              <div className="mt-1 text-xs font-mono text-white/35">Lv.{branch.lv ?? '-'}</div>
              <div className={`mt-2 rounded border px-2 py-0.5 text-xs font-mono ${getBranchRisk(branch.health).className}`}>{getBranchRisk(branch.health).label}</div>
            </Link>
          ))}
        </div>
      </CenteredRacewarScroll>

      <div className="absolute left-0 right-0 top-0 h-0">
        <IconDock href="/" label="返回首页" iconClass="rw-return" edge="left" />
        <button type="button" onClick={() => setToolsOpen(true)} aria-label="搜索" className="absolute right-1 top-1 flex h-8 w-10 items-center justify-center rounded-bl-2xl rounded-tl-md rounded-br-md bg-black/45">
          <CornerSpriteIcon iconClass="rw-search" />
        </button>
        <div
          className="absolute left-1/2 top-[-2px] flex h-[clamp(25px,5vw,31px)] w-[36%] -translate-x-1/2 items-center justify-center bg-[length:100%_100%] bg-center bg-no-repeat px-2"
          style={{ backgroundImage: "url('/racewar/racewar_map_name_bg.png')" }}
        >
          <div className="truncate whitespace-nowrap text-[clamp(15px,3.8vw,20px)] font-mono font-bold text-white">{mode === 'branch' ? `${String(mapName).replace('文明', '')}·支线` : `${String(mapName).replace('文明', '')}·主线`}</div>
        </div>
      </div>

      {mode === 'branch' && (
        <button type="button" onClick={() => setMode('main')} className="absolute left-4 top-[10.5%] rounded border border-cyan-300/30 bg-black/62 px-3 py-1.5 text-xs font-mono text-cyan-100/75">
          前往主线
        </button>
      )}

      {toolsOpen && (
        <div className="absolute left-4 right-4 top-[10%] z-20 rounded-lg border border-cyan-300/25 bg-black/88 p-3 shadow-[0_0_24px_rgba(34,211,238,0.16)]">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-mono text-cyan-100/70">地图筛选</span>
            <button type="button" onClick={() => setToolsOpen(false)} className="rounded border border-white/10 px-2 py-1 text-xs font-mono text-white/45">关闭</button>
          </div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            <button type="button" onClick={() => setMode(mode === 'main' ? 'branch' : 'main')} className="rounded border border-cyan-300/45 bg-cyan-300/15 px-2 py-1 text-xs font-mono text-cyan-100">
              {mode === 'main' ? '主线' : '支线'}
            </button>
            {filters.map(item => (
              <button key={item.key} type="button" onClick={() => setFilter(item.key)} className={`rounded border px-2 py-1 text-xs font-mono ${filter === item.key ? 'border-cyan-300/45 bg-cyan-300/15 text-cyan-100' : 'border-white/10 bg-black/45 text-white/45'}`}>
                {item.label}
              </button>
            ))}
          </div>
          <Legend />
        </div>
      )}

      <Link href="/metaverse/agent/branch" className="absolute left-[16%] top-4 flex -translate-x-1/2 flex-col items-center text-cyan-300">
        <ScaledSpriteIcon iconClass="rw-icon-create" size="sm" />
        <span className="mt-0 rounded bg-black/45 px-1 text-[10px] font-mono text-white">{mode === 'branch' ? '创建基地' : '创建文明'}</span>
      </Link>

      <Link href="/metaverse/worlds" className="absolute right-[13%] top-4 flex translate-x-1/2 flex-col items-center text-cyan-300">
        <ScaledSpriteIcon iconClass="rw-icon-switch" size="sm" />
        <span className="mt-0 rounded bg-black/45 px-1 text-[10px] font-mono text-white">切换文明</span>
      </Link>

      <div className="absolute right-0 top-[27%] rounded-l-2xl border-y border-l border-cyan-300/25 bg-black/65 px-1.5 py-3 shadow-[0_0_18px_rgba(34,211,238,0.16)]">
        <SideButton href="/metaverse/contribution" label="创世榜" iconClass="rw-icon-genesis" />
        <SideButton href="/metaverse/war/ranks" label="地票榜" iconClass="rw-icon-ticket" />
        <SideButton href="/plaza" label="广场" iconClass="rw-icon-plaza" />
      </div>

      {selected && <QuickPanel debris={selected} onClose={() => setSelected(null)} />}

      <div className="absolute bottom-[13%] left-1/2 -translate-x-1/2 rounded bg-red-700 px-3 py-1.5 text-center text-xs font-mono text-white shadow-lg">
        完成新人任务领取福利!
        <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[12px] border-t-[14px] border-x-transparent border-t-red-700" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 grid grid-cols-[64px_1fr_64px] items-end gap-1 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-2 pb-2 pt-8">
        <button type="button" onClick={() => setMode('branch')} className="flex w-16 flex-col items-center text-cyan-300">
          <ScaledSpriteIcon iconClass="rw-icon-branch" size="large" />
          <span className="-mt-1 rounded border border-cyan-300 bg-black/60 px-1 py-0.5 text-[10px] font-mono text-white">前往支线</span>
        </button>
        <div className="flex min-w-0 items-end justify-center gap-1 rounded-t-2xl bg-black/62 px-1 py-1.5">
          <BottomPillar href="/metaverse/war/reports" label="战况" iconClass="rw-icon-situation" />
          <BottomPillar href="/metaverse/quests" label="任务" iconClass="rw-icon-task" />
          <BottomPillar href="/prop/backpack" label="道具" iconClass="rw-icon-prop" />
        </div>
        <BottomPillar href="/metaverse/war" label="战斗中" iconClass="rw-icon-fighting" prominent />
      </div>
    </div>
  )
}

function Legend() {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {[
        ['战斗', 'bg-red-400'],
        ['灾变', 'bg-amber-300'],
        ['锁定', 'bg-white/35'],
        ['Boss', 'bg-fuchsia-300'],
      ].map(([label, cls]) => (
        <div key={label} className="flex items-center gap-2 rounded border border-white/8 bg-white/[0.025] px-2 py-1">
          <span className={`h-2 w-2 rounded-full ${cls}`} />
          <span className="text-xs font-mono text-white/45">{label}</span>
        </div>
      ))}
    </div>
  )
}

function WorldMarker({ debris }: { debris: any }) {
  const status = getDebrisStatus(debris.error_status)
  return (
    <div className={`rw-debris ${status.tone === 'active' || status.tone === 'warning' ? 'rw-node-pulse' : ''}`}>
      <div className="rw-debris-id">{debris.id ?? `V - ${debris.lv ?? '-'}`}</div>
      <div className="rw-debris-name">{debris.name ?? '未知基地'}</div>
      <div className="rw-debris-race">{raceShortName(debris.race_seq)}</div>
      <div className="rw-debris-labels">
        {Number(debris.is_boss) === 1 && <span className="rw-debris-label rw-debris-boss" />}
        {status.code === '101' && <span className="rw-debris-label rw-debris-lock" />}
        {status.code === '102' && <span className="rw-debris-label rw-debris-freeze" />}
        {status.code === '1' && <span className="rw-debris-label rw-debris-unlock" />}
        {status.code === '11' && <span className="rw-debris-label rw-debris-disaster" />}
        {Boolean(debris.is_boss_dst) && <span className="rw-debris-boss-dst" />}
      </div>
    </div>
  )
}

function QuickPanel({ debris, onClose }: { debris: any; onClose: () => void }) {
  const status = getDebrisStatus(debris.error_status)
  return (
    <div className="absolute bottom-[26%] left-4 right-4 rounded-lg border border-cyan-300/25 bg-black/86 p-4 shadow-[0_0_24px_rgba(34,211,238,0.18)]">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-base font-mono font-bold text-white">{debris.name ?? '未知基地'}</div>
          <div className="mt-1 text-xs font-mono text-white/35">{debris.id ?? `V - ${debris.lv ?? '-'}`} · {status.label}</div>
        </div>
        <button type="button" onClick={onClose} className="rounded border border-white/10 px-2 py-1 text-xs font-mono text-white/45">关闭</button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Link href={debris.seq ? `/racewar/debris/${debris.seq}` : '/metaverse/worlds'} className="rounded border border-cyan-300/30 bg-cyan-300/8 px-3 py-2 text-center text-xs font-mono text-cyan-100/80">进入战斗中心</Link>
        <Link href="/metaverse/war/reports" className="rounded border border-white/10 px-3 py-2 text-center text-xs font-mono text-white/55">查看战况</Link>
      </div>
    </div>
  )
}

function IconDock({ href, label, iconClass, edge }: { href: string; label: string; iconClass: string; edge: 'left' | 'right' }) {
  return <Link href={href} aria-label={label} className={`absolute top-1 flex h-8 w-10 items-center justify-center bg-black/45 ${edge === 'left' ? 'left-1 rounded-br-2xl rounded-tr-md rounded-bl-md' : 'right-1 rounded-bl-2xl rounded-tl-md rounded-br-md'}`}><CornerSpriteIcon iconClass={iconClass} /></Link>
}

function SideButton({ href, label, iconClass }: { href: string; label: string; iconClass: string }) {
  return <Link href={href} className="mb-3 flex flex-col items-center text-cyan-300 last:mb-0"><ScaledSpriteIcon iconClass={iconClass} size="sm" /><span className="-mt-1 rounded border border-cyan-300 bg-black/55 px-1 py-0.5 text-[10px] font-mono text-white">{label}</span></Link>
}

function BottomPillar({ href, label, iconClass, prominent = false }: { href: string; label: string; iconClass: string; prominent?: boolean }) {
  return <Link href={href} className={`flex flex-col items-center text-cyan-300 ${prominent ? 'w-16' : 'w-12'}`}><ScaledSpriteIcon iconClass={iconClass} size={prominent ? 'large' : 'sm'} /><span className="-mt-1 rounded border border-cyan-300 bg-black/60 px-1 py-0.5 text-[10px] font-mono text-white">{label}</span></Link>
}

function SpriteIcon({ className }: { className: string }) {
  return <span aria-hidden className={`rw-sprite block ${className}`} />
}

function CornerSpriteIcon({ iconClass }: { iconClass: string }) {
  return (
    <span aria-hidden className="relative block h-7 w-7 overflow-visible">
      <span className={`rw-sprite ${iconClass} absolute left-1/2 top-1/2 block h-[66px] w-[66px] -translate-x-1/2 -translate-y-1/2 scale-[0.42]`} />
    </span>
  )
}

function ScaledSpriteIcon({ iconClass, size = 'sm' }: { iconClass: string; size?: 'sm' | 'md' | 'large' }) {
  const isLargeAtlas = iconClass === 'rw-icon-branch' || iconClass === 'rw-icon-fighting'
  const source = isLargeAtlas ? 'h-[100px] w-[100px]' : 'h-[66px] w-[66px]'
  const box = size === 'large' ? 'h-12 w-12' : size === 'md' ? 'h-10 w-10' : 'h-8 w-8'
  const scale = isLargeAtlas
    ? (size === 'large' ? 'scale-[0.52]' : 'scale-[0.42]')
    : (size === 'large' ? 'scale-[0.72]' : size === 'md' ? 'scale-[0.62]' : 'scale-[0.5]')
  return (
    <span aria-hidden className={`relative block ${box} overflow-visible`}>
      <span className={`rw-sprite ${iconClass} absolute left-1/2 top-1/2 block ${source} -translate-x-1/2 -translate-y-1/2 ${scale}`} />
    </span>
  )
}

function raceShortName(value: string | number | undefined) {
  const raceName = RACE_NAMES[String(value ?? '')]
  return raceName ? raceName.replace('族', '') : ''
}
