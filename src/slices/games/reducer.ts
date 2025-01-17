import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GamesResponse } from '../../api/apiClient.ts';
import { Game } from './types.ts';
import {
  activateGameAction,
  createGameAction,
  deleteGameAction,
  fetchGamesAction,
} from './actions.ts';

export type GamesState = {
  games: Game[];
  activeGameID: number | null;
  fetching: boolean;
  fetched: boolean;
};

const initialState: GamesState = {
  games: [],
  activeGameID: null,
  fetched: false,
  fetching: false,
};

const reducer = createSlice({
  name: 'games',
  initialState,
  reducers: {
    setGames: (state, action: PayloadAction<GamesResponse>) => {
      state.games = action.payload.games;
      state.activeGameID = action.payload.activeGameID;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGamesAction.pending, (state) => {
        state.fetching = true;
        state.fetched = false;
      })
      .addCase(fetchGamesAction.fulfilled, (state, action) => {
        state.games = action.payload.games;
        state.activeGameID = action.payload.activeGameID;
        state.fetching = false;
        state.fetched = true;
      })
      .addCase(fetchGamesAction.rejected, (state) => {
        state.fetching = false;
        state.fetched = false;
      })
      .addCase(createGameAction.pending, (state) => {
        state.fetching = true;
        state.fetched = false;
      })
      .addCase(createGameAction.rejected, (state) => {
        state.fetching = false;
        state.fetched = false;
      })
      .addCase(createGameAction.fulfilled, (state, action) => {
        state.games.push(action.payload.game);
        state.fetched = true;
        state.fetching = false;
      })
      .addCase(deleteGameAction.pending, (state) => {
        state.fetching = true;
        state.fetched = false;
      })
      .addCase(deleteGameAction.rejected, (state) => {
        state.fetching = false;
        state.fetched = false;
      })
      .addCase(deleteGameAction.fulfilled, (state, action) => {
        state.games = state.games.filter((game) => game.id !== action.meta.arg);
        state.fetched = true;
        state.fetching = false;
      })
      .addCase(activateGameAction.pending, (state) => {
        state.fetching = true;
        state.fetched = false;
      })

      .addCase(activateGameAction.rejected, (state) => {
        state.fetching = false;
        state.fetched = false;
      })
      .addCase(activateGameAction.fulfilled, (state, action) => {
        state.activeGameID = action.meta.arg;
        state.fetching = false;
        state.fetched = true;
      });
  },
});

export const { setGames } = reducer.actions;

export default reducer.reducer;
