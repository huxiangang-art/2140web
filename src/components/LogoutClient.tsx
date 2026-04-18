'use client'

import { useRouter } from 'next/navigation'

export function LogoutClient() {
  const router = useRouter()

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' })
    localStorage.removeItem('2140_session')
    window.location.href = '/'
  }

  return (
    <button
      onClick={logout}
      className="text-xs font-mono text-white/30 hover:text-white/50 px-2 transition-colors"
    >
      退出
    </button>
  )
}
