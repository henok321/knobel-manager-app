import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { resetStore } from '../slices/games/slice.ts';
import gamesReducer from '../slices/games/slice.ts';

const appReducer = combineReducers({
  games: gamesReducer,
});

const rootReducer: typeof appReducer = (state, action) => {
  if (action.type === resetStore.type) {
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
