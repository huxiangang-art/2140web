import { ApkList, ApkListItem, ApkReplicaPage, ApkSection } from '@/components/ApkReplicaPage'
import { getBlindBoxDetail, login } from '@/lib/api2140'

export const dynamic = 'force-dynamic'

export default async function BlindBoxDetailPage({ params }: { params: Promise<{ seq: string }> }) {
  const { seq } = await params
  const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const detail: any = cookie ? await getBlindBoxDetail(cookie, seq).catch(() => null) : null
  return (
    <ApkReplicaPage title={detail?.title ?? `盲盒 #${seq}`} subtitle="对应 APK bilnd_box_detail" hero="/apk/my_banner.jpg">
      <ApkSection title="盲盒信息">
        <ApkList>
          <ApkListItem title="状态" desc={detail?.status_name ?? detail?.status ?? '未知'} meta="状态" />
          <ApkListItem title="类型" desc={detail?.content_type ?? '奖励'} meta="类型" />
          <ApkListItem title="参与确认" desc={detail ? '下一步接盲盒参与确认单，避免直接写入。' : '主站未返回该盲盒详情，已保留兼容承接。'} meta="待接" />
        </ApkList>
      </ApkSection>
    </ApkReplicaPage>
  )
}
