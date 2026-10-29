export interface Game {
  id: string
  type: 'html5' | 'python'
  title: string
  badge: string
  meta: string
  description: string
  status: 'online' | 'coming-soon'
  entry: string
  /** python 游戏是否需要画布（控制台类游戏为 false） */
  canvas: boolean
  /** python 游戏代码编辑器是否默认展开 */
  editorOpen?: boolean
}
