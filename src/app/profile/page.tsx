import { ApkList, ApkListItem, ApkReplicaPage, ApkSection } from '@/components/ApkReplicaPage'
import { getLoggedIn, getUserCookie } from '@/lib/auth'
import { getUserHashrate, getUserInfo, getUserInvite, getUserOrders, getUserTokenRecords, getUserTotalToken, getUserVotes, login } from '@/lib/api2140'
import { num } from '@/lib/metaverse'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const [loggedIn, userCookie, sysCookie] = await Promise.all([
    getLoggedIn(),
    getUserCookie(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])
  const cookie = userCookie ?? sysCookie ?? ''
  const [infoRes, hashrateRes, tokenRes, inviteRes, tokenRecordsRes, ordersRes, votesRes] = await Promise.allSettled([
    cookie ? getUserInfo(cookie) : Promise.resolve(null),
    cookie ? getUserHashrate(cookie) : Promise.resolve(null),
    cookie ? getUserTotalToken(cookie) : Promise.resolve(null),
    cookie ? getUserInvite(cookie) : Promise.resolve(null),
    cookie ? getUserTokenRecords(cookie, 0) : Promise.resolve(null),
    cookie ? getUserOrders(cookie) : Promise.resolve([]),
    cookie ? getUserVotes(cookie, 0, 0) : Promise.resolve(null),
  ])
  const rawInfo: any = infoRes.status === 'fulfilled' ? infoRes.value : null
  const info = rawInfo?.ret === 0 ? rawInfo.data : rawInfo
  const hashrate: any = hashrateRes.status === 'fulfilled' ? hashrateRes.value : null
  const token: any = tokenRes.status === 'fulfilled' ? tokenRes.value : null
  const invite: any = inviteRes.status === 'fulfilled' ? inviteRes.value : null
  const records: any = tokenRecordsRes.status === 'fulfilled' ? tokenRecordsRes.value : null
  const orders: any[] = ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value) ? ordersRes.value : []
  const votes: any = votesRes.status === 'fulfilled' ? votesRes.value : null

  return (
    <ApkReplicaPage
      title="基地"
      subtitle={loggedIn ? '个人中心 · 资产 · 创作 · 设置' : '游客预览 · 登录后查看个人数据'}
      hero="/apk/my_banner.jpg"
      active="profile"
      stats={[
        { label: '算力', value: num(hashrate?.hashrate ?? info?.hashrate ?? 0) },
        { label: 'TOFZ', value: num(token?.total_token ?? info?.token ?? 0) },
        { label: '邀请', value: invite?.invite_count ?? info?.invite_count ?? 0 },
      ]}
      actions={[
        { href: '/profile', label: '等级', desc: info?.nickname ?? '个人等级与勋章' },
        { href: '/hashrate', label: '算力', desc: '我的算力与记录' },
        { href: '/profile', label: 'TOFZ', desc: '代币流水与余额' },
        { href: '/nft/my', label: 'NFT', desc: '我的数字藏品' },
        { href: '/write', label: '我的作品', desc: '文明章节与创作' },
        { href: '/citycode', label: '我的设定', desc: '城邦设定与提案' },
        { href: '/invite', label: '邀请好友', desc: '邀请码与邀请记录' },
        { href: '/bulletins', label: '公告', desc: '系统消息' },
      ]}
    >
      <ApkSection title="最近记录">
        <ApkList>
          {(records?.records ?? records?.list ?? []).slice(0, 6).map((item: any, index: number) => (
            <ApkListItem key={index} title={item.desc ?? item.title ?? 'TOFZ 记录'} desc={item.time?.slice(0, 16) ?? '记录'} meta={item.amount ?? item.token ?? ''} />
          ))}
          {orders.slice(0, 3).map((item: any, index) => (
            <ApkListItem key={`o-${index}`} title={item.goods_name ?? '订单记录'} desc={item.time?.slice(0, 16) ?? '订单'} meta={item.status_name ?? item.status ?? ''} />
          ))}
          {(votes?.records ?? []).slice(0, 3).map((item: any, index: number) => (
            <ApkListItem key={`v-${index}`} title={item.title ?? '投票记录'} desc="我的投票" meta={item.status ?? ''} />
          ))}
          {!(records?.records ?? records?.list ?? []).length && !orders.length && !(votes?.records ?? []).length && (
            <ApkListItem title="暂无个人记录" desc="基地功能入口已按 APK 首页承接。" />
          )}
        </ApkList>
      </ApkSection>
    </ApkReplicaPage>
  )
}
