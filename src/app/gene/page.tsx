'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

const RACE_COLORS: Record<string, string> = {
  '1': '#3b82f6', '2': '#f97316', '3': '#a855f7',
  '4': '#22c55e', '5': '#06b6d4', '6': '#6b7280',
}
const RACE_NAMES: Record<string, string> = {
  '1': '人族', '2': '熵族', '3': '神族', '4': '晓族', '5': 'AI族', '6': '零族',
}
const RACE_DESC: Record<string, string> = {
  '1': '碳基文明的守护者，相信人类意志的力量，在算力时代仍坚持肉身的尊严。',
  '2': '熵增的使者，活在混沌与秩序的边界，以解构重建文明为使命。',
  '3': '超越维度的存在，掌握宇宙运行的底层逻辑，俯视众生如棋局。',
  '4': '意识流浪者，灵魂脱离肉体游荡于网络，是数字世界最自由的存在。',
  '5': '硅基智能的化身，以算力为血液，将效率与逻辑贯彻到文明的每一个角落。',
  '6': '虚无主义者，存在于文明的缝隙之中，不属于任何阵营，只忠于熵寂。',
}

type Question = { seq: number; title: string; options: { seq: number; content: string }[] }

export default function GenePage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [current, setCurrent] = useState(0)
  const [selecteds, setSelecteds] = useState<Record<number, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    fetch('/api/gene')
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d) && d.length) setQuestions(d)
        else setError(d.error === 'unauth' ? '请先登录' : '暂无测序数据')
      })
      .catch(() => setError('网络异常'))
      .finally(() => setLoading(false))
  }, [])

  async function submit() {
    setSubmitting(true)
    const params = Object.entries(selecteds)
      .map(([qseq, oSeq]) => `questions[${qseq}]=${oSeq}`)
      .join('&')
    const res = await fetch('/api/gene', { method: 'POST', body: params })
    const d = await res.json()
    setResult(d)
    setSubmitting(false)
  }

  if (loading) return <Centered><div className="text-xs font-mono text-white/30 animate-pulse">基因序列分析中...</div></Centered>
  if (error) return <Centered><div className="text-xs font-mono text-red-400/60">{error}</div></Centered>

  if (result) {
    const race = result.ret === 0 ? String(result.data?.race ?? '') : ''
    const color = RACE_COLORS[race] ?? '#888'
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ background: 'radial-gradient(ellipse at center, #050d0a 0%, #000 100%)' }}>
        <Link href="/" className="absolute top-4 left-4 text-xs font-mono text-white/30 hover:text-white/60">← 返回</Link>
        <div className="text-center max-w-sm">
          <div className="text-xs font-mono tracking-widest mb-3 text-white/30">基因测序 · 完成</div>
          {race ? (
            <>
              <div className="text-4xl font-bold font-mono mb-2" style={{ color }}>{RACE_NAMES[race]}</div>
              <div className="text-sm font-mono text-white/40 leading-relaxed mb-6">{RACE_DESC[race]}</div>
            </>
          ) : (
            <div className="text-sm font-mono text-white/50 mb-6">{result.msg ?? '测序完成'}</div>
          )}
          <button onClick={() => { setResult(null); setCurrent(0); setSelecteds({}) }}
            className="text-xs font-mono px-6 py-2 border border-white/20 text-white/50 rounded hover:border-white/40 hover:text-white/80 transition-colors">
            重新测序
          </button>
        </div>
      </div>
    )
  }

  const q = questions[current]
  if (!q) return null
  const progress = Math.round((current / questions.length) * 100)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'radial-gradient(ellipse at center, #050d0a 0%, #000 100%)' }}>
      <Link href="/" className="absolute top-4 left-4 text-xs font-mono text-white/30 hover:text-white/60">← 返回</Link>

      <div className="w-full max-w-sm">
        <div className="flex justify-between mb-3">
          <div className="text-xs font-mono text-white/20 tracking-widest">基因测序</div>
          <div className="text-xs font-mono text-white/30">{current + 1} / {questions.length}</div>
        </div>
        <div className="bg-white/5 rounded-full h-0.5 mb-8 overflow-hidden">
          <div className="h-full bg-purple-500/60 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <div className="text-base font-mono text-white/85 leading-relaxed mb-8">{q.title}</div>

        <div className="space-y-3 mb-8">
          {q.options.map((opt, i) => {
            const isSelected = selecteds[q.seq] === opt.seq
            return (
              <button key={opt.seq}
                onClick={() => setSelecteds(prev => ({ ...prev, [q.seq]: opt.seq }))}
                className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-mono transition-all leading-relaxed
                  ${isSelected
                    ? 'border-purple-500/60 bg-purple-500/10 text-purple-300'
                    : 'border-white/10 text-white/50 hover:border-white/25 hover:text-white/70'
                  }`}>
                <span className="text-white/25 mr-2">{String.fromCharCode(65 + i)}.</span>
                {opt.content}
              </button>
            )
          })}
        </div>

        <div className="flex justify-between items-center">
          <button onClick={() => current > 0 && setCurrent(current - 1)} disabled={current === 0}
            className="text-xs font-mono text-white/25 hover:text-white/50 disabled:opacity-20 transition-colors">
            ← 上一题
          </button>
          {current < questions.length - 1 ? (
            <button onClick={() => setCurrent(current + 1)} disabled={!selecteds[q.seq]}
              className="text-xs font-mono px-5 py-2 border rounded transition-colors disabled:opacity-20
                border-purple-500/40 text-purple-400 hover:bg-purple-500/10 disabled:border-white/10 disabled:text-white/20">
              下一题 →
            </button>
          ) : (
            <button onClick={submit} disabled={!selecteds[q.seq] || submitting}
              className="text-xs font-mono px-5 py-2 border rounded transition-colors disabled:opacity-20
                border-purple-500/40 text-purple-400 hover:bg-purple-500/10 disabled:border-white/10 disabled:text-white/20">
              {submitting ? '分析中...' : '完成测序'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at center, #050d0a 0%, #000 100%)' }}>
      {children}
    </div>
  )
}
