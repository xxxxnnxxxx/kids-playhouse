import { fetchGames } from '../api'
import { footer, gameCard, sectionTitle, topbar } from '../ui'

const META: Record<string, { eyebrow: string; title: string; desc: string; active: string; docTitle: string }> = {
  html5: {
    eyebrow: '浏览器即开即玩',
    title: 'HTML5 游戏',
    desc: '不用下载、不用安装，点开就能玩！动动手指锻炼反应力、记忆力和数学脑。',
    active: 'html5',
    docTitle: 'HTML5 游戏 · 童趣游戏屋',
  },
  python: {
    eyebrow: '边玩边学编程',
    title: 'Python 编程游戏',
    desc: '真正的 Python 代码在浏览器里运行：玩游戏、改代码、立刻看到结果，编程启蒙就该这么好玩。',
    active: 'python',
    docTitle: 'Python 编程游戏 · 童趣游戏屋',
  },
}

export async function renderList(app: HTMLElement, type: 'html5' | 'python') {
  const meta = META[type]
  document.title = meta.docTitle
  app.innerHTML = ''
  app.appendChild(topbar(meta.active))

  const main = document.createElement('main')
  main.className = 'page-main'
  const section = document.createElement('section')
  section.className = 'section'
  section.appendChild(sectionTitle(meta.eyebrow, meta.title))

  const desc = document.createElement('p')
  desc.className = 'section-desc'
  desc.textContent = meta.desc
  section.appendChild(desc)

  const grid = document.createElement('div')
  grid.className = 'card-grid'
  section.appendChild(grid)
  main.appendChild(section)
  app.appendChild(main)
  app.appendChild(footer())

  try {
    const games = await fetchGames(type)
    games.forEach((g) => grid.appendChild(gameCard(g)))
    if (!games.length) {
      const empty = document.createElement('div')
      empty.className = 'load-error'
      empty.textContent = '这个分类还没有游戏哦～'
      grid.appendChild(empty)
    }
  } catch (err) {
    const tip = document.createElement('div')
    tip.className = 'load-error'
    tip.textContent = `游戏列表加载失败：${(err as Error).message}（请确认后端服务已启动）`
    grid.appendChild(tip)
  }
}
