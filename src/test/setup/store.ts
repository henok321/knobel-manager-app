import { configureStore } from '@reduxjs/toolkit';

import gamesReducer from '../../slices/games/slice';
import { RootState } from '../../store/store';

export const createTestStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: {
      games: gamesReducer,
    },
    preloadedState: preloadedState as RootState | undefined,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
