'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function PlazaPostClient() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    if (!title.trim() || !content.trim()) { setError('标题和内容不能为空'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/plaza/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })
      const data = await res.json()
      if (data.ret === 0) {
        router.push('/plaza')
      } else {
        setError(data.msg ?? '发帖失败')
      }
    } catch {
      setError('网络异常')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-mono text-white/40 mb-2 block">标题</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="帖子标题..."
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm font-mono text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
        />
      </div>
      <div>
        <label className="text-xs font-mono text-white/40 mb-2 block">内容</label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="写下你的想法..."
          rows={10}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm font-mono text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors resize-none"
        />
      </div>
      {error && <div className="text-xs font-mono text-red-400">{error}</div>}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="px-6 py-2.5 rounded-lg text-sm font-mono bg-white/10 text-white hover:bg-white/15 disabled:opacity-50 transition-colors"
        >
          {loading ? '发布中...' : '发布'}
        </button>
        <button
          type="button"
          onClick={() => history.back()}
          className="px-6 py-2.5 rounded-lg text-sm font-mono text-white/40 hover:text-white/60 transition-colors"
        >
          取消
        </button>
      </div>
    </div>
  )
}
