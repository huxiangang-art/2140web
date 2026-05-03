import { chromium } from 'playwright'

const base = process.env.SMOKE_BASE_URL ?? 'http://localhost:3001'
const routes = [
  '/metaverse',
  '/metaverse/worlds',
  '/metaverse/worlds/9',
  '/metaverse/worlds/branch/10001',
  '/racewar/debris/56',
  '/metaverse/war/reports',
  '/metaverse/quests',
  '/metaverse/agent/war',
  '/metaverse/agent/branch',
  '/metaverse/archive',
  '/metaverse/audit',
  '/prop/1',
]

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const failures = []

for (const route of routes) {
  const res = await page.goto(`${base}${route}`, { waitUntil: 'networkidle', timeout: 30000 })
  const status = res?.status() ?? 0
  const title = await page.locator('h1,h2').first().textContent().catch(() => '')
  console.log(`${route} ${status} ${String(title).trim()}`)
  if (status >= 400) failures.push(`${route} returned ${status}`)
}

await page.goto(`${base}/metaverse`, { waitUntil: 'networkidle' })
await page.screenshot({ path: '/tmp/metaverse-smoke.png', fullPage: false })
await browser.close()

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
