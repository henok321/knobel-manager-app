import { createSelector } from '@reduxjs/toolkit';

import { api } from './rtkQueryApi';
import type { Game, Team, Player } from '../types';

const selectNormalizedGamesData = createSelector(
  [(state) => api.endpoints.getGames.select(undefined)(state)],
  (gamesResult) => {
    if (!gamesResult.data) {
      return {
        games: {} as Record<number, Game>,
        teams: {} as Record<number, Team>,
        players: {} as Record<number, Player>,
      };
    }

    const games: Record<number, Game> = {};
    const teams: Record<number, Team> = {};
    const players: Record<number, Player> = {};

    gamesResult.data.games.forEach((apiGame) => {
      games[apiGame.id] = {
        id: apiGame.id,
        name: apiGame.name,
        teamSize: apiGame.teamSize,
        tableSize: apiGame.tableSize,
        numberOfRounds: apiGame.numberOfRounds,
        status: apiGame.status,
        teams: apiGame.teams?.map((t) => t.id) || [],
        rounds: apiGame.rounds?.map((r) => r.id) || [],
        owners: apiGame.owners?.map((o) => o.ownerSub) || [],
      };

      apiGame.teams?.forEach((apiTeam) => {
        teams[apiTeam.id] = {
          id: apiTeam.id,
          name: apiTeam.name,
          gameID: apiGame.id,
          players: apiTeam.players?.map((p) => p.id) || [],
        };

        apiTeam.players?.forEach((apiPlayer) => {
          players[apiPlayer.id] = {
            id: apiPlayer.id,
            name: apiPlayer.name,
            teamID: apiTeam.id,
          };
        });
      });
    });

    return { games, teams, players };
  },
);

export const selectAllGamesNormalized = createSelector(
  [selectNormalizedGamesData],
  (normalized) => Object.values(normalized.games),
);

export const selectGameByIdNormalized = (gameId: number | null) =>
  createSelector([selectNormalizedGamesData], (normalized) =>
    gameId !== null ? normalized.games[gameId] : undefined,
  );

export const selectAllTeamsNormalized = createSelector(
  [selectNormalizedGamesData],
  (normalized) => Object.values(normalized.teams),
);

export const selectAllPlayersNormalized = createSelector(
  [selectNormalizedGamesData],
  (normalized) => Object.values(normalized.players),
);
