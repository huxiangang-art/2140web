'use client'
import { useState } from 'react'

export function BulletinsClient({ bulletins }: { bulletins: any[] }) {
  const [selected, setSelected] = useState<any | null>(null)

  if (!bulletins.length) {
    return <div className="text-center py-20 text-white/30 font-mono text-sm">暂无公告</div>
  }

  return (
    <div className="space-y-3">
      {bulletins.map((b: any) => (
        <div
          key={b.seq}
          className="border border-white/10 rounded-xl p-4 cursor-pointer hover:border-white/20 transition-colors"
          onClick={() => setSelected(selected?.seq === b.seq ? null : b)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {b.type && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400/70 border border-cyan-500/20">
                    {b.type}
                  </span>
                )}
                <span className="text-xs font-mono text-white/25">{b.time?.slice(0, 10)}</span>
              </div>
              <h3 className="text-sm font-bold font-mono text-white leading-snug">{b.title}</h3>
              {selected?.seq !== b.seq && (
                <p className="text-xs text-white/45 font-mono leading-relaxed mt-2 line-clamp-2">
                  {b.content?.replace(/<[^>]+>/g, '').trim()}
                </p>
              )}
            </div>
            <span className="text-xs font-mono text-white/30 shrink-0">{selected?.seq === b.seq ? '↑' : '↓'}</span>
          </div>

          {selected?.seq === b.seq && (
            <div className="mt-4 pt-4 border-t border-white/8">
              {b.banner_img && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <img
                    src={b.banner_img.startsWith('http') ? b.banner_img : `https://www.2140city.cn${b.banner_img}`}
                    alt=""
                    className="w-full object-cover"
                  />
                </div>
              )}
              <div
                className="text-xs font-mono text-white/60 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: b.content ?? '' }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
