'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      window.location.href = '/'
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-white/5 border-white/10">
        <CardHeader className="pb-2">
          <div className="text-center mb-2">
            <span className="text-2xl font-bold font-mono text-white">2140</span>
          </div>
          <CardTitle className="text-white text-center text-sm font-mono font-normal text-white/50">
            以居民身份进入城邦
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-white/40 font-mono block mb-1">手机号</label>
              <input
                type="tel"
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-white/30"
                placeholder="18600000000"
                required
              />
            </div>
            <div>
              <label className="text-xs text-white/40 font-mono block mb-1">密码</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-white/30"
                placeholder="8-16位密码"
                required
              />
            </div>
            {error && (
              <p className="text-xs text-red-400 font-mono">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded px-4 py-2 font-mono text-sm transition-colors disabled:opacity-50"
            >
              {loading ? '验证中...' : '进入城邦'}
            </button>
          </form>
          <p className="text-xs text-white/20 text-center mt-4 font-mono">
            使用 2140city.cn 账号登录
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
