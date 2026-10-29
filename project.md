# 童趣游戏屋 · 工程说明

本文件面向工程维护：技术栈、构建运行、API、扩展方式。
网站诞生过程（由设计模板经 prompt 交互生成）见 [README.md](README.md)。

## 技术栈与架构

前后端分离开发、单服务部署：

| 层 | 技术 | 说明 |
| --- | --- | --- |
| 前端 | Node + Vite + TypeScript（原生 DOM） | `npm run build` 编译到 `web/dist`，无重框架依赖 |
| 后端 | Go + Gin | REST API + 托管前端编译产物与游戏资源，单端口部署 |
| HTML5 游戏 | 原生 JS/Canvas 单文件页面 | 每款游戏一个目录，播放页 iframe 嵌入 |
| Python 游戏 | Pyodide（浏览器端 CPython/WebAssembly） | Python 源码直接在浏览器运行，无需服务器执行 Python；本地自托管优先，CDN 兜底 |

```
children-games/
├── server/              # Go + Gin 后端（main.go / games.go）
├── web/                 # 前端源码（Vite + TS）
│   ├── public/pyodide/  # 本地自托管 Pyodide 运行时（gitignore，见下文"准备 Pyodide"）
│   └── src/
│       ├── pages/       # 首页 / 游戏列表 / 播放页 / 家长中心
│       ├── pyodideRunner.ts   # Pyodide 加载、画布桥、游戏循环、播放页布局
│       └── pythonPrelude.ts   # 注入的 Python 兼容层（turtle / webgames）
├── games/
│   ├── games.json       # 游戏清单（12 款，含"即将上线"）
│   ├── html5/<id>/      # 每款 HTML5 游戏一个自包含目录
│   └── python/<id>/     # 每款 Python 游戏一份 main.py（可在线编辑）
├── docs/                # 设计模板与截图
├── logs/                # 开发确认日志
└── prompt/message.txt   # 交互记录
```

## 环境要求

Go 1.22+、Node 18+。Python 游戏在浏览器运行，本地无需安装 Python。

## 快速开始

### 准备 Pyodide（一次性，Python 游戏需要）

Python 游戏的运行时默认从本站 `/pyodide/` 加载（国内网络下 jsDelivr CDN 可能完全停滞）。
首次准备（Windows 10+ 自带 curl/tar，Git Bash 与 cmd 均可执行）：

```bash
curl -L -o pyodide.tgz https://registry.npmmirror.com/pyodide/-/pyodide-0.26.4.tgz
mkdir -p web/public/pyodide
tar -xzf pyodide.tgz -C web/public/pyodide --strip-components=1
rm pyodide.tgz   # cmd 下用 del pyodide.tgz
```

该目录已加入 .gitignore（约 13MB 二进制不入库）；`make` 构建时会随 `web/public`
自动拷贝进 `web/dist`。若不准备本地目录，运行器会自动回退 CDN（境外网络可用）。

### 方式一：Makefile 一键构建（推荐）

```bash
make            # 前端 + 后端 + 游戏资源 → 全部产物在 output/
cd output && ./server.exe   # Windows；Linux/macOS 下为 ./server
# 或者一步到位：make run（构建完自动启动）

make clean      # 清理 output/ 与 web/dist
```

`output/` 目录内容：`server.exe`（Go 服务）、`web/dist`（前端编译产物）、
`games`（游戏清单与资源）。在 `output/` 内启动即可，服务默认参数正好指向同级目录。
Makefile 的配方不依赖任何 Unix 命令（文件操作用 node 完成），
Windows cmd / PowerShell / Git Bash 以及 Linux/macOS 下均可直接 make。

### 方式二：分步构建与运行

```bash
cd web && npm install && npm run build && cd ..
go run ./server      # 默认 :8080，打开 http://localhost:8080
```

### 前后端并行开发

```bash
go run ./server            # 终端 1：API 与游戏资源（8080）
cd web && npm run dev      # 终端 2：Vite 热更新（5173，/api 与 /games 自动代理到 8080）
```

### 服务参数

```bash
go run ./server -addr :8080 -web web/dist -games games
```

## API

| 接口 | 说明 |
| --- | --- |
| `GET /api/v1/health` | 健康检查 |
| `GET /api/v1/games` | 全部游戏清单，`?type=html5` / `?type=python` 过滤 |
| `GET /api/v1/games/:id` | 单个游戏详情 |

清单字段：`id`、`type`、`title`、`badge`、`meta`、`description`、
`status`（online/coming-soon）、`entry`、`canvas`（python 控制台游戏为 false）、
`editorOpen`（python 播放页代码编辑器是否默认展开）。

## 已实现的游戏（首期 6 款）

- **HTML5**：记忆翻翻牌、迷宫里的小恐龙、泡泡数学消消乐
- **Python**（Pyodide 运行，可在线改代码）：猜数字机器人、海龟画图小画家、贪吃蛇重制版

其余 6 款卡片显示"即将上线"，在 `games/games.json` 中将 `status` 改为 `online`
并补上 `entry` 与游戏目录即可上架。

## 如何新增一款游戏

**HTML5 游戏**：
1. 新建 `games/html5/<id>/index.html`（自包含单文件）；
2. 在 `games/games.json` 增加条目：`type: "html5"`、`entry: "/games/html5/<id>/index.html"`、`status: "online"`。

**Python 游戏**：
1. 新建 `games/python/<id>/main.py`，使用 `turtle`（画图）或 `webgames`
   （事件驱动：`setup()` / `update(dt)` / `on_key(k)` / `on_input(text)`）编写；
2. 清单条目：`type: "python"`、`entry: "/games/python/<id>/main.py"`、
   控制台游戏 `canvas: false`，画布游戏 `canvas: true`（可加 `editorOpen`）。

## 关于 Pyodide 的其他说明

- Python 游戏在浏览器主线程执行：正常游戏代码（事件驱动）不会卡页面；若把代码改成
  `while True` 且无输入等待，页面会卡住，刷新即可恢复（后续可升级为 Worker 隔离）。
- 每次点「运行」都在全新的 Python 命名空间中执行，避免不同游戏之间的全局变量与回调互相污染。
- 站点提供的 Python 兼容层（`web/src/pythonPrelude.ts`）实现了常用 turtle 命令与
  webgames 事件驱动 API，均即时绘制到页面画布。
