'use client'

import { useState } from 'react'

interface Props {
  poolSeq: string
  userHashrate: number
  onSuccess: () => void
}

export function HashrateInput({ poolSeq, userHashrate, onSuccess }: Props) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [open, setOpen] = useState(false)

  async function submit() {
    const n = parseInt(amount)
    if (!n || n < 10) { setMsg('最少投入10算力'); return }
    if (n > userHashrate) { setMsg('算力不足'); return }
    setLoading(true)
    setMsg('')
    try {
      const res = await fetch('/api/hashrate-input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolSeq, amount: n }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMsg(data.error ?? '投入失败')
      } else {
        setMsg('投入成功')
        setOpen(false)
        setAmount('')
        onSuccess()
      }
    } catch {
      setMsg('网络错误')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-mono px-3 py-1 rounded border border-cyan-500/30 text-cyan-400/70 hover:text-cyan-400 hover:border-cyan-400/50 transition-colors"
      >
        投入算力
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder={`最多 ${userHashrate}`}
        className="w-28 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-white/30"
      />
      <button
        onClick={submit}
        disabled={loading}
        className="text-xs font-mono px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/30 disabled:opacity-40 transition-colors"
      >
        {loading ? '...' : '确认'}
      </button>
      <button onClick={() => { setOpen(false); setMsg('') }} className="text-xs text-white/30 hover:text-white/50">
        取消
      </button>
      {msg && <span className={`text-xs font-mono ${msg === '投入成功' ? 'text-green-400' : 'text-red-400'}`}>{msg}</span>}
    </div>
  )
}
