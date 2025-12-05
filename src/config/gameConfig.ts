export const GAME_CONFIG = {
  INITIAL_MONEY: 2000,
  INITIAL_ENERGY: 0,
  INITIAL_RESEARCH: 0,
  INITIAL_CO2: 0,
  MAX_CO2_BASE: 100,
  TICK_RATE_MS: 1000,
};

// --- 1. GENERATOR ROOM (Energy Cap) ---
export interface GeneratorLevel {
  level: number;
  name: string;
  cost: number;
  capacity: number;
  description: string;
}

export const GENERATOR_LEVELS: GeneratorLevel[] = [
  { level: 1, name: 'Raccordement Domestique', cost: 0, capacity: 30, description: 'Compteur électrique standard' },
  { level: 2, name: 'Groupe Électrogène Diesel', cost: 800, capacity: 60, description: 'Générateur bruyant qui fume' },
  { level: 3, name: 'Panneaux Solaires Toit', cost: 2000, capacity: 100, description: 'Quelques panneaux bleus' },
  { level: 4, name: 'Éolienne Individuelle', cost: 5000, capacity: 150, description: 'Une éolienne qui tourne' },
  { level: 5, name: 'Transformateur Industriel', cost: 10000, capacity: 220, description: 'Gros boitier gris Haute Tension' },
  { level: 6, name: 'Champ Solaire', cost: 25000, capacity: 350, description: 'Le toit est couvert de panneaux' },
  { level: 7, name: 'Barrage Hydro (Contrat)', cost: 60000, capacity: 500, description: 'Câbles énormes arrivant au bâtiment' },
  { level: 8, name: 'Réacteur Biomasse', cost: 120000, capacity: 700, description: 'Cuves vertes connectées' },
  { level: 9, name: 'Mini-Réacteur Nucléaire', cost: 300000, capacity: 1000, description: 'Cylindre brillant futuriste' },
  { level: 10, name: 'Fusion Froide (ARC)', cost: 1000000, capacity: 2000, description: 'Anneau d\'énergie pure' },
];

// --- 2. SERVER ROOM (The Container) ---
export interface ServerRoomLevel {
  level: number;
  name: string;
  cost: number;
  slots: number;
  energyReq: number;
  taxRate: number;
  techReq: string | null;
}

export const SERVER_ROOM_LEVELS: ServerRoomLevel[] = [
  { level: 1, name: 'Placard Serveur', cost: 0, slots: 2, energyReq: 10, taxRate: 0.50, techReq: 'T1' },
  { level: 2, name: 'Salle Ventilée', cost: 1500, slots: 4, energyReq: 25, taxRate: 0.45, techReq: null },
  { level: 3, name: 'Petite Salle IT', cost: 3500, slots: 6, energyReq: 45, taxRate: 0.40, techReq: 'T2' },
  { level: 4, name: 'Data Center Junior', cost: 7500, slots: 8, energyReq: 80, taxRate: 0.35, techReq: null },
  { level: 5, name: 'Salle Climatisée', cost: 12000, slots: 10, energyReq: 120, taxRate: 0.30, techReq: 'T3' },
  { level: 6, name: 'Baies Haute Densité', cost: 25000, slots: 12, energyReq: 180, taxRate: 0.25, techReq: 'T4' },
  { level: 7, name: 'Salle "Cold Corridor"', cost: 45000, slots: 16, energyReq: 250, taxRate: 0.20, techReq: 'T5' },
  { level: 8, name: 'Green Data Center', cost: 80000, slots: 20, energyReq: 350, taxRate: 0.10, techReq: 'T6' },
  { level: 9, name: 'Immersion Cooling', cost: 150000, slots: 24, energyReq: 500, taxRate: 0.05, techReq: 'T7' },
  { level: 10, name: 'Sanctuaire Quantique', cost: 500000, slots: 30, energyReq: 800, taxRate: 0.00, techReq: 'T8' },
];

// --- 3. ASSETS (Servers) ---
export interface ServerAssetGrade {
  grade: number;
  name: string;
  upgradeCost: number;
  income: number;
  co2: number;
}

export interface ServerAssetType {
  id: string;
  name: string;
  baseCost: number;
  minRoomLevel: number;
  grades: ServerAssetGrade[];
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
    grades: [
      { grade: 1, name: 'Standard', upgradeCost: 0, income: 450, co2: 0 },
      { grade: 2, name: 'Stable', upgradeCost: 5000, income: 675, co2: 0 },
      { grade: 3, name: 'Parfaite', upgradeCost: 12000, income: 900, co2: 0 },
    ],
  },
};

// --- 4. TECH TREE ---
export interface TechNode {
  id: string;
  name: string;
  cost: number;
  description: string;
}

export const TECH_TREE: TechNode[] = [
  { id: 'T1', name: 'Réseau Basique', cost: 0, description: 'Débloque Server Room Niv 1' },
  { id: 'T2', name: 'Active Directory', cost: 1000, description: 'Débloque Server Room Niv 3' },
  { id: 'T3', name: 'Virtualisation', cost: 5000, description: 'Débloque Server Room Niv 5' },
  { id: 'T4', name: 'Conteneurisation', cost: 10000, description: 'Débloque Server Room Niv 6' },
  { id: 'T5', name: 'Efficience Énergétique', cost: 20000, description: 'Débloque Server Room Niv 7' },
  { id: 'T6', name: 'Cloud Hybride', cost: 40000, description: 'Débloque Server Room Niv 8' },
  { id: 'T7', name: 'Refroidissement Liquide', cost: 80000, description: 'Débloque Server Room Niv 9' },
  { id: 'T8', name: 'Stabilité Quantique', cost: 200000, description: 'Débloque Server Room Niv 10' },
];

// --- 5. CLASSROOM ---
export interface ClassroomLevel {
    level: number;
    name: string;
    cost: number;
    capacity: number; 
    tuition: number; 
}

export const CLASSROOM_LEVELS: ClassroomLevel[] = [
    { level: 1, name: 'Salle de TD', cost: 0, capacity: 10, tuition: 5 },
    { level: 2, name: 'Amphi 101', cost: 2000, capacity: 25, tuition: 8 },
    { level: 3, name: 'Grand Amphi', cost: 5000, capacity: 50, tuition: 12 },
    { level: 4, name: 'Campus Numérique', cost: 15000, capacity: 100, tuition: 20 },
    { level: 5, name: 'Université Tech', cost: 50000, capacity: 200, tuition: 35 },
];

// --- 6. GYM (New) ---
export interface GymLevel {
    level: number;
    name: string;
    cost: number;
    description: string;
}

export const GYM_LEVELS: GymLevel[] = [
    { level: 1, name: 'Profilage', cost: 0, description: 'Définissez votre profil sportif' },
    { level: 2, name: 'Coaching', cost: 2000, description: 'Instructions personnalisées' },
    { level: 3, name: 'Visuel', cost: 5000, description: 'Démonstrations animées' },
    { level: 4, name: 'Monétisation', cost: 10000, description: 'Partenariats commerciaux' },
];

export const GYM_QUESTIONS = [
    { id: 'q1', text: 'Quel est votre objectif ?', options: ['Perte de poids', 'Prise de masse', 'Endurance'] },
    { id: 'q2', text: 'Fréquence d\'entrainement ?', options: ['1x/semaine', '3x/semaine', 'Tous les jours'] },
];

export const GYM_ACTIVITIES = {
    'Perte de poids': {
        text: 'Faites 30 minutes de cardio intense.',
        visual: '🏃',
        product: { name: 'Chaussures Running Kalenji', link: 'https://www.decathlon.fr', reward: 500 }
    },
    'Prise de masse': {
        text: 'Soulevez des poids lourds (5x5).',
        visual: '🏋️',
        product: { name: 'Banc de Musculation Domyos', link: 'https://www.decathlon.fr', reward: 500 }
    },
    'Endurance': {
        text: 'Courez 10km à rythme modéré.',
        visual: '🚴',
        product: { name: 'Vélo Elliptique', link: 'https://www.decathlon.fr', reward: 500 }
    }
};

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
};

export const DEFAULT_MAP = [
  { id: 'generator-main', type: 'generator', x: 2, y: 2, unlocked: false, cost: 0 },
  { id: 'server-main', type: 'server', x: 5, y: 2, unlocked: false, cost: 0 },
  { id: 'classroom-main', type: 'classroom', x: 2, y: 6, unlocked: true, cost: 0 },
  { id: 'gym-main', type: 'gym', x: 9, y: 2, unlocked: false, cost: 5000 },
  { id: 'research-main', type: 'research', x: 6, y: 6, unlocked: false, cost: 10000 },
];
