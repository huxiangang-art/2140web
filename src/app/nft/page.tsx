import { ApkList, ApkListItem, ApkReplicaPage, ApkSection } from '@/components/ApkReplicaPage'
import { getNfts, login } from '@/lib/api2140'

export const dynamic = 'force-dynamic'

export default async function NftPage() {
  const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const nfts: any[] = cookie ? await getNfts(cookie).catch(() => []) : []

  return (
    <ApkReplicaPage
      title="2140数字藏品"
      subtitle={`文明创作 · 链上资产 · ${nfts.length} 件`}
      hero="/apk/nfts_bg.jpg"
      heroClass="nft-hero"
      actions={[
        { href: '/nft/my', label: '我的 NFT', desc: '查看已拥有数字藏品' },
        { href: '/store/nft-apply', label: 'NFT 申请', desc: '在 N生活发布作品' },
        { href: '/nft/more', label: '更多藏品', desc: '浏览文明典藏室' },
        { href: '/profile', label: '绑定信息', desc: '个人资产与账号' },
      ]}
    >
      <ApkSection title="数字藏品">
        <ApkList>
          {nfts.slice(0, 16).map((item: any) => (
            <ApkListItem
              key={item.seq}
              href={item.seq ? `/nft/${item.seq}` : '/nft'}
              title={item.name ?? `NFT #${item.seq}`}
              desc={item.creater_nick ?? item.user_nick ?? '2140 创作者'}
              meta={item.price ? `${item.price}` : '查看'}
            />
          ))}
          {nfts.length === 0 && <ApkListItem title="暂无 NFT 数据" desc="保留 APK 星图背景与数字藏品入口。" />}
        </ApkList>
      </ApkSection>
    </ApkReplicaPage>
  )
}
