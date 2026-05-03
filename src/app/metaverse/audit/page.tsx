import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { getLoggedIn } from '@/lib/auth'
import { AuditActions } from './AuditActions'

export const dynamic = 'force-dynamic'

async function getAuditRecords() {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'
    const res = await fetch(`${base}/api/metaverse/audit`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    return data.records ?? []
  } catch {
    return []
  }
}

export default async function MetaverseAuditPage() {
  const [loggedIn, records] = await Promise.all([getLoggedIn(), getAuditRecords()])
  return (
    <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <Nav active="/metaverse" loggedIn={loggedIn} />
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono text-white">操作审计</h1>
          <p className="mt-1 text-xs font-mono text-white/30">战斗消耗 · 道具使用 · 合成抽取 · 待确认记录</p>
        </div>
        <Link href="/metaverse" className="w-fit rounded border border-white/10 px-3 py-2 text-xs font-mono text-white/40 hover:border-white/25">返回元宇宙</Link>
      </div>
      <section className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
        <div className="mb-4 text-xs font-mono text-white/35">待确认动作</div>
        <div className="space-y-2">
          {records.length ? records.map((r: any) => (
            <div key={r.id} className="rounded border border-white/8 bg-black/22 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-mono text-white/70">{r.target ?? r.type}</div>
                <span className="rounded border border-amber-300/20 px-2 py-0.5 text-xs font-mono text-amber-100/65">{r.status}</span>
              </div>
              <div className="mt-1 truncate text-xs font-mono text-white/25">{r.endpoint}</div>
              <pre className="mt-2 max-h-28 overflow-auto rounded border border-white/8 bg-black/20 p-2 text-xs text-white/38">{JSON.stringify(r.payload ?? {}, null, 2)}</pre>
              <AuditActions id={String(r.id)} />
            </div>
          )) : <div className="py-16 text-center text-xs font-mono text-white/25">暂无审计记录。打开碎片或道具详情生成确认单后会显示在这里。</div>}
        </div>
      </section>
    </main>
  )
}
