import { defineConfig } from 'vite'

// 开发期：前端跑在 5173，/api 与 /games 代理到 Go 服务(8080)，
// 这样 iframe 游戏与 Pyodide 加载的 Python 源码在开发/生产环境行为一致。
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
      '/games': 'http://localhost:8080',
    },
  },
})
