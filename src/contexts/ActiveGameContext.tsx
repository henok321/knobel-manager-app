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

// eslint-disable-next-line react-refresh/only-export-components
export const useActiveGame = () => {
  const context = useContext(ActiveGameContext);
  if (!context) {
    throw new Error('useActiveGame must be used within ActiveGameProvider');
  }
  return context;
};
