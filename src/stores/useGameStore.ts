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
  LAB_SECTIONS,
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
  // classroomLevel removed
  gymLevel: number
  researchLabLevel: number
  labSectionLevels: Record<string, number>

  unlockedTechs: string[]
  globalModifiers: GlobalModifiers

  serverSlots: (ServerSlot | null)[]
  // classroomSlots removed
  // networkSlots removed
  // teacherSlots removed
  coolingSlots: (CoolingSlot | null)[]

  backupSlots: (BackupSlot | null)[]
  
  // Classrooms (Multi-instance)
  classrooms: Record<string, ClassroomData>

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
  upgradeClassroom: (classroomId: string) => void
  upgradeGym: () => void
  upgradeLabSection: (id: string) => void

  setGymProfile: (profile: GymProfile) => void
  performGymActivity: () => void

  unlockTech: (techId: string) => void
  buyServer: (typeId: string) => void
  upgradeServer: (slotIndex: number) => void

  buyClassroomPC: (classroomId: string, slotIndex: number) => void
  upgradeClassroomPC: (classroomId: string, slotIndex: number) => void

  buyNetwork: (classroomId: string, slotIndex: number) => void
  upgradeNetwork: (classroomId: string, slotIndex: number) => void

  buyTeacher: (classroomId: string, slotIndex: number) => void
  upgradeTeacher: (classroomId: string, slotIndex: number) => void

  buyCooling: (slotIndex: number) => void
  upgradeCooling: (slotIndex: number) => void

  buyBackup: (slotIndex: number) => void
  upgradeBackup: (slotIndex: number) => void

  tickUpdate: () => void
}

interface ClassroomData {
  level: number
  classroomSlots: (ClassroomPCSlot | null)[]
  networkSlots: (NetworkSlot | null)[]
  teacherSlots: (TeacherSlot | null)[]
}

const INITIAL_CLASSROOMS: Record<string, ClassroomData> = {
  'classroom-0': {
    level: 1,
    classroomSlots: new Array(8).fill(null).map((_, i) => (i === 0 ? { level: 1 } : null)),
    networkSlots: [],
    teacherSlots: [],
  },
  'classroom-1': {
    level: 1,
    classroomSlots: new Array(8).fill(null).map((_, i) => (i === 0 ? { level: 1 } : null)),
    networkSlots: [],
    teacherSlots: [],
  },
  'classroom-2': {
    level: 1,
    classroomSlots: new Array(8).fill(null).map((_, i) => (i === 0 ? { level: 1 } : null)),
    networkSlots: [],
    teacherSlots: [],
  },
  'classroom-3': {
    level: 1,
    classroomSlots: new Array(8).fill(null).map((_, i) => (i === 0 ? { level: 1 } : null)),
    networkSlots: [],
    teacherSlots: [],
  },
}

const calculateTotalEnergy = (
  classrooms: Record<string, ClassroomData>,
  coolingSlots: (CoolingSlot | null)[],
  backupSlots: (BackupSlot | null)[]
): number => {
  let totalEnergy = 0
  Object.values(classrooms).forEach((c) => {
    c.classroomSlots.forEach((s) => {
      if (s) totalEnergy += CLASSROOM_PCS[s.level - 1].energy
    })
    c.networkSlots.forEach((s) => {
      if (s) totalEnergy += NETWORK_EQUIPMENT[s.level - 1].energy
    })
    c.teacherSlots.forEach((s) => {
      if (s) totalEnergy += TEACHERS[s.level - 1].energy
    })
  })
  coolingSlots.forEach((s) => {
    if (s) totalEnergy += COOLING_SYSTEMS[s.level - 1].energy
  })
  backupSlots.forEach((s) => {
    if (s) totalEnergy += BACKUP_SYSTEMS[s.level - 1].energy
  })
  return totalEnergy
}

export const useGameStore = create<GameState>((set, get) => ({
  money: GAME_CONFIG.INITIAL_MONEY,
  research: GAME_CONFIG.INITIAL_RESEARCH,
  co2: GAME_CONFIG.INITIAL_CO2,
  maxCo2: GAME_CONFIG.MAX_CO2_BASE,
  tick: 0,

  generatorLevel: 1,
  serverRoomLevel: 1,
  // classroomLevel removed
  gymLevel: 1,
  researchLabLevel: 1,
  labSectionLevels: { infra: 0, classroom: 0, gym: 0, arcade: 0 },

  unlockedTechs: ['T1'],
  globalModifiers: { co2Reduction: 0, costReduction: 0 },

  serverSlots: (() => {
    // Initialize with slots for level 1 (4 slots)
    const initialLevel = SERVER_ROOM_LEVELS[0]
    const slots = new Array(initialLevel.slots).fill(null)
    return slots
  })(),
  // classroomSlots removed
  // networkSlots removed
  // teacherSlots removed
  
  classrooms: INITIAL_CLASSROOMS,

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
      classrooms,
    } = get()

    // Phase 1: Add first cooling slot (when serverRoomLevel === 1)
    if (serverRoomLevel === 1) {
      const nextLevelConfig = SERVER_ROOM_LEVELS[serverRoomLevel]
      const cost = nextLevelConfig.cost * (1 - globalModifiers.costReduction)

      if (money < cost) return
      if (nextLevelConfig.techReq && !unlockedTechs.includes(nextLevelConfig.techReq)) return
      if (energyCapacity < nextLevelConfig.energyReq) {
        setErrorMessage("Pas assez d'électricité ! Il faut améliorer le générateur.")
        return
      }

      const totalEnergy = calculateTotalEnergy(classrooms, coolingSlots, backupSlots)
      const generatorConfig = GENERATOR_LEVELS[generatorLevel - 1]

      if (totalEnergy > generatorConfig.capacity) {
        setErrorMessage("Pas assez d'électricité ! Il faut améliorer le générateur.")
        return
      }

      const newCoolingSlots = [...coolingSlots, null]
      const { maxCo2 } = get()
      const co2Increase = Math.floor(cost * 0.1)
      const newMaxCo2 = maxCo2 + co2Increase

      set({
        money: money - cost,
        serverRoomLevel: serverRoomLevel + 1,
        coolingSlots: newCoolingSlots,
        maxCo2: newMaxCo2,
      })
      return
    }

    // Phase 2: Add backup slots (when cooling slot exists and backup slots < 3)
    if (coolingSlots.length > 0 && backupSlots.length < 3) {
      const currentLevelConfig = SERVER_ROOM_LEVELS[serverRoomLevel - 1]
      const cost = currentLevelConfig.cost * (1 - globalModifiers.costReduction)

      if (money < cost) return

      const totalEnergy = calculateTotalEnergy(classrooms, coolingSlots, backupSlots)
      const generatorConfig = GENERATOR_LEVELS[generatorLevel - 1]

      if (totalEnergy > generatorConfig.capacity) {
        setErrorMessage("Pas assez d'électricité ! Il faut améliorer le générateur.")
        return
      }

      const newBackupSlots = [...backupSlots, null]
      const { maxCo2 } = get()
      const co2Increase = Math.floor(cost * 0.1)
      const newMaxCo2 = maxCo2 + co2Increase

      set({
        money: money - cost,
        backupSlots: newBackupSlots,
        maxCo2: newMaxCo2,
      })
      return
    }

    // Normal upgrade path
    if (serverRoomLevel >= 10) {
      setErrorMessage('SALLE AU MAXIMUM')
      return
    }

    const nextLevelConfig = SERVER_ROOM_LEVELS[serverRoomLevel]
    const cost = nextLevelConfig.cost * (1 - globalModifiers.costReduction)

    if (money < cost) return
    if (nextLevelConfig.techReq && !unlockedTechs.includes(nextLevelConfig.techReq)) return
    if (energyCapacity < nextLevelConfig.energyReq) {
      setErrorMessage("Pas assez d'électricité ! Il faut améliorer le générateur.")
      return
    }

    const totalEnergy = calculateTotalEnergy(classrooms, coolingSlots, backupSlots)
    const generatorConfig = GENERATOR_LEVELS[generatorLevel - 1]

    if (totalEnergy > generatorConfig.capacity) {
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

  upgradeClassroom: (classroomId) => {
    const {
      money,
      classrooms,
      globalModifiers,
      generatorLevel,
      setErrorMessage,
      unlockedTechs,
    } = get()
    
    const classroom = classrooms[classroomId]
    if (!classroom) return

    const { level, networkSlots, teacherSlots } = classroom

    // Level 1: Add first network slot (unlocks network section)
    if (level === 1 && networkSlots.length === 0) {
      const nextLevel = CLASSROOM_LEVELS[level]
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
      const { coolingSlots, backupSlots } = get()
      let totalEnergy = calculateTotalEnergy(classrooms, coolingSlots, backupSlots)

      // Add energy from potential new network equipment
      totalEnergy += baseNetwork.energy

      const generatorConfig = GENERATOR_LEVELS[generatorLevel - 1]
      const currentCapacity = generatorConfig.capacity

      if (totalEnergy > currentCapacity) {
        setErrorMessage("Pas assez d'électricité ! Il faut améliorer le générateur.")
        return
      }

      // Increase CO2 capacity
      const { maxCo2 } = get()
      const co2Increase = Math.floor(cost * 0.1)
      const newMaxCo2 = maxCo2 + co2Increase

      const newClassroom = { ...classroom, level: level + 1, networkSlots: newNetworkSlots }

      set({
        money: money - cost,
        classrooms: { ...classrooms, [classroomId]: newClassroom },
        maxCo2: newMaxCo2,
      })
      return
    }

    // Level 2-5: Add teacher slots
    if (level >= 2 && networkSlots.length > 0 && teacherSlots.length < 3) {
      const currentLevel = CLASSROOM_LEVELS[level - 1]
      const cost = currentLevel.cost * (1 - globalModifiers.costReduction)

      if (money < cost) return

      const newTeacherSlots = [...teacherSlots, null]
      
      const baseTeacher = TEACHERS[0]
      const { coolingSlots, backupSlots } = get()
      let totalEnergy = calculateTotalEnergy(classrooms, coolingSlots, backupSlots)

      totalEnergy += baseTeacher.energy

      const generatorConfig = GENERATOR_LEVELS[generatorLevel - 1]
      if (totalEnergy > generatorConfig.capacity) {
        setErrorMessage("Pas assez d'électricité ! Il faut améliorer le générateur.")
        return
      }

      const { maxCo2 } = get()
      const co2Increase = Math.floor(cost * 0.1)
      const newMaxCo2 = maxCo2 + co2Increase

      const newClassroom = { ...classroom, teacherSlots: newTeacherSlots }

      set({
        money: money - cost,
        classrooms: { ...classrooms, [classroomId]: newClassroom },
        maxCo2: newMaxCo2,
      })
      return
    }

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

  upgradeLabSection: (sectionId) => {
    const { money, labSectionLevels, globalModifiers, maxCo2 } = get()
    const currentLevel = labSectionLevels[sectionId] || 0
    const section = LAB_SECTIONS[sectionId]
    
    if (!section) return

    // Calculate cost: baseCost * (multiplier ^ currentLevel)
    const cost = Math.floor(section.baseCost * Math.pow(section.costMultiplier, currentLevel))
    const discountedCost = cost * (1 - globalModifiers.costReduction)

    if (money >= discountedCost) {
      // Increase CO2 capacity
      const co2Increase = Math.floor(discountedCost * 0.1)
      const newMaxCo2 = maxCo2 + co2Increase

      const newLevels = { ...labSectionLevels, [sectionId]: currentLevel + 1 }

      set({
        money: money - discountedCost,
        labSectionLevels: newLevels,
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

  buyClassroomPC: (classroomId, slotIndex) => {
    const {
      money,
      classrooms,
      globalModifiers,
      generatorLevel,
      setErrorMessage,
    } = get()

    const classroom = classrooms[classroomId]
    if (!classroom) return
    if (classroom.classroomSlots[slotIndex]) return

    const pcConfig = CLASSROOM_PCS[0]
    const cost = pcConfig.cost * (1 - globalModifiers.costReduction)

    if (money < cost) return

    // Calculate energy
    const { coolingSlots, backupSlots } = get()
    let totalEnergy = calculateTotalEnergy(classrooms, coolingSlots, backupSlots)

    totalEnergy += pcConfig.energy

    const generatorConfig = GENERATOR_LEVELS[generatorLevel - 1]
    const currentCapacity = generatorConfig.capacity

    if (totalEnergy > currentCapacity) {
      setErrorMessage("Pas assez d'électricité ! Il faut améliorer le générateur.")
      return
    }

    const newSlots = [...classroom.classroomSlots]
    newSlots[slotIndex] = { level: 1 }
    set({
      money: money - cost,
      classrooms: { ...classrooms, [classroomId]: { ...classroom, classroomSlots: newSlots } },
    })
  },


  upgradeClassroomPC: (classroomId, slotIndex) => {
    const {
      money,
      classrooms,
      globalModifiers,
      generatorLevel,
      setErrorMessage,
      unlockedTechs,
    } = get()

    const classroom = classrooms[classroomId]
    if (!classroom) return
    const slot = classroom.classroomSlots[slotIndex]
    if (!slot) return
    if (slot.level >= 10) return

    const nextLevelConfig = CLASSROOM_PCS[slot.level]
    const cost = nextLevelConfig.cost * (1 - globalModifiers.costReduction)

    if (money < cost) return

    if (nextLevelConfig.techReq && !unlockedTechs.includes(nextLevelConfig.techReq)) {
      setErrorMessage(`Recherche requise : ${nextLevelConfig.techReq}`)
      return
    }

    const { coolingSlots, backupSlots } = get()
    let totalEnergy = calculateTotalEnergy(classrooms, coolingSlots, backupSlots)

    const currentPcEnergy = CLASSROOM_PCS[slot.level - 1].energy
    totalEnergy = totalEnergy - currentPcEnergy + nextLevelConfig.energy

    const generatorConfig = GENERATOR_LEVELS[generatorLevel - 1]
    if (totalEnergy > generatorConfig.capacity) {
      setErrorMessage("Pas assez d'électricité ! Il faut améliorer le générateur.")
      return
    }

    const newSlots = [...classroom.classroomSlots]
    newSlots[slotIndex] = { level: slot.level + 1 }
    set({
      money: money - cost,
      classrooms: { ...classrooms, [classroomId]: { ...classroom, classroomSlots: newSlots } },
    })
  },

  buyNetwork: (classroomId, slotIndex) => {
    const {
      money,
      classrooms,
      globalModifiers,
      generatorLevel,
      setErrorMessage,
      unlockedTechs,
      coolingSlots,
      backupSlots
    } = get()

    const classroom = classrooms[classroomId]
    if (!classroom) return
    if (classroom.networkSlots[slotIndex]) return

    const networkConfig = NETWORK_EQUIPMENT[0]
    const cost = networkConfig.cost * (1 - globalModifiers.costReduction)

    if (money < cost) return

    if (networkConfig.techReq && !unlockedTechs.includes(networkConfig.techReq)) {
      setErrorMessage(`Recherche requise : ${networkConfig.techReq}`)
      return
    }

    let totalEnergy = calculateTotalEnergy(classrooms, coolingSlots, backupSlots)

    totalEnergy += networkConfig.energy

    const generatorConfig = GENERATOR_LEVELS[generatorLevel - 1]
    if (totalEnergy > generatorConfig.capacity) {
      setErrorMessage("Pas assez d'électricité ! Il faut améliorer le générateur.")
      return
    }

    const newSlots = [...classroom.networkSlots]
    newSlots[slotIndex] = { level: 1 }
    set({
      money: money - cost,
      classrooms: { ...classrooms, [classroomId]: { ...classroom, networkSlots: newSlots } },
    })
  },

  upgradeNetwork: (classroomId, slotIndex) => {
    const {
      money,
      classrooms,
      globalModifiers,
      generatorLevel,
      setErrorMessage,
      unlockedTechs,
      coolingSlots,
      backupSlots
    } = get()
    
    const classroom = classrooms[classroomId]
    if (!classroom) return
    const slot = classroom.networkSlots[slotIndex]
    if (!slot) return
    if (slot.level >= 10) return

    const nextLevelConfig = NETWORK_EQUIPMENT[slot.level]
    const cost = nextLevelConfig.cost * (1 - globalModifiers.costReduction)

    if (money < cost) return

    if (nextLevelConfig.techReq && !unlockedTechs.includes(nextLevelConfig.techReq)) {
      setErrorMessage(`Recherche requise : ${nextLevelConfig.techReq}`)
      return
    }

    let totalEnergy = calculateTotalEnergy(classrooms, coolingSlots, backupSlots)

    const currentEnergy = NETWORK_EQUIPMENT[slot.level - 1].energy
    totalEnergy = totalEnergy - currentEnergy + nextLevelConfig.energy

    const generatorConfig = GENERATOR_LEVELS[generatorLevel - 1]
    if (totalEnergy > generatorConfig.capacity) {
      setErrorMessage("Pas assez d'électricité ! Il faut améliorer le générateur.")
      return
    }

    const newSlots = [...classroom.networkSlots]
    newSlots[slotIndex] = { level: slot.level + 1 }
    set({
      money: money - cost,
      classrooms: { ...classrooms, [classroomId]: { ...classroom, networkSlots: newSlots } },
    })
  },

  buyTeacher: (classroomId, slotIndex) => {
    const {
      money,
      classrooms,
      globalModifiers,
      generatorLevel,
      setErrorMessage,
      unlockedTechs,
      coolingSlots,
      backupSlots
    } = get()

    const classroom = classrooms[classroomId]
    if (!classroom) return
    if (classroom.teacherSlots[slotIndex]) return

    const teacherConfig = TEACHERS[0]
    const cost = teacherConfig.cost * (1 - globalModifiers.costReduction)

    if (money < cost) return

    if (teacherConfig.techReq && !unlockedTechs.includes(teacherConfig.techReq)) {
      setErrorMessage(`Recherche requise : ${teacherConfig.techReq}`)
      return
    }

    let totalEnergy = calculateTotalEnergy(classrooms, coolingSlots, backupSlots)

    totalEnergy += teacherConfig.energy

    const generatorConfig = GENERATOR_LEVELS[generatorLevel - 1]
    if (totalEnergy > generatorConfig.capacity) {
      setErrorMessage("Pas assez d'électricité ! Il faut améliorer le générateur.")
      return
    }

    const newSlots = [...classroom.teacherSlots]
    newSlots[slotIndex] = { level: 1 }
    set({
      money: money - cost,
      classrooms: { ...classrooms, [classroomId]: { ...classroom, teacherSlots: newSlots } },
    })
  },

  upgradeTeacher: (classroomId, slotIndex) => {
    const {
      money,
      classrooms,
      globalModifiers,
      generatorLevel,
      setErrorMessage,
      unlockedTechs,
      coolingSlots,
      backupSlots
    } = get()
    
    const classroom = classrooms[classroomId]
    if (!classroom) return
    const slot = classroom.teacherSlots[slotIndex]
    if (!slot) return
    if (slot.level >= 10) return

    const nextLevelConfig = TEACHERS[slot.level]
    const cost = nextLevelConfig.cost * (1 - globalModifiers.costReduction)

    if (money < cost) return

    if (nextLevelConfig.techReq && !unlockedTechs.includes(nextLevelConfig.techReq)) {
      setErrorMessage(`Recherche requise : ${nextLevelConfig.techReq}`)
      return
    }

    let totalEnergy = calculateTotalEnergy(classrooms, coolingSlots, backupSlots)

    const currentEnergy = TEACHERS[slot.level - 1].energy
    totalEnergy = totalEnergy - currentEnergy + nextLevelConfig.energy

    const generatorConfig = GENERATOR_LEVELS[generatorLevel - 1]
    if (totalEnergy > generatorConfig.capacity) {
      setErrorMessage("Pas assez d'électricité ! Il faut améliorer le générateur.")
      return
    }

    const newSlots = [...classroom.teacherSlots]
    newSlots[slotIndex] = { level: slot.level + 1 }
    set({
      money: money - cost,
      classrooms: { ...classrooms, [classroomId]: { ...classroom, teacherSlots: newSlots } },
    })
  },

  buyCooling: (slotIndex) => {
    const { money, coolingSlots, backupSlots, classrooms, generatorLevel, setErrorMessage, globalModifiers } = get()
    if (coolingSlots[slotIndex]) return // Already exists

    const initialLevel = 1
    const config = COOLING_SYSTEMS[initialLevel - 1]
    const cost = config.cost * (1 - globalModifiers.costReduction)

    if (money < cost) return

    // Energy Check
    let totalEnergy = calculateTotalEnergy(classrooms, coolingSlots, backupSlots)
    
    totalEnergy += config.energy

    if (totalEnergy > GENERATOR_LEVELS[generatorLevel - 1].capacity) {
       setErrorMessage("Pas assez d'électricité !")
       return
    }

    const newSlots = [...coolingSlots]
    newSlots[slotIndex] = { level: initialLevel }

    set({
      money: money - cost,
      coolingSlots: newSlots
    })
  },

  upgradeCooling: (slotIndex) => {
    const { money, coolingSlots, backupSlots, classrooms, generatorLevel, setErrorMessage, globalModifiers } = get()
    const slot = coolingSlots[slotIndex]
    if (!slot) return
    if (slot.level >= 10) return

    const nextConfig = COOLING_SYSTEMS[slot.level]
    const cost = nextConfig.cost * (1 - globalModifiers.costReduction)

    if (money < cost) return

    // Energy Check
    let totalEnergy = calculateTotalEnergy(classrooms, coolingSlots, backupSlots)

    const currentEnergy = COOLING_SYSTEMS[slot.level - 1].energy
    
    totalEnergy = totalEnergy - currentEnergy + nextConfig.energy

    if (totalEnergy > GENERATOR_LEVELS[generatorLevel - 1].capacity) {
       setErrorMessage("Pas assez d'électricité !")
       return
    }

    const newSlots = [...coolingSlots]
    newSlots[slotIndex] = { level: slot.level + 1 }

    set({
      money: money - cost,
      coolingSlots: newSlots
    })
  },

  buyBackup: (slotIndex) => {
    const { money, coolingSlots, backupSlots, classrooms, generatorLevel, setErrorMessage, globalModifiers } = get()
    if (backupSlots[slotIndex]) return

    const initialLevel = 1
    const config = BACKUP_SYSTEMS[initialLevel - 1]
    const cost = config.cost * (1 - globalModifiers.costReduction)

    if (money < cost) return

     // Energy Check
    let totalEnergy = calculateTotalEnergy(classrooms, coolingSlots, backupSlots)
    
    totalEnergy += config.energy

    if (totalEnergy > GENERATOR_LEVELS[generatorLevel - 1].capacity) {
       setErrorMessage("Pas assez d'électricité !")
       return
    }

    const newSlots = [...backupSlots]
    newSlots[slotIndex] = { level: initialLevel }

    set({
      money: money - cost,
      backupSlots: newSlots
    })
  },

  upgradeBackup: (slotIndex) => {
    const { money, coolingSlots, backupSlots, classrooms, generatorLevel, setErrorMessage, globalModifiers } = get()
    const slot = backupSlots[slotIndex]
    if (!slot) return
    if (slot.level >= 10) return

    const nextConfig = BACKUP_SYSTEMS[slot.level]
    const cost = nextConfig.cost * (1 - globalModifiers.costReduction)

    if (money < cost) return

    // Energy Check
    let totalEnergy = calculateTotalEnergy(classrooms, coolingSlots, backupSlots)

    const currentEnergy = BACKUP_SYSTEMS[slot.level - 1].energy
    
    totalEnergy = totalEnergy - currentEnergy + nextConfig.energy

    if (totalEnergy > GENERATOR_LEVELS[generatorLevel - 1].capacity) {
       setErrorMessage("Pas assez d'électricité !")
       return
    }

    const newSlots = [...backupSlots]
    newSlots[slotIndex] = { level: slot.level + 1 }

    set({
      money: money - cost,
      backupSlots: newSlots
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

      // Classroom PC Income & CO2
      let classroomIncome = 0
      let classroomCo2 = 0
      let visualStudents = 0

      // Network Equipment Income
      let networkIncome = 0

      // Teachers Income
      let teacherIncome = 0

      Object.values(state.classrooms).forEach(classroom => {
          // PCs
          classroom.classroomSlots.forEach(slot => {
            if (slot) {
              const pc = CLASSROOM_PCS[slot.level - 1]
              classroomIncome += pc.income
              classroomCo2 += pc.co2
              visualStudents++
            }
          })

          // Network
          classroom.networkSlots.forEach(slot => {
            if (slot) {
              const network = NETWORK_EQUIPMENT[slot.level - 1]
              networkIncome += network.income
            }
          })
          
          // Teachers
          classroom.teacherSlots.forEach(slot => {
            if (slot) {
              const teacher = TEACHERS[slot.level - 1]
              teacherIncome += teacher.income
            }
          })
      })

      // Cooling Systems Income & CO2
      let coolingIncome = 0
      let coolingCo2 = 0

      state.coolingSlots.forEach((slot) => {
        if (slot) {
          const cooling = COOLING_SYSTEMS[slot.level - 1]
          coolingIncome += cooling.income
          coolingCo2 += cooling.co2
        }
      })

      // Backup Systems Income & CO2
      let backupIncome = 0
      let backupCo2 = 0

      state.backupSlots.forEach((slot) => {
        if (slot) {
          const backup = BACKUP_SYSTEMS[slot.level - 1]
          backupIncome += backup.income
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

      let researchIncome = 0
      if (isResearchRoomUnlocked) {
        Object.entries(state.labSectionLevels || {}).forEach(([sectionId, level]) => {
          const section = LAB_SECTIONS[sectionId]
          if (section) {
            researchIncome += section.baseRp * (level as number)
          }
        })
      }

      // Total Energy Usage (PCs + Network + Teachers + Cooling + Backup, not server room base energy)
      const currentEnergyUsage = calculateTotalEnergy(state.classrooms, state.coolingSlots, state.backupSlots)

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
