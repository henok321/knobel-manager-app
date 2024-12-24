import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GamesResponse } from '../../api/apiClient.ts';
import { Game } from './types.ts';
import { fetchGamesAction } from './actions.ts';

export type GamesState = {
  games: Game[];
  activeGameID: string | null;
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
      });
  },
});

export const { setGames } = reducer.actions;

export default reducer.reducer;
