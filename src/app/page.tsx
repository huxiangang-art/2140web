import Link from 'next/link'
import { cookies } from 'next/headers'
import { getHashrateBalls, getUserInfo, login, type HashrateBall } from '@/lib/api2140'
import { HomeHashrateAmount, HomeHashrateBalls, type HomeHashrateBall } from './HomeHashrateCollector'
import { settled } from '@/lib/metaverse'

export const dynamic = 'force-dynamic'

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

async function getHomeData() {
  const store = await cookies()
  const userCookie = store.get('ci_session')?.value
  const sysCookie = userCookie ? null : await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const cookie = userCookie ?? sysCookie ?? ''
  const [userRes, balls] = await Promise.all([
    settled(getUserInfo(cookie), null),
    settled(getHashrateBalls(cookie), []),
  ])
  return { loggedIn: !!userCookie, user: userRes?.ret === 0 ? userRes.data : null, balls: Array.isArray(balls) ? balls as HashrateBall[] : [] }
}

export default async function Home() {
  const { loggedIn, user, balls } = await getHomeData()
  const level = getUserLevel(user?.race, user?.total_token)
  const raceLabel = user?.race ? ['?', '人', '熵', '神', '晓', 'AI', '零'][Number(user.race)] ?? '' : ''
  const visibleBalls: HomeHashrateBall[] = balls
    .filter(ball => isReceivable(ball.rec_time))
    .slice(0, 8)
    .map((ball, index) => ({
      seq: String(ball.seq),
      hashrate: ball.hashrate,
      b_level: ball.b_level,
      point: getBallPoint(Number(ball.hashrate ?? 0), Number(ball.b_level ?? 0), index),
    }))

  return (
    <main className="app-home-shell">
      <section className="app-home-contain">
        <div className="app-home-top">
          <Link href={loggedIn ? '/user-space' : '/login'} className="app-home-profile-link">
            <div className="app-home-avatar-bg">
              <div className="app-home-avatar">
                <img className="app-home-user-avatar" src={asset(user?.avatar) || '/home/avatar_default.jpg'} alt={user?.nickname ?? 'avatar'} />
              </div>
            </div>
            <div className="app-home-user-info">
              <div className="app-home-user-nickname">{user?.nickname ?? '点击登录'}</div>
              <div className="app-home-user-level">
                <div className="app-home-level-txt">{level.title}</div>
                <div className={`app-home-level-icon app-home-level-medal-${level.lv}`} />
                {raceLabel && <div className="app-home-user-race">{raceLabel}</div>}
              </div>
            </div>
          </Link>
          <div className="app-home-user-data">
            <HomeHashrateAmount initialHashrate={user?.hashrate ?? 0} />
            <Link href="/profile" className="app-home-user-token">
              <span className="app-home-amount">{Math.floor(Number(user?.token ?? 0)).toLocaleString()}</span>
              <span className="app-home-data-icon" />
            </Link>
          </div>
        </div>

        <Link href="/digital" className="app-home-to-genesis-keys" aria-label="数字人" />
        <Link href="/racewar/tasks" className="app-home-to-branch-guide"><span>新手</span></Link>
        <Link href="/user-space" className="app-home-to-user-space" aria-label="个人空间" />
        <Link href="/invite" className="app-home-to-invite" aria-label="邀请" />

        <section className="app-home-middle">
          <Link href="/propaganda" className="app-home-center-bg" aria-label="宣传中心">
            <div className="app-home-center-icon" />
            <div className="app-home-train-icon" />
            <div className="app-home-lightning" />
          </Link>
          <div className="app-home-bottom-icon" />

          <div className="app-home-left-buttons">
            <HomeMiddleButton href="/write" cls="button1" label="幻次元" />
            <HomeMiddleButton href="/hashrate" cls="button2" label="算力池" />
            <HomeMiddleButton href="/parliament" cls="button3" label="议事厅" />
            <HomeMiddleButton href="/treasure" cls="button4" label="脑矩阵" />
          </div>
          <div className="app-home-right-buttons">
            <HomeMiddleButton href="/metaverse" cls="button8" label="元宇宙" />
            <HomeMiddleButton href="/store" cls="button7" label="N生活" />
            <HomeMiddleButton href="/nft" cls="button11" label="NFT" />
            <HomeMiddleButton href="/plaza" cls="button10" label="广 场" />
          </div>

          <HomeHashrateBalls initialHashrate={user?.hashrate ?? 0} balls={visibleBalls} loggedIn={loggedIn} />
        </section>

        <nav className="app-home-bottom-buttons">
          <Link href="/" className="app-home-botton app-home-to-index">首页</Link>
          <Link href="/tasks" className="app-home-botton app-home-to-task"><span className="app-home-to-task-icon" />算力</Link>
          <Link href="/profile" className="app-home-botton app-home-to-my">基地</Link>
        </nav>
      </section>
    </main>
  )
}

function HomeMiddleButton({ href, cls, label }: { href: string; cls: string; label: string }) {
  return <Link href={href} className={`app-home-middle-button ${cls}`}>{label}</Link>
}

function getUserLevel(raceValue?: string | number, tokenValue?: string | number) {
  const race = Math.max(0, Math.min(6, Number(raceValue ?? 0)))
  const token = Number(tokenValue ?? 0)
  let lvIndex = 0
  for (let i = levelDemands.length - 1; i >= 0; i--) {
    if (token >= levelDemands[i]) {
      lvIndex = i
      break
    }
  }
  return { lv: lvIndex + 1, title: levelTitles[race]?.[lvIndex] ?? `Lv${lvIndex + 1}` }
}

function isReceivable(time?: string) {
  if (!time) return true
  const value = Date.parse(String(time).replace(/-/g, '/'))
  return !Number.isFinite(value) || value <= Date.now()
}

function getBallPoint(hashrate: number, level: number, index: number) {
  const radius = Math.max(4, Math.min(13, 4 + (level > 0 ? hashrate / 30 : 0)))
  const presets = [
    { top: 16, left: 30 }, { top: 28, left: 15 }, { top: 24, left: 47 }, { top: 42, left: 34 },
    { top: 52, left: 18 }, { top: 58, left: 46 }, { top: 36, left: 7 }, { top: 10, left: 48 },
  ]
  const p = presets[index % presets.length]
  return {
    radius,
    top: Math.max(radius + 2, Math.min(70 - radius, p.top)),
    left: Math.max(radius + 2, Math.min(60 - radius, p.left)),
  }
}

function asset(path?: string) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `https://www.2140city.cn${path.startsWith('/') ? path : `/${path}`}`
}
