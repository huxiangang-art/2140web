import { ApkList, ApkListItem, ApkReplicaPage, ApkSection } from '@/components/ApkReplicaPage'
import { getDigitalPerson, getDigitalPersonRank, getDigitalPersonRewards, login } from '@/lib/api2140'

export const dynamic = 'force-dynamic'

const lvNames = ['', '碳基体', '猿人', '直立人', '智人', '原始人', '自然人', '农业人', '封建人', '工业人', '社会人', '契约人', '加密客', '基因体', '半数人', '算力体', '硅基体', '比特人', '低熵体', '全数人', '元人', '数字人']

export default async function DigitalPage() {
  const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const [personRes, rewardsRes, rankRes] = await Promise.allSettled([
    cookie ? getDigitalPerson(cookie) : Promise.resolve(null),
    cookie ? getDigitalPersonRewards(cookie) : Promise.resolve(null),
    cookie ? getDigitalPersonRank(cookie) : Promise.resolve([]),
  ])
  const person: any = personRes.status === 'fulfilled' ? personRes.value : null
  const rewards: any = rewardsRes.status === 'fulfilled' ? rewardsRes.value : null
  const rankRaw: any = rankRes.status === 'fulfilled' ? rankRes.value : []
  const rank: any[] = Array.isArray(rankRaw) ? rankRaw : rankRaw?.records ?? []
  const lv = Math.max(1, Math.min(21, Number(person?.person_lv ?? 1)))
  const standard = Number(person?.standard_sum ?? 0)

  return (
    <ApkReplicaPage
      title="数字人"
      subtitle="数字人进化 · 创世钥匙 · 等级奖励"
      hero="/apk/digital_person/digital_person_top_bg.jpg"
      heroClass="digital-hero"
      stats={[
        { label: '当前世代', value: `第${lv}代` },
        { label: '形态', value: lvNames[lv] },
        { label: '数字化', value: `${standard}%` },
      ]}
      actions={[
        { href: '/digital', label: '购买进化', desc: '原 APK 数字人购买入口', meta: '待接写接口' },
        { href: '/digital', label: '奖励规则', desc: '查看各世代奖励标准' },
        { href: '/digital', label: '排行榜', desc: '数字人进化排行' },
        { href: '/profile', label: '我的基地', desc: '返回个人中心' },
      ]}
    >
      <ApkSection title="当前形态">
        <div className="apk-page-media-card">
          <img src={`/apk/digital_person/person_equip${lv}.png`} alt={lvNames[lv]} />
        </div>
      </ApkSection>

      <ApkSection title="奖励标准">
        <ApkList>
          {(rewards?.standards ?? []).slice(0, 8).map((item: any, index: number) => (
            <ApkListItem key={index} title={`第 ${index + 1} 代 · ${lvNames[index + 1] ?? '数字人'}`} desc="进化达标奖励" meta={`${item}%`} />
          ))}
          {!(rewards?.standards ?? []).length && <ApkListItem title="暂无奖励标准" desc="保留 APK 数字人奖励结构。" />}
        </ApkList>
      </ApkSection>

      <ApkSection title="数字人排行">
        <ApkList>
          {rank.slice(0, 8).map((item: any, index) => (
            <ApkListItem key={item.user_seq ?? index} title={`${index + 1}. ${item.user_nickname ?? item.nickname ?? '居民'}`} desc={item.person_lv ? `第 ${item.person_lv} 代` : '数字人'} meta={`${item.standard_sum ?? item.score ?? 0}%`} />
          ))}
        </ApkList>
      </ApkSection>
    </ApkReplicaPage>
  )
}
