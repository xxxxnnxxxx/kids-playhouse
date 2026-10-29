import { fetchGames } from '../api'
import { ctaBanner, footer, gameCard, hero, sectionTitle, statsRow, topbar } from '../ui'

export async function renderHome(app: HTMLElement) {
  document.title = '童趣游戏屋 · 儿童游戏网站'
  app.innerHTML = ''
  app.appendChild(topbar('home'))

  const main = document.createElement('main')
  main.className = 'page-main'
  app.appendChild(main)

  main.appendChild(hero())

  const html5Section = document.createElement('section')
  html5Section.className = 'section'
  html5Section.appendChild(sectionTitle('浏览器即开即玩', 'HTML5 精选游戏'))
  const html5Grid = document.createElement('div')
  html5Grid.className = 'card-grid'
  html5Section.appendChild(html5Grid)
  main.appendChild(html5Section)

  const pythonSection = document.createElement('section')
  pythonSection.className = 'section'
  pythonSection.appendChild(sectionTitle('边玩边学编程', 'Python 编程小游戏'))
  const pythonGrid = document.createElement('div')
  pythonGrid.className = 'card-grid'
  pythonSection.appendChild(pythonGrid)
  main.appendChild(pythonSection)

  main.appendChild(statsRow())
  main.appendChild(ctaBanner())
  app.appendChild(footer())

  try {
    const games = await fetchGames()
    games.filter((g) => g.type === 'html5').forEach((g) => html5Grid.appendChild(gameCard(g)))
    games.filter((g) => g.type === 'python').forEach((g) => pythonGrid.appendChild(gameCard(g)))
  } catch (err) {
    const tip = document.createElement('div')
    tip.className = 'load-error'
    tip.textContent = `游戏列表加载失败：${(err as Error).message}（请确认后端服务已启动）`
    html5Section.appendChild(tip)
  }
}
