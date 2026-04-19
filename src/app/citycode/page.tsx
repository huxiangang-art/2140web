import { Nav } from '@/components/Nav'
import { getAllCityCodeBills, login } from '@/lib/api2140'
import { getLoggedIn } from '@/lib/auth'
import { CityCodeClient } from './CityCodeClient'

export const dynamic = 'force-dynamic'

const CATEGORY_NAMES: Record<number, string> = {
  1: '城邦简介', 2: '城邦种族', 3: '城邦律法', 4: '社会结构',
  5: '城邦货币', 6: '城邦历史', 7: '城邦地理', 8: '城邦服饰',
  9: '城邦生物', 10: '城邦建筑', 11: '城邦科技', 12: '城邦语言',
  13: '城邦军备', 14: '城邦哲学', 15: '城邦能源', 16: '城邦政治',
  17: '星际文明', 18: '城邦娱乐', 19: '城邦教育', 20: '城邦艺术',
}

async function getData() {
  try {
    const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
    if (!cookie) return []
    return getAllCityCodeBills(cookie)
  } catch {
    return []
  }
}

export default async function CitycodePage() {
  const [bills, loggedIn] = await Promise.all([getData(), getLoggedIn()])

  // Group by category
  const byCategory: Record<number, any[]> = {}
  for (const bill of bills) {
    const cat = Number(bill.category)
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat].push(bill)
  }

  const categories = Object.keys(byCategory)
    .map(Number)
    .sort((a, b) => a - b)
    .map(id => ({ id, name: CATEGORY_NAMES[id] ?? `分类${id}`, bills: byCategory[id] }))

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <Nav active="/citycode" loggedIn={loggedIn} />

      <div className="mb-6">
        <h2 className="text-xl font-bold text-white font-mono">城邦法典</h2>
        <p className="text-xs text-white/30 mt-1">居民立法 · AI 治理 · 六族博弈 · {bills.length} 条正式议案</p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-20 text-white/30 font-mono text-sm">暂无法典条文</div>
      ) : (
        <CityCodeClient categories={categories} />
      )}
    </main>
  )
}
