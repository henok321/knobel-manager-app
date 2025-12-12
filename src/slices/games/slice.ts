import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';

import { Game } from '../types.ts';
import {
  createGameAction,
  deleteGameAction,
  setupGameAction,
  updateGameAction,
} from './actions.ts';
import { RootState } from '../../store/store.ts';
import { fetchAll } from '../actions.ts';
import { createTeamAction, deleteTeamAction } from '../teams/actions.ts';

type AdditionalGamesState = {
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error?: string | null;
};

const gamesAdapter = createEntityAdapter<Game>();

const state = gamesAdapter.getInitialState<AdditionalGamesState>({
  status: 'idle',
  error: null,
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
        state.status = 'succeeded';
      })
      .addCase(fetchAll.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      });

    builder
      .addCase(createGameAction.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(createGameAction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      })
      .addCase(createGameAction.fulfilled, (state, action) => {
        gamesAdapter.addOne(state, action.payload);
        state.status = 'succeeded';
      });

    builder
      .addCase(deleteGameAction.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(deleteGameAction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      })
      .addCase(deleteGameAction.fulfilled, (state, action) => {
        const gameID = action.meta.arg;
        if (gameID) {
          gamesAdapter.removeOne(state, gameID);
        }
        state.status = 'succeeded';
      });

    builder
      .addCase(updateGameAction.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(updateGameAction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      })
      .addCase(updateGameAction.fulfilled, (state, action) => {
        gamesAdapter.updateOne(state, {
          id: action.payload.id,
          changes: action.payload,
        });
        state.status = 'succeeded';
      });

    // setup game
    builder
      .addCase(setupGameAction.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(setupGameAction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      })
      .addCase(setupGameAction.fulfilled, (state, action) => {
        gamesAdapter.updateOne(state, {
          id: action.payload.id,
          changes: action.payload,
        });
        state.status = 'succeeded';
      });

    // create team - update game's teams array
    builder.addCase(createTeamAction.fulfilled, (state, action) => {
      const gameID = action.meta.arg.gameID;
      const teamID = action.payload.team.id;
      const game = state.entities[gameID];
      if (game && teamID) {
        gamesAdapter.updateOne(state, {
          id: gameID,
          changes: {
            teams: [...game.teams, teamID],
          },
        });
      }
    });

    // delete team - update game's teams array
    builder.addCase(deleteTeamAction.fulfilled, (state, action) => {
      const teamID = action.payload;
      const games = Object.values(state.entities);
      for (const game of games) {
        if (game?.teams.includes(teamID)) {
          gamesAdapter.updateOne(state, {
            id: game.id,
            changes: {
              teams: game.teams.filter((id) => id !== teamID),
            },
          });
          break;
        }
      }
    });
  },
});

const { selectAll: selectAllGames, selectEntities: selectGameEntities } =
  gamesAdapter.getSelectors<RootState>((state) => state.games);

const selectGamesStatus = (state: RootState) => state.games.status;
const selectGamesError = (state: RootState) => state.games.error;

const selectActiveGame = createSelector(
  [
    selectGameEntities,
    (_state: RootState, activeGameID: number | null) => activeGameID,
  ],
  (entities, activeGameID) => {
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
