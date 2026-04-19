import { Nav } from '@/components/Nav'
import { getLoggedIn, getUserCookie } from '@/lib/auth'
import { getMyProps, login } from '@/lib/api2140'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getData(cookie: string) {
  try {
    return getMyProps(cookie)
  } catch { return null }
}

export default async function PropBackpackPage() {
  const [loggedIn, userCookie] = await Promise.all([getLoggedIn(), getUserCookie()])
  if (!loggedIn) redirect('/login')

  const data = await getData(userCookie!)

  const templates: any[] = data?.prop_templates ?? []
  const props: any[] = data?.props ?? []

  // Map owned props by template seq
  const ownedMap: Record<string, number> = {}
  for (const p of props) {
    ownedMap[p.prop_t_seq] = (ownedMap[p.prop_t_seq] ?? 0) + 1
  }

  const owned = templates.filter(t => ownedMap[t.seq] > 0)
  const notOwned = templates.filter(t => !ownedMap[t.seq])

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <Nav active="/prop" loggedIn={loggedIn} />
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold text-white font-mono">道具背包</h2>
          <p className="text-xs text-white/30 mt-1">已拥有 {owned.length} 种 · 共 {props.length} 件</p>
        </div>
        <Link href="/prop" className="text-xs font-mono text-white/40 hover:text-white/70 transition-colors">
          合成路径 →
        </Link>
      </div>

      {owned.length > 0 && (
        <div className="mb-8">
          <div className="text-xs font-mono text-white/40 mb-3">已拥有</div>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {owned.map((t: any) => (
              <div key={t.seq} className="flex flex-col items-center gap-1.5">
                <div className="w-14 h-14 rounded-lg border border-amber-400/40 overflow-hidden bg-black/40 relative">
                  {t.icon && (
                    <img src={`https://www.2140city.cn${t.icon}`} alt={t.name} className="w-full h-full object-cover" />
                  )}
                  {ownedMap[t.seq] > 1 && (
                    <div className="absolute bottom-0 right-0 bg-amber-500 text-black text-xs font-bold px-1 rounded-tl">
                      ×{ownedMap[t.seq]}
                    </div>
                  )}
                </div>
                <div className="text-center text-white/60 font-mono leading-tight" style={{ fontSize: 10, maxWidth: 56 }}>
                  {t.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {notOwned.length > 0 && (
        <div>
          <div className="text-xs font-mono text-white/25 mb-3">未拥有（{notOwned.length} 种）</div>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {notOwned.map((t: any) => (
              <div key={t.seq} className="flex flex-col items-center gap-1.5 opacity-30">
                <div className="w-14 h-14 rounded-lg border border-white/10 overflow-hidden bg-black/40">
                  {t.icon && (
                    <img src={`https://www.2140city.cn${t.icon}`} alt={t.name} className="w-full h-full object-cover grayscale" />
                  )}
                </div>
                <div className="text-center text-white/40 font-mono leading-tight" style={{ fontSize: 10, maxWidth: 56 }}>
                  {t.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!data && (
        <div className="text-center py-20 text-white/30 font-mono text-sm">暂无背包数据</div>
      )}
    </main>
  )
}
