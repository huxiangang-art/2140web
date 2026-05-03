import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { getLoggedIn } from '@/lib/auth'
import { getCreationRank, getDebrisRank, getDigitalPersonRank, getGenesisKeysUsers, getHashratePoolRank, getTotalRank, login, RACE_COLORS, RACE_NAMES } from '@/lib/api2140'
import { arr, num, settled } from '@/lib/metaverse'

export const dynamic = 'force-dynamic'

export default async function MetaverseContributionPage() {
  const [loggedIn, sysCookie] = await Promise.all([
    getLoggedIn(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])
  const cookie = sysCookie ?? ''
  const [creation, debris, total, digital, hashrate, genesis] = await Promise.all([
    settled(getCreationRank(cookie), null),
    settled(getDebrisRank(cookie, 1), null),
    settled(getTotalRank(cookie, 1), null),
    settled(getDigitalPersonRank(cookie), []),
    settled(getHashratePoolRank(cookie, 1, 0), []),
    settled(getGenesisKeysUsers(cookie), null),
  ])

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <Nav active="/metaverse" loggedIn={loggedIn} />
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono text-white">贡献中心</h1>
          <p className="mt-1 text-xs font-mono text-white/30">创作指数 · 地票 · 算力 · 数字人 · 创世主</p>
        </div>
        <Link href="/metaverse/identity" className="w-fit rounded border border-white/10 px-3 py-2 text-xs font-mono text-white/40 hover:border-white/25 hover:text-white/70">我的元身份</Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RankPanel title="创作指数" rows={arr(creation?.racewar_users).map((u, i) => ({ key: u.seq, rank: i + 1, name: u.user_nick, avatar: u.user_avatar, race: u.user_race, value: num(u.creation_index) }))} />
        <RankPanel title="今日贡献" rows={arr(debris?.user_daily).map((u, i) => ({ key: u.user_seq, rank: i + 1, name: u.nickname, avatar: u.avatar, race: u.race, value: `+${num(u.amount_sum)}` }))} />
        <RankPanel title="数字人" rows={arr(digital?.records ?? digital).map((u, i) => ({ key: u.user_seq ?? u.seq, rank: i + 1, name: u.user_nick ?? u.nickname, avatar: u.user_avatar ?? u.avatar, race: u.user_race ?? u.race, value: `Lv.${u.person_lv ?? u.lv ?? '-'}` }))} />
        <RankPanel title="地票总榜" rows={arr(total?.total_users).map((u, i) => ({ key: u.user_seq, rank: i + 1, name: u.nickname, avatar: u.avatar, race: u.race, value: num(u.amount_sum) }))} />
        <RankPanel title="算力排行" rows={arr(hashrate).map((u, i) => ({ key: u.user_seq, rank: i + 1, name: u.user_nickname, avatar: u.user_avatar, race: u.user_race, value: `${num(u.hashrate_sum)} H` }))} />
        <RankPanel title="创世主" rows={arr(genesis?.records ?? genesis).map((u, i) => ({ key: u.user_seq ?? i, rank: i + 1, name: u.user_nick ?? u.nickname, avatar: u.avatar, race: u.user_race ?? u.race_seq, value: `×${(Number(u.key1) || 0) + (Number(u.key2) || 0) + (Number(u.key3) || Number(u.key_count) || 0)}` }))} />
      </div>
    </main>
  )
}

function RankPanel({ title, rows }: { title: string; rows: Array<{ key: string | number; rank: number; name?: string; avatar?: string; race?: string | number; value?: string }> }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
      <div className="mb-4 text-xs font-mono text-white/35">{title}</div>
      {rows.length ? <div className="space-y-1">{rows.slice(0, 12).map(row => <RankRow key={row.key} row={row} />)}</div> : <div className="py-10 text-center text-xs font-mono text-white/25">暂无数据</div>}
    </section>
  )
}

function RankRow({ row }: { row: { rank: number; name?: string; avatar?: string; race?: string | number; value?: string } }) {
  const race = String(row.race ?? '')
  const color = RACE_COLORS[race] ?? '#94a3b8'
  return (
    <div className="flex items-center gap-2 border-b border-white/5 py-1.5 last:border-0">
      <span className="w-5 text-xs font-mono text-white/20">{row.rank}</span>
      <div className="h-6 w-6 overflow-hidden rounded-full border" style={{ borderColor: `${color}55`, backgroundColor: `${color}18` }}>{row.avatar ? <img src={row.avatar} alt="" className="h-full w-full object-cover" /> : null}</div>
      <span className="min-w-0 flex-1 truncate text-xs font-mono text-white/70">{row.name ?? '未知'}</span>
      <span className="text-xs font-mono text-white/25">{RACE_NAMES[race]?.replace('族', '')}</span>
      <span className="shrink-0 text-xs font-mono text-cyan-300/70">{row.value ?? '-'}</span>
    </div>
  )
}
