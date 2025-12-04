// Constantes du jeu

export const GRID_SIZE = 64 // Taille d'une case en pixels

export const BUILDING_COSTS: Record<string, number> = {
  chicken_coop: 500,
  feed_mill: 1000,
  egg_processor: 2000,
  warehouse: 3000,
}

export const BUILDING_NAMES: Record<string, string> = {
  chicken_coop: 'Poulailler',
  feed_mill: 'Moulin à Grains',
  egg_processor: 'Usine de Traitement',
  warehouse: 'Entrepôt',
}

