import { ApkList, ApkListItem, ApkReplicaPage, ApkSection } from '@/components/ApkReplicaPage'
import { getHashratePoolRank, login } from '@/lib/api2140'
import { num } from '@/lib/metaverse'

export const dynamic = 'force-dynamic'

export default async function HashrateRankPage() {
  const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const rank: any[] = cookie ? await getHashratePoolRank(cookie, 1, 0).catch(() => []) : []
  return (
    <ApkReplicaPage title="算力排行榜" subtitle="对应 APK hashrate_pool_rank" hero="/apk/hashrate_pool_bg.jpg">
      <ApkSection title="排行榜">
        <ApkList>
          {rank.slice(0, 40).map((item: any, index) => (
            <ApkListItem key={item.user_seq ?? index} title={`${index + 1}. ${item.user_nickname ?? item.nickname ?? '居民'}`} desc="算力池排行" meta={`${num(item.hashrate_sum ?? item.hashrate ?? 0)} H`} />
          ))}
          {rank.length === 0 && <ApkListItem title="暂无排行" desc="等待主站返回算力池排行。" />}
        </ApkList>
      </ApkSection>
    </ApkReplicaPage>
  )
}
