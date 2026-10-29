import { fetchGameSource } from './api'
import { PYTHON_PRELUDE } from './pythonPrelude'
import type { Game } from './types'

const PYODIDE_VERSION = '0.26.4'
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`
const CANVAS_W = 800
const CANVAS_H = 520

/** JS 侧画布桥：Python 通过 from js import __cg 调用这些函数画画 */
interface CanvasBridge {
  w: number
  h: number
  clear(color: string): void
  rect(x: number, y: number, w: number, h: number, color: string): void
  circle(x: number, y: number, r: number, color: string): void
  line(x1: number, y1: number, x2: number, y2: number, color: string, width: number): void
  text(s: string, x: number, y: number, size: number, color: string): void
}

interface PyProxyCallable {
  (...args: unknown[]): unknown
}

interface PyodideAPI {
  runPython(code: string): unknown
  runPythonAsync(code: string): Promise<unknown>
  setStdout(opts: { batched: (s: string) => void }): void
  setStderr(opts: { batched: (s: string) => void }): void
  setStdin(opts: { stdin: () => string }): void
  globals: { has(name: string): boolean; get(name: string): unknown }
}

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<PyodideAPI>
    __cg?: CanvasBridge
  }
}

let pyodidePromise: Promise<PyodideAPI> | null = null
let teardownCurrent: (() => void) | null = null

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`加载 ${src} 失败`))
    document.head.appendChild(s)
  })
}

function ensurePyodide(onStatus: (s: string) => void): Promise<PyodideAPI> {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      onStatus('正在下载 Python 运行环境（首次约 10MB，请稍等）…')
      if (!window.loadPyodide) await loadScript(`${PYODIDE_BASE}pyodide.js`)
      const py = await window.loadPyodide!({ indexURL: PYODIDE_BASE })
      onStatus('Python 环境就绪')
      return py
    })().catch((err) => {
      pyodidePromise = null // 失败后允许重试
      throw err
    })
  }
  return pyodidePromise
}

function normKey(e: KeyboardEvent): string {
  const map: Record<string, string> = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    ' ': 'space', Enter: 'enter',
  }
  if (map[e.key]) return map[e.key]
  if (e.key.length === 1) return e.key.toLowerCase()
  return e.key
}

function formatPyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  const lines = msg.trim().split('\n')
  return lines.slice(-14).join('\n')
}

/** 挂载 Python 游戏的运行界面（终端 + 画布 + 代码编辑器） */
export async function mountPythonPlay(stage: HTMLElement, game: Game) {
  // 卸载上一个实例的事件与动画帧
  teardownCurrent?.()
  teardownCurrent = null

  const wrap = document.createElement('div')
  wrap.className = 'py-play'
  wrap.innerHTML = `
    <div class="py-toolbar">
      <button class="btn" id="pyRun">▶ 运行</button>
      <button class="btn btn--ghost" id="pyReset">🧹 重置</button>
      <button class="btn btn--ghost" id="pyCode">👩‍💻 看代码</button>
      <span class="py-status" id="pyStatus">准备中…</span>
    </div>
    <div class="py-main">
      <div class="py-stage${game.canvas ? '' : ' is-hidden'}">
        <canvas id="pyCanvas" width="${CANVAS_W}" height="${CANVAS_H}"></canvas>
      </div>
      <div class="py-side">
        <div class="py-term" id="pyTerm">
          <div class="py-term__lines" id="pyLines"></div>
          <div class="py-term__input">
            <input id="pyInput" placeholder="在这里输入，回车发送…" autocomplete="off" />
            <button id="pySend">发送</button>
          </div>
        </div>
        <div class="py-editor is-collapsed" id="pyEditorBox">
          <div class="py-editor__bar">
            <span>main.py（改完代码点「▶ 运行」试试）</span>
          </div>
          <textarea id="pyEditor" spellcheck="false"></textarea>
        </div>
      </div>
    </div>`
  stage.appendChild(wrap)

  const $ = (id: string) => wrap.querySelector(`#${id}`) as HTMLElement
  const statusEl = $('pyStatus')
  const linesEl = $('pyLines') as HTMLDivElement
  const inputEl = $('pyInput') as HTMLInputElement
  const editorEl = $('pyEditor') as HTMLTextAreaElement
  const canvasEl = $('pyCanvas') as HTMLCanvasElement
  const ctx = canvasEl.getContext('2d')!

  const setStatus = (s: string) => (statusEl.textContent = s)

  // ---- 终端 ----
  const term = {
    print(s: string, cls = '') {
      s.split('\n').forEach((line) => {
        const div = document.createElement('div')
        div.className = `py-line ${cls}`
        div.textContent = line
        linesEl.appendChild(div)
      })
      linesEl.scrollTop = linesEl.scrollHeight
    },
    clear() {
      linesEl.innerHTML = ''
    },
  }

  // ---- 画布桥（暴露给 Python：from js import __cg）----
  const bridge: CanvasBridge = {
    w: CANVAS_W,
    h: CANVAS_H,
    clear(color) {
      ctx.fillStyle = color
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
    },
    rect(x, y, w, h, color) {
      ctx.fillStyle = color
      ctx.fillRect(x, y, w, h)
    },
    circle(x, y, r, color) {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    },
    line(x1, y1, x2, y2, color, width) {
      ctx.strokeStyle = color
      ctx.lineWidth = width
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    },
    text(s, x, y, size, color) {
      ctx.fillStyle = color
      ctx.font = `${size}px system-ui, 'Segoe UI Emoji', sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(s, x, y)
    },
  }
  window.__cg = bridge

  const clearCanvas = () => bridge.clear('#FFFFFF')

  // ---- 游戏引擎状态 ----
  let engine: {
    update?: PyProxyCallable
    onKey?: PyProxyCallable
    onInput?: PyProxyCallable
  } = {}
  let raf = 0
  let lastTs = 0
  let frameErrored = false

  function callSafe(fn: PyProxyCallable, ...args: unknown[]): boolean {
    try {
      fn(...args)
      return true
    } catch (err) {
      term.print(formatPyError(err), 'err')
      setStatus('运行出错，看看终端提示')
      return false
    }
  }

  function stopEngine() {
    if (raf) cancelAnimationFrame(raf)
    raf = 0
    engine = {}
    frameErrored = false
  }

  function frame(ts: number) {
    const dt = Math.min((ts - lastTs) / 1000, 0.05)
    lastTs = ts
    if (engine.update && !frameErrored) {
      frameErrored = !callSafe(engine.update, dt)
    }
    raf = requestAnimationFrame(frame)
  }

  function startEngine(py: PyodideAPI) {
    const get = (name: string): PyProxyCallable | undefined => {
      if (!py.globals.has(name)) return undefined
      const fn = py.globals.get(name)
      return typeof fn === 'function' ? (fn as PyProxyCallable) : undefined
    }
    engine = {
      update: get('update'),
      onKey: get('on_key'),
      onInput: get('on_input'),
    }
    if (engine.onKey || engine.update) {
      setStatus('运行中 ✓（键盘可控制）')
    } else {
      setStatus('运行中 ✓')
    }
    const setup = get('setup')
    if (setup && !callSafe(setup)) return
    if (engine.update) {
      lastTs = performance.now()
      raf = requestAnimationFrame(frame)
    }
  }

  // ---- 键盘 / 终端输入 ----
  const onKeyDown = (e: KeyboardEvent) => {
    if (!engine.onKey) return
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
    const k = normKey(e)
    if (['up', 'down', 'left', 'right', 'space'].includes(k)) e.preventDefault()
    callSafe(engine.onKey, k)
  }
  window.addEventListener('keydown', onKeyDown)

  const submitInput = () => {
    const v = inputEl.value.trim()
    if (!v) return
    inputEl.value = ''
    term.print(`> ${v}`, 'in')
    if (engine.onInput) {
      callSafe(engine.onInput, v)
    } else {
      term.print('（这个程序没有 on_input，试试点「▶ 运行」重新开始）', 'dim')
    }
  }
  $('pySend').addEventListener('click', submitInput)
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitInput()
  })

  // ---- 运行 / 重置 / 编辑器 ----
  async function run() {
    const btn = $('pyRun') as HTMLButtonElement
    btn.disabled = true
    stopEngine()
    term.clear()
    clearCanvas()
    try {
      const py = await ensurePyodide(setStatus)
      py.setStdout({ batched: (s) => term.print(s) })
      py.setStderr({ batched: (s) => term.print(s, 'err') })
      py.setStdin({
        stdin: () => window.prompt('程序正在等待输入（input）') ?? '',
      })
      py.runPython(PYTHON_PRELUDE)
      await py.runPythonAsync(editorEl.value)
      startEngine(py)
    } catch (err) {
      term.print(formatPyError(err), 'err')
      setStatus('出错啦，看看终端提示')
    } finally {
      btn.disabled = false
    }
  }

  async function loadSource() {
    try {
      editorEl.value = await fetchGameSource(game.entry)
    } catch (err) {
      term.print(`游戏源码加载失败：${(err as Error).message}`, 'err')
      setStatus('源码加载失败')
    }
  }

  $('pyRun').addEventListener('click', run)
  $('pyReset').addEventListener('click', async () => {
    stopEngine()
    term.clear()
    clearCanvas()
    await loadSource()
    setStatus('已重置，点「▶ 运行」开始')
  })
  $('pyCode').addEventListener('click', () => {
    $('pyEditorBox').classList.toggle('is-collapsed')
  })

  teardownCurrent = () => {
    stopEngine()
    window.removeEventListener('keydown', onKeyDown)
  }

  clearCanvas()
  await loadSource()
  term.print(`🐍 ${game.title}`)
  term.print(game.description, 'dim')
  term.print('点「▶ 运行」加载 Python 环境并开始游戏。', 'dim')
  setStatus('就绪，点「▶ 运行」开始')
}
