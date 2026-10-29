# 🐢 海龟画图小画家
# 这只小海龟会听你的指挥画画：forward 前进、right 右转、color 换颜色……
# 改一改下面的代码，点「运行 ▶」，看看画布上会发生什么！
#
# 小试身手：
#   1. 把 "gold" 换成 "tomato"、"orchid"、"dodgerblue" 试试
#   2. 把 range(5) 改成 range(9)，星星会发生什么？
#   3. 改改 t.forward(160) 里的数字，星星会变大变小

import turtle

t = turtle.Turtle()
t.speed(0)

# ---- 画一颗大星星 ⭐ ----
t.color("gold")
t.width(3)
t.penup()
t.goto(-210, 100)
t.pendown()
for i in range(5):
    t.forward(170)
    t.right(144)

# ---- 画一道彩虹 🌈 ----
colors = ["crimson", "orange", "gold", "mediumseagreen", "dodgerblue", "orchid"]
t.width(10)
for i, c in enumerate(colors):
    r = 120 - i * 13
    t.color(c)
    t.penup()
    t.goto(90 - r, -70)
    t.setheading(0)
    t.pendown()
    t.circle(r, 180)

# ---- 签个名 ✨ ----
t.penup()
t.goto(0, -150)
t.color("#059669")
t.write("我是小小画家！")

turtle.done()
