package main

import (
	"flag"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
)

func main() {
	addr := flag.String("addr", ":8080", "HTTP 监听地址")
	webDir := flag.String("web", "web/dist", "前端编译产物目录（Vite build 输出）")
	gamesDir := flag.String("games", "games", "游戏资源根目录")
	flag.Parse()

	manifestPath := filepath.Join(*gamesDir, "games.json")
	games, err := LoadManifest(manifestPath)
	if err != nil {
		log.Fatalf("加载游戏清单失败: %v", err)
	}
	log.Printf("已加载 %d 款游戏（清单: %s）", len(games), manifestPath)

	// 确保静态目录存在，避免 r.Static 初始化失败
	for _, dir := range []string{
		*webDir,
		filepath.Join(*gamesDir, "html5"),
		filepath.Join(*gamesDir, "python"),
	} {
		if err := os.MkdirAll(dir, 0o755); err != nil {
			log.Fatalf("创建目录 %s 失败: %v", dir, err)
		}
	}

	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.ReleaseMode)
	}
	r := gin.Default()

	r.GET("/api/v1/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// 游戏列表，可通过 ?type=html5 或 ?type=python 过滤
	r.GET("/api/v1/games", func(c *gin.Context) {
		gameType := c.Query("type")
		result := make([]Game, 0, len(games))
		for _, g := range games {
			if gameType == "" || g.Type == gameType {
				result = append(result, g)
			}
		}
		c.JSON(http.StatusOK, gin.H{"games": result, "total": len(result)})
	})

	r.GET("/api/v1/games/:id", func(c *gin.Context) {
		id := c.Param("id")
		for _, g := range games {
			if g.ID == id {
				c.JSON(http.StatusOK, g)
				return
			}
		}
		c.JSON(http.StatusNotFound, gin.H{"error": "game not found"})
	})

	// 游戏静态资源：/games/html5/...（HTML5 游戏）与 /games/python/...（Python 源码）
	r.Static("/games", *gamesDir)

	// SPA 兜底：其余路径优先返回前端编译产物中的同名文件，找不到回落到 index.html
	r.NoRoute(func(c *gin.Context) {
		p := c.Request.URL.Path
		if strings.HasPrefix(p, "/api/") {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		clean := filepath.Clean("/" + p) // 去掉 ".." 等片段，防止目录穿越
		full := filepath.Join(*webDir, clean)
		if st, err := os.Stat(full); err == nil && !st.IsDir() {
			c.File(full)
			return
		}
		c.File(filepath.Join(*webDir, "index.html"))
	})

	log.Printf("童趣游戏屋启动: http://localhost%s", *addr)
	if err := r.Run(*addr); err != nil {
		log.Fatalf("服务启动失败: %v", err)
	}
}
