import Link from 'next/link'

const groups = [
  {
    label: '首页',
    links: [
      { href: '/', label: '仪表盘' },
      { href: '/bulletins', label: '公告' },
      { href: '/tasks', label: '任务' },
    ],
  },
  {
    label: '文明',
    links: [
      { href: '/history', label: '文明史' },
      { href: '/world', label: '世界观' },
      { href: '/map', label: '宇宙地图' },
      { href: '/archive/index.html', label: '记忆回溯' },
    ],
  },
  {
    label: '种族战争',
    links: [
      { href: '/races', label: '种族' },
      { href: '/racewar', label: '战争' },
      { href: '/racewar/tasks', label: '战争任务' },
      { href: '/genesis', label: '创世密钥' },
    ],
  },
  {
    label: '经济',
    links: [
      { href: '/hashrate', label: '算力竞技场' },
      { href: '/pay', label: '充值' },
      { href: '/store', label: '商店' },
      { href: '/prop', label: '道具合成' },
      { href: '/prop/backpack', label: '道具背包' },
      { href: '/prop/rank', label: '道具排行' },
      { href: '/nft', label: 'NFT' },
      { href: '/nft/my', label: '我的NFT' },
      { href: '/blindbox', label: '盲盒' },
      { href: '/treasure', label: '寻宝' },
    ],
  },
  {
    label: '创作',
    links: [
      { href: '/write', label: '写作' },
      { href: '/write/invest', label: '写作投资' },
      { href: '/turing', label: '图灵测试' },
      { href: '/gene', label: '基因测序' },
    ],
  },
  {
    label: '社区',
    links: [
      { href: '/plaza', label: '广场' },
      { href: '/parliament', label: '议事厅' },
      { href: '/citycode', label: '法典' },
    ],
  },
  {
    label: '个人',
    links: [
      { href: '/profile', label: '档案' },
      { href: '/digital', label: '数字人' },
      { href: '/chat', label: 'GPT-X' },
    ],
  },
]

export function Nav({ active, loggedIn }: { active: string; loggedIn?: boolean }) {
  return (
    <nav className="mb-8 border-b border-white/10 pb-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-white font-bold font-mono text-lg">2140</span>
        <div>
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
      </div>
      <div className="space-y-2">
        {groups.map(group => (
          <div key={group.label} className="flex items-start gap-2 flex-wrap">
            <span className="text-xs font-mono text-white/20 pt-1 w-14 shrink-0 text-right">{group.label}</span>
            <div className="flex flex-wrap gap-1 flex-1">
              {group.links.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors
                    ${active === l.href
                      ? 'bg-white/10 text-white'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                    }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  )
}

function LogoutButton() {
  return <LogoutClient />
}

import { LogoutClient } from './LogoutClient'
