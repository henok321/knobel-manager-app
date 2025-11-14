import { configureStore } from '@reduxjs/toolkit';

import { api } from '../api/rtkQueryApi.ts';
import gamesReducer from '../slices/games/slice.ts';

const rootReducer = {
  [api.reducerPath]: api.reducer,
  games: gamesReducer,
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
