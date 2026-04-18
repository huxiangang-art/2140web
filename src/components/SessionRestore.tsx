'use client'

import { useEffect } from 'react'

// Restores httpOnly cookie from localStorage backup when Safari PWA clears cookie store
export function SessionRestore() {
  useEffect(() => {
    async function restore() {
      const token = localStorage.getItem('2140_session')
      if (!token) return

      // Check if already logged in by pinging a lightweight endpoint
      const check = await fetch('/api/auth/check').catch(() => null)
      if (check?.ok) return // cookie still valid

      // Cookie gone — restore from localStorage backup
      const res = await fetch('/api/auth/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      }).catch(() => null)

      if (res?.ok) window.location.reload()
      else localStorage.removeItem('2140_session') // token expired, clear it
    }
    restore()
  }, [])
  return null
}
