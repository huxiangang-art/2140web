import { ApkReplicaPage, ApkSection } from '@/components/ApkReplicaPage'

export const dynamic = 'force-dynamic'

export default function TreasureRulePage() {
  return (
    <ApkReplicaPage title="脑矩阵规则" subtitle="对应 APK treasure_hunt_rule" hero="/apk/treasure_hunt_index_top_bg.png">
      <ApkSection title="规则图解">
        {[1, 2, 3, 4].map((n) => <div className="apk-page-media-card" key={n}><img src={`/apk/treasure_hunt_rule_img${n}.jpg`} alt="" /></div>)}
      </ApkSection>
    </ApkReplicaPage>
  )
}
