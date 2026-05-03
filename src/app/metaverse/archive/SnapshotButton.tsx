'use client'

import { useState } from 'react'

export function SnapshotButton({ metrics, summary }: { metrics: Record<string, unknown>; summary: string[] }) {
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  async function save() {
    setSaving(true)
    const res = await fetch('/api/metaverse/archive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '元宇宙快照', metrics, summary }),
    })
    const data = await res.json()
    setMessage(res.ok ? `已保存快照 ${data.snapshot?.id ?? ''}` : data.error ?? '保存失败')
    setSaving(false)
  }
  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={save} disabled={saving} className="w-fit rounded border border-cyan-300/20 px-3 py-2 text-xs font-mono text-cyan-100/70 disabled:opacity-45">
        {saving ? '保存中...' : '保存快照'}
      </button>
      {message && <div className="text-xs font-mono text-white/35">{message}</div>}
    </div>
  )
}
