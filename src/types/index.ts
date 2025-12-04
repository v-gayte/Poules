// Types globaux pour le jeu

export type BuildingType = 'chicken_coop' | 'feed_mill' | 'egg_processor' | 'warehouse'

export interface Building {
  id: string
  type: BuildingType
  x: number
  y: number
  level: number
}

export interface GameState {
  money: number
  energy: number
  buildings: Building[]
  co2: number
}

export interface GridPosition {
  x: number
  y: number
}

