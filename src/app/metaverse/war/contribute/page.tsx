import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { getLoggedIn, getUserCookie } from '@/lib/auth'
import { num } from '@/lib/metaverse'
import { dangerLabel, getWarActionPlan, getWarSnapshot } from '@/lib/metaverse-war'
import { QuestActionClient } from '../../quests/QuestActionClient'

export const dynamic = 'force-dynamic'

export default async function WarContributePage() {
  const [loggedIn, userCookie] = await Promise.all([getLoggedIn(), getUserCookie()])
  const snapshot = await getWarSnapshot(userCookie)
  const plan = getWarActionPlan(snapshot)
  const targets = [
    ...snapshot.branches.slice(0, 4).map(b => ({ title: b.name, meta: `${dangerLabel(b.danger)} · ${num(Math.max(0, b.health_num))} HP`, href: `/metaverse/worlds/branch/${b.seq}` })),
    ...snapshot.anomalies.slice(0, 4).map(d => ({ title: d.name, meta: `异常碎片 · ${d.map_name}`, href: `/racewar/debris/${d.seq}` })),
  ]

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <Nav active="/metaverse" loggedIn={loggedIn} />
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div><h1 className="text-2xl font-bold font-mono text-white">贡献预案</h1><p className="mt-1 text-xs font-mono text-white/30">只读预览 · 二次确认 · 不自动提交</p></div>
        <Link href="/metaverse/war" className="w-fit rounded border border-white/10 px-3 py-2 text-xs font-mono text-white/40 hover:border-white/25 hover:text-white/70">战争中心</Link>
      </div>
      <section className="mb-6 rounded-lg border border-amber-400/20 bg-amber-400/5 p-4">
        <div className="text-xs font-mono text-amber-300/80">安全规则</div>
        <p className="mt-2 text-xs leading-relaxed text-white/48">本页只生成贡献预案。任何地票、算力、道具、通证消耗都不会在外挂里直接提交。</p>
      </section>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
          <div className="mb-4 text-xs font-mono text-white/35">推荐目标</div>
          <div className="space-y-2">
            {targets.map((t, i) => <div key={i} className="rounded border border-white/8 bg-black/20 p-3"><div className="text-sm font-mono text-white/75">{t.title}</div><div className="mt-1 text-xs font-mono text-white/30">{t.meta}</div><QuestActionClient href={t.href} /></div>)}
          </div>
        </section>
        <section className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
          <div className="mb-4 text-xs font-mono text-white/35">行动预案</div>
          <div className="space-y-2">{plan.map((line, i) => <div key={i} className="rounded border border-white/8 bg-black/20 p-3 text-xs leading-relaxed text-white/58">{line}</div>)}</div>
        </section>
      </div>
    </main>
  )
}
