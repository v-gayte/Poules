import React, { useState } from 'react'
import { useGameStore } from '../stores/useGameStore'
import {
  GENERATOR_LEVELS,
  SERVER_ROOM_LEVELS,
  SERVER_ASSETS,
  TECH_TREE,
  CLASSROOM_LEVELS,
  CLASSROOM_PCS,
  NETWORK_EQUIPMENT,
  TEACHERS,
  COOLING_SYSTEMS,
  BACKUP_SYSTEMS,
  GYM_LEVELS,
  GYM_QUESTIONS,
  GYM_ACTIVITIES,
  LAB_SECTIONS,
} from '../config/gameConfig'

export const RoomDetails = ({ roomId, onClose }: { roomId: string; onClose: () => void }) => {
  const store = useGameStore()
  const [selectedSection, setSelectedSection] = useState<string | null>(null)

  const isGenerator = roomId.startsWith('generator')
  const isServer = roomId.startsWith('server')
  const isClassroom = roomId.startsWith('classroom')
  const isGym = roomId.startsWith('gym')
  const isResearch = roomId.startsWith('research')

  // Local state for Gym QCM
  const [qcmAnswers, setQcmAnswers] = useState<Record<string, string>>({})

  // Drag to scroll state for Tech Tree
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
    setStartY(e.pageY - scrollContainerRef.current.offsetTop)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
    setScrollTop(scrollContainerRef.current.scrollTop)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const y = e.pageY - scrollContainerRef.current.offsetTop
    const walkX = (x - startX) * 1.5 // Scroll-fast
    const walkY = (y - startY) * 1.5
    scrollContainerRef.current.scrollLeft = scrollLeft - walkX
    scrollContainerRef.current.scrollTop = scrollTop - walkY
  }

  if (isGenerator) {
    const level = store.generatorLevel
    const config = GENERATOR_LEVELS[level - 1]
    const nextConfig = GENERATOR_LEVELS[level]

    return (
      <div className="absolute bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-6 flex gap-8 z-20 h-64">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-red-400 mb-2">
            {config.name} (Lvl {level})
          </h2>
          <p className="text-gray-400 mb-4">{config.description}</p>

          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gray-900 p-4 rounded border border-gray-600">
              <div className="text-sm text-gray-500">Current Capacity</div>
              <div className="text-3xl font-bold text-yellow-400">{config.capacity} ⚡</div>
            </div>
            {nextConfig && <div className="text-gray-500">➜</div>}
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
              Upgrade System ($
              {(nextConfig.cost * (1 - store.globalModifiers.costReduction)).toLocaleString()})
            </button>
          ) : (
            <div className="text-green-400 font-bold">MAX LEVEL REACHED</div>
          )}
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          ✕
        </button>
      </div>
    )
  }

  if (isClassroom) {
    const classroomData = store.classrooms[roomId]
    // Fallback if data missing (should not happen if initialized correctly)
    if (!classroomData) {
        return (
             <div className="absolute bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-6 flex items-center justify-center z-20 h-96">
                <span className="text-red-500">Error: Classroom data not found for {roomId}</span>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
             </div>
        )
    }

    const { level, classroomSlots, networkSlots, teacherSlots } = classroomData
    const config = CLASSROOM_LEVELS[level - 1]
    const nextConfig = CLASSROOM_LEVELS[level]

    return (
      <div className="absolute bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-6 flex gap-8 z-20 h-96 overflow-hidden">
        {/* LEFT: Room Stats */}
        <div className="w-1/3 border-r border-gray-700 pr-6 overflow-y-auto">
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">
            {config.name} (Lvl {level})
          </h2>
          <p className="text-gray-400 mb-4">Manage your student PCs and network.</p>

          <div className="bg-gray-900 p-4 rounded border border-gray-600 mb-4">
            <div className="text-sm text-gray-500">PC Capacity</div>
            <div className="text-3xl font-bold text-white">8 Slots</div>
          </div>

          {networkSlots.length > 0 && (
            <div className="bg-gray-900 p-4 rounded border border-gray-600 mb-4">
              <div className="text-sm text-gray-500">Network Slots</div>
              <div className="text-3xl font-bold text-white">{networkSlots.length} / 1</div>
            </div>
          )}

          {teacherSlots.length > 0 && (
            <div className="bg-gray-900 p-4 rounded border border-gray-600 mb-4">
              <div className="text-sm text-gray-500">Teacher Slots</div>
              <div className="text-3xl font-bold text-white">{teacherSlots.length} / 3</div>
            </div>
          )}

          {networkSlots.length === 0 ? (
            nextConfig ? (
              <button
                onClick={() => store.upgradeClassroom(roomId)}
                disabled={
                  store.money < nextConfig.cost * (1 - store.globalModifiers.costReduction) ||
                  !!(nextConfig.techReq && !store.unlockedTechs.includes(nextConfig.techReq))
                }
                className="w-full py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-bold transition-colors relative group"
              >
                Add Network Slot ($
                {(nextConfig.cost * (1 - store.globalModifiers.costReduction)).toLocaleString()})
              </button>
            ) : (
              <div className="text-green-400 font-bold">MAX LEVEL REACHED</div>
            )
          ) : teacherSlots.length < 3 ? (
            <button
              onClick={() => store.upgradeClassroom(roomId)}
              disabled={
                store.money <
                  (nextConfig
                    ? nextConfig.cost * (1 - store.globalModifiers.costReduction)
                    : CLASSROOM_LEVELS[level - 1].cost *
                      (1 - store.globalModifiers.costReduction)) ||
                !!(nextConfig?.techReq && !store.unlockedTechs.includes(nextConfig.techReq))
              }
              className="w-full py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-bold transition-colors"
            >
              Add Teacher Slot ($
              {(
                (nextConfig ? nextConfig.cost : CLASSROOM_LEVELS[level - 1].cost) *
                (1 - store.globalModifiers.costReduction)
              ).toLocaleString()}
              )
            </button>
          ) : (
            <div className="text-green-400 font-bold">SALLE AU MAXIMUM</div>
          )}
        </div>

        {/* RIGHT: PC Slots & Network */}
        <div className="flex-1 overflow-y-auto">
          <div className="sticky top-0 bg-gray-800 z-10 pb-2 mb-4">
            <h3 className="font-bold text-gray-300">
              Student PCs ({classroomSlots.filter((s) => s).length}/8)
            </h3>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {classroomSlots.map((slot, index) => {
              if (slot) {
                const pc = CLASSROOM_PCS[slot.level - 1]
                const nextPc = CLASSROOM_PCS[slot.level]

                return (
                  <div
                    key={index}
                    className="bg-gray-700 p-2 rounded border border-gray-600 relative group text-center z-0"
                  >
                    <div className="text-2xl mb-1">{pc.icon}</div>
                    <div className="font-bold text-xs text-white truncate">{pc.name}</div>
                    <div className="text-[10px] text-green-400">+${pc.income}/s</div>
                    <div className="text-[10px] text-yellow-400">+{pc.energy}⚡</div>
                    <div className="text-[10px] text-red-400">+{pc.co2} CO₂</div>

                    {nextPc && (
                      <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded p-1 z-10">
                        <div className="text-[10px] text-gray-300 mb-1">
                          Upgrade to {nextPc.name}
                        </div>
                        <div className="text-[10px] text-yellow-400 mb-1">
                          +{nextPc.energy - pc.energy}⚡
                        </div>
                        <div className="text-[10px] text-red-400 mb-1">
                          +{nextPc.co2 - pc.co2} CO₂
                        </div>
                        <button
                          onClick={() => store.upgradeClassroomPC(roomId, index)}
                          disabled={
                            store.money < nextPc.cost * (1 - store.globalModifiers.costReduction)
                          }
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded text-[10px] font-bold w-full"
                        >
                          $
                          {(
                            nextPc.cost *
                            (1 - store.globalModifiers.costReduction)
                          ).toLocaleString()}
                        </button>
                      </div>
                    )}
                  </div>
                )
              } else {
                const basePc = CLASSROOM_PCS[0]
                return (
                  <div
                    key={index}
                    className={`bg-gray-900/50 p-2 rounded border border-dashed border-gray-700 flex flex-col items-center justify-center gap-1 min-h-[80px] group cursor-pointer hover:bg-gray-800 relative ${
                      basePc.techReq && !store.unlockedTechs.includes(basePc.techReq)
                        ? 'opacity-50 pointer-events-none'
                        : ''
                    }`}
                    onClick={() => store.buyClassroomPC(roomId, index)}
                  >
                    {basePc.techReq && !store.unlockedTechs.includes(basePc.techReq) && (
                      <div className="absolute inset-0 flex items-center justify-center z-10 text-[10px] text-red-500 font-bold bg-black/80 rounded">
                        Locked: {basePc.techReq}
                      </div>
                    )}
                    <span className="text-xs text-gray-500">Empty</span>
                    <div className="text-xs text-green-400 font-bold">+ Buy</div>
                    <div className="text-[10px] text-gray-400">
                      ${(basePc.cost * (1 - store.globalModifiers.costReduction)).toLocaleString()}
                    </div>
                  </div>
                )
              }
            })}
          </div>

          {/* Network Equipment Slots - Only show if at least one slot exists */}
          {networkSlots.length > 0 && (
            <>
              <div className="sticky top-0 bg-gray-800 z-10 pb-2 mb-4 mt-6">
                <h3 className="font-bold text-gray-300">
                  Network Equipment ({networkSlots.filter((s) => s).length}/4)
                </h3>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: 4 }, (_, index) => {
                  const slot = networkSlots[index] || null
                  if (slot) {
                    const network = NETWORK_EQUIPMENT[slot.level - 1]
                    const nextNetwork = NETWORK_EQUIPMENT[slot.level]

                    return (
                      <div
                        key={index}
                        className="bg-gray-700 p-2 rounded border border-gray-600 relative group text-center z-0"
                      >
                        <div className="text-2xl mb-1">{network.icon}</div>
                        <div className="font-bold text-xs text-white truncate">{network.name}</div>
                        <div className="text-[10px] text-green-400">+${network.income}/s</div>
                        <div className="text-[10px] text-yellow-400">+{network.energy}⚡</div>

                        {nextNetwork && (
                          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded p-1 z-10">
                            <div className="text-[10px] text-gray-300 mb-1">
                              Upgrade to {nextNetwork.name}
                            </div>
                            <div className="text-[10px] text-green-400 mb-1">
                              +${nextNetwork.income - network.income}/s
                            </div>
                            <div className="text-[10px] text-yellow-400 mb-1">
                              +{nextNetwork.energy - network.energy}⚡
                            </div>
                            <button
                              onClick={() => store.upgradeNetwork(roomId, index)}
                              disabled={
                                store.money <
                                nextNetwork.cost * (1 - store.globalModifiers.costReduction)
                              }
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded text-[10px] font-bold w-full"
                            >
                              $
                              {(
                                nextNetwork.cost *
                                (1 - store.globalModifiers.costReduction)
                              ).toLocaleString()}
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  } else {
                    const baseNetwork = NETWORK_EQUIPMENT[0]
                    return (
                      <div
                        key={index}
                        className={`bg-gray-900/50 p-2 rounded border border-dashed border-gray-700 flex flex-col items-center justify-center gap-1 min-h-[80px] group cursor-pointer hover:bg-gray-800 relative ${
                          baseNetwork.techReq && !store.unlockedTechs.includes(baseNetwork.techReq)
                            ? 'opacity-50 pointer-events-none'
                            : ''
                        }`}
                        onClick={() => store.buyNetwork(roomId, index)}
                      >
                        {baseNetwork.techReq &&
                          !store.unlockedTechs.includes(baseNetwork.techReq) && (
                            <div className="absolute inset-0 flex items-center justify-center z-10 text-[10px] text-red-500 font-bold bg-black/80 rounded">
                              Locked: {baseNetwork.techReq}
                            </div>
                          )}
                        <span className="text-xs text-gray-500">Empty</span>
                        <div className="text-xs text-green-400 font-bold">+ Buy</div>
                        <div className="text-[10px] text-gray-400">
                          $
                          {(
                            baseNetwork.cost *
                            (1 - store.globalModifiers.costReduction)
                          ).toLocaleString()}
                        </div>
                      </div>
                    )
                  }
                })}
              </div>
            </>
          )}

          {/* Teachers Slots - Only show if at least one slot exists */}
          {teacherSlots.length > 0 && (
            <>
              <div className="sticky top-0 bg-gray-800 z-10 pb-2 mb-4 mt-6">
                <h3 className="font-bold text-gray-300">
                  Teachers ({teacherSlots.filter((s) => s).length}/3)
                </h3>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: 3 }, (_, index) => {
                  const slot = teacherSlots[index] || null
                  if (slot) {
                    const teacher = TEACHERS[slot.level - 1]
                    const nextTeacher = TEACHERS[slot.level]

                    return (
                      <div
                        key={index}
                        className="bg-gray-700 p-2 rounded border border-gray-600 relative group text-center z-0"
                      >
                        <div className="text-2xl mb-1">{teacher.icon}</div>
                        <div className="font-bold text-xs text-white truncate">{teacher.name}</div>
                        <div className="text-[10px] text-green-400">+${teacher.income}/s</div>
                        <div className="text-[10px] text-yellow-400">+{teacher.energy}⚡</div>

                        {nextTeacher && (
                          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded p-1 z-10">
                            <div className="text-[10px] text-gray-300 mb-1">
                              Upgrade to {nextTeacher.name}
                            </div>
                            <div className="text-[10px] text-green-400 mb-1">
                              +${nextTeacher.income - teacher.income}/s
                            </div>
                            <div className="text-[10px] text-yellow-400 mb-1">
                              +{nextTeacher.energy - teacher.energy}⚡
                            </div>
                            <button
                              onClick={() => store.upgradeTeacher(roomId, index)}
                              disabled={
                                store.money <
                                nextTeacher.cost * (1 - store.globalModifiers.costReduction)
                              }
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded text-[10px] font-bold w-full"
                            >
                              $
                              {(
                                nextTeacher.cost *
                                (1 - store.globalModifiers.costReduction)
                              ).toLocaleString()}
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  } else {
                    const baseTeacher = TEACHERS[0]
                    return (
                      <div
                        key={index}
                        className={`bg-gray-900/50 p-2 rounded border border-dashed border-gray-700 flex flex-col items-center justify-center gap-1 min-h-[80px] group cursor-pointer hover:bg-gray-800 relative ${
                          baseTeacher.techReq && !store.unlockedTechs.includes(baseTeacher.techReq)
                            ? 'opacity-50 pointer-events-none'
                            : ''
                        }`}
                        onClick={() => store.buyTeacher(roomId, index)}
                      >
                        {baseTeacher.techReq &&
                          !store.unlockedTechs.includes(baseTeacher.techReq) && (
                            <div className="absolute inset-0 flex items-center justify-center z-10 text-[10px] text-red-500 font-bold bg-black/80 rounded">
                              Locked: {baseTeacher.techReq}
                            </div>
                          )}
                        <span className="text-xs text-gray-500">Empty</span>
                        <div className="text-xs text-green-400 font-bold">+ Buy</div>
                        <div className="text-[10px] text-gray-400">
                          $
                          {(
                            baseTeacher.cost *
                            (1 - store.globalModifiers.costReduction)
                          ).toLocaleString()}
                        </div>
                      </div>
                    )
                  }
                })}
              </div>
            </>
          )}
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          ✕
        </button>
      </div>
    )
  }

  if (isGym) {
    const level = store.gymLevel
    const config = GYM_LEVELS[level - 1]
    const nextConfig = GYM_LEVELS[level]
    const profile = store.gymProfile

    const handleQcmSubmit = () => {
      if (qcmAnswers['q1'] && qcmAnswers['q2']) {
        store.setGymProfile({
          goal: qcmAnswers['q1'],
          frequency: qcmAnswers['q2'],
        })
      }
    }

    const activity = profile ? GYM_ACTIVITIES[profile.goal as keyof typeof GYM_ACTIVITIES] : null

    return (
      <div className="absolute bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-6 flex gap-8 z-20 h-80">
        <div className="flex-1 flex flex-col">
          <h2 className="text-2xl font-bold text-pink-400 mb-2">
            {config.name} (Lvl {level})
          </h2>
          <p className="text-gray-400 mb-4">{config.description}</p>

          {/* LEVEL 1: PROFILING */}
          {level === 1 && !profile && (
            <div className="bg-gray-900 p-4 rounded border border-gray-600 flex-1 overflow-y-auto">
              <h3 className="font-bold text-white mb-2">Profilage Utilisateur</h3>
              {GYM_QUESTIONS.map((q) => (
                <div key={q.id} className="mb-3">
                  <div className="text-sm text-gray-300 mb-1">{q.text}</div>
                  <div className="flex gap-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setQcmAnswers({ ...qcmAnswers, [q.id]: opt })}
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
                      onClick={(e) => {
                        e.preventDefault()
                        store.performGymActivity()
                      }}
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
                disabled={
                  store.money < nextConfig.cost * (1 - store.globalModifiers.costReduction) ||
                  (level === 1 && !profile) ||
                  !!(nextConfig.techReq && !store.unlockedTechs.includes(nextConfig.techReq))
                }
                className="px-6 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-bold transition-colors"
              >
                Upgrade to {nextConfig.name} ($
                {(nextConfig.cost * (1 - store.globalModifiers.costReduction)).toLocaleString()})
              </button>
            </div>
          )}
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          ✕
        </button>
      </div>
    )
  }

  if (isResearch) {
    const sections = LAB_SECTIONS
    const totalRp = Object.entries(store.labSectionLevels || {}).reduce((acc, [id, lvl]) => {
      const sect = sections[id]
      return acc + (sect && lvl > 0 ? sect.baseRp * lvl : 0)
    }, 0)

    if (!selectedSection) {
      return (
        <div className="absolute bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 flex flex-col z-20 h-[550px] overflow-hidden shadow-2xl p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                Laboratoire de Recherche
              </h2>
              <p className="text-gray-400 text-sm">
                Gérez vos sections de recherche pour débloquer des technologies.
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 uppercase font-bold">Production Totale</div>
              <div className="text-4xl font-mono text-purple-400">+{totalRp} RP/s</div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-4 gap-6 h-full overflow-y-auto pb-10">
            {Object.entries(sections).map(([id, section]) => {
              const level = store.labSectionLevels[id] || 0
              const isUnlocked = level > 0
              const nextCost = Math.floor(
                section.baseCost * Math.pow(section.costMultiplier, level)
              )
              const rpOutput = section.baseRp * level

              return (
                <div
                  key={id}
                  className={`relative rounded-xl border-2 p-4 flex flex-col gap-3 transition-colors ${
                    isUnlocked
                      ? 'bg-gray-800 border-gray-600'
                      : 'bg-gray-900/50 border-gray-800 border-dashed hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-4xl bg-gray-900 p-3 rounded-lg shadow-inner">
                      {section.icon}
                    </div>
                    <div>
                      <div className={`font-bold text-lg ${section.color}`}>{section.name}</div>
                      <div className="text-xs text-gray-400 font-mono">Niveau {level}</div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 h-10 overflow-hidden">
                    {section.description}
                  </p>

                  <div className="mt-auto flex flex-col gap-2">
                    {isUnlocked ? (
                      <>
                        <div className="flex justify-between text-xs font-mono bg-black/30 p-2 rounded">
                          <span>Total Output:</span>
                          <span className="text-purple-300">+{rpOutput} RP/s</span>
                        </div>

                        {/* Button 1: UPGRADE */}
                        <button
                          onClick={() => store.upgradeLabSection(id)}
                          disabled={store.money < nextCost}
                          className="w-full py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-xs font-bold rounded flex justify-between px-3 items-center border border-gray-600 hover:border-green-500 transition-all group"
                        >
                          <span>AMÉLIORER</span>
                          <span
                            className={`${
                              store.money >= nextCost ? 'text-green-400' : 'text-red-400'
                            } group-hover:text-green-300`}
                          >
                            ${nextCost.toLocaleString()}
                          </span>
                        </button>

                        {/* Button 2: ENTER LAB (Primary Action) */}
                        <button
                          onClick={() => setSelectedSection(id)}
                          className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <span>OUVRIR L'ARBRE</span>
                          <span>➜</span>
                        </button>
                      </>
                    ) : (
                      /* UNLOCK BUTTON */
                      <button
                        onClick={() => store.upgradeLabSection(id)}
                        disabled={store.money < nextCost}
                        className="w-full py-4 mt-2 bg-green-700 hover:bg-green-600 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold rounded shadow-lg uppercase tracking-wider"
                      >
                        Débloquer (${nextCost.toLocaleString()})
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )
    } else {
      // --- VIEW 2: TECH TREE ---
      const section = LAB_SECTIONS[selectedSection]
      // Calculate grid size
      const gridCellSize = 180
      const padding = 50

      // Helper to get coordinates
      const getCoords = (x: number, y: number) => ({
        left: x * gridCellSize + padding,
        top: y * gridCellSize + padding,
      })

      return (
        <div className="absolute bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 flex z-20 h-[500px] overflow-hidden shadow-2xl">
          {/* HEADER BAR */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gray-800/90 backdrop-blur border-b border-gray-700 flex items-center px-6 z-30 justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedSection(null)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white font-bold flex items-center gap-2"
              >
                <span>⬅</span> Retour au Dashboard
              </button>
              <div className="h-8 w-px bg-gray-600 mx-2"></div>
              <h2 className={`text-2xl font-bold ${section.color}`}>{section.name}</h2>
            </div>
            <div className="text-purple-400 font-bold font-mono">
              Research Points: {store.research.toLocaleString()}
            </div>
          </div>

          {/* VISUAL TECH TREE */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-auto relative bg-[#0a0a14] custom-scrollbar cursor-grab active:cursor-grabbing select-none mt-16"
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            <div className="min-w-[2600px] min-h-[1600px] relative">
              {/* 1. Connections (SVG Layer) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#4b5563" />
                  </marker>
                  <marker
                    id="arrowhead-active"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#a855f7" />
                  </marker>
                </defs>
                {TECH_TREE.filter(
                  (t) =>
                    t.category.toLowerCase() === selectedSection ||
                    (selectedSection === 'infra' &&
                      ['ecology', 'economy'].includes(t.category.toLowerCase()))
                ).map((tech) =>
                  tech.reqs.map((reqId) => {
                    const reqNode = TECH_TREE.find((t) => t.id === reqId)
                    if (!reqNode) return null

                    const start = getCoords(reqNode.position.x, reqNode.position.y)
                    const end = getCoords(tech.position.x, tech.position.y)
                    const offset = 60
                    const isUnlocked = store.unlockedTechs.includes(tech.id)
                    const isReqMet = store.unlockedTechs.includes(reqId)

                    return (
                      <line
                        key={`${reqId}-${tech.id}`}
                        x1={start.left + offset}
                        y1={start.top + offset}
                        x2={end.left + offset}
                        y2={end.top + offset}
                        stroke={isReqMet ? '#a855f7' : '#374151'}
                        strokeWidth={2}
                        strokeDasharray={isReqMet ? '0' : '5,5'}
                        markerEnd={isReqMet ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                        opacity={0.6}
                      />
                    )
                  })
                )}
              </svg>

              {/* 2. Nodes */}
              {TECH_TREE.filter(
                (t) =>
                  t.category.toLowerCase() === selectedSection ||
                  (selectedSection === 'infra' &&
                    ['ecology', 'economy'].includes(t.category.toLowerCase()))
              ).map((tech) => {
                const { left, top } = getCoords(tech.position.x, tech.position.y)
                const isUnlocked = store.unlockedTechs.includes(tech.id)
                const isReqMet = tech.reqs.every((r) => store.unlockedTechs.includes(r))
                const canUnlock = !isUnlocked && isReqMet && store.research >= tech.cost

                return (
                  <div
                    key={tech.id}
                    style={{ left, top }}
                    className={`absolute w-[120px] p-2 rounded-lg border-2 flex flex-col gap-1 transition-all duration-300 z-10 group
                      ${
                        isUnlocked
                          ? 'bg-purple-900/40 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                          : isReqMet
                            ? canUnlock
                              ? 'bg-gray-800 border-gray-400 hover:border-white hover:shadow-lg cursor-pointer'
                              : 'bg-gray-800 border-gray-600 opacity-80'
                            : 'bg-gray-900 border-gray-800 opacity-50 grayscale'
                      }
                    `}
                  >
                    <div className="text-[10px] font-bold text-gray-500 uppercase">
                      {tech.category}
                    </div>
                    <div
                      className={`font-bold text-xs leading-tight ${
                        isUnlocked ? 'text-white' : 'text-gray-300'
                      }`}
                    >
                      {tech.name}
                    </div>

                    {!isUnlocked && (
                      <div
                        className={`text-[10px] font-mono mt-1 ${
                          canUnlock ? 'text-purple-300' : 'text-gray-500'
                        }`}
                      >
                        {tech.cost} RP
                      </div>
                    )}

                    {isUnlocked && (
                      <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-md">
                        ✓
                      </div>
                    )}

                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-3 bg-black/90 border border-gray-700 text-white text-xs rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                      <p className="font-bold mb-1 text-purple-300">{tech.name}</p>
                      <p className="text-gray-300 mb-2">{tech.description}</p>
                      <div className="border-t border-gray-800 pt-1 mt-1 flex justify-between text-[10px] text-gray-500">
                        <span>Cost: {tech.cost} RP</span>
                        <span>ID: {tech.id}</span>
                      </div>
                    </div>

                    {canUnlock && (
                      <button
                        onClick={() => store.unlockTech(tech.id)}
                        className="absolute inset-0 bg-purple-600/10 hover:bg-purple-600/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all font-bold text-xs text-white uppercase tracking-wider backdrop-blur-[1px]"
                      >
                        Unlock
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )
    }
  }

  if (isServer) {
    const level = store.serverRoomLevel
    const config = SERVER_ROOM_LEVELS[level - 1]
    const nextConfig = SERVER_ROOM_LEVELS[level]

    const techReq = nextConfig?.techReq ? TECH_TREE.find((t) => t.id === nextConfig.techReq) : null
    const isTechUnlocked = techReq ? store.unlockedTechs.includes(techReq.id) : true
    const canUpgrade =
      nextConfig &&
      store.money >= nextConfig.cost * (1 - store.globalModifiers.costReduction) &&
      isTechUnlocked &&
      store.energyCapacity >= nextConfig.energyReq

    return (
      <div className="absolute bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-6 flex gap-8 z-20 h-96 overflow-hidden">
        {/* LEFT: Room Stats */}
        <div className="w-1/3 border-r border-gray-700 pr-6 overflow-y-auto">
          <h2 className="text-2xl font-bold text-blue-400 mb-2">
            {config.name} (Lvl {level})
          </h2>
          <p className="text-gray-400 mb-4">Manage your server infrastructure.</p>

          <div className="bg-gray-900 p-4 rounded border border-gray-600 mb-4">
            <div className="text-sm text-gray-500">Server Capacity</div>
            <div className="text-3xl font-bold text-white">30 Slots</div>
          </div>

          {store.coolingSlots.length > 0 && (
            <div className="bg-gray-900 p-4 rounded border border-gray-600 mb-4">
              <div className="text-sm text-gray-500">Cooling Slots</div>
              <div className="text-3xl font-bold text-white">{store.coolingSlots.length} / 1</div>
            </div>
          )}

          {store.backupSlots.length > 0 && (
            <div className="bg-gray-900 p-4 rounded border border-gray-600 mb-4">
              <div className="text-sm text-gray-500">Backup Slots</div>
              <div className="text-3xl font-bold text-white">{store.backupSlots.length} / 3</div>
            </div>
          )}

          <div className="bg-gray-900 p-4 rounded border border-gray-600 mb-4">
            <div className="text-sm text-gray-500">GAFAM Tax</div>
            <div className="text-2xl font-bold text-red-400">
              {(config.taxRate * 100).toFixed(0)}%
            </div>
          </div>

          {store.coolingSlots.length === 0 ? (
            nextConfig ? (
              <button
                onClick={store.upgradeServerRoom}
                disabled={
                  store.money < nextConfig.cost * (1 - store.globalModifiers.costReduction) ||
                  (nextConfig.techReq && !isTechUnlocked) ||
                  store.energyCapacity < nextConfig.energyReq
                }
                className="w-full py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-bold transition-colors"
              >
                Add Cooling Slot ($
                {(nextConfig.cost * (1 - store.globalModifiers.costReduction)).toLocaleString()})
              </button>
            ) : (
              <div className="text-green-400 font-bold">MAX LEVEL REACHED</div>
            )
          ) : store.backupSlots.length < 3 ? (
            <button
              onClick={store.upgradeServerRoom}
              disabled={
                store.money <
                (nextConfig
                  ? nextConfig.cost * (1 - store.globalModifiers.costReduction)
                  : config.cost * (1 - store.globalModifiers.costReduction))
              }
              className="w-full py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-bold transition-colors"
            >
              Add Backup Slot ($
              {(
                (nextConfig ? nextConfig.cost : config.cost) *
                (1 - store.globalModifiers.costReduction)
              ).toLocaleString()}
              )
            </button>
          ) : (
            <div className="text-green-400 font-bold">SALLE AU MAXIMUM</div>
          )}
        </div>

        {/* RIGHT: Server Slots */}
        <div className="flex-1 overflow-y-auto">
          <div className="sticky top-0 bg-gray-800 z-10 pb-2 mb-4">
            <h3 className="font-bold text-gray-300">
              Server Slots ({store.serverSlots.filter((s) => s).length}/{config.slots})
            </h3>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {store.serverSlots.slice(0, config.slots).map((slot, index) => {
              if (slot) {
                const asset = SERVER_ASSETS[slot.typeId]
                const grade = asset.grades.find((g) => g.grade === slot.grade)!
                const nextGrade = asset.grades.find((g) => g.grade === slot.grade + 1)

                return (
                  <div
                    key={index}
                    className="bg-gray-700 p-2 rounded border border-gray-600 relative group text-center z-0"
                  >
                    <div className="font-bold text-xs text-white truncate">{asset.name}</div>
                    <div className="text-[10px] text-blue-300">
                      {grade.name} (G{slot.grade})
                    </div>
                    <div className="text-[10px] text-green-400">+${grade.income}/t</div>
                    <div className="text-[10px] text-red-400">+{grade.co2} CO₂</div>

                    {nextGrade && (
                      <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded p-1 z-10">
                        <div className="text-[10px] text-gray-300 mb-1">
                          Upgrade to {nextGrade.name}
                        </div>
                        <div className="text-[10px] text-green-400 mb-1">
                          +${nextGrade.income - grade.income}/t
                        </div>
                        <div className="text-[10px] text-red-400 mb-1">
                          {nextGrade.co2 - grade.co2 > 0 ? '+' : ''}
                          {nextGrade.co2 - grade.co2} CO₂
                        </div>
                        <button
                          onClick={() => store.upgradeServer(index)}
                          disabled={
                            store.money <
                            nextGrade.upgradeCost * (1 - store.globalModifiers.costReduction)
                          }
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded text-[10px] font-bold w-full"
                        >
                          $
                          {(
                            nextGrade.upgradeCost *
                            (1 - store.globalModifiers.costReduction)
                          ).toLocaleString()}
                        </button>
                      </div>
                    )}
                  </div>
                )
              } else {
                return (
                  <div
                    key={index}
                    className="bg-gray-900/50 p-2 rounded border border-dashed border-gray-700 flex flex-col items-center justify-center gap-1 min-h-[80px] group cursor-pointer hover:bg-gray-800"
                  >
                    <span className="text-xs text-gray-500">Empty</span>
                    <div className="text-xs text-green-400 font-bold">+ Buy</div>
                    <div className="flex flex-col gap-1 w-full mt-1">
                      {Object.values(SERVER_ASSETS)
                        .filter((asset) => store.serverRoomLevel >= asset.minRoomLevel)
                        .map((asset) => (
                          <button
                            key={asset.id}
                            onClick={() => store.buyServer(asset.id)}
                            disabled={
                              store.money <
                              asset.baseCost * (1 - store.globalModifiers.costReduction)
                            }
                            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-[10px] rounded text-left truncate"
                            title={`${asset.name} ($${(asset.baseCost * (1 - store.globalModifiers.costReduction)).toLocaleString()})`}
                          >
                            {asset.name} ($
                            {(
                              asset.baseCost *
                              (1 - store.globalModifiers.costReduction)
                            ).toLocaleString()}
                            )
                          </button>
                        ))}
                    </div>
                  </div>
                )
              }
            })}
          </div>

          {/* Cooling Systems Section */}
          {store.coolingSlots.length > 0 && (
            <>
              <div className="sticky top-0 bg-gray-800 z-10 pb-2 mb-4 mt-6">
                <h3 className="font-bold text-gray-300">
                  Cooling Systems ({store.coolingSlots.filter((s) => s).length}/1)
                </h3>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: 1 }, (_, index) => {
                  const slot = store.coolingSlots[index] || null
                  if (slot) {
                    const cooling = COOLING_SYSTEMS[slot.level - 1]
                    const nextCooling = COOLING_SYSTEMS[slot.level]

                    return (
                      <div
                        key={index}
                        className="bg-gray-700 p-2 rounded border border-gray-600 relative group text-center z-0"
                      >
                        <div className="text-2xl mb-1">{cooling.icon}</div>
                        <div className="font-bold text-xs text-white truncate">{cooling.name}</div>
                        <div className="text-[10px] text-green-400">+${cooling.income}/s</div>
                        <div className="text-[10px] text-yellow-400">+{cooling.energy}⚡</div>
                        <div className="text-[10px] text-red-400">+{cooling.co2} CO₂</div>

                        {nextCooling && (
                          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded p-1 z-10">
                            <div className="text-[10px] text-gray-300 mb-1">
                              Upgrade to {nextCooling.name}
                            </div>
                            <div className="text-[10px] text-green-400 mb-1">
                              +${nextCooling.income - cooling.income}/s
                            </div>
                            <div className="text-[10px] text-yellow-400 mb-1">
                              +{nextCooling.energy - cooling.energy}⚡
                            </div>
                            <div className="text-[10px] text-red-400 mb-1">
                              {nextCooling.co2 - cooling.co2 > 0 ? '+' : ''}
                              {nextCooling.co2 - cooling.co2} CO₂
                            </div>
                            <button
                              onClick={() => store.upgradeCooling(index)}
                              disabled={
                                store.money <
                                nextCooling.cost * (1 - store.globalModifiers.costReduction)
                              }
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded text-[10px] font-bold w-full"
                            >
                              $
                              {(
                                nextCooling.cost *
                                (1 - store.globalModifiers.costReduction)
                              ).toLocaleString()}
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  } else {
                    const baseCooling = COOLING_SYSTEMS[0]
                    return (
                      <div
                        key={index}
                        className="bg-gray-900/50 p-2 rounded border border-dashed border-gray-700 flex flex-col items-center justify-center gap-1 min-h-[80px] group cursor-pointer hover:bg-gray-800"
                        onClick={() => store.buyCooling(index)}
                      >
                        <span className="text-xs text-gray-500">Empty</span>
                        <div className="text-xs text-green-400 font-bold">+ Buy</div>
                        <div className="text-[10px] text-gray-400">
                          $
                          {(
                            baseCooling.cost *
                            (1 - store.globalModifiers.costReduction)
                          ).toLocaleString()}
                        </div>
                      </div>
                    )
                  }
                })}
              </div>
            </>
          )}

          {/* Backup Systems Section */}
          {store.backupSlots.length > 0 && (
            <>
              <div className="sticky top-0 bg-gray-800 z-10 pb-2 mb-4 mt-6">
                <h3 className="font-bold text-gray-300">
                  Backup Systems ({store.backupSlots.filter((s) => s).length}/3)
                </h3>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: 3 }, (_, index) => {
                  const slot = store.backupSlots[index] || null
                  if (slot) {
                    const backup = BACKUP_SYSTEMS[slot.level - 1]
                    const nextBackup = BACKUP_SYSTEMS[slot.level]

                    return (
                      <div
                        key={index}
                        className="bg-gray-700 p-2 rounded border border-gray-600 relative group text-center z-0"
                      >
                        <div className="text-2xl mb-1">{backup.icon}</div>
                        <div className="font-bold text-xs text-white truncate">{backup.name}</div>
                        <div className="text-[10px] text-green-400">+${backup.income}/s</div>
                        <div className="text-[10px] text-yellow-400">+{backup.energy}⚡</div>
                        <div className="text-[10px] text-red-400">+{backup.co2} CO₂</div>

                        {nextBackup && (
                          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded p-1 z-10">
                            <div className="text-[10px] text-gray-300 mb-1">
                              Upgrade to {nextBackup.name}
                            </div>
                            <div className="text-[10px] text-green-400 mb-1">
                              +${nextBackup.income - backup.income}/s
                            </div>
                            <div className="text-[10px] text-yellow-400 mb-1">
                              +{nextBackup.energy - backup.energy}⚡
                            </div>
                            <div className="text-[10px] text-red-400 mb-1">
                              {nextBackup.co2 - backup.co2 > 0 ? '+' : ''}
                              {nextBackup.co2 - backup.co2} CO₂
                            </div>
                            <button
                              onClick={() => store.upgradeBackup(index)}
                              disabled={
                                store.money <
                                nextBackup.cost * (1 - store.globalModifiers.costReduction)
                              }
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded text-[10px] font-bold w-full"
                            >
                              $
                              {(
                                nextBackup.cost *
                                (1 - store.globalModifiers.costReduction)
                              ).toLocaleString()}
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  } else {
                    const baseBackup = BACKUP_SYSTEMS[0]
                    return (
                      <div
                        key={index}
                        className="bg-gray-900/50 p-2 rounded border border-dashed border-gray-700 flex flex-col items-center justify-center gap-1 min-h-[80px] group cursor-pointer hover:bg-gray-800"
                        onClick={() => store.buyBackup(index)}
                      >
                        <span className="text-xs text-gray-500">Empty</span>
                        <div className="text-xs text-green-400 font-bold">+ Buy</div>
                        <div className="text-[10px] text-gray-400">
                          $
                          {(
                            baseBackup.cost *
                            (1 - store.globalModifiers.costReduction)
                          ).toLocaleString()}
                        </div>
                      </div>
                    )
                  }
                })}
              </div>
            </>
          )}
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          ✕
        </button>
      </div>
    )
  }

  return null
}
