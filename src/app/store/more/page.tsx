import { ApkList, ApkListItem, ApkReplicaPage, ApkSection } from '@/components/ApkReplicaPage'
import { getStoreGoodsMore, login } from '@/lib/api2140'

export const dynamic = 'force-dynamic'

export default async function StoreMorePage() {
  const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const raw: any = cookie ? await getStoreGoodsMore(cookie).catch(() => []) : []
  const goods: any[] = Array.isArray(raw) ? raw : raw?.goods ?? []
  return (
    <ApkReplicaPage title="更多商品" subtitle="对应 APK store_goods_more" hero="/apk/store_nft_introduce_img.jpg">
      <ApkSection title="商品列表">
        <ApkList>
          {goods.slice(0, 30).map((item: any, index) => <ApkListItem key={item.seq ?? index} href={item.seq ? `/store/${item.seq}` : undefined} title={item.brief_name ?? item.name ?? '文明商品'} desc={item.user_nick ?? '2140 商店'} meta={item.price ? `${item.price} TOFZ` : '查看'} />)}
          {goods.length === 0 && <ApkListItem title="暂无更多商品" desc="保留 APK 商品更多页入口。" />}
        </ApkList>
      </ApkSection>
    </ApkReplicaPage>
  )
}
