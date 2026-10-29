type RouteHandler = (params: string[]) => void

const routes: { regex: RegExp; handler: RouteHandler }[] = []
let fallback: RouteHandler = () => {}

/** 注册路由，pattern 支持 '/play/:id' 这样的参数段。 */
export function route(pattern: string, handler: RouteHandler) {
  const parts = pattern.split('/').filter(Boolean)
  const regex = new RegExp(
    '^' +
      parts
        .map((p) =>
          p.startsWith(':')
            ? '([^/]+)'
            : p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        )
        .join('/') +
      '$',
  )
  routes.push({ regex, handler })
}

/** 所有路由都不匹配时调用（默认渲染首页）。 */
export function setFallback(handler: RouteHandler) {
  fallback = handler
}

export function navigate(path: string) {
  history.pushState(null, '', path)
  window.scrollTo(0, 0)
  dispatch(path)
}

function dispatch(path: string) {
  // 去掉查询串与首尾斜杠：'/'、'/html5'、'/play/x/' 分别归一化为 ''、'html5'、'play/x'
  const clean = path.split('?')[0].replace(/^\/+|\/+$/g, '')
  for (const r of routes) {
    const m = clean.match(r.regex)
    if (m) {
      r.handler(m.slice(1))
      return
    }
  }
  fallback([])
}

export function start() {
  // 站内链接统一走前端路由（<a data-nav href="...">）
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    const a = target.closest?.('a[data-nav]') as HTMLAnchorElement | null
    if (!a) return
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    navigate(a.getAttribute('href') || '/')
  })
  window.addEventListener('popstate', () => dispatch(location.pathname))
  dispatch(location.pathname)
}
