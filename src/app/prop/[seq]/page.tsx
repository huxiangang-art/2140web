import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Nav } from '@/components/Nav'
import { SafeActionPanel } from '@/components/SafeActionPanel'
import { getLoggedIn, getUserCookie } from '@/lib/auth'
import { getMyProps, getPropDetail, getPropUseRecords, login } from '@/lib/api2140'
import { arr, num, settled, stripHtml } from '@/lib/metaverse'

export const dynamic = 'force-dynamic'

export default async function PropDetailPage({ params }: { params: Promise<{ seq: string }> }) {
  const { seq } = await params
  const [loggedIn, userCookie, sysCookie] = await Promise.all([
    getLoggedIn(),
    getUserCookie(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])
  const cookie = userCookie ?? sysCookie ?? ''
  const [detail, backpack, recordsRaw] = await Promise.all([
    settled(getPropDetail(cookie, seq), null),
    userCookie ? settled(getMyProps(userCookie), null) : null,
    settled(getPropUseRecords(cookie, 0), null),
  ])
  if (!detail) notFound()
  const templates = arr(backpack?.prop_templates)
  const props = arr(backpack?.props)
  const template = templates.find(t => String(t.seq) === String(seq)) ?? detail
  const ownedCount = props.filter(p => String(p.prop_t_seq ?? p.template_seq) === String(seq)).length
  const records = arr(recordsRaw?.records ?? recordsRaw?.data ?? recordsRaw).filter(r => String(r.prop_t_seq ?? r.prop_seq ?? r.seq) === String(seq)).slice(0, 10)

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <Nav active="/prop" loggedIn={loggedIn} />
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono text-white">{detail.name ?? template.name ?? `道具 #${seq}`}</h1>
          <p className="mt-1 text-xs font-mono text-white/30">图鉴 · 用途 · 使用记录 · 安全确认</p>
        </div>
        <Link href="/prop/backpack" className="w-fit rounded border border-white/10 px-3 py-2 text-xs font-mono text-white/40 hover:border-white/25 hover:text-white/70">返回背包</Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <section className="rounded-lg border border-white/10 bg-white/[0.025] p-5">
          <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-lg border border-amber-400/30 bg-black/35">
            {(detail.icon ?? template.icon) && <img src={asset(detail.icon ?? template.icon)} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Metric label="拥有" value={`${num(ownedCount)} 件`} />
            <Metric label="编号" value={`#${seq}`} />
            <Metric label="稀有度" value={detail.rare ?? detail.level ?? '-'} />
            <Metric label="来源" value={detail.source ?? '元宇宙'} />
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-white/[0.025] p-5">
          <div className="mb-3 text-xs font-mono text-white/35">用途说明</div>
          <p className="text-sm leading-relaxed text-white/55">{stripHtml(detail.desc ?? detail.introduce ?? template.desc) || '暂无公开说明。'}</p>
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            <SafeActionPanel title="使用道具确认单" endpoint="/prop/prop_use/" payload={{ prop_seq: seq, owned_count: ownedCount }} />
            <SafeActionPanel title="合成道具确认单" endpoint="/prop/prop_synthesis/" payload={{ prop_template_seq: seq }} />
          </div>
        </section>
      </div>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title="合成路径图谱" rows={[`基础道具 #${seq}`, '背包持有 -> 安全确认 -> 合成预览', '实际合成接口保持关闭']} />
        <Panel title="适用场景" rows={['碎片战斗预算', '支线文明建设', '任务推进补充', '道具图鉴收藏']} />
        <Panel title="抽取条件" rows={['查看碎片战斗中心的道具抽取信息', '生成战斗抽取确认单', '审计通过后仍先执行预览']} />
      </section>

      <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.025] p-4">
        <div className="mb-4 text-xs font-mono text-white/35">最近使用记录</div>
        <div className="space-y-2">
          {records.length ? records.map((record, i) => (
            <div key={record.seq ?? i} className="rounded border border-white/8 bg-black/22 p-3">
              <div className="text-xs font-mono text-white/62">{record.name ?? record.prop_name ?? `记录 ${i + 1}`}</div>
              <div className="mt-1 text-xs text-white/30">{record.time ?? record.created_at ?? ''}</div>
            </div>
          )) : <div className="py-10 text-center text-xs font-mono text-white/25">暂无使用记录</div>}
        </div>
      </section>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded border border-white/8 bg-black/22 p-3"><div className="text-xs font-mono text-white/28">{label}</div><div className="mt-1 truncate text-sm font-mono text-white/72">{value}</div></div>
}

function Panel({ title, rows }: { title: string; rows: string[] }) {
  return <section className="rounded-lg border border-white/10 bg-white/[0.025] p-4"><div className="mb-3 text-xs font-mono text-white/35">{title}</div><div className="space-y-2">{rows.map((row, i) => <div key={i} className="rounded border border-white/8 bg-black/22 p-3 text-xs leading-relaxed text-white/55">{row}</div>)}</div></section>
}

function asset(path?: string) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `https://www.2140city.cn${path.startsWith('/') ? path : `/${path}`}`
}
