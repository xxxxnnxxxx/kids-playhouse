// 注入到 Pyodide 的 Python 兼容层：
//  - turtle：轻量海龟画图（命令即时绘制到画布）
//  - webgames：事件驱动小游戏 API（画布绘制 + setup/update/on_key 回调）
// 游戏代码里 `import turtle` / `import webgames` 拿到的就是这里的模块。
export const PYTHON_PRELUDE = `# ===== 童趣游戏屋 Python 兼容层（运行器自动注入，可直接使用）=====
import math
import random
import sys
import types
from js import __cg as _cg


class Turtle:
    def __init__(self):
        self._x = 0.0
        self._y = 0.0
        self._heading = 90.0  # 0=东 90=北
        self._pen = True
        self._color = "#1F2937"
        self._width = 3

    def _cx(self, x):
        return _cg.w / 2 + x

    def _cy(self, y):
        return _cg.h / 2 - y

    def forward(self, distance):
        rad = math.radians(self._heading)
        self.goto(self._x + distance * math.cos(rad),
                  self._y + distance * math.sin(rad))

    fd = forward

    def backward(self, distance):
        self.forward(-distance)

    bk = back = backward

    def right(self, angle):
        self._heading -= angle

    rt = right

    def left(self, angle):
        self._heading += angle

    lt = left

    def goto(self, x, y):
        if self._pen:
            _cg.line(self._cx(self._x), self._cy(self._y),
                      self._cx(x), self._cy(y), self._color, self._width)
        self._x = float(x)
        self._y = float(y)

    setpos = setposition = goto

    def penup(self):
        self._pen = False

    def pendown(self):
        self._pen = True

    pu = up = penup
    pd = down = pendown

    def color(self, c=None):
        if c is not None:
            self._color = c

    pencolor = color

    def width(self, w=None):
        if w is not None:
            self._width = w

    pensize = width

    def setheading(self, angle):
        self._heading = float(angle)

    seth = setheading

    def home(self):
        self._x = 0.0
        self._y = 0.0

    def position(self):
        return (self._x, self._y)

    pos = position

    def heading(self):
        return self._heading

    def circle(self, radius, extent=360.0):
        # 用小线段近似圆弧：每一步先转向再前进
        if radius == 0 or extent == 0:
            return
        steps = max(8, int(abs(extent) / 4))
        turn = extent / steps
        seg = 2 * abs(radius) * math.sin(math.radians(abs(turn)) / 2)
        for _ in range(steps):
            (self.left if radius > 0 else self.right)(turn)
            self.forward(seg)

    def dot(self, size=10, color=None):
        _cg.circle(self._cx(self._x), self._cy(self._y), size / 2, color or self._color)

    def write(self, text, *args, **kwargs):
        _cg.text(str(text), self._cx(self._x), self._cy(self._y),
                  kwargs.get("size", 16), self._color)

    def speed(self, *args, **kwargs):
        pass

    def stamp(self):
        self.dot(6)


def _screen_bgcolor(color):
    _cg.clear(color)


_turtle_mod = types.ModuleType("turtle")
_turtle_mod.Turtle = Turtle
_turtle_mod.Screen = lambda: types.SimpleNamespace(
    bgcolor=_screen_bgcolor, setup=lambda *a, **k: None,
    exitonclick=lambda: None, mainloop=lambda: None)
_turtle_mod.done = lambda: None
_turtle_mod.mainloop = lambda: None
_turtle_mod.bgcolor = _screen_bgcolor
sys.modules["turtle"] = _turtle_mod


# ===== webgames：事件驱动小游戏 API =====
def _wg_clear(color="#F7F9F4"):
    _cg.clear(color)


def _wg_rect(x, y, w, h, color="#1F2937"):
    _cg.rect(x, y, w, h, color)


def _wg_circle(x, y, r, color="#1F2937"):
    _cg.circle(x, y, r, color)


def _wg_line(x1, y1, x2, y2, color="#1F2937", width=2):
    _cg.line(x1, y1, x2, y2, color, width)


def _wg_text(s, x, y, size=18, color="#1F2937"):
    _cg.text(str(s), x, y, size, color)


_webgames = types.ModuleType("webgames")
_webgames.w = int(_cg.w)
_webgames.h = int(_cg.h)
_webgames.clear = _wg_clear
_webgames.rect = _wg_rect
_webgames.circle = _wg_circle
_webgames.line = _wg_line
_webgames.text = _wg_text
sys.modules["webgames"] = _webgames
`
