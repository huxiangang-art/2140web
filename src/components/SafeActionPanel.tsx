import Link from 'next/link'
import { SafeActionForm } from './SafeActionForm'

export function SafeActionPanel({
  title,
  endpoint,
  payload,
  cta = '生成确认单',
}: {
  title: string
  endpoint: string
  payload?: Record<string, unknown>
  cta?: string
}) {
  return (
    <section className="rounded-lg border border-amber-300/16 bg-amber-300/[0.035] p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="text-sm font-mono text-white/82">{title}</div>
        <span className="rounded border border-amber-300/24 px-2 py-1 text-xs font-mono text-amber-200/70">待确认</span>
      </div>
      <div className="truncate text-xs font-mono text-white/28">{endpoint}</div>
      {payload && (
        <pre className="mt-3 max-h-28 overflow-auto rounded border border-white/8 bg-black/24 p-2 text-xs leading-relaxed text-white/42">{JSON.stringify(payload, null, 2)}</pre>
      )}
      <p className="mt-3 text-xs leading-relaxed text-white/38">该动作可能改变主站数据或消耗资产。当前版本只生成待审确认单，不直接调用写接口。</p>
      <SafeActionForm title={title} endpoint={endpoint} payload={payload} />
      <Link href="/metaverse/audit" className="mt-3 inline-flex rounded border border-amber-300/25 px-3 py-2 text-xs font-mono text-amber-100/70">{cta}</Link>
    </section>
  )
}
