import { ApkList, ApkListItem, ApkReplicaPage, ApkSection } from '@/components/ApkReplicaPage'
import { getHashrateEngine, getHashrateEngineRecords, login } from '@/lib/api2140'
import { num } from '@/lib/metaverse'

export const dynamic = 'force-dynamic'

export default async function HashrateEnginePage() {
  const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const [engine, records] = await Promise.all([
    cookie ? getHashrateEngine(cookie).catch(() => null) : null,
    cookie ? getHashrateEngineRecords(cookie, 0).catch(() => []) : [],
  ])
  const list: any[] = Array.isArray(records) ? records : []
  return (
    <ApkReplicaPage
      title="算力引擎"
      subtitle="对应 APK hashrate_engine"
      hero="/apk/hashrate_engine_top_bg.jpg"
      stats={[
        { label: '当前算力', value: num((engine as any)?.hashrate ?? 0) },
        { label: '引擎等级', value: `Lv${(engine as any)?.engine_lv ?? 0}` },
        { label: '记录', value: list.length },
      ]}
    >
      <ApkSection title="操作记录">
        <ApkList>
          {list.slice(0, 20).map((item: any, index) => (
            <ApkListItem key={index} title={item.desc ?? item.type ?? '算力记录'} desc={item.time?.slice(0, 16) ?? ''} meta={item.hashrate ?? item.amount ?? ''} />
          ))}
          {list.length === 0 && <ApkListItem title="暂无引擎记录" desc="算力引擎入口已承接。" />}
        </ApkList>
      </ApkSection>
    </ApkReplicaPage>
  )
}
