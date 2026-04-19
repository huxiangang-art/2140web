import { Nav } from '@/components/Nav'
import { getLoggedIn, getUserCookie } from '@/lib/auth'
import { getUserNfts, getUserInfo, login } from '@/lib/api2140'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getData(cookie: string) {
  const [nfts, info] = await Promise.allSettled([
    getUserNfts(cookie, 0),
    getUserInfo(cookie),
  ]).then(r => r.map(s => s.status === 'fulfilled' ? s.value : null))
  return { nfts: Array.isArray(nfts) ? nfts : [], info: (info as any)?.ret === 0 ? (info as any).data : null }
}

export default async function MyNftPage() {
  const [loggedIn, userCookie] = await Promise.all([getLoggedIn(), getUserCookie()])
  if (!loggedIn) redirect('/login')

  const { nfts, info } = await getData(userCookie!)

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <Nav active="/nft" loggedIn={loggedIn} />
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold text-white font-mono">我的 NFT</h2>
          <p className="text-xs text-white/30 mt-1">{info?.nickname} · 持有 {nfts.length} 件</p>
        </div>
        <Link href="/nft" className="text-xs font-mono text-white/40 hover:text-white/70">全站 NFT →</Link>
      </div>

      {nfts.length === 0 ? (
        <div className="text-center py-20 text-white/30 font-mono text-sm">
          <div className="mb-3">暂无 NFT</div>
          <Link href="/nft" className="text-xs text-cyan-400/70 hover:text-cyan-400">浏览全站 NFT →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {nfts.map((n: any) => (
            <div key={n.seq ?? n.nft_seq} className="border border-white/10 rounded-xl overflow-hidden bg-white/3 group">
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
                <div className="absolute top-2 left-2">
                  <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    #{n.seq ?? n.nft_seq}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <div className="text-xs font-mono text-white/80 font-medium line-clamp-1 mb-1">{n.name}</div>
                {n.token_id && (
                  <div className="text-xs font-mono text-white/25 truncate">Token #{n.token_id}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
