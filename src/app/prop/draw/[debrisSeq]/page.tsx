import Link from 'next/link'
import { getUserCookie } from '@/lib/auth'
import { getPropDrawInfo, login } from '@/lib/api2140'
import { num, settled } from '@/lib/metaverse'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ debrisSeq: string }>
  searchParams: Promise<{ name?: string | string[] }>
}

export default async function PropDrawReplicaPage({ params, searchParams }: PageProps) {
  const { debrisSeq } = await params
  const query = await searchParams
  const debrisName = first(query.name) || '丝绸之路'
  const userCookie = await getUserCookie()
  const agentCookie = userCookie ? null : await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const cookie = userCookie ?? agentCookie ?? ''
  const data = await settled(getPropDrawInfo(cookie, debrisSeq), null)

  const baseUrl = data?.base_url || 'https://www.2140city.cn'
  const templates = data?.prop_templates && typeof data.prop_templates === 'object' ? data.prop_templates as Record<string, any> : {}
  const places3 = resolvePlaces(data?.places3, templates)
  const places2 = resolvePlaces(data?.places2, templates)
  const places1 = resolvePlaces(data?.places1, templates)
  const nextCost = Array.isArray(data?.cost_arr) ? data.cost_arr[Math.max(0, Number(data?.draw_daily ?? 0))] : undefined

  return (
    <main className="prop-app-shell">
      <section className="prop-draw-contain">
        <div className="prop-draw-top-bg">
          <TopBar title="获取道具" backHref={`/racewar/debris/${debrisSeq}`} />
          <div className="prop-draw-num-row prop-draw-creation">
            <span>{data?.creation_index ?? '-'}</span>
          </div>
          <div className="prop-draw-num-row prop-draw-hashrate">
            <span>{num(data?.hashrate ?? 0)}</span>
          </div>
          <button type="button" aria-label="说明" className="prop-draw-doubt" />
          <div className="prop-draw-dynamic" />
          <div className="prop-draw-tips">提炼创世元素，赠送{debrisName}道具！</div>
          <button type="button" className="prop-draw-button" aria-disabled="true">开始实验</button>
          <div className="prop-draw-safe-note">只读复刻 · 预计消耗 {nextCost ? num(nextCost) : '-'} 算力</div>
        </div>

        <section className="prop-draw-section">
          <h1>{debrisName}道具</h1>
          <PropGroup title="专属道具（只能从本基地获取）" props={places3} baseUrl={baseUrl} />
          <PropGroup title="相关道具（本基地获取概率更高）" props={places2} baseUrl={baseUrl} />
          <PropGroup title="更多道具" props={places1.slice(0, 28)} baseUrl={baseUrl} />
        </section>
      </section>
    </main>
  )
}

function TopBar({ title, backHref }: { title: string; backHref: string }) {
  return (
    <div className="prop-app-top">
      <Link href={backHref} aria-label="返回" className="prop-app-return" />
      <div className="prop-app-title">{title}</div>
      <div className="prop-app-top-placeholder" />
    </div>
  )
}

function PropGroup({ title, props, baseUrl }: { title: string; props: any[]; baseUrl: string }) {
  return (
    <section className="prop-draw-group">
      <div className="prop-draw-group-title">{title}</div>
      <div className="prop-draw-grid">
        {props.map((prop) => <PropTile key={`${title}-${prop.seq}`} prop={prop} baseUrl={baseUrl} />)}
        {!props.length && <div className="prop-draw-empty">暂无道具</div>}
      </div>
    </section>
  )
}

function PropTile({ prop, baseUrl }: { prop: any; baseUrl: string }) {
  const rare = clampRare(prop.classify_rare)
  return (
    <Link href={`/prop/${prop.seq}`} className="prop-app-tile">
      <div className="prop-app-icon-box">
        {prop.icon && <img src={asset(prop.icon, baseUrl)} alt={prop.name ?? '道具'} className="prop-app-icon-img" />}
        {Number(prop.classify_from ?? 1) > 1 && <span className="prop-app-source">合成</span>}
      </div>
      <span className={`prop-app-rare prop-app-rare-${rare}`} />
      <div className="prop-app-name">{prop.name ?? '-'}</div>
    </Link>
  )
}

function resolvePlaces(places: unknown, templates: Record<string, any>) {
  if (!Array.isArray(places)) return []
  return places.map((place) => {
    const seq = String(place?.prop_t_seq ?? place?.prop_template_seq ?? place?.seq ?? '')
    return { ...templates[seq], ...place, seq: templates[seq]?.seq ?? seq }
  }).filter((item) => item.seq)
}

function asset(path?: string, baseUrl = 'https://www.2140city.cn') {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
}

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

function clampRare(value: unknown) {
  const n = Number(value ?? 1)
  return Math.max(1, Math.min(5, Number.isFinite(n) ? n : 1))
}
