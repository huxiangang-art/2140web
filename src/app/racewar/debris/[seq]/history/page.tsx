import Link from 'next/link'
import { getDebrisCitySets, getDebrisHealthInfo, getDebrisInfo, getDebrisPropUseRecords, getDebrisResidents, login, RACE_NAMES } from '@/lib/api2140'
import { arr, num, settled, stripHtml } from '@/lib/metaverse'

export const dynamic = 'force-dynamic'

async function getData(seq: string, cookie: string) {
  const [info, citySets, residents, records, health] = await Promise.all([
    settled(getDebrisInfo(cookie, seq), null),
    settled(getDebrisCitySets(cookie, seq, 1, 0), []),
    settled(getDebrisResidents(cookie, seq, 0), []),
    settled(getDebrisPropUseRecords(cookie, seq, 101, 1, 0, 10), { data: [], count: 0 }),
    settled(getDebrisHealthInfo(cookie, seq), null),
  ])
  return { info, citySets: arr(citySets), residents: arr((residents as any)?.data ?? residents), records: arr((records as any)?.data), health }
}

export default async function DebrisHistoryPage({ params }: { params: Promise<{ seq: string }> }) {
  const { seq } = await params
  const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const { info, citySets, residents, records, health } = await getData(seq, cookie ?? '')

  if (!info) {
    return <main className="min-h-screen bg-[#192928] p-6 text-center text-sm text-white/45">基地介绍加载失败</main>
  }

  const chapters = parseChapters(info.debris_chapters)
  const desc = stripHtml(info.debris_desc ?? info.desc ?? '')
  const healthPor = clampPercent(health?.health_por ?? info.health_por ?? 0)
  const showHealth = Number(info.in_branch_map) === 1 || health

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="rw-history-shell">
        <div className="rw-history-contain">
          <header className="rw-history-top">
            <Link href={`/racewar/debris/${seq}`} aria-label="返回" className="rw-history-return" />
            <div className="rw-history-title">基地介绍</div>
          </header>

          <section className="rw-history-info-column">
            <div className="rw-history-info-top">
              <div className="rw-history-dir">
                <span>{Number(info.map_type) === 2 ? '支线' : '主线'}</span>
                <span className="rw-history-arrow1">＞</span>
                <span>{info.map_name ?? '-'}</span>
                <span className="rw-history-arrow1">＞</span>
                <span>{info.debris_name ?? info.name ?? '-'}</span>
              </div>
              <div className="rw-history-debris-id"><span>{info.debris_id ?? info.id ?? '-'}</span></div>
            </div>

            <div className="rw-history-users">
              <HistoryUser title="地主" user={info.daily_user} fallbackAvatar={info.daily_user?.avatar} />
              <HistoryUser title="领主" user={info.total_user} fallbackAvatar={info.total_user?.avatar} />
              <HistoryRace race={info.debris_race ?? info.race_seq} />
            </div>

            <div className="rw-history-creator">
              <div className="rw-history-column-name">基地创世者：</div>
              <img src={absoluteAsset(info.creator_avatar) || '/avatar_default.jpg'} alt="" className="rw-history-creator-avatar" />
              <div className="rw-history-creator-nick">{info.creator_nick ?? '创世系统'}</div>
            </div>
          </section>

          <section className="rw-history-desc-column">
            <div className="rw-history-desc">
              {desc || '暂无基地介绍'}
              {desc.length > 110 && <span className="rw-history-desc-more">更多</span>}
            </div>
            {chapters.length > 0 && (
              <div className="rw-history-chapters">
                {chapters.map((chapter, index) => <div key={index} className="rw-history-chapter">{chapter}</div>)}
              </div>
            )}
          </section>

          {showHealth && (
            <section className="rw-history-health-column">
              <div className="rw-history-health-switchs">
                <div className="rw-history-health-switch rw-history-health-switch-checked">基地生命值</div>
                <div className="rw-history-health-switch-line">|</div>
                <div className="rw-history-health-switch">创世能量池</div>
              </div>
              <div className="rw-history-health-num"><span>{num(health?.health_num ?? info.health_num ?? 0)}</span>生命值</div>
              <div className="rw-history-health-bg">
                <span className="rw-history-health-bar" style={{ width: `${Math.max(2, Math.round(healthPor * 0.75))}%` }} />
                <div className="rw-history-health-por" style={{ left: `${Math.min(85, Math.max(0, healthPor * 0.85))}%` }}>{healthPor}%</div>
              </div>
              <div className="rw-history-health-tips">基地生命值每日下降30，基地和所属文明生命值一旦降为0，基地将不复存在。<span>查看更多﹥</span></div>
            </section>
          )}

          <HistoryColumn title="基地设定" more="查看更多»">
            {citySets.length ? citySets.slice(0, 4).map((item, index) => (
              <div key={item.seq ?? item.bill_seq ?? index} className="rw-history-city-set">{item.title}</div>
            )) : <div className="rw-history-empty">暂无设定</div>}
          </HistoryColumn>

          <HistoryColumn title="永恒居民" more="查看更多»">
            {residents.length ? (
              <div className="rw-history-residents">
                {residents.slice(0, 4).map((resident, index) => (
                  <div key={resident.user_seq ?? index} className="rw-history-resident">
                    <img src={absoluteAsset(resident.user_avatar ?? resident.avatar)} alt="" className="rw-history-resident-avatar" />
                    <div className="rw-history-resident-race">{raceShort(resident.user_race ?? resident.race)}</div>
                    <div className="rw-history-resident-nick">{resident.user_nick ?? resident.nickname ?? '-'}</div>
                  </div>
                ))}
              </div>
            ) : <div className="rw-history-empty">成为永恒居民，可拥有基地的所有权</div>}
          </HistoryColumn>

          <section className="rw-history-records-column">
            <div className="rw-history-column-top"><div className="rw-history-column-title">基地大事件</div></div>
            <div className="rw-history-record-switchs">
              <span className="rw-history-record-switch rw-history-record-switch-curr">全部</span>
              <span className="rw-history-record-switch">算力</span>
              <span className="rw-history-record-switch">地票</span>
              <span className="rw-history-record-switch rw-history-record-switch-end">大事件</span>
            </div>
            <div className="rw-history-use-records">
              {records.length ? records.map((record, index) => <UseRecord key={record.seq ?? index} record={record} />) : <div className="rw-history-empty">暂无基地大事件</div>}
            </div>
            <div className="rw-history-records-more">{records.length ? '下拉显示更多使用道具' : '没有更多了'}</div>
          </section>
        </div>
      </section>
    </main>
  )
}

function HistoryColumn({ title, more, children }: { title: string; more: string; children: React.ReactNode }) {
  return (
    <section className="rw-history-box-column">
      <div className="rw-history-column-top">
        <div className="rw-history-column-title">{title}</div>
        <div className="rw-history-column-more">{more}</div>
      </div>
      {children}
    </section>
  )
}

function HistoryUser({ title, user, fallbackAvatar }: { title: string; user: any; fallbackAvatar?: string }) {
  const seq = Number(user?.seq ?? 0)
  return (
    <div className="rw-history-user">
      <div className="rw-history-user-title">{title}</div>
      <img src={absoluteAsset(seq === 0 ? fallbackAvatar : user?.avatar) || '/avatar_doubt.jpg'} alt="" className="rw-history-user-avatar" />
      <div className="rw-history-user-race">{raceShort(user?.race)}</div>
      <div className="rw-history-user-nick">{user?.nickname ?? '暂无'}</div>
    </div>
  )
}

function HistoryRace({ race }: { race: unknown }) {
  return (
    <div className="rw-history-user">
      <div className="rw-history-user-title">占领种族</div>
      <div className="rw-history-race-avatar">{raceShort(race) || '?'}</div>
      <div className="rw-history-user-nick">{RACE_NAMES[String(race ?? '')] ?? '暂无'}</div>
    </div>
  )
}

function UseRecord({ record }: { record: any }) {
  return (
    <div className="rw-history-use-record">
      <div className="rw-history-record-top">{String(record.time ?? '').slice(0, 16)}</div>
      <div className="rw-history-record-body">
        <div className="rw-history-record-txt">
          <span>{Number(record.is_anonymous) === 1 ? '匿名用户' : (record.user_nick ?? '-')}</span>
          {' '}在 <span>{record.place_name ?? '-'}</span> 使用{Number(record.is_child) === 1 ? '的' : '了'} <span>{record.prop_name ?? '-'}</span> {Number(record.is_child) === 1 ? '生效' : ''}
        </div>
        {record.remark && <div className="rw-history-record-remark" dangerouslySetInnerHTML={{ __html: record.remark }} />}
      </div>
    </div>
  )
}

function parseChapters(value: any): string[] {
  if (!value) return []
  const source = typeof value === 'string' ? safeJson(value, []) : value
  return arr(source).map((item: any) => Array.isArray(item) ? item[2] : item?.title ?? item?.name ?? String(item)).filter(Boolean)
}

function safeJson(value: string, fallback: any) {
  try { return JSON.parse(value) } catch { return fallback }
}

function absoluteAsset(path?: string) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  if (path.startsWith('../image/')) return path.replace('../image/', '/')
  if (path.startsWith('/')) return `https://www.2140city.cn${path}`
  return `https://www.2140city.cn/${path}`
}

function raceShort(value: unknown) {
  return (RACE_NAMES[String(value ?? '')] ?? '').replace('族', '')
}

function clampPercent(value: unknown) {
  return Math.max(0, Math.min(100, Math.round(Number(value ?? 0))))
}
