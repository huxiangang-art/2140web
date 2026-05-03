'use client'

import { useState } from 'react'
import Link from 'next/link'

export function QuestActionClient({ href = '/racewar/tasks' }: { href?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-3">
      <button onClick={() => setOpen(true)} className="rounded border border-white/10 px-3 py-1.5 text-xs font-mono text-white/40 transition-colors hover:border-white/25 hover:text-white/70">
        检查动作
      </button>
      {open && (
        <div className="mt-3 rounded border border-amber-400/20 bg-amber-400/5 p-3">
          <div className="text-xs font-mono text-amber-300/80">安全确认</div>
          <p className="mt-2 text-xs leading-relaxed text-white/45">当前外挂不会直接提交领取、捐赠或消耗类操作。确认后仅打开原任务页面继续核对。</p>
          <div className="mt-3 flex gap-2">
            <Link href={href} className="rounded border border-amber-300/30 px-3 py-1.5 text-xs font-mono text-amber-200/80">打开原页面</Link>
            <button onClick={() => setOpen(false)} className="rounded border border-white/10 px-3 py-1.5 text-xs font-mono text-white/40">取消</button>
          </div>
        </div>
      )}
    </div>
  )
}
