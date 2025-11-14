/**
 * Bridge Middleware for RTK Query Migration
 *
 * This middleware bridges RTK Query mutations with legacy Redux slices during the migration.
 * It listens to RTK Query mutation results and dispatches corresponding actions to keep
 * legacy slices in sync.
 *
 * This is a TEMPORARY solution and will be removed in Phase 4 once all slices are migrated.
 */

import { Middleware } from '@reduxjs/toolkit';

import { api } from '../api/rtkQueryApi';

export const rtkQueryBridgeMiddleware: Middleware =
  (store) => (next) => (action) => {
    const result = next(action);

    // Bridge: When createTeam mutation succeeds, update games slice
    if (api.endpoints.createTeam.matchFulfilled(action)) {
      const { gameId } = action.meta.arg.originalArgs;
      const teamId = action.payload.team.id;

      const game = store.getState().games.entities[gameId];
      if (game && teamId) {
        // Dispatch using the games slice's updateOne action
        store.dispatch({
          type: 'games/updateOne',
          payload: {
            id: gameId,
            changes: {
              teams: [...game.teams, teamId],
            },
          },
        });
      }
    }

    // Bridge: When deleteTeam mutation succeeds, update games slice
    if (api.endpoints.deleteTeam.matchFulfilled(action)) {
      const { gameId, teamId } = action.meta.arg.originalArgs;

      const game = store.getState().games.entities[gameId];
      if (game) {
        // Dispatch using the games slice's updateOne action
        store.dispatch({
          type: 'games/updateOne',
          payload: {
            id: gameId,
            changes: {
              teams: game.teams.filter((id: number) => id !== teamId),
            },
          },
        });
      }
    }

    return result;
  };
