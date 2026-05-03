import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { getLoggedIn, getUserCookie } from '@/lib/auth'
import { login } from '@/lib/api2140'
import { buildMetaverseContext, metaverseContextPrompt } from '@/lib/metaverse-context'
import { BranchProposalForm } from './BranchProposalForm'

export const dynamic = 'force-dynamic'

export default async function BranchAgentPage() {
  const [loggedIn, userCookie, sysCookie] = await Promise.all([
    getLoggedIn(),
    getUserCookie(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])
  const cookie = userCookie ?? sysCookie ?? ''
  const context = await buildMetaverseContext(cookie)
  const prompt = metaverseContextPrompt(context, '生成支线文明创建/建设/防守提案')

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <Nav active="/metaverse" loggedIn={loggedIn} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-mono text-white">支线文明 Agent</h1>
        <p className="mt-1 text-xs font-mono text-white/30">创建文明 · 支线任务 · 防守提案</p>
      </div>
      <BranchProposalForm basePrompt={prompt} />
      <section className="rounded-lg border border-cyan-300/15 bg-cyan-300/[0.035] p-4">
        <div className="mb-2 text-xs font-mono text-cyan-100/60">可复制上下文</div>
        <pre className="whitespace-pre-wrap text-xs leading-relaxed text-white/58">{prompt}</pre>
      </section>
      <Link href={`/metaverse/agent?lane=branch&prompt=${encodeURIComponent(prompt)}`} className="mt-6 inline-flex rounded border border-cyan-300/25 px-4 py-2 text-xs font-mono text-cyan-100/75">进入 Agent 工作台</Link>
    </main>
  )
}
