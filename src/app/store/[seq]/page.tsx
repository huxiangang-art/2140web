import { ApkList, ApkListItem, ApkReplicaPage, ApkSection } from '@/components/ApkReplicaPage'
import { getStoreGoodsDetail, login } from '@/lib/api2140'

export const dynamic = 'force-dynamic'

export default async function StoreGoodsPage({ params }: { params: Promise<{ seq: string }> }) {
  const { seq } = await params
  const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const goods: any = cookie ? await getStoreGoodsDetail(cookie, seq).catch(() => null) : null
  const image = goods?.detail_img || goods?.img || goods?.cover
  return (
    <ApkReplicaPage title={goods?.brief_name ?? goods?.name ?? `商品 #${seq}`} subtitle="对应 APK store_goods" hero={asset(image) || '/apk/store_nft_introduce_img.jpg'}>
      <ApkSection title="商品信息">
        <ApkList>
          <ApkListItem title="价格" desc={goods?.price ? `${goods.price} TOFZ` : '未公开'} meta="TOFZ" />
          <ApkListItem title="创作者" desc={goods?.user_nick ?? goods?.user_nickname ?? '2140 商店'} meta="作者" />
          <ApkListItem title="购买确认" desc={goods ? '当前保持安全承接，下一步接订单确认单。' : '主站未返回该商品详情，已保留兼容承接。'} meta="待接" />
        </ApkList>
      </ApkSection>
    </ApkReplicaPage>
  )
}

function asset(path?: string) {
  if (!path) return ''
  return path.startsWith('http') ? path : `https://www.2140city.cn${path.startsWith('/') ? path : `/${path}`}`
}
