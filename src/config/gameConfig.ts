export const GAME_CONFIG = {
  INITIAL_MONEY: 2000,
  INITIAL_ENERGY: 0,
  INITIAL_RESEARCH: 0,
  INITIAL_CO2: 0,
  MAX_CO2_BASE: 100,
  TICK_RATE_MS: 1000,
}

// --- 1. GENERATOR ROOM (Energy Cap) ---
export interface GeneratorLevel {
  level: number
  name: string
  cost: number
  capacity: number
  description: string
}

export const GENERATOR_LEVELS: GeneratorLevel[] = [
  {
    level: 1,
    name: 'Raccordement Domestique',
    cost: 0,
    capacity: 30,
    description: 'Compteur électrique standard',
  },
  {
    level: 2,
    name: 'Groupe Électrogène Diesel',
    cost: 800,
    capacity: 60,
    description: 'Générateur bruyant qui fume',
  },
  {
    level: 3,
    name: 'Panneaux Solaires Toit',
    cost: 2000,
    capacity: 100,
    description: 'Quelques panneaux bleus',
  },
  {
    level: 4,
    name: 'Éolienne Individuelle',
    cost: 5000,
    capacity: 150,
    description: 'Une éolienne qui tourne',
  },
  {
    level: 5,
    name: 'Transformateur Industriel',
    cost: 10000,
    capacity: 220,
    description: 'Gros boitier gris Haute Tension',
  },
  {
    level: 6,
    name: 'Champ Solaire',
    cost: 25000,
    capacity: 350,
    description: 'Le toit est couvert de panneaux',
  },
  {
    level: 7,
    name: 'Barrage Hydro (Contrat)',
    cost: 60000,
    capacity: 500,
    description: 'Câbles énormes arrivant au bâtiment',
  },
  {
    level: 8,
    name: 'Réacteur Biomasse',
    cost: 120000,
    capacity: 700,
    description: 'Cuves vertes connectées',
  },
  {
    level: 9,
    name: 'Mini-Réacteur Nucléaire',
    cost: 300000,
    capacity: 1000,
    description: 'Cylindre brillant futuriste',
  },
  {
    level: 10,
    name: 'Fusion Froide (ARC)',
    cost: 1000000,
    capacity: 2000,
    description: "Anneau d'énergie pure",
  },
]

// --- 2. SERVER ROOM (The Container) ---
export interface ServerRoomLevel {
  level: number
  name: string
  cost: number
  slots: number
  energyReq: number
  taxRate: number
  techReq: string | null
}

export const SERVER_ROOM_LEVELS: ServerRoomLevel[] = [
  {
    level: 1,
    name: 'Placard Serveur',
    cost: 0,
    slots: 2,
    energyReq: 10,
    taxRate: 0.5,
    techReq: 'T1',
  },
  {
    level: 2,
    name: 'Salle Ventilée',
    cost: 1500,
    slots: 4,
    energyReq: 25,
    taxRate: 0.45,
    techReq: null,
  },
  {
    level: 3,
    name: 'Petite Salle IT',
    cost: 3500,
    slots: 6,
    energyReq: 45,
    taxRate: 0.4,
    techReq: 'T2',
  },
  {
    level: 4,
    name: 'Data Center Junior',
    cost: 7500,
    slots: 8,
    energyReq: 80,
    taxRate: 0.35,
    techReq: null,
  },
  {
    level: 5,
    name: 'Salle Climatisée',
    cost: 12000,
    slots: 10,
    energyReq: 120,
    taxRate: 0.3,
    techReq: 'T3',
  },
  {
    level: 6,
    name: 'Baies Haute Densité',
    cost: 25000,
    slots: 12,
    energyReq: 180,
    taxRate: 0.25,
    techReq: 'T4',
  },
  {
    level: 7,
    name: 'Salle "Cold Corridor"',
    cost: 45000,
    slots: 16,
    energyReq: 250,
    taxRate: 0.2,
    techReq: 'T5',
  },
  {
    level: 8,
    name: 'Green Data Center',
    cost: 80000,
    slots: 20,
    energyReq: 350,
    taxRate: 0.1,
    techReq: 'T6',
  },
  {
    level: 9,
    name: 'Immersion Cooling',
    cost: 150000,
    slots: 24,
    energyReq: 500,
    taxRate: 0.05,
    techReq: 'T7',
  },
  {
    level: 10,
    name: 'Sanctuaire Quantique',
    cost: 500000,
    slots: 30,
    energyReq: 800,
    taxRate: 0.0,
    techReq: 'T8',
  },
]

// --- 3. ASSETS (Servers) ---
export interface ServerAssetGrade {
  grade: number
  name: string
  upgradeCost: number
  income: number
  co2: number
}

export interface ServerAssetType {
  id: string
  name: string
  baseCost: number
  minRoomLevel: number
  techReq?: string // Optional tech requirement
  grades: ServerAssetGrade[]
}

export const SERVER_ASSETS: Record<string, ServerAssetType> = {
  tower: {
    id: 'tower',
    name: 'Tour Obsolète',
    baseCost: 200,
    minRoomLevel: 1,
    grades: [
      { grade: 1, name: 'Standard', upgradeCost: 0, income: 15, co2: 10 },
      { grade: 2, name: 'Optimisé', upgradeCost: 150, income: 22, co2: 8 },
      { grade: 3, name: 'Overclocké', upgradeCost: 300, income: 30, co2: 6 },
    ],
  },
  rack: {
    id: 'rack',
    name: 'Serveur Rack',
    baseCost: 1200,
    minRoomLevel: 4,
    techReq: 'T_RACK', // Requires new tech
    grades: [
      { grade: 1, name: 'Standard', upgradeCost: 0, income: 80, co2: 5 },
      { grade: 2, name: 'Optimisé', upgradeCost: 800, income: 120, co2: 4 },
      { grade: 3, name: 'Green', upgradeCost: 1600, income: 160, co2: 3 },
    ],
  },
  quantum: {
    id: 'quantum',
    name: 'Lame Quantique',
    baseCost: 8500,
    minRoomLevel: 8,
    techReq: 'T_QUANTUM', // Requires new tech
    grades: [
      { grade: 1, name: 'Standard', upgradeCost: 0, income: 450, co2: 0 },
      { grade: 2, name: 'Stable', upgradeCost: 5000, income: 675, co2: 0 },
      { grade: 3, name: 'Parfaite', upgradeCost: 12000, income: 900, co2: 0 },
    ],
  },
}

// --- 4. TECH TREE ---
export type TechEffectType =
  | 'UNLOCK_ROOM_LEVEL'
  | 'CO2_REDUCTION'
  | 'COST_REDUCTION'
  | 'UNLOCK_FEATURE'

export interface TechEffect {
  type: TechEffectType
  value: number | string // e.g. 0.1 for 10% reduction, or 'server_room_3'
  target?: string // e.g. 'server_room'
}

export interface TechNode {
  id: string
  name: string
  cost: number
  description: string
  category: 'INFRA' | 'CLASSROOM' | 'GYM' | 'ARCADE' | 'ECOLOGY' | 'ECONOMY'
  effects: TechEffect[]
  reqs: string[] // List of Prerequisite tech IDs
  position: { x: number; y: number } // Grid position for UI: x (col), y (row)
}

export const TECH_TREE: TechNode[] = [
  // --- INFRASTRUCTURE (Server Room) [Cols 0-3] ---
  {
    id: 'T1',
    name: 'Réseau Basique',
    cost: 0,
    description: 'Débloque Server Room Niv 1',
    category: 'INFRA',
    effects: [{ type: 'UNLOCK_ROOM_LEVEL', value: 1, target: 'server' }],
    reqs: [],
    position: { x: 1, y: 0 },
  },
  {
    id: 'T2',
    name: 'Active Directory',
    cost: 1000,
    description: 'Débloque Server Room Niv 3',
    category: 'INFRA',
    effects: [{ type: 'UNLOCK_ROOM_LEVEL', value: 3, target: 'server' }],
    reqs: ['T1'],
    position: { x: 1, y: 1 },
  },
  {
    id: 'T3',
    name: 'Virtualisation',
    cost: 5000,
    description: 'Débloque Server Room Niv 5',
    category: 'INFRA',
    effects: [{ type: 'UNLOCK_ROOM_LEVEL', value: 5, target: 'server' }],
    reqs: ['T2'],
    position: { x: 1, y: 2 },
  },
  {
    id: 'T_RACK',
    name: 'Rack Mounts',
    cost: 7000,
    description: 'Débloque les serveurs Rack',
    category: 'INFRA',
    effects: [{ type: 'UNLOCK_FEATURE', value: 'rack', target: 'server' }],
    reqs: ['T3'],
    position: { x: 2, y: 2 }, // Branch
  },
  {
    id: 'T4',
    name: 'Conteneurisation',
    cost: 10000,
    description: 'Débloque Server Room Niv 6',
    category: 'INFRA',
    effects: [{ type: 'UNLOCK_ROOM_LEVEL', value: 6, target: 'server' }],
    reqs: ['T3'],
    position: { x: 1, y: 3 },
  },
  {
    id: 'T5',
    name: 'Efficience Énergétique',
    cost: 20000,
    description: 'Débloque Server Room Niv 7',
    category: 'INFRA',
    effects: [{ type: 'UNLOCK_ROOM_LEVEL', value: 7, target: 'server' }],
    reqs: ['T4'],
    position: { x: 1, y: 4 },
  },
  {
    id: 'T6',
    name: 'Cloud Hybride',
    cost: 40000,
    description: 'Débloque Server Room Niv 8',
    category: 'INFRA',
    effects: [{ type: 'UNLOCK_ROOM_LEVEL', value: 8, target: 'server' }],
    reqs: ['T5'],
    position: { x: 0, y: 5 },
  },
  {
    id: 'T7',
    name: 'Refroidissement Liquide',
    cost: 80000,
    description: 'Débloque Server Room Niv 9',
    category: 'INFRA',
    effects: [{ type: 'UNLOCK_ROOM_LEVEL', value: 9, target: 'server' }],
    reqs: ['T5'],
    position: { x: 2, y: 5 },
  },
  {
    id: 'T8',
    name: 'Stabilité Quantique',
    cost: 200000,
    description: 'Débloque Server Room Niv 10',
    category: 'INFRA',
    effects: [{ type: 'UNLOCK_ROOM_LEVEL', value: 10, target: 'server' }],
    reqs: ['T6', 'T7'],
    position: { x: 1, y: 6 },
  },
  {
    id: 'T_QUANTUM',
    name: 'Physique Quantique',
    cost: 300000,
    description: 'Débloque les serveurs Quantiques',
    category: 'INFRA',
    effects: [{ type: 'UNLOCK_FEATURE', value: 'quantum', target: 'server' }],
    reqs: ['T8'],
    position: { x: 2, y: 6 }, // Next to T8
  },

  // --- CLASSROOM [Cols 4-7] ---
  {
    id: 'C1',
    name: 'Pédagogie 1.0',
    cost: 200,
    description: 'Débloque le recrutement de Surveillants',
    category: 'CLASSROOM',
    effects: [{ type: 'UNLOCK_FEATURE', value: 'teacher_1', target: 'classroom' }],
    reqs: [],
    position: { x: 5, y: 0 },
  },
  {
    id: 'C2',
    name: 'Postes Informatiques',
    cost: 500,
    description: 'Débloque les PCs Basiques',
    category: 'CLASSROOM',
    effects: [{ type: 'UNLOCK_FEATURE', value: 'pc_1', target: 'classroom' }],
    reqs: ['C1'],
    position: { x: 6, y: 0 },
  },
  {
    id: 'C3',
    name: 'Réseau Scolaire',
    cost: 1500,
    description: 'Débloque le Câblage Ethernet et Wi-Fi',
    category: 'CLASSROOM',
    effects: [{ type: 'UNLOCK_FEATURE', value: 'network_1', target: 'classroom' }],
    reqs: ['C2'],
    position: { x: 5, y: 1 },
  },
  {
    id: 'C4',
    name: 'Formation Continue',
    cost: 4000,
    description: 'Débloque les Professeurs Certifiés',
    category: 'CLASSROOM',
    effects: [{ type: 'UNLOCK_FEATURE', value: 'teacher_4', target: 'classroom' }],
    reqs: ['C1'],
    position: { x: 4, y: 1 },
  },
  {
    id: 'C5',
    name: 'E-Learning',
    cost: 8000,
    description: 'Débloque les PCs Avancés (Tour Gamer)',
    category: 'CLASSROOM',
    effects: [{ type: 'UNLOCK_FEATURE', value: 'pc_4', target: 'classroom' }],
    reqs: ['C3', 'C4'],
    position: { x: 5, y: 2 },
  },
  {
    id: 'C6',
    name: 'Haut Débit',
    cost: 15000,
    description: 'Débloque la Fibre Optique',
    category: 'CLASSROOM',
    effects: [{ type: 'UNLOCK_FEATURE', value: 'network_4', target: 'classroom' }],
    reqs: ['C3'],
    position: { x: 6, y: 2 },
  },
  {
    id: 'C7',
    name: 'Réalité Virtuelle',
    cost: 40000,
    description: 'Débloque les Stations de Montage',
    category: 'CLASSROOM',
    effects: [{ type: 'UNLOCK_FEATURE', value: 'pc_7', target: 'classroom' }],
    reqs: ['C5', 'C6'],
    position: { x: 5, y: 3 },
  },
  {
    id: 'C8',
    name: 'Campus I.A.',
    cost: 100000,
    description: 'Débloque les Docteurs en IT',
    category: 'CLASSROOM',
    effects: [{ type: 'UNLOCK_FEATURE', value: 'teacher_6', target: 'classroom' }],
    reqs: ['C7'],
    position: { x: 5, y: 4 },
  },

  // --- GYM [Cols 8-10] ---
  {
    id: 'G1',
    name: 'Éducation Physique',
    cost: 1000,
    description: 'Débloque le Profilage (Niv 1)',
    category: 'GYM',
    effects: [{ type: 'UNLOCK_ROOM_LEVEL', value: 1, target: 'gym' }],
    reqs: [],
    position: { x: 9, y: 0 },
  },
  {
    id: 'G2',
    name: 'Nutrition Sportive',
    cost: 3000,
    description: 'Débloque le Coaching (Niv 2)',
    category: 'GYM',
    effects: [{ type: 'UNLOCK_ROOM_LEVEL', value: 2, target: 'gym' }],
    reqs: ['G1'],
    position: { x: 9, y: 1 },
  },
  {
    id: 'G3',
    name: 'Équipement Pro',
    cost: 8000,
    description: 'Meilleurs résultats (Bonus passif)',
    category: 'GYM',
    effects: [{ type: 'COST_REDUCTION', value: 0.05 }],
    reqs: ['G2'],
    position: { x: 8, y: 2 },
  },
  {
    id: 'G4',
    name: 'Marketing Sportif',
    cost: 15000,
    description: 'Débloque le Visuel (Niv 3)',
    category: 'GYM',
    effects: [{ type: 'UNLOCK_ROOM_LEVEL', value: 3, target: 'gym' }],
    reqs: ['G2'],
    position: { x: 10, y: 2 },
  },
  {
    id: 'G5',
    name: 'Sponsoring',
    cost: 30000,
    description: 'Débloque la Monétisation (Niv 4)',
    category: 'GYM',
    effects: [{ type: 'UNLOCK_ROOM_LEVEL', value: 4, target: 'gym' }],
    reqs: ['G4'],
    position: { x: 9, y: 3 },
  },
  {
    id: 'G6',
    name: 'Compétitions',
    cost: 60000,
    description: 'Augmente les rewards Gym',
    category: 'GYM',
    effects: [{ type: 'COST_REDUCTION', value: 0.1 }], // Placeholder effect
    reqs: ['G5'],
    position: { x: 9, y: 4 },
  },

  // --- ARCADE [Cols 11-13] ---
  {
    id: 'A1',
    name: 'Bornes d\'Arcade',
    cost: 5000,
    description: 'Débloque l\'Arcade Room (Future)',
    category: 'ARCADE',
    effects: [],
    reqs: [],
    position: { x: 12, y: 0 },
  },
  {
    id: 'A2',
    name: 'Jeux Rétro',
    cost: 10000,
    description: 'Améliore l\'attractivité',
    category: 'ARCADE',
    effects: [],
    reqs: ['A1'],
    position: { x: 12, y: 1 },
  },
  {
    id: 'A3',
    name: 'Réalité Augmentée',
    cost: 25000,
    description: 'Technologie AR',
    category: 'ARCADE',
    effects: [],
    reqs: ['A2'],
    position: { x: 11, y: 2 },
  },
  {
    id: 'A4',
    name: 'Metaverse',
    cost: 60000,
    description: 'Immersion totale',
    category: 'ARCADE',
    effects: [],
    reqs: ['A3'],
    position: { x: 12, y: 3 },
  },
  {
    id: 'A5',
    name: 'eSports',
    cost: 150000,
    description: 'Compétitions Mondiales',
    category: 'ARCADE',
    effects: [],
    reqs: ['A4'],
    position: { x: 13, y: 3 },
  },

  // ECOLOGY (CO2 Reduction) - Cols 0-2 (Lower rows)
  {
    id: 'E1',
    name: 'Recyclage Papier',
    cost: 500,
    description: '-5% CO2 Global',
    category: 'ECOLOGY',
    effects: [{ type: 'CO2_REDUCTION', value: 0.05 }],
    reqs: [],
    position: { x: 0, y: 8 },
  },
  {
    id: 'E2',
    name: 'Ampoules LED',
    cost: 2000,
    description: '-10% CO2 Global',
    category: 'ECOLOGY',
    effects: [{ type: 'CO2_REDUCTION', value: 0.1 }],
    reqs: ['E1'],
    position: { x: 1, y: 8 },
  },
  {
    id: 'E3',
    name: 'Politique Zéro Déchet',
    cost: 8000,
    description: '-15% CO2 Global',
    category: 'ECOLOGY',
    effects: [{ type: 'CO2_REDUCTION', value: 0.15 }],
    reqs: ['E2'],
    position: { x: 2, y: 8 },
  },
  
  // ECONOMY (Cost Reduction) - Cols 4-6 (Lower rows)
  {
    id: 'M1',
    name: 'Achats Groupés',
    cost: 1500,
    description: '-5% Coûts Amélioration',
    category: 'ECONOMY',
    effects: [{ type: 'COST_REDUCTION', value: 0.05 }],
    reqs: [],
    position: { x: 4, y: 8 },
  },
  {
    id: 'M2',
    name: 'Optimisation Fiscale',
    cost: 5000,
    description: '-10% Coûts Amélioration',
    category: 'ECONOMY',
    effects: [{ type: 'COST_REDUCTION', value: 0.1 }],
    reqs: ['M1'],
    position: { x: 5, y: 8 },
  },
]

// --- 5. CLASSROOM CONFIG ---
export interface ClassroomLevel {
  level: number
  name: string
  cost: number
  capacity: number
  techReq?: string 
}

export const CLASSROOM_LEVELS: ClassroomLevel[] = [
  { level: 1, name: 'Salle de TD', cost: 0, capacity: 5 },
  { level: 2, name: 'Amphi 101', cost: 2000, capacity: 10, techReq: 'C2' },
  { level: 3, name: 'Grand Amphi', cost: 5000, capacity: 20, techReq: 'C3' },
  { level: 4, name: 'Campus Numérique', cost: 15000, capacity: 40, techReq: 'C5' },
  { level: 5, name: 'Université Tech', cost: 50000, capacity: 80, techReq: 'C8' },
]

export interface ClassroomPC {
  level: number
  name: string
  cost: number
  energy: number
  income: number
  co2: number
  icon: string
  techReq?: string
}

export const CLASSROOM_PCS: ClassroomPC[] = [
  { level: 1, name: 'PC Patate', cost: 100, energy: 1, income: 5, co2: 1, icon: '🥔' },
  { level: 2, name: 'PC Bureautique', cost: 180, energy: 2, income: 10, co2: 2, icon: '🖥️', techReq: 'C2' },
  { level: 3, name: 'Laptop Étudiant', cost: 325, energy: 3, income: 20, co2: 3, icon: '💻', techReq: 'C2' },
  { level: 4, name: 'Tour Gamer', cost: 600, energy: 4, income: 40, co2: 5, icon: '🕹️', techReq: 'C4' },
  { level: 5, name: 'Station de Montage', cost: 1100, energy: 5, income: 80, co2: 8, icon: '🎬', techReq: 'C7' },
  { level: 6, name: 'Serveur Rack', cost: 2000, energy: 6, income: 160, co2: 12, icon: '📼', techReq: 'C7' },
  { level: 7, name: 'Mining Rig', cost: 3600, energy: 7, income: 320, co2: 20, icon: '⛏️', techReq: 'C8' },
  { level: 8, name: 'Supercalculateur', cost: 6500, energy: 8, income: 640, co2: 35, icon: '🗄️', techReq: 'C8' },
  {
    level: 9,
    name: 'Ordinateur Quantique',
    cost: 12000,
    energy: 9,
    income: 1280,
    co2: 60,
    icon: '🔮',
    techReq: 'T_QUANTUM', // Cross-dependency!
  },
  { level: 10, name: 'I.A. Suprême', cost: 22000, energy: 10, income: 2560, co2: 100, icon: '🧠', techReq: 'T_QUANTUM' },
]

// --- 5.5. NETWORK EQUIPMENT ---
export interface NetworkEquipment {
  level: number
  name: string
  cost: number
  energy: number
  income: number // Direct income per tick
  icon: string
  techReq?: string
}

export const NETWORK_EQUIPMENT: NetworkEquipment[] = [
  { level: 1, name: 'Câble Ethernet', cost: 500, energy: 5, income: 10, icon: '🔵', techReq: 'C3' },
  { level: 2, name: 'Wi-Fi Public', cost: 1250, energy: 5, income: 25, icon: '📡', techReq: 'C3' },
  { level: 3, name: 'Switch 100Mb', cost: 3100, energy: 5, income: 50, icon: '📦', techReq: 'C5' },
  { level: 4, name: 'Fibre Optique', cost: 7800, energy: 5, income: 100, icon: '💡', techReq: 'C6' },
  { level: 5, name: '5G Privée', cost: 19500, energy: 5, income: 200, icon: '📶', techReq: 'C6' },
  { level: 6, name: 'Cloud Local', cost: 48000, energy: 5, income: 400, icon: '☁️', techReq: 'C8' },
  { level: 7, name: 'Satellite Link', cost: 120000, energy: 5, income: 800, icon: '🛰️', techReq: 'C8' },
  { level: 8, name: 'Réseau Neuronal', cost: 300000, energy: 5, income: 1600, icon: '🧠', techReq: 'T_QUANTUM' },
  { level: 9, name: 'Télépathie', cost: 750000, energy: 5, income: 3200, icon: '💜', techReq: 'T_QUANTUM' },
  {
    level: 10,
    name: 'Internet Galactique',
    cost: 2000000,
    energy: 5,
    income: 6400,
    icon: '🌍',
    techReq: 'T_QUANTUM',
  },
]

// --- 5.6. TEACHERS ---
export interface Teacher {
  level: number
  name: string
  cost: number
  energy: number
  income: number
  icon: string
  techReq?: string
}

export const TEACHERS: Teacher[] = [
  { level: 1, name: 'Surveillant', cost: 2500, energy: 1, income: 150, icon: '🪑', techReq: 'C1' },
  { level: 2, name: 'Vacataire', cost: 4500, energy: 2, income: 300, icon: '📄', techReq: 'C1' },
  { level: 3, name: "Instit'", cost: 8500, energy: 2, income: 600, icon: '📝', techReq: 'C4' },
  { level: 4, name: 'Professeur Certifié', cost: 18000, energy: 3, income: 1300, icon: '👔', techReq: 'C4' },
  { level: 5, name: 'Chef de Projet', cost: 38000, energy: 4, income: 3000, icon: '💻', techReq: 'C4' },
  { level: 6, name: 'Docteur en IT', cost: 85000, energy: 5, income: 7000, icon: '🥼', techReq: 'C8' },
  { level: 7, name: 'Conférencier Star', cost: 200000, energy: 6, income: 18000, icon: '🎤', techReq: 'C8' },
  { level: 8, name: 'Génie Solitaire', cost: 500000, energy: 8, income: 45000, icon: '🧢', techReq: 'C8' },
  { level: 9, name: 'Oracle Numérique', cost: 1200000, energy: 10, income: 120000, icon: '🥽', techReq: 'T_QUANTUM' },
  { level: 10, name: 'Entité I.A.', cost: 3000000, energy: 15, income: 350000, icon: '✨', techReq: 'T_QUANTUM' },
]

// --- 3.5. COOLING SYSTEMS (Server Room) ---
export interface CoolingSystem {
  level: number
  name: string
  cost: number
  energy: number
  income: number // Income boost or direct income
  co2: number
  icon: string
}

export const COOLING_SYSTEMS: CoolingSystem[] = [
  { level: 1, name: 'Ventilateur USB', cost: 300, energy: 2, income: 20, co2: 2, icon: '🌀' },
  { level: 2, name: 'Ventilo 120mm', cost: 800, energy: 3, income: 50, co2: 3, icon: '💨' },
  {
    level: 3,
    name: 'Watercooling Basique',
    cost: 2000,
    energy: 4,
    income: 120,
    co2: 4,
    icon: '💧',
  },
  { level: 4, name: 'Radiateur Double', cost: 5000, energy: 5, income: 280, co2: 5, icon: '❄️' },
  {
    level: 5,
    name: 'Refroidissement Phase',
    cost: 12000,
    energy: 6,
    income: 650,
    co2: 6,
    icon: '🧊',
  },
  { level: 6, name: 'Liquid Nitrogen', cost: 30000, energy: 8, income: 1500, co2: 7, icon: '🌡️' },
  { level: 7, name: 'Immersion Totale', cost: 75000, energy: 10, income: 3500, co2: 8, icon: '🛁' },
  { level: 8, name: 'Cryogénie', cost: 180000, energy: 12, income: 8000, co2: 9, icon: '❄️' },
  { level: 9, name: 'Vide Quantique', cost: 450000, energy: 15, income: 20000, co2: 5, icon: '🌌' },
  { level: 10, name: 'Zéro Absolu', cost: 1200000, energy: 20, income: 50000, co2: 0, icon: '🔮' },
]

// --- 3.6. BACKUP SYSTEMS (Server Room) ---
export interface BackupSystem {
  level: number
  name: string
  cost: number
  energy: number
  income: number
  co2: number
  icon: string
}

export const BACKUP_SYSTEMS: BackupSystem[] = [
  { level: 1, name: 'Disque Dur Externe', cost: 500, energy: 1, income: 30, co2: 1, icon: '💾' },
  { level: 2, name: 'NAS Basique', cost: 1500, energy: 2, income: 80, co2: 2, icon: '📦' },
  { level: 3, name: 'RAID 5', cost: 4000, energy: 3, income: 200, co2: 3, icon: '🔀' },
  { level: 4, name: 'Cloud Backup', cost: 10000, energy: 4, income: 500, co2: 4, icon: '☁️' },
  { level: 5, name: 'Tape Library', cost: 25000, energy: 5, income: 1200, co2: 5, icon: '📼' },
  { level: 6, name: 'Mirror Site', cost: 60000, energy: 6, income: 3000, co2: 6, icon: '🪞' },
  {
    level: 7,
    name: 'Blockchain Backup',
    cost: 150000,
    energy: 8,
    income: 7500,
    co2: 7,
    icon: '⛓️',
  },
  {
    level: 8,
    name: 'Quantum Storage',
    cost: 400000,
    energy: 10,
    income: 20000,
    co2: 8,
    icon: '⚛️',
  },
  {
    level: 9,
    name: 'Dimension Parallèle',
    cost: 1000000,
    energy: 12,
    income: 50000,
    co2: 9,
    icon: '🌀',
  },
  {
    level: 10,
    name: 'Backup Temporel',
    cost: 2500000,
    energy: 15,
    income: 125000,
    co2: 10,
    icon: '⏰',
  },
]

// --- 6. GYM ---
export interface GymLevel {
  level: number
  name: string
  cost: number
  description: string
  techReq?: string
}

export const GYM_LEVELS: GymLevel[] = [
  { level: 1, name: 'Profilage', cost: 0, description: 'Définissez votre profil sportif', techReq: 'G1' },
  { level: 2, name: 'Coaching', cost: 2000, description: 'Instructions personnalisées', techReq: 'G2' },
  { level: 3, name: 'Visuel', cost: 5000, description: 'Démonstrations animées', techReq: 'G4' },
  { level: 4, name: 'Monétisation', cost: 10000, description: 'Partenariats commerciaux', techReq: 'G5' },
]

export const GYM_QUESTIONS = [
  {
    id: 'q1',
    text: 'Quel est votre objectif ?',
    options: ['Perte de poids', 'Prise de masse', 'Endurance'],
  },
  {
    id: 'q2',
    text: "Fréquence d'entrainement ?",
    options: ['1x/semaine', '3x/semaine', 'Tous les jours'],
  },
]

export const GYM_ACTIVITIES = {
  'Perte de poids': {
    text: 'Faites 30 minutes de cardio intense.',
    visual: '🏃',
    product: {
      name: 'Chaussures Running Kalenji',
      link: 'https://www.decathlon.fr/p/chaussures-de-running-femme-kiprun-cushion-500-beige-rose/_/R-p-353287?mc=8914009&c=gris_blanc_bleu',
      reward: 500,
    },
  },
  'Prise de masse': {
    text: 'Soulevez des poids lourds (5x5).',
    visual: '🏋️',
    product: {
      name: 'Banc de Musculation Domyos',
      link: 'https://www.decathlon.fr/p/mp/citysports/banc-de-musculation-citysports-7-positions-ajustables-et-2-sangles/_/R-p-3b308d5d-4d91-4929-8388-33660b3b98e1?mc=3b308d5d-4d91-4929-8388-33660b3b98e1_c1c14&c=noir_rouge',
      reward: 500,
    },
  },
  Endurance: {
    text: 'Courez 10km à rythme modéré.',
    visual: '🚴',
    product: {
      name: 'Vélo Elliptique',
      link: 'https://www.decathlon.fr/p/velo-cargo-electrique-longtail-chargement-arriere-r500e-vert-clair/_/R-p-349924?mc=8826512&c=vert',
      reward: 500,
    },
  },
}

// --- 8. RESEARCH LAB ---
export interface ResearchLabLevel {
  level: number
  name: string
  cost: number
  rpGeneration: number // RP per tick
  description: string
}

export const RESEARCH_LAB_LEVELS: ResearchLabLevel[] = [
  {
    level: 1,
    name: 'Coin Bureau',
    cost: 0,
    rpGeneration: 1,
    description: 'Un simple bureau avec un PC',
  },
  {
    level: 2,
    name: 'Petit Labo',
    cost: 2000,
    rpGeneration: 5,
    description: 'Quelques éprouvettes et serveurs de calcul',
  },
  {
    level: 3,
    name: 'Département R&D',
    cost: 10000,
    rpGeneration: 15,
    description: "Une équipe dédiée à l'innovation",
  },
  {
    level: 4,
    name: 'Centre de Recherche',
    cost: 50000,
    rpGeneration: 40,
    description: 'Bâtiment entier dédié à la science',
  },
  {
    level: 5,
    name: 'Campus Innovation',
    cost: 200000,
    rpGeneration: 100,
    description: 'Pôle mondial de recherche',
  },
]

// --- 7. FIXED MAP & ROOMS ---
export const ROOMS = {
  generator: {
    id: 'generator',
    name: 'Generator Room',
    description: 'Main Power Supply',
    cost: 0,
    emoji: '⚡',
    width: 2,
    height: 2,
    color: 0xff4444,
  },
  server: {
    id: 'server',
    name: 'Server Room',
    description: 'Main Income Source',
    cost: 0,
    emoji: '💾',
    width: 3,
    height: 3,
    color: 0x4444ff,
  },
  classroom: {
    id: 'classroom',
    name: 'Classroom',
    description: 'Student Income',
    cost: 0,
    emoji: '🏫',
    width: 3,
    height: 3,
    color: 0xffff44,
  },
  gym: {
    id: 'gym',
    name: 'Gym',
    description: 'Boosts & Mini-games',
    cost: 5000,
    emoji: '🕹️',
    width: 2,
    height: 2,
    color: 0xff00ff,
  },
  research: {
    id: 'research',
    name: 'Research Lab',
    description: 'Generate Research Points',
    cost: 10000,
    emoji: '🔬',
    width: 2,
    height: 2,
    color: 0x00ffff,
  },
  arcade: {
    id: 'arcade',
    name: 'Arcade',
    description: 'Fun & Games',
    cost: 8000,
    emoji: '👾',
    width: 2,
    height: 2,
    color: 0xff00aa,
  },
}

// --- 8. LAB SECTIONS (New) ---
export interface LabSection {
  id: string
  name: string
  description: string
  baseCost: number
  costMultiplier: number
  baseRp: number
  icon: string
  color: string
}

export const LAB_SECTIONS: Record<string, LabSection> = {
  infra: {
    id: 'infra',
    name: 'Infrastructure',
    description: 'Améliore la gestion des serveurs et l\'Ecology',
    baseCost: 2000,
    costMultiplier: 1.5,
    baseRp: 2,
    icon: '💾',
    color: 'text-blue-400',
  },
  classroom: {
    id: 'classroom',
    name: 'Pédagogie',
    description: 'Débloque les technologies d\'enseignement',
    baseCost: 5000,
    costMultiplier: 1.6,
    baseRp: 5,
    icon: '🎓',
    color: 'text-yellow-400',
  },
  gym: {
    id: 'gym',
    name: 'Performance',
    description: 'Technologies sportives et productivité',
    baseCost: 8000,
    costMultiplier: 1.7,
    baseRp: 8,
    icon: '💪',
    color: 'text-pink-400',
  },
  arcade: {
    id: 'arcade',
    name: 'Divertissement',
    description: 'Technologies ludiques et engagement',
    baseCost: 15000,
    costMultiplier: 1.8,
    baseRp: 15,
    icon: '🕹️',
    color: 'text-purple-400',
  },
}

export const DEFAULT_MAP = [
  // Top
  { id: 'research-main', type: 'research', x1: 41, y1: 9, x2: 54, y2: 22, unlocked: false, cost: 10000 },

  // Middle Left
  { id: 'server-main', type: 'server', x1: 31, y1: 28, x2: 42, y2: 41, unlocked: false, cost: 0 },

  // Middle Right
  { id: 'gym-main', type: 'gym', x1: 55, y1: 25, x2: 68, y2: 32, unlocked: false, cost: 5000 },
  { id: 'arcade-main', type: 'arcade', x1: 55, y1: 39, x2: 68, y2: 46, unlocked: false, cost: 8000 },

  // Bottom
  { id: 'classroom-0', type: 'classroom', x1: 8, y1: 51, x2: 19, y2: 64, unlocked: false, cost: 5000 },
  { id: 'classroom-1', type: 'classroom', x1: 24, y1: 51, x2: 35, y2: 64, unlocked: true, cost: 0 },
  { id: 'classroom-2', type: 'classroom', x1: 60, y1: 51, x2: 71, y2: 64, unlocked: false, cost: 5000 },
  { id: 'classroom-3', type: 'classroom', x1: 76, y1: 51, x2: 87, y2: 64, unlocked: false, cost: 15000 },
]
