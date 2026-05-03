import { ApkList, ApkListItem, ApkReplicaPage, ApkSection } from '@/components/ApkReplicaPage'
import { getSpeeches, login } from '@/lib/api2140'

export const dynamic = 'force-dynamic'

const labelMap: Record<string, string> = { '1': '公告', '2': '讨论', '3': '教程', '4': '创作', '5': '提案' }

export default async function PlazaPage() {
  const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const speeches: any[] = cookie ? await getSpeeches(cookie).catch(() => []) : []

  return (
    <ApkReplicaPage
      title="广场"
      subtitle="种族广场 · 居民发言 · 置顶讨论"
      actions={[
        { href: '/plaza/post', label: '发言', desc: '发布广场动态' },
        { href: '/parliament', label: '议事厅', desc: '进入治理讨论' },
      ]}
    >
      <ApkSection title="发言记录">
        <ApkList>
          {speeches.slice(0, 24).map((speech: any) => (
            <ApkListItem
              key={speech.seq}
              href={`/plaza/${speech.seq}`}
              title={`${Number(speech.top_num ?? 0) > 0 ? '置顶 · ' : ''}${speech.title ?? '广场发言'}`}
              desc={`${speech.user_nick ?? speech.user_nickname ?? '居民'} · ${speech.content?.replace(/<[^>]+>/g, '').slice(0, 56) ?? ''}`}
              meta={labelMap[speech.label] ?? `${speech.comment_count ?? 0}评`}
            />
          ))}
          {speeches.length === 0 && <ApkListItem title="广场空无一人" desc="保留 APK 广场记录与发言入口。" />}
        </ApkList>
      </ApkSection>
    </ApkReplicaPage>
  )
}
