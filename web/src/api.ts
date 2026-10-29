import type { Game } from './types'

export async function fetchGames(type?: string): Promise<Game[]> {
  const q = type ? `?type=${encodeURIComponent(type)}` : ''
  const res = await fetch(`/api/v1/games${q}`)
  if (!res.ok) throw new Error(`加载游戏列表失败（${res.status}）`)
  const data = (await res.json()) as { games: Game[] }
  return data.games ?? []
}

export async function fetchGame(id: string): Promise<Game | null> {
  const res = await fetch(`/api/v1/games/${encodeURIComponent(id)}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`加载游戏信息失败（${res.status}）`)
  return (await res.json()) as Game
}

export async function fetchGameSource(entry: string): Promise<string> {
  const res = await fetch(entry)
  if (!res.ok) throw new Error(`加载游戏源码失败（${res.status}）`)
  return res.text()
}
