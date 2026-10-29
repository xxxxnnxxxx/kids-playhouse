import './styles.css'
import { navigate, route, setFallback, start } from './router'
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
setFallback(() => navigate('/'))

start()
