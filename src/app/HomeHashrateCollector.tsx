'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, useTransition } from 'react'
import { num } from '@/lib/metaverse'

export type HomeHashrateBall = {
  seq: string
  hashrate: string | number
  b_level: string | number
  point: {
    radius: number
    top: number
    left: number
  }
}

type ToastState = {
  text: string
  tone: 'success' | 'error'
}

const collectedEvent = 'home-hashrate-collected'

export function HomeHashrateAmount({ initialHashrate }: { initialHashrate: string | number }) {
  const [hashrate, setHashrate] = useState(() => Number(initialHashrate) || 0)
  const totalLabel = useMemo(() => num(hashrate), [hashrate])

  useEffect(() => {
    function onCollected(event: Event) {
      const amount = Number((event as CustomEvent<{ amount: number }>).detail?.amount) || 0
      setHashrate(current => current + amount)
    }

    window.addEventListener(collectedEvent, onCollected)
    return () => window.removeEventListener(collectedEvent, onCollected)
  }, [])

  return (
    <Link href="/hashrate" className="app-home-user-hashrate">
      <span className="app-home-amount">{totalLabel}</span>
      <span className="app-home-data-icon" />
    </Link>
  )
}

export function HomeHashrateBalls({
  initialHashrate,
  balls,
  loggedIn,
}: {
  initialHashrate?: string | number
  balls: HomeHashrateBall[]
  loggedIn: boolean
}) {
  const [visibleBalls, setVisibleBalls] = useState(balls)
  const [pendingSeq, setPendingSeq] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [isPending, startTransition] = useTransition()
  const hasHashrate = Number(initialHashrate) > 0

  function showToast(next: ToastState) {
    setToast(next)
    window.setTimeout(() => {
      setToast(current => current?.text === next.text ? null : current)
    }, 1800)
  }

  function collect(seq: string) {
    if (pendingSeq || isPending) return
    if (!loggedIn) {
      showToast({ text: '请先登录', tone: 'error' })
      return
    }

    setPendingSeq(seq)
    startTransition(async () => {
      try {
        const res = await fetch('/api/hashrate-ball', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seq }),
        })
        const data = await res.json()

        if (!res.ok) {
          showToast({ text: data.error ?? '领取失败', tone: 'error' })
          return
        }

        const amount = Number(data.amount) || 0
        setVisibleBalls(current => current.filter(ball => ball.seq !== seq))
        window.dispatchEvent(new CustomEvent(collectedEvent, { detail: { amount } }))
        showToast({ text: `您获得了${num(amount)}算力`, tone: 'success' })
      } catch {
        showToast({ text: '网络连接异常', tone: 'error' })
      } finally {
        setPendingSeq(null)
      }
    })
  }

  return (
    <>
      <div className="app-home-ball-live" aria-live="polite">
        {visibleBalls.map((ball, index) => {
          const level = Math.max(0, Math.min(5, Number(ball.b_level ?? 0)))
          const disabled = pendingSeq === ball.seq || isPending
          return (
            <button
              key={ball.seq}
              type="button"
              className={`app-home-ball${disabled ? ' app-home-ball-pending' : ''}`}
              style={{
                top: `calc(48% + var(--hvw) * ${ball.point.top - ball.point.radius})`,
                left: `calc(var(--hvw) * ${20 + ball.point.left - ball.point.radius})`,
              }}
              disabled={disabled}
              aria-label={hasHashrate ? `领取 ${num(ball.hashrate)} 算力` : '领取算力'}
              onClick={() => collect(ball.seq)}
            >
              <span className={`app-home-ball-motion app-home-ball-animation-${index % 4}`}>
                <span
                  className={`app-home-ball-img app-home-ball-img-${level}`}
                  style={{
                    width: `calc(var(--hvw) * ${ball.point.radius * 2})`,
                    height: `calc(var(--hvw) * ${ball.point.radius * 2})`,
                  }}
                />
                <span className="app-home-ball-num">{num(ball.hashrate)}</span>
              </span>
            </button>
          )
        })}
      </div>

      {toast && (
        <div className={`app-home-toast app-home-toast-${toast.tone}`} role="status">
          {toast.text}
        </div>
      )}
    </>
  )
}
