import Link from 'next/link'
import type { ReactNode } from 'react'

type ApkAction = {
  href: string
  label: string
  desc?: string
  meta?: string
  disabled?: boolean
}

type ApkStat = {
  label: string
  value: ReactNode
}

export function ApkReplicaPage({
  title,
  subtitle,
  active = '',
  hero,
  heroClass = '',
  stats = [],
  actions = [],
  children,
}: {
  title: string
  subtitle?: string
  active?: 'home' | 'task' | 'profile' | ''
  hero?: string
  heroClass?: string
  stats?: ApkStat[]
  actions?: ApkAction[]
  children?: ReactNode
}) {
  return (
    <main className="apk-page-shell">
      <section className="apk-page-contain">
        <header className="apk-page-top">
          <Link href="/" className="apk-page-return" aria-label="返回首页" />
          <div className="apk-page-title">{title}</div>
          <Link href="/" className="apk-page-home-link">首页</Link>
        </header>

        {hero && (
          <section className={`apk-page-hero ${heroClass}`} style={{ backgroundImage: `url("${hero}")` }}>
            <div className="apk-page-hero-shade" />
            <div className="apk-page-hero-copy">
              <div className="apk-page-hero-title">{title}</div>
              {subtitle && <div className="apk-page-hero-subtitle">{subtitle}</div>}
            </div>
          </section>
        )}

        {stats.length > 0 && (
          <section className="apk-page-stats">
            {stats.map((stat) => (
              <div className="apk-page-stat" key={stat.label}>
                <div className="apk-page-stat-value">{stat.value}</div>
                <div className="apk-page-stat-label">{stat.label}</div>
              </div>
            ))}
          </section>
        )}

        {actions.length > 0 && (
          <section className="apk-page-actions">
            {actions.map((action) => (
              <Link
                key={`${action.href}-${action.label}`}
                href={action.disabled ? '#' : action.href}
                className={`apk-page-action ${action.disabled ? 'is-disabled' : ''}`}
              >
                <div>
                  <div className="apk-page-action-label">{action.label}</div>
                  {action.desc && <div className="apk-page-action-desc">{action.desc}</div>}
                </div>
                {action.meta && <div className="apk-page-action-meta">{action.meta}</div>}
              </Link>
            ))}
          </section>
        )}

        {children}

        {(active === 'home' || active === 'task' || active === 'profile') && (
          <nav className="apk-page-bottom-nav">
            <Link href="/" className={active === 'home' ? 'is-active' : ''}>首页</Link>
            <Link href="/tasks" className={active === 'task' ? 'is-active' : ''}>算力</Link>
            <Link href="/profile" className={active === 'profile' ? 'is-active' : ''}>基地</Link>
          </nav>
        )}
      </section>
    </main>
  )
}

export function ApkSection({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="apk-page-section">
      <div className="apk-page-section-title">
        <span>{title}</span>
        {action}
      </div>
      {children}
    </section>
  )
}

export function ApkList({ children }: { children: ReactNode }) {
  return <div className="apk-page-list">{children}</div>
}

export function ApkListItem({
  title,
  desc,
  meta,
  href,
}: {
  title: ReactNode
  desc?: ReactNode
  meta?: ReactNode
  href?: string
}) {
  const body = (
    <>
      <div className="apk-page-list-main">
        <div className="apk-page-list-title">{title}</div>
        {desc && <div className="apk-page-list-desc">{desc}</div>}
      </div>
      {meta && <div className="apk-page-list-meta">{meta}</div>}
    </>
  )

  return href ? <Link className="apk-page-list-item" href={href}>{body}</Link> : <div className="apk-page-list-item">{body}</div>
}
