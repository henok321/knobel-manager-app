import {
  createEntityAdapter,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';
import { Game } from '../types.ts';
import {
  activateGameAction,
  createGameAction,
  deleteGameAction,
  fetchGamesAction,
} from './actions.ts';

type AdditionalGamesState = {
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  activeGameID?: number;
};

export type GameState = EntityState<Game, number> & AdditionalGamesState;

const gamesAdapter = createEntityAdapter<Game>();

const initialState = gamesAdapter.getInitialState<AdditionalGamesState>({
  status: 'idle',
  activeGameID: undefined,
});

const gamesSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // fetch games
    builder
      .addCase(fetchGamesAction.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(fetchGamesAction.fulfilled, (state, action) => {
        gamesAdapter.setAll(initialState, action.payload.games);
        state.activeGameID = action.payload.activeGameID;
        state.status = 'succeeded';
      })
      .addCase(fetchGamesAction.rejected, (state) => {
        state.status = 'failed';
      });

    // create game
    builder
      .addCase(createGameAction.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(createGameAction.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(createGameAction.fulfilled, (state, action) => {
        gamesAdapter.setOne(initialState, action.payload.game);
        state.status = 'succeeded';
      });

    // delete game
    builder
      .addCase(deleteGameAction.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(deleteGameAction.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(deleteGameAction.fulfilled, (state, action) => {
        const gameID = action.meta.arg;
        if (gameID) {
          gamesAdapter.removeOne(initialState, gameID);
        }
        state.status = 'succeeded';
      });

    // update active game
    builder
      .addCase(activateGameAction.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(activateGameAction.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(activateGameAction.fulfilled, (state, action) => {
        state.activeGameID = action.meta.arg;
        state.status = 'succeeded';
      });
  },
});

export default gamesSlice.reducer;
