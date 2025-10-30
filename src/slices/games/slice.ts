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
  error?: Error | null;
  activeGameID: number | null;
};

const loadActiveGameIDFromLocalStorage = (): number | null => {
  const stored = localStorage.getItem('active_game_id');
  return stored ? Number(stored) : null;
};

const gamesAdapter = createEntityAdapter<Game>();

const state = gamesAdapter.getInitialState<AdditionalGamesState>({
  status: 'idle',
  error: null,
  activeGameID: loadActiveGameIDFromLocalStorage(),
});

const gamesSlice = createSlice({
  name: 'games',
  initialState: state,
  reducers: {
    setActiveGame(state, action: { payload: number }) {
      state.activeGameID = action.payload;
      localStorage.setItem('active_game_id', String(action.payload));
    },
  },
  extraReducers: (builder) => {
    // fetch games
    builder
      .addCase(fetchAll.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(fetchAll.fulfilled, (state, action) => {
        gamesAdapter.setAll(state, action.payload.games);

        if (state.activeGameID) {
          const gameExists = action.payload.games[state.activeGameID];
          if (!gameExists) {
            state.activeGameID = null;
            localStorage.removeItem('active_game_id');
          }
        }

        state.status = 'succeeded';
      })
      .addCase(fetchAll.rejected, (state, action) => {
        state.status = 'failed';
        state.error = new Error(action.error.message);
      });

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
          teams: action.payload.game.teams?.map((team) => team.id) || [],
          tableSize: action.payload.game.tableSize,
          numberOfRounds: action.payload.game.numberOfRounds,
          status: action.payload.game.status,
          rounds: action.payload.game.rounds?.map((round) => round.id) || [],
          owners: action.payload.game.owners.map((owner) => owner.ownerSub),
        };

        gamesAdapter.addOne(state, game);
        state.status = 'succeeded';
      });

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
          if (state.activeGameID === gameID) {
            state.activeGameID = null;
            localStorage.removeItem('active_game_id');
          }
        }
        state.status = 'succeeded';
      });

    builder
      .addCase(updateGameAction.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(updateGameAction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = new Error(action.error.message);
      })
      .addCase(updateGameAction.fulfilled, (state, action) => {
        const game: Game = {
          id: action.payload.game.id,
          name: action.payload.game.name,
          teamSize: action.payload.game.teamSize,
          teams: action.payload.game.teams?.map((team) => team.id) || [],
          tableSize: action.payload.game.tableSize,
          numberOfRounds: action.payload.game.numberOfRounds,
          status: action.payload.game.status,
          rounds: action.payload.game.rounds?.map((round) => round.id) || [],
          owners: action.payload.game.owners.map((owner) => owner.ownerSub),
        };

        gamesAdapter.updateOne(state, {
          id: game.id,
          changes: game,
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
        state.error = new Error(action.error.message);
      })
      .addCase(setupGameAction.fulfilled, (state, action) => {
        const game: Game = {
          id: action.payload.game.id,
          name: action.payload.game.name,
          teamSize: action.payload.game.teamSize,
          teams: action.payload.game.teams?.map((team) => team.id) || [],
          tableSize: action.payload.game.tableSize,
          numberOfRounds: action.payload.game.numberOfRounds,
          status: action.payload.game.status,
          rounds: action.payload.game.rounds?.map((round) => round.id) || [],
          owners: action.payload.game.owners.map((owner) => owner.ownerSub),
        };

        gamesAdapter.updateOne(state, {
          id: game.id,
          changes: game,
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

const selectActiveGameID = (state: RootState) => state.games.activeGameID;
const selectGamesStatus = (state: RootState) => state.games.status;
const selectGamesError = (state: RootState) => state.games.error;

const selectActiveGame = createSelector(
  [selectGameEntities, selectActiveGameID],
  (entities, activeGameID) => {
    if (!activeGameID) return undefined;
    return entities[activeGameID];
  },
);

export const { setActiveGame } = gamesSlice.actions;

export {
  selectAllGames,
  selectActiveGame,
  selectGamesStatus,
  selectGamesError,
};

export default gamesSlice.reducer;
