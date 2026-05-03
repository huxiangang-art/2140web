import Link from 'next/link'
import { getTreasureMaze, login } from '@/lib/api2140'

export const dynamic = 'force-dynamic'

type MazePayload = {
  map?: string | MazePoint[][]
  answers?: string | Array<string | number>
  questions?: string | Array<{ result?: string | number }>
  select_points?: string | Array<string | number>
  card_count?: string | number
  question_type?: string
  restart_price?: string | number
}

type MazePoint = [number, number, unknown, unknown, number]

const numTxt = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
const typeLabel = ['', '普通题', '钻石题', '挑战题']

export default async function TreasureMazePage() {
  const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const raw = cookie ? await getTreasureMaze(cookie).catch(() => null) : null
  const maze = isRecord(raw) ? raw as MazePayload : null
  const map = normalizeMap(parseMaybeJson<MazePoint[][]>(maze?.map, []))
  const answers = parseMaybeJson<Array<string | number>>(maze?.answers, [])
  const questions = parseMaybeJson<Array<{ result?: string | number }>>(maze?.questions, [])
  const selected = parseMaybeJson<Array<string | number>>(maze?.select_points, []).map(value => Number(value)).filter(Number.isFinite)
  const rewards = computeRewards(map, selected, answers, questions)
  const nextPoint = getNextPoint(map, selected)

  return (
    <main className="treasure-maze-shell">
      <section className="treasure-maze-page">
        <header className="treasure-maze-top">
          <Link href="/treasure" className="treasure-maze-return" aria-label="返回脑矩阵首页" />
          <div className="treasure-maze-title">
            <span className="treasure-maze-title-tip">脑矩阵·</span>
            <span className="treasure-maze-title-type">{maze?.question_type ?? '综合'}</span>
          </div>
          <Link href="/treasure/rank" className="treasure-maze-rank" aria-label="奖励排行" />
        </header>

        <div className="treasure-maze-total-rewards">
          <div className="treasure-maze-hashrate-reward">{rewards.hashrate}</div>
          <div className="treasure-maze-debris-reward">{rewards.debris}</div>
          <div className="treasure-maze-card-count">{maze?.card_count ?? 0}</div>
        </div>

        <section className="treasure-maze-board">
          <div className="treasure-maze-decoration treasure-maze-decoration-top" />
          <div className="treasure-maze-content">
            <table className="treasure-maze-map" aria-label="脑矩阵地图">
              <tbody>
                {map.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((point, colIndex) => {
                      const index = rowIndex * 5 + colIndex
                      const state = getPointState(index, rowIndex, selected, answers, questions)
                      return (
                        <td key={index} className={`treasure-maze-point treasure-maze-point-${point[0]} ${state}`} aria-label={`第${index + 1}格`} />
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="treasure-maze-decoration treasure-maze-decoration-bottom" />
        </section>

        <nav className="treasure-maze-buttons">
          <Link href="/treasure/maze" className="treasure-maze-button">重新开始</Link>
          <Link href="/invite" className="treasure-maze-button">分享得3张复活卡</Link>
        </nav>

        {nextPoint && (
          <>
            <div className="treasure-maze-mask" />
            <section className="treasure-maze-start-box">
              <div className="treasure-maze-start-title">第{numTxt[selected.length] ?? selected.length + 1}关：{typeLabel[nextPoint[0]] ?? '普通题'}</div>
              <div className="treasure-maze-start-type">
                <span className="treasure-maze-start-decoration" />
                <span className="treasure-maze-start-type-text">{maze?.question_type ?? '综合'}</span>
                <span className="treasure-maze-start-decoration" />
              </div>
              <div className="treasure-maze-start-rewards">
                <Reward label="答对奖励" value={nextPoint[0] === 3 ? 'X2' : `+${nextPoint[1] * nextPoint[0]}`} />
                <Reward label="答错惩罚" value={nextPoint[0] === 3 ? '/2' : '-0'} />
                <Reward label="可能获得" value={`+${nextPoint[4] ?? 0}`} debris />
              </div>
              <div className="treasure-maze-start-button">开始答题</div>
              <div className="treasure-maze-readonly">答题提交接口待接入，当前为 APK 视觉复刻。</div>
            </section>
          </>
        )}
      </section>
    </main>
  )
}

function Reward({ label, value, debris = false }: { label: string; value: string | number; debris?: boolean }) {
  return (
    <div className="treasure-maze-reward">
      <div className="treasure-maze-reward-name">{label}</div>
      <div className={`treasure-maze-reward-amount ${debris ? 'treasure-maze-reward-debris' : ''}`}>{value}</div>
    </div>
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object'
}

function parseMaybeJson<T>(value: unknown, fallback: T): T {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T
    } catch {
      return fallback
    }
  }
  return (value ?? fallback) as T
}

function normalizeMap(input: MazePoint[][]): MazePoint[][] {
  if (Array.isArray(input) && input.length) return input
  return Array.from({ length: 10 }, (_, row) =>
    Array.from({ length: 5 }, (_, col) => {
      const type = row > 7 ? 3 : (row + col) % 4 === 0 ? 2 : 1
      return [type, 10 + row * 2, null, null, row === 9 && col === 2 ? 1 : 0]
    })
  )
}

function computeRewards(map: MazePoint[][], selected: number[], answers: Array<string | number>, questions: Array<{ result?: string | number }>) {
  let hashrate = 0
  let debris = 0
  for (let i = 0; i < selected.length; i++) {
    const point = pointAt(map, selected[i])
    if (!point) continue
    const correct = String(answers[i] ?? '') === String(questions[i]?.result ?? '')
    if (correct) {
      hashrate += point[0] === 3 ? hashrate : point[1] * point[0]
    } else if (point[0] === 3) {
      hashrate -= Math.ceil(hashrate / 2)
    }
    debris += point[4] ?? 0
  }
  return { hashrate, debris }
}

function getPointState(index: number, rowIndex: number, selected: number[], answers: Array<string | number>, questions: Array<{ result?: string | number }>) {
  const selectedIndex = selected.indexOf(index)
  if (selectedIndex >= 0) {
    return String(answers[selectedIndex] ?? '') === String(questions[selectedIndex]?.result ?? '') ? 'treasure-maze-success' : 'treasure-maze-failure'
  }
  const invisibleRows = Math.max(0, 10 - 4 - selected.length)
  if (rowIndex < invisibleRows) return 'treasure-maze-mask-point'
  return index === getNextIndex(selected) ? 'treasure-maze-can-select' : ''
}

function getNextIndex(selected: number[]) {
  if (!selected.length) return 45
  return Math.max(0, selected[selected.length - 1] - 5)
}

function getNextPoint(map: MazePoint[][], selected: number[]) {
  if (selected.length >= 10) return null
  return pointAt(map, getNextIndex(selected))
}

function pointAt(map: MazePoint[][], index: number) {
  const row = Math.floor(index / 5)
  const col = index % 5
  return map[row]?.[col]
}
