'use client'

import { useState } from 'react'
import Link from 'next/link'

export function BranchProposalForm({ basePrompt }: { basePrompt: string }) {
  const [name, setName] = useState('待命名支线文明')
  const [direction, setDirection] = useState('建设 / 防守 / 探索')
  const [risk, setRisk] = useState('低血量防守与任务补全')
  const prompt = `${basePrompt}\n\n支线文明名：${name}\n任务方向：${direction}\n风险设定：${risk}`
  return (
    <section className="mb-6 rounded-lg border border-white/10 bg-white/[0.025] p-4">
      <div className="mb-3 text-xs font-mono text-white/35">支线创建草案表单</div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Field label="文明名" value={name} onChange={setName} />
        <Field label="任务方向" value={direction} onChange={setDirection} />
        <Field label="风险设定" value={risk} onChange={setRisk} />
      </div>
      <Link href={`/metaverse/agent?lane=branch&prompt=${encodeURIComponent(prompt)}`} className="mt-4 inline-flex rounded border border-cyan-300/25 px-4 py-2 text-xs font-mono text-cyan-100/75">带表单进入 Agent</Link>
    </section>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block rounded border border-white/8 bg-black/22 p-3">
      <span className="text-xs font-mono text-white/30">{label}</span>
      <input value={value} onChange={e => onChange(e.target.value)} className="mt-2 w-full bg-transparent text-sm font-mono text-white/75 outline-none" />
    </label>
  )
}
