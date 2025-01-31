import {
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';
import { Game } from '../types.ts';
import {
  activateGameAction,
  createGameAction,
  deleteGameAction,
} from './actions.ts';
import { RootState } from '../../store/store.ts';
import { fetchAll } from '../actions.ts';

type AdditionalGamesState = {
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error?: Error | null;
  activeGameID?: number;
};

export type GamesState = EntityState<Game, number> & AdditionalGamesState;

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
      .addCase(fetchAll.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(fetchAll.fulfilled, (state, action) => {
        gamesAdapter.setAll(state, action.payload.games);
        state.activeGameID = action.payload.activeGameID;
        state.status = 'succeeded';
      })
      .addCase(fetchAll.rejected, (state, action) => {
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
        const game: Game = {
          id: action.payload.game.id,
          name: action.payload.game.name,
          teamSize: action.payload.game.teamSize,
          tableSize: action.payload.game.tableSize,
          numberOfRounds: action.payload.game.numberOfRounds,
          status: action.payload.game.status,
          rounds: action.payload.game.rounds?.map((round) => round.id) || [],
          owners: action.payload.game.owners.map((owner) => owner.ownerSub),
        };

        gamesAdapter.setOne(state, game);
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

const { selectAll: selectAllGames, selectEntities: selectGameEntities } =
  gamesAdapter.getSelectors<RootState>((state) => state.games);

const selectActiveGameID = (state: RootState) => state.games.activeGameID;

const selectGamesStatus = (state: RootState) => state.games.status;
const selectGamesError = (state: RootState) => state.games.error;

const selectActiveGame = createSelector(
  [selectActiveGameID, selectGameEntities],
  (activeGameID, entities) => {
    if (!activeGameID) return undefined;
    return entities[activeGameID];
  },
);

export {
  selectAllGames,
  selectActiveGame,
  selectGamesStatus,
  selectGamesError,
};

export default gamesSlice.reducer;
