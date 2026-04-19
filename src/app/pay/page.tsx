import { Nav } from '@/components/Nav'
import { getLoggedIn } from '@/lib/auth'
import { getHashrateGoods, login } from '@/lib/api2140'

export const dynamic = 'force-dynamic'

export default async function PayPage() {
  const [loggedIn, sysCookie] = await Promise.all([
    getLoggedIn(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])

  const cookie = sysCookie ?? ''
  const goods: any[] = await getHashrateGoods(cookie)

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto">
      <Nav active="/pay" loggedIn={loggedIn} />

      <div className="mb-6">
        <h2 className="text-xl font-bold text-white font-mono">充值算力</h2>
        <p className="text-xs text-white/30 mt-1">算力即权力 · 掌握算力者掌握文明走向</p>
      </div>

      <div className="mb-4 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
        <p className="text-xs font-mono text-amber-400/70">
          ⚠ 实际支付须在 2140 App 内通过微信完成。此页面仅展示商品目录。
        </p>
      </div>

      {goods.length === 0 ? (
        <div className="text-center py-20 text-white/20 font-mono text-sm">暂无商品</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {goods.map((g: any) => (
            <div
              key={g.seq ?? g.goods_seq}
              className={`relative rounded-xl border p-4 text-center transition-colors
                ${g.is_active == 1
                  ? 'border-amber-400/30 bg-amber-400/5'
                  : 'border-white/10 bg-white/3'
                }`}
            >
              {g.is_active == 1 && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs font-mono px-2 py-0.5 rounded-full bg-amber-400 text-black font-bold whitespace-nowrap">
                  首充双倍
                </div>
              )}
              <div className="text-2xl font-mono font-bold text-white mt-2">
                {parseInt(g.goods_content ?? 0).toLocaleString()}
              </div>
              <div className="text-xs font-mono text-white/40 mb-1">算力</div>
              {g.goods_gift > 0 && (
                <div className="text-xs font-mono text-cyan-400 mb-2">
                  +{parseInt(g.goods_gift).toLocaleString()} 赠送
                </div>
              )}
              <div className="text-sm font-mono font-bold text-amber-400">
                ¥{g.goods_price}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
