import { getLoggedIn } from '@/lib/auth'
import { Nav } from '@/components/Nav'
import { ChatClient } from '@/components/ChatClient'

export default async function ChatPage() {
  const loggedIn = await getLoggedIn()
  return (
    <main className="min-h-screen flex flex-col p-4 md:p-8 max-w-3xl mx-auto">
      <Nav active="/chat" loggedIn={loggedIn} />
      <ChatClient />
    </main>
  )
}
