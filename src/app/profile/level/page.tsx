import { ApkReplicaPage, ApkSection } from '@/components/ApkReplicaPage'

export const dynamic = 'force-dynamic'

export default function ProfileLevelPage() {
  return (
    <ApkReplicaPage title="我的等级" subtitle="对应 APK my_level" hero="/apk/my_level_top_bg.jpg">
      <ApkSection title="等级体系">
        <div className="apk-page-media-card"><img src="/apk/level_rule_img1.jpg" alt="" /></div>
      </ApkSection>
    </ApkReplicaPage>
  )
}
