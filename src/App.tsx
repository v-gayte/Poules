import React from 'react';
import { useGameStore } from './stores/useGameStore';
import { useGameLoop } from './hooks/useGameLoop';
import { PhaserGame } from './components/PhaserGame';
import { RoomDetails } from './components/RoomDetails';

function App() {
  useGameLoop();
  
  const { 
    money, 
    research, 
    co2, 
    maxCo2, 
    energyUsage,
    energyCapacity,
    inspectedRoomId,
    setInspectedRoomId
  } = useGameStore();

  React.useEffect(() => {
    (window as any).cheat = () => {
      useGameStore.setState({ money: 1000000000 });
      console.log("🤑 RICH MODE ACTIVATED: +$1,000,000,000");
    };
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 text-white font-mono overflow-hidden relative">
      {/* HEADER / HUD */}
      <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
        <h1 className="text-xl font-bold text-green-400">Big Tech vs. School Tycoon</h1>
        
        <div className="flex gap-6">
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400">MONEY</span>
            <span className="text-lg text-yellow-400 font-bold">${money.toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400">ENERGY</span>
            <span className={`text-lg font-bold ${energyUsage > energyCapacity ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
                {energyUsage} / {energyCapacity} ⚡
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400">RESEARCH</span>
            <span className="text-lg text-purple-400 font-bold">{research} RP</span>
          </div>
          <div className="flex flex-col items-center w-32">
            <span className="text-xs text-gray-400">CO2 LEVEL</span>
            <div className="w-full bg-gray-700 h-2 rounded-full mt-1 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${co2 > maxCo2 ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min((co2 / maxCo2) * 100, 100)}%` }}
              />
            </div>
            <span className="text-xs mt-1">{co2.toFixed(0)} / {maxCo2}</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        {/* GAME VIEW (FULL SCREEN) */}
        <main className="flex-1 relative bg-black">
          <PhaserGame />
          
          {/* ROOM DETAILS PANEL */}
          {inspectedRoomId && (
            <RoomDetails roomId={inspectedRoomId} onClose={() => setInspectedRoomId(null)} />
          )}
        </main>

      </div>
    </div>
  );
}

export default App;
