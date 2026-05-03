import { ApkList, ApkListItem, ApkReplicaPage, ApkSection } from '@/components/ApkReplicaPage'
import { SafeActionPanel } from '@/components/SafeActionPanel'
import { getHashrateEngine, getHashrateGoods, getHashratePool, getHashratePoolRank, login } from '@/lib/api2140'
import { num } from '@/lib/metaverse'

export const dynamic = 'force-dynamic'

export default async function HashratePage() {
  const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const [poolRes, engineRes, rankRes, goodsRes] = await Promise.allSettled([
    cookie ? getHashratePool(cookie) : Promise.resolve(null),
    cookie ? getHashrateEngine(cookie) : Promise.resolve(null),
    cookie ? getHashratePoolRank(cookie, 1, 0) : Promise.resolve([]),
    cookie ? getHashrateGoods(cookie) : Promise.resolve([]),
  ])
  const pool: any = poolRes.status === 'fulfilled' ? poolRes.value : null
  const engine: any = engineRes.status === 'fulfilled' ? engineRes.value : null
  const rank: any[] = rankRes.status === 'fulfilled' && Array.isArray(rankRes.value) ? rankRes.value : []
  const goods: any[] = goodsRes.status === 'fulfilled' && Array.isArray(goodsRes.value) ? goodsRes.value : []

  return (
    <ApkReplicaPage
      title="算力池"
      subtitle="贡献算力 · 幸运星 · 排行榜"
      hero="/apk/hashrate_pool_bg.jpg"
      heroClass="hashrate-hero"
      stats={[
        { label: '奖池算力', value: num(pool?.hashrate_sum ?? pool?.total_hashrate ?? 0) },
        { label: '我的算力', value: num(engine?.hashrate ?? 0) },
        { label: '引擎等级', value: `Lv${engine?.engine_lv ?? 0}` },
      ]}
      actions={[
        { href: '/hashrate/rank', label: '幸运星', desc: '查看本轮幸运奖励', meta: '原 APK 弹窗入口' },
        { href: '#hashrate-input-audit', label: '贡献算力', desc: '输入算力参与奖池', meta: '确认单' },
        { href: '/hashrate/rank', label: '排行榜', desc: '本轮与总榜排行' },
        { href: '/pay', label: '获取 TOFZ', desc: '充值/兑换入口' },
      ]}
    >
      <ApkSection title="算力排行">
        <ApkList>
          {rank.slice(0, 12).map((item: any, index) => (
            <ApkListItem
              key={item.user_seq ?? index}
              title={`${index + 1}. ${item.user_nickname ?? item.nickname ?? '匿名居民'}`}
              desc={item.race_name ?? item.user_race ? `种族 ${item.race_name ?? item.user_race}` : '算力居民'}
              meta={`${num(item.hashrate_sum ?? item.hashrate ?? 0)} H`}
            />
          ))}
          {rank.length === 0 && <ApkListItem title="暂无排行" desc="主站暂未返回算力排行。" />}
        </ApkList>
      </ApkSection>

      <div id="hashrate-input-audit" className="mb-6">
        <SafeActionPanel
          title="贡献算力确认单"
          endpoint="/hashratePool/input_hashrate/"
          payload={{
            pool_seq: pool?.seq ?? pool?.pool_seq ?? '',
            current_hashrate: engine?.hashrate ?? 0,
            minimum_amount: 10,
          }}
        />
      </div>

      <ApkSection title="算力商品">
        <ApkList>
          {goods.slice(0, 6).map((item: any) => (
            <ApkListItem key={item.seq} title={item.name ?? '算力商品'} desc={`+${item.hashrate ?? 0} H`} meta={`${item.price ?? 0} TOFZ`} />
          ))}
          {goods.length === 0 && <ApkListItem title="暂无商品" desc="保留 APK 的商品入口，等待接口数据。" />}
        </ApkList>
      </ApkSection>
    </ApkReplicaPage>
  )
}
