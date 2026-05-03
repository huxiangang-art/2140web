'use client'

import { useLayoutEffect, useRef } from 'react'

export function CenteredRacewarScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const center = () => {
      el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) / 2)
    }

    const frames = [
      window.requestAnimationFrame(center),
      window.requestAnimationFrame(() => window.requestAnimationFrame(center)),
    ]
    const timeout = window.setTimeout(center, 250)
    const interval = window.setInterval(center, 120)
    const intervalStop = window.setTimeout(() => window.clearInterval(interval), 1200)
    const observer = new ResizeObserver(center)
    observer.observe(el)
    if (el.firstElementChild) observer.observe(el.firstElementChild)
    el.querySelectorAll('img').forEach(img => img.addEventListener('load', center, { once: true }))

    return () => {
      frames.forEach(frame => window.cancelAnimationFrame(frame))
      window.clearTimeout(timeout)
      window.clearInterval(interval)
      window.clearTimeout(intervalStop)
      observer.disconnect()
      el.querySelectorAll('img').forEach(img => img.removeEventListener('load', center))
    }
  }, [])

  return (
    <div ref={ref} className="rw-map-scroll absolute inset-0 z-0 overflow-x-auto overflow-y-hidden">
      {children}
    </div>
  )
}
