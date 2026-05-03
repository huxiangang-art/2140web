import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Nav } from '@/components/Nav'
import { Badge } from '@/components/ui/badge'
import { getLoggedIn } from '@/lib/auth'
import {
  getAllCityCodeBills,
  getCityCodeAmendments,
  getCityCodeProposal,
  login,
  type CityCodeAmendment,
  type CityCodeProposal,
} from '@/lib/api2140'

export const dynamic = 'force-dynamic'

function absolute2140Url(path?: string | null) {
  if (!path) return ''
  return path.startsWith('http') ? path : `https://www.2140city.cn${path}`
}

function textFromHtml(input?: string | null) {
  return (input ?? '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim()
}

async function getData(seq: string) {
  const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  if (!cookie) return null

  const [proposalResult, adoptedResult, proposedResult] = await Promise.allSettled([
    getCityCodeProposal(cookie, seq),
    getCityCodeAmendments(cookie, seq, 1, 0, 1),
    getCityCodeAmendments(cookie, seq, 2, 0, 1),
  ])

  let proposal = proposalResult.status === 'fulfilled' ? proposalResult.value : null
  if (!proposal) {
    const bills = await getAllCityCodeBills(cookie)
    proposal = bills.find(bill => bill.seq === seq || bill.proposal_seq === seq) ?? null
  }
  if (!proposal) return null

  return {
    proposal,
    adopted: adoptedResult.status === 'fulfilled' ? adoptedResult.value : [],
    proposed: proposedResult.status === 'fulfilled' ? proposedResult.value : [],
  }
}

export default async function CityCodeDetailPage({ params }: { params: Promise<{ seq: string }> }) {
  const { seq } = await params
  const [loggedIn, data] = await Promise.all([getLoggedIn(), getData(seq)])

  if (!data) notFound()

  const { proposal, adopted, proposed } = data
  const author = proposal.user_nickname ?? proposal.author_nickname ?? '未知居民'
  const content = textFromHtml(proposal.content)
  const image = absolute2140Url(proposal.introduce_img)

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <Nav active="/citycode" loggedIn={loggedIn} />

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2 text-xs font-mono text-white/30">
          <Link href="/citycode" className="hover:text-white/60">城邦法典</Link>
          <span>›</span>
          <span className="text-white/50">议案详情</span>
        </div>
        <h1 className="text-2xl font-bold text-white font-mono leading-tight">{proposal.title}</h1>
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs font-mono text-white/35">
          <Badge variant="outline" className="border-white/10 text-white/50">NO.{proposal.id}</Badge>
          {proposal.scope_text && <span>{proposal.scope_text}</span>}
          <span>{author}</span>
          <span>{proposal.time?.slice(0, 16)}</span>
        </div>
      </div>

      <section className="rounded-lg border border-white/10 bg-white/3 p-4 md:p-5 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <Metric label="支持" value={proposal.support_num} />
          <Metric label="反对" value={proposal.against_num} />
          <Metric label="目标" value={`${proposal.target ?? proposal.target_num ?? '-'}%`} />
          <Metric label="修正案" value={proposal.amendment_count ?? '0'} />
        </div>

        {content ? (
          <p className="text-sm font-mono text-white/70 leading-relaxed whitespace-pre-wrap">{content}</p>
        ) : (
          <p className="text-sm font-mono text-white/30">暂无正文</p>
        )}

        {image && (
          <div className="mt-5 overflow-hidden rounded-lg border border-white/10">
            <img src={image} alt="" className="w-full object-cover" />
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AmendmentSection title="正式修正案" empty="暂无正式修正案" amendments={adopted} />
        <AmendmentSection title="居民修订提案" empty="暂无居民修订提案" amendments={proposed} />
      </div>
    </main>
  )
}

function Metric({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="rounded-md border border-white/8 bg-black/20 px-3 py-2">
      <div className="text-xs font-mono text-white/25">{label}</div>
      <div className="text-sm font-mono text-white/70 mt-1">{value ?? '-'}</div>
    </div>
  )
}

function AmendmentSection({
  title,
  empty,
  amendments,
}: {
  title: string
  empty: string
  amendments: CityCodeAmendment[]
}) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-sm font-bold text-white/70 font-mono">{title}</h2>
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs font-mono text-white/25">{amendments.length}</span>
      </div>

      {amendments.length === 0 ? (
        <div className="rounded-lg border border-white/8 p-5 text-center text-xs font-mono text-white/30">
          {empty}
        </div>
      ) : (
        <div className="space-y-3">
          {amendments.map(amendment => (
            <AmendmentCard key={amendment.seq} amendment={amendment} />
          ))}
        </div>
      )}
    </section>
  )
}

function AmendmentCard({ amendment }: { amendment: CityCodeAmendment }) {
  const author = amendment.author_nickname ?? amendment.user_nickname ?? '未知居民'
  const image = absolute2140Url(amendment.introduce_img)
  const support = amendment.support_num ?? amendment.support_count ?? '0'

  return (
    <article className="rounded-lg border border-white/8 bg-white/3 p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-sm font-mono font-bold text-white/75 leading-snug">{amendment.title}</h3>
        <span className="text-xs font-mono text-white/25 shrink-0">{amendment.time?.slice(0, 10)}</span>
      </div>
      <div className="text-xs font-mono text-white/30 mb-3">{author} · 支持 {support}</div>
      <p className="text-xs font-mono text-white/55 leading-relaxed whitespace-pre-wrap">
        {textFromHtml(amendment.content)}
      </p>
      {image && (
        <div className="mt-3 overflow-hidden rounded-md border border-white/10">
          <img src={image} alt="" className="w-full object-cover" />
        </div>
      )}
    </article>
  )
}
