import Link from 'next/link'

export const dynamic = 'force-dynamic'

const remote = 'https://www.2140city.cn/resource/foreign/mobile/image'
const chapters = [
  ['1', '《图灵梦境1: CSi圣杯》', '人类首次夺得CSi冠军，却发现这是一个存在多年的阴谋。冠军销声匿迹，接着发生两起针对图灵梦境玩家的凶杀案。调查结果出人意料，杀人竟是为了救人……'],
  ['2', '《图灵梦境2: 奥丁计划》', '超级智能体、深空移民与人类文明秩序进入同一个倒计时，旧世界的边界被再次撕开。'],
  ['3', '《图灵梦境3: 熵减战争》', '当文明把生存交给算力，战争不再只发生在土地上，而发生在每一个可被计算的未来。'],
  ['4', '《图灵梦境4: 时间规划局》', '时间成为资产，记忆成为证据，所有人都必须重新定义自己存在过的方式。'],
  ['5', '《图灵梦境5: 基地世界》', '基地、碎片、角色与种族被推入同一个开放世界，2140 的元宇宙开始具备可行动的轮廓。'],
  ['6', '《图灵梦境6: 六族协议》', '六大种族在文明分叉中形成协议，也埋下下一场共识战争的导火索。'],
  ['7', '《图灵梦境7: 未来契约》', '契约不只约束人，也约束算法、土地、信仰与文明的继承权。'],
  ['8', '《图灵梦境8: 开源神谕》', '当未来世界被开源，每个居民都可能成为新文明的一段源码。'],
]

export default function PropagandaPage() {
  return (
    <main className="propaganda-shell">
      <section className="propaganda-contain">
        <header className="propaganda-fixed-top">
          <Link href="/" className="propaganda-return" aria-label="返回首页" />
          <div className="propaganda-brand">2140·元宇宙</div>
          <div className="propaganda-menu-icon" />
        </header>

        <section className="propaganda-top">
          <div className="propaganda-top-imgs">
            {Array.from({ length: 8 }, (_, i) => (
              <img key={i} src={`${remote}/propaganda_top${i + 1}.jpg`} alt="" />
            ))}
          </div>
          <div className="propaganda-top-overlay">
            <div className="propaganda-swipe-button is-left" />
            <div className="propaganda-points">
              {Array.from({ length: 8 }, (_, i) => <span key={i} className={i === 0 ? 'is-current' : ''} />)}
            </div>
            <div className="propaganda-swipe-button is-right" />
          </div>
        </section>

        <section className="propaganda-middle">
          <div className="propaganda-middle-buttons">
            <Link href="/propaganda/civilization" className="propaganda-middle-button button1">九级文明</Link>
            <Link href="/propaganda/rules" className="propaganda-middle-button button2">世界规则</Link>
            <Link href="/propaganda/history" className="propaganda-middle-button button3">历史进程</Link>
            <Link href="/propaganda/base-world" className="propaganda-middle-button button4">基地世界</Link>
            <Link href="/propaganda/races" className="propaganda-middle-button button5">六大种族</Link>
            <Link href="/propaganda/roles" className="propaganda-middle-button button6">主角设定</Link>
          </div>

          <div className="propaganda-middle-swipe">
            <div className="propaganda-swipe-button is-left" />
            <div className="propaganda-poster-stack">
              <img className="poster1" src={`${remote}/propaganda_middle_img1.jpg`} alt="" />
              <img className="poster2" src={`${remote}/propaganda_middle_img2.jpg`} alt="" />
              <img className="poster3" src={`${remote}/propaganda_middle_img3.jpg`} alt="" />
            </div>
            <div className="propaganda-swipe-button is-right" />
          </div>

          <div className="propaganda-chapters">
            <div className="propaganda-switches">
              {chapters.map(([seq]) => <span key={seq} className={seq === '1' ? 'is-current' : ''}>{seq}</span>)}
            </div>
            <h1>{chapters[0][1]}</h1>
            <p>{chapters[0][2]}</p>
          </div>

          <div className="propaganda-investment-types">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="propaganda-investment-text">
            用旋律加速失重 营造太空氛围<br />
            浩渺宇宙的深处，是寂静还是喧嚣？
          </div>
        </section>

        <nav className="propaganda-menu-box">
          {['首页', '世界观', 'IP基石', '开源计划', '时间规划局', '未来契约', '社区治理'].map((item) => (
            <Link key={item} href="/" className="propaganda-menu-row">{item}</Link>
          ))}
        </nav>
      </section>
    </main>
  )
}
