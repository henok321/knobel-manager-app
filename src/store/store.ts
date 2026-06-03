import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { resetStore } from '../slices/actions.ts';
import gamesReducer from '../slices/games/slice.ts';
import playersReducer from '../slices/players/slice.ts';
import tablesReducer from '../slices/tables/slice.ts';
import teamsReducer from '../slices/teams/slice.ts';
import { api } from './apiSlice.ts';

const appReducer = combineReducers({
  games: gamesReducer,
  teams: teamsReducer,
  players: playersReducer,
  tables: tablesReducer,
  [api.reducerPath]: api.reducer,
});

const rootReducer: typeof appReducer = (state, action) => {
  if (action.type === resetStore.type) {
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
