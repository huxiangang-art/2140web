import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { getLoggedIn, getUserCookie } from '@/lib/auth'
import { login } from '@/lib/api2140'
import { buildMetaverseContext, metaverseContextPrompt } from '@/lib/metaverse-context'

export const dynamic = 'force-dynamic'

export default async function WarAgentPage() {
  const [loggedIn, userCookie, sysCookie] = await Promise.all([
    getLoggedIn(),
    getUserCookie(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])
  const cookie = userCookie ?? sysCookie ?? ''
  const context = await buildMetaverseContext(cookie)
  const prompt = metaverseContextPrompt(context, '生成今日元宇宙战争作战提案')

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <Nav active="/metaverse" loggedIn={loggedIn} />
      <Header title="战争作战 Agent" sub="碎片风险 · 支线防守 · 投入建议" />
      <ContextBox prompt={prompt} />
      <section className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        <Panel title="高风险碎片" rows={context.riskDebriss.slice(0, 8).map(d => `${d.map_name} / ${d.name} / ${d.status.label}`)} />
        <Panel title="低血量支线" rows={context.riskBranches.slice(0, 8).map(b => `${b.name} / ${b.status.label} / ${b.health ?? 0}HP`)} />
      </section>
      <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.025] p-4">
        <div className="mb-3 text-xs font-mono text-white/35">战报草案结构</div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
          {['风险摘要', '推荐投入', '任务建议', '道具建议'].map(item => (
            <div key={item} className="rounded border border-white/8 bg-black/22 p-3 text-xs font-mono text-white/58">{item}</div>
          ))}
        </div>
      </section>
      <Link href={`/metaverse/agent?lane=war&prompt=${encodeURIComponent(prompt)}`} className="mt-6 inline-flex rounded border border-cyan-300/25 px-4 py-2 text-xs font-mono text-cyan-100/75">进入 Agent 工作台</Link>
    </main>
  )
}

function Header({ title, sub }: { title: string; sub: string }) {
  return <div className="mb-6"><h1 className="text-2xl font-bold font-mono text-white">{title}</h1><p className="mt-1 text-xs font-mono text-white/30">{sub}</p></div>
}

function ContextBox({ prompt }: { prompt: string }) {
  return <section className="rounded-lg border border-cyan-300/15 bg-cyan-300/[0.035] p-4"><div className="mb-2 text-xs font-mono text-cyan-100/60">可复制上下文</div><pre className="whitespace-pre-wrap text-xs leading-relaxed text-white/58">{prompt}</pre></section>
}

function Panel({ title, rows }: { title: string; rows: string[] }) {
  return <section className="rounded-lg border border-white/10 bg-white/[0.025] p-4"><div className="mb-3 text-xs font-mono text-white/35">{title}</div><div className="space-y-2">{rows.length ? rows.map((row, i) => <div key={i} className="rounded border border-white/8 bg-black/22 p-3 text-xs text-white/55">{row}</div>) : <div className="py-8 text-center text-xs font-mono text-white/25">暂无数据</div>}</div></section>
}
