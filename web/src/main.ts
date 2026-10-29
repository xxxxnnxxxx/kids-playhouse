import './styles.css'
import { route, setFallback, start } from './router'
import { renderHome } from './pages/home'
import { renderList } from './pages/list'
import { renderParents } from './pages/parents'
import { renderPlay } from './pages/play'

const app = document.getElementById('app')!

route('/', () => renderHome(app))
route('/html5', () => renderList(app, 'html5'))
route('/python', () => renderList(app, 'python'))
route('/parents', () => renderParents(app))
route('/play/:id', (params) => renderPlay(app, params[0]))
// 未知路径直接渲染首页（不走 navigate，避免任何可能的循环跳转）
setFallback(() => renderHome(app))

start()
