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
  RESEARCH_LAB_LEVELS,
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

interface GlobalModifiers {
    co2Reduction: number; // 0.0 to 1.0 (percentage reduced)
    costReduction: number; // 0.0 to 1.0 (percentage reduced)
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
  researchLabLevel: number; // New
  
  unlockedTechs: string[];
  globalModifiers: GlobalModifiers; // New

  serverSlots: (ServerSlot | null)[];
  classroomSlots: (ClassroomPCSlot | null)[];
  
  // Gym
  gymProfile: GymProfile | null;

  // Map
  rooms: RoomInstance[];
  inspectedRoomId: string | null;
  selectedRoomId: string | null;

  // Computed
  energyCapacity: number;
  energyUsage: number;
  studentCount: number;

  // Actions
  setInspectedRoomId: (id: string | null) => void;
  setSelectedRoomId: (id: string | null) => void;
  unlockRoom: (id: string) => void;
  
  upgradeGenerator: () => void;
  upgradeServerRoom: () => void;
  upgradeClassroom: () => void;
  upgradeGym: () => void;
  upgradeResearchLab: () => void; // New
  
  setGymProfile: (profile: GymProfile) => void;
  performGymActivity: () => void;

  unlockTech: (techId: string) => void;
  buyServer: (typeId: string) => void;
  upgradeServer: (slotIndex: number) => void;
  
  buyClassroomPC: (slotIndex: number) => void;
  upgradeClassroomPC: (slotIndex: number) => void;

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
  researchLabLevel: 1,
  
  unlockedTechs: ['T1'],
  globalModifiers: { co2Reduction: 0, costReduction: 0 },

  serverSlots: [null, null],
  classroomSlots: new Array(CLASSROOM_LEVELS[0].capacity).fill(null),
  
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
    const { money, generatorLevel, globalModifiers } = get();
    if (generatorLevel >= 10) return;

    const nextLevel = GENERATOR_LEVELS[generatorLevel]; 
    const cost = nextLevel.cost * (1 - globalModifiers.costReduction);

    if (money >= cost) {
      set({
        money: money - cost,
        generatorLevel: generatorLevel + 1,
        energyCapacity: nextLevel.capacity,
      });
    }
  },

  upgradeServerRoom: () => {
    const { money, serverRoomLevel, unlockedTechs, energyCapacity, globalModifiers } = get();
    if (serverRoomLevel >= 10) return;

    const nextLevelConfig = SERVER_ROOM_LEVELS[serverRoomLevel]; 
    const cost = nextLevelConfig.cost * (1 - globalModifiers.costReduction);

    // Checks
    if (money < cost) return;
    if (nextLevelConfig.techReq && !unlockedTechs.includes(nextLevelConfig.techReq)) return;
    if (energyCapacity < nextLevelConfig.energyReq) return; 

    // Resize slots array
    const currentSlots = get().serverSlots;
    const newSlots = new Array(nextLevelConfig.slots).fill(null);
    for(let i=0; i<currentSlots.length; i++) {
        newSlots[i] = currentSlots[i];
    }

    set({
      money: money - cost,
      serverRoomLevel: serverRoomLevel + 1,
      serverSlots: newSlots,
    });
  },

  upgradeClassroom: () => {
    const { money, classroomLevel, classroomSlots, globalModifiers } = get();
    if (classroomLevel >= 5) return;

    const nextLevel = CLASSROOM_LEVELS[classroomLevel]; 
    const cost = nextLevel.cost * (1 - globalModifiers.costReduction);
    
    if (money >= cost) {
        // Resize slots
        const newSlots = new Array(nextLevel.capacity).fill(null);
        for(let i=0; i<classroomSlots.length; i++) {
            newSlots[i] = classroomSlots[i];
        }

        set({
            money: money - cost,
            classroomLevel: classroomLevel + 1,
            classroomSlots: newSlots
        });
    }
  },

  upgradeGym: () => {
    const { money, gymLevel, gymProfile, globalModifiers } = get();
    if (gymLevel >= 4) return;
    
    if (gymLevel === 1 && !gymProfile) return;

    const nextLevel = GYM_LEVELS[gymLevel]; 
    const cost = nextLevel.cost * (1 - globalModifiers.costReduction);
    
    if (money >= cost) {
        set({
            money: money - cost,
            gymLevel: gymLevel + 1,
        });
    }
  },

  upgradeResearchLab: () => {
      const { money, researchLabLevel, globalModifiers } = get();
      if (researchLabLevel >= 5) return;

      const nextLevel = RESEARCH_LAB_LEVELS[researchLabLevel];
      const cost = nextLevel.cost * (1 - globalModifiers.costReduction);

      if (money >= cost) {
          set({
              money: money - cost,
              researchLabLevel: researchLabLevel + 1
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
    const { research, unlockedTechs, globalModifiers } = get();
    if (unlockedTechs.includes(techId)) return;

    const tech = TECH_TREE.find(t => t.id === techId);
    if (!tech) return;

    if (research >= tech.cost) {
        // Apply effects
        const newModifiers = { ...globalModifiers };
        tech.effects.forEach(effect => {
            if (effect.type === 'CO2_REDUCTION') {
                newModifiers.co2Reduction += Number(effect.value);
            } else if (effect.type === 'COST_REDUCTION') {
                newModifiers.costReduction += Number(effect.value);
            }
        });

        set({
            research: research - tech.cost,
            unlockedTechs: [...unlockedTechs, techId],
            globalModifiers: newModifiers
        });
    }
  },

  buyServer: (typeId) => {
    const { money, serverSlots, serverRoomLevel, globalModifiers } = get();
    
    const emptyIndex = serverSlots.findIndex(s => s === null);
    if (emptyIndex === -1) return;

    const assetConfig = SERVER_ASSETS[typeId];
    if (!assetConfig) return;

    const cost = assetConfig.baseCost * (1 - globalModifiers.costReduction);

    if (serverRoomLevel < assetConfig.minRoomLevel) return;
    if (money < cost) return;

    const newSlots = [...serverSlots];
    newSlots[emptyIndex] = { typeId, grade: 1 };

    set({
        money: money - cost,
        serverSlots: newSlots
    });
  },

  upgradeServer: (slotIndex) => {
    const { money, serverSlots, globalModifiers } = get();
    const slot = serverSlots[slotIndex];
    if (!slot) return;

    const assetConfig = SERVER_ASSETS[slot.typeId];
    const nextGrade = slot.grade + 1;
    if (nextGrade > 3) return;

    const gradeConfig = assetConfig.grades.find(g => g.grade === nextGrade);
    if (!gradeConfig) return;

    const cost = gradeConfig.upgradeCost * (1 - globalModifiers.costReduction);

    if (money >= cost) {
        const newSlots = [...serverSlots];
        newSlots[slotIndex] = { ...slot, grade: nextGrade };
        set({
            money: money - cost,
            serverSlots: newSlots
        });
    }
  },

  buyClassroomPC: (slotIndex) => {
      const { money, classroomSlots, globalModifiers } = get();
      if (classroomSlots[slotIndex]) return; 

      const pcConfig = CLASSROOM_PCS[0]; 
      const cost = pcConfig.cost * (1 - globalModifiers.costReduction);

      if (money >= cost) {
          const newSlots = [...classroomSlots];
          newSlots[slotIndex] = { level: 1 };
          set({
              money: money - cost,
              classroomSlots: newSlots
          });
      }
  },

  upgradeClassroomPC: (slotIndex) => {
      const { money, classroomSlots, globalModifiers } = get();
      const slot = classroomSlots[slotIndex];
      if (!slot) return;
      if (slot.level >= 10) return;

      const nextLevelConfig = CLASSROOM_PCS[slot.level]; 
      const cost = nextLevelConfig.cost * (1 - globalModifiers.costReduction);

      if (money >= cost) {
          const newSlots = [...classroomSlots];
          newSlots[slotIndex] = { level: slot.level + 1 };
          set({
              money: money - cost,
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

      // Apply CO2 Reduction from Techs
      totalCo2 = totalCo2 * (1 - state.globalModifiers.co2Reduction);

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

      // Research Lab Income
      const researchConfig = RESEARCH_LAB_LEVELS[state.researchLabLevel - 1];
      const researchIncome = researchConfig.rpGeneration;

      // Total Energy Usage
      const currentEnergyUsage = roomConfig.energyReq + classroomEnergy;

      const generatorConfig = GENERATOR_LEVELS[state.generatorLevel - 1];
      const currentCapacity = generatorConfig.capacity;

      const isPowered = currentCapacity >= currentEnergyUsage;
      const finalIncome = isPowered ? (netServerIncome + classroomIncome) : 0;

      return {
        tick: state.tick + 1,
        money: state.money + finalIncome,
        research: state.research + (isPowered ? researchIncome : 0), // Lab needs power? Let's assume yes for now, or maybe it's separate. Let's assume it needs power to function if we want to be strict, but for now let's just give it. Actually, let's make it depend on global power.
        co2: state.co2 + totalCo2,
        energyCapacity: currentCapacity,
        energyUsage: currentEnergyUsage,
        studentCount: visualStudents 
      };
    });
  },
}));
