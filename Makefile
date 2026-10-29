# 童趣游戏屋一键构建 —— 所有产物统一生成在 output/ 目录
#
# 常用命令（在仓库根目录执行）：
#   make         一键构建：前端编译 + Go 编译 + 游戏资源，全部进 output/
#   make run     一键构建后直接启动服务 → http://localhost:8080
#   make clean   清理 output/ 与 web/dist
#
# 环境：Go 1.22+、Node 18+；Windows 请在 Git Bash 中运行 make（或 mingw32-make，
# 本文件在 Windows 下已强制用 bash 执行命令，rm/cp 等 Unix 命令可用）。

ifeq ($(OS),Windows_NT)
SHELL := bash
EXE   := server.exe
else
EXE   := server
endif

OUTPUT := output

.PHONY: all check web resources server run clean

all: check web resources server

check:
	@command -v go >/dev/null 2>&1 || { echo "未找到 go，请先安装 Go 1.22+"; exit 1; }
	@command -v npm >/dev/null 2>&1 || { echo "未找到 npm，请先安装 Node 18+"; exit 1; }

# 前端：安装依赖并 Vite 编译，产物拷贝到 output/web/dist
web:
	cd web && npm install && npm run build
	rm -rf $(OUTPUT)/web
	mkdir -p $(OUTPUT)/web
	cp -r web/dist $(OUTPUT)/web/dist

# 游戏资源：清单 + HTML5 + Python 全量拷贝到 output/games
resources:
	rm -rf $(OUTPUT)/games
	cp -r games $(OUTPUT)/games

# 后端：编译 Go 二进制到 output/
server:
	mkdir -p $(OUTPUT)
	go build -o $(OUTPUT)/$(EXE) ./server

# 一键构建并运行：在 output/ 内启动，默认参数 -web web/dist -games games
# 相对 exe 所在目录，恰好指向 output/web/dist 与 output/games
run: all
	cd $(OUTPUT) && ./$(EXE)

clean:
	rm -rf $(OUTPUT) web/dist
