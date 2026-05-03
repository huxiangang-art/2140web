import { ApkList, ApkListItem, ApkReplicaPage, ApkSection } from '@/components/ApkReplicaPage'
import { getNfts, login } from '@/lib/api2140'

export const dynamic = 'force-dynamic'

export default async function NftMorePage() {
  const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const nfts: any[] = cookie ? await getNfts(cookie).catch(() => []) : []
  return (
    <ApkReplicaPage title="更多数字藏品" subtitle="对应 APK nfts_more" hero="/apk/nfts_bg.jpg" heroClass="nft-hero">
      <ApkSection title="藏品列表">
        <ApkList>
          {nfts.map((item: any) => <ApkListItem key={item.seq} href={item.seq ? `/nft/${item.seq}` : undefined} title={item.name ?? `NFT #${item.seq}`} desc={item.creater_nick ?? '2140 创作者'} meta="NFT" />)}
          {nfts.length === 0 && <ApkListItem title="暂无更多藏品" desc="保留 APK nfts_more 入口。" />}
        </ApkList>
      </ApkSection>
    </ApkReplicaPage>
  )
}
