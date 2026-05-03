import { ApkList, ApkListItem, ApkReplicaPage, ApkSection } from '@/components/ApkReplicaPage'

export const dynamic = 'force-dynamic'

export default function StoreNftApplyPage() {
  return (
    <ApkReplicaPage title="NFT 我的创造" subtitle="对应 APK store_nft_apply" hero="/apk/store_nft_introduce_img.jpg">
      <ApkSection title="申请流程">
        <ApkList>
          <ApkListItem title="作品信息" desc="填写名称、介绍、展示图与创作者信息。" meta="1" />
          <ApkListItem title="平台审核" desc="通过后进入 2140 文明典藏室展示。" meta="2" />
          <ApkListItem title="发布销售" desc="承接 N生活商品与 NFT 详情页。" meta="3" />
        </ApkList>
      </ApkSection>
    </ApkReplicaPage>
  )
}
