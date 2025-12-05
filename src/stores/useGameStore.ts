import { create } from 'zustand';
import { 
  GAME_CONFIG, 
  GENERATOR_LEVELS, 
  SERVER_ROOM_LEVELS, 
  SERVER_ASSETS, 
  TECH_TREE,
  CLASSROOM_LEVELS,
  CLASSROOM_PCS,
  GYM_LEVELS,
  GYM_ACTIVITIES,
  DEFAULT_MAP
} from '../config/gameConfig';

interface ServerSlot {
  typeId: string; // 'tower', 'rack', 'quantum'
  grade: number; // 1, 2, 3
}

interface ClassroomPCSlot {
    level: number; // 1-10
}

interface RoomInstance {
  id: string;
  type: string;
  x: number;
  y: number;
  unlocked: boolean;
  cost: number;
}

interface GymProfile {
    goal: string;
    frequency: string;
}

interface GameState {
  money: number;
  research: number;
  co2: number;
  maxCo2: number;
  tick: number;

  // Progression
  generatorLevel: number;
  serverRoomLevel: number;
  classroomLevel: number;
  gymLevel: number;
  
  unlockedTechs: string[];
  serverSlots: (ServerSlot | null)[];
  classroomSlots: (ClassroomPCSlot | null)[]; // New
  
  // Gym
  gymProfile: GymProfile | null;

  // Map
  rooms: RoomInstance[];
  inspectedRoomId: string | null;
  selectedRoomId: string | null;

  // Computed
  energyCapacity: number;
  energyUsage: number;
  studentCount: number; // Visual only now

  // Actions
  setInspectedRoomId: (id: string | null) => void;
  setSelectedRoomId: (id: string | null) => void;
  unlockRoom: (id: string) => void;
  
  upgradeGenerator: () => void;
  upgradeServerRoom: () => void;
  upgradeClassroom: () => void;
  upgradeGym: () => void;
  
  setGymProfile: (profile: GymProfile) => void;
  performGymActivity: () => void;

  unlockTech: (techId: string) => void;
  buyServer: (typeId: string) => void;
  upgradeServer: (slotIndex: number) => void;
  
  buyClassroomPC: (slotIndex: number) => void; // New
  upgradeClassroomPC: (slotIndex: number) => void; // New

  tickUpdate: () => void;
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
  
  unlockedTechs: ['T1'],
  serverSlots: [null, null],
  classroomSlots: new Array(CLASSROOM_LEVELS[0].capacity).fill(null), // Start empty slots
  
  gymProfile: null,

  rooms: DEFAULT_MAP,
  inspectedRoomId: null,
  selectedRoomId: null,

  energyCapacity: GENERATOR_LEVELS[0].capacity,
  energyUsage: SERVER_ROOM_LEVELS[0].energyReq,
  studentCount: 0,

  setInspectedRoomId: (id) => set({ inspectedRoomId: id }),
  setSelectedRoomId: (id) => set({ selectedRoomId: id }),

  unlockRoom: (id) => {
    const { money, rooms } = get();
    const roomIndex = rooms.findIndex(r => r.id === id);
    if (roomIndex === -1) return;

    const room = rooms[roomIndex];
    if (room.unlocked) return;

    if (money >= room.cost) {
        const newRooms = [...rooms];
        newRooms[roomIndex] = { ...room, unlocked: true };
        set({
            money: money - room.cost,
            rooms: newRooms,
            inspectedRoomId: id
        });
    }
  },

  upgradeGenerator: () => {
    const { money, generatorLevel } = get();
    if (generatorLevel >= 10) return;

    const nextLevel = GENERATOR_LEVELS[generatorLevel]; 
    
    if (money >= nextLevel.cost) {
      set({
        money: money - nextLevel.cost,
        generatorLevel: generatorLevel + 1,
        energyCapacity: nextLevel.capacity,
      });
    }
  },

  upgradeServerRoom: () => {
    const { money, serverRoomLevel, unlockedTechs, energyCapacity } = get();
    if (serverRoomLevel >= 10) return;

    const nextLevelConfig = SERVER_ROOM_LEVELS[serverRoomLevel]; 

    // Checks
    if (money < nextLevelConfig.cost) return;
    if (nextLevelConfig.techReq && !unlockedTechs.includes(nextLevelConfig.techReq)) return;
    if (energyCapacity < nextLevelConfig.energyReq) return; 

    // Resize slots array
    const currentSlots = get().serverSlots;
    const newSlots = new Array(nextLevelConfig.slots).fill(null);
    for(let i=0; i<currentSlots.length; i++) {
        newSlots[i] = currentSlots[i];
    }

    set({
      money: money - nextLevelConfig.cost,
      serverRoomLevel: serverRoomLevel + 1,
      serverSlots: newSlots,
    });
  },

  upgradeClassroom: () => {
    const { money, classroomLevel, classroomSlots } = get();
    if (classroomLevel >= 5) return;

    const nextLevel = CLASSROOM_LEVELS[classroomLevel]; 
    
    if (money >= nextLevel.cost) {
        // Resize slots
        const newSlots = new Array(nextLevel.capacity).fill(null);
        for(let i=0; i<classroomSlots.length; i++) {
            newSlots[i] = classroomSlots[i];
        }

        set({
            money: money - nextLevel.cost,
            classroomLevel: classroomLevel + 1,
            classroomSlots: newSlots
        });
    }
  },

  upgradeGym: () => {
    const { money, gymLevel, gymProfile } = get();
    if (gymLevel >= 4) return;
    
    if (gymLevel === 1 && !gymProfile) return;

    const nextLevel = GYM_LEVELS[gymLevel]; 
    
    if (money >= nextLevel.cost) {
        set({
            money: money - nextLevel.cost,
            gymLevel: gymLevel + 1,
        });
    }
  },

  setGymProfile: (profile) => {
      set({ gymProfile: profile });
  },

  performGymActivity: () => {
      const { money, gymLevel, gymProfile } = get();
      if (!gymProfile) return;

      const activity = GYM_ACTIVITIES[gymProfile.goal as keyof typeof GYM_ACTIVITIES];
      if (!activity) return;

      let reward = 100; 
      if (gymLevel >= 3) reward += 50; 
      if (gymLevel >= 4) reward += activity.product.reward; 

      set({ money: money + reward });
  },

  unlockTech: (techId) => {
    const { money, unlockedTechs } = get();
    if (unlockedTechs.includes(techId)) return;

    const tech = TECH_TREE.find(t => t.id === techId);
    if (!tech) return;

    if (money >= tech.cost) {
        set({
            money: money - tech.cost,
            unlockedTechs: [...unlockedTechs, techId]
        });
    }
  },

  buyServer: (typeId) => {
    const { money, serverSlots, serverRoomLevel } = get();
    
    const emptyIndex = serverSlots.findIndex(s => s === null);
    if (emptyIndex === -1) return;

    const assetConfig = SERVER_ASSETS[typeId];
    if (!assetConfig) return;

    if (serverRoomLevel < assetConfig.minRoomLevel) return;
    if (money < assetConfig.baseCost) return;

    const newSlots = [...serverSlots];
    newSlots[emptyIndex] = { typeId, grade: 1 };

    set({
        money: money - assetConfig.baseCost,
        serverSlots: newSlots
    });
  },

  upgradeServer: (slotIndex) => {
    const { money, serverSlots } = get();
    const slot = serverSlots[slotIndex];
    if (!slot) return;

    const assetConfig = SERVER_ASSETS[slot.typeId];
    const nextGrade = slot.grade + 1;
    if (nextGrade > 3) return;

    const gradeConfig = assetConfig.grades.find(g => g.grade === nextGrade);
    if (!gradeConfig) return;

    if (money >= gradeConfig.upgradeCost) {
        const newSlots = [...serverSlots];
        newSlots[slotIndex] = { ...slot, grade: nextGrade };
        set({
            money: money - gradeConfig.upgradeCost,
            serverSlots: newSlots
        });
    }
  },

  buyClassroomPC: (slotIndex) => {
      const { money, classroomSlots } = get();
      if (classroomSlots[slotIndex]) return; // Already occupied

      const pcConfig = CLASSROOM_PCS[0]; // Level 1: PC Patate
      if (money >= pcConfig.cost) {
          const newSlots = [...classroomSlots];
          newSlots[slotIndex] = { level: 1 };
          set({
              money: money - pcConfig.cost,
              classroomSlots: newSlots
          });
      }
  },

  upgradeClassroomPC: (slotIndex) => {
      const { money, classroomSlots } = get();
      const slot = classroomSlots[slotIndex];
      if (!slot) return;
      if (slot.level >= 10) return;

      const nextLevelConfig = CLASSROOM_PCS[slot.level]; // Index matches next level (0-based array vs 1-based level)
      // CLASSROOM_PCS[0] is Lvl 1. CLASSROOM_PCS[1] is Lvl 2.
      // If current is Lvl 1, next is Lvl 2 (index 1).
      // So index = slot.level.

      if (money >= nextLevelConfig.cost) {
          const newSlots = [...classroomSlots];
          newSlots[slotIndex] = { level: slot.level + 1 };
          set({
              money: money - nextLevelConfig.cost,
              classroomSlots: newSlots
          });
      }
  },

  tickUpdate: () => {
    set((state) => {
      let grossServerIncome = 0;
      let totalCo2 = 0;

      // Server Room Income
      state.serverSlots.forEach(slot => {
        if (!slot) return;
        const asset = SERVER_ASSETS[slot.typeId];
        const grade = asset.grades.find(g => g.grade === slot.grade);
        if (grade) {
            grossServerIncome += grade.income;
            totalCo2 += grade.co2;
        }
      });

      const roomConfig = SERVER_ROOM_LEVELS[state.serverRoomLevel - 1];
      const taxAmount = grossServerIncome * roomConfig.taxRate;
      const netServerIncome = grossServerIncome - taxAmount;

      // Classroom PC Income & Energy
      let classroomIncome = 0;
      let classroomEnergy = 0;
      let visualStudents = 0;

      state.classroomSlots.forEach(slot => {
          if (slot) {
              const pc = CLASSROOM_PCS[slot.level - 1];
              classroomIncome += pc.income;
              classroomEnergy += pc.energy;
              visualStudents++;
          }
      });

      // Total Energy Usage
      const currentEnergyUsage = roomConfig.energyReq + classroomEnergy;

      const generatorConfig = GENERATOR_LEVELS[state.generatorLevel - 1];
      const currentCapacity = generatorConfig.capacity;

      const isPowered = currentCapacity >= currentEnergyUsage;
      const finalIncome = isPowered ? (netServerIncome + classroomIncome) : 0;

      return {
        tick: state.tick + 1,
        money: state.money + finalIncome,
        co2: state.co2 + totalCo2,
        energyCapacity: currentCapacity,
        energyUsage: currentEnergyUsage,
        studentCount: visualStudents // Update visual count based on active PCs
      };
    });
  },
}));
