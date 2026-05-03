import { ApkList, ApkListItem, ApkReplicaPage, ApkSection } from '@/components/ApkReplicaPage'
import { getRecentUpdates, getTimeNodes, getWriteBranchs, login } from '@/lib/api2140'

export const dynamic = 'force-dynamic'

export default async function WritePage() {
  const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const [nodesRes, branchesRes, recentRes] = await Promise.allSettled([
    cookie ? getTimeNodes(cookie) : Promise.resolve([]),
    cookie ? getWriteBranchs(cookie, '1', '1') : Promise.resolve([]),
    cookie ? getRecentUpdates(cookie, 0) : Promise.resolve([]),
  ])
  const nodes: any[] = nodesRes.status === 'fulfilled' && Array.isArray(nodesRes.value) ? nodesRes.value : []
  const branches: any[] = branchesRes.status === 'fulfilled' && Array.isArray(branchesRes.value) ? branchesRes.value : []
  const recent: any[] = recentRes.status === 'fulfilled' && Array.isArray(recentRes.value) ? recentRes.value : []

  return (
    <ApkReplicaPage
      title="幻次元"
      subtitle="世界设定 · 六大种族 · 文明支线"
      hero="/apk/write_index_top_img.jpg"
      actions={[
        { href: '/world', label: '世界设定', desc: '查看 2140 文明背景' },
        { href: '/races', label: '六大种族', desc: '人、熵、神、晓、AI、零' },
        { href: '/write/invest', label: '写作投资', desc: '章节收益与投资记录' },
        { href: '/citycode', label: '创世法典', desc: '提案与修正案' },
      ]}
    >
      <ApkSection title="最新更新">
        <ApkList>
          {recent.slice(0, 8).map((item: any, index) => (
            <ApkListItem
              key={item.seq ?? index}
              href={item.branch_seq && (item.seq ?? item.chapter_seq) ? `/write/chapter/${item.branch_seq}/${item.seq ?? item.chapter_seq}` : undefined}
              title={item.title ?? item.branch_name ?? '未命名章节'}
              desc={item.author_nickname ?? item.user_nick ?? item.content?.replace(/<[^>]+>/g, '').slice(0, 42)}
              meta={item.time?.slice(0, 10) ?? '更新'}
            />
          ))}
          {recent.length === 0 && <ApkListItem title="暂无更新" desc="等待主站接口返回章节更新。" />}
        </ApkList>
      </ApkSection>

      <ApkSection title="文明支线">
        <ApkList>
          {branches.slice(0, 10).map((branch: any) => (
            <ApkListItem
              key={branch.seq}
              href={`/write/branch/${branch.seq}`}
              title={branch.name ?? branch.title ?? `支线 ${branch.seq}`}
              desc={branch.introduce ?? branch.desc ?? `${branch.chapter_count ?? 0} 个章节`}
              meta={branch.hot ? `热度 ${branch.hot}` : '进入'}
            />
          ))}
          {branches.length === 0 && nodes.slice(0, 6).map((node: any) => (
            <ApkListItem key={node.seq} title={node.name ?? node.title ?? `时间节点 ${node.seq}`} desc="时间线节点" meta="节点" />
          ))}
        </ApkList>
      </ApkSection>
    </ApkReplicaPage>
  )
}
