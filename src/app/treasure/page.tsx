import Link from 'next/link'
import { getTreasureUserInfo, getUserInfo, login } from '@/lib/api2140'

export const dynamic = 'force-dynamic'

type TreasureUserInfo = {
  hashrate?: string | number
  card_count?: string | number
  play_count?: string | number
  debris_count?: string | number
  win_count?: string | number
}

type HomeUserInfo = {
  nickname?: string
  avatar?: string
}

export default async function TreasurePage() {
  const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const [infoRes, userRes] = await Promise.allSettled([
    cookie ? getTreasureUserInfo(cookie) : Promise.resolve(null),
    cookie ? getUserInfo(cookie) : Promise.resolve(null),
  ])

  const info = infoRes.status === 'fulfilled' ? infoRes.value as TreasureUserInfo | null : null
  const userRaw = userRes.status === 'fulfilled' ? userRes.value : null
  const user = userRaw?.ret === 0 ? userRaw.data : null
  const playCount = Number(info?.play_count ?? 0)
  const winCount = Number(info?.win_count ?? 0)
  const winRate = playCount === 0 ? 0 : Math.floor((winCount / playCount) * 100)

  return (
    <main className="treasure-index-shell">
      <section className="treasure-index-contain">
        <header className="treasure-index-top">
          <Link href="/" className="treasure-index-return" aria-label="返回首页" />
          <Link href="/treasure/rule" className="treasure-index-doubt" aria-label="脑矩阵规则" />
          <Link href="/treasure/rank" className="treasure-index-rank" aria-label="奖励排行" />
        </header>

        <section className="treasure-index-user-card">
          <div className="treasure-index-avatar">
            <img src={asset((user as HomeUserInfo | null)?.avatar) || '/apk/avatar_default.jpg'} alt={(user as HomeUserInfo | null)?.nickname ?? 'avatar'} />
          </div>
          <div className="treasure-index-nickname">{(user as HomeUserInfo | null)?.nickname ?? '2140'}</div>
          <div className="treasure-index-stats">
            <Stat label="总场次" value={Math.floor(playCount / 10)} />
            <Stat label="总算力" value={info?.hashrate ?? 0} />
            <Stat label="胜率" value={`${winRate}%`} />
          </div>
          <div className="treasure-index-card-row">
            <div className="treasure-index-revive-card">
              复活卡 <span>{info?.card_count ?? 0}</span>
            </div>
            <Link href="/invite" className="treasure-index-share">邀请好友得3张复活卡</Link>
          </div>
        </section>

        <Link href="/treasure/maze" className="treasure-index-big-button treasure-index-to-maze">
          <div className="treasure-index-button-name">脑矩阵</div>
          <div className="treasure-index-button-tips">知识即算力，10题通关</div>
        </Link>

        <Link href="/prop" className="treasure-index-big-button treasure-index-to-future">
          <div className="treasure-index-button-name">未来碎片</div>
          <div className="treasure-index-button-tips">收集碎片，解密碎片背后的秘密</div>
          <div className="treasure-index-button-info">未来碎片：<span>{info?.debris_count ?? 0}</span></div>
        </Link>

        <nav className="treasure-index-question-buttons">
          <Link href="/treasure/questions" className="treasure-index-question-button">我的题目</Link>
          <Link href="/treasure/question-add" className="treasure-index-question-button">我要出题</Link>
        </nav>
      </section>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="treasure-index-stat">
      <div className="treasure-index-stat-label">{label}</div>
      <div className="treasure-index-stat-value">{value}</div>
    </div>
  )
}

function asset(path?: string) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `https://www.2140city.cn${path.startsWith('/') ? path : `/${path}`}`
}
