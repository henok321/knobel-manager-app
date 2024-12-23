import { configureStore } from '@reduxjs/toolkit';
import gamesReducer from './games/gamesSlice';

const store = configureStore({ reducer: { gamesReducer } });

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;
