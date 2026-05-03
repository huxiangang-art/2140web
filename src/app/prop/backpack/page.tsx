import { Nav } from '@/components/Nav'
import { getLoggedIn, getUserCookie } from '@/lib/auth'
import { getAllProps, getMyProps, getPropUseRecords } from '@/lib/api2140'
import { arr, num, settled, stripHtml } from '@/lib/metaverse'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function PropBackpackPage() {
  const [loggedIn, userCookie] = await Promise.all([getLoggedIn(), getUserCookie()])
  if (!loggedIn) redirect('/login')

  const [data, allProps, useRecords] = await Promise.all([
    settled(getMyProps(userCookie!), null),
    settled(getAllProps(userCookie!), null),
    settled(getPropUseRecords(userCookie!, 0), null),
  ])

  const templates: any[] = arr(data?.prop_templates ?? allProps?.prop_templates ?? allProps?.templates ?? allProps)
  const props: any[] = arr(data?.props)
  const records: any[] = arr(useRecords?.records ?? useRecords?.data ?? useRecords)
  const ownedMap: Record<string, number> = {}
  for (const p of props) ownedMap[p.prop_t_seq ?? p.prop_template_seq ?? p.template_seq] = (ownedMap[p.prop_t_seq ?? p.prop_template_seq ?? p.template_seq] ?? 0) + 1
  const owned = templates.filter(t => ownedMap[t.seq] > 0)
  const notOwned = templates.filter(t => !ownedMap[t.seq])

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <Nav active="/prop" loggedIn={loggedIn} />
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-mono">道具背包</h1>
          <p className="mt-1 text-xs text-white/30">已拥有 {owned.length} 种 · 共 {props.length} 件 · 安全治理模式</p>
        </div>
        <div className="flex gap-2">
          <Link href="/prop" className="rounded border border-white/10 px-3 py-2 text-xs font-mono text-white/40 hover:border-white/25 hover:text-white/70">合成路径</Link>
          <Link href="/prop/rank" className="rounded border border-white/10 px-3 py-2 text-xs font-mono text-white/40 hover:border-white/25 hover:text-white/70">道具排行</Link>
        </div>
      </div>

      <section className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_1fr]">
        <Guard title="使用道具" endpoint="/prop/prop_use/" status="保护中" />
        <Guard title="战斗抽取" endpoint="/racewar/user_cost_and_draw" status="只读预览" />
        <Guard title="道具合成" endpoint="/prop/prop_synthesis/" status="待确认" />
      </section>

      <section className="mb-6 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.035] p-4">
        <div className="mb-2 text-xs font-mono text-cyan-100/60">P6 Safety Governance</div>
        <p className="text-xs leading-relaxed text-white/48">
          道具系统现在只展示背包、图鉴、排行和使用记录。任何会消耗算力、通证、道具或改变战斗结果的接口，都必须先进入提案/确认层，页面不会直接触发写操作。
        </p>
      </section>

      {owned.length > 0 && (
        <section className="mb-8">
          <div className="mb-3 text-xs font-mono text-white/40">已拥有</div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {owned.map((t: any) => <PropTile key={t.seq} template={t} count={ownedMap[t.seq]} owned />)}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <section>
          <div className="mb-3 text-xs font-mono text-white/25">未拥有（{notOwned.length} 种）</div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7">
            {notOwned.map((t: any) => <PropTile key={t.seq} template={t} count={0} />)}
          </div>
          {!templates.length && <div className="rounded-lg border border-white/8 bg-black/20 py-20 text-center text-xs font-mono text-white/25">暂无背包数据</div>}
        </section>

        <aside className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
          <div className="mb-4 text-xs font-mono text-white/35">最近使用记录</div>
          <div className="space-y-2">
            {records.slice(0, 10).map((record, i) => (
              <div key={record.seq ?? i} className="rounded border border-white/8 bg-black/22 p-3">
                <div className="truncate text-xs font-mono text-white/65">{record.prop_name ?? record.name ?? record.title ?? `记录 ${i + 1}`}</div>
                <div className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/32">{stripHtml(record.desc ?? record.content ?? record.remark)}</div>
                <div className="mt-2 text-xs font-mono text-white/25">{record.time ?? record.created_at ?? ''}</div>
              </div>
            ))}
            {!records.length && <div className="py-10 text-center text-xs font-mono text-white/25">暂无使用记录</div>}
          </div>
        </aside>
      </div>
    </main>
  )
}

function Guard({ title, endpoint, status }: { title: string; endpoint: string; status: string }) {
  return (
    <div className="rounded-lg border border-amber-300/16 bg-amber-300/[0.035] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-mono text-white/80">{title}</div>
        <span className="rounded border border-amber-300/24 px-2 py-1 text-xs font-mono text-amber-200/70">{status}</span>
      </div>
      <div className="mt-2 truncate text-xs font-mono text-white/25">{endpoint}</div>
    </div>
  )
}

function PropTile({ template, count, owned = false }: { template: any; count: number; owned?: boolean }) {
  return (
    <Link href={`/prop/${template.seq}`} className={`flex flex-col items-center gap-1.5 ${owned ? '' : 'opacity-35'}`}>
      <div className={`relative h-14 w-14 overflow-hidden rounded-lg border bg-black/40 ${owned ? 'border-amber-400/40' : 'border-white/10'}`}>
        {template.icon && <img src={asset(template.icon)} alt={template.name} className={`h-full w-full object-cover ${owned ? '' : 'grayscale'}`} />}
        {count > 1 && <div className="absolute bottom-0 right-0 rounded-tl bg-amber-500 px-1 text-xs font-bold text-black">×{num(count)}</div>}
      </div>
      <div className="max-w-[64px] text-center font-mono text-white/55 leading-tight" style={{ fontSize: 10 }}>{template.name}</div>
    </Link>
  )
}

function asset(path?: string) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `https://www.2140city.cn${path.startsWith('/') ? path : `/${path}`}`
}
