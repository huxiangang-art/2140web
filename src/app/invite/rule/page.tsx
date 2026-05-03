import { ApkList, ApkListItem, ApkReplicaPage, ApkSection } from '@/components/ApkReplicaPage'

export const dynamic = 'force-dynamic'

export default function InviteRulePage() {
  return (
    <ApkReplicaPage title="邀请规则" subtitle="对应 APK invite_rule" hero="/apk/invite_rule_img1.jpg">
      <ApkSection title="规则说明">
        <ApkList>
          <ApkListItem title="经典模式" desc="分享邀请码，好友注册后计入邀请记录。" meta="邀请" />
          <ApkListItem title="AI模式" desc="跳转基因匹配计划，形成更强关系链。" meta="AI" />
          <ApkListItem title="算力收益" desc="邀请与任务可叠加到算力系统。" meta="TOFZ" />
        </ApkList>
      </ApkSection>
    </ApkReplicaPage>
  )
}
