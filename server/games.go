package main

import (
	"encoding/json"
	"fmt"
	"os"
)

// Game 描述一款游戏的元数据，来自 games/games.json 清单文件。
type Game struct {
	ID          string `json:"id"`
	Type        string `json:"type"`  // "html5" | "python"
	Title       string `json:"title"` // 游戏名
	Badge       string `json:"badge"` // 卡片左上角徽章，如 "HTML5" / "Python"
	Meta        string `json:"meta"`  // 卡片右上角说明，如 "6-9 岁 · 难度 ★★"
	Description string `json:"description"`
	Status      string `json:"status"`     // "online" | "coming-soon"
	Entry       string `json:"entry"`      // html5: iframe 入口；python: main.py 源码地址
	Canvas      bool   `json:"canvas"`     // python 游戏是否显示画布（猜数字等控制台游戏为 false）
	EditorOpen  bool   `json:"editorOpen"` // python 游戏代码编辑器是否默认展开（海龟画图为 true）
}

// LoadManifest 读取游戏清单文件并按清单顺序返回全部游戏。
func LoadManifest(path string) ([]Game, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("读取游戏清单失败: %w", err)
	}
	var games []Game
	if err := json.Unmarshal(data, &games); err != nil {
		return nil, fmt.Errorf("解析游戏清单失败: %w", err)
	}
	return games, nil
}
