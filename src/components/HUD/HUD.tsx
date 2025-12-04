import { useGameStore } from '../../stores/gameStore'

/**
 * Composant HUD (Heads-Up Display)
 * Affiche les informations du jeu (argent, énergie, CO2, etc.)
 */
export default function HUD(): JSX.Element {
  const { money, energy, co2, buildings } = useGameStore()

  return (
    <div className="hud-container">
      {/* Barre de ressources en haut */}
      <div className="hud-top-bar">
        <div className="resource-item">
          <span className="resource-label">💰 Argent:</span>
          <span className="resource-value">{money.toLocaleString()}</span>
        </div>
        <div className="resource-item">
          <span className="resource-label">⚡ Énergie:</span>
          <span className="resource-value">{energy}/100</span>
        </div>
        <div className="resource-item">
          <span className="resource-label">🌍 CO₂:</span>
          <span className="resource-value">{co2.toLocaleString()}</span>
        </div>
        <div className="resource-item">
          <span className="resource-label">🏗️ Bâtiments:</span>
          <span className="resource-value">{buildings.length}</span>
        </div>
      </div>

      {/* Menu latéral (à implémenter) */}
      <div className="hud-side-menu">
        {/* Ici, vous pouvez ajouter des boutons pour construire, etc. */}
      </div>
    </div>
  )
}

