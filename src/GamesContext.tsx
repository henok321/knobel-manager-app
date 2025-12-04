import React, { useState, useMemo, useEffect } from 'react';

type GamesContextValue = {
  activeGameID: number | null;
  setActiveGameID: (gameID: number) => void;
  clearActiveGameID: () => void;
};

const GamesContext = React.createContext<GamesContextValue | undefined>(
  undefined,
);

const STORAGE_KEY = 'activeGameID';

const parseGameID = (stored: string | null): number | null => {
  if (!stored) return null;
  const parsed = Number.parseInt(stored, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const getStoredGameID = (): number | null =>
  parseGameID(localStorage.getItem(STORAGE_KEY));

const setStoredGameID = (gameID: number): void => {
  localStorage.setItem(STORAGE_KEY, String(gameID));
};

const clearStoredGameID = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

const GamesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeGameID, setActiveGameID] = useState<number | null>(
    getStoredGameID,
  );

  useEffect(() => {
    if (activeGameID) {
      setStoredGameID(activeGameID);
    } else {
      clearStoredGameID();
    }
  }, [activeGameID]);

  const value = useMemo<GamesContextValue>(
    () => ({
      activeGameID,
      setActiveGameID,
      clearActiveGameID: () => setActiveGameID(null),
    }),
    [activeGameID],
  );

  return (
    <GamesContext.Provider value={value}>{children}</GamesContext.Provider>
  );
};

export default GamesProvider;
export { GamesContext };
