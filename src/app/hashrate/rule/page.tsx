import { ApkReplicaPage, ApkSection } from '@/components/ApkReplicaPage'

export const dynamic = 'force-dynamic'

export default function HashrateRulePage() {
  return (
    <ApkReplicaPage title="算力池规则" subtitle="对应 APK hashrate_pool_rule" hero="/apk/hashrate_pool_rule_img1.jpg">
      <ApkSection title="规则图解">
        <div className="apk-page-media-card"><img src="/apk/hashrate_pool_rule_img1.jpg" alt="" /></div>
        <div className="apk-page-media-card"><img src="/apk/hashrate_pool_rule_img2.jpg" alt="" /></div>
        <div className="apk-page-media-card"><img src="/apk/hashrate_pool_rule_img3.jpg" alt="" /></div>
      </ApkSection>
    </ApkReplicaPage>
  )
}
