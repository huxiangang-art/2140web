import { ApkList, ApkListItem, ApkReplicaPage, ApkSection } from '@/components/ApkReplicaPage'
import { getLoggedIn, getUserCookie } from '@/lib/auth'
import { getUserInvite, login } from '@/lib/api2140'

export const dynamic = 'force-dynamic'

export default async function InvitePage() {
  const [loggedIn, userCookie, sysCookie] = await Promise.all([
    getLoggedIn(),
    getUserCookie(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])
  const cookie = userCookie ?? sysCookie ?? ''
  const invite: any = cookie ? await getUserInvite(cookie).catch(() => null) : null

  return (
    <ApkReplicaPage
      title="邀请"
      subtitle="经典模式 · AI 模式 · 分享邀请函"
      hero="/apk/invite_top_bg.jpg"
      stats={[
        { label: '邀请码', value: invite?.invite_code ?? '2140' },
        { label: '已邀请', value: invite?.invite_count ?? 0 },
        { label: '可邀请', value: invite?.invite_limit ?? '-' },
      ]}
      actions={[
        { href: '/invite', label: '经典模式', desc: '分享邀请函' },
        { href: '/gene', label: 'AI模式', desc: '分享基因匹配计划' },
        { href: '/profile', label: '我的好友', desc: '邀请记录与好友' },
        { href: '/hashrate/engine', label: '算力引擎', desc: '邀请收益与算力' },
      ]}
    >
      <ApkSection title="邀请说明">
        <ApkList>
          <ApkListItem title="分享邀请函" desc={loggedIn ? '当前账号已接入邀请数据。' : '当前为游客预览，登录后展示真实邀请码。'} meta="分享" href="/invite/rule" />
          <ApkListItem title="基因匹配计划" desc="承接 APK 的 AI 模式，跳转基因测序入口。" meta="AI" />
        </ApkList>
      </ApkSection>
    </ApkReplicaPage>
  )
}
