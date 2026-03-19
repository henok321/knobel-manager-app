import { createAction, createAsyncThunk } from '@reduxjs/toolkit';

import { client } from '../api/apiClient';
import { type GamesResponse, getGames } from '../generated';
import type { NormalizedData } from './types';

export const resetStore = createAction('store/reset');

export const fetchAll = createAsyncThunk<NormalizedData>(
  'state/fetchAll',
  async () => {
    const response = await getGames({ client });
    if (!response.data) {
      throw new Error('API returned empty response data');
    }
    return normalizeGameData(response.data);
  },
);

const normalizeGameData = (apiData: GamesResponse): NormalizedData => {
  const normalizedData: NormalizedData = {
    games: {},
    teams: {},
    players: {},
    rounds: {},
    tables: {},
    scores: {},
  };

  for (const apiGame of apiData.games) {
    const gameID = apiGame.id;
    normalizedData.games[gameID] = {
      id: apiGame.id,
      name: apiGame.name,
      teamSize: apiGame.teamSize,
      tableSize: apiGame.tableSize,
      numberOfRounds: apiGame.numberOfRounds,
      teams: apiGame.teams?.map((team) => team.id) || [],
      status: apiGame.status,
      owners: apiGame.owners?.map((owner) => owner.ownerSub),
      rounds: apiGame.rounds?.map((round) => round.id) || [],
    };

    for (const apiTeam of apiGame.teams ?? []) {
      const teamID = apiTeam.id;
      normalizedData.teams[teamID] = {
        ...apiTeam,
        players: apiTeam.players?.map((player) => player.id) || [],
      };

      for (const player of apiTeam.players ?? []) {
        normalizedData.players[player.id] = { ...player };
      }
    }

    for (const round of apiGame.rounds ?? []) {
      const roundID = round.id;
      normalizedData.rounds[roundID] = {
        id: round.id,
        roundNumber: round.roundNumber,
        gameID: apiGame.id,
        status: apiGame.status,
        tables: round.tables?.map((table) => table.id) || [],
      };

      for (const table of round.tables ?? []) {
        const tableId = table.id;
        normalizedData.tables[tableId] = {
          ...table,
          roundNumber: round.roundNumber,
        };
        for (const score of table.scores ?? []) {
          normalizedData.scores[score.id] = score;
        }
      }
    }
  }

  return normalizedData;
};
