import {
  activateGame,
  createGame,
  deleteGame,
  getGames,
} from '../../api/apiClient.ts';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { NormalizedData } from '../types.ts';
import { GameRequest, GameResponse, GamesResponse } from '../../api/types.ts';

export const fetchGamesAction = createAsyncThunk<NormalizedData>(
  'games/fetchGames',
  async () => {
    const data = await getGames();
    return normalizeGameData(data);
  },
);

export const createGameAction = createAsyncThunk<GameResponse, GameRequest>(
  'games/createGame',
  async (gameRequest) => await createGame(gameRequest),
);

export const deleteGameAction = createAsyncThunk<void, number>(
  'games/deleteGame',
  async (gameID) => await deleteGame(gameID),
);

export const activateGameAction = createAsyncThunk<void, number>(
  'games/activateGame',
  async (gameID) => await activateGame(gameID),
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
      owners: apiGame.owners,
    };

    apiGame.teams.forEach((apiTeam) => {
      const teamId = apiTeam.id;
      normalizedData.teams[teamId] = {
        ...apiTeam,
      };

      apiTeam.players.forEach((player) => {
        normalizedData.players[player.id] = { ...player };
      });
    });

    apiGame.rounds.forEach((round) => {
      const roundId = round.id;
      normalizedData.rounds[roundId] = {
        ...round,
      };

      round.tables.forEach((table) => {
        const tableId = table.id;
        normalizedData.tables[tableId] = {
          ...table,
        };
        table.scores?.forEach((score) => {
          normalizedData.scores[score.id] = score;
        });
      });
    });
  });

  return normalizedData;
};
