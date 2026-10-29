import { footer, sectionTitle, topbar } from '../ui'

export function renderParents(app: HTMLElement) {
  document.title = '家长中心 · 童趣游戏屋'
  app.innerHTML = ''
  app.appendChild(topbar('parents'))

  const main = document.createElement('main')
  main.className = 'page-main'
  const section = document.createElement('section')
  section.className = 'section'
  section.appendChild(sectionTitle('放心陪玩', '家长中心'))

  const desc = document.createElement('p')
  desc.className = 'section-desc'
  desc.textContent =
    '我们和您一样关心孩子的健康与成长。这里说明童趣游戏屋的内容原则，并提供一些陪玩小建议。'
  section.appendChild(desc)

  const principles: Array<[string, string, string]> = [
    ['🆓', '免费无广告', '所有游戏完全免费，没有任何广告、内购和诱导付费，孩子不会误点消费。'],
    ['🎯', '适龄内容', '每款游戏标注建议年龄与难度，全部内容围绕反应力、记忆力和逻辑思维设计。'],
    ['🔒', '隐私保护', '本站不收集孩子的个人信息，不需要注册即可畅玩全部游戏。'],
    ['🧭', '编程启蒙', 'Python 游戏区展示真实代码，孩子可以修改代码立刻看到变化，自然理解程序如何运行。'],
  ]
  const grid = document.createElement('div')
  grid.className = 'parents-grid'
  principles.forEach(([icon, title, body]) => {
    const card = document.createElement('div')
    card.className = 'parents-card'
    card.innerHTML = `<div class="parents-card__icon">${icon}</div>
      <div class="parents-card__title">${title}</div>
      <div class="parents-card__body">${body}</div>`
    grid.appendChild(card)
  })
  section.appendChild(grid)

  const tips = document.createElement('div')
  tips.className = 'parents-tips'
  tips.innerHTML = `
    <h3 class="parents-tips__title">⏰ 陪玩小建议</h3>
    <ul>
      <li>建议每次游玩 20~30 分钟，休息时和孩子聊聊刚才玩到了什么。</li>
      <li>Python 游戏区适合家长和孩子一起改代码：改一个数字、换一个颜色，都是很好的编程第一课。</li>
      <li>把"猜数字"变成线下亲子游戏：心里想一个数，互相提问，只用"大了 / 小了"来回答。</li>
    </ul>`
  section.appendChild(tips)

  main.appendChild(section)
  app.appendChild(main)
  app.appendChild(footer())
}
