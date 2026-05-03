import { ApkList, ApkListItem, ApkReplicaPage, ApkSection } from '@/components/ApkReplicaPage'
import { getStoreGoods, getStoreGoodsMore, login } from '@/lib/api2140'

export const dynamic = 'force-dynamic'

export default async function StorePage() {
  const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const [featuredRes, moreRes] = await Promise.allSettled([
    cookie ? getStoreGoods(cookie) : Promise.resolve(null),
    cookie ? getStoreGoodsMore(cookie) : Promise.resolve([]),
  ])
  const featured: any = featuredRes.status === 'fulfilled' ? featuredRes.value : null
  const featuredGoods: any[] = Array.isArray(featured?.the_goods) ? featured.the_goods : []
  const moreRaw: any = moreRes.status === 'fulfilled' ? moreRes.value : []
  const moreGoods: any[] = Array.isArray(moreRaw) ? moreRaw : moreRaw?.goods ?? []

  return (
    <ApkReplicaPage
      title="N生活"
      subtitle="光速限时秒杀 · NFT 我的创造 · 文明典藏室"
      hero="/apk/store_nft_introduce_img.jpg"
      actions={[
        { href: featuredGoods[0]?.seq ? `/store/more` : '/store/more', label: '立即购买', desc: '光速限时秒杀', meta: featuredGoods[0]?.brief_name ?? '商品' },
        { href: '/store/more', label: '立即查看', desc: '引力透视效应', meta: featuredGoods[1]?.brief_name ?? '下一件' },
        { href: '/store/nft-apply', label: '发布 NFT', desc: '在 2140 发布你的 NFT', meta: '申请' },
        { href: '/nft', label: '文明典藏室', desc: '查看数字藏品' },
      ]}
    >
      <ApkSection title="精选商品">
        <ApkList>
          {[...featuredGoods, ...moreGoods].slice(0, 12).map((item: any, index) => (
            <ApkListItem
              key={item.seq ?? index}
              href={item.seq ? `/store/${item.seq}` : undefined}
              title={item.brief_name ?? item.name ?? '文明商品'}
              desc={item.user_nick ?? item.desc?.replace(/<[^>]+>/g, '').slice(0, 48) ?? '2140 文明商店'}
              meta={item.price ? `${item.price} TOFZ` : item.is_nft === '1' ? 'NFT' : '查看'}
            />
          ))}
          {featuredGoods.length + moreGoods.length === 0 && <ApkListItem title="商店暂无商品" desc="页面结构已按 APK 入口复刻，等待商品接口返回。" />}
        </ApkList>
      </ApkSection>
    </ApkReplicaPage>
  )
}
