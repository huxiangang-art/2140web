import { Nav } from '@/components/Nav'
import { getLoggedIn } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PlazaPostClient } from './PlazaPostClient'

export const dynamic = 'force-dynamic'

export default async function PlazaPostPage() {
  const loggedIn = await getLoggedIn()
  if (!loggedIn) redirect('/login')

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-3xl mx-auto">
      <Nav active="/plaza" loggedIn={loggedIn} />
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white font-mono">发帖</h2>
        <p className="text-xs text-white/30 mt-1">在种族广场发表你的观点</p>
      </div>
      <PlazaPostClient />
    </main>
  )
}
