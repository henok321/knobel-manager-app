import { createAction, createAsyncThunk } from '@reduxjs/toolkit';

import { client } from '../api/apiClient';
import { extractResponseData } from '../api/responseUtils';
import { getGames, type GamesResponse } from '../generated';
import { NormalizedData } from './types';
import i18n from '../i18n/i18nConfig';

export const resetStore = createAction('store/reset');

export const fetchAll = createAsyncThunk<NormalizedData>(
  'state/fetchAll',
  async () => {
    try {
      const response = await getGames({ client });
      return normalizeGameData(extractResponseData(response));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : i18n.t('apiError.fetchAll');
      throw new Error(message);
    }
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

  apiData.games.forEach((apiGame) => {
    const gameId = apiGame.id;
    normalizedData.games[gameId] = {
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
        id: round.id,
        roundNumber: round.roundNumber,
        gameID: apiGame.id,
        status: apiGame.status,
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
