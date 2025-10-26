import { createAsyncThunk } from '@reduxjs/toolkit';

import { scoresApi, tablesApi } from '../../api/apiClient';
import { Table } from '../../generated';

export const fetchTablesForRound = createAsyncThunk<
  (Table & { roundNumber: number })[],
  { gameId: number; roundNumber: number }
>('tables/fetchForRound', async ({ gameId, roundNumber }) => {
  const response = await tablesApi.getTables(gameId, roundNumber);
  return response.data.tables.map((table) => ({
    ...table,
    roundNumber,
  }));
});

export const fetchAllTablesForGame = createAsyncThunk<
  (Table & { roundNumber: number })[],
  { gameId: number; numberOfRounds: number }
>('tables/fetchAllForGame', async ({ gameId, numberOfRounds }) => {
  const allTables: (Table & { roundNumber: number })[] = [];

  for (let roundNum = 1; roundNum <= numberOfRounds; roundNum++) {
    const response = await tablesApi.getTables(gameId, roundNum);
    const tablesWithRoundNumber = response.data.tables.map((table) => ({
      ...table,
      roundNumber: roundNum,
    }));
    allTables.push(...tablesWithRoundNumber);
  }

  return allTables;
});

export const updateScoresForTable = createAsyncThunk<
  (Table & { roundNumber: number })[],
  {
    gameId: number;
    roundNumber: number;
    tableNumber: number;
    scores: { playerID: number; score: number }[];
  }
>(
  'tables/updateScores',
  async ({ gameId, roundNumber, tableNumber, scores }) => {
    await scoresApi.updateScores(gameId, roundNumber, tableNumber, { scores });

    const response = await tablesApi.getTables(gameId, roundNumber);
    return response.data.tables.map((table) => ({
      ...table,
      roundNumber,
    }));
  },
);
