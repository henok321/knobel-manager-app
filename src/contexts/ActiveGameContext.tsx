import { createContext, useContext, useState, ReactNode } from 'react';

import {
  loadActiveGameIdFromStorage,
  saveActiveGameIdToStorage,
} from './activeGameStorage';

type ActiveGameContextType = {
  activeGameId: number | null;
  setActiveGameId: (id: number | null) => void;
};

const ActiveGameContext = createContext<ActiveGameContextType | undefined>(
  undefined,
);

/**
 * Provides active game state with localStorage persistence.
 *
 * This replaces the Redux games slice for UI state management.
 * Use this for client-side state that needs to persist across refreshes.
 */
export const ActiveGameProvider = ({ children }: { children: ReactNode }) => {
  const [activeGameId, setActiveGameIdState] = useState<number | null>(
    loadActiveGameIdFromStorage,
  );

  const setActiveGameId = (id: number | null) => {
    setActiveGameIdState(id);
    saveActiveGameIdToStorage(id);
  };

  return (
    <ActiveGameContext.Provider value={{ activeGameId, setActiveGameId }}>
      {children}
    </ActiveGameContext.Provider>
  );
};

/**
 * Hook to access and update the active game ID.
 *
 * @throws {Error} If used outside of ActiveGameProvider
 *
 * @example
 * const { activeGameId, setActiveGameId } = useActiveGame();
 * setActiveGameId(123);
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useActiveGame = () => {
  const context = useContext(ActiveGameContext);
  if (!context) {
    throw new Error('useActiveGame must be used within ActiveGameProvider');
  }
  return context;
};
