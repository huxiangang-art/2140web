import Link from 'next/link'
import { getLoggedIn, getUserCookie } from '@/lib/auth'
import { getUserInfo, getUserSpace, login } from '@/lib/api2140'
import { num, settled } from '@/lib/metaverse'

export const dynamic = 'force-dynamic'

const raceNames = ['?', '人族', '熵族', '神族', '晓族', 'AI族', '零族']
const levelTitles = [
  ['Lv1', 'Lv2', 'Lv3', 'Lv4', 'Lv5', 'Lv6', 'Lv7', 'Lv8', 'Lv9', 'Lv10', 'Lv11'],
  ['Lv1 自由民', 'Lv2 吟游骑士', 'Lv3 梦醒者', 'Lv4 摆渡客', 'Lv5 术算师', 'Lv6 大族长', 'Lv7 量子态', 'Lv8 深渊氏', 'Lv9 控维长老', 'Lv10 以太先知', 'Lv11 创世主'],
  ['Lv1 KBM', 'Lv2 MBM', 'Lv3 GBM', 'Lv4 TBM', 'Lv5 PBM', 'Lv6 EBM', 'Lv7 ZBM', 'Lv8 YBM', 'Lv9 BBM', 'Lv10 NBM', 'Lv11 DBM'],
  ['Lv1 开蒙', 'Lv2 造翼', 'Lv3 翔舞', 'Lv4 知微', 'Lv5 阅世', 'Lv6 练达', 'Lv7 出世', 'Lv8 通幽', 'Lv9 化境', 'Lv10 神隐', 'Lv11 圭元'],
  ['Lv1 种族碎片', 'Lv2 灵聚者', 'Lv3 玄冥者', 'Lv4 寐语者', 'Lv5 都知者', 'Lv6 链接者', 'Lv7 殊相', 'Lv8 圣哲', 'Lv9 谙晓', 'Lv10 寤晓', 'Lv11 破晓'],
  ['Lv1 1010', 'Lv2 1001', 'Lv3 1000', 'Lv4 111', 'Lv5 110', 'Lv6 101', 'Lv7 100', 'Lv8 11', 'Lv9 10', 'Lv10 1', 'Lv11 0'],
  ['Lv1 零', 'Lv2 壹', 'Lv3 类', 'Lv4 抽象', 'Lv5 继承', 'Lv6 仿生', 'Lv7 独立', 'Lv8 协同', 'Lv9 灵动', 'Lv10 栩生', 'Lv11 神似'],
]
const levelDemands = [0, 300, 1000, 2000, 5000, 10000, 30000, 50000, 100000, 300000, 600000]

export default async function UserSpacePage() {
  const [loggedIn, userCookie, sysCookie] = await Promise.all([
    getLoggedIn(),
    getUserCookie(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])
  const cookie = userCookie ?? sysCookie ?? ''
  const [space, infoRes] = await Promise.all([
    settled(getUserSpace(cookie, '0'), null),
    settled(getUserInfo(cookie), null),
  ])
  const info = infoRes?.ret === 0 ? infoRes.data : null
  const data = space ?? normalizeInfo(info)
  const lv = getLevel(data?.user_race ?? data?.race, data?.total_token ?? data?.token)
  const yearPct = Math.round(((new Date().getFullYear() - 2021) / (2140 - 2021)) * 100)
  const avatar = asset(data?.user_avatar ?? data?.avatar) || '/apk/avatar_default.jpg'
  const nick = data?.user_nick ?? data?.nickname ?? '2140'

  return (
    <main className="user-space-shell">
      <section className="user-space-contain">
        <div className="user-space-bg-strip">
          <div style={{ backgroundImage: "url('/apk/user_space_star_bg1.jpg')" }} />
          <div style={{ backgroundImage: "url('/apk/user_space_star_bg2.jpg')" }} />
          <div style={{ backgroundImage: "url('/apk/user_space_star_bg3.jpg')" }} />
        </div>

        <header className="user-space-top">
          <Link href="/" className="user-space-return" aria-label="返回首页" />
          <div className="user-space-title">
            <span>{data?.user_space_desc || `欢迎来到${nick}的元宇宙`}</span>
          </div>
          <Link href="/profile" className="user-space-edit" aria-label="编辑空间" />
          <div className="user-space-lv-box">
            <div className={`user-space-medal medal-${lv.index + 1}`} />
            {[1, 2, 3, 4, 5].map((n) => <LevelDot key={n} n={n} checked={n <= lv.index + 1} />)}
            {[11, 10, 9, 8, 7, 6].map((n) => <LevelDot key={n} n={n} checked={n <= lv.index + 1} />)}
          </div>
        </header>

        <section className="user-space-middle">
          <div className="user-space-dossier-stage">
            <div className="user-space-dossier is-left">
              <Dossier
                rows={[
                  ['投资等级', data?.user_investment_lv ?? 'Lv1', '/write/invest'],
                  ['版钻', data?.user_investment_coin ?? 0, '/write/invest'],
                  ['职位', data?.user_official_name ?? '-', '/parliament'],
                  ['经验值', data?.user_active_val ?? 0, '/parliament'],
                ]}
              />
            </div>
            <div className="user-space-dossier is-center">
              <Dossier
                rows={[
                  ['昵称', nick, '/profile'],
                  ['元ID', data?.user_id ?? (info as any)?.stu_id ?? 'AD2140', '/profile'],
                  ['种族', raceNames[Number(data?.user_race ?? data?.race ?? 0)] ?? '-', '/races'],
                  ['道具', data?.user_prop_count ?? 0, '/prop/backpack'],
                ]}
              />
            </div>
            <div className="user-space-dossier is-right">
              <Dossier
                rows={[
                  ['联络', data?.user_contact_txt ?? '无', '/invite'],
                  ['等级', lv.title, '/profile'],
                  ['创世', data?.user_creation_i_lv ?? 0, '/metaverse/contribution'],
                  ['地票', data?.user_contribute ?? 0, '/metaverse/war/ranks'],
                ]}
              />
            </div>
          </div>
          <div className="user-space-stars">
            {Array.from({ length: 18 }, (_, i) => <span key={i} className={`star-${(i % 9) + 1}`} />)}
          </div>
        </section>

        <Link href="/hashrate" className="user-space-engine" aria-label="算力引擎" />
        <Link href="/blindbox" className="user-space-blindbox" aria-label="盲盒" />

        <footer className="user-space-bottom">
          <div className="user-space-bottom-tip">AD2021 - AD2140</div>
          <div className="user-space-time">
            <span>2021</span>
            <strong>{yearPct}</strong>
            <span>2140</span>
          </div>
          <div className="user-space-hashrate">{num(data?.hashrate ?? data?.total_hashrate ?? info?.hashrate ?? 0)}</div>
          <div className="user-space-token">{num(Math.floor(Number(data?.token ?? data?.total_token ?? info?.token ?? 0)))}</div>
          <div className="user-space-user">
            <img src={avatar} alt={nick} />
            <div>{nick}</div>
          </div>
          <Link href="/user-space/journal" className="user-space-journal" aria-label="日志" />
          <Link href="/profile" className="user-space-archives" aria-label="档案" />
        </footer>
      </section>
    </main>
  )
}

function Dossier({ rows }: { rows: Array<[string, any, string?]> }) {
  return (
    <div className="user-space-dossier-content">
      <div className="user-space-dossier-title">个人档案</div>
      {rows.map(([name, value, href]) => {
        const content = (
          <>
            <span>{name}</span>
            <strong>{String(value ?? '-')}</strong>
          </>
        )
        return href ? (
          <Link className="user-space-dossier-row" href={href} key={name}>
            {content}
          </Link>
        ) : (
          <div className="user-space-dossier-row" key={name}>
            {content}
          </div>
        )
      })}
    </div>
  )
}

function LevelDot({ n, checked }: { n: number; checked: boolean }) {
  return <div className={`user-space-lv-dot ${checked ? 'is-checked' : ''}`}>{n}</div>
}

function normalizeInfo(info: any) {
  if (!info) return null
  return {
    user_nick: info.nickname,
    user_avatar: info.avatar,
    user_race: info.race,
    token: info.token,
    total_token: info.total_token,
    hashrate: info.hashrate,
    user_id: info.stu_id,
  }
}

function getLevel(raceValue?: string | number, tokenValue?: string | number) {
  const race = Math.max(0, Math.min(6, Number(raceValue ?? 0)))
  const token = Number(tokenValue ?? 0)
  let index = 0
  for (let i = levelDemands.length - 1; i >= 0; i--) {
    if (token >= levelDemands[i]) {
      index = i
      break
    }
  }
  return { index, title: levelTitles[race]?.[index] ?? `Lv${index + 1}` }
}

function asset(src?: string) {
  if (!src) return ''
  return src.startsWith('http') ? src : `https://www.2140city.cn${src}`
}
