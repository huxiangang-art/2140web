import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

const remote = 'https://www.2140city.cn/resource/foreign/mobile/image'

const sections: Record<string, {
  title: string
  subtitle: string
  image: string
  items: Array<[string, string, string]>
}> = {
  civilization: {
    title: '九级文明',
    subtitle: '从地球文明到根世界，2140 的文明等级设定',
    image: `${remote}/propaganda_middle_img1.jpg`,
    items: [
      ['I 级', '行星能源', '文明开始以星球作为基础资源单位。'],
      ['V 级', '多维秩序', '主线/支线地图开始形成多文明并行结构。'],
      ['IX 级', '根世界', '文明、角色、规则、资产和记忆进入统一世界观。'],
    ],
  },
  rules: {
    title: '世界规则',
    subtitle: '文明行动、共识治理、城邦法典的规则入口',
    image: `${remote}/propaganda_middle_img2.jpg`,
    items: [
      ['城邦法典', '提案与修正案', '对应 APK 的 city_code_index。'],
      ['治理身份', '职位/经验/仲裁', '对应议事厅与居民贡献体系。'],
      ['战争约束', '战斗、灾变、锁定', '对应元宇宙地图与基地世界状态。'],
    ],
  },
  history: {
    title: '历史进程',
    subtitle: '从图灵梦境到 2140 元宇宙的章节线索',
    image: `${remote}/propaganda_middle_img3.jpg`,
    items: [
      ['图灵梦境', 'CSi 圣杯', '宣传中心默认章节。'],
      ['时间规划局', '时间资产化', '对应历史与世界线内容。'],
      ['开源神谕', '居民共建', '对应幻次元创作系统。'],
    ],
  },
  'base-world': {
    title: '基地世界',
    subtitle: '碎片、道具、居民与战斗状态组成的基地网络',
    image: '/apk/race_debris_img1.jpg',
    items: [
      ['碎片', '地图中的可进入节点', '对应 racewar_debris。'],
      ['道具', '获取、背包、使用记录', '对应 prop 系统。'],
      ['战况', '灾变/锁定/战斗中', '对应元宇宙战争入口。'],
    ],
  },
  races: {
    title: '六大种族',
    subtitle: '人、熵、神、晓、AI、零的文明分歧',
    image: '/apk/race_role_img1.jpg',
    items: [
      ['人族', '现实主义与组织建设', '首页等级体系中的基础种族。'],
      ['熵族', '无序、变化与算力', '当前账号常见种族状态。'],
      ['AI/零', '数字生命与低熵形态', '数字人和元宇宙深层设定。'],
    ],
  },
  roles: {
    title: '主角设定',
    subtitle: '2140 角色、身份、等级与个人空间',
    image: '/apk/user_space_share_bg.jpg',
    items: [
      ['个人空间', '罗盘驾驶舱', '对应 user_space。'],
      ['数字人', '进化与创世钥匙', '对应 digital_person。'],
      ['创作者', '章节、支线、投资', '对应 write_index。'],
    ],
  },
}

export default async function PropagandaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const section = sections[slug]
  if (!section) notFound()

  return (
    <main className="propaganda-detail-shell">
      <section className="propaganda-detail-contain">
        <header className="propaganda-fixed-top">
          <Link href="/propaganda" className="propaganda-return" aria-label="返回宣传中心" />
          <div className="propaganda-brand">{section.title}</div>
          <Link href="/" className="propaganda-menu-icon" aria-label="首页" />
        </header>
        <section className="propaganda-detail-hero">
          <img src={section.image} alt="" />
          <div>
            <h1>{section.title}</h1>
            <p>{section.subtitle}</p>
          </div>
        </section>
        <section className="propaganda-detail-list">
          {section.items.map(([title, subtitle, desc]) => (
            <article key={title}>
              <span>{title}</span>
              <strong>{subtitle}</strong>
              <p>{desc}</p>
            </article>
          ))}
        </section>
      </section>
    </main>
  )
}
