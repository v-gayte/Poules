import React, { useState } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { 
  GENERATOR_LEVELS, 
  SERVER_ROOM_LEVELS, 
  SERVER_ASSETS, 
  TECH_TREE,
  CLASSROOM_LEVELS,
  CLASSROOM_PCS,
  GYM_LEVELS,
  GYM_QUESTIONS,
  GYM_ACTIVITIES,
  RESEARCH_LAB_LEVELS
} from '../config/gameConfig';

export const RoomDetails = ({ roomId, onClose }: { roomId: string, onClose: () => void }) => {
  const store = useGameStore();
  
  const isGenerator = roomId.startsWith('generator');
  const isServer = roomId.startsWith('server');
  const isClassroom = roomId.startsWith('classroom');
  const isGym = roomId.startsWith('gym');
  const isResearch = roomId.startsWith('research');

  // Local state for Gym QCM
  const [qcmAnswers, setQcmAnswers] = useState<Record<string, string>>({});

  if (isGenerator) {
    const level = store.generatorLevel;
    const config = GENERATOR_LEVELS[level - 1];
    const nextConfig = GENERATOR_LEVELS[level];

    return (
      <div className="absolute bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-6 flex gap-8 z-20 h-64">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-red-400 mb-2">{config.name} (Lvl {level})</h2>
          <p className="text-gray-400 mb-4">{config.description}</p>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gray-900 p-4 rounded border border-gray-600">
              <div className="text-sm text-gray-500">Current Capacity</div>
              <div className="text-3xl font-bold text-yellow-400">{config.capacity} ⚡</div>
            </div>
            {nextConfig && (
               <div className="text-gray-500">➜</div>
            )}
            {nextConfig && (
                <div className="bg-gray-900 p-4 rounded border border-gray-600 opacity-75">
                  <div className="text-sm text-gray-500">Next Level</div>
                  <div className="text-xl font-bold text-yellow-400">{nextConfig.capacity} ⚡</div>
                </div>
            )}
          </div>

          {nextConfig ? (
            <button 
                onClick={store.upgradeGenerator}
                disabled={store.money < nextConfig.cost * (1 - store.globalModifiers.costReduction)}
                className="px-6 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-bold transition-colors"
            >
                Upgrade System (${(nextConfig.cost * (1 - store.globalModifiers.costReduction)).toLocaleString()})
            </button>
          ) : (
            <div className="text-green-400 font-bold">MAX LEVEL REACHED</div>
          )}
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
      </div>
    );
  }

  if (isClassroom) {
    const level = store.classroomLevel;
    const config = CLASSROOM_LEVELS[level - 1];
    const nextConfig = CLASSROOM_LEVELS[level];

    return (
      <div className="absolute bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-6 flex gap-8 z-20 h-80 overflow-hidden">
        {/* LEFT: Room Stats */}
        <div className="w-1/3 border-r border-gray-700 pr-6">
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">{config.name} (Lvl {level})</h2>
          <p className="text-gray-400 mb-4">Manage your student PCs.</p>
          
          <div className="bg-gray-900 p-4 rounded border border-gray-600 mb-4">
              <div className="text-sm text-gray-500">Capacity</div>
              <div className="text-3xl font-bold text-white">{config.capacity} Slots</div>
          </div>

          {nextConfig ? (
            <button 
                onClick={store.upgradeClassroom}
                disabled={store.money < nextConfig.cost * (1 - store.globalModifiers.costReduction)}
                className="w-full py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-bold transition-colors"
            >
                Expand Room (${(nextConfig.cost * (1 - store.globalModifiers.costReduction)).toLocaleString()})
            </button>
          ) : (
            <div className="text-green-400 font-bold">MAX LEVEL REACHED</div>
          )}
        </div>

        {/* RIGHT: PC Slots */}
        <div className="flex-1 overflow-y-auto">
            <h3 className="font-bold text-gray-300 mb-4 sticky top-0 bg-gray-800 pb-2">Student PCs ({store.classroomSlots.filter(s => s).length}/{config.capacity})</h3>
            <div className="grid grid-cols-5 gap-3">
                {store.classroomSlots.map((slot, index) => {
                    if (slot) {
                        const pc = CLASSROOM_PCS[slot.level - 1];
                        const nextPc = CLASSROOM_PCS[slot.level];

                        return (
                            <div key={index} className="bg-gray-700 p-2 rounded border border-gray-600 relative group text-center">
                                <div className="text-2xl mb-1">{pc.icon}</div>
                                <div className="font-bold text-xs text-white truncate">{pc.name}</div>
                                <div className="text-[10px] text-green-400">+${pc.income}/s</div>
                                <div className="text-[10px] text-yellow-400">-{pc.energy}⚡</div>
                                
                                {nextPc && (
                                    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded p-1">
                                        <div className="text-[10px] text-gray-300 mb-1">Upgrade to {nextPc.name}</div>
                                        <button 
                                            onClick={() => store.upgradeClassroomPC(index)}
                                            disabled={store.money < nextPc.cost * (1 - store.globalModifiers.costReduction)}
                                            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded text-[10px] font-bold w-full"
                                        >
                                            ${(nextPc.cost * (1 - store.globalModifiers.costReduction)).toLocaleString()}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    } else {
                        const basePc = CLASSROOM_PCS[0];
                        return (
                            <div key={index} className="bg-gray-900/50 p-2 rounded border border-dashed border-gray-700 flex flex-col items-center justify-center gap-1 min-h-[80px] group cursor-pointer hover:bg-gray-800" onClick={() => store.buyClassroomPC(index)}>
                                <span className="text-xs text-gray-500">Empty</span>
                                <div className="text-xs text-green-400 font-bold">+ Buy</div>
                                <div className="text-[10px] text-gray-400">${(basePc.cost * (1 - store.globalModifiers.costReduction)).toLocaleString()}</div>
                            </div>
                        );
                    }
                })}
            </div>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
      </div>
    );
  }

  if (isGym) {
      const level = store.gymLevel;
      const config = GYM_LEVELS[level - 1];
      const nextConfig = GYM_LEVELS[level];
      const profile = store.gymProfile;

      const handleQcmSubmit = () => {
          if (qcmAnswers['q1'] && qcmAnswers['q2']) {
              store.setGymProfile({
                  goal: qcmAnswers['q1'],
                  frequency: qcmAnswers['q2']
              });
          }
      };

      const activity = profile ? GYM_ACTIVITIES[profile.goal as keyof typeof GYM_ACTIVITIES] : null;

      return (
        <div className="absolute bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-6 flex gap-8 z-20 h-80">
            <div className="flex-1 flex flex-col">
                <h2 className="text-2xl font-bold text-pink-400 mb-2">{config.name} (Lvl {level})</h2>
                <p className="text-gray-400 mb-4">{config.description}</p>

                {/* LEVEL 1: PROFILING */}
                {level === 1 && !profile && (
                    <div className="bg-gray-900 p-4 rounded border border-gray-600 flex-1 overflow-y-auto">
                        <h3 className="font-bold text-white mb-2">Profilage Utilisateur</h3>
                        {GYM_QUESTIONS.map(q => (
                            <div key={q.id} className="mb-3">
                                <div className="text-sm text-gray-300 mb-1">{q.text}</div>
                                <div className="flex gap-2">
                                    {q.options.map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => setQcmAnswers({...qcmAnswers, [q.id]: opt})}
                                            className={`px-3 py-1 text-xs rounded border ${qcmAnswers[q.id] === opt ? 'bg-pink-600 border-pink-400' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button 
                            onClick={handleQcmSubmit}
                            disabled={!qcmAnswers['q1'] || !qcmAnswers['q2']}
                            className="mt-2 w-full py-2 bg-pink-600 hover:bg-pink-500 disabled:bg-gray-700 rounded font-bold"
                        >
                            Valider le Profil
                        </button>
                    </div>
                )}

                {/* LEVEL 2+: COACHING */}
                {level >= 2 && profile && activity && (
                    <div className="bg-gray-900 p-4 rounded border border-gray-600 flex-1 flex flex-col gap-4">
                        <div className="flex items-start gap-4">
                            {/* LEVEL 3: VISUAL */}
                            {level >= 3 && (
                                <div className="text-6xl bg-gray-800 p-2 rounded">{activity.visual}</div>
                            )}
                            <div>
                                <h3 className="font-bold text-white">Votre Programme : {profile.goal}</h3>
                                <p className="text-gray-300 text-sm mt-1">{activity.text}</p>
                                
                                {/* LEVEL 4: MONETIZATION */}
                                {level >= 4 && (
                                    <a 
                                        href={activity.product.link} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="inline-block mt-2 text-xs text-blue-400 hover:text-blue-300 underline"
                                        onClick={(e) => { e.preventDefault(); store.performGymActivity(); }}
                                    >
                                        Sponsor: {activity.product.name} (Click for Bonus!)
                                    </a>
                                )}
                            </div>
                        </div>

                        <button 
                            onClick={store.performGymActivity}
                            className="mt-auto w-full py-3 bg-pink-600 hover:bg-pink-500 rounded font-bold text-white animate-pulse"
                        >
                            Faire la séance (+Reward)
                        </button>
                    </div>
                )}
                
                {/* UPGRADE BUTTON */}
                {nextConfig && (
                    <div className="mt-4 flex justify-end">
                         <button 
                            onClick={store.upgradeGym}
                            disabled={store.money < nextConfig.cost * (1 - store.globalModifiers.costReduction) || (level === 1 && !profile)}
                            className="px-6 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-bold transition-colors"
                        >
                            Upgrade to {nextConfig.name} (${(nextConfig.cost * (1 - store.globalModifiers.costReduction)).toLocaleString()})
                        </button>
                    </div>
                )}
            </div>
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
        </div>
      );
  }

  if (isResearch) {
      const level = store.researchLabLevel;
      const config = RESEARCH_LAB_LEVELS[level - 1];
      const nextConfig = RESEARCH_LAB_LEVELS[level];

      const categories = {
          'INFRA': 'Infrastructure',
          'ECOLOGY': 'Écologie',
          'ECONOMY': 'Économie'
      };

      return (
        <div className="absolute bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-6 flex gap-8 z-20 h-96 overflow-hidden">
            {/* LEFT: Lab Stats */}
            <div className="w-1/4 border-r border-gray-700 pr-6 overflow-y-auto">
                <h2 className="text-2xl font-bold text-cyan-400 mb-2">{config.name} (Lvl {level})</h2>
                <p className="text-gray-400 mb-4">{config.description}</p>
                
                <div className="bg-gray-900 p-4 rounded border border-gray-600 mb-4">
                    <div className="text-sm text-gray-500">Research Output</div>
                    <div className="text-3xl font-bold text-purple-400">+{config.rpGeneration} RP/s</div>
                </div>

                {nextConfig ? (
                    <button 
                        onClick={store.upgradeResearchLab}
                        disabled={store.money < nextConfig.cost * (1 - store.globalModifiers.costReduction)}
                        className="w-full py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-bold transition-colors"
                    >
                        Upgrade Lab (${(nextConfig.cost * (1 - store.globalModifiers.costReduction)).toLocaleString()})
                    </button>
                ) : (
                    <div className="text-green-400 font-bold">MAX LEVEL REACHED</div>
                )}
            </div>

            {/* RIGHT: Tech Tree */}
            <div className="flex-1 overflow-y-auto">
                <h3 className="font-bold text-gray-300 mb-4 sticky top-0 bg-gray-800 pb-2">Skill Tree</h3>
                
                <div className="grid grid-cols-3 gap-6">
                    {Object.entries(categories).map(([catKey, catName]) => (
                        <div key={catKey} className="flex flex-col gap-3">
                            <h4 className="font-bold text-gray-400 border-b border-gray-600 pb-1">{catName}</h4>
                            {TECH_TREE.filter(t => t.category === catKey).map(tech => {
                                const isUnlocked = store.unlockedTechs.includes(tech.id);
                                const isReqMet = tech.req ? store.unlockedTechs.includes(tech.req) : true;
                                const canUnlock = !isUnlocked && isReqMet && store.research >= tech.cost;

                                return (
                                    <div 
                                        key={tech.id} 
                                        className={`p-3 rounded border flex flex-col gap-1 relative
                                            ${isUnlocked ? 'bg-green-900/20 border-green-600' : 
                                              isReqMet ? 'bg-gray-700 border-gray-500' : 'bg-gray-800 border-gray-700 opacity-50'}
                                        `}
                                    >
                                        <div className="font-bold text-sm text-white">{tech.name}</div>
                                        <div className="text-xs text-gray-400">{tech.description}</div>
                                        <div className="text-xs text-purple-300 font-bold mt-1">{tech.cost} RP</div>
                                        
                                        {isUnlocked ? (
                                            <div className="absolute top-2 right-2 text-green-500">✔</div>
                                        ) : (
                                            <button 
                                                onClick={() => store.unlockTech(tech.id)}
                                                disabled={!canUnlock}
                                                className={`mt-2 py-1 px-2 rounded text-xs font-bold
                                                    ${canUnlock ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}
                                                `}
                                            >
                                                Unlock
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
        </div>
      );
  }

  if (isServer) {
    const level = store.serverRoomLevel;
    const config = SERVER_ROOM_LEVELS[level - 1];
    const nextConfig = SERVER_ROOM_LEVELS[level];
    
    const techReq = nextConfig?.techReq ? TECH_TREE.find(t => t.id === nextConfig.techReq) : null;
    const isTechUnlocked = techReq ? store.unlockedTechs.includes(techReq.id) : true;
    const canUpgrade = nextConfig && store.money >= nextConfig.cost * (1 - store.globalModifiers.costReduction) && isTechUnlocked && store.energyCapacity >= nextConfig.energyReq;

    return (
      <div className="absolute bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-6 flex gap-8 z-20 h-80 overflow-hidden">
        {/* LEFT: Room Stats */}
        <div className="w-1/3 border-r border-gray-700 pr-6 overflow-y-auto">
          <h2 className="text-2xl font-bold text-blue-400 mb-1">{config.name} (Lvl {level})</h2>
          <div className="text-sm text-gray-400 mb-4">
            GAFAM Tax: <span className="text-red-400">{(config.taxRate * 100).toFixed(0)}%</span> | 
            Energy: <span className="text-yellow-400">{config.energyReq}⚡</span>
          </div>

          {nextConfig ? (
            <div className="bg-gray-900 p-4 rounded border border-gray-600 mb-4">
              <h3 className="font-bold text-gray-300 mb-2">Next Upgrade: {nextConfig.name}</h3>
              <ul className="text-sm space-y-1 mb-3">
                <li className={store.money >= nextConfig.cost * (1 - store.globalModifiers.costReduction) ? 'text-green-400' : 'text-red-400'}>
                    • Cost: ${(nextConfig.cost * (1 - store.globalModifiers.costReduction)).toLocaleString()}
                </li>
                <li className={store.energyCapacity >= nextConfig.energyReq ? 'text-green-400' : 'text-red-400'}>
                    • Energy Cap: {nextConfig.energyReq}⚡ (Have {store.energyCapacity})
                </li>
                {techReq && (
                    <li className={isTechUnlocked ? 'text-green-400' : 'text-red-400'}>
                        • Tech: {techReq.name}
                    </li>
                )}
              </ul>
              <button 
                onClick={store.upgradeServerRoom}
                disabled={!canUpgrade}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded font-bold"
              >
                Upgrade Room
              </button>
            </div>
          ) : (
            <div className="text-blue-400 font-bold mb-4">MAX LEVEL REACHED</div>
          )}
        </div>

        {/* RIGHT: Slots & Servers */}
        <div className="flex-1 overflow-y-auto">
            <h3 className="font-bold text-gray-300 mb-4 sticky top-0 bg-gray-800 pb-2">Server Slots ({store.serverSlots.filter(s => s).length}/{config.slots})</h3>
            <div className="grid grid-cols-4 gap-3">
                {store.serverSlots.map((slot, index) => {
                    if (slot) {
                        const asset = SERVER_ASSETS[slot.typeId];
                        const grade = asset.grades.find(g => g.grade === slot.grade)!;
                        const nextGrade = asset.grades.find(g => g.grade === slot.grade + 1);
                        
                        return (
                            <div key={index} className="bg-gray-700 p-3 rounded border border-gray-600 relative group">
                                <div className="font-bold text-sm text-white">{asset.name}</div>
                                <div className="text-xs text-blue-300">{grade.name} (G{slot.grade})</div>
                                <div className="text-xs text-green-400 mt-1">+${grade.income}/t</div>
                                <div className="text-xs text-gray-400">{grade.co2} CO2</div>
                                
                                {nextGrade && (
                                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                        <button 
                                            onClick={() => store.upgradeServer(index)}
                                            disabled={store.money < nextGrade.upgradeCost * (1 - store.globalModifiers.costReduction)}
                                            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs font-bold"
                                        >
                                            Upgrade ${(nextGrade.upgradeCost * (1 - store.globalModifiers.costReduction)).toLocaleString()}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    } else {
                        return (
                            <div key={index} className="bg-gray-900/50 p-3 rounded border border-dashed border-gray-700 flex flex-col items-center justify-center gap-2 min-h-[100px]">
                                <span className="text-xs text-gray-500">Empty Slot</span>
                                <div className="flex flex-col gap-1 w-full">
                                    {Object.values(SERVER_ASSETS).map(asset => (
                                        <button
                                            key={asset.id}
                                            onClick={() => store.buyServer(asset.id)}
                                            disabled={store.money < asset.baseCost * (1 - store.globalModifiers.costReduction) || store.serverRoomLevel < asset.minRoomLevel}
                                            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-[10px] rounded text-left truncate"
                                            title={`${asset.name} ($${(asset.baseCost * (1 - store.globalModifiers.costReduction)).toLocaleString()})`}
                                        >
                                            {asset.name} (${(asset.baseCost * (1 - store.globalModifiers.costReduction)).toLocaleString()})
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    }
                })}
            </div>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
      </div>
    );
  }

  return null;
};
