const STORAGE_KEY = 'active_game_id';

export const loadActiveGameIdFromStorage = (): number | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = Number(stored);
    return !isNaN(parsed) ? parsed : null;
  } catch {
    // Silently fail - user will just not have persisted active game
    return null;
  }
};

export const saveActiveGameIdToStorage = (id: number | null): void => {
  try {
    if (id === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, String(id));
    }
  } catch {
    // State still updates in memory, just not persisted
    // Silently fail - common in private browsing mode
  }
};
