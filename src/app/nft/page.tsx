import { Nav } from '@/components/Nav'
import { getLoggedIn } from '@/lib/auth'
import { getNfts, login } from '@/lib/api2140'

export const dynamic = 'force-dynamic'

async function getData() {
  try {
    const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
    if (!cookie) return []
    return getNfts(cookie)
  } catch { return [] }
}

export default async function NftPage() {
  const [nfts, loggedIn] = await Promise.all([getData(), getLoggedIn()])

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <Nav active="/nft" loggedIn={loggedIn} />
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white font-mono">NFT 星图</h2>
        <p className="text-xs text-white/30 mt-1">文明创作 · 链上资产 · {nfts.length} 件</p>
      </div>

      {nfts.length === 0 ? (
        <div className="text-center py-20 text-white/30 font-mono text-sm">暂无 NFT 数据</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {nfts.map((n: any) => (
            <div key={n.seq} className="border border-white/10 rounded-xl overflow-hidden bg-white/3 group">
              <div className="relative aspect-square overflow-hidden">
                {n.display_url ? (
                  <img
                    src={n.display_url.startsWith('http') ? n.display_url : `https://www.2140city.cn${n.display_url}`}
                    alt={n.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center">
                    <span className="text-white/20 font-mono text-xs">NFT</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="text-xs font-mono text-white/80 font-medium line-clamp-1 mb-1">{n.name}</div>
                <div className="flex items-center gap-1.5">
                  {n.creater_avatar && (
                    <img src={n.creater_avatar} alt="" className="w-4 h-4 rounded-full" />
                  )}
                  <span className="text-xs font-mono text-white/35 truncate">{n.creater_nick}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
