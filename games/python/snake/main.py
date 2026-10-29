# 🐍 贪吃蛇重制版
# 方向键或 WASD 控制小蛇去吃苹果 🍎，吃得越多蛇越长、速度越快！
# 撞墙或咬到自己就结束啦，按 R 重新开始。
#
# 这就是真正的 Python 代码！点「看代码」可以修改：
#   1. 把 SPEED0 改大一点，蛇会跑得更快
#   2. 把 "#059669"（蛇头颜色）换成你喜欢的颜色
#   3. 想让蛇穿墙？把 die() 里两行注释打开试试

import random
import webgames as wg

GRID = 20                                    # 每格像素
TOP = 40                                     # 顶部留给记分板
COLS = wg.w // GRID                          # 画布宽 ÷ 格子
ROWS = (wg.h - TOP) // GRID                  # 画布高 ÷ 格子（去掉记分板）
SPEED0 = 6.0                                 # 初始速度：每秒走几格
SPEED_MAX = 15.0

snake = []
direction = (1, 0)
pending_dir = (1, 0)
food = (0, 0)
score = 0
best = 0
alive = True
acc = 0.0
speed = SPEED0


def reset():
    """回到开局状态。"""
    global snake, direction, pending_dir, food, score, alive, acc, speed
    snake = [(8, 11), (7, 11), (6, 11)]
    direction = (1, 0)
    pending_dir = (1, 0)
    score = 0
    alive = True
    acc = 0.0
    speed = SPEED0
    place_food()


def place_food():
    global food
    while True:
        p = (random.randrange(COLS), random.randrange(ROWS))
        if p not in snake:
            food = p
            return


def die():
    global alive, best
    alive = False
    best = max(best, score)
    # 想穿墙？把下面两行开头的 # 去掉，并把 die() 里上面的 alive=False 注释掉
    # snake[0] = ((snake[0][0] + direction[0]) % COLS, (snake[0][1] + direction[1]) % ROWS)


def setup():
    reset()


def on_key(k):
    """按键事件：k 是 'up' 'down' 'left' 'right' 'w' 'a' 's' 'd' 'r' …"""
    global pending_dir
    d = {
        "up": (0, -1), "w": (0, -1),
        "down": (0, 1), "s": (0, 1),
        "left": (-1, 0), "a": (-1, 0),
        "right": (1, 0), "d": (1, 0),
    }.get(k)
    if d and d != (-direction[0], -direction[1]):
        pending_dir = d
    elif k == "r":
        reset()


def step():
    global direction, food, score, speed
    direction = pending_dir
    hx, hy = snake[0]
    nx, ny = hx + direction[0], hy + direction[1]
    if nx < 0 or ny < 0 or nx >= COLS or ny >= ROWS or (nx, ny) in snake:
        die()
        return
    snake.insert(0, (nx, ny))
    if (nx, ny) == food:
        score += 10
        speed = min(SPEED_MAX, SPEED0 + score * 0.15)
        place_food()
    else:
        snake.pop()


def update(dt):
    """每帧调用一次：dt 是距离上一秒的时间（秒）。"""
    if alive:
        acc += dt
        interval = 1.0 / speed
        while acc >= interval:
            acc -= interval
            step()
            if not alive:
                break
    draw()


def cell(seg, pad=2):
    return (seg[0] * GRID + pad, TOP + seg[1] * GRID + pad, GRID - pad * 2, GRID - pad * 2)


def draw():
    wg.clear("#0B3B2E")                       # 森林绿背景
    # 记分板
    wg.rect(0, 0, wg.w, TOP - 6, "#06281F")
    wg.text(f"得分 {score}    最佳 {best}", wg.w // 2, TOP // 2 - 4, 16, "#A7F3D0")
    # 苹果
    fx, fy = cell(food, 5)
    wg.text("🍎", fx + GRID // 2, fy + GRID // 2 + 1, 15)
    # 蛇身（头深尾浅）
    for i, seg in enumerate(snake):
        color = "#34D399" if i == 0 else ("#10B981" if i % 2 == 0 else "#1EA97C")
        wg.rect(*cell(seg), color)
    if not alive:
        wg.rect(wg.w // 2 - 170, wg.h // 2 - 52, 340, 104, "#1F2937")
        wg.text("撞到啦！按 R 重新开始 🐍", wg.w // 2, wg.h // 2 - 14, 18, "#FCA5A5")
        wg.text(f"本局得分 {score}", wg.w // 2, wg.h // 2 + 20, 14, "#E5E7EB")
