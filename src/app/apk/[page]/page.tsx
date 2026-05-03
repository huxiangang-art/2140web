import { redirect } from 'next/navigation'
import { routeForApkPage } from '@/lib/apk-route-map'

export const dynamic = 'force-dynamic'

export default async function ApkPageRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ page: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const { page } = await params
  const query = await searchParams
  const seq = single(query?.seq ?? query?.goods_seq ?? query?.nft_seq ?? query?.box_seq ?? query?.speech_seq)

  if (seq) {
    if (page === 'store_goods') redirect(`/store/${seq}`)
    if (page === 'nft_detail') redirect(`/nft/${seq}`)
    if (page === 'bilnd_box_detail') redirect(`/blindbox/${seq}`)
    if (page === 'race_plaza_speech') redirect(`/plaza/${seq}`)
    if (page === 'prop_detail') redirect(`/prop/${seq}`)
  }

  redirect(routeForApkPage(page, '/'))
}

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}
