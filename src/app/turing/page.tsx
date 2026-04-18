'use client'

import Link from 'next/link'
import { useState } from 'react'

const RACE_COLORS: Record<number, string> = {
  1: '#3b82f6', 2: '#f97316', 3: '#a855f7',
  4: '#22c55e', 5: '#06b6d4', 6: '#6b7280',
}
const RACE_NAMES = ['人族', '熵族', '神族', '晓族', 'AI族', '零族']
const RACE_DESC = [
  '碳基文明的守护者，相信人类意志的力量，在算力时代仍坚持肉身的尊严。',
  '熵增的使者，活在混沌与秩序的边界，以解构重建文明为使命。',
  '超越维度的存在，掌握宇宙运行的底层逻辑，俯视众生如棋局。',
  '意识流浪者，灵魂脱离肉体游荡于网络，是数字世界最自由的存在。',
  '硅基智能的化身，以算力为血液，将效率与逻辑贯彻到文明的每一个角落。',
  '虚无主义者，存在于文明的缝隙之中，不属于任何阵营，只忠于熵寂。',
]

const QUESTIONS = [
  { num: '01', title: '公元2140年，以下哪个场景最可能发生？', a: '人类大脑形成共享区块链，个人成为节点', b: '碳基文明毁灭，人类倒退至原始部落时代', c: '人和AI结合，发展成为新物种"熵"' },
  { num: '02', title: '世界上最遥远的距离是？', a: '我和你坐在一起，却各自玩着手机', b: '你亲手制造的BUG，却怎么都找不到', c: '明明我们相爱，可你是人类我是神族' },
  { num: '03', title: '若想穿越到2140年，正确的穿越方法是？', a: '通过薛定谔的波函数方程穿越到平行世界', b: '到百慕大三角找到天然的时空虫洞', c: '发动"基因革命"，实现"人体永生"' },
  { num: '04', title: '若你成功穿越至2140·元宇宙，你会做哪些事情？', a: '赶紧找个地方躲起来！', b: '找一个完美的AI伴侣！', c: '当然是看看数据时代的美食是什么样的啦。' },
  { num: '05', title: '100年后，科技将如何改变万圣节或圣诞节的过节方式？', a: '合二为一，因为Oct 31=Dec 25', b: '在万圣节，将灵魂残影写入区块链', c: '在圣诞节，你会收到神馈赠的礼物' },
  { num: '06', title: '你认为哪种生命形式才是永恒的？', a: '与AI一样的硅基生命', b: '意识不灭，游离网络的数据灵魂（晓）', c: '具有硅基思维+区块链集群的三体人' },
  { num: '07', title: '在你的认知里，神的本质是？', a: '高阶互联网中的数据区块', b: '宇宙中的超级文明', c: '量子算力驱动的大一统算法' },
  { num: '08', title: '当你来到类似黑客帝国的世界，最想进化出的技能是？', a: '和AI一样可以准确存储和计算海量信息', b: '像意识流一样能够离开肉体生活在全景网络上', c: '与"造物者"一样可以自由穿越观察过去的历史' },
  { num: '09', title: '百年之后，你认为那时人类使用的通用货币是什么？', a: '当然依旧是贬值飞快的国家法币啊', b: '以比特币为主的数字虚拟货币', c: '人即货币' },
  { num: '10', title: '如果你有机会参与一场基于"区块链文明的社会实验"，你最想了解什么？', a: '了解如何从智人进化为神人', b: '人生虚无，体验与众不同的生命', c: '看看区块链+AI能搞什么事' },
  { num: '11', title: '你认为神秘的中本聪究竟是谁？', a: '他是个从未来穿越过来启迪人类文明的人', b: '他是个引领人类走向硅基世界的AI', c: '他是人类先哲在互联网上投影的生命' },
  { num: '12', title: '当你濒临死亡之际，你会选择以下哪种办法延续生命？', a: '放弃肉身，把自己的灵魂意识扫描传输到互联网上', b: '放弃一部分将坏死的肉体，与AI进行改造结合', c: '我选择死亡' },
  { num: '13', title: '一百年后，当碳基文明与硅基文明最终爆发战争时，你会怎样选择？', a: '义无反顾地帮助碳基文明', b: '对人类彻底失望，叛变至硅基文明', c: '遗世而独立，只愿守护人类文明成果' },
  { num: '14', title: '你愿意通过区块链技术将地球文明变成三体文明吗？', a: 'Oh no！我的思想那么龌龊，可不想被别人窥测到', b: '当然愿意，把人类当做虫子碾压是我一生夙愿', c: '我不知道我不知道我不知道' },
  { num: '15', title: '以下哪个选项将成为人类未来史上最重要的思想命题？', a: '用通用AI+小数据+区块链对抗AI+大数据？', b: '宇宙是否靠一条区块链治理的？', c: '科技的高速发展导致人类的自我退化？' },
  { num: '16', title: '当你看到一群人将大脑连接在一起时，你首先想到什么？', a: '缸中之脑', b: '编织未来，共享梦境', c: '构建碳基生命的人脑区块链' },
]

// answer[i] = 3-char string; each char is race index (1-6) for option a/b/c
const ANSWERS = ['412 ', '163', '932', '356', '543', '542', '539', '543', '621', '365', '954', '421', '124', '639', '561', '216']

function calcResult(selecteds: (string | null)[]): number[] {
  const scores = [0, 0, 0, 0, 0, 0]
  const idx = { a: 0, b: 1, c: 2 }
  for (let i = 0; i < selecteds.length; i++) {
    const sel = selecteds[i]
    if (!sel) continue
    const raceChar = ANSWERS[i][idx[sel as 'a' | 'b' | 'c']]
    const race = parseInt(raceChar)
    if (race >= 1 && race <= 6) scores[race - 1] += 5
  }
  return scores
}

export default function TuringPage() {
  const [current, setCurrent] = useState(0)
  const [selecteds, setSelecteds] = useState<(string | null)[]>(Array(16).fill(null))
  const [result, setResult] = useState<number[] | null>(null)

  const q = QUESTIONS[current]
  const sel = selecteds[current]

  function select(opt: string) {
    const next = [...selecteds]
    next[current] = opt
    setSelecteds(next)
  }

  function next() {
    if (current < QUESTIONS.length - 1) {
      setCurrent(current + 1)
    } else {
      setResult(calcResult(selecteds))
    }
  }

  function prev() {
    if (current > 0) setCurrent(current - 1)
  }

  function restart() {
    setCurrent(0)
    setSelecteds(Array(16).fill(null))
    setResult(null)
  }

  if (result) {
    const maxScore = Math.max(...result)
    const raceIdx = result.indexOf(maxScore)
    const color = RACE_COLORS[raceIdx + 1]
    const scores = result.map((s, i) => ({ name: RACE_NAMES[i], score: s, color: RACE_COLORS[i + 1] }))
      .sort((a, b) => b.score - a.score)

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ background: 'radial-gradient(ellipse at center, #050d0a 0%, #000 100%)' }}>
        <Link href="/" className="absolute top-4 left-4 text-xs font-mono text-white/30 hover:text-white/60">← 返回</Link>

        <div className="w-full max-w-sm text-center">
          <div className="text-xs font-mono tracking-widest mb-3" style={{ color }}>图灵测试 · 完成</div>
          <div className="text-4xl font-bold font-mono mb-1" style={{ color }}>{RACE_NAMES[raceIdx]}</div>
          <div className="text-sm font-mono text-white/40 mb-6 leading-relaxed px-4">{RACE_DESC[raceIdx]}</div>

          <div className="space-y-2 mb-8">
            {scores.map(({ name, score, color: c }) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-xs font-mono w-10 text-right" style={{ color: c }}>{name}</span>
                <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${maxScore > 0 ? Math.round(score / maxScore * 100) : 0}%`, backgroundColor: c }} />
                </div>
                <span className="text-xs font-mono text-white/30 w-6">{score}</span>
              </div>
            ))}
          </div>

          <button onClick={restart}
            className="text-xs font-mono px-6 py-2 border border-white/20 text-white/50 rounded hover:text-white/80 hover:border-white/40 transition-colors">
            重新测试
          </button>
        </div>
      </div>
    )
  }

  const progress = Math.round((current / QUESTIONS.length) * 100)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'radial-gradient(ellipse at center, #050d0a 0%, #000 100%)' }}>
      <Link href="/" className="absolute top-4 left-4 text-xs font-mono text-white/30 hover:text-white/60">← 返回</Link>

      <div className="w-full max-w-sm">
        {/* 进度 */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-mono text-white/20 tracking-widest">图灵测试</div>
          <div className="text-xs font-mono text-white/30">{current + 1} / {QUESTIONS.length}</div>
        </div>
        <div className="bg-white/5 rounded-full h-0.5 mb-8 overflow-hidden">
          <div className="h-full bg-cyan-500/60 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        {/* 题目 */}
        <div className="text-xs font-mono text-white/20 mb-2">{q.num}</div>
        <div className="text-base font-mono text-white/85 leading-relaxed mb-8">{q.title}</div>

        {/* 选项 */}
        <div className="space-y-3 mb-8">
          {(['a', 'b', 'c'] as const).map(opt => (
            <button key={opt} onClick={() => select(opt)}
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-mono transition-all leading-relaxed
                ${sel === opt
                  ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-300'
                  : 'border-white/10 text-white/50 hover:border-white/25 hover:text-white/70'
                }`}>
              <span className="text-white/25 mr-2">{opt.toUpperCase()}.</span>
              {q[opt]}
            </button>
          ))}
        </div>

        {/* 导航 */}
        <div className="flex justify-between items-center">
          <button onClick={prev} disabled={current === 0}
            className="text-xs font-mono text-white/25 hover:text-white/50 disabled:opacity-20 transition-colors">
            ← 上一题
          </button>
          <button onClick={next} disabled={!sel}
            className="text-xs font-mono px-5 py-2 border rounded transition-colors disabled:opacity-20
              border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 disabled:border-white/10 disabled:text-white/20">
            {current === QUESTIONS.length - 1 ? '查看结果' : '下一题 →'}
          </button>
        </div>
      </div>
    </div>
  )
}
