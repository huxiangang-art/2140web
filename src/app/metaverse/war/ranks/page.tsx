import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { getLoggedIn, getUserCookie } from '@/lib/auth'
import { RACE_COLORS, RACE_NAMES } from '@/lib/api2140'
import { num } from '@/lib/metaverse'
import { getWarSnapshot } from '@/lib/metaverse-war'

export const dynamic = 'force-dynamic'

export default async function WarRanksPage() {
  const [loggedIn, userCookie] = await Promise.all([getLoggedIn(), getUserCookie()])
  const snapshot = await getWarSnapshot(userCookie)

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <Nav active="/metaverse" loggedIn={loggedIn} />
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div><h1 className="text-2xl font-bold font-mono text-white">战争排行</h1><p className="mt-1 text-xs font-mono text-white/30">今日贡献 · 地票总榜 · 种族榜 · 算力 · 数字人</p></div>
        <Link href="/metaverse/war" className="w-fit rounded border border-white/10 px-3 py-2 text-xs font-mono text-white/40 hover:border-white/25 hover:text-white/70">战争中心</Link>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RankPanel title="今日贡献" rows={snapshot.todayContributors.map((u, i) => ({ key: u.user_seq ?? i, rank: i + 1, name: u.nickname, avatar: u.avatar, race: u.race, value: `+${num(u.amount_sum)}` }))} />
        <RankPanel title="地票总榜" rows={snapshot.totalUsers.map((u, i) => ({ key: u.user_seq ?? i, rank: i + 1, name: u.nickname, avatar: u.avatar, race: u.race, value: num(u.amount_sum) }))} />
        <RankPanel title="种族总榜" rows={snapshot.totalRace.map((u, i) => ({ key: u.race_seq ?? i, rank: i + 1, name: RACE_NAMES[String(u.race_seq)], race: u.race_seq, value: num(u.amount_sum) }))} />
        <RankPanel title="算力前线" rows={snapshot.hashrateRank.map((u, i) => ({ key: u.user_seq ?? i, rank: i + 1, name: u.user_nickname, avatar: u.user_avatar, race: u.user_race, value: `${num(u.hashrate_sum)}H` }))} />
        <RankPanel title="数字人前线" rows={snapshot.digitalRank.map((u, i) => ({ key: u.user_seq ?? u.seq ?? i, rank: i + 1, name: u.user_nick ?? u.nickname, avatar: u.user_avatar ?? u.avatar, race: u.user_race ?? u.race, value: `Lv.${u.person_lv ?? u.lv ?? '-'}` }))} />
      </div>
    </main>
  )
}

function RankPanel({ title, rows }: { title: string; rows: Array<{ key: string | number; rank: number; name?: string; avatar?: string; race?: string | number; value?: string }> }) {
  return <section className="rounded-lg border border-white/10 bg-white/[0.025] p-4"><div className="mb-4 text-xs font-mono text-white/35">{title}</div>{rows.length ? <div className="space-y-1">{rows.slice(0, 20).map(row => <RankRow key={row.key} row={row} />)}</div> : <div className="py-10 text-center text-xs font-mono text-white/25">暂无数据</div>}</section>
}

function RankRow({ row }: { row: { rank: number; name?: string; avatar?: string; race?: string | number; value?: string } }) {
  const race = String(row.race ?? '')
  const color = RACE_COLORS[race] ?? '#94a3b8'
  return <div className="flex items-center gap-2 border-b border-white/5 py-1.5 last:border-0"><span className="w-5 text-xs font-mono text-white/20">{row.rank}</span><div className="h-6 w-6 overflow-hidden rounded-full border" style={{ borderColor: `${color}55`, backgroundColor: `${color}18` }}>{row.avatar && <img src={row.avatar} alt="" className="h-full w-full object-cover" />}</div><span className="min-w-0 flex-1 truncate text-xs font-mono text-white/70">{row.name ?? '未知'}</span><span className="text-xs font-mono text-white/25">{RACE_NAMES[race]?.replace('族', '')}</span><span className="shrink-0 text-xs font-mono text-cyan-300/70">{row.value ?? '-'}</span></div>
}
