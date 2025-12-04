import Phaser from 'phaser'
import { useGameStore } from '../../stores/gameStore'
import type { Building } from '../../types'

/**
 * Scene principale de Phaser
 * Gère uniquement l'affichage de la map et des bâtiments
 */
export default class MainScene extends Phaser.Scene {
  private buildings: Phaser.GameObjects.Group
  private gridGraphics?: Phaser.GameObjects.Graphics
  private gridSize = 64 // Taille d'une case en pixels

  constructor() {
    super({ key: 'MainScene' })
  }

  create(): void {
    // Créer la grille
    this.createGrid()

    // Groupe pour les bâtiments
    this.buildings = this.add.group()

    // Contrôles de la caméra (flèches directionnelles)
    const cursors = this.input.keyboard?.createCursorKeys()
    if (cursors) {
      // Contrôle manuel de la caméra
      this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
        const speed = 10
        if (event.key === 'ArrowLeft') {
          this.cameras.main.scrollX -= speed
        } else if (event.key === 'ArrowRight') {
          this.cameras.main.scrollX += speed
        } else if (event.key === 'ArrowUp') {
          this.cameras.main.scrollY -= speed
        } else if (event.key === 'ArrowDown') {
          this.cameras.main.scrollY += speed
        }
      })
    }

    // Zoom avec la molette
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: unknown[], _deltaX: number, deltaY: number) => {
      const currentZoom = this.cameras.main.zoom
      const newZoom = Phaser.Math.Clamp(currentZoom - deltaY * 0.001, 0.5, 2)
      this.cameras.main.setZoom(newZoom)
    })

    // Position initiale de la caméra
    this.cameras.main.setScroll(0, 0)

    // Écouter les changements du store pour mettre à jour l'affichage
    this.updateBuildingsDisplay()

    // S'abonner aux changements du store (via un intervalle pour l'instant)
    // Note: Dans un vrai projet, vous pourriez utiliser un système d'événements
    this.time.addEvent({
      delay: 100,
      callback: () => {
        this.updateBuildingsDisplay()
      },
      loop: true,
    })
  }

  private createGrid(): void {
    this.gridGraphics = this.add.graphics()
    this.drawGrid()
  }

  private drawGrid(): void {
    if (!this.gridGraphics) return

    const camera = this.cameras.main

    this.gridGraphics.clear()
    this.gridGraphics.lineStyle(1, 0x34495e, 0.3)

    // Calculer les limites visibles de la caméra
    const startX = Math.floor(camera.worldView.x / this.gridSize) * this.gridSize
    const startY = Math.floor(camera.worldView.y / this.gridSize) * this.gridSize
    const endX = camera.worldView.x + camera.worldView.width
    const endY = camera.worldView.y + camera.worldView.height

    // Dessiner les lignes verticales
    for (let x = startX; x <= endX; x += this.gridSize) {
      this.gridGraphics.moveTo(x, startY)
      this.gridGraphics.lineTo(x, endY)
    }

    // Dessiner les lignes horizontales
    for (let y = startY; y <= endY; y += this.gridSize) {
      this.gridGraphics.moveTo(startX, y)
      this.gridGraphics.lineTo(endX, y)
    }

    this.gridGraphics.strokePath()
  }

  private updateBuildingsDisplay(): void {
    const store = useGameStore.getState()
    
    // Supprimer tous les bâtiments existants
    this.buildings.clear(true, true)

    // Créer les sprites pour chaque bâtiment
    store.buildings.forEach((building) => {
      this.createBuildingSprite(building)
    })
  }

  private createBuildingSprite(building: Building): void {
    // Position en pixels
    const x = building.x * this.gridSize + this.gridSize / 2
    const y = building.y * this.gridSize + this.gridSize / 2

    // Créer un rectangle temporaire (à remplacer par de vrais sprites)
    const sprite = this.add.rectangle(x, y, this.gridSize - 4, this.gridSize - 4, 0x3498db)
    sprite.setInteractive()
    sprite.setData('buildingId', building.id)
    sprite.setData('building', building)

    // Ajouter un texte pour le niveau
    const levelText = this.add.text(x, y, building.level.toString(), {
      fontSize: '16px',
      color: '#ffffff',
    })
    levelText.setOrigin(0.5)

    this.buildings.add([sprite, levelText])

    // Événement de clic
    sprite.on('pointerdown', () => {
      console.log('Building clicked:', building)
      // Ici, vous pouvez ouvrir un menu d'upgrade via React
    })
  }

  update(): void {
    // Redessiner la grille si la caméra bouge
    if (this.gridGraphics) {
      this.drawGrid()
    }
  }
}

