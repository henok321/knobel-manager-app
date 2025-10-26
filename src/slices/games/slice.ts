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
  setupGameAction,
  updateGameAction,
} from './actions.ts';
import { RootState } from '../../store/store.ts';
import { fetchAll } from '../actions.ts';
import { createTeamAction, deleteTeamAction } from '../teams/actions.ts';

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

    // update game
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
      // Find the game that contains this team
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
