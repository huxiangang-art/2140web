'use client'

import { useState } from 'react'

export function AuditActions({ id }: { id: string }) {
  const [message, setMessage] = useState('')
  async function update(status: string) {
    const res = await fetch('/api/metaverse/audit', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    const data = await res.json()
    setMessage(res.ok ? `已更新为 ${data.record?.status ?? status}` : data.error ?? '更新失败')
  }
  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-1.5">
        {['reviewing', 'approved', 'previewed', 'rejected'].map(status => (
          <button key={status} type="button" onClick={() => update(status)} className="rounded border border-white/10 px-2 py-1 text-xs font-mono text-white/38 hover:border-white/25 hover:text-white/68">
            {status}
          </button>
        ))}
      </div>
      {message && <div className="mt-2 text-xs font-mono text-white/35">{message}</div>}
    </div>
  )
}
