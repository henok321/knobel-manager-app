import { createAsyncThunk } from '@reduxjs/toolkit';

import { scoresApi, tablesApi } from '../../api/apiClient';
import { Table } from '../../generated/models';

export const fetchTablesForRound = createAsyncThunk<
  Table[],
  { gameId: number; roundNumber: number }
>('tables/fetchForRound', async ({ gameId, roundNumber }) => {
  const response = await tablesApi.getTables(gameId, roundNumber);
  return response.data as Table[];
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
    await scoresApi.updateScores(gameId, roundNumber, tableNumber, { scores });

    // Refetch ALL tables for the round to get updated data
    // This is more efficient than individual fetches and ensures consistency
    const response = await tablesApi.getTables(gameId, roundNumber);
    return response.data as Table[];
  },
);
