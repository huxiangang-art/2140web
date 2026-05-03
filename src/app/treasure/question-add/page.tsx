import { ApkList, ApkListItem, ApkReplicaPage, ApkSection } from '@/components/ApkReplicaPage'

export const dynamic = 'force-dynamic'

export default function TreasureQuestionAddPage() {
  return (
    <ApkReplicaPage title="我要出题" subtitle="对应 APK treasure_hunt_question_add" hero="/apk/treasure_hunt_index_top_bg.png">
      <ApkSection title="安全提交流程">
        <ApkList>
          <ApkListItem title="题干与答案" desc="先生成题目提案，暂不直接写入主站。" meta="1" />
          <ApkListItem title="规则校验" desc="检查重复题、敏感词和答案格式。" meta="2" />
          <ApkListItem title="提交审核" desc="审计通过后再接写接口。" meta="3" />
        </ApkList>
      </ApkSection>
    </ApkReplicaPage>
  )
}
