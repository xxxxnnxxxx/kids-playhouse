# 童趣游戏屋 🎈

面向 6-12 岁儿童的免费游戏网站：HTML5 小游戏即开即玩，Python 小游戏在浏览器里
加载真实 Python 源码运行，孩子可以边玩边改代码。

视觉设计来自 `docs/童趣游戏屋 · 儿童游戏网站.html`（布局已从固定画板转为响应式，
配色、字体层级与区块内容保持一致）。

## 技术栈与架构

前后端分离开发、单服务部署：

| 层 | 技术 | 说明 |
| --- | --- | --- |
| 前端 | Node + Vite + TypeScript（原生 DOM） | `npm run build` 编译到 `web/dist`，无重框架依赖 |
| 后端 | Go + Gin | REST API + 托管前端编译产物与游戏资源，单端口部署 |
| HTML5 游戏 | 原生 JS/Canvas 单文件页面 | 每款游戏一个目录，播放页 iframe 嵌入 |
| Python 游戏 | Pyodide（浏览器端 CPython/WebAssembly） | Python 源码直接在浏览器运行，无需服务器执行 Python |

```
children-games/
├── server/              # Go + Gin 后端（main.go / games.go）
├── web/                 # 前端源码（Vite + TS）
│   └── src/
│       ├── pages/       # 首页 / 游戏列表 / 播放页 / 家长中心
│       ├── pyodideRunner.ts   # Pyodide 加载、画布桥、游戏循环
│       └── pythonPrelude.ts   # 注入的 Python 兼容层（turtle / webgames）
├── games/
│   ├── games.json       # 游戏清单（12 款，含"即将上线"）
│   ├── html5/<id>/      # 每款 HTML5 游戏一个自包含目录
│   └── python/<id>/     # 每款 Python 游戏一份 main.py（可直接在线编辑）
├── docs/                # 原始设计模板
├── logs/                # 开发确认日志
└── prompt/message.txt   # 交互记录
```

## 快速开始

环境要求：Go 1.22+、Node 18+。

### 方式一：Makefile 一键构建（推荐）

```bash
make            # 前端 + 后端 + 游戏资源 → 全部产物在 output/
cd output && ./server.exe   # Windows；Linux/macOS 下为 ./server
# 或者一步到位：make run（构建完自动启动）

make clean      # 清理 output/ 与 web/dist
```

`output/` 目录内容：`server.exe`（Go 服务）、`web/dist`（前端编译产物）、
`games`（游戏清单与资源）。在 `output/` 内启动即可，服务默认参数正好指向同级目录。

### 方式二：分步构建与运行

```bash
# 1) 构建前端（产物在 web/dist，已 gitignore）
cd web
npm install
npm run build
cd ..

# 2) 启动服务（默认 :8080，托管 web/dist 与 games/）
go run ./server
# 打开 http://localhost:8080
```

### 前后端并行开发

```bash
# 终端 1：Go 服务（提供 API 与游戏资源）
go run ./server

# 终端 2：Vite 开发服务器（5173 端口，/api 与 /games 自动代理到 8080）
cd web && npm run dev
```

开发时访问 http://localhost:5173，修改前端代码即时热更新；生产部署只需 Go 服务。

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
   控制台游戏 `canvas: false`（隐藏画布），画布游戏 `canvas: true`。

## 关于 Pyodide

- 运行时从 jsDelivr CDN 加载（`web/src/pyodideRunner.ts` 中的 `PYODIDE_VERSION`），
  首次约 10MB；如需离线/内网部署，可下载 [pyodide 发行包](https://github.com/pyodide/pyodide/releases)
  解压到 `web/public/pyodide/`，把 `PYODIDE_BASE` 改为 `/pyodide/` 即可。
- Python 游戏在主线程执行：正常游戏代码（事件驱动）不会卡页面；若孩子把代码改成
  `while True` 且无输入等待，页面会卡住，刷新即可恢复（后续可升级为 Worker 隔离）。
- 模板使用的 Google Fonts 在部分网络下可能加载失败，已配置系统字体回退，不影响使用。
