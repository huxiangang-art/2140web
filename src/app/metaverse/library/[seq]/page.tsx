import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Nav } from '@/components/Nav'
import { getLoggedIn } from '@/lib/auth'
import { getTheme8, getTimeNodes, getWriteBranch, getWriteChapters, login } from '@/lib/api2140'
import { arr, settled, stripHtml } from '@/lib/metaverse'

export const dynamic = 'force-dynamic'

export default async function LibrarySeriesPage({ params }: { params: Promise<{ seq: string }> }) {
  const { seq } = await params
  const [loggedIn, sysCookie] = await Promise.all([
    getLoggedIn(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])
  const cookie = sysCookie ?? ''
  const [themes, branch, chapters, nodes] = await Promise.all([
    settled(getTheme8(cookie), []),
    settled(getWriteBranch(cookie, seq), null),
    settled(getWriteChapters(cookie, seq), []),
    settled(getTimeNodes(cookie), []),
  ])
  const theme = arr(themes).find(t => String(t.seq) === String(seq)) ?? branch
  if (!theme) notFound()
  const relatedNode = arr(nodes).find(n => String(n.branch_seq) === String(seq) || String(n.seq) === String(theme.node_seq))

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <Nav active="/metaverse" loggedIn={loggedIn} />
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-mono text-purple-300/60">{relatedNode?.node_time ?? theme.time_node ?? '2140'}</div>
          <h1 className="mt-1 text-2xl font-bold font-mono text-white">{theme.title}</h1>
        </div>
        <Link href="/metaverse/library" className="w-fit rounded border border-white/10 px-3 py-2 text-xs font-mono text-white/40 hover:border-white/25 hover:text-white/70">宇宙文库</Link>
      </div>
      <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-[220px_1fr]">
        <div className="h-64 overflow-hidden rounded-lg border border-white/10 bg-black/30">{theme.cover && <img src={theme.cover} alt="" className="h-full w-full object-cover" />}</div>
        <div className="rounded-lg border border-white/10 bg-white/[0.025] p-5">
          <p className="text-sm leading-relaxed text-white/48 whitespace-pre-line">{stripHtml(theme.desc)}</p>
          <div className="mt-4 text-xs font-mono text-white/25">章节 {chapters.length}</div>
        </div>
      </section>
      <section className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
        <div className="mb-4 text-xs font-mono text-white/35">章节进度</div>
        <div className="space-y-2">
          {chapters.length ? chapters.map((chapter: any, i: number) => (
            <Link key={chapter.seq ?? i} href={`/write/chapter/${seq}/${chapter.seq}`} className="block rounded border border-white/8 bg-black/20 p-3 transition-colors hover:border-white/20">
              <div className="text-sm font-mono text-white/75">{chapter.title ?? `章节 ${i + 1}`}</div>
              <div className="mt-1 text-xs font-mono text-white/25">{chapter.author_nickname ?? chapter.author_nick ?? ''} {chapter.time?.slice?.(0, 10) ?? ''}</div>
            </Link>
          )) : <div className="py-10 text-center text-xs font-mono text-white/25">暂无章节</div>}
        </div>
      </section>
    </main>
  )
}
