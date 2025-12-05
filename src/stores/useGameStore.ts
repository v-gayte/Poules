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
  GYM_LEVELS,
  GYM_ACTIVITIES,
  RESEARCH_LAB_LEVELS,
  DEFAULT_MAP,
} from '../config/gameConfig'

interface ServerSlot {
  typeId: string // 'tower', 'rack', 'quantum'
  grade: number // 1, 2, 3
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

  serverSlots: [null, null],
  classroomSlots: (() => {
    const slots = new Array(8).fill(null) // Fixed capacity of 8 PCs
    slots[0] = { level: 1 } // Start with 1 PC
    return slots
  })(),
  networkSlots: [], // Max 4 network equipment
  teacherSlots: [], // Max 4 teachers

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
      classroomSlots,
      generatorLevel,
      setErrorMessage,
    } = get()
    if (serverRoomLevel >= 10) return

    const nextLevelConfig = SERVER_ROOM_LEVELS[serverRoomLevel]
    const cost = nextLevelConfig.cost * (1 - globalModifiers.costReduction)

    // Checks
    if (money < cost) return
    if (nextLevelConfig.techReq && !unlockedTechs.includes(nextLevelConfig.techReq)) return
    if (energyCapacity < nextLevelConfig.energyReq) {
      setErrorMessage("Pas assez d'électricité ! Il faut améliorer le générateur.")
      return
    }

    // Calculate total energy after upgrade (only PCs count, room energyReq is just a requirement check)
    let classroomEnergy = 0
    classroomSlots.forEach((slot) => {
      if (slot) {
        const pc = CLASSROOM_PCS[slot.level - 1]
        classroomEnergy += pc.energy
      }
    })
    const totalEnergyAfterUpgrade = classroomEnergy

    const generatorConfig = GENERATOR_LEVELS[generatorLevel - 1]
    const currentCapacity = generatorConfig.capacity

    if (totalEnergyAfterUpgrade > currentCapacity) {
      setErrorMessage("Pas assez d'électricité ! Il faut améliorer le générateur.")
      return
    }

    // Resize slots array
    const currentSlots = get().serverSlots
    const newSlots = new Array(nextLevelConfig.slots).fill(null)
    for (let i = 0; i < currentSlots.length; i++) {
      newSlots[i] = currentSlots[i]
    }

    // Increase CO2 capacity proportionally to upgrade cost (10% of cost as additional capacity)
    const { maxCo2 } = get()
    const co2Increase = Math.floor(cost * 0.1)
    const newMaxCo2 = maxCo2 + co2Increase

    set({
      money: money - cost,
      serverRoomLevel: serverRoomLevel + 1,
      serverSlots: newSlots,
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
    } = get()

    // Level 1: Add first network slot (unlocks network section)
    if (classroomLevel === 1 && networkSlots.length === 0) {
      const nextLevel = CLASSROOM_LEVELS[classroomLevel]
      const cost = nextLevel.cost * (1 - globalModifiers.costReduction)

      if (money < cost) return

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
    const { money, gymLevel, gymProfile, globalModifiers, maxCo2 } = get()
    if (gymLevel >= 4) return

    if (gymLevel === 1 && !gymProfile) return

    const nextLevel = GYM_LEVELS[gymLevel]
    const cost = nextLevel.cost * (1 - globalModifiers.costReduction)

    if (money >= cost) {
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
    const { money, serverSlots, serverRoomLevel, globalModifiers } = get()

    const emptyIndex = serverSlots.findIndex((s) => s === null)
    if (emptyIndex === -1) return

    const assetConfig = SERVER_ASSETS[typeId]
    if (!assetConfig) return

    const cost = assetConfig.baseCost * (1 - globalModifiers.costReduction)

    if (serverRoomLevel < assetConfig.minRoomLevel) return
    if (money < cost) return

    const newSlots = [...serverSlots]
    newSlots[emptyIndex] = { typeId, grade: 1 }

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
    const nextGrade = slot.grade + 1
    if (nextGrade > 3) return

    const gradeConfig = assetConfig.grades.find((g) => g.grade === nextGrade)
    if (!gradeConfig) return

    const cost = gradeConfig.upgradeCost * (1 - globalModifiers.costReduction)

    if (money >= cost) {
      const newSlots = [...serverSlots]
      newSlots[slotIndex] = { ...slot, grade: nextGrade }
      set({
        money: money - cost,
        serverSlots: newSlots,
      })
    }
  },

  buyClassroomPC: (slotIndex) => {
    const {
      money,
      classroomSlots,
      networkSlots,
      teacherSlots, // Added missing teacherSlots
      globalModifiers,
      serverRoomLevel,
      generatorLevel,
      setErrorMessage,
    } = get()
    if (classroomSlots[slotIndex]) return

    const pcConfig = CLASSROOM_PCS[0]
    const cost = pcConfig.cost * (1 - globalModifiers.costReduction)

    if (money < cost) return

    // Calculate energy after purchase (PCs + Network)
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
      serverRoomLevel,
      generatorLevel,
      setErrorMessage,
    } = get()
    const slot = classroomSlots[slotIndex]
    if (!slot) return
    if (slot.level >= 10) return

    const nextLevelConfig = CLASSROOM_PCS[slot.level]
    const cost = nextLevelConfig.cost * (1 - globalModifiers.costReduction)

    if (money < cost) return

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
    } = get()
    if (networkSlots[slotIndex]) return

    const networkConfig = NETWORK_EQUIPMENT[0]
    const cost = networkConfig.cost * (1 - globalModifiers.costReduction)

    if (money < cost) return

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
    } = get()
    const slot = networkSlots[slotIndex]
    if (!slot) return
    if (slot.level >= 10) return

    const nextLevelConfig = NETWORK_EQUIPMENT[slot.level]
    const cost = nextLevelConfig.cost * (1 - globalModifiers.costReduction)

    if (money < cost) return

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
    } = get()
    if (teacherSlots[slotIndex]) return

    const teacherConfig = TEACHERS[0]
    const cost = teacherConfig.cost * (1 - globalModifiers.costReduction)

    if (money < cost) return

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
    } = get()
    const slot = teacherSlots[slotIndex]
    if (!slot) return
    if (slot.level >= 10) return

    const nextLevelConfig = TEACHERS[slot.level]
    const cost = nextLevelConfig.cost * (1 - globalModifiers.costReduction)

    if (money < cost) return

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
        const grade = asset.grades.find((g) => g.grade === slot.grade)
        if (grade) {
          grossServerIncome += grade.income
          totalCo2 += grade.co2
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

      // Add classroom CO2 to total
      totalCo2 += classroomCo2

      // Apply CO2 Reduction from Techs (after adding all sources)
      const currentCo2 = totalCo2 * (1 - state.globalModifiers.co2Reduction)

      // Research Lab Income (only if research room is unlocked)
      const researchRoom = state.rooms.find((r) => r.type === 'research')
      const isResearchRoomUnlocked = researchRoom?.unlocked ?? false
      const researchConfig = RESEARCH_LAB_LEVELS[state.researchLabLevel - 1]
      const researchIncome = isResearchRoomUnlocked ? researchConfig.rpGeneration : 0

      // Total Energy Usage (PCs + Network + Teachers, not server room base energy)
      const currentEnergyUsage = classroomEnergy + networkEnergy + teacherEnergy

      const generatorConfig = GENERATOR_LEVELS[state.generatorLevel - 1]
      const currentCapacity = generatorConfig.capacity

      const isPowered = currentCapacity >= currentEnergyUsage
      // Add network and teacher income to total
      const finalIncome = isPowered
        ? netServerIncome + classroomIncome + networkIncome + teacherIncome
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
