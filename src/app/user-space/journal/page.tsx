import Link from 'next/link'
import { getUserCookie } from '@/lib/auth'
import { getUserSpaceJournals, login } from '@/lib/api2140'
import { settled } from '@/lib/metaverse'

export const dynamic = 'force-dynamic'

export default async function UserSpaceJournalPage() {
  const userCookie = await getUserCookie()
  const sysCookie = userCookie ? null : await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const cookie = userCookie ?? sysCookie ?? ''
  const journals = await settled(getUserSpaceJournals(cookie, '0', 0), [])
  const list: any[] = Array.isArray(journals) ? journals : []

  return (
    <main className="user-space-journal-shell">
      <section className="user-space-journal-contain">
        <header className="propaganda-fixed-top">
          <Link href="/user-space" className="propaganda-return" aria-label="返回个人空间" />
          <div className="propaganda-brand">空间日志</div>
          <Link href="/" className="propaganda-menu-icon" aria-label="首页" />
        </header>
        <div className="user-space-journal-list">
          {list.slice(0, 18).map((item: any, index) => (
            <article key={item.seq ?? index}>
              <div>{item.content?.replace(/<[^>]+>/g, '') || item.title || '空间日志'}</div>
              <span>{item.time?.slice(0, 16) ?? item.create_time?.slice(0, 16) ?? '2140'}</span>
            </article>
          ))}
          {list.length === 0 && (
            <article>
              <div>暂无空间日志</div>
              <span>等待主站返回 user_space_journal 数据</span>
            </article>
          )}
        </div>
      </section>
    </main>
  )
}
