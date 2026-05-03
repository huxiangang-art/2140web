import { ApkList, ApkListItem, ApkReplicaPage, ApkSection } from '@/components/ApkReplicaPage'
import { getTreasureRewardRank, login } from '@/lib/api2140'

export const dynamic = 'force-dynamic'

export default async function TreasureRankPage() {
  const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const raw: any = cookie ? await getTreasureRewardRank(cookie, 1).catch(() => []) : []
  const rank: any[] = Array.isArray(raw) ? raw : raw?.records ?? raw?.list ?? raw?.rank ?? []
  return (
    <ApkReplicaPage title="脑矩阵奖励榜" subtitle="对应 APK treasure_hunt_reward_rank" hero="/apk/treasure_hunt_futuredebris_top.jpg">
      <ApkSection title="奖励排行">
        <ApkList>
          {rank.slice(0, 30).map((item: any, index) => <ApkListItem key={item.user_seq ?? index} title={`${index + 1}. ${item.user_nickname ?? item.nickname ?? '居民'}`} desc="脑矩阵奖励" meta={item.reward ?? item.hashrate ?? 0} />)}
          {rank.length === 0 && <ApkListItem title="暂无排行" desc="等待主站返回脑矩阵排行。" />}
        </ApkList>
      </ApkSection>
    </ApkReplicaPage>
  )
}
