import { ApkList, ApkListItem, ApkReplicaPage, ApkSection } from '@/components/ApkReplicaPage'
import { getNft, login } from '@/lib/api2140'

export const dynamic = 'force-dynamic'

export default async function NftDetailPage({ params }: { params: Promise<{ seq: string }> }) {
  const { seq } = await params
  const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const nft: any = cookie ? await getNft(cookie, seq).catch(() => null) : null
  return (
    <ApkReplicaPage title={nft?.name ?? `NFT #${seq}`} subtitle="对应 APK nft_detail" hero={asset(nft?.display_url ?? nft?.img) || '/apk/nfts_bg.jpg'} heroClass="nft-hero">
      <ApkSection title="藏品信息">
        <ApkList>
          <ApkListItem title="创作者" desc={nft?.creater_nick ?? nft?.user_nick ?? '2140 创作者'} meta="Creator" />
          <ApkListItem title="Token" desc={nft?.token_id ?? `#${seq}`} meta="NFT" />
          <ApkListItem title="说明" desc={strip(nft?.desc ?? nft?.introduce) || '主站未返回该 NFT 详情，已保留兼容承接。'} meta="详情" />
        </ApkList>
      </ApkSection>
    </ApkReplicaPage>
  )
}

function asset(path?: string) {
  if (!path) return ''
  return path.startsWith('http') ? path : `https://www.2140city.cn${path.startsWith('/') ? path : `/${path}`}`
}

function strip(input?: string) {
  return (input ?? '').replace(/<[^>]+>/g, '').trim()
}
