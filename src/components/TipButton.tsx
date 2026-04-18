'use client'

import { useState } from 'react'

export function TipButton({ chapterId, initialCount }: { chapterId: number; initialCount: number }) {
  const [count, setCount] = useState(initialCount)
  const [tipped, setTipped] = useState(false)
  const [loading, setLoading] = useState(false)

  async function tip() {
    if (tipped || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapter_id: chapterId }),
      })
      if (res.ok) {
        const data = await res.json()
        setCount(data.tip_count)
        setTipped(true)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={tip}
      disabled={tipped || loading}
      className={`text-xs font-mono px-2 py-0.5 rounded border transition-colors
        ${tipped
          ? 'border-amber-500/30 text-amber-400/60 cursor-default'
          : 'border-white/10 text-white/30 hover:text-amber-400 hover:border-amber-500/30'
        }`}
    >
      ◆ {count > 0 ? count : '打赏'}
    </button>
  )
}
