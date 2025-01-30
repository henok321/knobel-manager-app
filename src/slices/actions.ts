import { createAsyncThunk } from '@reduxjs/toolkit';
import { NormalizedData } from './types.ts';
import { getGames } from '../api/apiClient.ts';
import { GamesResponse } from '../api/types.ts';

export const fetchAll = createAsyncThunk<NormalizedData>(
  'state/fetchAll',
  async () => {
    const data = await getGames();
    return normalizeGameData(data);
  },
);
const normalizeGameData = (apiData: GamesResponse): NormalizedData => {
  const normalizedData: NormalizedData = {
    activeGameID: undefined,
    games: {},
    teams: {},
    players: {},
    rounds: {},
    tables: {},
    scores: {},
  };

  normalizedData.activeGameID = apiData.activeGameID;

  apiData.games.forEach((apiGame) => {
    const gameId = apiGame.id;
    normalizedData.games[gameId] = {
      id: apiGame.id,
      name: apiGame.name,
      teamSize: apiGame.teamSize,
      tableSize: apiGame.tableSize,
      numberOfRounds: apiGame.numberOfRounds,
      status: apiGame.status,
      owners: apiGame.owners?.map((owner) => owner.ownerSub),
      rounds: apiGame.rounds?.map((round) => round.id) || [],
    };

    apiGame.teams?.forEach((apiTeam) => {
      const teamId = apiTeam.id;
      normalizedData.teams[teamId] = {
        ...apiTeam,
        players: apiTeam.players?.map((player) => player.id) || [],
      };

      apiTeam.players?.forEach((player) => {
        normalizedData.players[player.id] = { ...player };
      });
    });

    apiGame.rounds?.forEach((round) => {
      const roundId = round.id;
      normalizedData.rounds[roundId] = {
        ...round,
        tables: round.tables?.map((table) => table.id) || [],
      };

      round.tables?.forEach((table) => {
        const tableId = table.id;
        normalizedData.tables[tableId] = {
          ...table,
          players: table.players?.map((player) => player.id) || [],
        };
        table.scores?.forEach((score) => {
          normalizedData.scores[score.id] = score;
        });
      });
    });
  });

  return normalizedData;
};
