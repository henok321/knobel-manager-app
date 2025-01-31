import { configureStore } from '@reduxjs/toolkit';
import gamesReducer from '../slices/games/slice.ts';
import teamsReducer from '../slices/teams/slice.ts';
import playersReducer from '../slices/players/slice.ts';

const store = configureStore({
  reducer: {
    games: gamesReducer,
    teams: teamsReducer,
    players: playersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
