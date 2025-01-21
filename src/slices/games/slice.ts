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
import { RootState } from '../../store/store.ts';

type AdditionalGamesState = {
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error?: Error | null;
  activeGameID?: number;
};

export type GameState = EntityState<Game, number> & AdditionalGamesState;

const gamesAdapter = createEntityAdapter<Game>();

const state = gamesAdapter.getInitialState<AdditionalGamesState>({
  status: 'idle',
  error: null,
  activeGameID: undefined,
});

const gamesSlice = createSlice({
  name: 'games',
  initialState: state,
  reducers: {},
  extraReducers: (builder) => {
    // fetch games
    builder
      .addCase(fetchGamesAction.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(fetchGamesAction.fulfilled, (state, action) => {
        gamesAdapter.setAll(state, action.payload.games);
        state.activeGameID = action.payload.activeGameID;
        state.status = 'succeeded';
      })
      .addCase(fetchGamesAction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = new Error(action.error.message);
      });

    // create game
    builder
      .addCase(createGameAction.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(createGameAction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = new Error(action.error.message);
      })
      .addCase(createGameAction.fulfilled, (state, action) => {
        gamesAdapter.setOne(state, action.payload.game);
        state.status = 'succeeded';
      });

    // delete game
    builder
      .addCase(deleteGameAction.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(deleteGameAction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = new Error(action.error.message);
      })
      .addCase(deleteGameAction.fulfilled, (state, action) => {
        const gameID = action.meta.arg;
        if (gameID) {
          gamesAdapter.removeOne(state, gameID);
        }
        state.status = 'succeeded';
      });

    // update active game
    builder
      .addCase(activateGameAction.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(activateGameAction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = new Error(action.error.message);
      })
      .addCase(activateGameAction.fulfilled, (state, action) => {
        state.activeGameID = action.meta.arg;
        state.status = 'succeeded';
      });
  },
});

export default gamesSlice.reducer;

export const { selectAll: selectAllGames } =
  gamesAdapter.getSelectors<RootState>((state) => state.games);
