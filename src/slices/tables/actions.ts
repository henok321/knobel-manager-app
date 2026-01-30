import { createAsyncThunk } from '@reduxjs/toolkit';

import { client } from '../../api/apiClient';
import { getTables, updateScores } from '../../generated';
import type { Table } from '../types';

export const fetchTablesForRound = createAsyncThunk<
  Table[],
  { gameID: number; roundNumber: number }
>('tables/fetchForRound', async ({ gameID, roundNumber }) => {
  const response = await getTables({
    path: { gameID: gameID, roundNumber },
    client,
  });
  if (!response.data) {
    throw new Error('API returned empty response data');
  }
  return response.data.tables.map((table) => ({
    ...table,
    roundNumber,
    gameID: gameID,
  }));
});

export const fetchAllTablesForGame = createAsyncThunk<
  Table[],
  { gameID: number; numberOfRounds: number }
>('tables/fetchAllForGame', async ({ gameID, numberOfRounds }) => {
  const allTables: Table[] = [];

  for (let roundNum = 1; roundNum <= numberOfRounds; roundNum++) {
    const response = await getTables({
      path: { gameID: gameID, roundNumber: roundNum },
      client,
    });
    if (!response.data) {
      throw new Error('API returned empty response data');
    }
    const tablesWithRoundNumber = response.data.tables.map((table) => ({
      ...table,
      roundNumber: roundNum,
      gameID: gameID,
    }));
    allTables.push(...tablesWithRoundNumber);
  }

  return allTables;
});

export const updateScoresForTable = createAsyncThunk<
  Table[],
  {
    gameID: number;
    roundNumber: number;
    tableNumber: number;
    scores: { playerID: number; score: number }[];
  }
>(
  'tables/updateScores',
  async ({ gameID, roundNumber, tableNumber, scores }) => {
    await updateScores({
      path: { gameID: gameID, roundNumber, tableNumber },
      body: { scores },
      client,
    });

    const response = await getTables({
      path: { gameID: gameID, roundNumber },
      client,
    });
    if (!response.data) {
      throw new Error('API returned empty response data');
    }
    return response.data.tables.map((table) => ({
      ...table,
      roundNumber,
      gameID: gameID,
    }));
  },
);
