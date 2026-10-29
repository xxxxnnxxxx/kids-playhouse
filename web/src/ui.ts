import type { Game } from './types'

export function el(html: string): HTMLElement {
  const tpl = document.createElement('template')
  tpl.innerHTML = html.trim()
  return tpl.content.firstElementChild as HTMLElement
}

export function topbar(active: string): HTMLElement {
  const link = (href: string, key: string, label: string) =>
    `<a data-nav href="${href}" class="nav-link${active === key ? ' is-active' : ''}">${label}</a>`
  return el(`
    <header class="topbar">
      <div class="topbar__inner">
        <div class="topbar__left">
          <a data-nav href="/" class="brand">童趣游戏屋 🎈</a>
          <nav class="nav">
            ${link('/', 'home', '首页')}
            ${link('/python', 'python', 'Python 游戏')}
            ${link('/html5', 'html5', 'HTML5 游戏')}
            ${link('/parents', 'parents', '家长中心')}
          </nav>
        </div>
        <div class="topbar__right">
          <span class="signin">登录</span>
          <a data-nav href="/html5" class="btn btn--sm">开始玩</a>
        </div>
      </div>
    </header>
  `)
}

export function footer(): HTMLElement {
  return el(`
    <footer class="footer">
      <div class="footer__inner">
        <div class="footer__main">
          <div class="footer__brand">
            <div class="brand">童趣游戏屋 🎈</div>
            <p class="footer__desc">为孩子准备的 HTML5 与 Python 游戏乐园，玩中学，学中玩。</p>
          </div>
          <div class="footer__col">
            <div class="footer__col-title">游戏分类</div>
            <div class="footer__col-items">HTML5 游戏 · Python 游戏 · 亲子共玩</div>
          </div>
          <div class="footer__col">
            <div class="footer__col-title">学习资源</div>
            <div class="footer__col-items">编程入门 · 家长指南 · 教师专区</div>
          </div>
          <div class="footer__col">
            <div class="footer__col-title">关于我们</div>
            <div class="footer__col-items">团队介绍 · 联系方式 · 隐私政策</div>
          </div>
        </div>
        <div class="footer__bottom">
          <span>© 2025 童趣游戏屋 · 用心陪孩子长大</span>
          <span class="footer__legal"><span>Privacy</span><span>Terms</span></span>
        </div>
      </div>
    </footer>
  `)
}

export function sectionTitle(eyebrow: string, title: string): HTMLElement {
  return el(`
    <div class="section-title">
      <div class="section-title__eyebrow">${eyebrow}</div>
      <h2 class="section-title__title">${title}</h2>
    </div>
  `)
}

export function gameCard(game: Game): HTMLElement {
  const online = game.status === 'online'
  const link = game.type === 'python' ? '进入闯关 →' : '开始游戏 →'
  const card = el(`
    <${online ? `a data-nav href="/play/${game.id}"` : 'div'} class="card${online ? '' : ' card--soon'}">
      <div class="card__head">
        <span class="card__badge">${game.badge}</span>
        <span class="card__meta">${game.meta}</span>
      </div>
      <div class="card__title">${game.title}</div>
      <div class="card__body">${game.description}</div>
      <div class="card__link">${online ? link : '即将上线'}</div>
    </${online ? 'a' : 'div'}>
  `)
  return card
}

export function cardGrid(games: Game[]): HTMLElement {
  const grid = el('<div class="card-grid"></div>')
  games.forEach((g) => grid.appendChild(gameCard(g)))
  return grid
}

export function statsRow(): HTMLElement {
  const items: Array<[string, string]> = [
    ['40+', '在线小游戏'],
    ['12 万+', '小玩家在玩'],
    ['100%', '免费无广告'],
    ['0 元', '家长放心'],
  ]
  const grid = el('<div class="stats-row"></div>')
  items.forEach(([v, l]) => {
    grid.appendChild(
      el(
        `<div class="stats-item"><div class="stats-item__value">${v}</div><div class="stats-item__label">${l}</div></div>`,
      ),
    )
  })
  return grid
}

export function ctaBanner(): HTMLElement {
  return el(`
    <section class="cta-banner">
      <div class="cta-banner__text">
        <div class="cta-banner__title">每周更新一款新游戏</div>
        <div class="cta-banner__sub">订阅后第一时间收到新关卡和编程小挑战，还有家长陪伴指南。</div>
      </div>
      <button class="cta-banner__btn">免费订阅更新</button>
    </section>
  `)
}

export function hero(): HTMLElement {
  return el(`
    <section class="hero">
      <div class="hero__badge">🎮 6-12 岁专属 · 全部免费畅玩</div>
      <h1 class="hero__title">边玩边学的儿童游戏乐园</h1>
      <p class="hero__sub">40+ 款 HTML5 与 Python 小游戏，打开浏览器就能玩；从点一点到写代码，让孩子在闯关里自然爱上编程。</p>
      <div class="hero__actions">
        <a data-nav href="/html5" class="btn btn--lg">立即开玩</a>
        <a data-nav href="/python" class="btn btn--lg btn--ghost">看看编程游戏</a>
      </div>
    </section>
  `)
}
