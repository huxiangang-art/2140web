import { ApkList, ApkListItem, ApkReplicaPage, ApkSection } from '@/components/ApkReplicaPage'
import { getUserCookie } from '@/lib/auth'
import { getUserHashrate, login } from '@/lib/api2140'
import { num } from '@/lib/metaverse'

export const dynamic = 'force-dynamic'

export default async function ProfileHashratePage() {
  const userCookie = await getUserCookie()
  const sysCookie = userCookie ? null : await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const stat: any = (userCookie ?? sysCookie) ? await getUserHashrate(userCookie ?? sysCookie ?? '').catch(() => null) : null
  return (
    <ApkReplicaPage title="我的算力" subtitle="对应 APK my_hashrate" hero="/apk/my_hashrate_img1.jpg" stats={[
      { label: '总算力', value: num(stat?.hashrate ?? stat?.total_hashrate ?? 0) },
      { label: '今日', value: num(stat?.today_hashrate ?? 0) },
      { label: '记录', value: stat?.records?.length ?? 0 },
    ]}>
      <ApkSection title="算力概览">
        <ApkList><ApkListItem title="算力引擎" desc="查看引擎等级与操作记录。" meta="进入" href="/hashrate/engine" /></ApkList>
      </ApkSection>
    </ApkReplicaPage>
  )
}
