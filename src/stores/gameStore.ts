import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Building, GameState, BuildingType, GridPosition } from '../types'

interface GameStore extends GameState {
  // Actions
  addMoney: (amount: number) => void
  spendMoney: (amount: number) => boolean
  addEnergy: (amount: number) => void
  useEnergy: (amount: number) => boolean
  addBuilding: (type: BuildingType, position: GridPosition) => Building
  removeBuilding: (id: string) => void
  upgradeBuilding: (id: string) => boolean
  addCO2: (amount: number) => void
  reset: () => void
}

const initialState: GameState = {
  money: 1000,
  energy: 100,
  buildings: [],
  co2: 0,
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addMoney: (amount: number) => {
        set((state) => ({ money: state.money + amount }))
      },

      spendMoney: (amount: number) => {
        const currentMoney = get().money
        if (currentMoney >= amount) {
          set({ money: currentMoney - amount })
          return true
        }
        return false
      },

      addEnergy: (amount: number) => {
        set((state) => ({ energy: Math.min(state.energy + amount, 100) }))
      },

      useEnergy: (amount: number) => {
        const currentEnergy = get().energy
        if (currentEnergy >= amount) {
          set({ energy: currentEnergy - amount })
          return true
        }
        return false
      },

      addBuilding: (type: BuildingType, position: GridPosition) => {
        const newBuilding: Building = {
          id: `building-${Date.now()}-${Math.random()}`,
          type,
          x: position.x,
          y: position.y,
          level: 1,
        }
        set((state) => ({
          buildings: [...state.buildings, newBuilding],
        }))
        return newBuilding
      },

      removeBuilding: (id: string) => {
        set((state) => ({
          buildings: state.buildings.filter((b) => b.id !== id),
        }))
      },

      upgradeBuilding: (id: string) => {
        const building = get().buildings.find((b) => b.id === id)
        if (!building) return false

        // Coût d'upgrade (à ajuster selon votre logique)
        const upgradeCost = building.level * 500
        if (get().spendMoney(upgradeCost)) {
          set((state) => ({
            buildings: state.buildings.map((b) =>
              b.id === id ? { ...b, level: b.level + 1 } : b
            ),
          }))
          return true
        }
        return false
      },

      addCO2: (amount: number) => {
        set((state) => ({ co2: state.co2 + amount }))
      },

      reset: () => {
        set(initialState)
      },
    }),
    {
      name: 'tycoon-game-save', // Nom de la clé dans localStorage
    }
  )
)

