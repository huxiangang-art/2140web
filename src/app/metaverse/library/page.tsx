import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { getLoggedIn } from '@/lib/auth'
import { getTheme8, getTimeNodes, login } from '@/lib/api2140'
import { arr, settled, stripHtml } from '@/lib/metaverse'

export const dynamic = 'force-dynamic'

export default async function MetaverseLibraryPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { filter = 'all' } = await searchParams
  const [loggedIn, sysCookie] = await Promise.all([
    getLoggedIn(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])
  const cookie = sysCookie ?? ''
  const [nodes, themes] = await Promise.all([
    settled(getTimeNodes(cookie), []),
    settled(getTheme8(cookie), []),
  ])
  const linkedNodes = nodes.filter((n: any) => Number(n.branch_seq) > 0)
  const shownNodes = nodes.filter((n: any) => {
    if (filter === 'linked') return Number(n.branch_seq) > 0
    if (filter === 'key') return String(n.status) === '1'
    if (filter === 'future') return Number(n.serial_num ?? 0) >= 45
    return true
  })

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <Nav active="/metaverse" loggedIn={loggedIn} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-mono text-white">宇宙文库</h1>
        <p className="mt-1 text-xs font-mono text-white/30">时间线 · 八大系列 · 分支章节</p>
      </div>

      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label="时间节点" value={String(nodes.length)} />
        <Metric label="可读分支" value={String(linkedNodes.length)} />
        <Metric label="系列" value={String(arr(themes).length)} />
        <Metric label="正史主题" value="2140" />
      </section>

      <section className="mb-6 flex flex-wrap gap-2">
        <Filter href="/metaverse/library" active={filter === 'all'}>全部</Filter>
        <Filter href="/metaverse/library?filter=linked" active={filter === 'linked'}>有分支</Filter>
        <Filter href="/metaverse/library?filter=key" active={filter === 'key'}>关键节点</Filter>
        <Filter href="/metaverse/library?filter=future" active={filter === 'future'}>未来节点</Filter>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1.2fr]">
        <section className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
          <div className="mb-4 text-xs font-mono text-white/35">文明时间线</div>
          <div className="relative">
            <div className="absolute left-2 top-0 bottom-0 w-px bg-white/10" />
            <div className="space-y-0">
              {shownNodes.map((node: any) => (
                <div key={node.seq} className="relative pl-8 pb-4">
                  <div className={`absolute left-0 top-1.5 h-4 w-4 rounded-full border ${Number(node.branch_seq) > 0 ? 'border-cyan-400/60 bg-cyan-400/10' : 'border-white/15 bg-white/5'}`} />
                  {Number(node.branch_seq) > 0 ? (
                    <Link href={`/write/branch/${node.branch_seq}`} className="block rounded border border-transparent p-2 -m-2 transition-colors hover:border-white/10 hover:bg-white/[0.025]">
                      <Node node={node} />
                    </Link>
                  ) : <Node node={node} />}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
          <div className="mb-4 text-xs font-mono text-white/35">八大系列</div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {arr(themes).map(theme => (
              <Link key={theme.seq} href={`/metaverse/library/${theme.seq}`} className="grid grid-cols-[86px_1fr] gap-3 rounded-lg border border-white/8 bg-black/20 p-3 transition-colors hover:border-white/20">
                <div className="h-28 overflow-hidden rounded border border-white/8 bg-black/30">
                  {theme.cover && <img src={theme.cover} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold font-mono text-white/85">{theme.title}</div>
                  <div className="mt-1 text-xs font-mono text-white/25">{theme.time_node}</div>
                  <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-white/38">{stripHtml(theme.desc)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

function Node({ node }: { node: any }) {
  return <><div className="text-xs font-mono text-cyan-200/60">{node.node_time}</div><div className="mt-0.5 text-sm font-mono text-white/75">{node.node_title}</div><div className="mt-1 line-clamp-2 text-xs text-white/32">{node.node_txt}</div></>
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-white/10 bg-black/20 p-3"><div className="text-xs font-mono text-white/30">{label}</div><div className="mt-1 text-xl font-bold font-mono text-purple-300">{value}</div></div>
}

function Filter({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return <Link href={href} className={`rounded border px-3 py-1.5 text-xs font-mono transition-colors ${active ? 'border-purple-300/35 text-purple-200 bg-purple-300/8' : 'border-white/10 text-white/35 hover:border-white/25 hover:text-white/65'}`}>{children}</Link>
}
