import { configureStore } from '@reduxjs/toolkit';
import gamesReducer from '../slices/games/slice.ts';

const store = configureStore({ reducer: { games: gamesReducer } });

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export default store;
