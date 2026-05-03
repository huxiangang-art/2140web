import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { getLoggedIn } from '@/lib/auth'
import { AgentDraftClient } from './AgentDraftClient'

export const dynamic = 'force-dynamic'

const lanes = [
  { title: '章节提案', href: '/write', desc: '基于时间线、八大系列、现有分支生成章节草案。', status: 'ready' },
  { title: '法典提案', href: '/citycode', desc: '基于 CityCode 正式条文生成修正案、对照和说明。', status: 'ready' },
  { title: '治理简报', href: '/parliament', desc: '汇总议事厅、法典、广场讨论，形成治理摘要。', status: 'draft' },
  { title: '任务建议', href: '/metaverse/quests', desc: '从战争、支线、写作、治理中生成今日行动队列。', status: 'draft' },
]

export default async function MetaverseAgentPage() {
  const loggedIn = await getLoggedIn()
  return (
    <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <Nav active="/metaverse" loggedIn={loggedIn} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-mono text-white">Agent 工作台</h1>
        <p className="mt-1 text-xs font-mono text-white/30">GPT-X · 提案生成 · 章节草案 · 治理对照</p>
      </div>

      <section className="mb-6 rounded-lg border border-white/10 bg-white/[0.025] p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Quick href="/metaverse/library" label="宇宙文库" />
          <Quick href="/citycode" label="法典" />
          <Quick href="/write" label="写作" />
          <Quick href="/chat" label="GPT-X" />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {lanes.map(lane => (
          <Link key={lane.title} href={lane.href} className="rounded-lg border border-white/10 bg-black/20 p-5 transition-colors hover:border-white/25">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="text-base font-bold font-mono text-white/85">{lane.title}</h2>
              <span className={`rounded border px-2 py-0.5 text-xs font-mono ${lane.status === 'ready' ? 'border-cyan-400/25 text-cyan-300/70' : 'border-white/10 text-white/30'}`}>{lane.status}</span>
            </div>
            <p className="text-xs leading-relaxed text-white/40">{lane.desc}</p>
          </Link>
        ))}
      </div>

      <AgentDraftClient />
    </main>
  )
}

function Quick({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="rounded border border-white/10 px-3 py-3 text-center text-xs font-mono text-white/45 transition-colors hover:border-white/25 hover:text-white/75">{label}</Link>
}
