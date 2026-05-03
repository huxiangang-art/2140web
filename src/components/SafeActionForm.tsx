'use client'

import { useState } from 'react'

export function SafeActionForm({
  title,
  endpoint,
  payload,
}: {
  title: string
  endpoint: string
  payload?: Record<string, unknown>
}) {
  const [budgetType, setBudgetType] = useState('hashrate')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit() {
    setSaving(true)
    setMessage('')
    const res = await fetch('/api/metaverse/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'safe_action',
        target: title,
        endpoint,
        payload: { ...payload, budget_type: budgetType, amount },
        source: typeof window !== 'undefined' ? window.location.pathname : null,
      }),
    })
    const data = await res.json()
    setMessage(res.ok ? `已生成确认单 ${data.record?.id ?? ''}` : data.error ?? '生成失败')
    setSaving(false)
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="grid grid-cols-[1fr_1fr] gap-2">
        <select value={budgetType} onChange={e => setBudgetType(e.target.value)} className="rounded border border-white/10 bg-black px-2 py-2 text-xs font-mono text-white/65">
          <option value="hashrate">算力</option>
          <option value="token">通证</option>
          <option value="prop">道具</option>
        </select>
        <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="预算数量" className="rounded border border-white/10 bg-black px-2 py-2 text-xs font-mono text-white/65 outline-none" />
      </div>
      <button type="button" onClick={submit} disabled={saving} className="rounded border border-amber-300/25 px-3 py-2 text-xs font-mono text-amber-100/70 disabled:opacity-45">
        {saving ? '生成中...' : '生成确认单'}
      </button>
      {message && <div className="text-xs font-mono text-white/35">{message}</div>}
    </div>
  )
}
