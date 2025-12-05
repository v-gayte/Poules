import { useEffect } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { GAME_CONFIG } from '../config/gameConfig';

export const useGameLoop = () => {
  const tickUpdate = useGameStore((state) => state.tickUpdate);

  useEffect(() => {
    const interval = setInterval(() => {
      tickUpdate();
    }, GAME_CONFIG.TICK_RATE_MS);

    return () => clearInterval(interval);
  }, [tickUpdate]);
};
