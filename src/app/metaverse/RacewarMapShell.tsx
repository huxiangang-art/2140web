import Link from 'next/link'
import { arr } from '@/lib/metaverse'
import { RacewarMapClient } from './RacewarMapClient'

export function RacewarMapShell({
  initialMode = 'main',
  currentMap,
  previousMap,
  unlockedCount,
  totalCount,
  activeBranchCount,
  branchCount,
  anomalyCount,
  race,
  mapDetail,
  debriss,
  branchMaps = [],
}: {
  initialMode?: 'main' | 'branch'
  currentMap: any
  previousMap: any
  unlockedCount: number
  totalCount: number
  activeBranchCount: number
  branchCount: number
  anomalyCount: number
  race: string
  mapDetail: any
  debriss: any[]
  branchMaps?: any[]
}) {
  const mapName = mapDetail?.name ?? currentMap?.name ?? '虫洞文明'
  const mapBg = racewarAsset(mapDetail?.bg) || '/racewar/space.jpg'
  const markers = arr(debriss).length
    ? arr(debriss)
    : [
        { seq: currentMap?.seq, id: `V - ${currentMap?.lv ?? '-'}`, name: currentMap?.name ?? '无限∞世界', race_seq: race, position: ['54%', '17%'], error_status: 1 },
        { seq: previousMap?.seq, id: `V - ${previousMap?.lv ?? '-'}`, name: previousMap?.name ?? '丝绸之路', race_seq: 1, position: ['69%', '61%'], error_status: 1 },
      ]

  return (
    <section className="mx-auto grid min-h-screen w-full max-w-[1180px] grid-cols-1 gap-0 md:grid-cols-[minmax(0,540px)_280px] md:gap-4">
      <div className="mx-auto h-screen w-full max-w-[540px] overflow-hidden bg-black shadow-[0_0_36px_rgba(34,211,238,0.12)] md:h-auto md:rounded-lg md:border md:border-cyan-300/20">
        <div className="relative h-full overflow-hidden bg-black md:aspect-[750/1334]">
          <RacewarMapClient initialMode={initialMode} mapName={mapName} mapBg={mapBg} markers={markers} branchMaps={arr(branchMaps)} />
        </div>
      </div>

      <aside className="hidden content-start gap-3 py-4 md:grid">
        <section className="grid grid-cols-2 gap-2">
          <MapStat label="主线" value={`${unlockedCount}/${totalCount || 0}`} />
          <MapStat label="支线" value={`${activeBranchCount}/${branchCount || 0}`} />
          <MapStat label="当前" value={currentMap?.name ?? '-'} />
          <MapStat label="异常" value={String(anomalyCount)} />
        </section>
        <section className="grid grid-cols-2 gap-2">
          <ActionLink href="/metaverse/dashboard" label="总览控制台" />
          <ActionLink href="/metaverse/worlds" label="切换文明" />
          <ActionLink href="/metaverse/war/reports" label="文明战况" />
          <ActionLink href="/metaverse/quests" label="任务队列" />
        </section>
        <section className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
          <div className="mb-3 text-xs font-mono text-white/35">今日建议</div>
          <div className="space-y-2">
            <Hint text={anomalyCount ? `优先检查 ${anomalyCount} 个异常碎片，进入战况页排序处理。` : '主线碎片暂未发现明显异常，适合推进文明任务。'} href="/metaverse/war/reports" />
            <Hint text={activeBranchCount ? `${activeBranchCount} 个支线文明仍存活，可查看支线任务和建设提案。` : '暂无存活支线数据，先查看文明切换页。'} href="/metaverse/worlds#branch-worlds" />
            <Hint text="道具抽取、合成、使用已进入安全确认模式，先生成提案再执行。" href="/prop/backpack" />
          </div>
        </section>
      </aside>
    </section>
  )
}

function ActionLink({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="rounded border border-cyan-300/20 bg-cyan-300/5 px-3 py-2 text-center text-xs font-mono text-cyan-100/75 transition-colors hover:border-cyan-300/45 hover:text-white">{label}</Link>
}

function MapStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded border border-white/8 bg-black/25 p-2">
      <div className="text-xs font-mono text-white/25">{label}</div>
      <div className="mt-1 truncate text-sm font-mono text-white/80">{value}</div>
    </div>
  )
}

function Hint({ text, href }: { text: string; href: string }) {
  return <Link href={href} className="block rounded border border-white/8 bg-black/22 p-3 text-xs leading-relaxed text-white/48 transition-colors hover:border-cyan-300/25 hover:text-cyan-100/70">{text}</Link>
}

function racewarAsset(path?: string) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const normalized = path.replace(/^\.\.\/image\/racewar\//, '/racewar/')
  if (normalized.startsWith('/racewar/')) return normalized
  if (normalized.startsWith('/')) return `https://www.2140city.cn${normalized}`
  return path
}
