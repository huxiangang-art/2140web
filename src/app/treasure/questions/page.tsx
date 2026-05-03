import { ApkList, ApkListItem, ApkReplicaPage, ApkSection } from '@/components/ApkReplicaPage'

export const dynamic = 'force-dynamic'

export default function TreasureQuestionsPage() {
  return (
    <ApkReplicaPage title="我的题目" subtitle="对应 APK my_questions" hero="/apk/treasure_hunt_index_top_bg.png">
      <ApkSection title="题目记录">
        <ApkList>
          <ApkListItem title="暂无题目记录" desc="下一步接 my_questions 接口和审核状态。" meta="待接" />
        </ApkList>
      </ApkSection>
    </ApkReplicaPage>
  )
}
