import Link from 'next/link'
import { getUserCookie } from '@/lib/auth'
import { getMyProps, getUserPropRewards, login } from '@/lib/api2140'
import { num, settled } from '@/lib/metaverse'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ debrisSeq: string }>
  searchParams: Promise<{ name?: string | string[]; mapSeq?: string | string[]; mapName?: string | string[] }>
}

const primaryFilters = ['全部', '算力', '地票', '种族', 'NFTN', 'NFTX', 'NFT1']
const skillFilters = ['荣誉', '攻击', '守护', '窃取', '强化', '特殊', '更多']

export default async function PropBackpackReplicaPage({ params, searchParams }: PageProps) {
  const { debrisSeq } = await params
  const query = await searchParams
  const debrisName = first(query.name) || '丝绸之路'
  const userCookie = await getUserCookie()
  const agentCookie = userCookie ? null : await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const cookie = userCookie ?? agentCookie ?? ''
  const [data, rewards] = await Promise.all([
    settled(getMyProps(cookie), null),
    settled(getUserPropRewards(cookie), null),
  ])

  const templates = normalizeTemplateMap(data?.prop_templates)
  const props = normalizeProps(data?.props)
  const owned = props.map((prop) => {
    const seq = String(prop.prop_t_seq ?? prop.prop_template_seq ?? prop.template_seq ?? prop.t_seq ?? prop.seq ?? '')
    return { ...templates[seq], ...prop, seq: templates[seq]?.seq ?? seq, prop_seq: prop.seq }
  }).filter((item) => item.seq)
  const hasReward = normalizeProps(rewards?.rewards ?? rewards?.data ?? rewards).length > 0

  return (
    <main className="prop-app-shell">
      <section className="prop-bp-contain">
        <TopBar title="我的道具" backHref={`/racewar/debris/${debrisSeq}`} />

        <section className="prop-bp-status">
          <div className="prop-bp-place">
            <span>{debrisName}</span>
            <b>基地道具背包</b>
          </div>
          <button type="button" aria-label="说明" className="prop-bp-doubt" />
        </section>

        <div className="prop-bp-row-buttons" aria-label="道具快捷入口">
          <Link href={`/racewar/debris/${debrisSeq}/history`}>使用记录</Link>
          <Link href="/prop/rank">排行</Link>
          <Link href="/prop">攻略</Link>
          {hasReward && <span className="prop-bp-reward-dot" />}
        </div>

        <section className="prop-bp-tools">
          <div className="prop-bp-tool-title">
            <span>道具技能</span>
            <Link href="/prop">铸造道具</Link>
          </div>
          <div className="prop-bp-switch-row">
            {primaryFilters.map((filter, index) => <span key={filter} className={index === 0 ? 'checked' : ''}>{filter}</span>)}
          </div>
          <div className="prop-bp-switch-row prop-bp-switch-secondary">
            {skillFilters.map((filter) => <span key={filter}>{filter}</span>)}
          </div>
        </section>

        <section className="prop-bp-props">
          {owned.map((prop, index) => <BackpackProp key={`${prop.prop_seq ?? prop.seq}-${index}`} prop={prop} />)}
          {!owned.length && (
            <div className="prop-bp-empty">
              <div className="prop-bp-empty-icon" />
              <p>暂无道具</p>
            </div>
          )}
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

function BackpackProp({ prop }: { prop: any }) {
  const rare = clampRare(prop.classify_rare ?? prop.rare ?? prop.level)
  const count = prop.amount ?? prop.num ?? prop.count ?? 1
  return (
    <Link href={`/prop/${prop.seq}`} className={`prop-bp-prop prop-bp-prop-${Math.max(0, rare - 2)}`}>
      <div className="prop-bp-icon-box">
        {prop.icon && <img src={asset(prop.icon)} alt={prop.name ?? '道具'} className="prop-bp-icon-img" />}
        {Number(count) > 1 && <span className="prop-bp-count">×{num(count)}</span>}
      </div>
      <span className={`prop-bp-rare prop-bp-rare-${rare}`} />
      {(prop.limit_time || prop.expire_time) && <span className="prop-bp-limit">限时</span>}
      <div className="prop-bp-name">{prop.name ?? '-'}</div>
    </Link>
  )
}

function normalizeTemplateMap(value: unknown) {
  if (!value || typeof value !== 'object') return {} as Record<string, any>
  if (Array.isArray(value)) return Object.fromEntries(value.map((item) => [String(item?.seq ?? ''), item]).filter(([key]) => key))
  return value as Record<string, any>
}

function normalizeProps(value: unknown): any[] {
  if (!value) return []
  if (Array.isArray(value)) return value.flatMap((item) => Array.isArray(item) ? item : [item])
  if (typeof value === 'object') return Object.values(value).flatMap((item) => Array.isArray(item) ? item : [item])
  return []
}

function asset(path?: string) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `https://www.2140city.cn${path.startsWith('/') ? path : `/${path}`}`
}

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

function clampRare(value: unknown) {
  const n = Number(value ?? 1)
  return Math.max(1, Math.min(5, Number.isFinite(n) ? n : 1))
}
