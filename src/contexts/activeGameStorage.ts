const STORAGE_KEY = 'active_game_id';

export const loadActiveGameIdFromStorage = (): number | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = Number(stored);
    return !isNaN(parsed) ? parsed : null;
  } catch (error) {
    // Silently fail - user will just not have persisted active game
    console.debug('Failed to load active game ID from storage:', error);
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
  } catch (error) {
    // State still updates in memory, just not persisted
    // Silently fail - common in private browsing mode
    console.debug('Failed to save active game ID to storage:', error);
  }
};
