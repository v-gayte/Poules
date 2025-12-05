import { create } from 'zustand'
import {
  GAME_CONFIG,
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
  GYM_ACTIVITIES,
  RESEARCH_LAB_LEVELS,
  DEFAULT_MAP,
} from '../config/gameConfig'

interface ServerSlot {
  typeId: string // 'tower', 'rack', 'quantum'
  level: number // 1-10
}

interface ClassroomPCSlot {
  level: number // 1-10
}

interface NetworkSlot {
  level: number // 1-10
}

interface TeacherSlot {
  level: number // 1-10
}

interface CoolingSlot {
  level: number // 1-10
}

interface BackupSlot {
  level: number // 1-10
}

interface RoomInstance {
  id: string
  type: string
  x1: number
  y1: number
  x2: number
  y2: number
  unlocked: boolean
  cost: number
}

interface GymProfile {
  goal: string
  frequency: string
}

interface GlobalModifiers {
  co2Reduction: number // 0.0 to 1.0 (percentage reduced)
  costReduction: number // 0.0 to 1.0 (percentage reduced)
}

interface GameState {
  money: number
  research: number
  co2: number
  maxCo2: number
  tick: number

  // Progression
  generatorLevel: number
  serverRoomLevel: number
  classroomLevel: number
  gymLevel: number
  researchLabLevel: number // New

  unlockedTechs: string[]
  globalModifiers: GlobalModifiers // New

  serverSlots: (ServerSlot | null)[]
  classroomSlots: (ClassroomPCSlot | null)[]
  networkSlots: (NetworkSlot | null)[]
  teacherSlots: (TeacherSlot | null)[]
  coolingSlots: (CoolingSlot | null)[]
  backupSlots: (BackupSlot | null)[]

  // Gym
  gymProfile: GymProfile | null

  // Map
  rooms: RoomInstance[]
  inspectedRoomId: string | null
  selectedRoomId: string | null

  // Computed
  energyCapacity: number
  energyUsage: number
  studentCount: number

  // UI State
  errorMessage: string | null

  // Actions
  setInspectedRoomId: (id: string | null) => void
  setSelectedRoomId: (id: string | null) => void
  unlockRoom: (id: string) => void
  setErrorMessage: (message: string | null) => void

  upgradeGenerator: () => void
  upgradeServerRoom: () => void
  upgradeClassroom: () => void
  upgradeGym: () => void
  upgradeResearchLab: () => void // New

  setGymProfile: (profile: GymProfile) => void
  performGymActivity: () => void

  unlockTech: (techId: string) => void
  buyServer: (typeId: string) => void
  upgradeServer: (slotIndex: number) => void

  buyClassroomPC: (slotIndex: number) => void
  upgradeClassroomPC: (slotIndex: number) => void

  buyNetwork: (slotIndex: number) => void
  upgradeNetwork: (slotIndex: number) => void

  buyTeacher: (slotIndex: number) => void
  upgradeTeacher: (slotIndex: number) => void

  buyCooling: (slotIndex: number) => void
  upgradeCooling: (slotIndex: number) => void

  buyBackup: (slotIndex: number) => void
  upgradeBackup: (slotIndex: number) => void

  tickUpdate: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
  money: GAME_CONFIG.INITIAL_MONEY,
  research: GAME_CONFIG.INITIAL_RESEARCH,
  co2: GAME_CONFIG.INITIAL_CO2,
  maxCo2: GAME_CONFIG.MAX_CO2_BASE,
  tick: 0,

  generatorLevel: 1,
  serverRoomLevel: 1,
  classroomLevel: 1,
  gymLevel: 1,
  researchLabLevel: 1,

  unlockedTechs: ['T1'],
  globalModifiers: { co2Reduction: 0, costReduction: 0 },

  serverSlots: (() => {
    // Initialize with slots for level 1 (4 slots)
    const initialLevel = SERVER_ROOM_LEVELS[0]
    const slots = new Array(initialLevel.slots).fill(null)
    return slots
  })(),
  classroomSlots: (() => {
    const slots = new Array(8).fill(null) // Fixed capacity of 8 PCs
    slots[0] = { level: 1 } // Start with 1 PC
    return slots
  })(),
  networkSlots: [], // Max 1 network equipment
  teacherSlots: [], // Max 3 teachers
  coolingSlots: [], // Max 3 cooling systems
  backupSlots: [], // Max 3 backup systems

  gymProfile: null,

  rooms: DEFAULT_MAP,
  inspectedRoomId: null,
  selectedRoomId: null,

  energyCapacity: GENERATOR_LEVELS[0].capacity,
  energyUsage: 0,
  studentCount: 0,

  errorMessage: null,

  setInspectedRoomId: (id) => set({ inspectedRoomId: id }),
  setSelectedRoomId: (id) => set({ selectedRoomId: id }),
  setErrorMessage: (message) => set({ errorMessage: message }),

  unlockRoom: (id) => {
    const { money, rooms, maxCo2 } = get()
    const roomIndex = rooms.findIndex((r) => r.id === id)
    if (roomIndex === -1) return

    const room = rooms[roomIndex]
    if (room.unlocked) return

    if (money >= room.cost) {
      const newRooms = [...rooms]
      newRooms[roomIndex] = { ...room, unlocked: true }

      // Increase CO2 capacity proportionally to room cost (10% of cost as additional capacity)
      const co2Increase = Math.floor(room.cost * 0.1)
      const newMaxCo2 = maxCo2 + co2Increase

      set({
        money: money - room.cost,
        rooms: newRooms,
        inspectedRoomId: id,
        maxCo2: newMaxCo2,
      })
    }
  },

  upgradeGenerator: () => {
    const { money, generatorLevel, globalModifiers } = get()
    if (generatorLevel >= 10) return

    const nextLevel = GENERATOR_LEVELS[generatorLevel]
    const cost = nextLevel.cost * (1 - globalModifiers.costReduction)

    if (money >= cost) {
      set({
        money: money - cost,
        generatorLevel: generatorLevel + 1,
        energyCapacity: nextLevel.capacity,
      })
    }
  },

  upgradeServerRoom: () => {
    const {
      money,
      serverRoomLevel,
      unlockedTechs,
      energyCapacity,
      globalModifiers,
      coolingSlots,
      backupSlots,
      generatorLevel,
      setErrorMessage,
    } = get()

    if (serverRoomLevel >= 10) {
      setErrorMessage('SALLE AU MAXIMUM')
      return
    }

    const nextLevelConfig = SERVER_ROOM_LEVELS[serverRoomLevel]
    const cost = nextLevelConfig.cost * (1 - globalModifiers.costReduction)

    // Checks
    if (money < cost) return
    if (nextLevelConfig.techReq && !unlockedTechs.includes(nextLevelConfig.techReq)) return
    if (energyCapacity < nextLevelConfig.energyReq) {
      setErrorMessage("Pas assez d'électricité ! Il faut améliorer le générateur.")
      return
    }

    // Check energy for all current equipment
    const {
      serverSlots,
      classroomSlots,
      networkSlots,
      teacherSlots,
      coolingSlots: currentCooling,
      backupSlots: currentBackup,
    } = get()
    let totalEnergy = 0

    classroomSlots.forEach((slot) => {
      if (slot) {
        const pc = CLASSROOM_PCS[slot.level - 1]
        totalEnergy += pc.energy
      }
    })

    networkSlots.forEach((slot) => {
      if (slot) {
        const network = NETWORK_EQUIPMENT[slot.level - 1]
        totalEnergy += network.energy
      }
    })

    teacherSlots.forEach((slot) => {
      if (slot) {
        const teacher = TEACHERS[slot.level - 1]
        totalEnergy += teacher.energy
      }
    })

    currentCooling.forEach((slot) => {
      if (slot) {
        const cooling = COOLING_SYSTEMS[slot.level - 1]
        totalEnergy += cooling.energy
      }
    })

    currentBackup.forEach((slot) => {
      if (slot) {
        const backup = BACKUP_SYSTEMS[slot.level - 1]
        totalEnergy += backup.energy
      }
    })

    const generatorConfig = GENERATOR_LEVELS[generatorLevel - 1]
    const currentCapacity = generatorConfig.capacity

    if (totalEnergy > currentCapacity) {
      setErrorMessage("Pas assez d'électricité ! Il faut améliorer le générateur.")
      return
    }

    // Resize server slots array to match new level capacity
    const currentSlots = get().serverSlots
    const newSlots = new Array(nextLevelConfig.slots).fill(null)
    for (let i = 0; i < currentSlots.length && i < newSlots.length; i++) {
      newSlots[i] = currentSlots[i]
    }

    // Unlock cooling system when reaching level 2
    let newCoolingSlots = [...coolingSlots]
    if (serverRoomLevel === 1 && coolingSlots.length === 0) {
      newCoolingSlots = [null]
    }

    // Unlock backup systems when reaching level 3 (after cooling is unlocked)
    let newBackupSlots = [...backupSlots]
    if (serverRoomLevel === 2 && backupSlots.length === 0) {
      newBackupSlots = [null]
    } else if (
      serverRoomLevel > 2 &&
      backupSlots.length < 3 &&
      backupSlots.length < serverRoomLevel - 2
    ) {
      // Add one backup slot per level after level 3, up to 3 total
      const slotsToAdd = Math.min(3 - backupSlots.length, 1)
      for (let i = 0; i < slotsToAdd; i++) {
        newBackupSlots.push(null)
      }
    }

    // Increase CO2 capacity proportionally to upgrade cost (10% of cost as additional capacity)
    const { maxCo2 } = get()
    const co2Increase = Math.floor(cost * 0.1)
    const newMaxCo2 = maxCo2 + co2Increase

    set({
      money: money - cost,
      serverRoomLevel: serverRoomLevel + 1,
      serverSlots: newSlots,
      coolingSlots: newCoolingSlots,
      backupSlots: newBackupSlots,
      maxCo2: newMaxCo2,
    })
  },

  upgradeClassroom: () => {
    const {
      money,
      classroomLevel,
      networkSlots,
      teacherSlots,
      globalModifiers,
      generatorLevel,
      setErrorMessage,
      unlockedTechs,
    } = get()

    // Level 1: Add first network slot (unlocks network section)
    if (classroomLevel === 1 && networkSlots.length === 0) {
      const nextLevel = CLASSROOM_LEVELS[classroomLevel]
      const cost = nextLevel.cost * (1 - globalModifiers.costReduction)

      if (money < cost) return

      // Tech Check
      if (nextLevel.techReq && !unlockedTechs.includes(nextLevel.techReq)) {
        setErrorMessage(`Recherche requise : ${nextLevel.techReq}`)
        return
      }

      // Add the first network slot
      const newNetworkSlots = [null]

      // Check energy for the new network slot
      const baseNetwork = NETWORK_EQUIPMENT[0]
      let totalEnergy = 0

      // Calculate current energy from PCs
      const { classroomSlots } = get()
      classroomSlots.forEach((slot) => {
        if (slot) {
          const pc = CLASSROOM_PCS[slot.level - 1]
          totalEnergy += pc.energy
        }
      })

      // Add energy from potential new network equipment
      totalEnergy += baseNetwork.energy

      const generatorConfig = GENERATOR_LEVELS[generatorLevel - 1]
      const currentCapacity = generatorConfig.capacity

      if (totalEnergy > currentCapacity) {
        setErrorMessage("Pas assez d'électricité ! Il faut améliorer le générateur.")
        return
      }

      // Increase CO2 capacity proportionally to upgrade cost (10% of cost as additional capacity)
      const { maxCo2 } = get()
      const co2Increase = Math.floor(cost * 0.1)
      const newMaxCo2 = maxCo2 + co2Increase

      set({
        money: money - cost,
        classroomLevel: classroomLevel + 1,
        networkSlots: newNetworkSlots,
        maxCo2: newMaxCo2,
      })
      return
    }

    // Level 2-5: Add teacher slots (unlocks teacher section) - only if network slot exists and less than 3 teachers
    if (classroomLevel >= 2 && networkSlots.length > 0 && teacherSlots.length < 3) {
      // Use the cost of the current level for adding teacher slot
      const currentLevel = CLASSROOM_LEVELS[classroomLevel - 1]
      const cost = currentLevel.cost * (1 - globalModifiers.costReduction)

      if (money < cost) return

      // Add a new teacher slot
      const newTeacherSlots = [...teacherSlots, null]

      // Check energy for the new teacher slot
      const baseTeacher = TEACHERS[0]
      let totalEnergy = 0

      // Calculate current energy from PCs
      const { classroomSlots } = get()
      classroomSlots.forEach((slot) => {
        if (slot) {
          const pc = CLASSROOM_PCS[slot.level - 1]
          totalEnergy += pc.energy
        }
      })

      // Calculate current energy from network
      networkSlots.forEach((slot) => {
        if (slot) {
          const network = NETWORK_EQUIPMENT[slot.level - 1]
          totalEnergy += network.energy
        }
      })

      // Add energy from potential new teacher
      totalEnergy += baseTeacher.energy

      const generatorConfig = GENERATOR_LEVELS[generatorLevel - 1]
      const currentCapacity = generatorConfig.capacity

      if (totalEnergy > currentCapacity) {
        setErrorMessage("Pas assez d'électricité ! Il faut améliorer le générateur.")
        return
      }

      // Increase CO2 capacity proportionally to upgrade cost (10% of cost as additional capacity)
      const { maxCo2 } = get()
      const co2Increase = Math.floor(cost * 0.1)
      const newMaxCo2 = maxCo2 + co2Increase

      set({
        money: money - cost,
        teacherSlots: newTeacherSlots,
        maxCo2: newMaxCo2,
      })
      return
    }

    // If we have network slot and 3 teachers, classroom is maxed
    if (networkSlots.length > 0 && teacherSlots.length >= 3) {
      setErrorMessage('La salle est au maximum.')
      return
    }
  },

  upgradeGym: () => {
    const { money, gymLevel, gymProfile, globalModifiers, maxCo2, unlockedTechs, setErrorMessage } =
      get()
    if (gymLevel >= 4) return

    if (gymLevel === 1 && !gymProfile) return

    const nextLevel = GYM_LEVELS[gymLevel]
    const cost = nextLevel.cost * (1 - globalModifiers.costReduction)

    if (money >= cost) {
      if (nextLevel.techReq && !unlockedTechs.includes(nextLevel.techReq)) {
        setErrorMessage(`Recherche requise : ${nextLevel.techReq}`)
        return
      }

      // Increase CO2 capacity proportionally to upgrade cost (10% of cost as additional capacity)
      const co2Increase = Math.floor(cost * 0.1)
      const newMaxCo2 = maxCo2 + co2Increase

      set({
        money: money - cost,
        gymLevel: gymLevel + 1,
        maxCo2: newMaxCo2,
      })
    }
  },

  upgradeResearchLab: () => {
    const { money, researchLabLevel, globalModifiers, maxCo2 } = get()
    if (researchLabLevel >= 5) return

    const nextLevel = RESEARCH_LAB_LEVELS[researchLabLevel]
    const cost = nextLevel.cost * (1 - globalModifiers.costReduction)

    if (money >= cost) {
      // Increase CO2 capacity proportionally to upgrade cost (10% of cost as additional capacity)
      const co2Increase = Math.floor(cost * 0.1)
      const newMaxCo2 = maxCo2 + co2Increase

      set({
        money: money - cost,
        researchLabLevel: researchLabLevel + 1,
        maxCo2: newMaxCo2,
      })
    }
  },

  setGymProfile: (profile) => {
    set({ gymProfile: profile })
  },

  performGymActivity: () => {
    const { money, gymLevel, gymProfile } = get()
    if (!gymProfile) return

    const activity = GYM_ACTIVITIES[gymProfile.goal as keyof typeof GYM_ACTIVITIES]
    if (!activity) return

    let reward = 100
    if (gymLevel >= 3) reward += 50
    if (gymLevel >= 4) reward += activity.product.reward

    set({ money: money + reward })
  },

  unlockTech: (techId) => {
    const { research, unlockedTechs, globalModifiers } = get()
    if (unlockedTechs.includes(techId)) return

    const tech = TECH_TREE.find((t) => t.id === techId)
    if (!tech) return

    // Check if requirements are met
    const requirementsMet = tech.reqs.every((reqId) => unlockedTechs.includes(reqId))
    if (!requirementsMet) return

    if (research >= tech.cost) {
      // Apply effects
      const newModifiers = { ...globalModifiers }
      tech.effects.forEach((effect) => {
        if (effect.type === 'CO2_REDUCTION') {
          newModifiers.co2Reduction += Number(effect.value)
        } else if (effect.type === 'COST_REDUCTION') {
          newModifiers.costReduction += Number(effect.value)
        }
      })

      set({
        research: research - tech.cost,
        unlockedTechs: [...unlockedTechs, techId],
        globalModifiers: newModifiers,
      })
    }
  },

  buyServer: (typeId) => {
    const { money, serverSlots, serverRoomLevel, globalModifiers, unlockedTechs, setErrorMessage } =
      get()

    const emptyIndex = serverSlots.findIndex((s) => s === null)
    if (emptyIndex === -1) return

    const assetConfig = SERVER_ASSETS[typeId]
    if (!assetConfig) return

    if (serverRoomLevel < assetConfig.minRoomLevel) return

    // Tech Check
    if (assetConfig.techReq && !unlockedTechs.includes(assetConfig.techReq)) {
      setErrorMessage(`Recherche requise : ${assetConfig.techReq}`)
      return
    }

    const levelConfig = assetConfig.levels[0] // First level
    const cost = levelConfig.cost * (1 - globalModifiers.costReduction)

    if (money < cost) return

    const newSlots = [...serverSlots]
    newSlots[emptyIndex] = { typeId, level: 1 }

    set({
      money: money - cost,
      serverSlots: newSlots,
    })
  },

  upgradeServer: (slotIndex) => {
    const { money, serverSlots, globalModifiers } = get()
    const slot = serverSlots[slotIndex]
    if (!slot) return

    const assetConfig = SERVER_ASSETS[slot.typeId]
    const nextLevel = slot.level + 1
    if (nextLevel > 10) return

    const levelConfig = assetConfig.levels.find((l) => l.level === nextLevel)
    if (!levelConfig) return

    const cost = levelConfig.cost * (1 - globalModifiers.costReduction)

    if (money >= cost) {
      const newSlots = [...serverSlots]
      newSlots[slotIndex] = { ...slot, level: nextLevel }
      set({
        money: money - cost,
        serverSlots: newSlots,
      })
    }
  },

  buyCooling: (slotIndex) => {
    const {
      money,
      coolingSlots,
      globalModifiers,
      generatorLevel,
      setErrorMessage,
      serverSlots,
      classroomSlots,
      networkSlots,
      teacherSlots,
      backupSlots,
    } = get()
    if (coolingSlots[slotIndex]) return

    const coolingConfig = COOLING_SYSTEMS[0]
    const cost = coolingConfig.cost * (1 - globalModifiers.costReduction)

    if (money < cost) return

    // Calculate energy after purchase
    let totalEnergy = 0

    classroomSlots.forEach((slot) => {
      if (slot) {
        const pc = CLASSROOM_PCS[slot.level - 1]
        totalEnergy += pc.energy
      }
    })

    networkSlots.forEach((slot) => {
      if (slot) {
        const network = NETWORK_EQUIPMENT[slot.level - 1]
        totalEnergy += network.energy
      }
    })

    teacherSlots.forEach((slot) => {
      if (slot) {
        const teacher = TEACHERS[slot.level - 1]
        totalEnergy += teacher.energy
      }
    })

    coolingSlots.forEach((slot, idx) => {
      if (slot && idx !== slotIndex) {
        const cooling = COOLING_SYSTEMS[slot.level - 1]
        totalEnergy += cooling.energy
      }
    })

    backupSlots.forEach((slot) => {
      if (slot) {
        const backup = BACKUP_SYSTEMS[slot.level - 1]
        totalEnergy += backup.energy
      }
    })

    totalEnergy += coolingConfig.energy

    const generatorConfig = GENERATOR_LEVELS[generatorLevel - 1]
    const currentCapacity = generatorConfig.capacity

    if (totalEnergy > currentCapacity) {
      setErrorMessage("Pas assez d'électricité ! Il faut améliorer le générateur.")
      return
    }

    const newSlots = [...coolingSlots]
    newSlots[slotIndex] = { level: 1 }

    set({
      money: money - cost,
      coolingSlots: newSlots,
    })
  },

  upgradeCooling: (slotIndex) => {
    const {
      money,
      coolingSlots,
      globalModifiers,
      generatorLevel,
      setErrorMessage,
      classroomSlots,
      networkSlots,
      teacherSlots,
      backupSlots,
    } = get()
    const slot = coolingSlots[slotIndex]
    if (!slot) return

    const nextLevel = slot.level + 1
    if (nextLevel > 10) return

    const coolingConfig = COOLING_SYSTEMS[nextLevel - 1]
    const currentCooling = COOLING_SYSTEMS[slot.level - 1]
    const cost = coolingConfig.cost * (1 - globalModifiers.costReduction)

    if (money < cost) return

    // Calculate energy after upgrade
    let totalEnergy = 0

    classroomSlots.forEach((slot) => {
      if (slot) {
        const pc = CLASSROOM_PCS[slot.level - 1]
        totalEnergy += pc.energy
      }
    })

    networkSlots.forEach((slot) => {
      if (slot) {
        const network = NETWORK_EQUIPMENT[slot.level - 1]
        totalEnergy += network.energy
      }
    })

    teacherSlots.forEach((slot) => {
      if (slot) {
        const teacher = TEACHERS[slot.level - 1]
        totalEnergy += teacher.energy
      }
    })

    coolingSlots.forEach((slot, idx) => {
      if (slot) {
        const cooling = idx === slotIndex ? coolingConfig : COOLING_SYSTEMS[slot.level - 1]
        totalEnergy += cooling.energy
      }
    })

    backupSlots.forEach((slot) => {
      if (slot) {
        const backup = BACKUP_SYSTEMS[slot.level - 1]
        totalEnergy += backup.energy
      }
    })

    const generatorConfig = GENERATOR_LEVELS[generatorLevel - 1]
    const currentCapacity = generatorConfig.capacity

    if (totalEnergy > currentCapacity) {
      setErrorMessage("Pas assez d'électricité ! Il faut améliorer le générateur.")
      return
    }

    const newSlots = [...coolingSlots]
    newSlots[slotIndex] = { level: nextLevel }

    set({
      money: money - cost,
      coolingSlots: newSlots,
    })
  },

  buyBackup: (slotIndex) => {
    const {
      money,
      backupSlots,
      globalModifiers,
      generatorLevel,
      setErrorMessage,
      classroomSlots,
      networkSlots,
      teacherSlots,
      coolingSlots,
    } = get()
    if (backupSlots[slotIndex]) return

    const backupConfig = BACKUP_SYSTEMS[0]
    const cost = backupConfig.cost * (1 - globalModifiers.costReduction)

    if (money < cost) return

    // Calculate energy after purchase
    let totalEnergy = 0

    classroomSlots.forEach((slot) => {
      if (slot) {
        const pc = CLASSROOM_PCS[slot.level - 1]
        totalEnergy += pc.energy
      }
    })

    networkSlots.forEach((slot) => {
      if (slot) {
        const network = NETWORK_EQUIPMENT[slot.level - 1]
        totalEnergy += network.energy
      }
    })

    teacherSlots.forEach((slot) => {
      if (slot) {
        const teacher = TEACHERS[slot.level - 1]
        totalEnergy += teacher.energy
      }
    })

    coolingSlots.forEach((slot) => {
      if (slot) {
        const cooling = COOLING_SYSTEMS[slot.level - 1]
        totalEnergy += cooling.energy
      }
    })

    backupSlots.forEach((slot, idx) => {
      if (slot && idx !== slotIndex) {
        const backup = BACKUP_SYSTEMS[slot.level - 1]
        totalEnergy += backup.energy
      }
    })

    totalEnergy += backupConfig.energy

    const generatorConfig = GENERATOR_LEVELS[generatorLevel - 1]
    const currentCapacity = generatorConfig.capacity

    if (totalEnergy > currentCapacity) {
      setErrorMessage("Pas assez d'électricité ! Il faut améliorer le générateur.")
      return
    }

    const newSlots = [...backupSlots]
    newSlots[slotIndex] = { level: 1 }

    set({
      money: money - cost,
      backupSlots: newSlots,
    })
  },

  upgradeBackup: (slotIndex) => {
    const {
      money,
      backupSlots,
      globalModifiers,
      generatorLevel,
      setErrorMessage,
      classroomSlots,
      networkSlots,
      teacherSlots,
      coolingSlots,
    } = get()
    const slot = backupSlots[slotIndex]
    if (!slot) return

    const nextLevel = slot.level + 1
    if (nextLevel > 10) return

    const backupConfig = BACKUP_SYSTEMS[nextLevel - 1]
    const cost = backupConfig.cost * (1 - globalModifiers.costReduction)

    if (money < cost) return

    // Calculate energy after upgrade
    let totalEnergy = 0

    classroomSlots.forEach((slot) => {
      if (slot) {
        const pc = CLASSROOM_PCS[slot.level - 1]
        totalEnergy += pc.energy
      }
    })

    networkSlots.forEach((slot) => {
      if (slot) {
        const network = NETWORK_EQUIPMENT[slot.level - 1]
        totalEnergy += network.energy
      }
    })

    teacherSlots.forEach((slot) => {
      if (slot) {
        const teacher = TEACHERS[slot.level - 1]
        totalEnergy += teacher.energy
      }
    })

    coolingSlots.forEach((slot) => {
      if (slot) {
        const cooling = COOLING_SYSTEMS[slot.level - 1]
        totalEnergy += cooling.energy
      }
    })

    backupSlots.forEach((slot, idx) => {
      if (slot) {
        const backup = idx === slotIndex ? backupConfig : BACKUP_SYSTEMS[slot.level - 1]
        totalEnergy += backup.energy
      }
    })

    const generatorConfig = GENERATOR_LEVELS[generatorLevel - 1]
    const currentCapacity = generatorConfig.capacity

    if (totalEnergy > currentCapacity) {
      setErrorMessage("Pas assez d'électricité ! Il faut améliorer le générateur.")
      return
    }

    const newSlots = [...backupSlots]
    newSlots[slotIndex] = { level: nextLevel }

    set({
      money: money - cost,
      backupSlots: newSlots,
    })
  },

  buyClassroomPC: (slotIndex) => {
    const {
      money,
      classroomSlots,
      networkSlots,
      teacherSlots, // Added missing teacherSlots
      globalModifiers,
      generatorLevel,
      setErrorMessage,
      unlockedTechs,
    } = get()
    if (classroomSlots[slotIndex]) return

    const pcConfig = CLASSROOM_PCS[0]
    const cost = pcConfig.cost * (1 - globalModifiers.costReduction)

    if (money < cost) return

    // Calculate energy after purchase (PCs + Network + Teachers)
    let totalEnergy = 0

    // Add energy from existing PCs
    classroomSlots.forEach((slot) => {
      if (slot) {
        const pc = CLASSROOM_PCS[slot.level - 1]
        totalEnergy += pc.energy
      }
    })

    // Add energy from network
    networkSlots.forEach((slot) => {
      if (slot) {
        const network = NETWORK_EQUIPMENT[slot.level - 1]
        totalEnergy += network.energy
      }
    })

    // Add energy from teachers
    teacherSlots.forEach((slot) => {
      if (slot) {
        const teacher = TEACHERS[slot.level - 1]
        totalEnergy += teacher.energy
      }
    })

    // Add energy from new PC
    totalEnergy += pcConfig.energy

    const generatorConfig = GENERATOR_LEVELS[generatorLevel - 1]
    const currentCapacity = generatorConfig.capacity

    if (totalEnergy > currentCapacity) {
      setErrorMessage("Pas assez d'électricité ! Il faut améliorer le générateur.")
      return
    }

    const newSlots = [...classroomSlots]
    newSlots[slotIndex] = { level: 1 }
    set({
      money: money - cost,
      classroomSlots: newSlots,
    })
  },

  upgradeClassroomPC: (slotIndex) => {
    const {
      money,
      classroomSlots,
      networkSlots,
      teacherSlots, // Added missing teacherSlots
      globalModifiers,
      generatorLevel,
      setErrorMessage,
      unlockedTechs,
    } = get()
    const slot = classroomSlots[slotIndex]
    if (!slot) return
    if (slot.level >= 10) return

    const nextLevelConfig = CLASSROOM_PCS[slot.level]
    const cost = nextLevelConfig.cost * (1 - globalModifiers.costReduction)

    if (money < cost) return

    // Tech Check
    if (nextLevelConfig.techReq && !unlockedTechs.includes(nextLevelConfig.techReq)) {
      setErrorMessage(`Recherche requise : ${nextLevelConfig.techReq}`)
      return
    }

    // Calculate energy after upgrade (PCs + Network)
    let totalEnergy = 0

    // Add energy from all PCs (with upgraded one)
    classroomSlots.forEach((s, idx) => {
      if (s) {
        if (idx === slotIndex) {
          // Use next level energy for this PC
          totalEnergy += nextLevelConfig.energy
        } else {
          const pc = CLASSROOM_PCS[s.level - 1]
          totalEnergy += pc.energy
        }
      }
    })

    // Add energy from network
    networkSlots.forEach((s) => {
      if (s) {
        const network = NETWORK_EQUIPMENT[s.level - 1]
        totalEnergy += network.energy
      }
    })

    // Add energy from teachers
    teacherSlots.forEach((slot) => {
      if (slot) {
        const teacher = TEACHERS[slot.level - 1]
        totalEnergy += teacher.energy
      }
    })

    const generatorConfig = GENERATOR_LEVELS[generatorLevel - 1]
    const currentCapacity = generatorConfig.capacity

    if (totalEnergy > currentCapacity) {
      setErrorMessage("Pas assez d'électricité ! Il faut améliorer le générateur.")
      return
    }

    const newSlots = [...classroomSlots]
    newSlots[slotIndex] = { level: slot.level + 1 }
    set({
      money: money - cost,
      classroomSlots: newSlots,
    })
  },

  buyNetwork: (slotIndex) => {
    const {
      money,
      networkSlots,
      teacherSlots,
      globalModifiers,
      generatorLevel,
      classroomSlots,
      setErrorMessage,
      unlockedTechs,
    } = get()
    if (networkSlots[slotIndex]) return

    const networkConfig = NETWORK_EQUIPMENT[0]
    const cost = networkConfig.cost * (1 - globalModifiers.costReduction)

    if (money < cost) return

    // Tech Check
    if (networkConfig.techReq && !unlockedTechs.includes(networkConfig.techReq)) {
      setErrorMessage(`Recherche requise : ${networkConfig.techReq}`)
      return
    }

    // Calculate energy after purchase
    let totalEnergy = 0

    // Add energy from existing PCs
    classroomSlots.forEach((slot) => {
      if (slot) {
        const pc = CLASSROOM_PCS[slot.level - 1]
        totalEnergy += pc.energy
      }
    })

    // Add energy from existing network
    networkSlots.forEach((slot) => {
      if (slot) {
        const network = NETWORK_EQUIPMENT[slot.level - 1]
        totalEnergy += network.energy
      }
    })

    // Add energy from teachers
    teacherSlots.forEach((slot) => {
      if (slot) {
        const teacher = TEACHERS[slot.level - 1]
        totalEnergy += teacher.energy
      }
    })

    // Add energy from new network equipment
    totalEnergy += networkConfig.energy

    const generatorConfig = GENERATOR_LEVELS[generatorLevel - 1]
    const currentCapacity = generatorConfig.capacity

    if (totalEnergy > currentCapacity) {
      setErrorMessage("Pas assez d'électricité ! Il faut améliorer le générateur.")
      return
    }

    const newSlots = [...networkSlots]
    newSlots[slotIndex] = { level: 1 }
    set({
      money: money - cost,
      networkSlots: newSlots,
    })
  },

  upgradeNetwork: (slotIndex) => {
    const {
      money,
      networkSlots,
      teacherSlots,
      globalModifiers,
      generatorLevel,
      classroomSlots,
      setErrorMessage,
      unlockedTechs,
    } = get()
    const slot = networkSlots[slotIndex]
    if (!slot) return
    if (slot.level >= 10) return

    const nextLevelConfig = NETWORK_EQUIPMENT[slot.level]
    const cost = nextLevelConfig.cost * (1 - globalModifiers.costReduction)

    if (money < cost) return

    // Tech Check
    if (nextLevelConfig.techReq && !unlockedTechs.includes(nextLevelConfig.techReq)) {
      setErrorMessage(`Recherche requise : ${nextLevelConfig.techReq}`)
      return
    }

    // Calculate energy after upgrade
    let totalEnergy = 0

    // Add energy from PCs
    classroomSlots.forEach((slot) => {
      if (slot) {
        const pc = CLASSROOM_PCS[slot.level - 1]
        totalEnergy += pc.energy
      }
    })

    // Add energy from all network (with upgraded one)
    networkSlots.forEach((s, idx) => {
      if (s) {
        if (idx === slotIndex) {
          // Use next level energy for this network
          totalEnergy += nextLevelConfig.energy
        } else {
          const network = NETWORK_EQUIPMENT[s.level - 1]
          totalEnergy += network.energy
        }
      }
    })

    // Add energy from teachers
    teacherSlots.forEach((slot) => {
      if (slot) {
        const teacher = TEACHERS[slot.level - 1]
        totalEnergy += teacher.energy
      }
    })

    const generatorConfig = GENERATOR_LEVELS[generatorLevel - 1]
    const currentCapacity = generatorConfig.capacity

    if (totalEnergy > currentCapacity) {
      setErrorMessage("Pas assez d'électricité ! Il faut améliorer le générateur.")
      return
    }

    const newSlots = [...networkSlots]
    newSlots[slotIndex] = { level: slot.level + 1 }
    set({
      money: money - cost,
      networkSlots: newSlots,
    })
  },

  buyTeacher: (slotIndex) => {
    const {
      money,
      teacherSlots,
      globalModifiers,
      generatorLevel,
      classroomSlots,
      networkSlots,
      setErrorMessage,
      unlockedTechs,
    } = get()
    if (teacherSlots[slotIndex]) return

    const teacherConfig = TEACHERS[0]
    const cost = teacherConfig.cost * (1 - globalModifiers.costReduction)

    if (money < cost) return

    // Tech Check
    if (teacherConfig.techReq && !unlockedTechs.includes(teacherConfig.techReq)) {
      setErrorMessage(`Recherche requise : ${teacherConfig.techReq}`)
      return
    }

    // Calculate energy after purchase
    let totalEnergy = 0

    // Add energy from existing PCs
    classroomSlots.forEach((slot) => {
      if (slot) {
        const pc = CLASSROOM_PCS[slot.level - 1]
        totalEnergy += pc.energy
      }
    })

    // Add energy from existing network
    networkSlots.forEach((slot) => {
      if (slot) {
        const network = NETWORK_EQUIPMENT[slot.level - 1]
        totalEnergy += network.energy
      }
    })

    // Add energy from existing teachers
    teacherSlots.forEach((slot) => {
      if (slot) {
        const teacher = TEACHERS[slot.level - 1]
        totalEnergy += teacher.energy
      }
    })

    // Add energy from new teacher
    totalEnergy += teacherConfig.energy

    const generatorConfig = GENERATOR_LEVELS[generatorLevel - 1]
    const currentCapacity = generatorConfig.capacity

    if (totalEnergy > currentCapacity) {
      setErrorMessage("Pas assez d'électricité ! Il faut améliorer le générateur.")
      return
    }

    const newSlots = [...teacherSlots]
    newSlots[slotIndex] = { level: 1 }
    set({
      money: money - cost,
      teacherSlots: newSlots,
    })
  },

  upgradeTeacher: (slotIndex) => {
    const {
      money,
      teacherSlots,
      globalModifiers,
      generatorLevel,
      classroomSlots,
      networkSlots,
      setErrorMessage,
      unlockedTechs,
    } = get()
    const slot = teacherSlots[slotIndex]
    if (!slot) return
    if (slot.level >= 10) return

    const nextLevelConfig = TEACHERS[slot.level]
    const cost = nextLevelConfig.cost * (1 - globalModifiers.costReduction)

    if (money < cost) return

    // Tech Check
    if (nextLevelConfig.techReq && !unlockedTechs.includes(nextLevelConfig.techReq)) {
      setErrorMessage(`Recherche requise : ${nextLevelConfig.techReq}`)
      return
    }

    // Calculate energy after upgrade
    let totalEnergy = 0

    // Add energy from PCs
    classroomSlots.forEach((slot) => {
      if (slot) {
        const pc = CLASSROOM_PCS[slot.level - 1]
        totalEnergy += pc.energy
      }
    })

    // Add energy from network
    networkSlots.forEach((slot) => {
      if (slot) {
        const network = NETWORK_EQUIPMENT[slot.level - 1]
        totalEnergy += network.energy
      }
    })

    // Add energy from all teachers (with upgraded one)
    teacherSlots.forEach((s, idx) => {
      if (s) {
        if (idx === slotIndex) {
          // Use next level energy for this teacher
          totalEnergy += nextLevelConfig.energy
        } else {
          const teacher = TEACHERS[s.level - 1]
          totalEnergy += teacher.energy
        }
      }
    })

    const generatorConfig = GENERATOR_LEVELS[generatorLevel - 1]
    const currentCapacity = generatorConfig.capacity

    if (totalEnergy > currentCapacity) {
      setErrorMessage("Pas assez d'électricité ! Il faut améliorer le générateur.")
      return
    }

    const newSlots = [...teacherSlots]
    newSlots[slotIndex] = { level: slot.level + 1 }
    set({
      money: money - cost,
      teacherSlots: newSlots,
    })
  },

  tickUpdate: () => {
    set((state) => {
      let grossServerIncome = 0
      let totalCo2 = 0

      // Server Room Income
      state.serverSlots.forEach((slot) => {
        if (!slot) return
        const asset = SERVER_ASSETS[slot.typeId]
        const levelConfig = asset.levels.find((l) => l.level === slot.level)
        if (levelConfig) {
          grossServerIncome += levelConfig.income
          totalCo2 += levelConfig.co2
        }
      })

      const roomConfig = SERVER_ROOM_LEVELS[state.serverRoomLevel - 1]
      const taxAmount = grossServerIncome * roomConfig.taxRate
      const netServerIncome = grossServerIncome - taxAmount

      // Classroom PC Income & Energy & CO2
      let classroomIncome = 0
      let classroomEnergy = 0
      let classroomCo2 = 0
      let visualStudents = 0

      state.classroomSlots.forEach((slot) => {
        if (slot) {
          const pc = CLASSROOM_PCS[slot.level - 1]
          classroomIncome += pc.income
          classroomEnergy += pc.energy
          classroomCo2 += pc.co2
          visualStudents++
        }
      })

      // Network Equipment Income & Energy
      let networkIncome = 0
      let networkEnergy = 0

      state.networkSlots.forEach((slot) => {
        if (slot) {
          const network = NETWORK_EQUIPMENT[slot.level - 1]
          networkIncome += network.income
          networkEnergy += network.energy
        }
      })

      // Teachers Income & Energy
      let teacherIncome = 0
      let teacherEnergy = 0

      state.teacherSlots.forEach((slot) => {
        if (slot) {
          const teacher = TEACHERS[slot.level - 1]
          teacherIncome += teacher.income
          teacherEnergy += teacher.energy
        }
      })

      // Cooling Systems Income & Energy & CO2
      let coolingIncome = 0
      let coolingEnergy = 0
      let coolingCo2 = 0

      state.coolingSlots.forEach((slot) => {
        if (slot) {
          const cooling = COOLING_SYSTEMS[slot.level - 1]
          coolingIncome += cooling.income
          coolingEnergy += cooling.energy
          coolingCo2 += cooling.co2
        }
      })

      // Backup Systems Income & Energy & CO2
      let backupIncome = 0
      let backupEnergy = 0
      let backupCo2 = 0

      state.backupSlots.forEach((slot) => {
        if (slot) {
          const backup = BACKUP_SYSTEMS[slot.level - 1]
          backupIncome += backup.income
          backupEnergy += backup.energy
          backupCo2 += backup.co2
        }
      })

      // Add classroom CO2 to total
      totalCo2 += classroomCo2 + coolingCo2 + backupCo2

      // Apply CO2 Reduction from Techs (after adding all sources)
      const currentCo2 = totalCo2 * (1 - state.globalModifiers.co2Reduction)

      // Research Lab Income (only if research room is unlocked)
      const researchRoom = state.rooms.find((r) => r.type === 'research')
      const isResearchRoomUnlocked = researchRoom?.unlocked ?? false
      const researchConfig = RESEARCH_LAB_LEVELS[state.researchLabLevel - 1]
      const researchIncome = isResearchRoomUnlocked ? researchConfig.rpGeneration : 0

      // Total Energy Usage (PCs + Network + Teachers + Cooling + Backup, not server room base energy)
      const currentEnergyUsage =
        classroomEnergy + networkEnergy + teacherEnergy + coolingEnergy + backupEnergy

      const generatorConfig = GENERATOR_LEVELS[state.generatorLevel - 1]
      const currentCapacity = generatorConfig.capacity

      const isPowered = currentCapacity >= currentEnergyUsage
      // Add network, teacher, cooling, and backup income to total
      const finalIncome = isPowered
        ? netServerIncome +
          classroomIncome +
          networkIncome +
          teacherIncome +
          coolingIncome +
          backupIncome
        : 0

      return {
        tick: state.tick + 1,
        money: state.money + finalIncome,
        research: state.research + (isPowered ? researchIncome : 0),
        co2: currentCo2, // Current CO2 level (not accumulated, like energy)
        energyCapacity: currentCapacity,
        energyUsage: currentEnergyUsage,
        studentCount: visualStudents,
      }
    })
  },
}))
