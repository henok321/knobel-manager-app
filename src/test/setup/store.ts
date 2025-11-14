import { configureStore } from '@reduxjs/toolkit';

import { api } from '../../api/rtkQueryApi';
import { RootState } from '../../store/store';

export const createTestStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
    },
    preloadedState: preloadedState as RootState | undefined,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(api.middleware),
  });
