import { createSlice } from '@reduxjs/toolkit';
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

const gamesSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // fetch games
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
      });

    // create game
    builder
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
      });

    // delete game
    builder
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
      });

    // update active game
    builder
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

export default gamesSlice.reducer;
