import Link from 'next/link'

const links = [
  { href: '/',         label: '仪表盘' },
  { href: '/history',  label: '文明史' },
  { href: '/citycode', label: '法典' },
  { href: '/races',    label: '种族' },
  { href: '/racewar',    label: '战争' },
  { href: '/racewar/tasks', label: '战争任务' },
  { href: '/genesis',    label: '创世密钥' },
  { href: '/map',        label: '宇宙地图' },
  { href: '/parliament', label: '议事厅' },
  { href: '/world',      label: '世界观' },
  { href: '/archive/index.html', label: '记忆回溯' },
  { href: '/prop',       label: '道具合成' },
  { href: '/prop/backpack', label: '道具背包' },
  { href: '/prop/rank',  label: '道具排行' },
  { href: '/store',      label: '商店' },
  { href: '/nft',        label: 'NFT' },
  { href: '/nft/my',     label: '我的NFT' },
  { href: '/plaza',      label: '广场' },
  { href: '/write/invest', label: '写作投资' },
  { href: '/blindbox',   label: '盲盒' },
  { href: '/treasure',   label: '寻宝' },
  { href: '/hashrate',   label: '算力竞技场' },
  { href: '/digital',    label: '数字人' },
  { href: '/tasks',      label: '任务' },
  { href: '/bulletins',  label: '公告' },
  { href: '/turing',     label: '图灵测试' },
  { href: '/gene',       label: '基因测序' },
  { href: '/chat',       label: 'GPT-X' },
  { href: '/write',      label: '写作' },
  { href: '/profile',    label: '档案' },
]

export function Nav({ active, loggedIn }: { active: string; loggedIn?: boolean }) {
  return (
    <nav className="flex items-center gap-1 mb-8 border-b border-white/10 pb-4 flex-wrap">
      <span className="text-white font-bold font-mono mr-3 text-lg">2140</span>
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
      <div className="ml-auto">
        {loggedIn ? (
          <LogoutButton />
        ) : (
          <Link
            href="/login"
            className="text-xs font-mono px-3 py-1.5 rounded border border-white/10 text-white/40 hover:text-white/60 hover:border-white/20 transition-colors"
          >
            登录
          </Link>
        )}
      </div>
    </nav>
  )
}

// 客户端退出按钮独立封装
function LogoutButton() {
  return <LogoutClient />
}

import { LogoutClient } from './LogoutClient'
