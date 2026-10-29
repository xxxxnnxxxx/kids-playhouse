# 🤖 猜数字机器人
# 机器人心里想好了一个 1~100 的整数，你来猜！
# 在下方输入框里输入数字，按回车（或点发送）告诉机器人。
#
# 想学编程？看看下面的代码：
#   - random.randint(1, 100) 随机挑一个数
#   - if / elif / else 做判断
#   - on_input 是收到你输入时被调用的函数
# 试着改改范围（比如 1~50），再点「运行 ▶」试试！

import random

LOWER, UPPER = 1, 100

secret = random.randint(LOWER, UPPER)
tries = 0

print("🤖 你好！我是猜数字机器人。")
print(f"我想好了一个 {LOWER}~{UPPER} 之间的整数，猜猜它是几？")
print("（直接在下面输入数字，按回车发送）")


def new_round():
    """重新想一个数字，开始新一轮。"""
    global secret, tries
    secret = random.randint(LOWER, UPPER)
    tries = 0
    print()
    print(f"🎮 新一局开始！我又想好了一个 {LOWER}~{UPPER} 的数，来吧！")


def on_input(text):
    """每次你输入一行文字，这个函数就会被调用。"""
    global tries
    s = text.strip()

    if s in ("不玩了", "退出", "拜拜"):
        print("👋 下次再来玩哦！");
        return

    try:
        n = int(s)
    except ValueError:
        print(f"🤔 「{s}」好像不是数字，输入 {LOWER}~{UPPER} 之间的整数试试～")
        return

    if n < LOWER or n > UPPER:
        print(f"⚠️ 要猜的数在 {LOWER}~{UPPER} 之间哦！")
        return

    tries += 1
    if n < secret:
        print(f"第 {tries} 次猜测：{n} —— 太小啦，往大猜 ⬆")
    elif n > secret:
        print(f"第 {tries} 次猜测：{n} —— 太大啦，往小猜 ⬇")
    else:
        stars = "🌟" * min(tries, 5)
        print(f"🎉 猜对啦！答案就是 {n}！你一共用了 {tries} 次。{stars}")
        if tries <= 5:
            print("太厉害了，直觉惊人！")
        else:
            print("坚持就是胜利，下次试试二分法：先猜中间的数！")
        new_round()
