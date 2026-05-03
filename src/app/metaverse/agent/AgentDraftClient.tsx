'use client'

import { useEffect, useState } from 'react'

type RecordRow = {
  id?: number
  lane?: string
  prompt?: string
  draft?: string
  status?: string
  created_at?: string
}

export function AgentDraftClient() {
  const [lane, setLane] = useState('chapter')
  const [prompt, setPrompt] = useState('')
  const [draft, setDraft] = useState('')
  const [records, setRecords] = useState<RecordRow[]>([])
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const laneParam = params.get('lane')
    const promptParam = params.get('prompt')
    if (laneParam) setLane(laneParam)
    if (promptParam) setPrompt(promptParam)
    fetch('/api/metaverse/agent')
      .then(r => r.json())
      .then(d => {
        setRecords(d.records ?? [])
        if (d.configured === false) setMessage('Supabase 未配置，当前仅可整理草案。')
      })
      .catch(() => setMessage('历史记录读取失败'))
  }, [])

  async function save() {
    setSaving(true)
    setMessage('')
    const res = await fetch('/api/metaverse/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lane, prompt, draft }),
    })
    const data = await res.json()
    if (!res.ok) {
      setMessage(data.error ?? '保存失败')
    } else {
      setMessage('已保存为待审草案')
      setRecords([data.record, ...records])
      setPrompt('')
      setDraft('')
    }
    setSaving(false)
  }

  async function generate() {
    setGenerating(true)
    setMessage('')
    const res = await fetch('/api/metaverse/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lane, prompt, draft, mode: 'generate' }),
    })
    const data = await res.json()
    if (!res.ok) {
      setMessage(data.error ?? '生成失败')
    } else {
      setDraft(data.record?.draft ?? data.draft ?? '')
      if (data.record) setRecords([data.record, ...records])
      setMessage(data.warning ?? '已生成待审草案')
    }
    setGenerating(false)
  }

  async function setStatus(record: RecordRow, status: string) {
    if (!record.id) return
    const res = await fetch('/api/metaverse/agent', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: record.id, status }),
    })
    const data = await res.json()
    if (res.ok) setRecords(records.map(r => r.id === record.id ? data.record : r))
    else setMessage(data.error ?? '状态更新失败')
  }

  return (
    <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
        <div className="mb-4 text-xs font-mono text-white/35">草案持久化</div>
        <div className="space-y-3">
          <select value={lane} onChange={e => setLane(e.target.value)} className="w-full rounded border border-white/10 bg-black px-3 py-2 text-xs font-mono text-white/70">
            <option value="chapter">章节草案</option>
            <option value="citycode">法典修正案</option>
            <option value="governance">治理简报</option>
            <option value="quest">任务建议</option>
            <option value="war">战争战报</option>
            <option value="branch">支线文明</option>
            <option value="prop">道具确认</option>
          </select>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="上下文 / 生成目标" className="min-h-20 w-full rounded border border-white/10 bg-black px-3 py-2 text-xs leading-relaxed text-white/70 outline-none focus:border-white/25" />
          <textarea value={draft} onChange={e => setDraft(e.target.value)} placeholder="GPT-X / Agent 生成后的待审草案" className="min-h-40 w-full rounded border border-white/10 bg-black px-3 py-2 text-xs leading-relaxed text-white/70 outline-none focus:border-white/25" />
          <div className="flex flex-wrap gap-2">
            <button onClick={generate} disabled={generating || !prompt.trim()} className="rounded border border-purple-400/30 px-4 py-2 text-xs font-mono text-purple-300 disabled:opacity-40">{generating ? '生成中...' : '生成草案'}</button>
            <button onClick={save} disabled={saving} className="rounded border border-cyan-400/30 px-4 py-2 text-xs font-mono text-cyan-300 disabled:opacity-40">{saving ? '保存中...' : '保存待审'}</button>
          </div>
          {message && <div className="text-xs font-mono text-white/35">{message}</div>}
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
        <div className="mb-4 text-xs font-mono text-white/35">待审记录</div>
        <div className="space-y-2">
          {records.length ? records.map((r, i) => (
            <div key={r.id ?? i} className="rounded border border-white/8 bg-black/20 p-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-300/70">{r.lane}</span>
                <span className="text-xs font-mono text-white/25">{r.status ?? 'draft'}</span>
              </div>
              <div className="line-clamp-2 text-xs text-white/40">{r.prompt}</div>
              <div className="mt-2 line-clamp-3 text-xs leading-relaxed text-white/65">{r.draft}</div>
              {r.id && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {['reviewing', 'approved', 'rejected'].map(s => (
                    <button key={s} onClick={() => setStatus(r, s)} className="rounded border border-white/10 px-2 py-1 text-xs font-mono text-white/35 hover:border-white/25 hover:text-white/65">{s}</button>
                  ))}
                </div>
              )}
            </div>
          )) : <div className="py-10 text-center text-xs font-mono text-white/25">暂无记录</div>}
        </div>
      </div>
    </section>
  )
}
