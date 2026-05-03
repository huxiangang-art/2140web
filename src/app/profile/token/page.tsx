import { ApkList, ApkListItem, ApkReplicaPage, ApkSection } from '@/components/ApkReplicaPage'
import { getUserCookie } from '@/lib/auth'
import { getUserTokenRecords, getUserTotalToken, login } from '@/lib/api2140'
import { num } from '@/lib/metaverse'

export const dynamic = 'force-dynamic'

export default async function ProfileTokenPage() {
  const userCookie = await getUserCookie()
  const sysCookie = userCookie ? null : await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const cookie = userCookie ?? sysCookie ?? ''
  const [token, raw] = await Promise.all([
    cookie ? getUserTotalToken(cookie).catch(() => null) : null,
    cookie ? getUserTokenRecords(cookie, 0).catch(() => null) : null,
  ])
  const records: any[] = raw?.records ?? raw?.list ?? []
  return (
    <ApkReplicaPage title="我的 TOFZ" subtitle="对应 APK my_token" hero="/apk/my_token_img1.jpg" stats={[
      { label: '总量', value: num((token as any)?.total_token ?? (token as any)?.token ?? 0) },
      { label: '记录', value: records.length },
      { label: '状态', value: '正常' },
    ]}>
      <ApkSection title="流水记录">
        <ApkList>
          {records.slice(0, 20).map((item, index) => <ApkListItem key={index} title={item.desc ?? item.title ?? 'TOFZ 记录'} desc={item.time?.slice(0, 16) ?? ''} meta={item.amount ?? item.token ?? ''} />)}
          {records.length === 0 && <ApkListItem title="暂无流水" desc="等待主站返回 my_token 数据。" />}
        </ApkList>
      </ApkSection>
    </ApkReplicaPage>
  )
}
