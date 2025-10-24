import { configureStore } from '@reduxjs/toolkit';

import gamesReducer from '../../slices/games/slice';
import playersReducer from '../../slices/players/slice';
import tablesReducer from '../../slices/tables/slice';
import teamsReducer from '../../slices/teams/slice';
import { RootState } from '../../store/store';

export const createTestStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: {
      games: gamesReducer,
      teams: teamsReducer,
      players: playersReducer,
      tables: tablesReducer,
    },
    preloadedState: preloadedState as RootState | undefined,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
