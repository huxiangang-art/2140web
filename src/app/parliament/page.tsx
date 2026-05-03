import { ApkList, ApkListItem, ApkReplicaPage, ApkSection } from '@/components/ApkReplicaPage'
import { getActiveValRank, getBills, getOfficialInfo, getParliamentUser, getSpeeches, login } from '@/lib/api2140'

export const dynamic = 'force-dynamic'

const statusLabel: Record<string, string> = {
  '1': '投票中',
  '2': '待审核',
  '3': '已结束',
  '4': '已通过',
  '5': '已否决',
}

export default async function ParliamentPage() {
  const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const [billsRes, userRes, infoRes, rankRes, speechesRes] = await Promise.allSettled([
    cookie ? getBills(cookie) : Promise.resolve([]),
    cookie ? getParliamentUser(cookie) : Promise.resolve(null),
    cookie ? getOfficialInfo(cookie) : Promise.resolve(null),
    cookie ? getActiveValRank(cookie) : Promise.resolve(null),
    cookie ? getSpeeches(cookie) : Promise.resolve([]),
  ])
  const bills: any[] = billsRes.status === 'fulfilled' && Array.isArray(billsRes.value) ? billsRes.value : []
  const user: any = userRes.status === 'fulfilled' ? userRes.value : null
  const info: any = infoRes.status === 'fulfilled' ? infoRes.value : null
  const rank: any = rankRes.status === 'fulfilled' ? rankRes.value : null
  const speeches: any[] = speechesRes.status === 'fulfilled' && Array.isArray(speechesRes.value) ? speechesRes.value : []

  return (
    <ApkReplicaPage
      title="议事厅"
      subtitle="仲裁审核 · 经验排行榜 · 城邦治理"
      hero="/apk/racewar/parliament_top_bg.jpg"
      stats={[
        { label: '城邦居民', value: Number(info?.count ?? 0).toLocaleString() },
        { label: '我的经验', value: user?.active_val ?? 0 },
        { label: '职位', value: user?.official_name ?? '居民' },
      ]}
      actions={[
        { href: '/parliament', label: '经验值排行榜', desc: '查看每日与总经验排行' },
        { href: '/parliament', label: '申请职位', desc: '进入职位申请与审核' },
        { href: '/citycode', label: '法典提案', desc: '创世设定 / 城邦议案' },
        { href: '/plaza', label: '居民发言', desc: '跳转广场讨论' },
      ]}
    >
      <ApkSection title="议案记录">
        <ApkList>
          {bills.slice(0, 12).map((bill: any) => (
            <ApkListItem
              key={bill.seq}
              title={bill.title ?? `议案 ${bill.seq}`}
              desc={`${bill.user_nickname ?? '居民'} · ${bill.content?.replace(/<[^>]+>/g, '').slice(0, 42) ?? '城邦治理事项'}`}
              meta={statusLabel[bill.status] ?? '议案'}
            />
          ))}
          {bills.length === 0 && <ApkListItem title="暂无议案" desc="保留 APK 的仲裁审核与职位申请入口。" />}
        </ApkList>
      </ApkSection>

      <ApkSection title="活跃讨论">
        <ApkList>
          {speeches.slice(0, 6).map((speech: any) => (
            <ApkListItem key={speech.seq} href={`/plaza/${speech.seq}`} title={speech.title} desc={speech.user_nick ?? speech.user_nickname} meta="广场" />
          ))}
          {speeches.length === 0 && (rank?.daily_rank ?? []).slice(0, 6).map((item: any, index: number) => (
            <ApkListItem key={item.user_seq ?? index} title={`${index + 1}. ${item.user_nickname ?? '居民'}`} desc="经验值排行" meta={item.active_val ?? item.total_active_val ?? 0} />
          ))}
        </ApkList>
      </ApkSection>
    </ApkReplicaPage>
  )
}
