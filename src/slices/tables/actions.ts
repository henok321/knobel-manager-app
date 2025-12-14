import { createAsyncThunk } from '@reduxjs/toolkit';

import { client } from '../../api/apiClient';
import { getTables, updateScores } from '../../generated';
import type { Table } from '../types';

export const fetchTablesForRound = createAsyncThunk<
  Table[],
  { gameId: number; roundNumber: number }
>('tables/fetchForRound', async ({ gameId, roundNumber }) => {
  const response = await getTables({
    path: { gameID: gameId, roundNumber },
    client,
  });
  if (!response.data) {
    throw new Error('API returned empty response data');
  }
  return response.data.tables.map((table) => ({
    ...table,
    roundNumber,
  }));
});

export const fetchAllTablesForGame = createAsyncThunk<
  Table[],
  { gameId: number; numberOfRounds: number }
>('tables/fetchAllForGame', async ({ gameId, numberOfRounds }) => {
  const allTables: Table[] = [];

  for (let roundNum = 1; roundNum <= numberOfRounds; roundNum++) {
    const response = await getTables({
      path: { gameID: gameId, roundNumber: roundNum },
      client,
    });
    if (!response.data) {
      throw new Error('API returned empty response data');
    }
    const tablesWithRoundNumber = response.data.tables.map((table) => ({
      ...table,
      roundNumber: roundNum,
    }));
    allTables.push(...tablesWithRoundNumber);
  }

  return allTables;
});

export const updateScoresForTable = createAsyncThunk<
  Table[],
  {
    gameId: number;
    roundNumber: number;
    tableNumber: number;
    scores: { playerID: number; score: number }[];
  }
>(
  'tables/updateScores',
  async ({ gameId, roundNumber, tableNumber, scores }) => {
    await updateScores({
      path: { gameID: gameId, roundNumber, tableNumber },
      body: { scores },
      client,
    });

    const response = await getTables({
      path: { gameID: gameId, roundNumber },
      client,
    });
    if (!response.data) {
      throw new Error('API returned empty response data');
    }
    return response.data.tables.map((table) => ({
      ...table,
      roundNumber,
    }));
  },
);
