import Phaser from 'phaser'
import MainScene from './scenes/MainScene'

/**
 * Classe principale qui gère l'instance Phaser
 * Note : Phaser ne gère QUE l'affichage. La logique du jeu est dans Zustand.
 */
export default class PhaserGame {
  private game: Phaser.Game | null = null

  constructor() {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: 'phaser-game',
      backgroundColor: '#2c3e50',
      scene: [MainScene],
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
    }

    this.game = new Phaser.Game(config)

    // Redimensionner la fenêtre
    window.addEventListener('resize', () => {
      if (this.game) {
        this.game.scale.resize(window.innerWidth, window.innerHeight)
      }
    })
  }

  public destroy(): void {
    if (this.game) {
      this.game.destroy(true)
      this.game = null
    }
  }

  public getGame(): Phaser.Game | null {
    return this.game
  }
}

