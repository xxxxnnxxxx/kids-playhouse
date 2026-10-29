import { fetchGame } from '../api'
import { mountPythonPlay } from '../pyodideRunner'

export async function renderPlay(app: HTMLElement, id: string) {
  app.innerHTML = ''

  const game = await fetchGame(id).catch(() => null)
  if (!game) {
    app.innerHTML = `
      <div class="notice">
        <div class="notice__emoji">🔍</div>
        <div class="notice__title">没有找到这款游戏</div>
        <a data-nav href="/" class="btn">回首页看看</a>
      </div>`
    document.title = '未找到游戏 · 童趣游戏屋'
    return
  }
  document.title = `${game.title} · 童趣游戏屋`

  const bar = document.createElement('div')
  bar.className = 'play-bar'
  bar.innerHTML = `
    <div class="play-bar__inner">
      <a data-nav href="/${game.type}" class="play-bar__back">← 返回</a>
      <div class="play-bar__title">
        <span class="play-bar__badge">${game.badge}</span>
        <span class="play-bar__name">${game.title}</span>
        <span class="play-bar__meta">${game.meta}</span>
      </div>
    </div>`

  app.appendChild(bar)

  if (game.status !== 'online') {
    const notice = document.createElement('div')
    notice.className = 'notice'
    notice.innerHTML = `
      <div class="notice__emoji">🚧</div>
      <div class="notice__title">${game.title} 正在加紧制作中</div>
      <div class="notice__sub">先去玩玩其他游戏吧！</div>
      <a data-nav href="/${game.type}" class="btn">看看其他游戏</a>`
    app.appendChild(notice)
    return
  }

  const stage = document.createElement('div')
  stage.className = 'play-stage'
  app.appendChild(stage)

  if (game.type === 'html5') {
    document.title = `${game.title} · 童趣游戏屋`
    bar.firstElementChild!.insertAdjacentHTML(
      'beforeend',
      `<div class="play-bar__actions">
        <button class="btn btn--ghost btn--sm" id="reloadGame">🔄 重新加载</button>
        <a class="btn btn--ghost btn--sm" href="${game.entry}" target="_blank" rel="noopener">↗ 新窗口打开</a>
      </div>`,
    )
    const frame = document.createElement('iframe')
    frame.className = 'game-frame'
    frame.src = game.entry
    frame.title = game.title
    stage.appendChild(frame)
    bar.querySelector('#reloadGame')?.addEventListener('click', () => {
      frame.src = `${game.entry}?t=${Date.now()}`
    })
  } else {
    await mountPythonPlay(stage, game)
  }
}
