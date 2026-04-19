import { Nav } from '@/components/Nav'
import { getLoggedIn } from '@/lib/auth'
import { getStoreGoods, getStoreGoodsMore, login } from '@/lib/api2140'

export const dynamic = 'force-dynamic'

async function getData() {
  try {
    const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
    if (!cookie) return { featured: null, more: [] }
    const [featured, more] = await Promise.allSettled([
      getStoreGoods(cookie),
      getStoreGoodsMore(cookie),
    ]).then(r => r.map(s => s.status === 'fulfilled' ? s.value : null))
    return { featured, more: more ?? [] }
  } catch { return { featured: null, more: [] } }
}

export default async function StorePage() {
  const [{ featured, more }, loggedIn] = await Promise.all([getData(), getLoggedIn()])

  const featuredGoods: any[] = featured?.the_goods ?? []
  const moreGoods: any[] = Array.isArray(more) ? more : (more as any)?.goods ?? []

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <Nav active="/store" loggedIn={loggedIn} />
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white font-mono">文明商店</h2>
        <p className="text-xs text-white/30 mt-1">NFT · 道具 · 限定商品</p>
      </div>

      {featuredGoods.length === 0 && moreGoods.length === 0 ? (
        <div className="text-center py-20 text-white/30 font-mono text-sm">商店暂无商品</div>
      ) : (
        <div className="space-y-8">
          {featuredGoods.length > 0 && (
            <section>
              <div className="text-xs font-mono text-white/40 mb-4">精选商品</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredGoods.map((g: any) => (
                  <div key={g.seq} className="border border-white/10 rounded-xl overflow-hidden bg-white/3">
                    {g.detail_img && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={g.detail_img.startsWith('http') ? g.detail_img : `https://www.2140city.cn${g.detail_img}`}
                          alt={g.brief_name}
                          className="w-full h-full object-cover"
                          style={{ filter: 'brightness(0.8)' }}
                        />
                        {g.is_nft === '1' && (
                          <div className="absolute top-3 left-3 text-xs font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            NFT
                          </div>
                        )}
                        {g.end_time && (
                          <div className="absolute bottom-3 right-3 text-xs font-mono text-white/50 bg-black/60 px-2 py-0.5 rounded">
                            截止 {g.end_time?.slice(0, 10)}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-4">
                      <div className="text-sm font-bold font-mono text-white mb-1">{g.brief_name}</div>
                      <div className="flex items-center gap-2 text-xs font-mono text-white/40">
                        {g.user_avatar && (
                          <img src={g.user_avatar} alt="" className="w-4 h-4 rounded-full" />
                        )}
                        <span>{g.user_nick}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {moreGoods.length > 0 && (
            <section>
              <div className="text-xs font-mono text-white/40 mb-4">更多商品</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {moreGoods.map((g: any) => (
                  <div key={g.seq} className="border border-white/10 rounded-xl overflow-hidden bg-white/3">
                    {g.cover && (
                      <div className="h-28 overflow-hidden">
                        <img
                          src={g.cover.startsWith('http') ? g.cover : `https://www.2140city.cn${g.cover}`}
                          alt={g.brief_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-3">
                      <div className="text-xs font-mono text-white/80 line-clamp-2">{g.brief_name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  )
}
