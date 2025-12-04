// Utilitaires généraux

/**
 * Convertit une position de grille en coordonnées pixels
 */
export function gridToPixel(gridX: number, gridY: number, gridSize: number): { x: number; y: number } {
  return {
    x: gridX * gridSize,
    y: gridY * gridSize,
  }
}

/**
 * Convertit des coordonnées pixels en position de grille
 */
export function pixelToGrid(pixelX: number, pixelY: number, gridSize: number): { x: number; y: number } {
  return {
    x: Math.floor(pixelX / gridSize),
    y: Math.floor(pixelY / gridSize),
  }
}

/**
 * Formate un nombre avec des séparateurs de milliers
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('fr-FR')
}

