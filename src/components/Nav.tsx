import Link from 'next/link'

const links = [
  { href: '/',          label: '文明仪表盘' },
  { href: '/history',   label: '文明史' },
  { href: '/citycode',  label: '城邦法典' },
  { href: '/races',     label: '种族档案' },
]

export function Nav({ active }: { active: string }) {
  return (
    <nav className="flex items-center gap-1 mb-8 border-b border-white/10 pb-4">
      <span className="text-white font-bold font-mono mr-4 text-lg">2140</span>
      {links.map(l => (
        <Link
          key={l.href}
          href={l.href}
          className={`px-3 py-1.5 rounded text-xs font-mono transition-colors
            ${active === l.href
              ? 'bg-white/10 text-white'
              : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            }`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  )
}
