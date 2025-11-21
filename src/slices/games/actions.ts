import { createAsyncThunk } from '@reduxjs/toolkit';

import {
  gamesApi,
  playersApi,
  scoresApi,
  tablesApi,
  teamsApi,
} from '../../api/apiClient.ts';
import {
  Game,
  GameCreateRequest,
  GameUpdateRequest,
  Player,
  Table,
  Team,
  TeamsRequest,
} from '../../generated';

export const fetchAll = createAsyncThunk<Game[]>('games/fetchAll', async () => {
  const response = await gamesApi.getGames();
  return response.data.games;
});

export const createGameAction = createAsyncThunk<Game, GameCreateRequest>(
  'games/createGame',
  async (gameRequest) => {
    const response = await gamesApi.createGame(gameRequest);
    return response.data.game;
  },
);

export const updateGameAction = createAsyncThunk<
  Game,
  { gameID: number; gameRequest: GameUpdateRequest }
>('games/updateGame', async ({ gameID, gameRequest }) => {
  const response = await gamesApi.updateGame(gameID, gameRequest);
  return response.data.game;
});

export const deleteGameAction = createAsyncThunk<number, number>(
  'games/deleteGame',
  async (gameID) => {
    await gamesApi.deleteGame(gameID);
    return gameID;
  },
);

export const setupGameAction = createAsyncThunk<Game, number>(
  'games/setupGame',
  async (gameID) => {
    await gamesApi.setupGame(gameID);
    const response = await gamesApi.getGame(gameID);
    return response.data;
  },
);

// ====================
// Team Actions
// ====================

export const createTeamAction = createAsyncThunk<
  { gameID: number; team: Team },
  { gameID: number; teamRequest: TeamsRequest }
>('games/createTeam', async ({ gameID, teamRequest }) => {
  const response = await teamsApi.createTeam(gameID, teamRequest);
  return { gameID, team: response.data.team };
});

export const updateTeamAction = createAsyncThunk<
  { gameID: number; team: Team },
  { gameID: number; teamID: number; teamRequest: TeamsRequest }
>('games/updateTeam', async ({ gameID, teamID, teamRequest }) => {
  const response = await teamsApi.updateTeam(gameID, teamID, teamRequest);
  return { gameID, team: response.data.team };
});

export const deleteTeamAction = createAsyncThunk<
  { gameID: number; teamID: number },
  { gameID: number; teamID: number }
>('games/deleteTeam', async ({ gameID, teamID }) => {
  await teamsApi.deleteTeam(gameID, teamID);
  return { gameID, teamID };
});

export const updatePlayerAction = createAsyncThunk<
  { gameID: number; teamID: number; player: Player },
  {
    gameID: number;
    teamID: number;
    playerID: number;
    playerRequest: { name: string };
  }
>('games/updatePlayer', async ({ gameID, teamID, playerID, playerRequest }) => {
  const response = await playersApi.updatePlayer(
    gameID,
    teamID,
    playerID,
    playerRequest,
  );
  return { gameID, teamID, player: response.data.player };
});

export const deletePlayerAction = createAsyncThunk<
  { gameID: number; teamID: number; playerID: number },
  { gameID: number; teamID: number; playerID: number }
>('games/deletePlayer', async ({ gameID, teamID, playerID }) => {
  await playersApi.deletePlayer(gameID, teamID, playerID);
  return { gameID, teamID, playerID };
});

export const fetchTablesForRound = createAsyncThunk<
  { gameID: number; roundNumber: number; tables: Table[] },
  { gameID: number; roundNumber: number }
>('games/fetchTablesForRound', async ({ gameID, roundNumber }) => {
  const response = await tablesApi.getTables(gameID, roundNumber);
  return { gameID, roundNumber, tables: response.data.tables };
});

export const fetchAllTablesForGame = createAsyncThunk<
  { gameID: number; rounds: { roundNumber: number; tables: Table[] }[] },
  { gameID: number; numberOfRounds: number }
>('games/fetchAllTablesForGame', async ({ gameID, numberOfRounds }) => {
  const rounds: { roundNumber: number; tables: Table[] }[] = [];

  for (let roundNum = 1; roundNum <= numberOfRounds; roundNum++) {
    const response = await tablesApi.getTables(gameID, roundNum);
    rounds.push({ roundNumber: roundNum, tables: response.data.tables });
  }

  return { gameID, rounds };
});

export const updateScoresForTable = createAsyncThunk<
  { gameID: number; roundNumber: number; tables: Table[] },
  {
    gameID: number;
    roundNumber: number;
    tableNumber: number;
    scores: { playerID: number; score: number }[];
  }
>(
  'games/updateScores',
  async ({ gameID, roundNumber, tableNumber, scores }) => {
    await scoresApi.updateScores(gameID, roundNumber, tableNumber, { scores });
    const response = await tablesApi.getTables(gameID, roundNumber);
    return { gameID, roundNumber, tables: response.data.tables };
  },
);
