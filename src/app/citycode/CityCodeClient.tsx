'use client'

import { useState } from 'react'

type Bill = {
  seq: string
  id: string
  title: string
  content: string
  introduce_img: string
  support_num: string
  against_num: string
  time: string
  deadline: string
  author_nickname: string
  author_avatar: string
  amendment_count: string
  category: number
}

type Category = {
  id: number
  name: string
  bills: Bill[]
}

function BillCard({ bill }: { bill: Bill }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-white/10 bg-white/3 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-white/25">{bill.id}</span>
              {parseInt(bill.amendment_count) > 1 && (
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/8 text-white/40 border border-white/10">
                  v{bill.amendment_count}
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold font-mono text-white leading-snug">{bill.title}</h3>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-xs text-white/25 font-mono">{bill.time.slice(0, 10)}</div>
            <div className="text-xs text-white/40 font-mono mt-0.5">{bill.author_nickname}</div>
          </div>
        </div>

        <p className="text-xs font-mono text-white/55 leading-relaxed whitespace-pre-wrap">
          {expanded ? bill.content : bill.content.slice(0, 120) + (bill.content.length > 120 ? '…' : '')}
        </p>

        {bill.introduce_img && expanded && (
          <div className="mt-3 rounded-lg overflow-hidden border border-white/8">
            <img src={`https://www.2140city.cn${bill.introduce_img}`} alt="" className="w-full object-cover" />
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3 text-xs font-mono text-white/30">
            <span>支持 {bill.support_num}</span>
            <span>反对 {bill.against_num}</span>
          </div>
          {bill.content.length > 120 && (
            <button
              type="button"
              onClick={() => setExpanded(v => !v)}
              className="text-xs font-mono text-white/30 hover:text-white/60 transition-colors"
            >
              {expanded ? '收起 ↑' : '展开 ↓'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function CityCodeClient({ categories }: { categories: Category[] }) {
  const [activeCat, setActiveCat] = useState<number | null>(null)

  const displayed = activeCat === null
    ? categories
    : categories.filter(c => c.id === activeCat)

  return (
    <div>
      {/* Category filter pills */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        <button
          type="button"
          onClick={() => setActiveCat(null)}
          className={`text-xs font-mono px-3 py-1 rounded-full border transition-colors ${
            activeCat === null
              ? 'bg-white/15 text-white border-white/20'
              : 'text-white/35 border-white/10 hover:text-white/60 hover:border-white/20'
          }`}
        >
          全部
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCat(cat.id === activeCat ? null : cat.id)}
            className={`text-xs font-mono px-3 py-1 rounded-full border transition-colors ${
              activeCat === cat.id
                ? 'bg-white/15 text-white border-white/20'
                : 'text-white/35 border-white/10 hover:text-white/60 hover:border-white/20'
            }`}
          >
            {cat.name}
            <span className="ml-1 text-white/25">{cat.bills.length}</span>
          </button>
        ))}
      </div>

      {/* Bills grouped by category */}
      <div className="space-y-8">
        {displayed.map(cat => (
          <div key={cat.id}>
            <div className="flex items-center gap-3 mb-3">
              <div className="text-xs font-mono text-white/50 font-bold">{cat.name}</div>
              <div className="flex-1 h-px bg-white/8" />
              <div className="text-xs font-mono text-white/20">{cat.bills.length} 条</div>
            </div>
            <div className="space-y-3">
              {cat.bills.map(bill => (
                <BillCard key={bill.seq} bill={bill} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
