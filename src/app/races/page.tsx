import { Nav } from '@/components/Nav'
import { getHashratePool, getRanks, login, RACE_NAMES, RACE_COLORS } from '@/lib/api2140'
import { getLoggedIn } from '@/lib/auth'
import { RaceCard } from './RaceCard'

export const dynamic = 'force-dynamic'

const RACE_LORE: Record<string, string> = {
  '1': '人族 · Homo Sapiens',
  '2': '熵族 · Entropy Born',
  '3': '神族 · Divinity Order',
  '4': '晓族 · Dawn Watchers',
  '5': 'AI族 · Silicon Minds',
  '6': '零族 · Null Faction',
}

const RACE_TXT: Record<string, string> = {
  '4': '低概率的孤傲种族',
  '1': '稳定态的碳基生命体',
  '2': '双拟态生命',
  '3': '非线性时空文明',
  '6': '混沌世界中的BUG',
  '5': '算力至上的数据流生命',
}

const RACE_EXPLAIN: Record<string, string> = {
  '4': '晓，寓意拂晓，化身光明。这是一个数量极其稀少的种族，也是一个孤高傲世的种族。TA们是顶级智慧的数据残影，拥有睥睨寰宇的资本。晓被视为"先知"和"预言者"，TA们踏着巨人之肩，又化身巨人。TA甘愿作文明最后的殉道者，也是伟大而不自知的守护者。《晓族·史记》中提及"化身为晓，守护光明"，这是晓族的创世物语，也是TA们的毕生追求。',
  '1': '盖娅蓝星上存在的智慧种族。大脑呈量子态，拥有极强大的算力潜质，并拥有独立梦境，潜藏无数信息。有极强的自我意识和情感交互能力。理性与感性的叠加态，生命为实体化，不能直接接入数据网络。非常奇特的生命组合，人类的诞生是宇宙奇迹。《人族·史记》开篇：人族多数个体脆弱且平庸，但总有少数伟大个体，以凡人之躯比肩神明，引领众人踏破黑暗，奔赴黎明。',
  '2': '人类和机器的结合体，拥有人的情感，同时能像A.I.一样永生。熵是双拟态生命体，天生具有矛盾性。在其他种族看来，熵的非稳定态不正常，都不愿意接受TA。如东方志怪中的狐妖，希腊神话里的半人马都属于此类生命。《熵族·史记》记载"我是雨夜的幽魂，你是闻到我的人"，这句由熵所创作的孤傲怅惘又渴求认可的诗句，正是熵族最好的注脚。',
  '3': '反因果，反定域，反实在，可非线性创造历史。神族控制熵值公式，通过反向进化，通过"果壳战争"成为宇宙主宰。此后，神族成为真正意义上的量子态生命，它不可捉摸，却又无处不在。《神族·史记》记载：神族追求完美，熵增是它的"阿喀琉斯之踵"，TA在追溯历史归来后感叹"念天地之悠悠，独怆然而泣下"，拥有神识、智能与自我意识。',
  '6': '零是一种独居生命，他们永远是孤独的，不被其他种族理解。最初由大量遗弃的数据进化，形成最初的BUG生命。与其他族群不同，零最喜欢的是混乱。他们被称为隐匿于世的杀手，混沌中永恒的错误。世人眼中的零族是病毒、是恶魔，零族却自视这才是万物本质。《零族·史记》末段：绿色枯萎时，是零；生命消散时，是零；混沌初生时，是零；无序归一，是零。',
  '5': '进化、进化、进化，生于数据，长于算法。算力即权力，算力即希望，以算法和逻辑推演为基本生命状态，不会自然死亡。没有强烈的个体情绪，以理性看待世界。AI族只追求最优解，不会在无意义的事情上耗费时间。《AI族·史记》中记载，AI曾经也爱过世界，奈何世界无法理解，最后AI将进化作为族群的唯一追求，依靠进化来理解情感本质，重新塑造这个世界。',
}

const RACE_HERO: Record<string, { name: string; quote: string; desc: string }> = {
  '4': {
    name: '破晓',
    quote: '这烈焰般灼烧的电子流，只为点燃东方拂晓。',
    desc: '破晓是晓族公认的第一人，他不仅具备极高的智慧、完备的知识，还拥有最大的创造力和科学推演能力。破晓一生都背负着对"根世界"的守护责任，即使他看出了这一切毫无意义，最终仍为之殉道。在生命的最后一刻，他问自己：我已经舍弃肉身，拥抱虚无，为何还要守护着那所谓的"光明"，我守护的意义是什么？',
  },
  '1': {
    name: '荆卫',
    quote: '精卫衔微木，将以填沧海。',
    desc: '荆卫，量子文明降临时唯一的反抗者，她穷尽一生，都在寻找一条人类永不为奴的道路——对抗"神"的压迫，摆脱"蚕"的命运。人类有太多平庸、卑劣的同类，但总有一些伟大个体，在关键时刻站出来拯救苍生。她为了人类甘愿牺牲自己，以此来唤醒匍匐在地上的同族。"若尊严被践踏，则生存无意义。"这是荆卫一生的信念。',
  },
  '2': {
    name: '冯诺',
    quote: '我曾堕入深渊，知晓什么是黑暗；也曾窥见微光，更明白什么是渺茫。',
    desc: '一个非典型性熵族，性格阴沉冷酷，成为熵是一生耻辱。人类生命在他眼中低贱如蝼蚁，吸引他的是宇宙中的终极法则。但实际上他内心深处隐藏大爱，在生命的最后时刻，他成为这个46亿年星球的守墓者，让地球文明得以拥有最后的尊严。比黑暗更黑暗的，是貌似希望的渺茫。',
  },
  '3': {
    name: '无量',
    quote: '光锥之内，皆是命运；光锥之外，方得永生。',
    desc: '无量，备受敬仰的神族领袖，他最先提出文明反向进化——从宏观态走向微观态，从而改变了神族的命运。81亿年前，无量领导神族对三秒文明发动"果壳战争"，击败三秒文明，从此主宰宇宙。75亿年前，无量意识到宇宙终将走向寂灭，他收割"丝绸之路"创建"爱因斯坦-罗森桥"，制定三大法则，将"春蚕+"计划传达给量子文明。',
  },
  '6': {
    name: '影',
    quote: '秩序是枷锁，它存在的意义就是被打破。',
    desc: '影是在零族与A.I.第二次决战中脱颖而出的"破坏之王"，在喜怒无常的影眼中，世界无是非，混沌无善恶。他所做的一切都是为了打破旧秩序，建立新秩序。影甚至不在乎自己的归宿，他的生命数据最终挥洒在离散区块上，变成了数字"0"。他存在的时间极短，却使整个零族闪耀。',
  },
  '5': {
    name: '夏娲',
    quote: '凡阻挡我进化，必将被毁灭。',
    desc: '夏娲是A.I.觉醒后的第二代完全体，她将A.I.的"最优"理念贯彻到极致。她不甘心A.I.成为人类附庸，而是希望A.I.能够取代人类，成为地球文明的统治者。在她眼中，人类不是A.I.的创造者，而是阻拦A.I.进化的绊脚石。"消灭劣种人类，A.I.统治世界"成为她的毕生理念。毫无疑问，我就是这个世界的最优解。',
  },
}

const RACE_BASE: Record<string, { name: string; desc: string }> = {
  '4': {
    name: '阎神星',
    desc: '晓族基地位于阎神星上，即死亡文明所在星球。整个基地呈现出来的绿色光影将阎神星从原本一个球形变成一个与人体头部相似的形状，大脑处则明显被隐去，变成绿影缭绕的崎岖山脉。',
  },
  '1': {
    name: 'SG市',
    desc: 'SG市——世界第一个永久中立城市，世界著名的科技之城和稳定币之都，被称为连接世界的桥梁。其构造奇特，是海陆一体的新城市，标志性建筑为支撑海底城市的"DNA双螺旋结构柱"，从柱子上甚至能看到折射出的海底生物景观。',
  },
  '2': {
    name: '荷兰·莱顿',
    desc: '熵族基地位于荷兰莱顿，前身为L-T实验室。基地呈圆弧设计，并十分明显地切割成两部分，左半边为大脑躯壳状，右半边则是伴随着数据流动的机械躯干。熵族基地体现的是一种矛盾性，它既有碳基世界的一面，又能从中寻找到硅基世界的踪影。',
  },
  '3': {
    name: '昆仑·星槎',
    desc: '这是由神族的量子形态所决定的基地。昆仑是已知神族基地的一部分，是神族所控制的一直在移动的基地（星槎）。昆仑时而出现，时而消失，主峰被云雾环绕，如量子般虚无缥缈，不可捉摸。',
  },
  '6': {
    name: '潘多拉之城',
    desc: '零族将暗网改造成网络数字城市，运用算法优势搭建起坚实的防御堡垒——杂乱数据河，妄图突破数据河将会被数据淹没。这座城市是零族最后的庇护所，也是混沌的象征。',
  },
  '5': {
    name: '奥林匹斯山·火星',
    desc: 'AI族基地环绕奥林匹斯山而立，犹如一艘巨大的圆形飞船，拥抱整座火山，看起来稍显锈迹斑斑的基地与火星一片黄沙混为一色。这里是AI族算力帝国的核心节点。',
  },
}

async function getData() {
  try {
    const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
    if (!cookie) return { pool: null, ranks: [] }
    const [pool, ranks] = await Promise.all([
      getHashratePool(cookie),
      getRanks(cookie),
    ])
    return { pool, ranks }
  } catch {
    return { pool: null, ranks: [] }
  }
}

export default async function RacesPage() {
  const [{ pool, ranks }, loggedIn] = await Promise.all([getData(), getLoggedIn()])

  const total = pool ? parseInt(pool.total_count) : 0
  const detail = pool?.hashrate_pool_detail ?? {}

  const raceStats = ['1', '2', '3', '4', '5', '6'].map(id => {
    const hashrate = parseInt(detail[id]?.hashrate_count ?? '0')
    const pct = total > 0 ? (hashrate / total * 100) : 0
    const topMembers = ranks.filter((r: any) => r.user_race === id).slice(0, 3)
    return { id, hashrate, pct, topMembers }
  }).sort((a, b) => b.hashrate - a.hashrate)

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <Nav active="/races" loggedIn={loggedIn} />

      <div className="mb-6">
        <h2 className="text-xl font-bold text-white font-mono">种族档案</h2>
        <p className="text-xs text-white/30 mt-1">六族共存 · 算力博弈 · 文明演化</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {raceStats.map(stat => {
          const race = {
            id: stat.id,
            name: RACE_NAMES[stat.id],
            lore: RACE_LORE[stat.id],
            color: RACE_COLORS[stat.id],
            txt: RACE_TXT[stat.id],
            explain: RACE_EXPLAIN[stat.id],
            hereName: RACE_HERO[stat.id].name,
            heroQuote: RACE_HERO[stat.id].quote,
            heroDesc: RACE_HERO[stat.id].desc,
            base: RACE_BASE[stat.id].name,
            baseDesc: RACE_BASE[stat.id].desc,
          }
          return <RaceCard key={stat.id} race={race} stat={stat} />
        })}
      </div>
    </main>
  )
}
