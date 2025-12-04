import { useEffect, useRef } from 'react'
import PhaserGame from './phaser/PhaserGame'
import HUD from './components/HUD/HUD'
import './App.css'

function App(): JSX.Element {
  const phaserGameRef = useRef<PhaserGame | null>(null)

  useEffect((): (() => void) => {
    // Initialiser Phaser
    phaserGameRef.current = new PhaserGame()

    // Cleanup à la destruction du composant
    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy()
        phaserGameRef.current = null
      }
    }
  }, [])

  return (
    <div className="app-container">
      {/* Canvas Phaser pour la map */}
      <div id="phaser-game" className="phaser-container" />
      
      {/* UI React par-dessus */}
      <HUD />
    </div>
  )
}

export default App

