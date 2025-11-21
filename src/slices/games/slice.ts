import { createSelector, createSlice } from '@reduxjs/toolkit';

import {
  createGameAction,
  createTeamAction,
  deleteGameAction,
  deletePlayerAction,
  deleteTeamAction,
  fetchAll,
  fetchAllTablesForGame,
  fetchTablesForRound,
  setupGameAction,
  updateGameAction,
  updatePlayerAction,
  updateScoresForTable,
  updateTeamAction,
} from './actions.ts';
import { Game } from '../../generated';
import { RootState } from '../../store/store.ts';

// State structure - store games directly as received from API
interface GamesState {
  games: Game[];
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: GamesState = {
  games: [],
  status: 'idle',
  error: null,
};
const gamesSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    resetStore: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAll.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(fetchAll.fulfilled, (state, action) => {
        state.games = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchAll.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch games';
      });

    builder
      .addCase(createGameAction.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(createGameAction.fulfilled, (state, action) => {
        state.games.push(action.payload);
        state.status = 'succeeded';
      })
      .addCase(createGameAction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to create game';
      });

    builder
      .addCase(updateGameAction.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(updateGameAction.fulfilled, (state, action) => {
        const index = state.games.findIndex((g) => g.id === action.payload.id);
        const game = state.games[index];
        if (index !== -1 && game) {
          state.games[index] = action.payload;
        }
        state.status = 'succeeded';
      })
      .addCase(updateGameAction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to update game';
      });

    builder
      .addCase(deleteGameAction.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(deleteGameAction.fulfilled, (state, action) => {
        state.games = state.games.filter((g) => g.id !== action.payload);
        state.status = 'succeeded';
      })
      .addCase(deleteGameAction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to delete game';
      });

    builder
      .addCase(setupGameAction.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(setupGameAction.fulfilled, (state, action) => {
        const index = state.games.findIndex((g) => g.id === action.payload.id);
        const game = state.games[index];
        if (index !== -1 && game) {
          state.games[index] = action.payload;
        }
        state.status = 'succeeded';
      })
      .addCase(setupGameAction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to setup game';
      });

    builder
      .addCase(createTeamAction.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(createTeamAction.fulfilled, (state, action) => {
        const game = state.games.find((g) => g.id === action.payload.gameID);
        if (game) {
          if (!game.teams) {
            game.teams = [];
          }
          game.teams.push(action.payload.team);
        }
        state.status = 'succeeded';
      })
      .addCase(createTeamAction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to create team';
      });

    builder
      .addCase(updateTeamAction.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(updateTeamAction.fulfilled, (state, action) => {
        const game = state.games.find((g) => g.id === action.payload.gameID);
        if (game?.teams) {
          const teamIndex = game.teams.findIndex(
            (t) => t.id === action.payload.team.id,
          );
          const team = game.teams[teamIndex];
          if (teamIndex !== -1 && team) {
            game.teams[teamIndex] = action.payload.team;
          }
        }
        state.status = 'succeeded';
      })
      .addCase(updateTeamAction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to update team';
      });

    builder
      .addCase(deleteTeamAction.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(deleteTeamAction.fulfilled, (state, action) => {
        const game = state.games.find((g) => g.id === action.payload.gameID);
        if (game?.teams) {
          game.teams = game.teams.filter((t) => t.id !== action.payload.teamID);
        }
        state.status = 'succeeded';
      })
      .addCase(deleteTeamAction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to delete team';
      });

    builder
      .addCase(updatePlayerAction.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(updatePlayerAction.fulfilled, (state, action) => {
        const game = state.games.find((g) => g.id === action.payload.gameID);
        const team = game?.teams?.find((t) => t.id === action.payload.teamID);
        if (team?.players) {
          const playerIndex = team.players.findIndex(
            (p) => p.id === action.payload.player.id,
          );
          const player = team.players[playerIndex];
          if (playerIndex !== -1 && player) {
            team.players[playerIndex] = action.payload.player;
          }
        }
        state.status = 'succeeded';
      })
      .addCase(updatePlayerAction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to update player';
      });

    builder
      .addCase(deletePlayerAction.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(deletePlayerAction.fulfilled, (state, action) => {
        const game = state.games.find((g) => g.id === action.payload.gameID);
        const team = game?.teams?.find((t) => t.id === action.payload.teamID);
        if (team?.players) {
          team.players = team.players.filter(
            (p) => p.id !== action.payload.playerID,
          );
        }
        state.status = 'succeeded';
      })
      .addCase(deletePlayerAction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to delete player';
      });

    builder
      .addCase(fetchTablesForRound.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(fetchTablesForRound.fulfilled, (state, action) => {
        const game = state.games.find((g) => g.id === action.payload.gameID);
        const round = game?.rounds?.find(
          (r) => r.roundNumber === action.payload.roundNumber,
        );
        if (round) {
          round.tables = action.payload.tables;
        }
        state.status = 'succeeded';
      })
      .addCase(fetchTablesForRound.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch tables';
      });

    builder
      .addCase(fetchAllTablesForGame.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(fetchAllTablesForGame.fulfilled, (state, action) => {
        const game = state.games.find((g) => g.id === action.payload.gameID);
        if (game?.rounds) {
          action.payload.rounds.forEach(({ roundNumber, tables }) => {
            const round = game.rounds?.find(
              (r) => r.roundNumber === roundNumber,
            );
            if (round) {
              round.tables = tables;
            }
          });
        }
        state.status = 'succeeded';
      })
      .addCase(fetchAllTablesForGame.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch tables';
      });

    builder
      .addCase(updateScoresForTable.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(updateScoresForTable.fulfilled, (state, action) => {
        const game = state.games.find((g) => g.id === action.payload.gameID);
        const round = game?.rounds?.find(
          (r) => r.roundNumber === action.payload.roundNumber,
        );
        if (round) {
          round.tables = action.payload.tables;
        }
        state.status = 'succeeded';
      })
      .addCase(updateScoresForTable.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to update scores';
      });
  },
});

const selectAllGames = (state: RootState) => state.games.games;
const selectGamesStatus = (state: RootState) => state.games.status;
const selectGamesError = (state: RootState) => state.games.error;

const selectActiveGame = createSelector(
  [
    selectAllGames,
    (_state: RootState, activeGameID: number | null) => activeGameID,
  ],
  (games, activeGameID) => {
    if (!activeGameID) return undefined;
    return games.find((g) => g.id === activeGameID);
  },
);

export const { resetStore } = gamesSlice.actions;

export {
  selectAllGames,
  selectActiveGame,
  selectGamesStatus,
  selectGamesError,
};

export {
  fetchAll,
  createGameAction,
  updateGameAction,
  deleteGameAction,
  setupGameAction,
  createTeamAction,
  updateTeamAction,
  deleteTeamAction,
  updatePlayerAction,
  deletePlayerAction,
  fetchTablesForRound,
  fetchAllTablesForGame,
  updateScoresForTable,
};

export default gamesSlice.reducer;
