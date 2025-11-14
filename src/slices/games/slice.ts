/**
 * Simplified Games Slice - Post RTK Query Migration
 *
 * This slice now ONLY handles the active game ID and localStorage persistence.
 * All game data fetching, caching, and mutations are handled by RTK Query.
 *
 * See:
 * - src/api/rtkQueryApi.ts for API endpoints
 * - src/api/normalizedSelectors.ts for data selectors
 * - src/slices/games/hooks.ts for the useGames hook
 */

import { createSlice } from '@reduxjs/toolkit';

type GamesState = {
  activeGameID: number | null;
};

const loadActiveGameIDFromLocalStorage = (): number | null => {
  const stored = localStorage.getItem('active_game_id');
  return stored ? Number(stored) : null;
};

const initialState: GamesState = {
  activeGameID: loadActiveGameIDFromLocalStorage(),
};

const gamesSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    setActiveGame(state, action: { payload: number }) {
      state.activeGameID = action.payload;
      localStorage.setItem('active_game_id', String(action.payload));
    },
    resetGamesState() {
      return initialState;
    },
  },
});

export const { setActiveGame, resetGamesState } = gamesSlice.actions;
export default gamesSlice.reducer;
