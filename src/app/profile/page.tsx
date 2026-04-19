import { Nav } from '@/components/Nav'
import { redirect } from 'next/navigation'
import { getUserCookie, getLoggedIn } from '@/lib/auth'
import {
  getUserInfo, getUserHashrate, getUserTotalToken, getUserInvite,
  getUserTokenRecords, getUserOrders, getUserVotes,
  RACE_NAMES, RACE_COLORS,
} from '@/lib/api2140'
import { ProfileClient } from './ProfileClient'

export const dynamic = 'force-dynamic'

async function getProfileData(cookie: string) {
  const results = await Promise.allSettled([
    getUserInfo(cookie),
    getUserHashrate(cookie),
    getUserTotalToken(cookie),
    getUserInvite(cookie),
    getUserTokenRecords(cookie, 0),
    getUserOrders(cookie),
    getUserVotes(cookie, 0, 0),
  ])
  const [infoRes, hashrateRes, tokenRes, inviteRes, tokenRecordsRes, ordersRes, votesRes] = results
  const infoRaw = infoRes.status === 'fulfilled' ? infoRes.value : null
  const info = infoRaw?.ret === 0 ? infoRaw.data : null
  return {
    info,
    hashrateStat: hashrateRes.status === 'fulfilled' ? hashrateRes.value : null,
    token: tokenRes.status === 'fulfilled' ? tokenRes.value : null,
    invite: inviteRes.status === 'fulfilled' ? inviteRes.value : null,
    tokenData: tokenRecordsRes.status === 'fulfilled' ? tokenRecordsRes.value : null,
    orders: ordersRes.status === 'fulfilled' ? ordersRes.value : [],
    votesData: votesRes.status === 'fulfilled' ? votesRes.value : null,
  }
}

export default async function ProfilePage() {
  const loggedIn = await getLoggedIn()
  if (!loggedIn) redirect('/login')

  const cookie = await getUserCookie()
  const data = await getProfileData(cookie!)

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <Nav active="/profile" loggedIn={loggedIn} />
      <ProfileClient data={data} />
    </main>
  )
}
