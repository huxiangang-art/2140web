'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RACE_NAMES, RACE_COLORS } from '@/lib/api2140'

type Props = {
  roundSeq?: string
  authorRace?: string
  authorName?: string
}

export function WriteClient({ roundSeq, authorRace, authorName }: Props) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [inspiring, setInspiring] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const raceColor = authorRace ? (RACE_COLORS[authorRace] ?? '#888') : '#888'
  const raceName = authorRace ? (RACE_NAMES[authorRace] ?? '未知') : '未知'

  async function inspire() {
    if (inspiring) return
    setInspiring(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `我是${raceName}族成员，想写一段Round ${roundSeq ?? '当前'}的文明史。给我一段100字内的写作灵感或开头，我来续写。`,
          }],
        }),
      })
      if (!res.body) return
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setContent(full)
      }
    } finally {
      setInspiring(false)
    }
  }

  async function submit() {
    if (!content.trim() || submitting) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, round_seq: roundSeq }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? '提交失败'); return }
      setSuccess(true)
      setTimeout(() => router.push('/history'), 1500)
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-20">
        <div className="text-cyan-400 font-mono text-sm mb-2">章节已写入文明史</div>
        <div className="text-white/30 font-mono text-xs">正在跳转...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 作者信息 */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <span className="text-white/30">执笔者</span>
        <span style={{ color: raceColor }}>{authorName}</span>
        <span className="text-white/20">·</span>
        <span style={{ color: raceColor }}>{raceName}族</span>
        {roundSeq && (
          <>
            <span className="text-white/20">·</span>
            <span className="text-white/40">Round {roundSeq}</span>
          </>
        )}
      </div>

      {/* 编辑器 */}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        disabled={submitting}
        placeholder="在此书写你的文明史章节..."
        rows={14}
        className="w-full bg-white/3 border border-white/10 rounded-lg px-4 py-3 text-sm text-white font-mono leading-relaxed resize-none focus:outline-none focus:border-white/20 placeholder-white/15"
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={inspire}
            disabled={inspiring || submitting}
            className="text-xs font-mono px-3 py-1.5 rounded border border-orange-500/20 text-orange-400/70 hover:text-orange-400 hover:border-orange-500/40 transition-colors disabled:opacity-30"
          >
            {inspiring ? '灵感涌现中...' : '✦ GPT-X 灵感'}
          </button>
          <span className="text-xs font-mono text-white/20">{content.length} 字</span>
        </div>

        <div className="flex items-center gap-3">
          {error && <span className="text-xs font-mono text-red-400">{error}</span>}
          <button
            onClick={submit}
            disabled={submitting || content.trim().length < 20}
            className="px-4 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/20 rounded text-sm font-mono disabled:opacity-30 transition-colors"
          >
            {submitting ? '写入中...' : '写入文明史'}
          </button>
        </div>
      </div>
    </div>
  )
}
