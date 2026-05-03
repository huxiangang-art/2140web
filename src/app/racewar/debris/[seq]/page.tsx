import Link from 'next/link'
import { getLoggedIn } from '@/lib/auth'
import { getDebrisDetail, getDebrisHealthInfo, getDebrisRankDetail, getDebrisResidents, login, RACE_COLORS, RACE_NAMES } from '@/lib/api2140'
import { arr, num, settled } from '@/lib/metaverse'

export const dynamic = 'force-dynamic'

async function getData(seq: string, cookie: string) {
  const [detail, health, residents, rank] = await Promise.all([
    settled(getDebrisDetail(cookie, seq), null),
    settled(getDebrisHealthInfo(cookie, seq), null),
    settled(getDebrisResidents(cookie, seq, 0), null),
    settled(getDebrisRankDetail(cookie, seq), null),
  ])
  return { detail, health, residents, rank }
}

export default async function DebrisDetailPage({ params }: { params: Promise<{ seq: string }> }) {
  const { seq } = await params
  await getLoggedIn()
  const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const { detail, health, residents, rank } = await getData(seq, cookie ?? '')

  if (!detail) {
    return (
      <main className="min-h-screen bg-black p-6 text-center text-sm text-white/40">
        碎片数据加载失败
      </main>
    )
  }

  const bg = racewarAsset(detail.bg) || '/racewar/space.jpg'
  const raceRank = parseRaceRank(detail.race_rank)
  const residentList = arr(residents?.data ?? residents)
  const rankList = arr(rank?.data ?? rank?.user_daily ?? rank)
  const raceName = detail.race_name || raceLabel(detail.race_seq)
  const lordName = detail.user_name || detail.user_nickname || detail.nickname || '暂无'
  const hashrateSum = detail.hashrate_sum ?? health?.hashrate_sum ?? detail.my_contribute_sum ?? 0
  const hashratePool = detail.hashrate_pool ?? health?.hashrate_pool ?? detail.hashrate_pool_sum ?? 0
  const propDrawHref = `/prop/draw/${seq}?name=${encodeURIComponent(detail.name ?? '')}`
  const propBackpackHref = `/prop/backpack/${seq}?name=${encodeURIComponent(detail.name ?? '')}&mapSeq=${encodeURIComponent(detail.map_seq ?? '')}&mapName=${encodeURIComponent(detail.map_name ?? '')}`
  const showAllotInfo = Number(detail.plunder_status) === 3 || detail.plunder_time || detail.plunder_time_c
  const allotText = Number(detail.plunder_status) === 1
    ? `基地票仓审议倒计时：${hourText(detail.plunder_time)}`
    : `基地票仓重启倒计时：${hourText(detail.plunder_time_c)}`
  const showHealth = Number(detail.in_branch_map) === 1 || detail.health_por !== undefined
  const healthPor = clampPercent(detail.health_por ?? health?.health_por ?? 0)
  const hasError = String(detail.error_status ?? '1') !== '1'

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="rw-detail-shell">
        <div className="rw-detail-screen" style={{ backgroundImage: `url('${bg}')` }}>
          <Link href="/metaverse" aria-label="返回" className="rw-detail-return" />
          <button type="button" aria-label="分享" className="rw-detail-share" />

          <Link href={`/racewar/debris/${seq}/history`} className="rw-detail-top">
            <div className="rw-detail-top-side">
              <div className="rw-detail-top-label">占领种族</div>
              <div className="rw-detail-race-name">{raceName || '-'}</div>
            </div>
            <div className="rw-detail-name">{detail.name}</div>
            <div className="rw-detail-top-side">
              <div className="rw-detail-top-label rw-detail-lord-label">领主</div>
              <div className="rw-detail-lord"><span>{lordName}</span></div>
            </div>
          </Link>

          <section className="rw-detail-race-rank">
            {raceRank.length ? raceRank.slice(0, 6).map((record, index) => (
              <RaceRecord key={`${record.race_seq ?? record.race ?? index}`} record={record} max={Number(raceRank[0]?.amount_sum ?? raceRank[0]?.amount ?? 0)} index={index} />
            )) : (
              <RaceRecord record={{ race_seq: detail.race_seq, amount_sum: hashrateSum }} max={Number(hashrateSum) || 1} index={0} />
            )}
          </section>

          <div className="rw-detail-left-buttons">
            <RoundAction href="/metaverse/war/contribute" icon="icon11" label="捐赠" visible={Number(detail.can_donate ?? 1) === 1} />
            <RoundAction href={propBackpackHref} icon="icon13" label="道具" visible />
            <RoundAction href="#status" icon="icon12" label="基地状态" danger visible={hasError} />
          </div>

          <div className="rw-detail-right-buttons">
            <RoundAction href="/metaverse/war/ranks" icon="icon21" label="地票榜" visible />
            <RoundAction href="/metaverse/war/reports" icon="icon22" label="战况" visible />
            <RoundAction href="/racewar/tasks" icon="icon23" label="基地设定" visible />
            <RoundAction href="/racewar/tasks" icon="icon24" label="基地任务" visible={!showHealth} />
          </div>

          {showAllotInfo && (
            <Link href="/metaverse/war/reports" className="rw-detail-allot-info">
              <span className="rw-detail-allot-icon" />
              <span className="rw-detail-allot-text">{allotText}</span>
            </Link>
          )}

          <div className="rw-detail-small-left">
            <RoundAction href="/plaza" icon="icon24" label="广场" visible />
          </div>

          {showHealth && (
            <Link href={`/racewar/debris/${seq}#health`} className="rw-detail-health">
              <div className="rw-detail-health-por">{healthPor}%</div>
              <div className="rw-detail-health-bg">
                <span className="rw-detail-health-bar" style={{ height: `${Math.max(2, Math.round(healthPor * 0.18))}vw` }} />
              </div>
            </Link>
          )}

          {Number(detail.is_boss_dst) === 1 && <button type="button" aria-label="Boss 影响" className="rw-detail-boss-dst" />}

          <div className="rw-detail-small-right">
            <RoundAction href={propDrawHref} icon="icon18" label="获取道具" visible />
            <RoundAction href={propBackpackHref} icon="icon19" label="我的道具" visible />
          </div>

          <section className="rw-detail-bottom">
            <div className="rw-detail-hashrate-info">
              <div>今日地票：<span>{num(hashrateSum)}</span></div>
              <div>基地票仓：<span>{num(hashratePool)}</span></div>
            </div>
            <div className="rw-detail-bottom-buttons">
              <Link href="/metaverse/war/reports">地票分配</Link>
              <Link href="#occupy">占领基地</Link>
            </div>
          </section>
        </div>

        <section id="occupy" className="rw-detail-cost-panel">
          <div className="rw-detail-cost-title">占领基地流程</div>
          <div className="rw-detail-cost-card">
            <div className="rw-detail-cost-card-title">贡献地票</div>
            <div className="rw-detail-cost-row">
              <span>我的地票</span><b>{num(detail.my_contribute_sum ?? 0)}</b>
              <span>限制</span><b>{num(detail.contribute_limit ?? 0)}</b>
            </div>
          </div>
          <div className="rw-detail-cost-card">
            <div className="rw-detail-cost-card-title">当前排行</div>
            <div className="rw-detail-mini-list">
              {(rankList.length ? rankList : residentList).slice(0, 6).map((item, index) => (
                <div key={item.seq ?? item.user_seq ?? index}><span>{index + 1}. {item.nickname ?? item.user_nick ?? item.user_nickname ?? '-'}</span><b>{num(item.amount_sum ?? item.hashrate ?? item.amount ?? 0)}</b></div>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}

function RaceRecord({ record, max, index }: { record: any; max: number; index: number }) {
  const raceSeq = record.race_seq ?? record.race ?? index + 1
  const amount = Number(record.amount_sum ?? record.amount ?? record.value ?? 0)
  const width = amount > 0 && max > 0 ? 0.2 + Math.floor(amount / max * 16) : 0
  return (
    <div className="rw-detail-race-record">
      <div className="rw-detail-race-badge" style={{ color: RACE_COLORS[String(raceSeq)] ?? '#a4a4a4' }}>{raceLabel(raceSeq).replace('族', '') || '-'}</div>
      <div className="rw-detail-race-bar" style={{ width: `calc(var(--rvw) * ${width})` }} />
      <div className="rw-detail-race-amount">{amount > 10000 ? `${Math.floor(amount / 1000)}K` : num(amount)}</div>
    </div>
  )
}

function RoundAction({ href, icon, label, visible, danger = false }: { href: string; icon: string; label: string; visible: boolean; danger?: boolean }) {
  if (!visible) return null
  return (
    <Link href={href} className={`rw-detail-button1 ${danger ? 'rw-detail-danger' : ''}`}>
      <span className={`rw-detail-button-icon ${icon}`} />
      <span className="rw-detail-button-name">{label}</span>
    </Link>
  )
}

function parseRaceRank(value: any): any[] {
  if (Array.isArray(value)) return value
  if (!value) return []
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : arr(Object.values(parsed))
    } catch {
      return []
    }
  }
  if (typeof value === 'object') return arr(Object.values(value))
  return []
}

function raceLabel(value: unknown) {
  return RACE_NAMES[String(value ?? '')] ?? ''
}

function hourText(value: unknown) {
  const n = Number(value ?? 0)
  return `${n < 1 ? '小于1' : Math.floor(n)}小时`
}

function clampPercent(value: unknown) {
  return Math.max(0, Math.min(100, Math.round(Number(value ?? 0))))
}

function racewarAsset(path?: string) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const normalized = path.replace(/^\.\.\/image\/racewar\//, '/racewar/').replace(/^\/image\/racewar\//, '/racewar/')
  if (normalized.startsWith('/racewar/')) return normalized
  if (normalized.startsWith('/')) return `https://www.2140city.cn${normalized}`
  return path
}
