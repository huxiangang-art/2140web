import { Nav } from '@/components/Nav'
import { getLoggedIn } from '@/lib/auth'
import { login, getTimeNodes, getTheme8, RACE_COLORS } from '@/lib/api2140'

export const dynamic = 'force-dynamic'

function stripHtml(html: string) {
  return html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim()
}

export default async function WorldPage() {
  const [loggedIn, sysCookie] = await Promise.all([
    getLoggedIn(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])

  const cookie = sysCookie ?? ''
  const [timeNodes, theme8] = await Promise.all([
    getTimeNodes(cookie),
    getTheme8(cookie),
  ])

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <Nav active="/world" loggedIn={loggedIn} />

      <div className="mb-8">
        <h2 className="text-xl font-bold text-white font-mono">幻次元 · 世界观</h2>
        <p className="text-xs text-white/30 mt-1">138亿年文明时间线 · 八部系列宇宙</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* 文明时间线 */}
        <div className="lg:col-span-3">
          <div className="text-xs font-mono text-white/30 mb-4">文明时间线</div>
          <div className="relative">
            <div className="absolute left-2 top-0 bottom-0 w-px bg-white/10" />
            <div className="space-y-0">
              {timeNodes.map((node: any, i: number) => {
                const isKeyNode = node.status === '1' || i % 8 === 0
                return (
                  <div key={node.seq} className="relative pl-8 pb-5 group">
                    <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border flex items-center justify-center
                      ${isKeyNode
                        ? 'border-cyan-500/60 bg-cyan-500/10'
                        : 'border-white/15 bg-white/5'
                      }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${isKeyNode ? 'bg-cyan-400/70' : 'bg-white/20'}`} />
                    </div>
                    <div className="text-xs font-mono text-white/20 mb-0.5">{node.node_time}</div>
                    <div className={`text-sm font-mono font-semibold mb-1 ${isKeyNode ? 'text-cyan-300/80' : 'text-white/70'}`}>
                      {node.node_title}
                    </div>
                    {node.node_txt && (
                      <div className="text-xs text-white/35 leading-relaxed line-clamp-2">
                        {node.node_txt}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* 八部系列 */}
        <div className="lg:col-span-2">
          <div className="text-xs font-mono text-white/30 mb-4">八部系列</div>
          <div className="space-y-4">
            {theme8.map((s: any, i: number) => {
              const colors = ['#3b82f6', '#f97316', '#a855f7', '#22c55e', '#06b6d4', '#6b7280', '#ec4899', '#eab308']
              const color = colors[i % colors.length]
              const desc = stripHtml(s.desc ?? '')
              return (
                <div key={s.seq}
                  className="rounded-lg border border-white/8 p-4"
                  style={{ borderLeftColor: color + '60', borderLeftWidth: '2px' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono" style={{ color: color + 'aa' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm font-mono font-bold text-white/85">{s.title}</span>
                  </div>
                  <p className="text-xs text-white/35 leading-relaxed line-clamp-4 whitespace-pre-line">
                    {desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </main>
  )
}
