// Constantes du jeu

export const GRID_SIZE = 64 // Taille d'une case en pixels

export const BUILDING_COSTS: Record<string, number> = {
  farm_building: 500,
  feed_mill: 1000,
  processor: 2000,
  warehouse: 3000,
}

export const BUILDING_NAMES: Record<string, string> = {
  farm_building: 'Bâtiment de Ferme',
  feed_mill: 'Moulin à Grains',
  processor: 'Usine de Traitement',
  warehouse: 'Entrepôt',
}

