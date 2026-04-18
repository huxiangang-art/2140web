'use client'

import { useState } from 'react'

type Prop = {
  seq: string
  name: string
  icon: string
  formula: number[]
  status: string
  is_get: number
  top_name?: string
}

type Switch = {
  name: string
  childs: { seq: string; name: string; icon: string; formula: number[]; status: string; top_name: string }[]
}

// type mapping by switch index: [1,2,2,3,2]
const SWITCH_TYPES = [1, 2, 2, 3, 2]

export function PropClient({
  propSwitches, propTemplates, baseUrl,
}: {
  propSwitches: Switch[]
  propTemplates: Record<string, Prop>
  baseUrl: string
}) {
  const [activeSwitch, setActiveSwitch] = useState(1)
  const [activeChild, setActiveChild] = useState(0)

  const sw = propSwitches[activeSwitch]
  const child = sw?.childs[activeChild]
  const type = SWITCH_TYPES[activeSwitch]

  const tpl = child ? propTemplates[child.seq] : null

  function img(icon: string) {
    return baseUrl + icon
  }

  function PropIcon({ prop, size = 'md' }: { prop: Prop | undefined; size?: 'sm' | 'md' | 'lg' }) {
    if (!prop) return null
    const s = size === 'lg' ? 'w-16 h-16' : size === 'md' ? 'w-12 h-12' : 'w-9 h-9'
    const got = prop.is_get === 1
    return (
      <div className="flex flex-col items-center gap-1.5">
        <div className={`${s} rounded-lg overflow-hidden border relative shrink-0 ${got ? 'border-amber-400/50' : 'border-white/15'}`}
          style={{ background: '#0a0a0a' }}>
          <img src={img(prop.icon)} alt={prop.name} className="w-full h-full object-cover" />
          {got && <div className="absolute bottom-0 right-0 w-3 h-3 bg-amber-400 rounded-tl-sm" />}
        </div>
        <div className="text-center" style={{ maxWidth: size === 'lg' ? 80 : size === 'md' ? 64 : 56 }}>
          <div className={`font-mono leading-tight ${size === 'sm' ? 'text-xs text-white/40' : 'text-xs text-white/60'}`}
            style={{ fontSize: 10 }}>
            {prop.name}
          </div>
        </div>
      </div>
    )
  }

  function Arrow() {
    return <div className="text-white/15 font-mono text-sm mx-1 shrink-0">→</div>
  }

  function renderTree() {
    if (!tpl) return null

    // type 3: linear chain
    if (type === 3) {
      const chain: Prop[] = [tpl]
      for (let k = 0; k < 50; k++) {
        const last = chain[chain.length - 1]
        if (last?.formula?.length > 0) {
          const next = propTemplates[last.formula[0]]
          if (next) chain.push(next)
          else break
        } else break
      }
      return (
        <div className="flex flex-wrap items-center gap-3 p-4">
          {chain.map((p, i) => (
            <div key={p.seq} className="flex items-center gap-3">
              <PropIcon prop={p} size="md" />
              {i < chain.length - 1 && <Arrow />}
            </div>
          ))}
        </div>
      )
    }

    // type 1 & 2: target → ingredients → base props
    return (
      <div className="space-y-6 p-4">
        {/* Target */}
        <div className="flex flex-col items-center">
          <div className="text-xs font-mono text-white/25 mb-3 tracking-wider">合成目标</div>
          <PropIcon prop={tpl} size="lg" />
        </div>

        {/* Arrow down */}
        <div className="flex justify-center">
          <div className="text-white/15 text-xl">↓</div>
        </div>

        {/* Ingredients + their bases */}
        <div>
          <div className="text-xs font-mono text-white/25 mb-3 tracking-wider text-center">合成材料</div>
          <div className="space-y-5">
            {tpl.formula.map((ingSeq) => {
              const ing = propTemplates[ingSeq]
              if (!ing) return null
              return (
                <div key={ingSeq} className="border border-white/8 rounded-lg p-3">
                  {/* Ingredient header */}
                  <div className="flex items-center gap-3 mb-3">
                    <PropIcon prop={ing} size="md" />
                    <div className="flex-1">
                      <div className="text-xs font-mono text-white/50">{ing.name}</div>
                      {ing.top_name && <div className="text-xs font-mono text-white/20 mt-0.5">{ing.top_name}</div>}
                    </div>
                  </div>

                  {/* Base props for this ingredient */}
                  {ing.formula?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-px flex-1 bg-white/5" />
                        <span className="text-xs font-mono text-white/15">所需材料</span>
                        <div className="h-px flex-1 bg-white/5" />
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {ing.formula.map((bSeq) => {
                          const base = propTemplates[bSeq]
                          return base ? <PropIcon key={bSeq} prop={base} size="sm" /> : null
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* 左：分类导航 */}
      <div className="lg:col-span-1 space-y-2">
        {propSwitches.map((s, i) => (
          <div key={i}>
            <button
              onClick={() => { setActiveSwitch(i); setActiveChild(0) }}
              className={`w-full text-left px-3 py-2 rounded text-xs font-mono transition-colors
                ${activeSwitch === i ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60 hover:bg-white/5'}`}>
              {s.name}
            </button>
            {activeSwitch === i && (
              <div className="ml-3 mt-1 space-y-1">
                {s.childs.map((c, j) => (
                  <button key={c.seq}
                    onClick={() => setActiveChild(j)}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs font-mono flex items-center gap-2 transition-colors
                      ${activeChild === j ? 'text-amber-300 bg-amber-500/10' : 'text-white/30 hover:text-white/50'}`}>
                    <img src={img(c.icon)} alt="" className="w-6 h-6 rounded object-cover shrink-0" />
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 右：合成路径 */}
      <div className="lg:col-span-3">
        <div className="border border-white/8 rounded-lg min-h-64 overflow-hidden">
          {tpl ? renderTree() : (
            <div className="flex items-center justify-center h-64 text-xs font-mono text-white/20">
              选择道具查看合成路径
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
