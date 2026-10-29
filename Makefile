# 童趣游戏屋一键构建 —— 所有产物统一生成在 output/ 目录
#
#   make         一键构建：前端编译 + Go 编译 + 游戏资源 → output/
#   make run     一键构建后启动本地预览 → http://localhost:8080
#   make clean   清理 output/ 与 web/dist
#
# 兼容性说明：配方不依赖任何 Unix 命令（rm/cp/mkdir 等），
# 文件操作统一用 node 完成，因此 Windows cmd / PowerShell / Git Bash
# 以及 Linux/macOS 下均可直接 make。

ifeq ($(OS),Windows_NT)
EXE := server.exe
else
EXE := server
endif

OUTPUT := output

.PHONY: all check web resources server run clean

all: check web resources server

check:
	@go version
	@node -v

# 前端：安装依赖并 Vite 编译，产物拷贝到 output/web/dist
web:
	cd web && npm install && npm run build
	node -e "const fs=require('fs');fs.rmSync('$(OUTPUT)/web',{recursive:true,force:true});fs.mkdirSync('$(OUTPUT)/web',{recursive:true});fs.cpSync('web/dist','$(OUTPUT)/web/dist',{recursive:true})"

# 游戏资源：清单 + HTML5 + Python 全量拷贝到 output/games
resources:
	node -e "const fs=require('fs');fs.rmSync('$(OUTPUT)/games',{recursive:true,force:true});fs.cpSync('games','$(OUTPUT)/games',{recursive:true})"

# 后端：编译 Go 二进制到 output/
server:
	node -e "require('fs').mkdirSync('$(OUTPUT)',{recursive:true})"
	go build -o $(OUTPUT)/$(EXE) ./server

# 一键构建并启动本地预览（部署时进入 output/ 直接运行可执行文件）
run: all
	go run ./server

clean:
	node -e "const fs=require('fs');fs.rmSync('$(OUTPUT)',{recursive:true,force:true});fs.rmSync('web/dist',{recursive:true,force:true})"
